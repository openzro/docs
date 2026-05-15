# Device Admission

Source: https://docs.netbird.io/manage/access-control/posture-checks/device-admission

---

# Device Admission

The standard posture-check pipeline (Country, OS Version, Process,
openZro Version, Network Range, Endpoint Security) filters peers
out of policy source groups. A peer that fails a check loses
visibility into the peers it was supposed to talk to, but it stays
connected to the management plane and keeps its IP. Useful for
fine-grained ACLs; not enough for regulated environments that need
to **refuse non-compliant devices outright** and produce an audit
trail to prove it.

**Device Admission** closes that gap. It is an account-wide gate
evaluated at every Login, AddPeer, and Sync gRPC call. A peer that
fails the listed posture checks is rejected with
`PermissionDenied` at the control plane — it never enters the mesh
on a fresh connect, and an existing session is closed within
~6 minutes when the operator's MDM/EDR vendor reports a
compliance flip.

> **Note:** Device Admission is required for tenants subject to Bacen
  Resolução 4.893 / Circular 3.909 (Brazilian fintechs and banks),
  DORA, NYDFS Part 500, and PCI-DSS v4.0 §8 — controls that
  mandate provable refusal of non-compliant endpoints with an
  auditable record. See the
  [Bacen → openZro mapping](/compliance/bacen-4893) for the
  per-control crosswalk.

## How it works

Three phases run together; all are enabled by a single account
toggle.

**Phase 1 — control-plane refusal.** Every Login, AddPeer, and
Sync evaluates the configured posture checks against the peer's
freshly-reported metadata. The first failing check produces a
structured denial that names the check, the type, and the reason.
The gRPC handler returns `PermissionDenied` with a message like
`device admission denied: EndpointSecurityCheck: device not
compliant per Microsoft Intune`. The peer never enters the mesh.

**Phase 2 — active revalidation.** A goroutine on every management
instance iterates locally connected peers every 60 seconds (tunable
via `OPENZRO_ADMISSION_REVALIDATE_INTERVAL_SECONDS`) and re-runs
the same checks. On denial, the peer's update channel is closed,
which terminates its open Sync stream cleanly. The client backs
off and retries Login, where Phase 1 refuses re-entry. End-to-end
revocation latency is bounded by the worker interval plus the MDM
cache TTL plus client backoff — typically ~6 minutes worst case.

**Phase 3 — audit trail.** Every refusal emits a
`peer.admission.deny` event into the Activity log with the failing
check ID, the check type, the reason verbatim from the vendor, and
the peer hostname. Toggle flips and admission-list edits emit
their own events
(`account.setting.admission.enforcement.{enable,disable}`,
`account.setting.admission.checks.update`) so changes to the
policy itself leave a paper trail.

## Configuring Device Admission

Prerequisites: at least one configured posture check. For the
common case (block non-compliant devices reported by an MDM/EDR),
configure the
[MDM/EDR provider](/manage/integrations/mdm-deployment/intune-openzro-integration)
first, then build a Posture Check of type **Endpoint Security
(MDM/EDR)** pointing at it.

### Step 1 — Add the posture check to the admission list (no enforce yet)

Open `Settings` → `Device Admission`. The page exposes three
controls:

1. **Enforce admission on Login & Sync** — the global toggle.
2. **Posture checks that gate admission** — the multi-select.
3. **Audit CSV** — quarterly evidence export button.

Tick the posture checks you want to gate admission on, but **leave
the toggle off**. Save. The list is recorded; nothing is enforced
yet.

### Step 2 — Observe what would fail (soft rollout)

There is no built-in dry-run mode by design — keeping the auth
trail simple. The recommended path:

1. Attach the same posture check to a single test policy (Source
   Posture Checks). Anything that disappears from that policy's
   source group would have been refused by the admission gate.
2. Wait one Sync window. Confirm the failure set matches the
   "known-bad" devices you expect to block.
3. Flip the toggle once the disappearing set is empty (or matches
   your target list).

### Step 3 — Enforce

Settings → Device Admission → toggle **Enforce admission on Login
& Sync** → Save.

Within ~6 minutes:

- Every connected peer that fails admission has its session
  closed.
- New connection attempts are refused at the Login gRPC.
- The Activity log carries one `peer.admission.deny` row per
  refusal, with structured `meta`:

```json
{
  "posture_check_id":   "abc-123",
  "posture_check_name": "intune-compliant",
  "check_type":         "EndpointSecurityCheck",
  "reason":             "device not compliant per Microsoft Intune",
  "peer_hostname":      "alice-laptop"
}
```

### Step 4 — Audit CSV for the auditor

`Settings` → `Device Admission` → **Audit CSV** downloads the
admission slice of the activity log with stable columns:

```
timestamp, activity_code, activity, initiator_id, initiator_name,
initiator_email, target_id, posture_check_id, posture_check_name,
check_type, reason, peer_hostname
```

For a time-bounded export (quarterly review):

```
GET /api/events/admission.csv?from=2026-01-01T00:00:00Z&to=2026-04-01T00:00:00Z
```

with the user's bearer token.

## Tuning

### Revocation latency vs vendor API load

Default cadence is 60s revalidate interval + 5min MDM cache TTL.
Tunable via:

```bash
# 1 = pure Phase 1 (gate only at fresh Sync); no active revocation
# 0 = same as 1, except the worker is fully off
# >=10 = revalidator runs every N seconds. 60 is the default.
```

The 10-second floor protects vendor APIs from stampede. Most
deployments stay at the default; tighten only if your compliance
window is narrower than 5 minutes.

### Fail-open semantics

Set per posture check, not globally. Default is **fail-closed**:
vendor lookup failure (timeout, vendor outage, device not found) is
treated as non-compliant. The Endpoint Security check exposes a
`Fail open on lookup error` toggle that flips the behavior to
fail-open if the operator cares more about availability than
strict posture.

| Profile | Recommended setting |
|---|---|
| Bacen-regulated | Fail-closed (the auditor will ask why a vendor outage let non-compliant devices through) |
| Enterprise IT | Fail-open is usually reasonable |
| Critical infra | Fail-closed + a manually-revoked break-glass auth path |

## Bringing up routing / gateway peers (no MDM)

Server-side peers (cloud VMs, Kubernetes pods, on-prem gateways
running the openZro client as a daemon) are not enrolled in
MDM/EDR — their host has no Intune / SentinelOne / Huntress
agent to report from. With the gate on, the posture check would
always fail and the operator could not bring up their own
infrastructure.

Use **exempt groups** for this. Workflow:

1. Create a group `infrastructure-peers` under `Team → Groups`.
2. Issue or edit setup keys with
   `AutoGroups: ["infrastructure-peers"]` for every gateway peer.
3. On `Settings → Device Admission`, tick `infrastructure-peers`
   under **Exempt groups**. Save.

New gateway peers join the mesh transparently. The change emits
`account.setting.admission.exempt_groups.update` so the auditor
sees who set the exemption.

## Common scenarios

### "I need to let one user laptop in temporarily (break-glass)"

The bypass path. CEO laptop failed Intune, has a meeting in 10
minutes, the device is in remediation. Grant a per-peer bypass
with a mandatory reason and time-bounded expiry:

```bash
curl -fsS -X POST \
  -H "Authorization: Bearer <PAT>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Intune re-enrol pending — board meeting","expires_in_seconds":86400}' \
  https://your-management.example.com/api/peers/<peer-id>/admission-bypass
```

The grant emits `peer.admission.bypass.granted` with the
initiator (your user ID), the reason, and the expiry. When the
bypass expires (or the operator revokes it via DELETE on the
same URL), the worker emits
`peer.admission.bypass.{expired,revoked}` so the auditor sees
the full lifecycle.

Validation the API enforces: `reason` required,
`expires_in_seconds` or `expires_at` required (no-expiry refused),
maximum 30 days (longer windows must be re-granted).

The bypass applies only to the admission gate. Per-policy posture
checks still run.

### "I need to let a routing peer / gateway in"

Use exempt groups instead of bypass — see the section above.
Bypass is per-peer + time-bounded, designed for break-glass on
user endpoints. Exempt groups are per-class + permanent, designed
for infrastructure.

### "Permanent fix instead of bypass"

Either fix the device at the vendor (MDM/EDR) so it reports
compliant, or remove the relevant check from the admission list.
Vendor-side fix is the fastest path; the revalidator picks up
the new state within ~6 minutes.

### "Vendor went down, everyone's locked out"

Two options, in order of preference:

1. Pre-emptive: enable Fail-Open on the EndpointSecurityCheck.
   Vendor outages no longer lock anyone out. The auditor will
   want to know this is on.
2. Quick remediation: flip the Enforce toggle off. Audit event
   records the change with operator identity. Re-enable when the
   vendor recovers.

### "Compromised device: how fast does access stop?"

Worst case ≈ 6 min:

```
revalidate_interval (60s) + mdm_cache_ttl (5min) + client_backoff (~30s)
```

To compress further, the cache TTL can be reduced in the source
(currently a 5-minute hard-coded constant) but be aware of the
vendor rate-limit cost.
# Bacen Resolução 4.893 → openZro

Source: https://docs.netbird.io/compliance/bacen-4893

---

# Bacen Resolução 4.893 → openZro

This page maps the cybersecurity controls Bacen requires of
Brazilian fintechs and Bacen-supervised banks to the openZro
features that implement them. Goal: a security team can speak to
the Bacen auditor in concrete openZro terms — *"event Y in our
Activity log proves control X"*.

The mapping covers:

- **Resolução BCB nº 4.893** of 2021-02-26 (cybersecurity policy
  and outsourced data processing for Brazilian Central Bank-
  supervised institutions).
- **Circular nº 3.909** of 2018-08-16 (the operational
  requirements that pre-dated 4.893 and remain in force where
  4.893 does not override them).

Article numbers below reference 4.893 unless flagged otherwise.

> **Note:** This is an engineering correspondence document, not legal
  advice. openZro is a self-host BSD-3 fork; the project does not
  hold a Bacen registration nor make legal guarantees on behalf of
  operators. Use this as a starting point for an internal
  compliance review.

## At a glance

| Bacen control area | openZro feature(s) | Audit artefact |
|---|---|---|
| Endpoint identity & admission | [Device Admission](/manage/access-control/posture-checks/device-admission) + Posture Checks + MDM/EDR integration | `peer.admission.deny` events; `/events/admission.csv` |
| Authentication of users | OIDC (8 IdP providers) + JWT validation; SCIM 2.0 for IdP-side lifecycle | `user.join`, `user.role.update`, IdP-side audit |
| Authorization / segmentation | Policies + Groups + Posture Checks per policy | `policy.add/update/delete` events |
| Logging & retention | Activity log + [Activity Streamer](/manage/activity/event-streaming) (HTTP / Datadog / Elastic / templates) | The same activity events fanned out to the operator's SIEM |
| Incident detection | [Flow Events](/manage/activity/traffic-events-logging) (real-time + cold archive to S3 / GCS) | Flow Events table + cold archive |
| Incident response (revocation) | Device Admission worker — closes the session on compliance flip | `peer.admission.deny` paired with the prior login event |
| Data-at-rest protection | Credentials encrypted via DataStoreEncryptionKey | n/a — verified by inspecting DB columns |
| Periodic review | Auditor CSV export | `/api/events/admission.csv?from=…&to=…` |

## Detailed mapping

### Art. 3º, §1º, II — pre-access identity verification

The article requires verifying the identity of every endpoint
that connects to systems handling client data **before** access.
openZro provides two layers:

- **User identity** via OIDC. Every dashboard login and every
  interactive client login is a federated SSO flow against the
  operator's IdP (Okta, Microsoft Entra, Auth0, Zitadel,
  Keycloak, Authentik, JumpCloud, Google Workspace). JWT
  validation enforces issuer, audience, signature, and rejects
  tokens with `iat` in the future.

- **Device identity** via WireGuard public key plus the
  Endpoint Security posture check. The peer's WireGuard public
  key is the immutable device identifier; admission attaches a
  compliance check (Intune / SentinelOne / Huntress) so a key
  whose device flunks compliance does not reach the mesh.

**Audit artefact:** every refused login produces a
`peer.admission.deny` event. The CSV export delivers a portable
artefact with columns the auditor recognises.

### Art. 3º, §1º, III — segregation of duties

Implemented by the Permissions / Roles surface plus per-account
scoping on every API endpoint. The
[SCIM 2.0 endpoint](/manage/team/idp-sync) lets the operator's
IdP push role/group assignments — segregation maintained from
the IdM source of truth without manual sync. Activity events:
`user.role.update`, `user.group.add/delete`, `service.user.create`.

### Art. 3º, §1º, IV — event recording and monitoring

The Activity log captures every administrative action and every
Device Admission decision. Events live in the management's
primary database, durably; the
[Activity Streamer](/manage/activity/event-streaming) fans them
out to the operator's SIEM in real time. Two layers:

- **Process-wide env-var baseline** — `OPENZRO_ACTIVITY_EXPORT_*`
  configures HTTP webhook / Datadog / Elastic for the whole
  instance. Used by self-host operators with a single tenant.
- **Per-account DB-backed config** — managed via
  `Settings → Integrations → Activity Streamer`. Each tenant
  streams into their own SIEM. Credentials encrypted at rest.

Both layers support custom Go-template payloads so events can be
reshaped to match the SIEM's schema without standing up Vector
or Fluent Bit in between.

### Art. 3º, §1º, V — encryption in transit and at rest

- **In-transit:** Every link is WireGuard (mesh data plane),
  gRPC over TLS (control plane), HTTPS (dashboard + API).
- **At rest:** Credentials for outbound integrations (MDM/EDR,
  SIEM endpoints, S3 / GCS archives) are stored as AES-256-GCM
  ciphertext under the management's `DataStoreEncryptionKey`.

### Art. 3º, §1º, VI — incident recording and handling

Two evidence streams feed incident response:

- **Activity log** — *who did what, when*: admin actions,
  posture-check changes, admission denials, settings flips.
- **Flow Events** — *what traffic went where*: per-connection
  records (src/dst IP, port, protocol, bytes, drops, rule ID).
  Stored in the hot tier (queryable via the
  [Network Traffic dashboard](/manage/activity/traffic-events-logging))
  and archived to S3 / GCS / R2 / B2 / MinIO via the
  [Flow Exports](/manage/activity/event-streaming) flow.

### Art. 3º, §1º, VII — vulnerability detection routines

openZro ships `make` targets that run linters, `govulncheck`, and
`npm audit`. Open advisories are tracked in the project's
`docs/security/advisories.md` — every CVE that touches the
dependency tree is triaged and assigned a status: Fixed (with
commit reference), Not applicable (with reasoning), or Open
(with tracking note).

### Art. 14 — minimum 5-year retention

The Activity log's primary store is whichever DB the management
is configured against. The operator owns backup retention. The
recommended posture for Bacen tenants:

1. Stream Activity events to a long-term SIEM via the Activity
   Streamer (Datadog Logs with retention plan, Elastic with ILM
   policy, or HTTP webhook into a custom archiver).
2. Use the CSV export quarterly as a portable artefact.
3. For Flow Events, configure both the hot tier (for
   investigation) and an S3-compatible cold archive
   (NDJSON+gzip) for the 5-year retention.

### Circular 3.909, Art. 6º — remote access controls

Specific controls and how openZro covers them:

- **Multi-factor authentication** — delegated to the IdP via
  OIDC. Every IdP we integrate supports MFA enforcement.
- **Device verification** — Device Admission with MDM/EDR
  posture checks. The device must be in good standing per the
  corporate MDM **and** registered in the IdP.
- **Least-privilege access** — Policies + Groups + per-policy
  posture checks compose to per-application network
  segmentation.
- **Session monitoring** — Flow Events provides per-connection
  monitoring; the Activity log provides per-admin-action
  monitoring.
- **Anomaly detection** — out of openZro's scope; the operator
  runs this in their SIEM with the streams above as inputs.

## Auditor walkthrough

Two scripts the security team runs in front of the auditor.

### "Show me how non-compliant devices are blocked"

1. Settings → Device Admission. Show the **Enforce admission**
   toggle is on and the posture-check list is populated.
2. Settings → Posture Checks. Click into the Endpoint Security
   check pointed at the corporate MDM. Show the provider in
   Settings → Integrations → MDM/EDR.
3. Activity. Filter by `peer.admission.deny`. Walk through a
   recent denial — the row carries the peer hostname, the
   failing check, the reason verbatim from the vendor.
4. Settings → Device Admission → **Audit CSV**. The downloaded
   file is the artefact the auditor takes home.

### "Show me how a compromised endpoint loses access"

1. Walk through the revalidator's interval (default 60s) and the
   MDM cache TTL (5 min) — the total revocation budget is
   ~6 minutes worst case.
2. Show a `peer.admission.deny` event paired with the close
   timestamp on the prior session in the Activity log.
3. Show that the peer keeps showing in `peer.admission.deny` on
   each subsequent retry until the device is fixed at the vendor.
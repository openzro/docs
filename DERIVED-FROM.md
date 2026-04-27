# Derivation notice

This repository is **derived from** the upstream BSD-3-Clause-licensed
documentation site at:

- Source: <https://github.com/netbirdio/docs>
- Base commit: `122c58b6e180890aaee60683949bc17827cfb341`
- Cloned on: 2026-04-26

The derivation is permitted under the BSD-3-Clause license that ships
with both the upstream and this fork. We retain the upstream
`LICENSE` verbatim, preserve the upstream `AUTHORS` file, and document
the fork-point above so the chain of provenance is auditable.

## What we modify

The fork is *not* a passthrough. We:

1. Rebrand to openZro (capital `Z` always — see [`CLAUDE.md`](CLAUDE.md)
   in the openZro repo).
2. Drop pages that describe the upstream's Cloud / managed-tier
   features, since openZro is a self-host BSD-3 fork without a
   cloud product.
3. Add pages for openZro-only features: Device Admission gate,
   Bacen 4.893 compliance mapping, MDM/EDR vendor integrations,
   Activity Streamer + payload templates, Datadog / GCS native flow
   sinks, and the ADR set under `docs/adr/` of the core repo.
4. Update screenshots and live URLs to openZro deployments where
   they differ.

## What we do NOT do

Per BSD-3-Clause clause 3, we do **not** use the names *NetBird* or
*Wiretrustee* to endorse or promote products derived from this
software without prior written permission. References to NetBird in
the openZro docs appear only as historical context (fork rationale,
acknowledgements) and never as a recommendation or association.

## Re-syncing with upstream

When upstream releases new pages worth porting, we cherry-pick the
files individually rather than running a wholesale merge — the prose
in the rebranded fork has diverged enough that a merge would be
mostly conflicts. The `git log --grep="Cherry-picked from netbirdio/docs"`
trail records every targeted port.

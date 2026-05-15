# Flow Archive — Google Cloud Storage (native)

Source: https://docs.netbird.io/selfhosted/flow-archive-gcs

---

# Flow Archive — Google Cloud Storage (native)

The S3-style flow archive sink already covers GCS via its
[Interoperability mode](https://cloud.google.com/storage/docs/interoperability)
— you mint an HMAC key in the GCP Console, point the S3 endpoint
at `https://storage.googleapis.com`, and it works. This page is
about the **native** GCS sink: the one that uses Google's own
SDK and authenticates the way GCP itself recommends.

## When to pick native over S3-Interop

| Concern | S3 Interop | GCS Native |
|---|---|---|
| Auth mechanisms | HMAC keys only | Service Account JSON, Workload Identity, ADC |
| Workload Identity (GKE) | not supported | yes — IAM bound to the workload, no creds in the pod |
| Customer-Managed Encryption Keys | no (header path the S3 SDK doesn't pass) | yes |
| Resumable uploads with lifecycle | partial | full |
| Cost / latency | identical | identical (same backend) |

Self-host *outside* GCP usually wants S3 Interop — it's one HMAC
key to provision. Self-host *inside* GCP (on GKE, GCE, Cloud Run)
should always pick native: drop the credential file from the
pod, bind IAM to the workload identity, and let ADC do the rest.

## Configuration

### Via the dashboard

`Settings` → `Integrations` → `Flow Exports` → **Add destination**
→ type **Google Cloud Storage native (cold archive)**.

| Field | Notes |
|---|---|
| Bucket | Required. The destination bucket name (no `gs://` prefix). |
| Prefix | Optional. Prepended to every object key. |
| Project ID | Optional. Informational; the bucket pins the project on Google's side. |
| Authentication | One of: ADC (default), Service Account JSON file, inline JSON |

For GKE / GCE / Cloud Run, leave the auth mode at **Application
Default Credentials** and ensure the workload's service account
has `roles/storage.objectCreator` on the bucket. Outside GCP,
mount a Service Account JSON and pick **file path** or paste the
JSON inline.

### Via env vars (boot-time baseline)

For self-host operators who manage configuration in env files:

```bash

# pick ONE of these:
# (a) ADC — recommended on GKE / GCE / Cloud Run
#     no env var needed, the SDK reads the runtime credentials.

# (b) Service account JSON file

# (c) Service account JSON inline (constrained runners)

# optional knobs
```

The management server logs

```
flow archive enabled: GCS bucket "openzro-flow-archive" (auth=adc)
```

at boot when configured.

## Object layout

Identical to the S3 sink — that's deliberate. An operator can
move between the two (or run both side-by-side) without changing
downstream tooling.

```
<prefix>/year=2026/month=04/day=26/account=<id>/<unix-nano>-<rand>.ndjson.gz
```

Each object is gzipped NDJSON: one JSON event per line, `gzip`-
compressed. BigQuery, DuckDB, ClickHouse, and Athena all read
this format natively. For BigQuery specifically:

```sql
-- External table over the archive (run once)
CREATE EXTERNAL TABLE openzro_flow.archive
WITH PARTITION COLUMNS (year INT64, month INT64, day INT64, account STRING)
OPTIONS (
  format = 'JSON',
  uris = ['gs://openzro-flow-archive/prod/year=*/month=*/day=*/account=*/*.ndjson.gz'],
  hive_partition_uri_prefix = 'gs://openzro-flow-archive/prod/'
);

-- Sample query
SELECT count(*)
FROM openzro_flow.archive
WHERE year = 2026 AND month = 4 AND account = 'acct-1' AND type = 'drop';
```

## IAM minimum viable role

For the workload identity (GKE) or service account (file/JSON):

```yaml
# Bucket-level binding, not project-level. The sink only writes;
# never reads or deletes.
roles:
  - roles/storage.objectCreator
```

Do not grant `roles/storage.admin` — the sink does not need it
and the principle of least privilege says no.

## Verifying the archive

```bash
# List the most recent objects (replace placeholders).
gcloud storage ls --recursive \
  --limit 10 \
  --project=$PROJECT_ID \
  gs://openzro-flow-archive/prod/

# Download one and inspect.
gcloud storage cp \
  gs://openzro-flow-archive/prod/year=2026/month=04/day=26/account=acct-1/<id>.ndjson.gz \
  /tmp/sample.ndjson.gz
zcat /tmp/sample.ndjson.gz | head -3 | jq
```

If the bucket stays empty for more than `FLUSH_INTERVAL`
(default 15 min), check the management log for
`flow sink GCS:` errors — typically wrong IAM binding or wrong
bucket name.

## Trade-offs

- **Best-effort.** A failed flush logs loud and drops the batch.
  Pair the cold archive with a streaming destination
  (Datadog, Elastic) when durability of every record matters.
- **No CMEK by default.** GCS Native supports it; the openZro
  config does not yet expose the key name. Open an issue if you
  need it — it is a one-line config addition.
- **No retention lifecycle managed by openZro.** Configure
  bucket-level lifecycle policies (Coldline / Archive
  transitions, age-based delete) directly in GCS.
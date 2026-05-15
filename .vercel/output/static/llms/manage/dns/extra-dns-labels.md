# Extra DNS Labels

Source: https://docs.netbird.io/manage/dns/extra-dns-labels

---

# Extra DNS Labels

Extra DNS labels let you assign additional DNS names to peers beyond their default hostname. Other peers in your openZro network can then reach the labeled peer using these names. When multiple peers share the same label, queries are resolved in round-robin order, providing basic DNS-based load balancing.

## Prerequisites

Extra DNS labels require a [setup key](/manage/peers/register-machines-using-setup-keys) with the **Allow Extra DNS Labels** option enabled. Without this, the management server rejects the labels during registration.

## Assigning Labels

Pass labels as a comma-separated list with the `--extra-dns-labels` flag:

```shell
openzro up --setup-key AAAA-BBB-CCC-DDDDDD --extra-dns-labels vpc1,api
```

You can also use the `NB_EXTRA_DNS_LABELS` environment variable, which is useful for containerized deployments:

```yaml {{ title: 'Container environment' }}
environment:
  - NB_SETUP_KEY=AAAA-BBB-CCC-DDDDDD
  - NB_EXTRA_DNS_LABELS=vpc1,api
```

This creates DNS records `vpc1.openzro.cloud` and `api.openzro.cloud` (or your custom peer DNS domain) pointing to the peer's openZro IP. All other peers in the account can resolve these names.

To clear previously set labels, pass an empty string:

```shell
openzro up --extra-dns-labels ""
```

> **Note:** Labels must be valid DNS names: ASCII alphanumeric characters, hyphens, and underscores. Unicode domain names are not auto-converted to punycode. Maximum 32 labels per peer.

## Wildcard Labels

You can use a wildcard prefix to match any single subdomain level:

```shell
openzro up --setup-key AAAA-BBB-CCC-DDDDDD --extra-dns-labels "*.myserver"
```

This creates a wildcard DNS record `*.myserver.openzro.cloud`. Any single-level subdomain query resolves to the peer's IP:

- `app1.myserver.openzro.cloud` - resolves
- `app2.myserver.openzro.cloud` - resolves
- `anything.myserver.openzro.cloud` - resolves

> **Note:** Wildcard matching follows standard DNS rules ([RFC 4592](https://www.rfc-editor.org/rfc/rfc4592)): only a single subdomain level is matched. `deep.sub.myserver.openzro.cloud` would **not** match `*.myserver.openzro.cloud`.

Wildcard labels are useful when running a reverse proxy on a peer that serves multiple applications on different subdomains. You don't need to add a new label each time you add an application.

## Round-Robin Load Balancing

When multiple peers share the same label, DNS queries for that label rotate through all matching peers' IPs. For example, if three peers all register with the label `api`:

```shell
# On peer-1, peer-2, and peer-3:
openzro up --setup-key AAAA-BBB-CCC-DDDDDD --extra-dns-labels api
```

Queries for `api.openzro.cloud` from any other peer cycle through the three IPs, distributing connections across them.

> **Note:** This is DNS-level round-robin only. There is no health checking. If a peer goes offline, its IP may still be returned until the peer is removed from the network.

## Related

- [Setup Keys](/manage/peers/register-machines-using-setup-keys) - Create keys with the **Allow Extra DNS Labels** option
- [CLI Reference](/get-started/cli) - `--extra-dns-labels` flag documentation
- [Custom Zones](/manage/dns/custom-zones) - Manage DNS records distributed to peers
# DNS in openZro

Source: https://docs.netbird.io/manage/dns

---

# DNS in openZro

openZro provides centralized DNS management to help your peers resolve domain names within your private network and control how they access external domains.

## Key Concepts

- **Nameserver**: A DNS server that openZro distributes to peers. You configure these in the dashboard under **DNS → Nameservers**.
- **Match Domains**: Specific domains that should be resolved by a particular nameserver (e.g., `company.internal`). Adding a domain automatically matches all its subdomains.
- **Primary Nameserver**: The default nameserver that handles all domains not matched by specific rules. Configured by leaving match domains empty.
- **Search Domains**: Domain suffixes automatically appended to short hostnames. If you configure `company.internal` as a search domain, typing `server1` will try `server1.company.internal`. Available in v0.24.0+.
- **DNS Resolver**: openZro runs a local DNS resolver on each peer that routes queries based on your nameserver configuration.

### Automatic Peer Domain Names

Starting with [v0.11.0](https://github.com/openzro/openzro/releases), openZro automatically assigns a domain name to each peer in a private `openzro.cloud` space. You can access machines using names like `my-server.openzro.cloud` instead of IP addresses.

> **Note:** Available on both openZro Cloud and self-hosted versions running v0.11.0 or later.

## How openZro Handles DNS

openZro gives you centralized control over DNS resolution for all peers in your network, solving common challenges with split-horizon DNS, private networks, and secure name resolution.

### Architecture Overview

#### openZro's DHCP Role

The openZro management service acts as a DHCP server **only for the openZro network**, not your LAN:

- **openZro IPs**: Management assigns each peer a unique IP from one of 64 possible /16 blocks within the `100.64.0.0/10` CGNAT range (e.g., `100.64.0.0/16` through `100.127.0.0/16`). The block is randomly selected per account and can be customized.
- **LAN IPs remain unchanged**: Your local network DHCP continues to work normally
- **Two networks, two IPs**: Each peer has both a LAN IP (e.g., `192.168.1.100`) and a openZro IP (e.g., `100.121.5.10`)

openZro creates a **parallel overlay network** on top of your existing network infrastructure.

### Query Routing

When an application makes a DNS query, openZro's local resolver:

1. **Checks match domains**: Does this query match a specific nameserver?
   - If yes → Forward to that nameserver
   - If no → Forward to primary nameserver
2. **Performs the query**: Sends the request to the appropriate upstream nameserver
3. **Returns the result**: Sends the IP address back to the application

**Example** with a primary nameserver (Cloudflare 1.1.1.1) and a match domain nameserver (`company.internal` → Internal DNS 10.0.0.1):

```
Query: "google.com"
→ No match → Primary (1.1.1.1) → Returns public IP

Query: "web.company.internal"
→ Matches company.internal → Internal DNS (10.0.0.1) → Returns private IP

Query: "server" (with search domain "company.internal")
→ Expanded to "server.company.internal"
→ Matches company.internal → Internal DNS → Returns private IP
```

> **Note:** openZro does **not** cache most DNS queries. Caching only occurs for DNS forwarder on routing peers during upstream failures, and for openZro infrastructure addresses (management, relay, STUN).

Each peer can have one primary nameserver and multiple match domain nameservers. If a peer belongs to multiple distribution groups, all nameserver configurations from those groups are merged. When multiple nameservers match a query, the most specific match domain wins.

### Default Behavior (No Nameservers Configured)

If you don't configure any nameservers in openZro, the behavior varies by platform:

**Linux** (always sets up DNS):
- openZro always configures DNS so peer domain names (like `my-server.openzro.cloud`) work
- Your original nameservers are preserved as upstream
- Both openZro peer domains and regular DNS continue to work

**macOS/Windows/Mobile** (only when nameservers configured):
- Without nameservers configured, openZro doesn't modify DNS
- Peer domain names like `my-server.openzro.cloud` won't resolve
- You can still use openZro IPs directly (e.g., `100.121.5.10`)

> **Note:** You don't need to configure custom nameservers to use openZro. On Linux, peer domains work automatically. On other platforms, you can use openZro IPs directly or configure nameservers for domain resolution.

**When you add custom nameservers**:
- The local DNS resolver routes queries based on your match domain rules
- Custom nameservers can handle specific domains (split-horizon DNS)
- Primary nameservers handle all non-matched queries

### DNS Setup Per Platform

openZro configures the operating system to use its DNS resolver:

- **Linux**: Always sets up DNS via `/etc/resolv.conf` or `resolvconf`. Original nameservers preserved as upstream.
- **macOS**: Uses system APIs (does **not** modify `/etc/resolv.conf` directly)
- **Windows**: Sets the network adapter's DNS server to the local openZro resolver
- **Android/iOS**: Uses VPN DNS configuration

> **Note:** **Android**: Custom DNS resolution requires disabling **Private DNS**. Go to **Settings → Network & Internet → Private DNS** and set it to **Off**. When enabled, Android bypasses VPN DNS.

The local resolver runs on `100.x.255.254:53` (in userspace mode), where `x` corresponds to the second octet of your openZro /16 block.

### DNS Forwarder on Routing Peers

When a [Network resource](/manage/networks) uses a domain name, the routing peer runs a DNS forwarder that resolves domains on behalf of clients. The client's local resolver sends queries to this forwarder, which uses the routing peer's local DNS to resolve the domain and return the result.

The DNS forwarder listens on port `22054` (changed from `5353` in v0.59.0 to avoid collisions with mDNS). For backward compatibility, port `5353` is used if any peer in your account runs below v0.59.0.

> **Note:** openZro attempts to automatically open the forwarder port on routing peer firewalls, but this may fail on some systems. If domain resources aren't resolving, verify the port is open: `nslookup -port=22054  `.

### DNS Management Modes

openZro supports two modes per peer group:

- **Managed Mode** (default): openZro fully controls DNS settings. All queries go through openZro's resolver.
- **Unmanaged Mode**: openZro doesn't modify DNS settings. The peer uses its existing DNS configuration.

You can disable DNS management for specific groups in [DNS Settings](/manage/dns/dns-settings).

> **Note:** **Match Domain Platform Support**: Only macOS, Windows 10+, and Linux with `systemd-resolved` support nameservers with match domains. We recommend configuring at least one primary nameserver (without match domains) assigned to all peers.

---

## What's Next?

- **[Internal DNS Servers](/manage/dns/internal-dns-servers)** - Configure nameservers and work with AD, BIND, and other internal DNS
- **[DNS Settings](/manage/dns/dns-settings)** - Control DNS management per group
- **[Custom Zones](/manage/dns/custom-zones)** - Create private DNS records distributed to peers
- **[Extra DNS Labels](/manage/dns/extra-dns-labels)** - Assign additional DNS names to peers for service discovery and load balancing
- **[Troubleshooting](/manage/dns/troubleshooting)** - Diagnose DNS issues
- **[API Reference](/ipa/resources/dns)** - Automate DNS configuration
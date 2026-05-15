# Network Routes Use Cases

Source: https://docs.netbird.io/manage/network-routes/use-cases

---

# Network Routes Use Cases

These guides show how to use [Network Routes](/manage/network-routes) for Site-to-Site and Site-to-VPN connectivity—scenarios where clientless devices need to communicate across networks.

## What Are Site-to-Site and Site-to-VPN?

Network Routes enables two connectivity patterns that go beyond standard VPN-to-Site access:

**Site-to-Site** connects two networks together, with neither end-device running openZro. Each network has a routing peer that handles traffic forwarding.

```
Home NAS ──► Routing Peer ──► openZro Tunnel ──► Routing Peer ──► Office Server
(no openZro)    (peer)                              (peer)         (no openZro)
```

**Site-to-VPN** allows clientless devices to initiate connections to openZro peers—the reverse of VPN-to-Site.

```
Office Server ──────► Routing Peer ──────► openZro Tunnel ──────► Your Laptop
 (no openZro)           (peer)                                      (peer)
```

> **Note:** For VPN-to-Site (openZro peers accessing clientless devices), you can use either [Networks](/manage/networks/use-cases) (recommended for simplicity) or Network Routes.

## Understanding Key Concepts

Network Routes provides several features that differentiate it from Networks and enable more advanced scenarios:

### Masquerade

Masquerade controls whether the routing peer hides the original source IP address when forwarding traffic:

- **Enabled (default)** — The routing peer performs NAT, making traffic appear to originate from its own IP. Simpler setup since remote networks don't need return routes.
- **Disabled** — Original source IPs are preserved, enabling accurate audit trails. Requires manual route configuration on both ends.

Use masquerade when you want simple setup. Disable it when compliance or auditing requires source IP visibility.

### Distribution Groups

Distribution Groups determine which peers receive the network route configuration. When you add peers to a distribution group, they automatically get the route—no manual configuration on each client.

For site-to-site scenarios, each site's routing peer should be in the other site's distribution group to receive routes back.

### ACL Groups

ACL Groups provide route-level access control. When you assign an ACL Group to a Network Route:

1. The route inherits access restrictions from policies targeting that group
2. Only peers with policies granting access to the ACL Group can use the route
3. Without an ACL Group, routes allow unrestricted access

> **Note:** If an ACL Group is assigned but no policies grant access to it, all routed traffic will be dropped.

### High Availability

Deploy multiple routing peers for the same route to provide failover. openZro clients automatically select the best available peer based on:
- Connection type (direct vs relayed)
- Defined metric priority (lower = higher priority)
- Connection quality

## Why Use Network Routes?

Network Routes is required when you need:
- **Site-to-Site connectivity** — Connect two networks together
- **Site-to-VPN connectivity** — Clientless devices initiating connections
- **Masquerade control** — Preserve source IPs for auditing
- **ACL Groups** — Route-level access control

## Configuration Pattern

All Site-to-Site and Site-to-VPN scenarios follow this pattern:

1. **Deploy routing peers** at each site
2. **Create network routes** for each site's subnet
3. **Create access policies** allowing routing peers to communicate
4. **Configure clientless devices** to route traffic through the local routing peer

For step-by-step instructions, choose your scenario above. For technical details and troubleshooting, see [Advanced Configuration](/manage/network-routes/use-cases/by-configuration/advanced-configuration).

## Need Simpler VPN-to-Site Access?

If you only need openZro peers to access remote resources (not site-to-site or site-to-vpn), the [Networks](/manage/networks/use-cases) feature offers a simpler setup experience with per-resource access control.
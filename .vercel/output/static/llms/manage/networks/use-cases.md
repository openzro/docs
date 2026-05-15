# Networks Use Cases

Source: https://docs.netbird.io/manage/networks/use-cases

---

# Networks Use Cases

These guides show how to use the [Networks](/manage/networks) feature for VPN-to-Site access—where openZro peers access devices on remote networks that don't have openZro installed.

## What is VPN-to-Site?

VPN-to-Site allows a device running openZro (like your laptop) to access devices on a remote network (like your home or office) without installing openZro on every device.

```
Your Laptop ──────► openZro Tunnel ──────► Routing Peer ──────► Target Device
  (peer)                                    (peer)              (no openZro)
```

**Example scenarios:**
- Access your home NAS from a coffee shop
- Reach office servers while traveling
- Connect to IoT devices on a remote network

> **Note:** Networks supports VPN-to-Site only. For Site-to-VPN (clientless devices initiating connections) or Site-to-Site (connecting two networks), use [Network Routes](/manage/network-routes/use-cases).

## Understanding Resource Types

In Networks, a **resource** represents something you want to make accessible through the VPN tunnel—whether that's a single server, an entire subnet, or a domain-based service. Resources are what your routing peers make reachable to authorized openZro clients.

openZro supports three types of resources:

- **IP resources** — Single IP addresses (`192.168.1.10`) or CIDR ranges (`172.16.0.0/16`). Use these when you know the exact IP addresses of your target devices or want to grant access to an entire subnet.

- **Domain resources** — Specific fully-qualified domain names like `app.example.com`. Use these when the target service has a stable hostname but its IP address may change (common with cloud load balancers or dynamic DNS).

- **Wildcard domain resources** — Domain patterns like `*.internal.company.com` that match all subdomains. Use these when you have many services under a shared domain and want to avoid creating individual resources for each one.

Each resource can have its own access policy, allowing you to grant different levels of access to different teams—for example, giving developers full access to a development subnet while restricting everyone else to specific services.

## Need More Than VPN-to-Site?

If your scenario requires:
- Clientless devices initiating connections (Site-to-VPN)
- Two networks communicating with each other (Site-to-Site)
- Disabling masquerade for source IP preservation

See [Network Routes Use Cases](/manage/network-routes/use-cases) instead.
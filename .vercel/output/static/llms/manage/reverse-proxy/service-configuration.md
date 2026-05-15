# Backend Service Configuration

Source: https://docs.netbird.io/manage/reverse-proxy/service-configuration

---

# Backend Service Configuration

When a backend service sits behind a reverse proxy, it sees the proxy's IP address as the client IP instead of the real user's IP. Many self-hosted applications require you to configure a list of "trusted proxies" or "known proxies" so they can correctly read the real client IP from the `X-Forwarded-For` header.

With the openZro Reverse Proxy, the proxy connects to your target service through a WireGuard tunnel. From the target's perspective, the source IP of incoming requests is the proxy's **openZro IP** — an address from the `100.64.0.0/10` Carrier-Grade NAT range that openZro uses for all peers.

> **Note:** **Do not hardcode a specific openZro IP** (e.g., `100.64.0.47`) in your backend's trusted proxy configuration. openZro IPs can change when the peer or service restarts, which would cause your backend to stop trusting the proxy and reject forwarded headers.

> **Note:** **Cloud-hosted usage limits:** openZro's cloud-hosted Reverse Proxy is provided on a shared, best-effort basis. High-volume or sustained data transfers may be subject to bandwidth limits, rate limiting, and fair-use policies under the [openZro Terms of Service](https://openzro.io/terms). These restrictions do not apply if you [self-host openZro](/selfhosted/selfhosted-guide).

## Docker Bridge Networks

If the openZro peer and the backend service run as containers on the **same Docker bridge network** (for example, when using the Home Assistant openZro add-on), traffic between them does not traverse the WireGuard tunnel. In this case, the backend sees the openZro container's **Docker bridge IP** (typically from `172.16.0.0/12`) rather than a openZro IP.

When this applies, add the Docker bridge subnet to your trusted proxy list **in addition to** the openZro range:

```
100.64.0.0/10
172.16.0.0/12
```

> **Note:** The default Docker bridge subnet is `172.17.0.0/16`, but Docker and add-on managers may assign addresses from anywhere in the `172.16.0.0/12` range. Check your Docker network configuration (`docker network inspect `) to find the exact subnet if you want a narrower entry.

## Recommended Solution

Instead of specifying a single IP, configure your backend to trust the **entire openZro CGNAT range**:

```
100.64.0.0/10
```

This covers all possible openZro IPs regardless of reassignment. This is safe because only authorized peers within your openZro network can reach the target through the encrypted WireGuard tunnel — no external traffic can originate from this range.

If the openZro peer runs on the same Docker bridge network as the backend (see [above](#docker-bridge-networks)), also add the Docker bridge range `172.16.0.0/12`.

> **Note:** If you prefer a narrower openZro range, you can use your account's specific network range (typically `100.64.0.0/16`). Find your account's range via the API: `GET /api/accounts/{id}` — look for the `network_range` field. However, the full `/10` range is recommended for simplicity and resilience.

## Service-specific Examples

Below are configuration examples for common self-hosted applications. Configuration options may vary by version — consult each application's official documentation for the most current syntax.

### Jellyfin

In the Jellyfin admin dashboard:

1. Go to **Dashboard** → **Networking**.
2. In the **Known Proxies** field, enter `100.64.0.0/10`.
3. Click **Save**.

    

This tells Jellyfin to trust forwarded headers from any openZro IP, allowing it to see the real client IP. Additionally, Jellyfin supports adding a 'Base URL' this can be used in conjunction with setting a location while [configuring your service](https://docs.openzro.io/manage/reverse-proxy#step-2-configure-service-details) on the openZro Reverse Proxy service.
### Home Assistant

In your `configuration.yaml`, add or update the `http` section. You can do this through the File Editor or Studio Code Server add-on, or via the command line if you have terminal access. If you want to learn more about Home Assistant checkout our [full guide on the Knowledge Hub](https://openzro.io/knowledge-hub/home-assistant-access).

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 100.64.0.0/10
```

If you are running the [openZro add-on](https://github.com/openzro/addon-openzro) (which runs as a Docker container on the same host), also add the Docker bridge range. Click the button below to get this add-on.

[![Add openZro add-on repository](/docs-static/img/manage/reverse-proxy/service-configuration/ha_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fglemsom%2Fhassio-openzro)

```yaml
http:
  use_x_forwarded_for: true
  trusted_proxies:
    - 100.64.0.0/10
    - 172.16.0.0/12
```

Restart Home Assistant after making this change. Without `use_x_forwarded_for` and a matching `trusted_proxies` entry, Home Assistant will block requests from the reverse proxy.

### Nextcloud

In your Nextcloud `config/config.php`, add the openZro range to the `trusted_proxies` array:

```php
'trusted_proxies' => ['100.64.0.0/10'],
```

If you're running NextCloud AIO this should be configured automatically during setup, but if needed you can use `sudo docker exec -u 0 -it nextcloud-aio-nextcloud /bin/bash`.

Nextcloud supports CIDR notation for IPv4 ranges. When a request arrives from a trusted proxy, Nextcloud reads the real client IP from the `X-Forwarded-For` header instead of using the proxy's IP.

## Verifying your configuration

After updating your backend's trusted proxy settings:

1. Access your service through the openZro reverse proxy URL.
2. Check the backend's access logs — the logged client IP should be the **real user's IP**, not a `100.64.x.x` address.
3. If the backend still shows a openZro IP, verify that **Pass Host Header** is enabled in your reverse proxy service's [Settings tab](/manage/reverse-proxy#step-4-configure-advanced-settings) and that you have restarted the backend service after changing its configuration.

You can also monitor requests from the openZro side using [Access Logs](/manage/reverse-proxy/access-logs).

## Related pages

- [Reverse Proxy Overview](/manage/reverse-proxy) — setup, concepts, and service management
- [Access Logs](/manage/reverse-proxy/access-logs) — monitor traffic to your reverse proxy services
- [How openZro Works](/about-openzro/how-openzro-works) — details on IP assignment from the CGNAT range
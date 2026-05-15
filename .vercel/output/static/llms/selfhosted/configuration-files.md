# Self-Hosted Deployment Configuration Files Reference

Source: https://docs.netbird.io/selfhosted/configuration-files

---

# Self-Hosted Deployment Configuration Files Reference

This page provides a comprehensive reference for all configuration files used when self-hosting openZro with the `getting-started.sh` deployment method. Understanding these files helps you customize your deployment, troubleshoot issues, and integrate with existing infrastructure.

> **Note:** Configuration files are **generated automatically** by the `getting-started.sh` script. Modifying files directly is only necessary for advanced customization after initial setup.

## Overview

A standard openZro self-hosted deployment uses the following configuration files:

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Defines all services (dashboard, openzro-server, optionally traefik), their Docker images, port mappings, volumes, and startup order. Structure varies depending on the reverse proxy option chosen during setup. |
| `config.yaml` | Unified server configuration for the combined openZro server: listen addresses, STUN, relay authentication, embedded IdP, and database settings. Replaces the old `management.json` and `relay.env` files. |
| `dashboard.env` | Configures the web dashboard including API endpoints, OAuth2/OIDC settings, and optional SSL settings for standalone deployments without a reverse proxy. |

### File Locations

After running the installation script, configuration files are located in the directory where you ran the script (typically `~/openzro/` or the current working directory):

```
./
├── docker-compose.yml
├── config.yaml
├── dashboard.env
└── nginx-openzro.conf      # Only when using Nginx reverse proxy
    npm-advanced-config.txt  # Only when using Nginx Proxy Manager
    caddyfile-openzro.txt    # Only when using Caddy reverse proxy
```

---

## docker-compose.yml

The Docker Compose file defines all openZro services, their dependencies, networking, and volumes.

### Services Overview

| Service | Image | Internal Port | External (Exposed) | Description |
|---------|-------|---------------|-------------------|-------------|
| `traefik` | `traefik:v3.6` | 80, 443 | 80:80, 443:443 | Handles TLS termination via Let's Encrypt and routes incoming HTTPS requests to the appropriate openZro services. Only included when using the built-in Traefik option (option 0). |
| `dashboard` | `openzro/dashboard` | 80 | 8080:80 | The web-based management console where administrators configure networks, manage peers, create access policies, and view activity logs. Includes an embedded nginx server for serving the UI. |
| `openzro-server` | `openzro/openzro-server` | 80, 3478/udp | 8081:80, 3478:3478/udp | Combined server that includes management, signal, relay, and embedded STUN in a single container. Configured via `config.yaml`. |

> **Note:** **Internal vs External ports**: Internal ports are what services listen on inside their containers. External (Exposed) ports show the host-to-container mapping used when running without the built-in Traefik (e.g., with Nginx or other reverse proxies). When using the default Traefik deployment, only Traefik exposes ports externally.

> **Note:** The `openzro-server` container combines what were previously separate management, signal, relay, and STUN containers into a single service. This simplifies the deployment architecture while maintaining the same functionality.

### Traefik Service

The Traefik service is only present when using the built-in reverse proxy option (option 0 during setup). It handles automatic TLS certificate provisioning via Let's Encrypt and routes requests to the correct backend services.

```yaml
traefik:
  image: traefik:v3.6
  container_name: openzro-traefik
  restart: unless-stopped
  networks: [openzro]
  command:
    - "--providers.docker=true"
    - "--providers.docker.exposedbydefault=false"
    - "--providers.docker.network=openzro"
    - "--entrypoints.web.address=:80"
    - "--entrypoints.websecure.address=:443"
    - "--entrypoints.websecure.transport.respondingTimeouts.readTimeout=0"
    - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
    - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
    - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
  ports:
    - '443:443'
    - '80:80'
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - openzro_traefik_letsencrypt:/letsencrypt
  logging:
    driver: "json-file"
    options:
      max-size: "500m"
      max-file: "2"
```

> **Note:** The `readTimeout=0` setting on the websecure entrypoint disables read timeouts, which is required for long-lived gRPC and WebSocket connections used by the signal and relay services.

### Dashboard Service

**With built-in Traefik (default):**
```yaml
dashboard:
  image: openzro/dashboard:latest
  container_name: openzro-dashboard
  restart: unless-stopped
  networks: [openzro]
  env_file:
    - ./dashboard.env
  labels:
    - traefik.enable=true
    - traefik.http.routers.openzro-dashboard.rule=Host(`openzro.example.com`)
    - traefik.http.routers.openzro-dashboard.entrypoints=websecure
    - traefik.http.routers.openzro-dashboard.tls=true
    - traefik.http.routers.openzro-dashboard.tls.certresolver=letsencrypt
    - traefik.http.routers.openzro-dashboard.priority=1
    - traefik.http.services.openzro-dashboard.loadbalancer.server.port=80
  logging:
    driver: "json-file"
    options:
      max-size: "500m"
      max-file: "2"
```

> **Note:** The dashboard service is configured via the `dashboard.env` file. See the [dashboard.env section](#dashboardenv) for the full list of environment variables. When using the built-in Traefik, no ports are exposed directly from the dashboard container; Traefik routes traffic to it internally via Docker labels.

### openZro Server Service

The combined server runs management, signal, relay, and STUN in a single container, configured by `config.yaml`.

**With built-in Traefik (default):**
```yaml
openzro-server:
  image: openzro/openzro-server:latest
  container_name: openzro-server
  restart: unless-stopped
  networks: [openzro]
  ports:
    - '3478:3478/udp'
  volumes:
    - openzro_data:/var/lib/openzro
    - ./config.yaml:/etc/openzro/config.yaml
  command: ["--config", "/etc/openzro/config.yaml"]
  labels:
    - traefik.enable=true
    # gRPC router (needs h2c backend for HTTP/2 cleartext)
    # The /management.ProxyService/ path is only required if the reverse proxy
    # container (openzro/reverse-proxy) connects through Traefik — i.e., it
    # runs on a separate host or a different Docker network. If the proxy is on
    # the same Docker network as openzro-server, it connects directly and this
    # path prefix can be omitted.
    - traefik.http.routers.openzro-grpc.rule=Host(`openzro.example.com`) && (PathPrefix(`/signalexchange.SignalExchange/`) || PathPrefix(`/management.ManagementService/`) || PathPrefix(`/management.ProxyService/`))
    - traefik.http.routers.openzro-grpc.entrypoints=websecure
    - traefik.http.routers.openzro-grpc.tls=true
    - traefik.http.routers.openzro-grpc.tls.certresolver=letsencrypt
    - traefik.http.routers.openzro-grpc.service=openzro-server-h2c
    # Backend router (relay, WebSocket, API, OAuth2)
    - traefik.http.routers.openzro-backend.rule=Host(`openzro.example.com`) && (PathPrefix(`/relay`) || PathPrefix(`/ws-proxy/`) || PathPrefix(`/api`) || PathPrefix(`/oauth2`))
    - traefik.http.routers.openzro-backend.entrypoints=websecure
    - traefik.http.routers.openzro-backend.tls=true
    - traefik.http.routers.openzro-backend.tls.certresolver=letsencrypt
    - traefik.http.routers.openzro-backend.service=openzro-server
    # Services
    - traefik.http.services.openzro-server.loadbalancer.server.port=80
    - traefik.http.services.openzro-server-h2c.loadbalancer.server.port=80
    - traefik.http.services.openzro-server-h2c.loadbalancer.server.scheme=h2c
  logging:
    driver: "json-file"
    options:
      max-size: "500m"
      max-file: "2"
```

**With external reverse proxy (exposed ports):**
```yaml
openzro-server:
  image: openzro/openzro-server:latest
  container_name: openzro-server
  restart: unless-stopped
  networks: [openzro]
  ports:
    - '127.0.0.1:8081:80'
    - '3478:3478/udp'
  volumes:
    - openzro_data:/var/lib/openzro
    - ./config.yaml:/etc/openzro/config.yaml
  command: ["--config", "/etc/openzro/config.yaml"]
  logging:
    driver: "json-file"
    options:
      max-size: "500m"
      max-file: "2"
```

#### Traefik Routing Labels

When using the built-in Traefik, the `openzro-server` service uses two routers to handle different traffic types:

| Router | Path Prefixes | Backend Service | Purpose |
|--------|---------------|-----------------|---------|
| `openzro-grpc` | `/signalexchange.SignalExchange/`, `/management.ManagementService/`, `/management.ProxyService/` | `openzro-server-h2c` (h2c scheme) | gRPC traffic for signal exchange, management API, and the [Reverse Proxy feature](/manage/reverse-proxy). Uses HTTP/2 cleartext (h2c) backend because gRPC requires HTTP/2. The `/management.ProxyService/` path is only needed if the reverse proxy container connects through Traefik (see comment in the snippet above). |
| `openzro-backend` | `/relay`, `/ws-proxy/`, `/api`, `/oauth2` | `openzro-server` (http scheme) | HTTP traffic for relay connections, WebSocket proxying, REST API, and OAuth2/OIDC endpoints. |

The dashboard router has `priority=1` (lowest), so it acts as a catch-all for requests that don't match the more specific server routes.

> **Note:** The STUN port (3478/udp) must always be exposed publicly, regardless of reverse proxy configuration. STUN uses UDP for NAT detection and cannot be proxied through HTTP reverse proxies. The STUN server is embedded in the combined `openzro-server` container and configured via the `server.stunPorts` field in `config.yaml`.

### Volume Configuration

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `openzro_data` | `/var/lib/openzro` | Stores the management database (SQLite by default), encryption keys, and persistent state. Back up this volume regularly to preserve your accounts, peers, policies, and setup keys. |
| `openzro_traefik_letsencrypt` | `/letsencrypt` | Stores Traefik's Let's Encrypt TLS certificates. Only used when deploying with the built-in Traefik reverse proxy (option 0). Preserve this volume to maintain TLS certificates across restarts. |

---

## config.yaml

The unified configuration file controls the combined openZro server. It replaces the separate `management.json` and `relay.env` files from older deployments.
See an example `config.yaml` file in the [openZro GitHub repository](https://github.com/openzro/openzro/blob/main/combined/config.yaml.example).

### Complete Structure

Below are the main sections of the `config.yaml` file.
See an example `config.yaml` file in the [openZro GitHub repository](https://github.com/openzro/openzro/blob/main/combined/config.yaml.example) for a complete configuration example.

### Server Settings

### Authentication Settings

Configures the built-in identity provider (embedded IdP) that handles user authentication and management.

When the embedded IdP is active, the server automatically hosts these OIDC endpoints:

- **Discovery**: `https://your-domain/oauth2/.well-known/openid-configuration`
- **JWKS (signing keys)**: `https://your-domain/oauth2/keys`
- **Token issuance**: `https://your-domain/oauth2/token`
- **Device authorization**: `https://your-domain/oauth2/device/authorize`

> **Note:** openZro also supports integration with external OIDC-compatible identity providers for Single Sign-On (SSO), Multi-Factor Authentication (MFA), and centralized user management. See the [Authentication & IdPs page](/selfhosted/identity-providers) for configuration details.

### Store Settings

Configures the database backend for storing all openZro management data including accounts, peers, groups, access policies, routes, DNS configuration, setup keys, and activity logs.

**What data is stored?**

- **Accounts and users** - User accounts, roles, and permissions
- **Peers** - Registered devices, their WireGuard keys, IP assignments, and metadata
- **Groups** - Peer groupings used for access control
- **Access policies** - Network access rules
- **Routes** - Network routes for external subnets
- **DNS configuration** - Custom DNS settings
- **Setup keys** - Keys for automated peer enrollment
- **Activity logs** - Audit trail

| Engine | Storage | Notes |
|--------|---------|-------|
| SQLite (default) | `/var/lib/openzro/` volume | File-based database stored in the `openzro_data` Docker volume. Zero configuration required, but does not support concurrent writes or running multiple management instances. Best for testing or small deployments. |
| PostgreSQL | External database server | Recommended for production deployments. Supports concurrent access, enabling multiple management instances for high availability. |
| MySQL | External database server | Alternative to PostgreSQL for organizations that have standardized on MySQL/MariaDB. Provides similar benefits including concurrent access. |

For PostgreSQL or MySQL, set the connection string via the `server.store.dsn` field in `config.yaml` or environment variables on the `openzro-server` container. See [Using an External Database](#using-an-external-database) below.

See [Management Postgres Store](/selfhosted/postgres-store) for detailed PostgreSQL setup.

> **Note:** Keep `server.store.encryptionKey` secure and backed up. This key encrypts sensitive data in your database, including setup keys and API tokens. Losing this key means losing access to encrypted data, and you will need to regenerate all setup keys and API tokens.

### Activity Events Store Settings

Configures the database backend for storing activity events (audit trail). By default, activity events are stored in a separate SQLite database in the data directory.

### Auth Store Settings

Configures the database backend for the embedded identity provider (Dex). By default, auth data is stored in a separate SQLite database in the data directory.

---

## dashboard.env

Environment configuration for the dashboard service.

### Dashboard Architecture

The openZro dashboard container includes an **embedded nginx server** that serves the dashboard web pages. This nginx instance is built into the container image and handles serving the static web UI files.

```bash
# Endpoints
NETBIRD_MGMT_API_ENDPOINT=https://openzro.example.com
NETBIRD_MGMT_GRPC_API_ENDPOINT=https://openzro.example.com

# OIDC - using embedded IdP
AUTH_AUDIENCE=openzro-dashboard
AUTH_CLIENT_ID=openzro-dashboard
AUTH_CLIENT_SECRET=
AUTH_AUTHORITY=https://openzro.example.com/oauth2
USE_AUTH0=false
AUTH_SUPPORTED_SCOPES=openid profile email groups
AUTH_REDIRECT_URI=/nb-auth
AUTH_SILENT_REDIRECT_URI=/nb-silent-auth

# SSL - disabled when behind reverse proxy (Traefik handles TLS)
NGINX_SSL_PORT=443
LETSENCRYPT_DOMAIN=none
```

> **Note:** When using the built-in Traefik or an external reverse proxy, set `LETSENCRYPT_DOMAIN=none` because the reverse proxy handles TLS termination. Only set a domain here if running the dashboard standalone without a reverse proxy.

### Endpoint Configuration

| Variable | Description |
|----------|-------------|
| `NETBIRD_MGMT_API_ENDPOINT` | The URL where the dashboard makes REST API calls to the management server (e.g., `https://openzro.example.com`). Must be accessible from users' browsers since API calls are made client-side. |
| `NETBIRD_MGMT_GRPC_API_ENDPOINT` | The URL for gRPC communication with the management server. Usually the same as the REST endpoint. Used for in-browser SSH and RDP clients, as well as surfacing management links for client config instructions. |

### Authentication Configuration

| Variable | Description |
|----------|-------------|
| `AUTH_AUDIENCE` | The expected audience claim in OAuth2 tokens. Must match the audience configured in your IdP. For embedded IdP, use `openzro-dashboard`. |
| `AUTH_CLIENT_ID` | The OAuth2 client identifier for the dashboard application. For embedded IdP deployments, this is `openzro-dashboard`. Must match the client ID registered with your identity provider. |
| `AUTH_CLIENT_SECRET` | OAuth2 client secret for confidential clients. Leave empty for public clients (the default for browser-based apps like the dashboard). |
| `AUTH_AUTHORITY` | The OAuth2/OIDC issuer URL (e.g., `https://openzro.example.com/oauth2` for embedded IdP). The dashboard fetches OIDC discovery metadata from `{AUTH_AUTHORITY}/.well-known/openid-configuration`. |
| `USE_AUTH0` | Set to `true` only when using Auth0 as your identity provider. Leave as `false` for embedded IdP or other OIDC providers. |
| `AUTH_SUPPORTED_SCOPES` | Space-separated list of OAuth2 scopes to request during login. Standard value is `openid profile email groups`. |
| `AUTH_REDIRECT_URI` | The path where the IdP redirects after authentication (e.g., `/nb-auth`). Must match a redirect URI registered with your identity provider. |
| `AUTH_SILENT_REDIRECT_URI` | The path for silent token refresh (e.g., `/nb-silent-auth`). Used by the dashboard to refresh tokens in the background without user interaction. |

### Embedded Nginx Configuration

The dashboard container's embedded nginx server can be configured using these environment variables. These settings control how the dashboard serves its web UI.

| Variable | Default | Description |
|----------|---------|-------------|
| `NGINX_SSL_PORT` | `443` | The HTTPS port for the dashboard's embedded nginx server. Only relevant in standalone mode without an external reverse proxy. |
| `LETSENCRYPT_DOMAIN` | - | The domain name for automatic Let's Encrypt certificate provisioning. Set to `none` when using an external reverse proxy that handles TLS. |
| `LETSENCRYPT_EMAIL` | - | Email address for Let's Encrypt account registration and certificate expiry notifications. Required when `LETSENCRYPT_DOMAIN` is set to an actual domain. |

> **Note:** The `NGINX_SSL_PORT` and Let's Encrypt variables are **only necessary when running the dashboard standalone** without an external reverse proxy. For most installations using the built-in Traefik or an external reverse proxy, set `LETSENCRYPT_DOMAIN=none` and the embedded nginx will serve on HTTP (port 80) internally while your reverse proxy handles HTTPS.

---

## Common Configuration Scenarios

### Using an External Database

To use PostgreSQL instead of SQLite:

1. Update `config.yaml`:
```yaml
server:
  store:
    engine: "postgres"
    dsn: "host=db-server user=openzro password=secret dbname=openzro port=5432"
```

Alternatively, you can use an environment variable instead of putting the DSN in the config file:
```yaml
openzro-server:
  environment:
    - NETBIRD_STORE_ENGINE_POSTGRES_DSN=host=db-server user=openzro password=secret dbname=openzro port=5432
    # Or for MySQL:
    # - NETBIRD_STORE_ENGINE_MYSQL_DSN=user:password@tcp(host:3306)/openzro
```

See [Management Postgres Store](/selfhosted/postgres-store) for detailed setup.

### Changing Log Level

Update `server.logLevel` in `config.yaml`:

```yaml
server:
  logLevel: "debug"
```

Options: `debug`, `info`, `warn`, `error`. Use `debug` for troubleshooting connection issues.

### Custom STUN Ports

To use multiple STUN ports, update `config.yaml`:

```yaml
server:
  stunPorts:
    - 3478
    - 3479
```

Make sure to expose all ports in `docker-compose.yml`:
```yaml
openzro-server:
  ports:
    - '3478:3478/udp'
    - '3479:3479/udp'
```

### Behind a Reverse Proxy

When running behind your own reverse proxy (Nginx, Caddy, Nginx Proxy Manager, etc.) instead of the built-in Traefik:

1. Set `LETSENCRYPT_DOMAIN=none` in `dashboard.env`
2. Use the exposed-ports variant of `docker-compose.yml` (the setup script generates this automatically for options 1-4)
3. Configure your reverse proxy to route traffic to the correct containers and ports:
   - Dashboard: `127.0.0.1:8080` (HTTP)
   - openZro Server: `127.0.0.1:8081` (HTTP), with gRPC paths using h2c (HTTP/2 cleartext)

See [External Reverse Proxy Configuration](/selfhosted/external-reverse-proxy) for detailed templates for Nginx, Caddy, and other proxies.

### Using External Services (Advanced)

> **Note:** The default openZro deployment includes embedded relay, signal, and STUN services. External services are only needed for advanced use cases.

To use external STUN, relay, or signal servers, add overrides to `config.yaml`:

```yaml
server:
  # ... basic settings ...

  # Optional: Use external STUN servers
  stuns:
    - uri: "stun:stun.example.com:3478"
      proto: "udp"

  # Optional: Use external relay servers
  relays:
    addresses:
      - "rels://relay.example.com:443"
    secret: "relay-auth-secret"
    credentialsTTL: "24h"

  # Optional: Use external signal server
  signalUri: "https://signal.example.com:443"
```
See the [Scaling Your Self-Hosted Deployment](/selfhosted/maintenance/scaling/scaling-your-self-hosted-deployment) guide for more details on configuring external services.

---

## See Also

- [Self-hosting Quickstart Guide](/selfhosted/selfhosted-quickstart) - Get started quickly with default settings
- [External Reverse Proxy Configuration](/selfhosted/external-reverse-proxy) - Nginx, Caddy, NPM, HAProxy setup
- [Management SQLite Store](/selfhosted/sqlite-store) - SQLite database details
- [Management Postgres Store](/selfhosted/postgres-store) - PostgreSQL setup
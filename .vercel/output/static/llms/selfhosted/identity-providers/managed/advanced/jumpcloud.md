# JumpCloud SSO with openZro Self-Hosted (Legacy)

Source: https://docs.netbird.io/selfhosted/identity-providers/managed/advanced/jumpcloud

---

# JumpCloud SSO with openZro Self-Hosted (Legacy)

[JumpCloud](https://jumpcloud.com/) is a cloud-based directory platform that provides identity, access, and device management. It offers single sign-on (SSO), multi-factor authentication (MFA), and centralized user management.

## Standalone Setup (Advanced)

> **Note:** openZro includes built-in [local user management](/selfhosted/identity-providers/local) powered by an embedded IdP, allowing you to create and manage users directly without requiring an external identity provider. You can also add **multiple external identity providers** alongside local users, giving users multiple login options.

We highly recommend using the simpler setup that adds JumpCloud as an external IdP directly in the openZro Management Dashboard. This approach requires minimal configuration, works alongside local users, and doesn't require replacing your embedded IdP. See the [Management Setup (Recommended)](/selfhosted/identity-providers/managed/jumpcloud#management-setup-recommended) section in the main JumpCloud documentation.

The standalone setup below replaces your embedded IdP entirely and is only recommended for experienced JumpCloud administrators who need full control over authentication and user management.

Use JumpCloud as your primary identity provider instead of openZro's embedded IdP. This option gives you full control over authentication and user management, is recommended for experienced JumpCloud administrators as it also requires additional setup and ongoing maintenance.

For most deployments, the [embedded IdP](/selfhosted/identity-providers/local) is the simpler choice — it's built into openZro, fully integrated, and requires minimal configuration to get started. For this implementation, go back up to the [Management Setup (Recommended)](#management-setup-recommended) section above.

### Prerequisites

- JumpCloud account with admin permissions (sign up at https://jumpcloud.com/)
- Docker and Docker Compose for openZro

### Step 1: Create and Configure SSO Application

1. Navigate to [Admin Portal](https://console.jumpcloud.com/)
2. Click **SSO Applications** under **USER AUTHENTICATION**
3. Click **Add New Application** → **Custom Application**

    

4. Confirm **Custom application** selected and click **Next**

    

5. Select **Manage Single Sign-On (SSO)** and check **Configure SSO with OIDC**
6. Click **Next**

    

7. Enter **Display Label**: `openZro`
8. Click **Next**

    

9. Review and click **Configure Application**

    

10. On the **SSO** tab, configure:
    - **Redirect URIs**: 
      - `https://<domain>/silent-auth`
      - `https://<domain>/auth`
      - `http://localhost:53000`
    - **Client Authentication Type**: `Public (None PKCE)`
    - **Login URL**: `https://<domain>`

    

11. Under **Attribute Mapping (optional)**:
    - **Standard Scopes**: `Email`, `Profile`

    

12. Click **User Groups** tab and select groups that can access the application

    

13. Click **Activate**

    

14. Note the **Client ID**

### Step 2: Create Administrator for Integration

The openZro management system requires an API token to get user information from JumpCloud.

> **Note:** If you already have an integration user, confirm it has the required role and skip to Step 3.

1. Navigate to [Admin Portal](https://console.jumpcloud.com/)
2. Go to **Settings** and click the add button (+)
3. Fill in:
   - **First Name**: `openZro`
   - **Last Name**: `Integration`
   - **Administrator Email**: `openzro-user@<yourdomain>`
   - **Role**: `Read Only`
4. Click **Save**

    

> **Note:** **Optional**: To enable automatic user deletion from JumpCloud when deleted from openZro, add the `--user-delete-from-idp` flag to the management startup command and assign the `Help Desk` role instead.

5. Check email for login instructions and set a password

### Step 3: Generate API Token

1. Log in to [Admin Portal](https://console.jumpcloud.com/) with the integration user
2. Click the account initials (top-right) → **My API Key**

    

3. If no key exists, click **Generate New API Key**
4. Copy the API token

    

### Step 4: Configure openZro

Set properties in the `setup.env` file:

```shell
NETBIRD_DOMAIN="<YOUR_DOMAIN>"
NETBIRD_AUTH_OIDC_CONFIGURATION_ENDPOINT="https://oauth.id.jumpcloud.com/.well-known/openid-configuration"
NETBIRD_USE_AUTH0=false
NETBIRD_DASH_AUTH_USE_AUDIENCE=false
NETBIRD_AUTH_AUDIENCE="<CLIENT_ID>"
NETBIRD_AUTH_SUPPORTED_SCOPES="openid profile email offline_access"
NETBIRD_AUTH_CLIENT_ID="<CLIENT_ID>"
NETBIRD_AUTH_REDIRECT_URI="/auth"
NETBIRD_AUTH_SILENT_REDIRECT_URI="/silent-auth"
NETBIRD_TOKEN_SOURCE="idToken"

NETBIRD_AUTH_DEVICE_AUTH_PROVIDER="none"

NETBIRD_MGMT_IDP="jumpcloud"
NETBIRD_IDP_MGMT_EXTRA_API_TOKEN="<API_TOKEN>"
```

### Step 5: Continue with openZro Setup

You've configured all required resources in JumpCloud. Continue with the [openZro Self-hosting Guide](/selfhosted/selfhosted-guide#step-5-run-configuration-script).

---

## Troubleshooting

### "Issuer did not match" or "Unauthenticated" error

If you see an error like:

```
FATL ... oidc: issuer did not match the issuer returned by provider, expected "https://oauth.id.jumpcloud.com" got "https://oauth.id.jumpcloud.com/"
```

This means there's a trailing slash mismatch in the Issuer URL. OIDC validation is strictly character-for-character.

**The Cause:**
- **Configured in openZro:** `https://oauth.id.jumpcloud.com` (missing trailing slash)
- **Returned by JumpCloud:** `https://oauth.id.jumpcloud.com/` (has trailing slash)

Because the service fails to initialize the IDP manager, the Management container will often crash or restart loop, making it impossible to fix this via the Web UI.

**Resolution:**

If you can still access openZro Dashboard:
1. Navigate to **Settings** → **Identity Providers**
2. Edit the JumpCloud identity provider
3. Change the **Issuer** field to exactly `https://oauth.id.jumpcloud.com/` (with trailing slash)
4. Click **Save**
5. Restart the management container: `docker restart openzro-management`

If you cannot access the dashboard (locked out), you must fix it directly in the SQLite database:

1. **Locate the Volume:**
   ```bash
   docker volume inspect root_openzro_management
   # Look for "Mountpoint", e.g., /var/lib/docker/volumes/root_openzro_management/_data
   ```

2. **Access the Database:**
   ```bash
   cd /var/lib/docker/volumes/root_openzro_management/_data
   
   # Backup the database first!
   cp idp.db idp.db.bak
   
   # Open the database
   sqlite3 idp.db
   ```

3. **Update the Issuer URL:**
   Inside the SQLite prompt, run the following:
   ```sql
   -- Check current config to confirm missing slash
   SELECT config FROM connector;
   
   -- Update the config to add trailing slash to match JumpCloud
   UPDATE connector 
   SET config = replace(config, 'jumpcloud.com"', 'jumpcloud.com/"') 
   WHERE config LIKE '%jumpcloud.com"%';
   
   -- Verify the change
   SELECT config FROM connector;
   
   -- Exit
   .quit
   ```

4. **Restart Service:**
   ```bash
   docker restart openzro-management
   ```

The service should now start successfully, and the error should be resolved.

### "Connector failed to initialize" error

- Ensure **Attribute Mapping** has both **Email** and **Profile** scopes enabled
- Verify at least one **User Group** is assigned to the application before activation
- Check that **Redirect URIs** exactly matches the URL from openZro (no trailing slashes)
- Ensure **Client Authentication Type** is set to `Client Secret POST`
- Verify **Login URL** matches your openZro domain exactly
- Make sure the application is **Activated** and you have the correct **Client ID** and **Client Secret**
- Remove any duplicate attributes in **Attribute Mapping** (e.g., `email` and `email_verified`)

### "Invalid redirect URI" error

- Ensure all redirect URIs are configured in JumpCloud
- Check for trailing slashes
- Verify URLs match exactly

### Users can't access openZro

- Verify the user belongs to an assigned user group
- Check that the user group is assigned to the openZro application

### API token not working

- Verify the integration user has appropriate permissions
- Generate a new API token if the current one is invalid

### Device authorization not available

- JumpCloud has limited device auth support
- Set `NETBIRD_AUTH_DEVICE_AUTH_PROVIDER="none"`

---

> **Note:** openZro includes built-in [local user management](/selfhosted/identity-providers/local) powered by an embedded IdP, allowing you to create and manage users directly without requiring an external identity provider. You can also add **multiple external identity providers** alongside local users, giving users multiple login options.

We highly recommend using the simpler setup that adds JumpCloud as an external IdP directly in the openZro Management Dashboard. This approach requires minimal configuration, works alongside local users, and doesn't require replacing your embedded IdP. See the [Management Setup (Recommended)](/selfhosted/identity-providers/managed/jumpcloud#management-setup-recommended) section in the main JumpCloud documentation.

## Related Resources

- [JumpCloud Documentation](https://jumpcloud.com/support)
- [JumpCloud Admin Console](https://console.jumpcloud.com/)
- [Embedded IdP Overview](/selfhosted/identity-providers/local)
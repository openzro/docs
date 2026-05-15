# Keycloak with openZro Self-Hosted

Source: https://docs.netbird.io/selfhosted/identity-providers/keycloak

---

# Keycloak with openZro Self-Hosted

[Keycloak](https://www.keycloak.org/) is an open-source Identity and Access Management solution maintained by Red Hat. It provides single sign-on, social login, user federation, fine-grained authorization, and supports OpenID Connect, OAuth 2.0, and SAML 2.0 protocols.

## Management Setup (Recommended)

Add Keycloak as an external IdP directly in the openZro Management Dashboard. This is the simplest approach and recommended for most deployments.

### Prerequisites

- openZro self-hosted with embedded IdP enabled
- Keycloak instance running with SSL

### Step 1: Create Realm in Keycloak

1. Open the Keycloak Admin Console
2. Hover over the realm dropdown in the top-left corner (where it shows `Master` or your current realm)
3. Click **Create Realm**

    

4. Fill in:
   - **Realm name**: `openzro`

    

5. Click **Create**
6. Verify that `openzro` is now selected in the realm dropdown

### Step 2: Create User in Keycloak

1. Make sure the `openzro` realm is selected
2. Click **Users** (left-hand menu)
3. Click **Create new user**

    

4. Fill in:
   - **Username**: `openzro` (or your preferred username)
   - **Email**: Your email address
5. Click **Create**
6. Click the **Credentials** tab
7. Click **Set password**
8. Fill in the password and set **Temporary** to `Off`
9. Click **Save**

    

### Step 3: Start Creating Client in Keycloak

1. Click **Clients** → **Create client**

    

2. Fill in the form:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `openzro`

    

3. Click **Next**
4. On Capability config:
   - Enable **Client authentication**

    

5. Click **Next**
6. On Login settings page, **don't click Save yet** — you'll add the redirect URI in Step 4

### Step 4: Get Redirect URL from openZro

1. Open a new tab or window and log in to your openZro Dashboard
2. Navigate to **Settings** → **Identity Providers**
3. Click **Add Identity Provider**
4. Select **Keycloak** (or choose **Generic OIDC** if Keycloak is not listed)
5. Fill in the fields (you can leave **Client Secret** empty for now):

| Field | Value |
|-------|-------|
| Type | Generic OIDC (if not already selected) |
| Name | Keycloak (or your preferred display name) |
| Client ID | `openzro` (from Step 3) |
| Client Secret | Leave empty for now |
| Issuer | `https://keycloak.example.com/realms/openzro` |

6. openZro will display a **Redirect URL** — **copy this URL** (but don't click **Add Provider** yet)

    

### Step 5: Complete Client Configuration in Keycloak

1. Return to the Keycloak Admin Console tab
2. On the Login settings page:
   - Under **Valid redirect URIs**, paste the redirect URL you copied from openZro
3. Click **Save**
4. Go to the **Credentials** tab and copy the **Client secret** — you'll need this for Step 6

    

### Step 6: Complete openZro Setup

1. Return to the openZro tab
2. In the identity provider form, paste the **Client secret** you copied from Step 5
3. Click **Add Provider**

    

### Step 7: Test the Connection

1. Log out of openZro Dashboard
2. On the login page, you should see a "Keycloak" button
3. Click it and authenticate with the user credentials you created in Step 2
4. You should be redirected back to openZro and logged in

    

> **Note:** Users who authenticate via Keycloak will appear in your openZro Users list with a Keycloak badge next to their name.

### Configuring JWT 'groups' Claim

To sync Keycloak groups with openZro, you need to create a client scope with a group membership mapper.

#### Step 1: Create Groups Client Scope

1. In Keycloak Admin Console, ensure the `openzro` realm is selected
2. Go to **Client scopes** → **Create client scope**
3. Fill in:
   - **Name**: `groups`
   - **Type**: `Default`
   - **Include in token scope**: `On`
4. Click **Save**

    

#### Step 2: Add Group Membership Mapper

1. In the newly created `groups` client scope, go to the **Mappers** tab
2. Click **Configure a new mapper**
3. Select **Group Membership**
4. Configure the mapper:
   - **Name**: `groups`
   - **Token Claim Name**: `groups`
   - **Full group path**: `Off` (recommended for cleaner group names)
   - **Add to ID token**: `On`
   - **Add to access token**: `On`
   - **Add to userinfo**: `On`
   - **Add to token introspection**: `Off`
5. Click **Save**

    

#### Step 3: Add Client Scope to openZro Client

1. Go to **Clients** → **openzro** (your client)
2. Go to the **Client scopes** tab
3. Click **Add client scope**
4. Select **groups** and add it as **Default**

    

#### Step 4: Create Groups and Assign Users

1. Go to **Groups** → **Create group**
2. Create groups as needed (e.g., `admins`, `developers`)
3. Go to **Users** → select a user → **Groups** tab
4. Click **Join Group** and assign users to groups

#### Step 5: Enable JWT Group Sync in openZro

1. In openZro Dashboard, go to **Settings** → **Groups**
2. Enable **JWT group sync**
3. Set **JWT claim** to `groups`
4. Optionally configure **JWT allow groups** to restrict access

> **Note:** If **Full group path** is enabled, group names will include the path (e.g., `/admins` or `/parent/child`). Disable it for cleaner names like `admins`.

---

## Standalone Setup (Advanced)

Use Keycloak as your primary identity provider instead of openZro's embedded IdP. This option gives you full control over authentication and user management, is recommended for experienced Keycloak administrators as it also requires additional setup and ongoing maintenance.

For most deployments, the [embedded IdP](/selfhosted/identity-providers/local) is the simpler choice — it's built into openZro, fully integrated, and requires minimal configuration to get started. For this implementation, go back up to the [Management Setup (Recommended)](#management-setup-recommended) section above.

For detailed instructions on the standalone setup, see the [Keycloak SSO with openZro Self-Hosted (Advanced)](/selfhosted/identity-providers/advanced/keycloak) documentation.

> **Note:** If you prefer not to self-host an Identity and Access Management solution, you could use a managed alternative like [Auth0](/selfhosted/identity-providers/managed/auth0).

---

## Troubleshooting

### "Invalid redirect URI" error

- Ensure the redirect URI matches exactly what's configured
- Use the exact URL from the openZro success modal

### "Invalid token" errors

- Verify the issuer URL includes `/realms/openzro` (or your realm name)
- Ensure the client ID matches in both Keycloak and openZro
- Check clock synchronization between servers

### Users not appearing in openZro

- Users appear after their first successful login

---

## Related Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Embedded IdP Overview](/selfhosted/identity-providers/local)
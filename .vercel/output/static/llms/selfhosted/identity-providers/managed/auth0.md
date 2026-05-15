# Auth0 SSO with openZro Self-Hosted

Source: https://docs.netbird.io/selfhosted/identity-providers/managed/auth0

---

# Auth0 SSO with openZro Self-Hosted

[Auth0](https://auth0.com/) is a flexible, drop-in solution to add authentication and authorization services to your applications. It's a managed service that handles identity infrastructure so you don't have to.

## Management Setup (Recommended)

Add Auth0 as an external IdP directly in the openZro Management Dashboard. This is the simplest approach and recommended for most deployments.

### Prerequisites

- openZro self-hosted with embedded IdP enabled
- Auth0 account (sign up at https://auth0.com/)

### Step 1: Start Creating Application in Auth0

1. Log in to your Auth0 dashboard at https://manage.auth0.com/
2. Go to **Applications** → **Applications**
3. Click **Create Application**

    

4. Fill in:
   - **Name**: `openZro`
   - **Application type**: `Regular Web Application`

    

5. Click Create

### Step 2: Get Redirect URL from openZro

1. Open a new tab or window and log in to your openZro Dashboard
2. Navigate to **Settings** → **Identity Providers**
3. Click **Add Identity Provider**
4. Fill in the fields:

| Field | Value |
|-------|-------|
| Type | Generic OIDC |
| Name | Auth0 (or your preferred display name) |
| Client ID | From Auth0 application (will fill after Step 3) |
| Client Secret | From Auth0 application (will fill after Step 3) |
| Issuer | `https://your-tenant.auth0.com/` **(must include trailing slash)** (will fill after Step 3) |

5. **Copy the Redirect URL** that openZro displays (but don't click **Add Provider** yet)

### Step 3: Complete Auth0 Application Setup

1. Return to the Auth0 tab
2. Go to **Settings** tab
3. Under **Allowed Callback URLs**, add the redirect URL you copied from openZro
4. Click **Save Changes**

    

5. Note the **Client ID**, **Client Secret**, and **Domain** (e.g., `your-tenant.auth0.com`) at the top of the setting tab — you'll need these for Step 4

    

### Step 4: Complete openZro Setup

1. Return to the openZro tab
2. Fill in the **Client ID** and **Client Secret** from Step 3
3. Update the **Issuer** field with your Auth0 domain if needed (e.g., `https://your-tenant.auth0.com/`)

    

4. Click **Add Provider**

### Step 5: Test the Connection

1. Log out of openZro Dashboard
2. On the login page, you should see an "Auth0" button
3. Click it and authenticate
4. You should be redirected back to openZro and logged in. Unless your user approval setting were changed you will need to log back into your local admin account to approve the user.

---

## Standalone Setup (Advanced)

Use Auth0 as your primary identity provider instead of openZro's embedded IdP. This option gives you full control over authentication and user management, is recommended for experienced Auth0 administrators as it also requires additional setup and ongoing maintenance.

For most deployments, the [embedded IdP](/selfhosted/identity-providers/local) is the simpler choice — it's built into openZro, fully integrated, and requires minimal configuration to get started. For this implementation, go back up to the [Management Setup (Recommended)](#management-setup-recommended) section above.

For detailed instructions on the standalone setup, see the [Auth0 SSO with openZro Self-Hosted (Legacy)](/selfhosted/identity-providers/managed/advanced/auth0) documentation.

> **Note:** If you prefer to have full control over authentication, consider self-hosted alternatives like [PocketID](/selfhosted/identity-providers/pocketid).

---

## Troubleshooting

### "Invalid redirect URI" error

- Ensure all callback URLs are configured in Auth0
- Check for trailing slashes
- Verify URLs match exactly

---

## Related Resources

- [Auth0 Documentation](https://auth0.com/docs/)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Embedded IdP Overview](/selfhosted/identity-providers/local)
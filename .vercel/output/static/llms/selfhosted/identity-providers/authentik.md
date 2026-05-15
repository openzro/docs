# Authentik with openZro Self-Hosted

Source: https://docs.netbird.io/selfhosted/identity-providers/authentik

---

# Authentik with openZro Self-Hosted

[Authentik](https://goauthentik.io) is an open-source identity provider focused on flexibility and security. It serves as a self-hosted alternative to commercial solutions like Okta and Auth0, providing single sign-on (SSO), multi-factor authentication (MFA), access policies, user management, and support for SAML and OIDC protocols.

## Management Setup (Recommended)

Add Authentik as an external IdP directly in the openZro Management Dashboard. This is the simplest approach and recommended for most deployments.

### Prerequisites

- openZro self-hosted with embedded IdP enabled
- Authentik instance with admin access

### Step 1: Create OAuth2/OpenID Provider in Authentik

1. Navigate to Authentik admin interface
2. Click **Applications** on the left menu, then click **Providers**
3. Click **Create** to create a new provider

    

4. Select **OAuth2/OpenID Provider** and click **Next**

    

5. Fill in the form with the following values:
   - **Name**: `openZro`
   - **Authorization Flow**: `default-provider-authorization-explicit-consent (Authorize Application)`
   - **Client type**: `Confidential`
   - **Redirect URIs/Origins**: Leave empty for now (you'll add this in Step 5)
   - **Signing Key**: Select any cert present, e.g., `authentik Self-signed Certificate`

    

6. Click **Finish**
7. Note the **Client ID** and **Client Secret** — you'll need these for Step 3

### Step 2: Create Application in Authentik

1. Click **Applications** on the left menu, then click **Applications**
2. Click **Create** to create a new application

    

3. Fill in the form:
   - **Name**: `openZro`
   - **Slug**: `openzro`
   - **Provider**: Select the `openZro` provider you created in Step 1

    

4. Click **Create**

### Step 3: Get Redirect URL from openZro

1. Open a new tab or window and log in to your openZro Dashboard
2. Navigate to **Settings** → **Identity Providers**
3. Click **Add Identity Provider**
4. Fill in the fields:

| Field | Value |
|-------|-------|
| Type | Generic OIDC |
| Name | Authentik (or your preferred display name) |
| Client ID | From Authentik provider (from Step 1) |
| Client Secret | From Authentik provider (from Step 1) |
| Issuer | `https://authentik.example.com/application/o/openzro/` |

5. **Copy the Redirect URL** that openZro displays (but don't click **Add Provider** yet)

    

### Step 4: Configure Redirect URI in Authentik

1. Return to Authentik admin → **Providers** → **openZro**
2. Click **Edit**

    

3. Under **Redirect URIs/Origins**, add the redirect URL you copied from openZro
4. Select **Strict** (not Regex) to match the exact URL from openZro

    

5. Click **Update**

### Step 5: Complete openZro Setup

1. Return to the openZro tab
2. Click **Add Provider**

### Step 6: Test the Connection

1. Log out of openZro Dashboard
2. On the login page, you should see an "Authentik" button
3. Click it and authenticate with your Authentik credentials
4. You should be redirected back to openZro and logged in

### Configuring JWT 'groups' Claim

**Authentik includes a `groups` claim in the ID token by default through the `profile` scope.** However, you may need to verify the configuration and ensure groups are included in the token.

#### Step 1: Verify Scope Mappings

1. In Authentik admin, go to **Customization** → **Property Mappings**
2. Find and click on **authentik default OAuth Mapping: OpenID 'profile'**
3. Verify it includes group information, or create a custom mapping

#### Step 2: Configure Provider to Include Claims in ID Token

1. Go to **Applications** → **Providers**
2. Edit your openZro provider
3. Under **Advanced protocol settings**, enable **Include claims in id_token**
4. Ensure the **profile** and **groups** scopes are selected
5. Click **Update**

#### Step 3: Enable JWT Group Sync in openZro

1. In openZro Dashboard, go to **Settings** → **Groups**
2. Enable **JWT group sync**
3. Set **JWT claim** to `groups`
4. Optionally configure **JWT allow groups** to restrict access

> **Note:** Authentik returns group names (not IDs) in the `groups` claim. Groups are synced based on the user's group membership in Authentik.

---

## Standalone Setup (Advanced)

Use Authentik as your primary identity provider instead of openZro's embedded IdP. This option gives you full control over authentication and user management, is recommended for experienced Authentik administrators as it also requires additional setup and ongoing maintenance.

For most deployments, the [embedded IdP](/selfhosted/identity-providers/local) is the simpler choice — it's built into openZro, fully integrated, and requires minimal configuration to get started. For this implementation, go back up to the [Management Setup (Recommended)](#management-setup-recommended) section above.

For detailed instructions on the standalone setup, see the [Authentik SSO with openZro Self-Hosted (Advanced)](/selfhosted/identity-providers/advanced/authentik) documentation.

> **Note:** If you prefer not to self-host an Identity and Access Management solution, you could use a managed alternative like [Auth0](/selfhosted/identity-providers/managed/auth0).

---

## Troubleshooting

### "Invalid redirect URI" error

- Ensure the redirect URI exactly matches what openZro provides
- Copy the exact URL from the success modal

### Authentication fails silently

- Verify a signing key is selected in the provider configuration
- Check that the application is linked to the correct provider

---

## Related Resources

- [Authentik Documentation](https://goauthentik.io/docs/)
- [Embedded IdP Overview](/selfhosted/identity-providers/local)
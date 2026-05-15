# Authentik on openZro Cloud

Source: https://docs.netbird.io/manage/team/single-sign-on/authentik

---

# Authentik on openZro Cloud 

You can use Authentik as your Identity Provider with openZro, but it will require some additional configuration steps. Authentik is an open-source identity provider focused on flexibility and security. It serves as a self-hosted alternative to commercial solutions like Okta and Auth0, providing single sign-on (SSO), multi-factor authentication (MFA), access policies, user management, and support for SAML and OIDC protocols.

> **Note:** Support for OIDC-compliant IdPs is available on the Team plan and higher.
    The Free plan supports Google, Microsoft, and social logins.

1. You need to create a new Application and Provider.
    - Browse to the Applications Administration menu, click on Application, and then click on Create with Provider:

    

        - Name the Application and select a suitable explicit user flow. In the example below, we used openZro:

    

    - Click Next and select the OAuth2/OpenID Provider Type:

    

    - Click Next and select an explicit user authorization flow, then take note of the Client ID and Client Secret:

    

    - Add the following redirect URL and select a signing key: 
    URL: `https://login.openzro.io/login/callback`

    

    - Click on Advanced protocol settings and ensure that the email, opened, and profile scopes are selected and that Based on the User’s Hash ID is selected for Subject mode:

    

    - Click Next on the following two screens and Submit to create the provider and application:

    

    - You should see an application listed as follow:

    

2. We need to copy the OpenID Configuration URL for the new provider. You can do that by navigating to Providers in the left menu and then selecting the newly created provider. There you should see a windows similar to the following:

    

    - Copy the OpenID Configuration URL.

3. Then, share the following information with the openZro support team at support@openzro.io:

- Client ID
- Client Secret
- OpenID Configuration URL
- Email domains for your users

> **Note:** We recommend using a secure channel to share the Client’s secret. You can send a separate email and use a secret sharing service like: 
https://onetimesecret.com/en/ 
https://password.link/en
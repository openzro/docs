# Keycloak on openZro Cloud

Source: https://docs.netbird.io/manage/team/single-sign-on/keycloak

---

# Keycloak on openZro Cloud 

You can use Keycloak as your Identity Provider with openZro, but it will require some additional configuration steps. Keycloak is an open-source Identity and Access Management solution aimed at modern applications and services. It's one of the most popular self-hosted IDP solutions with extensive documentation and community support. Keycloak provides single sign-on, social login, user federation, fine-grained authorization, and supports OpenID Connect, OAuth 2.0, and SAML 2.0 protocols.

1. You need to create a new client

    - Browse to the clients Administration menu and then click in Create client:

    

2. Create a client with the type OpenID Connect and add any client ID and name for the client:

    

3. Click Next and enable the following options for Capability config:

    

4. Click Next and fill the following fields:

    Valid redirect URIs: `https://login.openzro.io/login/callback` 
    Web origins: `+`

    

5. Click Save.

6. Next we need to retrieve the secret for the client, you can get that in the Credentials tab for the client:

    

7. Then, share the following information with the openZro support team at support@openzro.io:

- Client ID
- Keycloak URL
- Realm
- Client Secret
- Email domains for your users

> **Note:** We recommend using a secure channel to share the Client’s secret. You can send a separate email and use a secret sharing service like: 
https://onetimesecret.com/en/ 
https://password.link/en
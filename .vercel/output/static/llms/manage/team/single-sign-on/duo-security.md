# Duo Security on openZro Cloud

Source: https://docs.netbird.io/manage/team/single-sign-on/duo-security

---

# Duo Security on openZro Cloud

You can use Duo Security as your Identity Provider with openZro, but it will require some additional configuration steps. Duo Security is a cloud-based security platform that provides secure access through single sign-on (SSO), multi-factor authentication (MFA), and device trust. Duo offers comprehensive identity verification and access policies to protect applications and data.

> **Note:** Support for OIDC-compliant IdPs is available on the Team plan and higher.
    The Free plan supports Google, Microsoft, and social logins.

## Prerequisites

Before you start using Duo Single Sign-On, make sure to meet all the requirements described below:

- A Duo Admin with the Owner, Administrator, or Application Manager role

## Step 1: Create a new OIDC Application

Log in to the [Duo Admin Panel](https://admin.duosecurity.com/). Navigate to **Applications** in the left sidebar, then click **Applications**. Click **+ Add Application** which will open the Application Catalog. Search for **Generic OIDC**, then click **+ Add** next to it.

    

## Step 2: Configure Basic Settings

Configure the Basic Configuration section with the following settings:
- **Application name**: openZro
- **Application Type**: Generic OIDC Relying Party - Single Sign-On
- **User access**: `Enable for all users` (if applicable to all users) or `Enable only for permitted groups` (for fine-grained access control)

    

## Step 3: Configure Relying Party Settings

Configure the Relying Party section with the following settings:
- **Grant Type**: Authorization Code, Refresh Tokens
- **Sign-In Redirect URLs**: `https://login.openzro.io/login/callback`

    

## Step 4: Configure OIDC Response

Configure the OIDC Response section with the following scopes:
- **Scopes**: openid, profile, email

    

Click **Save** to complete the application configuration.

## Step 5: Share Information with openZro Support

From the application metadata, copy the **Client ID**, **Client Secret**, and **Discovery URL**. Share the following information with the openZro support team at support@openzro.io:

- **Client ID**
- **Client Secret**
- **Discovery URL**
- **Email domains for your users**

> **Note:** We recommend using a secure channel to share the Client Secret. You can send a separate email and use a secret sharing service like: 
- https://onetimesecret.com/en/ 
- https://password.link/en
# Auth0 on openZro Cloud

Source: https://docs.netbird.io/manage/team/single-sign-on/auth0

---

# Auth0 on openZro Cloud 

You can use Auth0 as your Identity Provider with openZro, but it will require some additional configuration steps. Auth0 is a flexible, drop-in solution to add authentication and authorization services to your applications. It's a managed service that offers extensive customization options, developer-friendly APIs, universal login, social identity providers, and advanced security features like anomaly detection and breached password detection.

1. Access the [Auth0 console](https://manage.auth0.com/) and navigate to Applications > Applications

2. Click **+ Create Application**

3. Enter **openZro** as the name, select **Single Page Web Applications** as the application type and click **Create**

    

4. On the New Application screen, go to the Settings tab and under Application URIs set the following values:
- Application Login URI: https://your-management.example.com
- Allowed Callback URLs: https://login.openzro.io/login/callback
- Allowed Logout URLs: https://your-management.example.com
- Allowed Web Origins: https://your-management.example.com

    

6. Record the **Client ID** and **Client Secret** that Auth0 generates for your application.

7. Retrieve Application's **Domain** from the **Basic Information** tab

    

8. Share following with our team. Please use a secure method for sharing the sensitive parts of this information:
   1. Application's **Domain**,
   2. (sensitive) **Client ID** and **Client Secret**,
   3. list of email domains to be registered for this SSO configuration,

> **Note:** We recommend using a secure channel to share the Client’s secret. You can send a separate email and use a secret sharing service like: 
- https://onetimesecret.com/en/ 
- https://password.link/en
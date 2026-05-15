# Provision Users and Groups From JumpCloud (Embedded IdP)

Source: https://docs.netbird.io/manage/team/idp-sync/embedded/jumpcloud-sync

---

# Provision Users and Groups From JumpCloud (Embedded IdP)

JumpCloud is a comprehensive cloud-based directory platform that provides identity, access, and device management capabilities.
It offers features like single sign-on (SSO), multi-factor authentication (MFA), and centralized user management
to help organizations secure and manage access to their resources.

openZro's JumpCloud integration enhances user management by allowing you to utilize JumpCloud as your identity provider.
This integration automates user authentication in your network, adds SSO and MFA support, and simplifies network access management
to your applications and resources.

> **Note:** Before creating this integration, ensure you have a JumpCloud connector configured in your embedded IdP.
    If not, refer to the [Identity Providers](/selfhosted/identity-providers) documentation to set it up.

## Prerequisites

Before you begin the integration process, ensure you have the necessary [admin permissions in JumpCloud](https://jumpcloud.com/support/admin-portal-roles). You need a JumpCloud user account with one of the following roles:

* Administrator (minimum required)
* Administrator with Billing

These roles have the required permissions to configure SSO applications and manage SCIM provisioning.

## Enabling JumpCloud SCIM in openZro

To enable SCIM synchronization in openZro, navigate to `Integrations > Identity Provider Sync` in your openZro dashboard. Click the `Connect Jumpcloud` button.

Select your **JumpCloud** identity provider connector for this integration and click **Continue** to proceed.

    

This will open a pop-up window featuring a user-friendly wizard to guide you through the configuration process.

![openZro Jumpcloud Getting Started](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-getting-started.png)

Click `Get Started` to launch the configuration wizard. You will be guided through several configuration options:

**Groups to be synchronized**

By default, all groups assigned to the openZro application in JumpCloud will be synchronized. If you want to synchronize only assigned groups that start with a specific prefix, you can specify them in the filter. Keep in mind that the prefix matching is case-sensitive.

![openZro Jumpcloud Group Filter](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-group-filter.png)

Click `Continue` to proceed to the next step.

**Users to be synchronized**

By default, all users from the groups assigned to the openZro application will be synchronized. If you want to further filter and synchronize only users from specific assigned groups, you can specify those group names in the filter. The group name matching is case-sensitive.

![openZro Jumpcloud User Group Filter](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-user-group-filter.png)

Click `Continue` to generate your SCIM credentials.

**SCIM Credentials**

openZro will generate the SCIM credentials required to configure JumpCloud. Make note of both the **Base URL** and **Token Key** as you will need them in the next section to complete the JumpCloud configuration.

![openZro Jumpcloud SCIM Credentials](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-credentials.png)

Click `Finish Setup` to complete the openZro SCIM configuration.

![openZro Jumpcloud SCIM Enabled](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-enabled.png)

You can now proceed to configure the SCIM application in JumpCloud using the credentials generated above.

## Configure SCIM Application in JumpCloud

In your [JumpCloud admin console](https://console.jumpcloud.com/), go to `SSO Applications`, select your `openZro`
application, and then select the `Identity Management` tab.

In the **Configuration Settings** section, enter the following SCIM Service Provider details:

* **API Type**: `SCIM API` (default)
* **SCIM Version**: `SCIM 2.0` (default)
* **Base URL**: `https://api.openzro.io/api/scim/v2`
* **Token Key**: Paste the Bearer token you copied from openZro
* **Test User Email**: Provide a new, unused email address for testing (e.g., `test@yourdomain.com`)

![JumpCloud SCIM Configuration](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-config.png)

* Click `Test Connection` to verify the SCIM connection

If the connection is successful, you'll see a success message. Click `Activate` to enable SCIM provisioning.

![JumpCloud SCIM Test Success](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-scim-activated.png)

## Assigning Groups for SCIM Synchronization

To enable SCIM synchronization of groups and their memberships to openZro, you need to assign user groups to the openZro SCIM application.

In your [JumpCloud admin console](https://console.jumpcloud.com/):

* Navigate to your `openZro` SSO application
* Click on the `User Groups` tab
* Select the groups whose members you want to synchronize to openZro
* Click `Save` to apply the changes

![JumpCloud Assign Groups](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/jumpcloud-assign-groups.png)

Once saved, JumpCloud will automatically synchronize the selected groups and their user memberships to openZro.

## Verify Synchronization

After assigning groups in JumpCloud, the synchronization will begin automatically. You can verify that users and groups
have been successfully synchronized by navigating to `Team > Users` in your openZro dashboard.

![openZro Verify Users](/docs-static/img/manage/team/idp-sync/jumpcloud-sync/openzro-verify-users.png)

> **Note:** SCIM provisioning will manage only resources that are created through Jumpcloud. Any resources created directly in openZro will not be managed by SCIM.

> **Note:** Synced groups will only be available for membership and will not change the role of user in openZro
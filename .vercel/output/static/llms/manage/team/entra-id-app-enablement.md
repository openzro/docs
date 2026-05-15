# Enable openZro for Microsoft Entra ID

Source: https://docs.netbird.io/manage/team/entra-id-app-enablement

---

# Enable openZro for Microsoft Entra ID

Before your organization can use Microsoft Entra ID features with openZro — such as user provisioning, group sync, or single sign-on — you need to enable the openZro enterprise application in your Entra ID tenant and grant admin consent.

## Prerequisites

- A Microsoft Entra ID tenant
- An account with **Global Administrator** or **Cloud Application Administrator** role

## Step 1: Find the openZro Enterprise Application

1. Sign in to the [Azure portal](https://portal.azure.com)
2. Navigate to **Home** → **Microsoft Entra ID** → **Enterprise Applications**
3. Search for the application with Application ID: `7a7538de-b7ed-4e49-befe-edbe74d5e0a1`
4. Select the **openZro** application from the results

    

## Step 2: Grant Admin Consent

1. In the openZro application overview, click **Permissions** in the left menu
2. Click **Grant admin consent for Default Directory**
3. Review the requested permissions and confirm

    

> **Note:** Granting admin consent allows openZro to access the necessary directory data for your organization. This is a one-time setup step.

## Next Steps

Once admin consent is granted, you can configure Entra ID integration with openZro:

- [Provision Users & Groups via API](/manage/team/idp-sync/microsoft-entra-id-sync)
- [Provision Users & Groups via SCIM](/manage/team/idp-sync/microsoft-entra-id-scim-sync)
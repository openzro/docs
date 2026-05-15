# Deploying openZro's with Jamf Pro

Source: https://docs.netbird.io/manage/integrations/mdm-deployment/jamf-pro-openzro-integration

---

# Deploying openZro's with Jamf Pro

Integrating openZro with Jamf Pro's robust device management capabilities creates a scalable system for secure access management across your entire Apple ecosystem.

This comprehensive tutorial guides you through deploying openZro on Apple devices using Jamf Pro, covering:

1. Setting up openZro Access Policies for Team-Specific Permissions
2. Creating a Jamf Pro Policy for Automated openZro Deployment
3. Verifying the Automated Provisioning Process

By following these steps, you'll establish an automated pipeline that:

* Streamlines network security management
* Minimizes manual configuration errors
* Ensures appropriate access levels for each team in your organization

This integration enhances your organization's security posture while simplifying remote access management for your Apple devices.

## Prerequisites

Before beginning the integration process, make sure you have the following:

* A [openZro account](https://your-management.example.com/) with administrative privileges.
* A [Jamf Pro subscription](https://www.jamf.com/request-trial/) with administrative permissions.
* A valid [Jamf Pro Push Certificate](https://learn.jamf.com/en-US/bundle/jamf-pro-documentation-current/page/Push_Certificates.html).
* At least one Apple device (Mac, iPhone, or iPad) enrolled in Jamf Pro.

These requirements are essential for successfully implementing openZro-Jamf Pro integration and managing your Apple devices securely.

## Setting Up openZro Access Policies for Team-Specific Permissions

openZro's [Access Control Policies](https://docs.openzro.io/manage/access-control/manage-network-access) are essential to this integration, allowing you to define and enforce specific permissions for different user groups. This ensures that team members can only access the resources necessary for their roles.

For this tutorial, we'll create a policy that allows the `Support` team to access the `Servers` group:

* Log in to your openZro dashboard.
* Navigate to `Access Control > Policies` and click `Add Policy`.
* Set the source group to `Support` and the destination group to `Servers`.
* Configure the appropriate protocol and port settings (e.g., TCP 22 for SSH access).

![Access control policy for the support team](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-01.png)

Give the policy a descriptive name (e.g., "Support team remote access") and click `Save` to create the policy.

![Access control policies list](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-02.png)

With this policy in place, any device assigned to the `Support` group will gain access to the `Servers` group as defined in the Access Control Policy.

Now that openZro is configured, let's proceed to the next step: setting up Jamf Pro to deploy openZro on support team devices.

## Creating Jamf Pro Policy for Automated openZro Deployment

To deploy openZro using Jamf Pro, you need to [upload the openZro package](https://learn.jamf.com/en-US/bundle/jamf-pro-documentation-current/page/Package_Deployment.html) to Jamf and then [configure a policy](https://learn.jamf.com/en-US/bundle/jamf-pro-documentation-current/page/Policy_Management.html) that includes the package.

### Uploading openZro Package

Navigate to `Settings > Computer management > Packages` and click `+ New`.

In the `General` tab:
* Enter a descriptive **Display name** (e.g., openZro_vX.XX_Support_Team, where X.XX is the current openZro version).
* Optionally, assign a **Category** (e.g., VPN).
* Upload or drop the package file in the **Filename** field. This tutorial uses the Apple Silicon package you can download [here](https://github.com/openzro/openzro/releases/latest). 
* Optionally, add Info and Notes.

In the `Options` tab:
* Set a **Priority** (default is 10).
* The priority determines the order in which packages are installed when multiple packages are included in a policy. Lower numbers indicate higher priority (e.g., 1 is a higher priority than 10). Use this to ensure critical packages are installed before openZro if needed.

Click `Save` to finish. If you see the message "Availability pending", click `Refresh` to update the package status.

![Uploading openZro package](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-03.png)

### Creating a Policy for openZro

Go to `Computers > Computer management > Policies` and click `+ New` to create a new policy for the openZro app.

In the `General` section of the `Options` tab:
* Provide a descriptive name in the **Display Name** field (e.g., openZro Apple Silicon)

In the **Trigger** options, check the following boxes:
* Startup: Installs openZro when the computer starts up.
* Enrollment Complete: Ensures openZro is installed immediately after the device is enrolled in Jamf Pro.
* Recurring Check-in: Allows periodic checks to ensure openZro is installed and up-to-date.

These trigger selections ensure openZro is installed promptly and remains current on all managed devices. Leave the remaining options as default.

![Jamf Pro policies, general section](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-04.png)

In the `Packages` section, click `Configure` and add the corresponding openZro package:

![Jamf Pro policies, packages section](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-05.png)

Accept the default values for **Distribution Point** and **Action**

![Jamf Pro policies, packages section](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-06.png)

In the `Scope` tab, specify the target computers (all computers, specific computers or groups, etc.). For simplicity in this example, use `All Computers`.

![Jamf Pro policies, target computers](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-07.png)

Optionally, in the `User Interaction` tab:
* Enter messages to display before and after the policy runs.
* This can help inform users about the installation process.

![Jamf Pro policies, user interaction](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-08.png)

Click `Save` to finish.

![openZro policy](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-09.png)

This configuration ensures openZro is installed as soon as any machine enrolls, maintaining security across your device fleet. 

It's worth mentioning that for first-time devices when openZro is launched after installation, it automatically triggers the Single Sign-On (SSO) login flow. This seamless process combines connection setup and authentication, establishing both network connectivity and user verification in one streamlined step. 

The SSO flow works as follows:

1. When users open openZro for the first time, they will be prompted to authenticate.
2. The user will be redirected to your organization's identity provider (IdP) login page.
3. After successful authentication, the user is automatically connected to the openZro network.
4. openZro then configures itself with the appropriate permissions based on the user's identity and group memberships.

This approach ensures secure and efficient user authentication by integrating with your organization's identity management system. It eliminates the need for separate VPN credentials, simplifying the user experience while maintaining robust security.

Throughout the process, openZro logs its actions, which can be useful for troubleshooting purposes. Upon successful completion of the SSO flow and network connection, openZro is fully operational, marking the end of a smooth, automated deployment and configuration process.

## Verifying the Automated Provisioning Process

After setting up openZro deployment policy in Jamf Pro, it's crucial to verify that the automated provisioning process is working correctly. Follow these steps to confirm the successful installation of openZro:

* In Jamf Pro, navigate to `Computers > Search Inventory`.
* Click `Search` to display all enrolled machines.
* Select a newly enrolled machine from the list.
* In the device details, go to the `Management` tab and locate the `Policies` section.
* Look for the openZro policy in the list of applied policies.

![Jamf Pro, confirming openZro is installed](/docs-static/img/manage/integrations/mdm-deployment/jamf-pro-openzro-integration//openzro-jamf-10.png)

If you see the openZro policy listed, that would indicate that openZro has been successfully installed on the device.

To further verify the integration, check that the machine has been added to your openZro network:

* Log into a openZro account with administrative privileges.
* Go to the `Peers` section.
* Look for the newly enrolled machine in the list of peers.

If you can see the new machine listed as a peer in openZro, this confirms that the automated provisioning process is working correctly and the device has been successfully added to your openZro network.

By following these verification steps, you can ensure that your Jamf Pro policy is effectively deploying openZro to your managed devices and integrating them into your secure network infrastructure.

This tutorial taught you how to seamlessly integrate openZro's VPN solution with Jamf Pro for Apple devices. By configuring openZro Access Policies, creating a Jamf Pro policy for automated deployment, and verifying the provisioning process, you've established a solid system for managing secure network access across your organization.
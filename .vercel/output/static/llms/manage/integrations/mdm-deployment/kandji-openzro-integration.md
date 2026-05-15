# Deploying openZro with Kandji MDM

Source: https://docs.netbird.io/manage/integrations/mdm-deployment/kandji-openzro-integration

---

# Deploying openZro with Kandji MDM

Combining openZro's with [Kandji's orchestration capabilities](https://www.kandji.io) creates a powerful solution for securing and managing access across your entire Apple ecosystem, from mobile devices to desktops.

In this hands-on guide, you'll learn how to deploy openZro on Apple devices using Kandji MDM to grant tailored access permissions for different teams by:

1. Configuring openZro Access Policies for Team-Specific Permissions
2. Creating Kandji MDM Blueprints for Automated openZro Deployment
3. Testing and Verifying the Automated Provisioning Pipeline

Following these steps, you'll set up an automated pipeline that simplifies network security management, reduces manual configuration errors, and ensures appropriate access levels for each team.

## Prerequisites

To successfully integrate openZro with Kandji MDM, ensure you have the following prerequisites in place:

* [Active openZro account](https://your-management.example.com/) with administrative access.
* [Kandji MDM subscription](https://signup.kandji.io) with administrative privileges.
* At least one Apple device (Mac, iPhone, iPad) [enrolled in Kandji MDM](https://support.kandji.io/support/solutions/articles/72000560543-configuring-device-enrollment).

## Configuring openZro Access Policies for Team-Specific Permissions

openZro plays a crucial role in this integration by providing granular access control through its [Access Control Policies](https://docs.openzro.io/manage/access-control/manage-network-access). These features allow you to define and enforce specific permissions for different user groups, ensuring that team members can only access the resources necessary for their roles. 

For instance, let's suppose you want to create a policy that allows the `Support` team to access the `Servers` group:

* In openZro, navigate to `Access Control > Policies` and click `Add Policy`.
* Set the source group to `Support` and the destination group to `Servers`.
* Choose the appropriate protocol and port settings (e.g., TCP 22).

![Creating a new access policy for the Support team](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-01.png)

Give the policy a descriptive name (e.g., Support team remote access) and click `Save` to create the policy.

![Support team access policy](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-02.png)

Now that you've configured openZro, let's shift the focus to Kandji MDM integration and set up the automated deployment of openZro on support team devices.

## Integrating openZro with Kandji Custom Apps

Navigate to `Library` and click `Add new`. Then, find and select `Custom Apps` and click `Add & Configure` to deploy a new [Custom App](https://www.support.kandji.io/support/solutions/articles/72000559807-deploying-custom-apps).

![Creating a new Custom App in Kandji](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-04.png)

Give the Custom App a descriptive name (e.g., openZro_vX.XX_Support_Team, where X.XX is the current version of openZro being deployed). Scroll down to **Install Details**, where you'll see different options.

Select `Installer Package` to install openZro using the official macOS package. Using a package ensures you're installing the exact same version on all devices. This example uses the Apple Silicon package that you can download [here](https://github.com/openzro/openzro/releases/latest). Drag the file to the `Installer Package` field box to upload it to Kandji MDM.

![Creating a new Custom App in Kandji](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-05.png)

Next, click on `Add Preinstall Script` and paste the following code:

```bash 
#!/bin/sh

set -x

LOG_FILE=/var/log/openzro/client_pre_install.log
AGENT=/usr/local/bin/openzro

mkdir -p /var/log/openzro/

{
    # check if it was installed with brew
    brew list --formula | grep openzro
    if [ $? -eq 0 ]
    then
        echo "openZro has been installed with Brew. Please use Brew to update the package."
        exit 1
    fi
    osascript -e 'quit app "openZro"' || true
    $AGENT service stop || true

    echo "Preinstall complete"
    exit 0 # all good
} &> $LOG_FILE
```

> **Note:** This preinstall script prepares the system for a smooth openZro installation by setting up logging, checking for previous Homebrew installations, and stopping any running openZro instances. It ensures a clean slate, preventing conflicts and maintaining consistency across deployments, ultimately reducing potential errors during installation.

Now, click on `Add Postinstall Script` and paste the following code:

```bash
#!/bin/sh

set -x

APP=/Applications/openZro.app
AGENT=/usr/local/bin/openzro
LOG_FILE=/var/log/openzro/client_post_install.log

mkdir -p /var/log/openzro/
mkdir -p /usr/local/bin/

{
    echo "Installing openZro..."

    if test -d $APP; then
        echo "openZro app copied successfully."
    else
        echo "openZro app could not be copied to the Applications folder."
        exit 1
    fi

    ln -fs $APP/Contents/MacOS/openzro $AGENT
    if test -f $AGENT; then
        echo "openZro binary linked successfully."
    else
        echo "openZro could not create symlink to /usr/local/bin"
        exit 1
    fi

    $AGENT service install || true
    $AGENT service start || true
    $AGENT up --hostname YOUR_CUSTOM_HOSTNAME_HERE
    open $APP

    echo "Finished openZro installation successfully"
    exit 0 # all good
} &> $LOG_FILE
```

The post-install script completes the openZro installation through a series of steps:

* It begins by verifying the app's presence in the Applications folder, creating necessary symlinks, initiating the openZro service, and configuring openZro with the provided hostname. 
* For first-time devices, when the script executes the `openzro up` command, it automatically triggers the Single Sign-On (SSO) login flow. This seamless process combines connection setup and authentication, establishing both network connectivity and user verification in one streamlined step. 
* This approach ensures secure and efficient user authentication by integrating with your organization's identity management system. 
* Throughout the process, the script logs its actions for troubleshooting purposes. 
* Upon successful completion, openZro is launched, marking the end of a smooth, automated deployment process.

Keep in mind that you can use these scripts as customizable templates, which can be tailored to meet the specific requirements of your organization's openZro deployment process.

## Creating Kandji Blueprints for Automated openZro Deployment

Creating a Blueprint ([Assignment Map](https://www.support.kandji.io/support/solutions/articles/72000627627-getting-started-with-assignment-maps)) for openZro deployment ensures consistent and automated installation across designated devices. Moreover, Kandji Blueprints allow you to define specific configurations and apps that should be installed on devices based on certain criteria, which is ideal for targeting particular teams or device groups with your openZro deployment.

For instance, you can [create tags](https://www.support.kandji.io/support/solutions/articles/72000630421-tags-for-devices) for different teams (e.g., support, finance, marketing) in Kandji's device management interface. These tags can then be used in the Blueprint logic to assign the appropriate openZro configuration to the right user groups, ensuring each team receives the correct access permissions.

To create a tag in Kandji MDM, go to `DEVICES`, click on the hamburger menu at the top right, and select `Manage tags`:

![Manage Tags in Kandji](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-06.png)

A new pop-up window will appear; click `+ Add tag`, enter a name for the tag (e.g., `Support`), and click `Save`.

![Creating a new Tag](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-07.png)

Navigate to the `BLUEPRINTS` section in Kandji and click the `New Blueprint` dropdown. Select `New Assignment Map` from the options. In the new window, you'll be presented with preconfigured templates or the option to start a new Blueprint from scratch. For this custom openZro deployment, choose to start a new Blueprint from scratch.

![Creating a new Blueprint](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-08.png)

Give the Blueprint a descriptive name (e.g., openZro_Apple_Silicon) and click `Create Blueprint`. This action will open Kandji's visual Blueprint builder, where you'll configure the deployment logic for openZro.

Click `Edit assignments` to start editing the Blueprint.

![Blank Blueprint](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-09.png)

You'll see a list of apps from the library on the left, including the recently created openZro custom app. To implement the deployment logic, hover over the `+` sign and click it to add a new conditional block. This block will determine which devices receive the openZro installation based on specific criteria.

![Add new Block to the Blueprint](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-10.png)

Next, click the pencil icon to edit the rules.

![Add Logic to the Blueprint](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-11.png)

In the **Assignment Rules** window, configure the conditions for openZro installation. Use the `Support` tag to trigger the deployment, ensuring openZro is installed only on devices assigned to the support team. Press `Confirm` to continue.

![Using Tags to target the support team](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-12.png)

Back to the visual Blueprint builder, locate the openZro custom app and drag it into the newly created conditional block. This action associates the openZro installation with the specified deployment criteria for the support team.

![Add openZro custom app to Blueprint logic](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-13.png)

Click `Save` to update the Blueprint with the new logic. This action also assigns the Blueprint to the openZro custom app, finalizing the deployment pipeline configuration. 

![Finished Blueprint](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-14.png)

## Testing and Verifying the Automated Provisioning Pipeline

Kandji checks devices every 15 minutes by default, so any device tagged with `Support` will automatically trigger the openZro installation based on this Blueprint.

To verify the deployment pipeline, navigate to `DEVICES` in Kandji, select an enrolled device, and click `Edit device details` > `Edit tags`. Assign the `Support` tag to trigger the openZro installation. 

![Verifying Blueprint logic](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-15.png)

You can also confirm the process in openZro. Log in to a openZro account with administrative privileges, navigate to the `Peers` section, and look for the new device.

![Verifying peer in openZro](/docs-static/img/manage/integrations/mdm-deployment/kandji-openzro-integration//openzro-kandji-16.png)

In this tutorial, you've learned how to integrate openZro's VPN solution with Kandji MDM for Apple devices. By configuring openZro Access Policies, creating Kandji MDM Blueprints, and setting up an automated deployment pipeline, you've established a robust system for managing network access across your organization.
# Notifications

Source: https://docs.netbird.io/manage/settings/notifications

---

# Notifications

openZro can notify you when important events occur in your account, such as peers waiting for approval, routing peer disconnections, or new users joining. You can configure it under `Settings` > `Notifications` in the openZro dashboard.

> **Note:** This feature is currently only available in the cloud version of openZro.

    

openZro supports three notification channels:

| Channel | Description |
|---------|-------------|
| `Email` | Send notifications to one or more email addresses |
| `Webhook` | Send notifications as HTTP POST requests to a custom endpoint |
| `Slack` | Send notifications to a Slack channel via an Incoming Webhook |

Each channel can be independently enabled or disabled and configured with its own set of event types.

## Supported Events

All notification channels support the following events:

| Category | Event | Description |
|----------|-------|-------------|
| **Peer** | `Pending Approval` | A peer is waiting for approval to join the network |
| **Peer** | `Peer Added` | A new peer is added to the network |
| **Peer** | `Routing Peer Disconnected` | A routing peer loses its connection |
| **Peer** | `Routing Peer Deleted` | A routing peer is deleted from the network |
| **User** | `Pending Approval` | A user is waiting for approval to join the network |
| **User** | `User Joined` | A new user joins the account |
| **User** | `Service User Created` | A new service user is created |
| **Integration** | `IdP Sync Token Expired` | The IdP sync token has expired and needs renewal |
| **Integration** | `EDR Sync Token Expired` | The EDR sync token has expired and needs renewal |

You can toggle each event on or off individually per channel.

## Email Notifications

The email channel lets you send notifications to one or more email recipients.

### Configure Email Notifications

1. Navigate to `Settings` > `Notifications` and click on the `Email` channel.
2. Use the `Enable Email Channel` toggle to enable or disable all email notifications.
3. Under `Email Addresses`, enter the email address you want to receive notifications and click `Add`. You can add multiple recipients.
4. Toggle individual events on or off under the `Peer Notifications`, `User Notifications`, and `Integration Notifications` sections.

    

To remove a recipient, click the `x` button next to their email address.

## Webhook Notifications

The webhook channel sends notification events as HTTP `POST` requests to a URL you specify. This is useful for integrating with third-party tools like Microsoft Teams, PagerDuty, or custom automation systems.

### Connect a Webhook

1. Navigate to `Settings` > `Notifications` and click on the `Webhook` channel.
2. Click the `Connect` button to open the webhook configuration modal.

    

3. In the `General` tab, enter the full HTTP(S) URL of your endpoint. Notification events will be sent as `POST` requests to this URL. Optionally, select an `Authentication` method for the endpoint.

    

4. Click `Continue` to move to the `Headers` tab. Optionally add any custom HTTP headers your endpoint requires.

    

5. Click `Connect` to save the webhook.

Once connected, you can toggle individual events on or off, just like with the email channel.

### Edit or Delete a Webhook

To update the webhook URL, authentication, or headers, click `Edit` on the webhook channel page. 
To remove the webhook entirely, click `Delete`.

    

## Slack Notifications

The Slack channel lets you receive openZro notification events directly in a Slack channel via an Incoming Webhook.

### Connect Slack

1. Navigate to `Settings` > `Notifications` and click on the `Slack` channel.

    

2. Click the `Connect` button to open the Slack configuration modal. In the first step, you will create a Slack App:
    - Open [Slack App Management](https://api.slack.com/apps?new_app=1), click `Create an app`, and choose `From scratch`.

    

    - Set the app name to `openZro Notifications`, select your workspace, and click `Create App`.

    

3. Click `Continue` to move to the second step. Here you will configure the Incoming Webhook:
    - In the Slack app settings, go to `Incoming Webhooks` and toggle `Activate Incoming Webhooks` to `On`.

    

    - Click `Add New Webhook to Workspace`, select the channel where you want to receive notifications,  and confirm with `Allow`.
    - Copy the generated `Webhook URL`.

    

    - Paste the Webhook URL into the input field in the openZro modal.

    

4. Click `Connect` to save the configuration.

Once connected, you can toggle individual events on or off, just like with the email channel.

### Disconnect Slack

To disconnect Slack, click the dropdown menu on the Slack channel page and select `Disconnect`. You will no longer receive notifications in your Slack channel.

    

## Get Started

    

- Make sure to [star us on GitHub](https://github.com/openzro/openzro)
- Follow us [on X](https://x.com/openzro)
- Join our [Slack Channel](/slack-url)
- openZro [latest release](https://github.com/openzro/openzro/releases) on GitHub
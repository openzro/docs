# Enforce periodic user authentication

Source: https://docs.netbird.io/manage/settings/enforce-periodic-user-authentication

---

# Enforce periodic user authentication

To ensure a high level of security, openZro offers a peer login expiration feature that requires users to periodically reauthenticate their devices.
Every new network has this feature enabled, and the expiration period is set to 24 hours by default. You can disable this feature and configure the expiration period in the account settings in the web UI https://your-management.example.com/

> **Note:** This feature is only applied to peers added with the [interactive SSO login feature](/get-started/install#running-net-bird-with-sso-login). Peers, added with a setup key, won't be affected.

Expired peers will appear in the peers' view with the status `Login required`.

    

## Configure and disable expiration
The expiration period can be set to anything between one hour and 180 days.
Go to the Web UI `Settings` tab and set the desired period in the Authentication section.
You can also disable the expiration for the whole network in the same section.

    

> **Note:** Enabling peer expiration or changing the expiration period will cause some peers added with the SSO login to disconnect,
    and re-authentication will be required.

## Disable expiration individually per peer
Sometimes, you might want to disable peer expiration for some peers.
With openZro you can disable login expiration per peer without disabling expiration globally.
In the Peers tab of the web UI click on the peer you want to disable expiration for and use the Login Expiration switch.
Peers with `Expiration disabled` will be marked with a corresponding label in the Peers table.

    

## Get started

    

- Make sure to [star us on GitHub](https://github.com/openzro/openzro)
- Follow us [on X](https://x.com/openzro)
- Join our [Slack Channel](/slack-url)
- openZro [latest release](https://github.com/openzro/openzro/releases) on GitHub
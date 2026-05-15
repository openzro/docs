# Approve peers

Source: https://docs.netbird.io/manage/peers/approve-peers

---

# Approve peers
The peer approval feature enhances network security by requiring manual administrator approval before a device can join the openZro network.
This feature is handy when network administrators want to ensure access is restricted only to trusted, corporate-managed devices.

When enabled, devices connect to the management service without network access to other resources.
Administrators then can assess whether the peer is eligible to join the network.

> **Note:** This feature is only available in the [openZro cloud](https://your-management.example.com/) version.

## Related Video Content

For details on the peer approval feature, part of our "Getting started with openZro" video covers this topic:

## Enable peer approval
To enable peer approval, navigate to [Settings &raquo; Authentication](https://your-management.example.com/) and enable 'Peer approval'.

    

> **Note:** When disabling the peer approval, all pending approval requests will automatically be approved.

## Approve peer
To approve a peer, navigate to the [peers tab](https://your-management.example.com/) and click the `Approve` button on the right side of the peers table.

    

## Automate peer approval with EDR integrations
openZro integrates with popular EDR solutions like [CrowdStrike](https://www.crowdstrike.com/) to automate peer approval
and allow only trusted devices to join the network.
Check the [EDR integrations](/manage/access-control/endpoint-detection-and-response) guide for more information on how to enable this feature.

## Get started

    

- Make sure to [star us on GitHub](https://github.com/openzro/openzro)
- Follow us [on X](https://x.com/openzro)
- Join our [Slack Channel](/slack-url)
- openZro [latest release](https://github.com/openzro/openzro/releases) on GitHub
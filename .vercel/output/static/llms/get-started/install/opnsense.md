# OPNsense Installation

Source: https://docs.netbird.io/get-started/install/opnsense

---

# OPNsense Installation

The openZro client (agent) allows a peer to join a pre-existing openZro deployment. If a openZro deployment is not yet available,
there are both managed and [self-hosted](https://docs.openzro.io/selfhosted/selfhosted-quickstart) options available.

> **Note:** The openZro package is officially included starting from OPNsense `25.7.3`.

## Prerequisites
- Shell or Web UI access to your OPNsense system
- A [setup key](/manage/peers/register-machines-using-setup-keys#types-of-setup-keys) to authenticate and register the OPNsense device

## Installation

1. **Log in to your OPNsense system**

    You can use the Web UI or SSH.

2. **Install the openZro package**

    In the OPNsense Web UI, navigate to `System` > `Firmware` > `Plugins`, and search for the `os-openzro` package. Click the install button next to it.

3. **Verify the installation**

    Once installed, the openZro configuration interface will be available under `VPN` > `openZro` in the OPNsense menu

## Configuration

### Enable the service

Navigate to `VPN` > `openZro` > `Settings` and ensure the toggle `Enable` is turned on in the `General` section.
This will enable us to continue with the next steps.

### Authenticate the machine

Fill out the authentication form with the following values and click `Save`:

- **Management URL**: Default is `https://api.openzro.io:443`. If self-hosting, enter your custom management server URL.
- **Setup Key**: Paste the setup key from your openZro account.

    

### Verify Connection Status

The Status page shows detailed information about connected peers and control services, helping you monitor your deployment.
Access it via `VPN` > `openZro` > `Status` in the OPNsense menu.

Use this section for diagnostics and troubleshooting common connection or setup issues.

    

### Assign openZro interface
After installation, a new interface named `wt0` will be available but unassigned. To assign it go to `Interfaces` >
`Assignments`. Under `Assign a new interface`, set the following values:
- **Device**: `wt0`
- **Description**: `openZro`

    

Click `Add` to assign the interface.

    

### Enable the openZro interface
Now that the openZro interface has been added, you need to enable it. Go to `Interfaces` > `[openZro]`, then configure
the following options and click `Save`, then `Apply changes` to activate the interface:
- **Enable**: `✓ Enable Interface`
- **Lock**: `✓ Prevent interface removal`

  

> **Note:** OPNsense includes native WireGuard support, however do not configure or manage the openZro interface (wt0) via the OPNsense WireGuard UI.
    openZro fully manages the WireGuard interface and keys.

### Configure Firewall Rules for the openZro interface
To allow openZro to handle all access control, permit all traffic on the openZro interface in OPNsense.
This ensures traffic flows freely, while openZro’s own policies (ACLs) govern the access restrictions.

1. Navigate to `Firewall` > `Rules` > `openZro`.
2. Click `+ Add` to create a new rule.
3. Configure the rule:
    - **Action**: `Pass`
    - **Interface**: `openZro`
    - **Direction**: `in`
    - **TCP/IP Version**: `IPv4`
    - **Protocol**: `any`
    - **Source**: `any`
    - **Destination**: `any`
    - **Description**: `Allow all on openZro (managed by openZro)`
4. Click `Save`, then `Apply changes`.
5. Ensure this rule is at the top of the `openZro` rules list so it isn’t shadowed by other rules.

    

### Config for Troubleshooting Relayed Connections

By default, OPNsense uses automatic outbound NAT which randomizes source ports. This can cause issues with openZro's NAT traversal (hole punching). To ensure reliable direct connections, you must configure a Static Port mapping.

1.  **Change Outbound NAT Mode**:
    -   Navigate to `Firewall` > `NAT` > `Outbound`.
    -   Select `Hybrid outbound NAT rule generation`.
    -   Click `Save`.

2.  **Add Static Port Rule**:
    -   Click `+` to add a new rule.
    -   **Interface**: `WAN`
    -   **TCP/IP Version**: `IPv4`
    -   **Protocol**: `UDP`
    -   **Source address**: `Single host or Network` (enter the IP address of your openZro host)
    -   **Destination address**: `any`
    -   **Translation / Static-port**: Check `Static-port` box
    -   **Description**: `openZro Static Port`
    -   Click `Save` and then `Apply changes`.

3.  **Reset States**:
    -   Go to `Firewall` > `Diagnostics` > `States`.
    -   Filter by the openZro host IP.
    -   Delete the states.

4.  **Restart openZro**:
    -   Run `openzro service restart` on the device.
    -   Run `openzro status -d` to verify the connection.

## Get started

    

- Make sure to [star us on GitHub](https://github.com/openzro/openzro)
- Follow us [on X](https://x.com/openzro)
- Join our [Slack Channel](/slack-url)
- openZro [latest release](https://github.com/openzro/openzro/releases) on GitHub
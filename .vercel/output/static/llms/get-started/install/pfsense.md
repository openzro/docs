# pfSense Installation

Source: https://docs.netbird.io/get-started/install/pfsense

---

# pfSense Installation

The openZro client (agent) allows a peer to join a pre-existing openZro deployment. If a openZro deployment is not yet available,
there are both managed and [self-hosted](https://docs.openzro.io/selfhosted/selfhosted-quickstart) options available.

> **Note:** This installation is intended for early adopters while the pfSense package is under review and not yet available in the pfSense package manager.

{/* TODO(docs): record openZro walkthrough — upstream had:  */}

## Prerequisites
- Shell/SSH access to pfSense (via Web UI shell or remote SSH)
- A [setup key](/manage/peers/register-machines-using-setup-keys#types-of-setup-keys) to authenticate and register the pfSense device
- The latest openZro `.pkg` binary from the [GitHub Releases](https://github.com/openzro/pfsense-openzro/releases)

## Installation

1. **SSH into your pfSense system**
   ```sh
   ssh admin@
   ```
   If remote SSH is enabled or use the built-in shell via the pfSense Web UI (`Diagnostics` > `Command Prompt`).

3. **Download the openZro client(agent)**

   From a shell on your pfSense system, run:
   ```sh
   fetch https://github.com/openzro/pfsense-openzro/releases/download/v0.1.2/openzro-0.55.1.pkg
   ```
3. **Download the openZro pfSense package**

   From a shell on your pfSense system, run:
   ```sh
   fetch https://github.com/openzro/pfsense-openzro/releases/download/v0.1.2/pfSense-pkg-openZro-0.1.0.pkg
   ```

4. **Install the packages**

   ```sh
   pkg add -f openzro-0.55.1.pkg
   pkg add -f pfSense-pkg-openZro-0.1.0.pkg
   ```

5. **Verify the installation**

   The openZro GUI should now appear under `VPN` > `openZro` in the pfSense menu.

## Configuration

### Authenticate the machine

Fill out the authentication form with the following values and click `Save`:

- **Management URL**: Default is `https://your-management.example.com:443`. If self-hosting, enter your custom management server URL.
- **Setup Key**: Paste the setup key from your openZro account. .

<p>
    

### Verify Connection Status

The Status page shows detailed information about connected peers and control services, helping you monitor your deployment.
Access it via `Status` > `openZro` in the pfSense menu.

Use this section for diagnostics and troubleshooting common connection or setup issues.

    

### Assign openZro interface
After authentication, a new interface named `wt0(wt0)` will be available but unassigned. To assign it go to
`Interfaces` > `Assignments`. Under `Available network ports`, select the openZro interface `wt0(wt0)` and click `Add`.

    

### Enable the openZro interface

Now that the openZro interface has been added, you need to enable it. Go to `Interfaces` > `OPT1`, then configure
the following options and click `Save`, then `Apply changes` to activate the interface:

- **Enable**: `✓ Enable Interface`
- **Description**: `openZro`

  

### Configure Firewall Rules for the openZro interface

To allow openZro to handle all access control, permit all traffic on the openZro interface in pfSense. This ensures traffic
flows freely, while openZro’s own policies (ACLs) govern the access restrictions.

Create rules to control traffic coming from your openZro network into pfSense and your local networks:

1. Go to `Firewall` > `Rules` and select the `openZro` (interface) tab and click `Add` to create rules
2. Configure the rule:
    - **Action**: `Pass`
    - **Interface**: `NETBIRD`
    - **Address Family**: `in`
    - **Protocol**: `Any`
    - **Source**: `Any`
    - **Destination**: `Any`
    - **Description**: `Allow all on openZro (managed by openZro)`
3. Click `Save`, then `Apply Changes`

### Config for Troubleshooting Relayed Connections

By default, pfSense uses automatic outbound NAT which randomizes source ports. This can cause issues with openZro's NAT traversal (hole punching). To ensure reliable direct connections, you must configure a Static Port mapping.

1.  **Change Outbound NAT Mode**:
    -   Navigate to `Firewall` > `NAT` > `Outbound`.
    -   Select `Hybrid Outbound NAT rule generation`.
    -   Click `Save`.

2.  **Add Static Port Rule**:
    -   Click `Add` (Up arrow) to create a new rule at the top of the list.
    -   **Interface**: `WAN`
    -   **Address Family**: `IPv4`
    -   **Protocol**: `UDP`
    -   **Source**: `Network` (enter the IP address of your openZro host)
    -   **Destination**: `Any`
    -   **Translation / Static Port**: Check `Static Port` box
    -   **Description**: `openZro Static Port`
    -   Click `Save` and then `Apply Changes`.

3.  **Reset States**:
    -   Go to `Diagnostics` > `States`.
    -   Filter by the openZro host IP.
    -   Click `Kill`.

4.  **Restart openZro**:
    -   Run `openzro service restart` on the device.
    -   Run `openzro status -d` to verify the connection.

## Uninstallation

From a shell on your pfSense system, run:

```sh
pkg delete openzro-0.55.1 pfSense-pkg-openZro-0.1.0
```

## Get started

    

- Make sure to [star us on GitHub](https://github.com/openzro/openzro)
- Follow us [on X](https://x.com/openzro)
- Join our [Slack Channel](/slack-url)
- openZro [latest release](https://github.com/openzro/openzro/releases) on GitHub
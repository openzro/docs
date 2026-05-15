# Use setup keys to run automated deployments and add machines to your network at scale

Source: https://docs.netbird.io/manage/peers/register-machines-using-setup-keys

---

# Use setup keys to run automated deployments and add machines to your network at scale

Setup key is a pre-authentication key that allows to register new machines in your network.
It simply associates a machine with an account on a first run.

## Related Video Content
For a comprehensive guide, part of our "Getting started with openZro" video specifically covers setup keys:

The setup key can be provided as a parameter to the ```openzro up``` command.
This makes it possible to run automated deployments with infrastructure-as-code software like Ansible, Cloudformation or Terraform.

```bash {{ title: 'Starting openZro Client' }}
sudo openzro up --setup-key <SETUP KEY>
```

## Types of setup keys

There are 2 types of setup keys:
* **One-off key**. This type of key can be used only once to authenticate a machine.
* **Reusable key**. This type of key can be used multiple times to authenticate machines.

## Ephemeral peers

You can create a setup key with the ephemeral peers option enabled.
Peers added with this key that later become offline for over 10 minutes will be removed automatically from the openZro system.

This is useful when you want to add containers or auto scaling instances to your network.

## Using setup keys

Setup keys are available in the openZro Management Dashboard under the `Setup Keys` tab [https://your-management.example.com/).
 You can easily add new or revoke keys.

    

> **Note:** When revoking a key, all machines authenticated with this key will remain connected to the network. The same logic applies when the key expires.

## Expiration

You can set expiration when creating a key. When expired, the setup key can't be used anymore.

## Usage limit

By default, every reusable key has unlimited usage.
We recommend limiting the number of times the key can be used, e.g., set it to 30 if you need to enroll only 30 machines.

## Allow Extra DNS Labels

You can create a setup key with the **Allow Extra DNS Labels** option enabled.
When enabled, peers registered with this key can set additional DNS names using the `--extra-dns-labels` flag. Other peers in the network can then reach them by these names.

If multiple peers share the same label, they form a DNS round-robin group for that label, distributing queries across all of them.

See [Extra DNS Labels](/manage/dns/extra-dns-labels) for full details, including wildcard labels and usage examples.

## Peer Auto-grouping

openZro offers a powerful [access control feature](/manage/access-control/manage-network-access) that allows easy access management of your resources.
In a basic scenario, you would create multiple groups of peers and create access rules to define what groups can access each other.
Adding peers to groups might become time-consuming in large networks with dozens of machines.

Starting openZro [v0.9.2](https://github.com/openzro/openzro/releases), when creating or updating a setup key,
it is possible to specify a list of auto-assign groups. Every peer registered with this key will be automatically added
to these groups. All the access control rules enabled for these groups will apply automatically.

To add `Auto-assign groups`, open the `Setup Keys` tab and create or update any existing setup key.
Then use this key to enroll new machine.

    

> **Note:** Auto-assign groups will apply only to newly registered machines.

## Create setup key

Go to the `Setup Keys` tab and click the `Create Setup Key` button 
In the opened popup, give your new key an easily identifiable name, choose type, set usage limit, and assign auto groups.
The defaults should be suitable for most of the cases. We recommend using one-off keys for security reasons.

    

After your key has been successfully created, copy and store it in a secure location.
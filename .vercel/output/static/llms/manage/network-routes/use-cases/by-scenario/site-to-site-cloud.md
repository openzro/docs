# Site-to-Site: Cloud Environments

Source: https://docs.netbird.io/manage/network-routes/use-cases/by-scenario/site-to-site-cloud

---

# Site-to-Site: Cloud Environments

This guide shows how to connect cloud VPCs across providers or bridge cloud and on-premise networks using Network Routes.

## What You'll Achieve

After following this guide, workloads across different cloud providers (AWS, GCP, Azure) or between cloud and on-premise can communicate without exposing traffic to the public internet.

```
AWS VPC ────► Routing Peer ────► openZro ────► Routing Peer ────► GCP VPC
(10.0.0.0/16)   (peer)                           (peer)         (10.1.0.0/16)
```

> **Note:** Multi-cloud Site-to-Site requires Network Routes because the Networks feature doesn't yet support this scenario.

## Prerequisites

- A [openZro cloud account](https://your-management.example.com/) or [self-hosted instance](/selfhosted/selfhosted-quickstart)
- Access to deploy VMs in your cloud environments
- Network configuration permissions in your cloud VPCs

## Example: Multi-Cloud Connectivity

Connect workloads across AWS and GCP:

- **AWS VPC**: `10.0.0.0/16`
- **GCP VPC**: `10.1.0.0/16`

## Step 1: Create Setup Keys with Groups

Before deploying routing peers, create setup keys with auto-assigned groups:

1. Go to **Setup Keys** in the openZro dashboard
2. Click **Create Setup Key**
3. For AWS:
   - Name: "AWS Routing Peer"
   - Auto-assigned groups: Create and add `aws-routing-peers`
   - Click **Create**
4. For GCP:
   - Name: "GCP Routing Peer"
   - Auto-assigned groups: Create and add `gcp-routing-peers`

> **Note:** You can also add groups to peers manually after setup. Go to **Peers**, select the peer, and add groups under **Assigned Groups**.

## Step 2: Deploy Routing Peers in Each Cloud

**AWS:**

Launch an EC2 instance in your VPC with openZro installed. Use the following user data:

```bash
#!/bin/bash
curl -fsSL https://github.com/openzro/openzro/releases/latest | sh
openzro up --setup-key YOUR_AWS_SETUP_KEY
```

**GCP:**

Launch a Compute Engine instance in your VPC:

```bash
#!/bin/bash
curl -fsSL https://github.com/openzro/openzro/releases/latest | sh
openzro up --setup-key YOUR_GCP_SETUP_KEY
```

## Step 3: Create Network Routes

**For AWS VPC:**
1. Go to **Network Routes**
2. Click **Add Route**
3. Network range: `10.0.0.0/16`
4. Routing Peer: Select your AWS instance (or use "aws-routing-peers" Peer Group)

    

5. Distribution Groups: "gcp-routing-peers"
6. Access Control Groups: "aws-routing-peers" (required for route-level policies—this group becomes the destination in access policies; without it, policies targeting this route won't apply)

    

7. Network Identifier: `aws-vpc`
8. Enable **Masquerade** (in Additional Settings)
9. Click **Add Route**

    

**For GCP VPC:**
1. Click **Add Route**
2. Network range: `10.1.0.0/16`
3. Routing Peer: Select your GCP instance (or use "gcp-routing-peers" Peer Group)

    

4. Distribution Groups: "aws-routing-peers"
5. Access Control Groups: "gcp-routing-peers" (required for route-level policies—this group becomes the destination in access policies; without it, policies targeting this route won't apply)

    

6. Network Identifier: `gcp-vpc`
7. Enable **Masquerade** (in Additional Settings)
8. Click **Add Route**

## Step 4: Create Access Policies

Create two policies allowing the routing peers to communicate in both directions:

1. Go to **Access Control > Policies**
2. Create policies between the routing peer groups:

```
Source: aws-routing-peers → Destination: gcp-routing-peers (All)
Source: gcp-routing-peers → Destination: aws-routing-peers (All)
```

For route-level access control (if Access Control Groups configured), you can restrict by protocol and port:

```
Source: aws-routing-peers → Destination: gcp-routing-peers (specific protocols)
Source: gcp-routing-peers → Destination: aws-routing-peers (specific protocols)
```

    

    

## Step 5: Configure VPC Routing

**AWS VPC:**

Add a route in your route table:
- Destination: `10.1.0.0/16` (GCP CIDR)
- Target: Your openZro routing peer instance (ENI)

**GCP VPC:**

Add a custom route:
- Destination: `10.0.0.0/16` (AWS CIDR)
- Next hop: Your openZro routing peer instance

> **Note:** Enable IP forwarding on routing peer instances in both clouds.

## Step 6: Test Connectivity

From an AWS instance:

```bash
ping 10.1.0.100  # GCP instance
```

From a GCP instance:

```bash
ping 10.0.0.100  # AWS instance
```

## Cloud-Specific Considerations

### AWS

- Security groups must allow traffic from the openZro routing peer
- Enable source/destination check disabled on the routing peer instance
- Consider using an Auto Scaling group for the routing peer with a static ENI

### GCP

- Firewall rules must allow traffic from the routing peer's internal IP
- Enable IP forwarding on the routing peer instance
- Use managed instance groups for high availability

### Azure

- Network security groups must allow traffic from the routing peer
- Enable IP forwarding on the routing peer NIC
- Consider using a Virtual Machine Scale Set for HA

## Secure Workload Migration

Use Site-to-Site connectivity for migrating workloads between environments:

### Example: Migrating from On-Premise to Cloud

1. **Before migration**: Application and database both on-premise
2. **During migration**: Application in cloud, database still on-premise (use VPN-to-Site via [Networks](/manage/networks/use-cases/by-scenario/cloud-to-on-premise))
3. **Cutover**: Switch traffic to the cloud application
4. **After migration**: Once database is also migrated, update connection strings and remove openZro if no longer needed

## Best Practices

### Security

- Use dedicated setup keys per environment (dev, staging, production)
- Restrict access policies to specific ports and protocols
- Enable [activity logging](/manage/activity) for compliance

### High Availability

- Deploy multiple routing peers and configure failover
- Monitor routing peer health with your existing tools
- Use cloud-native load balancing where appropriate

### Performance

- Place routing peers close to the resources they serve
- Use direct peering where possible (openZro will automatically optimize paths)
- Monitor latency and throughput between environments

## Troubleshooting

**Multi-cloud connectivity issues:**
1. Confirm both routing peers are connected to openZro
2. Check VPC routing tables have correct entries
3. Verify security groups/firewall rules allow traffic

**High latency:**
1. Check routing peer placement and network connectivity
2. Verify traffic is using direct peer-to-peer connections (not relays)
3. Review cloud network configuration for bottlenecks

## Advanced Configuration

For masquerade options, ACL Groups, and detailed troubleshooting, see [Advanced Configuration](/manage/network-routes/use-cases/by-configuration/advanced-configuration).
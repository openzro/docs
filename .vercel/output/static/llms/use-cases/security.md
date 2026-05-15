# Security Use Cases

Source: https://docs.netbird.io/use-cases/security

---

# Security Use Cases

Implement zero trust networking and secure access patterns with openZro.

## Zero Trust Principles

openZro is built on zero trust principles:

- **Verify explicitly**: Every connection is authenticated and authorized
- **Least privilege**: Access is granted only to specific resources, not entire networks
- **Assume breach**: End-to-end encryption ensures traffic is protected even if networks are compromised

## Key Security Features

| Feature | Description |
|---------|-------------|
| [Access Control Policies](/manage/access-control) | Define who can access what resources |
| [Posture Checks](/manage/access-control/posture-checks) | Verify device compliance before granting access |
| [Activity Logging](/manage/activity) | Audit all access events |
| [MFA Integration](/manage/settings/multi-factor-authentication) | Enforce multi-factor authentication |
| [SSO](/manage/team/single-sign-on) | Integrate with identity providers |

## Security Best Practices

1. **Segment your network** - Create specific groups for different access levels
2. **Use protocol restrictions** - Only allow the protocols and ports needed
3. **Enable posture checks** - Verify device compliance before granting access
4. **Monitor activity** - Review audit logs regularly
5. **Implement MFA** - Require multi-factor authentication for all users
6. **Use time-limited access** - Create expiring setup keys for temporary access
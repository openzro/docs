# Automatically Offboard Team Members from openZro

Source: https://docs.netbird.io/manage/team/auto-offboard-users

---

# Automatically Offboard Team Members from openZro

[openZro's IdP-Sync integration](https://docs.openzro.io/manage/team/idp-sync) simplifies offboarding team members, enhancing
security and efficiency. With this integration, you can automatically revoke access when users leave the company, when
temporary access for a freelancer ends after project completion, or when a seasonal employee's contract concludes.
Likewise, you can use this integration to restrict access to specific resources or environments when a project finishes.
For instance, you can limit network and resource access when a team member is removed from a group or when an entire group
is deleted from your Identity Provider.

## Removing Team Members

In this tutorial, we will focus on `user_01`, `user_02`, and `user_03`. From openZro's `Users` dashboard, you can see
that `user_01` is part of the `IT Administrators` group, while `user_02` and `user_03` belong to the `Staging` group.

![openZro Users](/docs-static/img/manage/team/auto-offboard-users/GT3eAeU.png)

To get started, access your Identity Provider (IdP) dashboard. For this example, we'll use [Microsoft Entra ID (Azure AD)](https://docs.openzro.io/manage/team/idp-sync/microsoft-entra-id-sync).

Next, locate the user you want to offboard in your IdP's user management section. Let’s say you want to revoke access to
`user_01`, in that case, you will need to select it and click the `Delete` button as shown below.

![IdP Delete User](/docs-static/img/manage/team/auto-offboard-users/TJWLvXL.png)

After deletion, click the `Refresh` button to confirm that the user is no longer active.

![IdP Confirm Deletion](/docs-static/img/manage/team/auto-offboard-users/LJ6QHRV.png)

Wait for the openZro integration to complete its next synchronization cycle, which usually takes 300 seconds. Alternatively, go to the `Integrations` screen in the openZro admin console and click the corresponding integration button to manually trigger the synchronization.

![openZro Integrations Force Sync](/docs-static/img/manage/team/auto-offboard-users/ogiiUeT.png)

Now, go to openZro's `Users` dashboard to verify that the user is no longer listed.

![openZro Users Verification](/docs-static/img/manage/team/auto-offboard-users/MQ2yh6B.png)

## Revoking Group Access

Imagine a scenario where you have an access policy that grants all members of the `Staging` group access to resources in the `Servers` group.

![openZro Access Control](/docs-static/img/manage/team/auto-offboard-users/sATMbbP.png)

Let's say the current project is finished, and you no longer want members of the `Staging` group to have access to the
`Servers` group. One way to do this is to remove the `Staging` group from your IdP.

![IdP Delete Group](/docs-static/img/manage/team/auto-offboard-users/TOZjFKC.png)

Once the changes synchronize in openZro, users and their group memberships will be updated; therefore,
[network access associated with that group](https://docs.openzro.io/manage/access-control/manage-network-access) will automatically be revoked.

![openZro No Group](/docs-static/img/manage/team/auto-offboard-users/NKabmN6.png)
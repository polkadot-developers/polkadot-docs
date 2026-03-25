---
title: Staking Operator Proxy on Polkadot
description: Learn how the Staking Operator proxy enables non-custodial validator operations by separating fund management from node operations on Polkadot.
categories: Infrastructure
---

# Staking Operator Proxy

## Introduction

The Staking Operator proxy is an on-chain proxy type that enables non-custodial validator operations on Polkadot. It creates a clear separation between fund management and node operations. This separation allows capital providers (stakers) to delegate day-to-day validator operations to node runners (operators) without granting access to bonded funds.

In traditional validator setups, the entity running the node typically requires broad access to the staking account, including the ability to bond, unbond, and transfer funds. The Staking Operator proxy eliminates this requirement by granting the operator only the permissions needed to manage validator operations, such as setting session keys, adjusting commission rates, and managing validator status.

This design is particularly valuable for institutional staking arrangements, where a capital provider wants to delegate operations to a professional node operator while maintaining full control over their bonded DOT. The operator can perform all necessary day-to-day tasks without ever having the ability to move or unbond funds.

``` mermaid
flowchart LR
    A["Validator"]
    B["Staking Operator Proxy"]
    A --"Sets"--> B
    B --"Issues validation calls"--> A
```

## Staking Operator vs Staking Proxy

The Staking Operator proxy is a strict subset of the `Staking` proxy. While the `Staking` proxy grants full access to all staking-related extrinsics, the Staking Operator proxy is limited to operations-only permissions. The following table highlights the differences:

|                        Capability                         | `Staking` Proxy | Staking Operator Proxy |
| :-------------------------------------------------------: | :-------------: | :--------------------: |
|      `staking.validate` (register/update validator)       |       Yes       |          Yes           |
|          `staking.chill` (deactivate validator)           |       Yes       |          Yes           |
|            `staking.kick` (remove nominators)             |       Yes       |          Yes           |
|          `session.setKeys` / `session.purgeKeys`          |       Yes       |          Yes           |
| `stakingRcClient.setKeys` / `stakingRcClient.purgeKeys` |       Yes       |          Yes           |
|           `staking.bond` / `staking.bondExtra`            |       Yes       |           No           |
|       `staking.unbond` / `staking.withdrawUnbonded`       |       Yes       |           No           |
|                    `staking.nominate`                     |       Yes       |           No           |
|                    `staking.setPayee`                     |       Yes       |           No           |
|                     `staking.rebond`                      |       Yes       |           No           |
|          `proxy.addProxy` / `proxy.removeProxy`           |       Yes       |           No           |

The key distinction is that the Staking Operator proxy cannot perform any action that moves, bonds, or unbonds funds. It also cannot create or remove other proxies, preventing delegation chain attacks.

## Set Up a Staking Operator Proxy

Setting up a Staking Operator proxy is the responsibility of the staker (capital provider). Before creating the proxy, the staker must prepare the validator account by bonding funds.

!!! note
    All setup operations are performed on Polkadot Hub (Asset Hub), not on the relay chain.

Follow these steps to set up a Staking Operator proxy:

1. **Bond DOT**: The staker bonds the desired amount of DOT to the stash account. Refer to the [Start Validating](/node-infrastructure/run-a-validator/onboarding-and-offboarding/start-validating/){target=\_blank} guide for detailed instructions on bonding.

2. **Create the proxy**: Call `proxy.addProxy` with the following parameters:

    - **`delegate`**: The operator's account address
    - **`proxy_type`**: Set to `Staking Operator`
    - **`delay`**: The number of blocks the proxy call is delayed (set to `0` for immediate execution, or a higher value for added security)

    The proxy can be created by the stash account directly, an `Any` proxy, or a `Staking` proxy.

3. **Register intent to validate**: The operator calls `staking.validate` wrapped in a `proxy.proxy` call (with the staker's account as the `real` parameter) to register as a validator and set the initial commission rate. This step must be completed before setting session keys.

4. **Set session keys**: The operator calls `stakingRcClient.setKeys` wrapped in a `proxy.proxy` call to set the validator's session keys. This requires a deposit of approximately 60 DOT on the validator account, which is released when `stakingRcClient.purgeKeys` is called.

!!! note
    The order of operations matters. On Polkadot Hub, `bond` must be called by the stash account before the proxy can be created, and `validate` must be called by the staking operator (via proxy) before session keys can be set. Ensure the steps above are completed in order.

!!! warning
    It is strongly recommended that the Validator-`StakingOperator` relationship is 1:1. Assigning the same `StakingOperator` to multiple validators may result in complications and session keys not being properly set. Using a fresh, dedicated, non-validator account as the `StakingOperator` is operationally safer and strongly recommended.

!!! tip
    Consider using a non-zero `delay` value when creating the proxy. A time-delay proxy gives the staker a window to review and potentially cancel any proxy calls before they execute, adding an extra layer of security.

## Operate a Validator with a Staking Operator Proxy

Once the staker has created the Staking Operator proxy, the operator can begin managing the validator. All operator actions are submitted as proxy calls through the `proxy.proxy` extrinsic, using the staker's account as the `real` parameter.

!!! warning "Correct `force_proxy_type` Required"
    When submitting proxy calls, ensure the `force_proxy_type` parameter is set to `Some(StakingOperator)` or `None`. Using `Some(Staking)` will fail with a `NotProxy` error because the proxy pallet requires an exact match on the proxy type. Since the stored proxy type is `StakingOperator`, passing `Staking` does not match.

The operator can perform the following actions:

- **Set session keys**: Rotate or update session keys using `stakingRcClient.setKeys` on Polkadot Hub or `session.setKeys` on the relay chain. See [Key Management](/node-infrastructure/run-a-validator/operational-tasks/general-management/#key-management){target=\_blank} for best practices on managing session keys.
- **Update commission**: Adjust the validator's commission rate by calling `staking.validate` with a new commission value.
- **Deactivate the validator**: Temporarily pause validation by calling `staking.chill`. See [Pause Validating](/node-infrastructure/run-a-validator/operational-tasks/pause-validating/){target=\_blank} for more details on the chilling process.
- **Remove nominators**: Kick specific nominators from the validator's nomination pool using `staking.kick`.
- **Purge session keys**: Remove session keys using `stakingRcClient.purgeKeys` on Polkadot Hub or `session.purgeKeys` on the relay chain.

!!! warning
    The worst-case scenario with a compromised operator is that they could chill the validator, set an unfavorable commission rate, or change session keys. While these actions are disruptive, they cannot result in loss of bonded funds. The staker can revoke the proxy at any time to regain full control.

## Manage Session Keys on Polkadot Hub

Polkadot Hub introduces a new path for session key management through the `stakingRcClient` pallet. This approach is required for validators using pure proxy stash accounts, as pure proxies cannot sign extrinsics directly on the relay chain.

The `stakingRcClient` pallet provides two extrinsics for session key management:

- **`stakingRcClient.setKeys`**: Set or rotate session keys for the validator. The operator submits this call as a proxy transaction through the staker's account. The `keys` and `proof` parameters must be the values returned by the `author_rotateKeysWithOwner(stash)` RPC call on the validator node.
- **`stakingRcClient.purgeKeys`**: Remove session keys from the validator. This is useful when decommissioning a validator node or rotating to a new server.

!!! info "Key Deposit Required"
    Setting session keys via `stakingRcClient.setKeys` requires a deposit of approximately 60 DOT (or ~2 KSM on Kusama) to cover the on-chain storage cost of key registration. This deposit is only released when `stakingRcClient.purgeKeys` is called on Polkadot Hub. Purging keys via the relay chain (`session.purgeKeys`) does not release this deposit.

!!! note
    The legacy `session.setKeys` and `session.purgeKeys` extrinsics on the relay chain remain functional for validators that do not use pure proxy stash accounts. However, the Polkadot Hub path through `stakingRcClient` is the recommended approach for new setups.

For guidance on rotating session keys during node upgrades, see [Upgrade a Validator Node](/node-infrastructure/run-a-validator/operational-tasks/upgrade-your-node/){target=\_blank}.

## Security Considerations

The Staking Operator proxy is designed with a minimal-permission model that limits the blast radius of a compromised operator account. Consider the following security properties and best practices:

- **Non-custodial by design**: The operator never has access to bonded funds. The proxy type explicitly excludes all balance-related and fund management extrinsics.
- **No delegation chains**: A `Staking Operator` proxy cannot create or remove other proxies. This prevents an operator from escalating their permissions or delegating access to additional accounts.
- **Time-delay proxies**: The `delay` parameter in `proxy.addProxy` allows the staker to configure a block delay on all proxy calls. During this delay window, the staker can cancel any pending call, providing an additional layer of oversight.
- **Pure proxy compatibility**: Pure proxy stash accounts can use the `Staking Operator` proxy in combination with Polkadot Hub's `stakingRcClient` pallet for session key management. This enables fully non-custodial setups where no single key controls the stash.
- **Revocable at any time**: The staker retains the ability to remove the `Staking Operator` proxy by calling `proxy.removeProxy`, immediately revoking all operator permissions.
- **Slashing risk remains**: While the operator cannot steal funds, improper session key management (such as running duplicate keys across nodes) can still lead to [equivocation slashing](/node-infrastructure/run-a-validator/staking-mechanics/offenses-and-slashes/){target=\_blank}. Stakers should verify that operators follow proper [key management practices](/node-infrastructure/run-a-validator/operational-tasks/general-management/#key-management){target=\_blank}.

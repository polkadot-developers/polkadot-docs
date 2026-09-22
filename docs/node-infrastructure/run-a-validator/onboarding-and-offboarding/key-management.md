---
title: Validator Key Management
description: Learn how to generate and manage validator keys, including session keys for consensus participation and node keys for maintaining a stable network identity.
categories: Infrastructure
---

# Key Management

## Introduction

After setting up your node environment as shown in the [Setup](/node-infrastructure/run-a-validator/onboarding-and-offboarding/set-up-validator/){target=\_blank} section, you'll need to configure multiple keys for your validator to operate properly. This includes setting up session keys, which are essential for participating in the consensus process, and configuring a node key that maintains a stable network identity. This guide walks you through the key management process, showing you how to generate, store, and register these keys.

## Set Session Keys

Setting up your validator's session keys is essential to associate your node with your stash account on the Polkadot network. Validators use session keys to participate in the consensus process. Your validator can only perform its role in the network by properly setting session keys which consist of several key pairs for different parts of the protocol (e.g., GRANDPA, BABE). These keys must be registered on-chain and associated with your validator node to ensure it can participate in validating blocks.

### Generate Session Keys

--8<-- 'text/node-infrastructure/generate-session-keys.md'

### Submit Transaction to Set Keys

After generating your session keys (and proof, if using runtime 2.2.0+), you must submit them on-chain. There are two paths for submitting session keys:

=== "Polkadot Hub (Recommended)"

    The recommended approach is to use the `stakingRcClient.set_keys` extrinsic on Polkadot Hub. This path is required for validators using pure proxy stash accounts or [Staking Operator proxies](/node-infrastructure/run-a-validator/operational-tasks/staking-operator-proxy/){target=\_blank}.

    === "Runtime 2.2.0+"

        1. In Polkadot.js Apps, connect to **Polkadot Hub** (Asset Hub).
        2. Navigate to **Developer > Extrinsics**.
        3. Select your stash account (or submit via proxy).
        4. Choose the **stakingRcClient** pallet and the **setKeys** extrinsic.
        5. Enter the following parameters:
            - **`keys`**: The session keys hex string returned by `author_rotateKeysWithOwner`.
            - **`proof`**: The proof hex string returned by `author_rotateKeysWithOwner`.
            - **`maxDeliveryAndRemoteExecutionFee`**: Optional maximum fee for the XCM message to the relay chain. Can be left as `None`.
        6. Submit and sign the transaction.

        ![](/images/node-infrastructure/run-a-validator/onboarding-and-offboarding/key-management/key-management-03.webp)

        Polkadot Hub validates the proof locally and forwards the keys to the relay chain via XCM.

    === "Pre-2.2.0"

        1. Go to [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} and connect to Polkadot Hub.
        2. Navigate to **Developer > Extrinsics**.
        3. Select the account that controls your validator (your stash or proxy account).
        4. Choose the **stakingRcClient** pallet and the **setKeys** extrinsic.
        5. Paste the hex-encoded session key string returned by `author_rotateKeys` into the **keys** field.
        6. Set the **proof** field to `0x` (empty proof).
        7. Submit the transaction.

    !!! note
        Setting session keys on Polkadot Hub requires a deposit of approximately 60 DOT (or ~2 KSM on Kusama). This deposit is only released when you call `stakingRcClient.purgeKeys` on Polkadot Hub — purging keys via the relay chain (`session.purgeKeys`) does not release this deposit.

=== "Relay Chain (Legacy)"

    You can also submit session keys directly on the relay chain using `session.setKeys`. **This path will be removed in a future runtime upgrade** (see [polkadot-fellows/runtimes#1212](https://github.com/polkadot-fellows/runtimes/pull/1212){target=\_blank}). Migrate to the Polkadot Hub path above.

    === "Runtime 2.2.0+"

        1. In Polkadot.js Apps, connect to the **relay chain**.
        2. Navigate to **Developer > Extrinsics**.
        3. Select your stash account.
        4. Choose the **session** pallet and the **setKeys** extrinsic.
        5. Enter the following parameters:
            - **`keys`**: The session keys hex string returned by `author_rotateKeysWithOwner`.
            - **`proof`**: The proof hex string returned by `author_rotateKeysWithOwner`.
        6. Submit and sign the transaction.

    === "Pre-2.2.0"

        1. Go to the **Network > Staking > Accounts** section on [Polkadot.js Apps](https://polkadot.js.org/apps/#/staking/actions){target=\_blank} connected to the relay chain.
        2. Select **Set Session Key** on the bonding account you generated earlier.
        3. Paste the hex-encoded session key string returned by `author_rotateKeys` (from the Polkadot.js Apps UI, curl, or Subkey) into the input field and submit the transaction.

    !!! warning "Removal planned"
        Both `session.setKeys` and `session.purgeKeys` on the relay chain will be **removed** in a future runtime upgrade ([polkadot-fellows/runtimes#1212](https://github.com/polkadot-fellows/runtimes/pull/1212){target=\_blank}). Migrate to the Polkadot Hub path: use `stakingRcClient.setKeys` to set keys and `stakingRcClient.purgeKeys` to purge them.

Once the transaction is signed and submitted, your session keys will be registered on-chain.

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`**: Checks if the node has a specific key by public key and key type.
- **`hasSessionKeys`**: Verifies if your node has the full session key string associated with the validator.

For example, you can [check session keys on the Polkadot.js Apps](https://polkadot.js.org/apps/#/rpc){target=\_blank} interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

## Set the Node Key

--8<-- 'text/node-infrastructure/generate-node-key.md:introduction'

Starting with Polkadot version 1.11, validators without a stable network key may encounter the following error on startup:

--8<-- 'code/node-infrastructure/run-a-validator/onboarding-and-offboarding/key-management/node-key-error-01.html'

### Generate the Node Key

--8<-- 'text/node-infrastructure/generate-node-key.md:commands'

### Set Node Key

After generating the node key, configure your node to use it by specifying the path to the key file when launching your node. Add the following flag to your validator node's startup command:

``` bash
polkadot --node-key-file INSERT_PATH_TO_NODE_KEY
```

Following these steps ensures that your node retains its identity, making it discoverable by peers without the risk of conflicting identities across sessions. For further technical background, see Polkadot SDK [Pull Request #3852](https://github.com/paritytech/polkadot-sdk/pull/3852){target=\_blank} for the rationale behind requiring static keys.

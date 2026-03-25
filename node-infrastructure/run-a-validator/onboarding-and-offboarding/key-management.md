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

!!! warning "Breaking change in runtime 2.2.0"
    Starting with runtime 2.2.0, session key generation uses the new `author_rotateKeysWithOwner` RPC, which requires your stash account as a parameter and returns both the session keys and a cryptographic proof of ownership. This proof must be included when submitting `set_keys`. The previous `author_rotateKeys` RPC and the Subkey approach are no longer supported for new key generation. If your validator already has session keys set on-chain and you are not rotating them, no action is required. These changes can already be tested on Westend.

### Generate Session Keys

Generate session keys by running the following command on your validator node, replacing `INSERT_STASH_ACCOUNT_ID` with your validator's stash account ID:

``` bash
curl -H "Content-Type: application/json" \
-d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeysWithOwner", "params":["INSERT_STASH_ACCOUNT_ID"]}' \
http://localhost:9944
```

This command returns a JSON object with two fields in the `result`: `keys` (the hex-encoded session keys) and `proof` (the ownership proof). Save both values for later use.

```json
{
  "jsonrpc": "2.0",
  "result": {
    "keys": "0xda3861a45e0197f3ca145c2c209f9126e5053fas503e459af4255cf8011d51010",
    "proof": "0x1a2b3c4d5e6f..."
  },
  "id": 1
}
```

!!! note "Subkey is no longer supported for session key generation"
    Previously, validators could generate session keys externally using `subkey` and manually insert them into the node's keystore. This approach is no longer viable because `set_keys` now requires a cryptographic proof of ownership — each private session key must sign the stash account ID. The only way to obtain this proof is through `author_rotateKeysWithOwner`, which handles key generation, keystore insertion, and proof generation in a single step. Validators who previously relied on `subkey` for session key generation should migrate to using `author_rotateKeysWithOwner` as described above.

!!! note "No RPC to generate proof for existing keys"
    There is currently no RPC endpoint to generate an ownership proof for session keys that are already in the node's keystore. To obtain a valid proof, you must rotate to new keys using `author_rotateKeysWithOwner`. Support for generating proofs from existing keys may be added in a future release.

### Submit Transaction to Set Keys

After generating your session keys and proof, you must submit them on-chain. There are two paths for submitting session keys:

=== "Polkadot Hub (Recommended)"

    The recommended approach is to use the `stakingRcClient.set_keys` extrinsic on Polkadot Hub. This path is required for validators using pure proxy stash accounts or [Staking Operator proxies](/node-infrastructure/run-a-validator/operational-tasks/staking-operator-proxy/){target=\_blank}.

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

    !!! note
        Setting session keys on Polkadot Hub requires a deposit of approximately 60 DOT (or ~2 KSM on Kusama). This deposit is only released when you call `stakingRcClient.purgeKeys` on Polkadot Hub — purging keys via the relay chain (`session.purgeKeys`) does not release this deposit.

=== "Relay Chain (Legacy)"

    You can also submit session keys directly on the relay chain using `session.setKeys`. This path will be deprecated in a future release.

    1. In Polkadot.js Apps, connect to the **relay chain**.
    2. Navigate to **Developer > Extrinsics**.
    3. Select your stash account.
    4. Choose the **session** pallet and the **setKeys** extrinsic.
    5. Enter the following parameters:
        - **`keys`**: The session keys hex string returned by `author_rotateKeysWithOwner`.
        - **`proof`**: The proof hex string returned by `author_rotateKeysWithOwner`.
    6. Submit and sign the transaction.

    !!! warning
        The relay chain `session.setKeys` path is legacy and will be deprecated. Use the Polkadot Hub path for new setups.

Once the transaction is signed and submitted, your session keys will be registered on-chain.

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`**: Checks if the node has a specific key by public key and key type.
- **`hasSessionKeys`**: Verifies if your node has the full session key string associated with the validator.

For example, you can [check session keys on the Polkadot.js Apps](https://polkadot.js.org/apps/#/rpc){target=\_blank} interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

## Set the Node Key

Validators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity. This key ensures that your validator can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.

Starting with Polkadot version 1.11, validators without a stable network key may encounter the following error on startup:

--8<-- 'code/node-infrastructure/run-a-validator/onboarding-and-offboarding/key-management/node-key-error-01.html'

### Generate the Node Key

Use one of the following methods to generate your node key:

=== "Save to file"

    The recommended solution is to generate a node key and save it to a file using the following command:

    ``` bash
    polkadot key generate-node-key --file INSERT_PATH_TO_NODE_KEY
    ```
    
=== "Use default path"

    You can also generate the node key with the following command, which will automatically save the key to the base path of your node:

    ``` bash
    polkadot key generate-node-key --default-base-path
    ```

Save the file path for reference. You will need it in the next step to configure your node with a static identity.

### Set Node Key

After generating the node key, configure your node to use it by specifying the path to the key file when launching your node. Add the following flag to your validator node's startup command:

``` bash
polkadot --node-key-file INSERT_PATH_TO_NODE_KEY
```

Following these steps ensures that your node retains its identity, making it discoverable by peers without the risk of conflicting identities across sessions. For further technical background, see Polkadot SDK [Pull Request #3852](https://github.com/paritytech/polkadot-sdk/pull/3852){target=\_blank} for the rationale behind requiring static keys.

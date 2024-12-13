---
title: Execute a Runtime Upgrade
description: Learn how to perform forkless runtime upgrades on a Polkadot SDK-based blockchain. Add features and modify parameters without network disruption.
---

# Execute a Runtime Upgrade

## Introduction

In the previous tutorial, you learned how to add pallets to the runtime and spin up your custom chain locally. Building upon that knowledge, this tutorial takes you a step further by demonstrating how to upgrade a runtime in a live, running network without interrupting its operations.

One of the key advantages of the Polkadot SDK development framework is its support for forkless upgrades to the blockchain runtime, which forms the core logic of the chain. Unlike many other blockchains, where introducing new features or improving existing ones often requires a hard fork, Polkadot SDK enables seamless upgrades even when introducing breaking changes—without disrupting the network's operation.

Polkadot SDK's design incorporates the runtime directly into the blockchain's state, allowing participants to upgrade the runtime by calling the `set_code` function within a transaction. This mechanism ensures that updates are validated using the blockchain's consensus and cryptographic guarantees, allowing runtime logic to be updated or extended without forking the chain or requiring a new blockchain client.

In this tutorial, you'll learn how to upgrade the runtime of a Polkadot SDK-based blockchain without stopping the network or creating a fork. 

You'll make the following changes to a running network's runtime:

- Increase the `spec_version`
- Increase the minimum balance for network accounts
- Update the counter max value

By the end of this tutorial, you’ll have the skills to upgrade the runtime and submit a transaction to deploy the modified runtime on a live network.

## Start the Node

To demonstrate how to update a running node, you first need to start the local node with the current runtime.

1. Navigate to the root directory where you compiled the Polkadot SDK Parachain Template
   
2. Start the local node in development mode by running the following command:
    ```bash
    polkadot-omni-node --chain ./chain_spec.json --dev
    ```

    !!!note
        Keep the node running throughout this tutorial. You can modify and re-compile the runtime without stopping or restarting the node.

3. Connect to your node using the same steps outlined in the [Interact with the Node](/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template#interact-with-the-node){target=\_blank} section. Once connected, you’ll notice the node template is using the default version, `1`, displayed in the upper left

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/execute-runtime-upgrade/execute-runtime-upgrade-1.webp)

## Modify the Runtime

You can modify your runtime extensively, including adding pallets or changing runtime constants. In this example, you'll just modify two runtime constants for simplicity.

### Update Maximum Counter Value

In the `runtime/src/config/mod.rs` file, modify the `CounterMaxValue` constant from `100` to `500`:

```rust hl_lines="3"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/execute-runtime-upgrade/config-mod.rs:321:324'
```

### Update Existential Deposit

To update the `EXISTENTIAL_DEPOSIT` in the Balances pallet, locate the constant in the `runtime/src/lib.rs` file and double its value:

```rust hl_lines="2"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/execute-runtime-upgrade/lib.rs:204:205'
```

!!!note
    This change increases the minimum balance required for accounts to remain active. No accounts with balances between `MILLI_UNIT` and `MILLI_UNIT * 2` will be removed. For account removal, a storage migration is needed. See [Storage Migration](/develop/parachains/maintenance/storage-migrations){target=\_blank} for details.

### Update Runtime Version

Locate the `runtime_version` macro and increment the `spec_version` field from `1` to `2`:

```rust hl_lines="6"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/execute-runtime-upgrade/lib.rs:166:176'
```

### Recompile the Runtime

Once you've made all the necessary changes, recompile the runtime by running:

```bash
cargo build --release
```

The build artifacts will be output to the `target/release` directory. The Wasm build artifacts can be found in the `target/release/wbuild/parachain-template-runtime` directory. You should see the following files:

- `parachain_template_runtime.compact.compressed.wasm`
- `parachain_template_runtime.compact.wasm`
- `parachain_template_runtime.wasm`

## Execute the Runtime Upgrade

Now that you've generated the Wasm artifact for your modified runtime, it's time to upgrade the running network. This process involves submitting a transaction to load the new runtime logic.

### Understand Runtime Upgrades

#### Authorization with Sudo

In production networks, runtime upgrades typically require community approval through governance. For this tutorial, the Sudo pallet will be used to simplify the process. The Sudo pallet allows a designated account (usually Alice in development environments) to perform privileged operations, including runtime upgrades.

#### Resource Accounting

Runtime upgrades use the `set_code` extrinsic, which is designed to consume an entire block's resources. This design prevents other transactions from executing on different runtime versions within the same block. The `set_code` extrinsic is classified as an Operational call, one of the variants of the [`DispatchClass`](https://paritytech.github.io/polkadot-sdk/master/frame_support/dispatch/enum.DispatchClass.html#){target=\_blank} enum. This classification means it:

- Can use a block's entire weight limit
- Receives maximum priority
- Is exempt from transaction fees

To bypass resource accounting safeguards, the `sudo_unchecked_weight` extrinsic will be used. This allows you to specify a weight of zero, ensuring the upgrade process has unlimited time to complete.

### Perform the Upgrade

Follow these steps to update your network with the new runtime:

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2Flocalhost%3A9944#/explorer){target=_blank} in your web browser and make sure you are connected to your local node

2. Navigate to the **Developer** dropdown and select the **Extrinsics** option

    TODO: Add image
    ![](TODO: Add image)

3. Construct the `set_code` extrinsic call:

    1. Select the **`sudo`** pallet
    2. Choose the **`sudoUncheckedWeight`** extrinsic
    3. Select the **`system`** pallet
    4. Choose the **`setCode`** extrinsic
    5. Fill in the parameters:
        - **`code`** - the new runtime code

            !!!note
                You can click the **file upload toggle** to upload a file instead of copying the hex string value.

        - **`weight`** - leave both parameters set to the default value of `0`

    6. Click on **Submit Transaction**

    TODO: Add image
    ![](TODO: Add image)

4. Review the transaction details and click **Sign and Submit** to confirm the transaction

    TODO: Add image
    ![](TODO: Add image)


## Verify the Upgrade

Follow these steps to ensure the runtime upgrade was applied:

### Runtime Version Change

Verify that the runtime version of your blockchain has been updated successfully. 

1. Navigate to the **Network** dropdown and select the **Explorer** option
   
    TODO: Add image
    ![](TODO: Add image)
   
2. After the transaction is included in a block, check:
    1.  There has been a successful `sudo.Sudid` event
    2.  The indicator shows that the runtime version is now `2`

    TODO: Add image
    ![](TODO: Add image)

### Constants Updates

Check the updated existential deposit and counter max value constants on your blockchain. Follow these steps to query and verify the new values:

1. Navigate to the **Developer** dropdown and select the **Chain State** option

    TODO: Add image
    ![](TODO: Add image)

2. Check the constants values:

    - Query the existential deposit value:
        1. Click on the **Constants** tab 
        2. Select the **`balances`** pallet
        3. Choose the **`existentialDeposit`** constant
        4. Click the **+** button to execute the query
        5. Check the existential deposit value

        TODO: Add image
        ![](TODO: Add image)
        
     - Query the counter max value:

        TODO: Add image
        ![](TODO: Add image)

## Where to Go Next

TODO

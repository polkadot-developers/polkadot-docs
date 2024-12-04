---
title: Upgrade a Running Network
description: Learn how to perform forkless runtime upgrades on a Polkadot SDK-based blockchain. Add features and modify parameters without network disruption.
---

# Upgrade a Running Network

## Introduction

One of the key advantages of the Polkadot SDK development framework is its support for forkless upgrades to the blockchain runtime, which forms the core logic of the chain. Unlike many other blockchains, where introducing new features or improving existing ones often requires a hard fork, Polkadot SDK enables seamless upgrades even when introducing breaking changes—without disrupting the network's operation.

Polkadot SDK's design incorporates the runtime directly into the blockchain's state, allowing participants to upgrade the runtime by calling the `set_code` function within a transaction. This mechanism ensures that updates are validated using the blockchain's consensus and cryptographic guarantees, allowing runtime logic to be updated or extended without forking the chain or requiring a new blockchain client.

In this tutorial, you'll learn how to upgrade the runtime of a Polkadot SDK-based blockchain without stopping the network or creating a fork. 

You'll make the following changes to a running network node's runtime:

- Increase the `spec_version`
- Add the Utility pallet
- Increase the minimum balance for network accounts

By the end of this tutorial, you’ll have the skills to upgrade the runtime and submit a transaction to deploy the modified runtime on a live network.

## Prerequisites

Before starting this tutorial, ensure you meet the following requirements:

- Installed and configured Rust on your system. Refer to the [Installation](/develop/parachains/get-started/install-polkadot-sdk){target=\_blank} guide for detailed instructions on installing Rust and setting up your development environment
- Completed the [Launch a Local Solochain](/tutorials/polkadot-sdk/parachains/local-chain/launch-a-local-solochain/){target=\_blank} tutorial and have the [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} installed on your machine

## Start the Node

To demonstrate how to update a running node, you first need to start the local node with the current runtime.

1. Navigate to the root directory where you compiled the Polkadot SDK Solochain Template
   
2. Start the local node in development mode by running the following command:
    ```bash
    ./target/release/solochain-template-node --dev
    ```

    !!!note
        Keep the node running throughout this tutorial. You can modify and re-compile the runtime without stopping or restarting the node.

3. Connect to your node using the same steps outlined in the [Interact with the Node](/tutorials/polkadot-sdk/parachains/local-chain/launch-a-local-solochain//#interact-with-the-node){target=\_blank} section. Once connected, you’ll notice the node template is using the default version, `100`, displayed in the upper left

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-1.webp)

## Modify the Runtime

### Add the Utility Pallet to the Dependencies

First, you'll update the `Cargo.toml` file to include the Utility pallet as a dependency for the runtime. Follow these steps:

1. Open the `runtime/Cargo.toml` file and locate the `[dependencies]` section. Add the Utility pallet by inserting the following line:

    ```toml
    pallet-utility = { version = "37.0.0", default-features = false}
    ```

    Your `[dependencies]` section should now look something like this:

    ```toml
    [dependencies]
    codec = { features = ["derive"], workspace = true }
    scale-info = { features = ["derive", "serde"], workspace = true }
    frame-support = { features = ["experimental"], workspace = true }
    ...
    pallet-utility = { version = "37.0.0", default-features = false }
    ```

2. In the `[features]` section, add the Utility pallet to the `std` feature list by including:
    ```toml
    [features]
    default = ["std"]
    std = [
        "codec/std",
        "scale-info/std",
        "frame-executive/std",
        ...
        "pallet-utility/std",
    ]
    ```

3. Save the changes and close the `Cargo.toml` file

### Update the Runtime Configuration

You'll now modify the `runtime/src/lib.rs` file to integrate the Utility pallet and make other necessary changes. In this section, you'll configure the Utility pallet by implementing its `Config` trait, update the runtime macro to include the new pallet, adjust the `EXISTENTIAL_DEPOSIT` value, and increment the runtime version.

#### Configure the Utility Pallet

To configure the Utility pallet, take the following steps:

1. Implement the [`Config`](https://paritytech.github.io/polkadot-sdk/master/pallet_utility/pallet/trait.Config.html){target=\_blank} trait for the Utility pallet:

    ```rust
    ...
    /// Configure the pallet-template in pallets/template
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk-solochain-template/refs/tags/v0.0.2/runtime/src/lib.rs:251:251'
        ...
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk-solochain-template/refs/tags/v0.0.2/runtime/src/lib.rs:254:254'

    // Add here after all the other pallets implementations
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/v1.16.2-rc1/substrate/bin/node/runtime/src/lib.rs:334:339'
    ...
    ```

2. Locate the `#[frame_support::runtime]` macro and add the Utility pallet:

    ```rust
     --8<-- 'code/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/fs-runtime-macro.rs'
    ```

#### Update Existential Deposit Value

To update the `EXISTENTIAL_DEPOSIT` in the Balances pallet, locate the constant and set the value to `1000`:

```rust
...
/// Existential deposit
pub const EXISTENTIAL_DEPOSIT: u128 = 1000;
...
```

!!!note
    This change increases the minimum balance required for accounts to remain active. No accounts with balances between `500` and `1000` will be removed. For account removal, a storage migration is needed. See [Storage Migration](/develop/parachains/maintenance/storage-migrations){target=\_blank} for details.

#### Update Runtime Version

Locate the `runtime_version` macro and increment the `spec_version` field from `100` to `101`:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/runtime-version-macro.rs'
```

### Recompile the Runtime

Once you've made all the necessary changes, recompile the runtime by running:

```bash
cargo build --release
```

The build artifacts will be output to the `target/release` directory. The Wasm build artifacts can be found in the `target/release/wbuild/solochain-template-runtime` directory. You should see the following files:

- `solochain_template_runtime.compact.compressed.wasm`
- `solochain_template_runtime.compact.wasm`
- `solochain_template_runtime.wasm`

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

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-2.webp)

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

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-3.webp)

4. Review the transaction details and click **Sign and Submit** to confirm the transaction

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-4.webp)

### Verify the Upgrade

#### Runtime Version Change

Verify that the runtime version of your blockchain has been updated successfully. Follow these steps to ensure the upgrade was applied:

1. Navigate to the **Network** dropdown and select the **Explorer** option
   
    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-5.webp)
   
2. After the transaction is included in a block, check:
    1.  There has been a successful `sudo.Sudid` event
    2.  The indicator shows that the runtime version is now `101`

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-6.webp)

#### Utility Pallet Addition

In the **Extrinsics** section, you should see that the Utility pallet has been added as an option.

![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-7.webp)

#### Existential Deposit Update

Check the updated existential deposit value on your blockchain. Follow these steps to query and verify the new value:

1. Navigate to the **Developer** dropdown and select the **Chain State** option

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-8.webp)

2.  Query the existential deposit value
    1. Click on the **Constants** tab 
    2. Select the **`balances`** pallet
    3. Choose the **`existentialDeposit`** constant
    4. Click the **+** button to execute the query
    5. Check the existential deposit value

    ![](/images/tutorials/polkadot-sdk/parachains/local-chain/upgrade-a-running-network/upgrade-a-running-network-9.webp)
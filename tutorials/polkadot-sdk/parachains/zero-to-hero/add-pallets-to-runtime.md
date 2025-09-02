---
title: Add Pallets to the Runtime
description: Add pallets to your runtime for custom functionality. Learn to configure and integrate pallets in Polkadot SDK-based blockchains.
tutorial_badge: Beginner
categories: Basics, Parachains
---

# Add Pallets to the Runtime

## Introduction

In previous tutorials, you learned how to [create a custom pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} and [test it](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/){target=\_blank}. The next step is to include this pallet in your runtime, integrating it into the core logic of your blockchain.

This tutorial will guide you through adding two pallets to your runtime: the custom pallet you previously developed and the [utility pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_utility/index.html){target=\_blank}. This standard Polkadot SDK pallet provides powerful dispatch functionality. The utility pallet offers, for example, batch dispatch, a stateless operation that enables executing multiple calls in a single transaction.

## Add the Pallets as Dependencies

First, you'll update the runtime's `Cargo.toml` file to include the Utility pallet and your custom pallets as dependencies for the runtime. Follow these steps:

1. Open the `runtime/Cargo.toml` file and locate the `[dependencies]` section. Add pallet-utility as one of the features for the `polkadot-sdk` dependency with the following line:

    ```toml hl_lines="4" title="runtime/Cargo.toml"
    --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/runtime/Cargo.toml:19:19'
    ...
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/Cargo.toml:26:27'
        ...
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/Cargo.toml:55:55'
    ```

2. In the same `[dependencies]` section, add the custom pallet that you built from scratch with the following line:

    ```toml hl_lines="3" title="Cargo.toml"
    --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/runtime/Cargo.toml:19:19'
    ...
    --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/runtime/Cargo.toml:30:30'
    ```

3. In the `[features]` section, add the custom pallet to the `std` feature list:

    ```toml hl_lines="5" title="Cargo.toml"
    --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/runtime/Cargo.toml:32:34'
      ...
      --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/runtime/Cargo.toml:43:43'
      ...
    ]
    ```

3. Save the changes and close the `Cargo.toml` file.

    Once you have saved your file, it should look like the following:

    ???- code "runtime/Cargo.toml"
        
        ```rust title="runtime/Cargo.toml"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/Cargo.toml'
        ```

Update your root parachain template's `Cargo.toml` file to include your custom pallet as a dependency. Follow these steps:

1. Open the `./Cargo.toml` file and locate the `[workspace]` section. 
    
    Make sure the `custom-pallet` is a member of the workspace:

    ```toml hl_lines="4" title="Cargo.toml"
     --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/Cargo.toml:8:14'
    ```

???- code "./Cargo.toml"

    ```rust title="./Cargo.toml"
    --8<-- 'https://raw.githubusercontent.com/papermoonio/zero-to-hero-tutorial/refs/heads/v0.0.4-complete-tutorial/Cargo.toml'
    ```


### Update the Runtime Configuration

Configure the pallets by implementing their `Config` trait and update the runtime macro to include the new pallets:

1. Add the `OriginCaller` import:

    ```rust title="mod.rs" hl_lines="8"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/configs/mod.rs:59:60'
    ...
    ```

2. Implement the [`Config`](https://paritytech.github.io/polkadot-sdk/master/pallet_utility/pallet/trait.Config.html){target=\_blank} trait for both pallets at the end of the `runtime/src/config/mod.rs` file:

    ```rust title="mod.rs" hl_lines="8-25"
    ...
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/configs/mod.rs:320:332'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/configs/mod.rs:334:342'
    }
    ```

3. Locate the `#[frame_support::runtime]` macro in the `runtime/src/lib.rs` file and add the pallets:

    ```rust hl_lines="9-14" title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/lib.rs:256:259'
            ...
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/lib.rs:270:271'

    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/lib.rs:320:324'
    }
    ```

## Recompile the Runtime

After adding and configuring your pallets in the runtime, the next step is to ensure everything is set up correctly. To do this, recompile the runtime with the following command (make sure you're in the project's root directory):

```bash
cargo build --release
```

This command ensures the runtime compiles without errors, validates the pallet configurations, and prepares the build for subsequent testing or deployment.

## Run Your Chain Locally

Launch your parachain locally and start producing blocks:

!!!tip
    Generated chain TestNet specifications include development accounts "Alice" and "Bob." These accounts are pre-funded with native parachain currency, allowing you to sign and send TestNet transactions. Take a look at the [Polkadot.js Accounts section](https://polkadot.js.org/apps/#/accounts){target=\_blank} to view the development accounts for your chain.

1. Create a new chain specification file with the updated runtime:

    ```bash
    chain-spec-builder create -t development \
    --relay-chain paseo \
    --para-id 1000 \
    --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    named-preset development
    ```

2. Start the omni node with the generated chain specification:

    ```bash
    polkadot-omni-node --chain ./chain_spec.json --dev
    ```

3. Verify you can interact with the new pallets using the [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/extrinsics){target=\_blank} interface. Navigate to the **Extrinsics** tab and check that you can see both pallets:

    - Utility pallet

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/add-pallets-to-runtime-1.webp)
    

    - Custom pallet

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/add-pallets-to-runtime-2.webp)

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy on Paseo TestNet__

    ---

    Deploy your Polkadot SDK blockchain on Paseo! Follow this step-by-step guide for a seamless journey to a successful TestNet deployment.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/)

-   <span class="badge tutorial">Tutorial</span> __Pallet Benchmarking (Optional)__

    ---

    Discover how to measure extrinsic costs and assign precise weights to optimize your pallet for accurate fees and runtime performance.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/)

</div>

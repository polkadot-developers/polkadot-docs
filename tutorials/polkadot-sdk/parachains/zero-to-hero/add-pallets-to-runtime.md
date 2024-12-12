---
title: Add Pallets to the Runtime
description: TODO
---

# Add Pallets to the Runtime

## Introduction

In previous tutorials, you learnt how to create a custom pallet, how to test it and how to benchmark it. Now, you have to include this pallet in your runtime so it becomes part of the logic of your chain.

In this tutorial you will add to your runtime two pallets, the custom one that you created before, and an existing one called utility pallet that provides utilities such as Batch dispatch: A stateless operation, allowing any origin to execute multiple calls in a single dispatch. This can be useful to amalgamate proposals, combining set_code with corresponding set_storages, for efficient multiple payouts with just a single signature verify, or in combination with one of the other two dispatch functionality.

## Add the Pallets as Dependencies

First, you'll update the runtime's `Cargo.toml` file to include the Utility pallet and your custom pallets as dependencies for the runtime. Follow these steps:

1. Open the `runtime/Cargo.toml` file and locate the `[dependencies]` section. Add the pallets by inserting the following lines:

    ```toml hl_lines="3-4"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/Cargo.toml:19:19'
    ...
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/Cargo.toml:74:75'
    ```

2. In the `[features]` section, add the pallets to the `std` feature list by including:
    ```toml hl_lines="5-6"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/Cargo.toml:77:79'
        ...
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/Cargo.toml:132:133'
    ```

3. Save the changes and close the `Cargo.toml` file

### Update the Runtime Configuration

In this section, you'll configure the pallets by implementing their `Config` trait and update the runtime macro to include the new pallets.

To perform this, take the following steps:

1. Implement the [`Config`](https://paritytech.github.io/polkadot-sdk/master/pallet_utility/pallet/trait.Config.html){target=\_blank} for both pallets at the end of the `runtime/src/config/mod.rs` file:

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/config-mod.rs:312'
    ```

2. Locate the `#[frame_support::runtime]` macro in the `runtime/src/lib.rs` file and add the pallets:

    ```rust hl_lines="5-9"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/lib.rs:250:252'
    ...
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/lib.rs:312:317'
    ```

## Recompile the Runtime
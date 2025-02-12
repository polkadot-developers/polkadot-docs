---
title: Build a Custom Pallet
description: Learn how to build a custom pallet for Polkadot SDK-based blockchains with this step-by-step guide. Create and configure a simple counter pallet from scratch.
---

# Build a Custom Pallet

## Introduction

In Polkadot SDK-based blockchains, runtime functionality is built through modular components called [pallets](/polkadot-protocol/glossary#pallet){target=\_blank}. These pallets are Rust-based runtime modules created using [FRAME (Framework for Runtime Aggregation of Modular Entities)](/develop/parachains/customize-parachain/overview/){target=\_blank}, a powerful library that simplifies blockchain development by providing specialized macros and standardized patterns for building blockchain logic.
A pallet encapsulates a specific set of blockchain functionalities, such as managing token balances, implementing governance mechanisms, or creating custom state transitions.

In this tutorial, you'll learn how to create a custom pallet from scratch. You will develop a simple counter pallet with the following features:

- Users can increment and decrement a counter
- Only a [root origin](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/type.Origin.html#variant.Root){target=\_blank} can set an arbitrary counter value

## Prerequisites

You'll use the [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk/tree/master/templates/parachain){target=\_blank} created in the [Set Up a Template](/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/){target=\_blank} tutorial. 

## Create a New Project

In this tutorial, you'll build a custom pallet from scratch to demonstrate the complete workflow, rather than starting with the pre-built `pallet-template`. The first step is to create a new Rust package for your pallet:

1. Navigate to the `pallets` directory in your workspace:

    ```bash
    cd pallets
    ```

2. Create a new Rust library project for your custom pallet by running the following command:

    ```bash
    cargo new --lib custom-pallet
    ```

3. Enter the new project directory:

    ```bash
    cd custom-pallet
    ```

4. Ensure the project was created successfully by checking its structure. The file layout should resemble the following:

    ```
    custom-pallet 
    ├── Cargo.toml
    └── src
        └── lib.rs
    ```

    If the files are in place, your project setup is complete, and you're ready to start building your custom pallet.

## Add Dependencies

To build and integrate your custom pallet into a Polkadot SDK-based runtime, you must add specific dependencies to the `Cargo.toml` file of your pallet's project. These dependencies provide essential modules and features required for pallet development. Since your custom pallet is part of a workspace that includes other components, such as the runtime, the configuration must align with the workspace structure. Follow the steps below to set up your `Cargo.toml` file properly:

1. Open your `Cargo.toml` file

2. Add the required dependencies in the `[dependencies]` section:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:10:14'
    ```

3. Enable `std` features:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:22:28'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:30:30'
    ```

The final `Cargo.toml` file should resemble the following:

??? code "Cargo.toml"

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml::14'

    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:22:28'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:30:30'
    ```

## Implement the Pallet Logic

In this section, you will construct the core structure of your custom pallet, starting with setting up its basic scaffold. This scaffold acts as the foundation, enabling you to later add functionality such as storage items, events, errors, and dispatchable calls.

### Add Scaffold Pallet Structure

You now have the bare minimum of package dependencies that your pallet requires specified in the `Cargo.toml` file. The next step is to prepare the scaffolding for your new pallet.

1. Open `src/lib.rs` in a text editor and delete all the content
   
2. Prepare the scaffolding for the pallet by adding the following:

    ```rust title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:20:23'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:36:47'
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:57:57'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:218:218'
    ```

3. Verify that it compiles by running the following command:

    ```bash
    cargo build --package custom-pallet
    ```

### Pallet Configuration

Implementing the `#[pallet::config]` macro is mandatory and sets the module's dependency on other modules and the types and values specified by the runtime-specific settings.

In this step, you will configure two essential components that are critical for the pallet's functionality:

- **`RuntimeEvent`** - since this pallet emits events, the [`RuntimeEvent`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html#associatedtype.RuntimeEvent){target=\_blank} type is required to handle them. This ensures that events generated by the pallet can be correctly processed and interpreted by the runtime

- **`CounterMaxValue`** - a constant that sets an upper limit on the value of the counter, ensuring that the counter remains within a predefined range

Add the following `Config` trait definition to your pallet:

```rust title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:45:53'
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:57:57'
```

### Add Events

Events allow the pallet to communicate with the outside world by emitting signals when specific actions occur. These events are critical for transparency, debugging, and integration with external systems such as UIs or monitoring tools.

Below are the events defined for this pallet:

- **`CounterValueSet`** - is emitted when the counter is explicitly set to a new value. This event includes the counter's updated value

- **`CounterIncremented`** - is emitted after a successful increment operation. It includes:

    - The new counter value
    - The account responsible for the increment
    - The amount by which the counter was incremented

- **`CounterDecremented`** - is emitted after a successful decrement operation. It includes:

    - The new counter value
    - The account responsible for the decrement
    - The amount by which the counter was decremented

Define the events in the pallet as follows:

```rust title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:59:85'
```

### Add Storage Items

Storage items are used to manage the pallet's state. This pallet defines two items to handle the counter's state and user interactions:

- **`CounterValue`** - a single storage value that keeps track of the current value of the counter. This value is the core state variable manipulated by the pallet's functions

- **`UserInteractions`** - a storage map that tracks the number of times each account interacts with the counter
  
Define the storage items as follows:

```rust title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:87:93'
```

### Implement Custom Errors

The `#[pallet::error]` macro defines a custom `Error` enum to handle specific failure conditions within the pallet. Errors help provide meaningful feedback to users and external systems when an extrinsic cannot be completed successfully. They are critical for maintaining the pallet's clarity and robustness.

To add custom errors, use the `#[pallet::error]` macro to define the `Error` enum. Each variant represents a unique error that the pallet can emit, and these errors should align with the logic and constraints of the pallet. 

Add the following errors to the pallet:

```rust title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:95:105'
```

### Implement Calls

The `#[pallet::call]` macro defines the dispatchable functions (or calls) the pallet exposes. These functions allow users or the runtime to interact with the pallet's logic and state. Each call includes comprehensive validations, modifies the state, and optionally emits events to signal successful execution.

The structure of the dispatchable calls in this pallet is as follows:

```rust title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:107:116'
    #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:118:118'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:133:133'

    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:135:142'
    #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:144:144'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:177:177'

    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:179:186'
    #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:188:188'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:216:216'
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:217:217'
```

Expand the following items to view the implementations of each dispatchable call in this pallet.

???- code "set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult"
    This call sets the counter to a specific value. It is restricted to the Root origin, meaning it can only be invoked by privileged users or entities.

    - **Parameters**:
        - `new_value` - the value to set the counter to
    - **Validations**:
        - The new value must not exceed the maximum allowed counter value (`CounterMaxValue`)
    - **Behavior**:
        - Updates the `CounterValue` storage item
        - Emits a `CounterValueSet` event on success

    ```rust title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:109:116'
    #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:118:133'
    ```

???- code "increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult"
    This call increments the counter by a specified amount. It is accessible to any signed account.

    - **Parameters**:
        - `amount_to_increment` - the amount to add to the counter
    - **Validations**:
        - Prevents overflow during the addition
        - Ensures the resulting counter value does not exceed `CounterMaxValue`
    - **Behavior**:
        - Updates the `CounterValue` storage item
        - Tracks the number of interactions by the user in the `UserInteractions` storage map
        - Emits a `CounterIncremented` event on success

    ```rust title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:135:142'
    #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:144:177'
    ```

???- code "decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult"
    This call decrements the counter by a specified amount. It is accessible to any signed account.

    - **Parameters**:
        - `amount_to_decrement` - the amount to subtract from the counter
    - **Validations**:
        - Prevents underflow during the subtraction
        - Ensures the counter does not drop below zero
    - **Behavior**:
        - Updates the `CounterValue` storage item
        - Tracks the number of interactions by the user in the `UserInteractions` storage map
        - Emits a `CounterDecremented` event on success

    ```rust title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:179:186'
    #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:188:216'
    ```

## Verify Compilation

After implementing all the pallet components, verifying that the code still compiles successfully is crucial. Run the following command in your terminal to ensure there are no errors:

```bash
cargo build --package custom-pallet
```

If you encounter any errors or warnings, carefully review your code to resolve the issues. Once the build is complete without errors, your pallet implementation is ready.

## Key Takeaways

In this tutorial, you learned how to create a custom pallet by defining storage, implementing errors, adding dispatchable calls, and emitting events. These are the foundational building blocks for developing robust Polkadot SDK-based blockchain logic.

Expand the following item to review this implementation and the complete pallet code.

???- code "src/lib.rs"

    ```rust title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:20:23'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:36:53'
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:57:116'
            #[pallet::weight(0)]
            --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:118:142'
            #[pallet::weight(0)]
            --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:144:186'
            #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:188'
    ```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Pallet Unit Testing__

    ---

    Learn to write effective unit tests for Polkadot SDK pallets! Use a custom pallet as a practical example in this comprehensive guide.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/)

</div>

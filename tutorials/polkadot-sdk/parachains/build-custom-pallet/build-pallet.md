---
title: Build Pallet
description: TODO
---

# Build Pallet

## Introduction

In Polkadot SDK-based blockchains, runtime functionality is built through modular components called pallets. These pallets are Rust-based runtime modules created using FRAME (Framework for Runtime Aggregation of Modular Entities), a powerful library that simplifies blockchain development by providing specialized macros and standardized patterns for building blockchain logic.
A pallet encapsulates a specific set of blockchain functionalities, such as managing token balances, implementing governance mechanisms, or creating custom state transitions.

In this tutorial, you'll create a simple counter pallet with the following features:

- Users can increment and decrement the counter
- Only a root origin can set an arbitrary counter value

You'll use the [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank}, a pre-configured blockchain template that provides a functional development environment.

After this guide, you'll learn how to create a custom pallet from scratch.

## Prerequisites

To set up your development environment for the Polkadot SDK, you'll need:

- Rust installation - the node template is written in [Rust](https://www.rust-lang.org/){target=\_blank}. Install it by folloing the [Installation](/develop/parachains/get-started/install-polkadot-sdk){target=\_blank} guide for step-by-step instructions on setting up your development environment

## Download and Compile the Node Template

The [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} provides a ready-to-use development environment for building using the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank}. Follow these steps to compile the node:

1. Clone the repository:
    ```bash
    git clone -b {{dependencies.polkadot_sdk_solochain_template.version}} {{dependencies.polkadot_sdk_solochain_template.repository_url}}
    ```

    !!!note
        Ensure you're using the version `{{dependencies.polkadot_sdk_solochain_template.version}}` of the Polkadot SDK Solochain Template to be able to follow this tutorial step by step.

2. Navigate to the project directory:
    ```bash
    cd polkadot-sdk-solochain-template
    ```

3. Compile the node template:
    ```bash
    cargo build --release
    ```

    !!!note
        Initial compilation may take several minutes, depending on your machine specifications. Use the `--release` flag for optimized artifacts.

4. Verify successful compilation by checking the output is similar to:
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/compilation-output.html'

## Create a New Project

Because this workshop is all about demonstrating the full workflow for creating a new custom pallet you won't start with the pallet-template. Instead, the first step is to create a new Rust package for the pallet you'll be building.

To create a project:

1. Change to the `pallets` directory in your workspace:

    ```bash
    cd pallets
    ```

2. Create a new Rust lib project for the pallet by running the following command:

    ```bash
    cargo new --lib custom-pallet
    ```

3. Change to the `custom-pallet` directory by running the following command:

    ```bash
    cd custom-pallet
    ```

4. Check that the project was created succesfully

    The file structure should look like this:

    ```
    ├── Cargo.toml
    └── src
        └── lib.rs
    ```

## Add Dependencies

The pallet that you'll build is going to be part of a Polkadot SDK-based runtime. Because of this, you need to include some modules it depends on in the `Cargo.toml` file. Your pallet is part of the runtimes workspace, so:

1. Open your `Cargo.toml` file

2. Add the following dependencies:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/Cargo.toml:10:18'
    ```

3. Add the `std` features to these packages

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/Cargo.toml:20:27'
    ```

4. Check that your `Cargo.toml` file looks like this:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/Cargo.toml'
    ```

## Build the Pallet

### Add Scaffold Pallet Structure

You now have the bare minimum of package dependencies that your pallet requires specified in the `Cargo.toml` file. The next step is to prepare the scaffolding for your new pallet.

1. Open `src/lib.rs` in a text editor and delete all the content
   
2. Prepare the scaffolding for the pallet by adding the following:

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/scaffold.rs'
    ```

3. Verify that it compiles by running the following command:

    ```bash
    cargo build --package custom-pallet
    ```

### Pallet Configuration

The implementation of the `#[pallet::config]` macro is mandatory and sets the module's dependency on other modules and the types and values specified by the runtime-specific settings.

In this step, you will configure two essential components that are critical for the pallet's functionality:

- **RuntimeEvent** - since this pallet emits events, the `RuntimeEvent` type is required to handle them. This ensures that events generated by the pallet can be correctly processed and interpreted by the runtime

- **CounterMaxValue** - a constant that sets an upper limit on the value of the counter, ensuring that the counter remains within a predefined range

Add the following `Config` trait definition to your pallet:

```rust
#[pallet::config]
pub trait Config: frame_system::Config {
    /// Event definition
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    // Defines the maximum value the counter can hold
    #[pallet::constant]
    type CounterMaxValue: Get<u32>;
}
```

### Add Events

Events provide a way for the pallet to communicate with the outside world by emitting signals when specific actions occur. These events are critical for transparency, debugging, and integrating with external systems such as UIs or monitoring tools.

Below are the events defined for this pallet:

- **CounterValueSet** - emitted when the counter is explicitly set to a new value. This event includes the updated value of the counter.

- **CounterIncremented** - emitted after a successful increment operation. It includes:

    - The new counter value
    - The account responsible for the increment
    - The amount by which the counter was incremented

**CounterDecremented** - emitted after a successful decrement operation. It includes:

    - The new counter value
    - The account responsible for the decrement
    - The amount by which the counter was decremented

Define the events in the pallet as follows:

```rust
#[pallet::event]
#[pallet::generate_deposit(pub(super) fn deposit_event)]
pub enum Event<T: Config> {
    CounterValueSet {
        /// The new value set.
        counter_value: u32,
    },
    /// A user has successfully incremented the counter.
    CounterIncremented {
        /// The new value set.
        counter_value: u32,
        /// The account who incremented the counter.
        who: T::AccountId,
        /// The amount by which the counter was incremented.
        incremented_amount: u32,
    },
    /// A user has successfully decremented the counter.
    CounterDecremented {
        /// The new value set.
        counter_value: u32,
        /// The account who decremented the counter.
        who: T::AccountId,
        /// The amount by which the counter was decremented.
        decremented_amount: u32,
    },
}
```

### Add Storage Items

Storage items are used to maintain the state of the pallet. For this pallet, three primary storage items are defined to manage the counter's state and user interactions:

- **CounterValue** - a single storage value that keeps track of the current value of the counter. This value is the core state variable manipulated by the pallet's functions

- **UserInteractions** - A storage map that tracks the number of times each account interacts with the counter
  
Define the storage items as follows:

```rust
/// Storage for the current value of the counter.
#[pallet::storage]
pub type CounterValue<T> = StorageValue<_, u32>;

/// Storage map to track the number of interactions performed by each account.
#[pallet::storage]
pub type UserInteractions<T: Config> = StorageMap<_, Twox64Concat, T::AccountId, u32>;
```

### Implement Custom Errors

The `#[pallet::error]` macro defines a custom Error enum to handle specific failure conditions within the pallet. Errors help provide meaningful feedback to users and external systems when a extrinsic cannot complete successfully. They are returned as part of the `DispatchResult` and are critical for maintaining the clarity and robustness of the pallet.

To add custom errors, use the `#[pallet::error]` macro to define the `Error` enum. Each variant represents a unique error that the pallet can emit, and these errors should align with the logic and constraints of the pallet. 

Add the following errors to the pallet:

```rust
#[pallet::error]
pub enum Error<T> {
    /// The counter value exceeds the maximum allowed value.
    CounterValueExceedsMax,
    /// The counter value cannot be decremented below zero.
    CounterValueBelowZero,
    /// Overflow occurred in the counter.
    CounterOverflow,
    /// Overflow occurred in user interactions.
    UserInteractionOverflow,
}
```

### Implement Calls

The `#[pallet::call]` macro defines the dispatchable functions (or calls) that the pallet exposes. These functions allow users or the runtime to interact with the pallet's logic and state. Each call includes comprehensive validations, modifies the state, and optionally emits events to signal successful execution.

The structure of the dispatchable calls in this pallet is as follows:

```rust
#[pallet::call]
impl<T: Config> Pallet<T> {

    #[pallet::call_index(0)]
    #[pallet::weight(0)]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {}

    #[pallet::call_index(1)]
    #[pallet::weight(0)]
    pub fn increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult {}

    #[pallet::call_index(2)]
    #[pallet::weight(0)]
    pub fn decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult {}
}
```

Below you can find the implementations of each dispatchable call in this pallet:

???+ function "set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult"
    This call sets the counter to a specific value. It is restricted to the Root origin, meaning it can only be invoked by privileged users or entities.

    - Parameters:
        - new_value - the value to set the counter to
    - Validations:
        - The new value must not exceed the maximum allowed counter value (CounterMaxValue)
    - Behavior:
        - Updates the CounterValue storage item
        - Emits a CounterValueSet event on success

    ```rust
    /// Set the value of the counter.
    ///
    /// The dispatch origin of this call must be _Root_.
    ///
    /// - `new_value`: The new value to set for the counter.
    ///
    /// Emits `CounterValueSet` event when successful.
    #[pallet::call_index(0)]
    #[pallet::weight(0)]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
        ensure_root(origin)?;

        ensure!(
            new_value <= T::CounterMaxValue::get(),
            Error::<T>::CounterValueExceedsMax
        );

        CounterValue::<T>::put(new_value);

        Self::deposit_event(Event::<T>::CounterValueSet {
            counter_value: new_value,
        });

        Ok(())
    }
    ```

???+ function "increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult"
    This call increments the counter by a specified amount. It is accessible to any signed account.

    - Parameters:
        - `a`mount_to_increment` - the amount to add to the counter
    - Validations:
        - Prevents overflow during the addition
        - Ensures the resulting counter value does not exceed `CounterMaxValue`
    - Behavior:
        - Updates the `CounterValue` storage item
        - Tracks the number of interactions by the user in the `UserInteractions` storage map
        - Emits a `CounterIncremented` event on success

    ```rust
    /// Increment the counter by a specified amount.
    ///
    /// This function can be called by any signed account.
    ///
    /// - `amount_to_increment`: The amount by which to increment the counter.
    ///
    /// Emits `CounterIncremented` event when successful.
    #[pallet::call_index(1)]
    #[pallet::weight(0)]
    pub fn increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult {
        let who = ensure_signed(origin)?;

        let current_value = CounterValue::<T>::get().unwrap_or(0);

        let new_value = current_value
            .checked_add(amount_to_increment)
            .ok_or(Error::<T>::CounterOverflow)?;

        ensure!(
            new_value <= T::CounterMaxValue::get(),
            Error::<T>::CounterValueExceedsMax
        );

        CounterValue::<T>::put(new_value);

        UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
            let new_interactions = interactions
                .unwrap_or(0)
                .checked_add(1)
                .ok_or(Error::<T>::UserInteractionOverflow)?;
            Ok(new_interactions)
        })?;

        Self::deposit_event(Event::<T>::CounterIncremented {
            counter_value: new_value,
            who,
            incremented_amount: amount_to_increment,
        });

        Ok(())
    }
    ```


???+ function "decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult"
    This call decrements the counter by a specified amount. It is accessible to any signed account.

    - Parameters:
        - `amount_to_decrement` - the amount to subtract from the counter
    - Validations:
        - Prevents underflow during the subtraction
        - Ensures the counter does not drop below zero
    - Behavior:
        - Updates the `CounterValue` storage item
        - Tracks the number of interactions by the user in the `UserInteractions` storage map
        - Emits a `CounterDecremented` event on success

    ```rust
    /// Decrement the counter by a specified amount.
    ///
    /// This function can be called by any signed account.
    ///
    /// - `amount_to_decrement`: The amount by which to decrement the counter.
    ///
    /// Emits `CounterDecremented` event when successful.
    #[pallet::call_index(2)]
    #[pallet::weight(0)]
    pub fn decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult {
        let who = ensure_signed(origin)?;

        let current_value = CounterValue::<T>::get().unwrap_or(0);

        let new_value = current_value
            .checked_sub(amount_to_decrement)
            .ok_or(Error::<T>::CounterValueBelowZero)?;

        CounterValue::<T>::put(new_value);

        UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
            let new_interactions = interactions
                .unwrap_or(0)
                .checked_add(1)
                .ok_or(Error::<T>::UserInteractionOverflow)?;
            Ok(new_interactions)
        })?;

        Self::deposit_event(Event::<T>::CounterDecremented {
            counter_value: new_value,
            who,
            decremented_amount: amount_to_decrement,
        });

        Ok(())
    }
    ```

## Verify Compilation

After implementing all the components of the pallet, it's crucial to verify that the code still compiles successfully. Run the following command in your terminal to ensure there are no errors:

```bash
cargo build --package custom-pallet
```

If you encounter any errors or warnings, carefully review your code to resolve the issues. Once the build completes without errors, your pallet implementation is ready.

## Key Takeaways

In this tutorial, you learned how to create a custom pallet by defining storage, implementing errors, adding dispatchable calls, and emitting events. These are the foundational building blocks for developing robust Polkadot SDK-based blockchain logic.

To review this implementation, you can find the complete pallet code below:

???+ example "Complete Pallet Code"
    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/lib.rs'
    ```

## Where to Go Next

To ensure the reliability of your pallet, it’s crucial to test its functionality thoroughly. 

Proceed to the next tutorial: [Pallet Testing](TODO: add-path), where you’ll learn how to write comprehensive tests for your pallet to validate its behavior and prevent bugs.
---
title: Make a Custom Pallet
description: Learn how to create custom pallets using FRAME, allowing for flexible, modular, and scalable blockchain development. Follow the step-by-step guide.
categories: Parachains
---

# Make a Custom Pallet

## Introduction

[Framework for Runtime Aggregation of Modular Entities (FRAME)](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank} provides a powerful set of tools for blockchain development through modular components called [pallets](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/pallet/index.html){target=\_blank}. These Rust-based runtime modules allow you to build custom blockchain functionality with precision and flexibility. While FRAME includes a library of pre-built pallets, its true strength lies in the ability to create custom pallets tailored to your specific needs.

In this guide, you'll learn how to build a custom counter pallet from scratch that demonstrates core pallet development concepts. The pallet you'll create includes:

- User-triggered increment and decrement operations
- Root-only counter value setting
- Event emission for state changes
- Custom error handling
- Storage management
- User interaction tracking
- Genesis configuration for initial state

## Prerequisites

Before you begin, ensure you have:

- [Polkadot SDK dependencies installed](/parachains/install-polkadot-sdk/){target=\_blank}
- A [Polkadot SDK Parchain Template](/parachains/launch-a-parachain/set-up-the-parachain-template/){target=\_blank} set up locally
- Basic familiarity with [FRAME concepts](/parachains/customize-runtime/){target=\_blank}

## Core Pallet Components

As you build your custom pallet, you'll work with these key sections:

- **Imports and dependencies**: Bring in necessary FRAME libraries and external modules.
- **Runtime configuration trait**: Specify types and constants for pallet-runtime interaction.
- **Runtime events**: Define signals that communicate state changes.
- **Runtime errors**: Define error types returned from dispatchable calls.
- **Runtime storage**: Declare on-chain storage items for your pallet's state.
- **Genesis configuration**: Set initial blockchain state.
- **Dispatchable functions (extrinsics)**: Create callable functions for user interactions.

For additional macros beyond those covered here, refer to the [pallet_macros](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/index.html){target=\_blank} section of the Polkadot SDK Docs.

## Create the Pallet Project

Begin by creating a new Rust library project for your custom pallet within the [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank}:

1. Navigate to the root directory of your parachain template:

    ```bash
    cd polkadot-sdk-parachain-template
    ```

2. Navigate to the `pallets` directory:

    ```bash
    cd pallets
    ```

3. Create a new Rust library project:

    ```bash
    cargo new --lib pallet-custom
    ```

4. Enter the new project directory:

    ```bash
    cd pallet-custom
    ```

5. Verify the project structure. It should look like:

    ```
    pallet-custom/
    ├── Cargo.toml
    └── src/
        └── lib.rs
    ```

## Configure Dependencies

To integrate your custom pallet into the Polkadot SDK-based runtime, configure the `Cargo.toml` file with the required dependencies. Since your pallet exists within the parachain template workspace, you'll use workspace inheritance to maintain version consistency.

1. Open `Cargo.toml` and replace its contents with:

    ```toml title="pallet-custom/Cargo.toml"
    [package]
    name = "pallet-custom"
    description = "A custom counter pallet for demonstration purposes."
    version = "0.1.0"
    license = "Unlicense"
    authors.workspace = true
    homepage.workspace = true
    repository.workspace = true
    edition.workspace = true
    publish = false

    [package.metadata.docs.rs]
    targets = ["x86_64-unknown-linux-gnu"]

    [dependencies]
    codec = { features = ["derive"], workspace = true }
    scale-info = { features = ["derive"], workspace = true }
    frame = { features = ["experimental", "runtime"], workspace = true }

    [features]
    default = ["std"]
    std = [
        "codec/std",
        "scale-info/std",
        "frame/std",
    ]
    ```

    !!!note "Version Management"
        The parachain template uses workspace inheritance to maintain consistent dependency versions across all packages. The actual versions are defined in the root `Cargo.toml` file, ensuring compatibility throughout the project. By using `workspace = true`, your pallet automatically inherits the correct versions.

2. The parachain template already includes `pallets/*` in the workspace members, so your new pallet is automatically recognized. Verify this by checking the root `Cargo.toml`:

    ```toml title="Cargo.toml"
    [workspace.members]
    members = [
        "node",
        "pallets/*",
        "runtime",
    ]
    ```

## Initialize the Pallet Structure

With dependencies configured, set up the basic scaffold that will hold your pallet's logic:

1. Open `src/lib.rs` and delete all existing content.

2. Add the initial scaffold structure using the unified `frame` dependency:

    ```rust title="src/lib.rs"
    #![cfg_attr(not(feature = "std"), no_std)]

    pub use pallet::*;

    #[frame::pallet]
    pub mod pallet {
        use frame::prelude::*;

        #[pallet::pallet]
        pub struct Pallet<T>(_);

        #[pallet::config]
        pub trait Config: frame_system::Config {
            // Configuration will be added here
        }

        #[pallet::storage]
        pub type CounterValue<T> = StorageValue<_, u32, ValueQuery>;

        #[pallet::call]
        impl<T: Config> Pallet<T> {
            // Dispatchable functions will be added here
        }
    }
    ```

    !!!note
        This setup starts with a minimal scaffold without events and errors. These will be added in the following sections after the `Config` trait is properly configured with the required `RuntimeEvent` type.

3. Verify it compiles:

    ```bash
    cargo build --package pallet-custom
    ```

## Configure the Pallet

The [`Config`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html){target=\_blank} trait exposes configurable options and links your pallet to the runtime. All types and constants the pallet depends on must be declared here. These types are defined generically and become concrete when the pallet is instantiated at runtime.

Replace the [`#[pallet::config]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.config.html){target=\_blank} section with:

```rust title="src/lib.rs"
#[pallet::config]
pub trait Config: frame_system::Config {
    /// The overarching runtime event type.
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
    
    /// Maximum value the counter can reach.
    #[pallet::constant]
    type CounterMaxValue: Get<u32>;
}
```

**Key configuration elements:**

- **[`RuntimeEvent`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html#associatedtype.RuntimeEvent){target=\_blank}**: Required for the pallet to emit events that the runtime can process.
- **`CounterMaxValue`**: A constant that sets an upper limit on counter values, configurable per runtime.

## Define Events

Events inform external entities (dApps, explorers, users) about significant runtime changes. Event details are included in the node's metadata, making them accessible to external tools.

The [`#[pallet::generate_deposit]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.generate_deposit.html){target=\_blank} macro automatically generates a `deposit_event` function that converts your pallet's events into the `RuntimeEvent` type and deposits them via [`frame_system::Pallet::deposit_event`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.deposit_event){target=\_blank}.

Add the [`#[pallet::event]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.event.html){target=\_blank} section after the `Config` trait:

```rust title="src/lib.rs"
#[pallet::event]
#[pallet::generate_deposit(pub(super) fn deposit_event)]
pub enum Event<T: Config> {
    /// Counter value was explicitly set. [new_value]
    CounterValueSet { 
        new_value: u32 
    },
    /// Counter was incremented. [new_value, who, amount]
    CounterIncremented {
        new_value: u32,
        who: T::AccountId,
        amount: u32,
    },
    /// Counter was decremented. [new_value, who, amount]
    CounterDecremented {
        new_value: u32,
        who: T::AccountId,
        amount: u32,
    },
}
```

## Define Errors

Errors indicate when and why a call fails. Use informative names and descriptions, as error documentation is included in the node's metadata.

Error types must implement the [`TypeInfo`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_prelude/trait.TypeInfo.html){target=\_blank} trait, and runtime errors can be up to 4 bytes in size.

Add the [`#[pallet::error]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.error.html){target=\_blank} section after the events:

```rust title="src/lib.rs"
#[pallet::error]
pub enum Error<T> {
    /// The counter value has not been set yet.
    NoneValue,
    /// Arithmetic operation would cause overflow.
    Overflow,
    /// Arithmetic operation would cause underflow.
    Underflow,
    /// The counter value would exceed the maximum allowed value.
    CounterMaxValueExceeded,
}
```

## Add Storage Items

Storage items persist state on-chain. This pallet uses two storage items:

- **`CounterValue`**: Stores the current counter value.
- **`UserInteractions`**: Tracks interaction counts per user account.

The initial scaffold already includes the `CounterValue` storage item. Now add the `UserInteractions` storage map after it:

```rust title="src/lib.rs"
/// Tracks the number of interactions per user.
#[pallet::storage]
pub type UserInteractions<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;
```

Your storage section should now look like this:

```rust title="src/lib.rs"
/// The current value of the counter.
#[pallet::storage]
pub type CounterValue<T> = StorageValue<_, u32, ValueQuery>;

/// Tracks the number of interactions per user.
#[pallet::storage]
pub type UserInteractions<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;
```

For more storage types and patterns, explore the [Polkadot SDK storage documentation](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html){target=\_blank}.

## Configure Genesis State

Genesis configuration allows you to set the initial state of your pallet when the blockchain first starts. This is essential for both production networks and testing environments. It is particularly useful for:

- Setting initial parameter values.
- Pre-allocating resources or accounts.
- Establishing starting conditions for testing.
- Configuring network-specific initial state.

Add the [`#[pallet::genesis_config]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.genesis_config.html){target=\_blank} and [`#[pallet::genesis_build]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.genesis_build.html){target=\_blank} sections after your storage items:

```rust title="src/lib.rs"
#[pallet::genesis_config]
#[derive(DefaultNoBound)]
pub struct GenesisConfig<T: Config> {
    /// Initial value for the counter
    pub initial_counter_value: u32,
    /// Pre-populated user interactions
    pub initial_user_interactions: Vec<(T::AccountId, u32)>,
}

#[pallet::genesis_build]
impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
    fn build(&self) {
        // Set the initial counter value
        CounterValue::<T>::put(self.initial_counter_value);
        
        // Set initial user interactions
        for (account, count) in &self.initial_user_interactions {
            UserInteractions::<T>::insert(account, count);
        }
    }
}
```

**Genesis configuration components:**

- **`GenesisConfig` struct**: Defines what can be configured at genesis.
- **`#[derive(DefaultNoBound)]`**: Provides sensible defaults (empty vec and 0 for the counter).
- **`BuildGenesisConfig` implementation**: Executes the logic to set initial storage values.
- **`build()` method**: Called once when the blockchain initializes.

## Implement Dispatchable Functions

Dispatchable functions (extrinsics) allow users to interact with your pallet and trigger state changes. Each function must:

- Return a [`DispatchResult`](https://paritytech.github.io/polkadot-sdk/master/frame_support/dispatch/type.DispatchResult.html){target=\_blank}.
- Be annotated with a weight (computational cost).
- Have an explicit call index for backward compatibility.

Replace the [`#[pallet::call]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.call.html){target=\_blank} section with:

```rust title="src/lib.rs"
#[pallet::call]
impl<T: Config> Pallet<T> {
    /// Set the counter to a specific value. Root origin only.
    #[pallet::call_index(0)]
    #[pallet::weight(0)]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
        // Ensure the caller is root
        ensure_root(origin)?;
        
        // Validate the new value doesn't exceed the maximum
        ensure!(
            new_value <= T::CounterMaxValue::get(),
            Error::<T>::CounterMaxValueExceeded
        );
        
        // Update storage
        CounterValue::<T>::put(new_value);
        
        // Emit event
        Self::deposit_event(Event::CounterValueSet { new_value });
        
        Ok(())
    }

    /// Increment the counter by a specified amount.
    #[pallet::call_index(1)]
    #[pallet::weight(0)]
    pub fn increment(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        // Ensure the caller is signed
        let who = ensure_signed(origin)?;
        
        // Get current counter value
        let current_value = CounterValue::<T>::get();
        
        // Check for overflow
        let new_value = current_value
            .checked_add(amount)
            .ok_or(Error::<T>::Overflow)?;
        
        // Ensure new value doesn't exceed maximum
        ensure!(
            new_value <= T::CounterMaxValue::get(),
            Error::<T>::CounterMaxValueExceeded
        );
        
        // Update counter storage
        CounterValue::<T>::put(new_value);
        
        // Track user interaction
        UserInteractions::<T>::mutate(&who, |count| {
            *count = count.saturating_add(1);
        });
        
        // Emit event
        Self::deposit_event(Event::CounterIncremented {
            new_value,
            who,
            amount,
        });
        
        Ok(())
    }

    /// Decrement the counter by a specified amount.
    #[pallet::call_index(2)]
    #[pallet::weight(0)]
    pub fn decrement(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        // Ensure the caller is signed
        let who = ensure_signed(origin)?;
        
        // Get current counter value
        let current_value = CounterValue::<T>::get();
        
        // Check for underflow
        let new_value = current_value
            .checked_sub(amount)
            .ok_or(Error::<T>::Underflow)?;
        
        // Update counter storage
        CounterValue::<T>::put(new_value);
        
        // Track user interaction
        UserInteractions::<T>::mutate(&who, |count| {
            *count = count.saturating_add(1);
        });
        
        // Emit event
        Self::deposit_event(Event::CounterDecremented {
            new_value,
            who,
            amount,
        });
        
        Ok(())
    }
}
```

### Dispatchable Function Details

???+ interface "`set_counter_value`"

    - **Access**: Root origin only (privileged operations)
    - **Purpose**: Set counter to a specific value
    - **Validations**: New value must not exceed `CounterMaxValue`
    - **State changes**: Updates `CounterValue` storage
    - **Events**: Emits `CounterValueSet`

??? interface "`increment`"

    - **Access**: Any signed account
    - **Purpose**: Increase counter by specified amount
    - **Validations**: Checks for overflow and max value compliance
    - **State changes**: Updates `CounterValue` and `UserInteractions`
    - **Events**: Emits `CounterIncremented`

??? interface "`decrement`"

    - **Access**: Any signed account
    - **Purpose**: Decrease counter by specified amount
    - **Validations**: Checks for underflow
    - **State changes**: Updates `CounterValue` and `UserInteractions`
    - **Events**: Emits `CounterDecremented`

## Verify Pallet Compilation

Before proceeding, ensure your pallet compiles without errors:

```bash
cargo build --package pallet-custom
```

If you encounter errors, carefully review the code against this guide. Once the build completes successfully, your custom pallet is ready for integration.

??? code "Complete Pallet Implementation"
    
    ```rust title="src/lib.rs"
    #![cfg_attr(not(feature = "std"), no_std)]

    pub use pallet::*;

    #[frame::pallet]
    pub mod pallet {
        use frame::prelude::*;

        #[pallet::pallet]
        pub struct Pallet<T>(_);

        #[pallet::config]
        pub trait Config: frame_system::Config {
            type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
            
            #[pallet::constant]
            type CounterMaxValue: Get<u32>;
        }

        #[pallet::event]
        #[pallet::generate_deposit(pub(super) fn deposit_event)]
        pub enum Event<T: Config> {
            CounterValueSet { new_value: u32 },
            CounterIncremented { new_value: u32, who: T::AccountId, amount: u32 },
            CounterDecremented { new_value: u32, who: T::AccountId, amount: u32 },
        }

        #[pallet::error]
        pub enum Error<T> {
            NoneValue,
            Overflow,
            Underflow,
            CounterMaxValueExceeded,
        }

        #[pallet::storage]
        pub type CounterValue<T> = StorageValue<_, u32, ValueQuery>;

        #[pallet::storage]
        pub type UserInteractions<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;

        #[pallet::genesis_config]
        #[derive(DefaultNoBound)]
        pub struct GenesisConfig<T: Config> {
            pub initial_counter_value: u32,
            pub initial_user_interactions: Vec<(T::AccountId, u32)>,
        }

        #[pallet::genesis_build]
        impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
            fn build(&self) {
                CounterValue::<T>::put(self.initial_counter_value);
                for (account, count) in &self.initial_user_interactions {
                    UserInteractions::<T>::insert(account, count);
                }
            }
        }

        #[pallet::call]
        impl<T: Config> Pallet<T> {
            #[pallet::call_index(0)]
            #[pallet::weight(0)]
            pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
                ensure_root(origin)?;
                ensure!(new_value <= T::CounterMaxValue::get(), Error::<T>::CounterMaxValueExceeded);
                CounterValue::<T>::put(new_value);
                Self::deposit_event(Event::CounterValueSet { new_value });
                Ok(())
            }

            #[pallet::call_index(1)]
            #[pallet::weight(0)]
            pub fn increment(origin: OriginFor<T>, amount: u32) -> DispatchResult {
                let who = ensure_signed(origin)?;
                let current_value = CounterValue::<T>::get();
                let new_value = current_value.checked_add(amount).ok_or(Error::<T>::Overflow)?;
                ensure!(new_value <= T::CounterMaxValue::get(), Error::<T>::CounterMaxValueExceeded);
                CounterValue::<T>::put(new_value);
                UserInteractions::<T>::mutate(&who, |count| *count = count.saturating_add(1));
                Self::deposit_event(Event::CounterIncremented { new_value, who, amount });
                Ok(())
            }

            #[pallet::call_index(2)]
            #[pallet::weight(0)]
            pub fn decrement(origin: OriginFor<T>, amount: u32) -> DispatchResult {
                let who = ensure_signed(origin)?;
                let current_value = CounterValue::<T>::get();
                let new_value = current_value.checked_sub(amount).ok_or(Error::<T>::Underflow)?;
                CounterValue::<T>::put(new_value);
                UserInteractions::<T>::mutate(&who, |count| *count = count.saturating_add(1));
                Self::deposit_event(Event::CounterDecremented { new_value, who, amount });
                Ok(())
            }
        }
    }
    ```

## Add the Pallet to Your Runtime

Now that your custom pallet is complete, integrate it into the parachain runtime.

### Add Runtime Dependency

1. In the `runtime/Cargo.toml`, add your custom pallet to the `[dependencies]` section:

    ```toml title="runtime/Cargo.toml"
    [dependencies]
    # Local dependencies
    pallet-custom = { path = "../pallets/pallet-custom", default-features = false }
    
    # ... other dependencies
    ```

2. Enable the `std` feature by adding it to the `[features]` section:

    ```toml title="runtime/Cargo.toml"
    [features]
    default = ["std"]
    std = [
        "codec/std",
        "pallet-custom/std",
        # ... other features
    ]
    ```

### Implement the Config Trait

At the end of the `runtime/src/configs/mod.rs` file, add the implementation: 

```rust title="runtime/src/configs/mod.rs"
/// Configure the custom counter pallet
impl pallet_custom::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
}
```

This configuration:

- Links the pallet's events to the runtime's event system
- Sets a maximum counter value of 1000 using [`ConstU32`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/struct.ConstU32.html){target=\_blank}

### Add to Runtime Construct

In the `runtime/src/lib.rs` file, locate the [`#[frame_support::runtime]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/attr.runtime.html){target=\_blank} section and add your pallet with a unique `pallet_index`:

```rust title="runtime/src/lib.rs"
#[frame_support::runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeTask,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeViewFunction
    )]
    pub struct Runtime;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;

    // ... other pallets

    #[runtime::pallet_index(51)]
    pub type CustomPallet = pallet_custom;
}
```

!!!warning
    Each pallet must have a unique index. Duplicate indices will cause compilation errors. Choose an index that doesn't conflict with existing pallets.

### Configure Genesis for Your Runtime

To set initial values for your pallet when the chain starts, you'll need to configure the genesis in your chain specification. This is typically done in the `node/src/chain_spec.rs` file or when generating the chain specification.

For development and testing, you can use the default values provided by the `#[derive(DefaultNoBound)]` macro. For production networks, you'll want to set these values in your chain specification explicitly.

### Verify Runtime Compilation

Compile the runtime to ensure everything is configured correctly:

```bash
cargo build --release
```

This command validates all pallet configurations and prepares the build for deployment.

## Run Your Chain Locally

Launch your parachain locally to test the new pallet functionality using the [Polkadot Omni Node](https://crates.io/crates/polkadot-omni-node){target=\_blank}.

### Generate a Chain Specification

Create a chain specification file with the updated runtime:

```bash
chain-spec-builder create -t development \
--relay-chain paseo \
--para-id 1000 \
--runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
named-preset development
```

This command generates a `chain_spec.json` that includes your custom pallet.

### Start the Parachain Node

Launch the parachain:

```bash
polkadot-omni-node --chain ./chain_spec.json --dev
```

Verify the node starts successfully and begins producing blocks.

## Interact with Your Pallet

Use the Polkadot.js Apps interface to test your pallet:

1. Navigate to [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/extrinsics){target=\_blank}.

2. Ensure you're connected to your local node at `ws://127.0.0.1:9944`.

3. Go to **Developer** > **Extrinsics**.

4. Locate **customPallet** in the pallet dropdown.

5. You should see the available extrinsics:

    - **`increment(amount)`**: Increase the counter by a specified amount.
    - **`decrement(amount)`**: Decrease the counter by a specified amount.
    - **`setCounterValue(newValue)`**: Set counter to a specific value (requires sudo/root).

![](/images/parachains/customize-runtime/pallet-development/create-a-pallet/create-a-pallet-01.webp)

## Key Takeaways

You've successfully created and integrated a custom pallet into a Polkadot SDK-based runtime. You learned:

- **Configuration**: Defined runtime-specific types and constants via the `Config` trait.
- **Storage**: Implemented on-chain state using `StorageValue` and `StorageMap`.
- **Events**: Created signals to communicate state changes to external systems.
- **Errors**: Established clear error handling with descriptive error types.
- **Genesis**: Configured initial blockchain state for both production and testing.
- **Dispatchables**: Built callable functions with proper validation and access control.
- **Integration**: Successfully added the pallet to a runtime and tested it locally.

These components form the foundation for developing sophisticated blockchain logic in Polkadot SDK-based chains.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Mock Your Runtime__

    ---

    Learn to create a mock runtime environment for testing your pallet in isolation before integration.

    [:octicons-arrow-right-24: Continue](/parachains/customize-runtime/pallet-development/mock-runtime/)

</div>
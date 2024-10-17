---
title: Create a Custom Pallet
description: TODO
---

# Create a Custom Pallet

## Introduction

FRAME provides a powerful set of tools for blockchain development, including a library of pre-built pallets. However, its true strength lies in the ability to create custom pallets tailored to your specific needs. This section will guide you through the process of creating your own custom pallet, empowering you to extend your blockchain's functionality in unique ways.

Creating custom pallets offer several advantages over relying on pre-built pallets:

- Flexibility - define runtime behavior that precisely matches your project requirements
- Modularity - combine pre-built and custom pallets to achieve the desired blockchain functionality
- Scalability - add or modify features as your project evolves

As you follow this guide to create your custom pallet, you'll work with the following key sections:

1. Imports and dependencies - bring in necessary FRAME libraries and external modules
2. Runtime configuration trait - specify the types and constants required for your pallet to interact with the runtime
3. Runtime events - define events that your pallet can emit to communicate state changes
4. Runtime errors - define the error types that can be returned from the function calls dispatched to the runtime
5. Runtime storage - declare on-chain storage items for your pallet's state
6. Extrinsics (function calls) - create callable functions that allow users to interact with your pallet and execute transactions

## Initial Setup

This section will guide you through the initial steps of creating the foundation for your custom FRAME pallet. You'll create a new Rust library project and set up the necessary dependencies.

1. Create a new Rust library project

    Execute the following command using `cargo`:

    ```bash
    cargo new --lib custom-pallet \
    && cd custom-pallet
    ```

    This command creates a new library project named `custom-pallet` and navigates into its directory.

2.  Configure dependencies in `Cargo.toml` file

    Add the core dependencies required for FRAME pallet development. Open the `Cargo.toml` file and update it as follows:

    ```toml
    [package]
    name = "custom-pallet"
    version = "0.1.0"
    edition = "2021"
    
    [dependencies]
    frame-support = { version = "37.0.0", default-features = false }
    frame-system = { version = "37.0.0", default-features = false }
    codec = { version = "3.6.12", default-features = false, package = "parity-scale-codec", features = ["derive"] }
    scale-info = { version = "2.11.1", default-features = false, features = ["derive"] }
    sp-runtime = { version = "39.0.0", default-features = false }

    [features]
    default = ["std"]
    std = [
        "frame-support/std",
        "frame-system/std",
        "codec/std",
        "scale-info/std",
        "sp-runtime/std",
    ]
    ```

    !!!note
        Carefully select the versions of the packages according to your project's specific requirements:

        - When developing for a specific Polkadot SDK runtime, ensure that your pallet's dependency versions match those of the target runtime
        - If you're creating this pallet within a Polkadot SDK workspace:

            - Define the actual versions in the root `Cargo.toml` file
            - Use workspace inheritance in your pallet's `Cargo.toml` to maintain consistency across your project
        - Regularly check for updates to FRAME and Polkadot SDK dependencies to benefit from the latest features, performance improvements, and security patches

        Proper version management is crucial for ensuring compatibility and reducing potential conflicts in your project.

3.  Set up the basic pallet structure

    After setting up the project and configuring dependencies, the next step is to prepare the basic structure of your pallet in the `lib.rs` file. Open the `src/lib.rs` file in your project, remove all existing content and copy and paste the following scaffold code:

    ```rust
    pub use pallet::*;

    #[frame_support::pallet]
    pub mod pallet {
        use frame_support::pallet_prelude::*;
        use frame_system::pallet_prelude::*;

        #[pallet::pallet]
        pub struct Pallet<T>(_);

        #[pallet::config]  // snip
        #[pallet::event]   // snip
        #[pallet::error]   // snip
        #[pallet::storage] // snip
        #[pallet::call]    // snip
    }
    ```

    With this scaffold in place, you're ready to start implementing the specific logic and features of your custom pallet. The subsequent sections of this guide will walk you through populating each of these components with the necessary code for your pallet's functionality.

## Pallet Configuration

Every pallet includes a Rust trait called [`Config`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html){target=\_blank}, which is used to expose configurable options and link your pallet to other parts of the runtime. All types and constants that the pallet depends on must be declared within this trait. These types are defined generically and made concrete when the pallet is instantiated in the `runtime/src/lib.rs` file of your blockchain.

In this step, you'll configure the pallet to emit events. 

Replace the line containing the `#[pallet::config]` macro with the following code block:

```rust
#[pallet::config]
pub trait Config: frame_system::Config {
    /// The overarching runtime event type.
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
    /// A type representing the weights required by the dispatchables of this pallet.
    type WeightInfo: WeightInfo;
}
```

## Pallet Events

After configuring the pallet to emit events, the next step is to define the events that can be triggered by functions within the pallet. Events provide a straightforward way to inform external entities such as dApps, chain explorers, or users, that a significant change has occurred in the runtime. In a FRAME pallet, the details of each event and its parameters are included in the node’s metadata, making them accessible to external tools and interfaces.

The `generate_deposit` macro generates a `deposit_event` function on the Pallet, which converts the pallet’s event type into the `RuntimeEvent` (as specified in the `Config` trait) and deposits it using `frame_system::Pallet::deposit_event`.

This step adds an event called `SomethingStored`, which is triggered when a user successfully stores a value in the pallet. The event records both the value and the account that performed the action.

To define events, replace the `#[pallet::event]` line with the following code block:

```rust
#[pallet::event]
#[pallet::generate_deposit(pub(super) fn deposit_event)]
pub enum Event<T: Config> {
    /// A user has successfully set a new value.
    SomethingStored {
        /// The new value set.
        something: u32,
        /// The account who set the new value.
        who: T::AccountId,
    },
}
```

## Pallet Errors

While events signal the successful completion of calls, errors indicate when and why a call has failed. It's essential to use informative names for errors to clearly communicate the cause of failure. Like events, error documentation is included in the node's metadata, so providing helpful descriptions is crucial.

Errors are defined as an enum named `Error` with a generic type. Variants can have fields or be fieldless. Any field type specified in the error must implement the `scale_info::TypeInfo` trait, and the encoded size of each field should be as small as possible. Runtime errors can be up to 4 bytes in size, allowing the return of additional information when needed.

This step defines two basic errors: one for handling cases where no value has been set, and another for managing arithmetic overflow.

To define errors, replace the `#[pallet::error]` line with the following code block:

```rust
#[pallet::error]
pub enum Error<T> {
    /// The value retrieved was `None` as no value was previously set.
    NoneValue,
    /// There was an attempt to increment the value in storage over `u32::MAX`.
    StorageOverflow,
}
```

## Pallet Storage

To persist and store state/data within the pallet (and subsequently, the blockchain you are building) the `#[pallet::storage]` macro is used. This macro allows the definition of abstract storage within the runtime and sets metadata for that storage. It can be applied multiple times to define different storage items. There are several types available for defining storage, which can be explored in the [Polkadot SDK documentation](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html){target=\_blank}.

This step adds a simple storage item, `Something`, which stores a single `u32` value in the pallet's runtime storage

To define storage, replace the `#[pallet::storage]` line with the following code block:

```rust
#[pallet::storage]
pub type Something<T> = StorageValue<_, u32>;
```

## Pallet Calls

Dispatchable functions enable users to interact with the pallet and trigger state changes. These functions are represented as "extrinsics," which are similar to transactions. They must return a `DispatchResult` and be annotated with both a weight and a call index.

The `#[pallet::call_index]` macro is used to explicitly define an index for calls in the `Call` enum. This is useful for maintaining backward compatibility in the event of new dispatchables being introduced, as changing the order of dispatchables would otherwise alter their index.

The `#[pallet::weight]` macro assigns a weight to each call, determining its execution cost.

This section adds two dispatchable functions:

- `do_something` - takes a single u32 value, stores it in the pallet's storage, and emits an event
- `cause_error` - checks if a value exists in storage. If found, increments the value and stores it back. If no value is present, or an overflow occurs, a custom error is returned

To implement these calls, replace the #[pallet::call] line with the following code block:

```rust
#[pallet::call]
impl<T: Config> Pallet<T> {
    #[pallet::call_index(0)]
    #[pallet::weight(Weight::default())]
    pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
        // Check that the extrinsic was signed and get the signer.
        let who = ensure_signed(origin)?;

        // Update storage.
        Something::<T>::put(something);

        // Emit an event.
        Self::deposit_event(Event::SomethingStored { something, who });

        // Return a successful `DispatchResult`
        Ok(())
    }

    #[pallet::call_index(1)]
    #[pallet::weight(Weight::default())]
    pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
        let _who = ensure_signed(origin)?;

        // Read a value from storage.
        match Something::<T>::get() {
            // Return an error if the value has not been set.
            None => Err(Error::<T>::NoneValue.into()),
            Some(old) => {
                // Increment the value read from storage. This will cause an error in the event
                // of overflow.
                let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
                // Update the value in storage with the incremented result.
                Something::<T>::put(new);
                Ok(())
            },
        }
    }
}
```

## Pallet Implementation Overview

After following all the previous steps, the pallet is now fully implemented. Below is the complete code, combining the configuration, events, errors, storage, and dispatchable functions:

???code
    ```rust
    pub use pallet::*;

    #[frame_support::pallet]
    pub mod pallet {
        use frame_support::pallet_prelude::*;
        use frame_system::pallet_prelude::*;

        #[pallet::pallet]
        pub struct Pallet<T>(_);

        #[pallet::config]
        pub trait Config: frame_system::Config {
            /// The overarching runtime event type.
            type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
            // /// A type representing the weights required by the dispatchables of this pallet.
            // type WeightInfo: WeightInfo;
        }

        #[pallet::event]
        #[pallet::generate_deposit(pub(super) fn deposit_event)]
        pub enum Event<T: Config> {
            /// A user has successfully set a new value.
            SomethingStored {
                /// The new value set.
                something: u32,
                /// The account who set the new value.
                who: T::AccountId,
            },
        }
        
        #[pallet::error]
        pub enum Error<T> {
            /// The value retrieved was `None` as no value was previously set.
            NoneValue,
            /// There was an attempt to increment the value in storage over `u32::MAX`.
            StorageOverflow,
        }

        #[pallet::storage]
        pub type Something<T> = StorageValue<_, u32>;

        #[pallet::call]
        impl<T: Config> Pallet<T> {
            #[pallet::call_index(0)]
            #[pallet::weight(Weight::default())]
            pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
                // Check that the extrinsic was signed and get the signer.
                let who = ensure_signed(origin)?;
        
                // Update storage.
                Something::<T>::put(something);
        
                // Emit an event.
                Self::deposit_event(Event::SomethingStored { something, who });
        
                // Return a successful `DispatchResult`
                Ok(())
            }
        
            #[pallet::call_index(1)]
            #[pallet::weight(Weight::default())]
            pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
                let _who = ensure_signed(origin)?;
        
                // Read a value from storage.
                match Something::<T>::get() {
                    // Return an error if the value has not been set.
                    None => Err(Error::<T>::NoneValue.into()),
                    Some(old) => {
                        // Increment the value read from storage. This will cause an error in the event
                        // of overflow.
                        let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
                        // Update the value in storage with the incremented result.
                        Something::<T>::put(new);
                        Ok(())
                    },
                }
            }
        }
    }
    ```

## Next Steps

With the pallet implemented, the next steps involve ensuring its reliability and performance before integrating it into a runtime.

- Testing - learn how to effectively test the functionality and reliability of your pallet to ensure it behaves as expected. Check the [Testing](TODO:update-path){target=\_blank} section for detailed instructions

- Benchmarking - explore methods to measure the performance and execution cost of your pallet. Refer to the [Benchmarking](TODO:update-path){target=\_blank} section for guidance

- Adding the pallet to a runtime - follow the steps to successfully include your pallet in a Polkadot SDK-based runtime, making it ready for use in your blockchain. Visit the [Add a Pallet to the Runtime](TODO:update-path){target=\_blank} section for the necessary steps
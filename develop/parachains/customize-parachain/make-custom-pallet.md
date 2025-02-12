---
title: Make a Custom Pallet
description: Learn how to create custom pallets using FRAME, allowing for flexible, modular, and scalable blockchain development. Follow the step-by-step guide.
---

# Make a Custom Pallet

## Introduction

FRAME provides a powerful set of tools for blockchain development, including a library of pre-built pallets. However, its true strength lies in the ability to create custom pallets tailored to your specific needs. This section will guide you through creating your own custom pallet, allowing you to extend your blockchain's functionality in unique ways.

To get the most out of this guide, ensure you're familiar with [FRAME concepts](/develop/parachains/customize-parachain/overview/){target=\_blank}.

Creating custom pallets offers several advantages over relying on pre-built pallets:

- **Flexibility** - define runtime behavior that precisely matches your project requirements
- **Modularity** - combine pre-built and custom pallets to achieve the desired blockchain functionality
- **Scalability** - add or modify features as your project evolves

As you follow this guide to create your custom pallet, you'll work with the following key sections:

1. **Imports and dependencies** - bring in necessary FRAME libraries and external modules
2. **Runtime configuration trait** - specify the types and constants required for your pallet to interact with the runtime
3. **Runtime events** - define events that your pallet can emit to communicate state changes
4. **Runtime errors** - define the error types that can be returned from the function calls dispatched to the runtime
5. **Runtime storage** - declare on-chain storage items for your pallet's state
6. **Extrinsics (function calls)** - create callable functions that allow users to interact with your pallet and execute transactions

For additional macros you can include in a pallet, beyond those covered in this guide, refer to the [pallet_macros](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/index.html){target=\_blank} section of the Polkadot SDK Docs.

## Initial Setup

This section will guide you through the initial steps of creating the foundation for your custom FRAME pallet. You'll create a new Rust library project and set up the necessary dependencies.

1. Create a new Rust library project using the following `cargo` command:

    ```bash
    cargo new --lib custom-pallet \
    && cd custom-pallet
    ```

    This command creates a new library project named `custom-pallet` and navigates into its directory.

2.  Configure the dependencies required for FRAME pallet development in the `Cargo.toml` file as follows:

    ```toml
    --8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/Cargo.toml'
    ```

    !!!note
        Proper version management is crucial for ensuring compatibility and reducing potential conflicts in your project. Carefully select the versions of the packages according to your project's specific requirements:

        - When developing for a specific Polkadot SDK runtime, ensure that your pallet's dependency versions match those of the target runtime
        - If you're creating this pallet within a Polkadot SDK workspace:

            - Define the actual versions in the root `Cargo.toml` file
            - Use workspace inheritance in your pallet's `Cargo.toml` to maintain consistency across your project
        - Regularly check for updates to FRAME and Polkadot SDK dependencies to benefit from the latest features, performance improvements, and security patches

    For detailed information about workspace inheritance and how to properly integrate your pallet with the runtime, see the [Add an Existing Pallet to the Runtime](/develop/parachains/customize-parachain/add-existing-pallets/){target=\_blank} page.

3.  Initialize the pallet structure by replacing the contents of `src/lib.rs` with the following scaffold code:

    ```rust
    --8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/barebone-pallet-template.rs'
    ```

    With this scaffold in place, you're ready to start implementing your custom pallet's specific logic and features. The subsequent sections of this guide will walk you through populating each of these components with the necessary code for your pallet's functionality.

## Pallet Configuration

Every pallet includes a Rust trait called [`Config`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html){target=\_blank}, which exposes configurable options and links your pallet to other parts of the runtime. All types and constants the pallet depends on must be declared within this trait. These types are defined generically and made concrete when the pallet is instantiated in the `runtime/src/lib.rs` file of your blockchain.

In this step, you'll only configure the common types used by all pallets:

- **`RuntimeEvent`** - since this pallet emits events, the runtime event type is required to handle them. This ensures that events generated by the pallet can be correctly processed and interpreted by the runtime
- **`WeightInfo`** - this type defines the weights associated with the pallet's callable functions (also known as dispatchables). Weights help measure the computational cost of executing these functions. However, the `WeightInfo` type will be left unconfigured since setting up custom weights is outside the scope of this guide

Replace the line containing the [`#[pallet::config]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.config.html){target=\_blank} macro with the following code block:

```rust
--8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/pallet-config.rs'
```

## Pallet Events

After configuring the pallet to emit events, the next step is to define the events that can be triggered by functions within the pallet. Events provide a straightforward way to inform external entities, such as dApps, chain explorers, or users, that a significant change has occurred in the runtime. In a FRAME pallet, the details of each event and its parameters are included in the node’s metadata, making them accessible to external tools and interfaces.

The [`generate_deposit`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.generate_deposit.html){target=\_blank} macro generates a `deposit_event` function on the `Pallet`, which converts the pallet’s event type into the [`RuntimeEvent`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html#associatedtype.RuntimeEvent){target=\_blank} (as specified in the `Config` trait) and deposits it using [`frame_system::Pallet::deposit_event`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.deposit_event){target=\_blank}.

This step adds an event called `SomethingStored`, which is triggered when a user successfully stores a value in the pallet. The event records both the value and the account that performed the action.

To define events, replace the [`#[pallet::event]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.event.html){target=\_blank} line with the following code block:

```rust
--8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/pallet-event.rs'
```

## Pallet Errors

While events signal the successful completion of calls, errors indicate when and why a call has failed. It's essential to use informative names for errors to clearly communicate the cause of failure. Like events, error documentation is included in the node's metadata, so providing helpful descriptions is crucial.

Errors are defined as an enum named `Error` with a generic type. Variants can have fields or be fieldless. Any field type specified in the error must implement the [`TypeInfo`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_prelude/trait.TypeInfo.html){target=\_blank} trait, and the encoded size of each field should be as small as possible. Runtime errors can be up to 4 bytes in size, allowing the return of additional information when needed.

This step defines two basic errors: one for handling cases where no value has been set and another for managing arithmetic overflow.

To define errors, replace the [`#[pallet::error]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.error.html){target=\_blank} line with the following code block:

```rust
--8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/pallet-error.rs'
```

## Pallet Storage

To persist and store state/data within the pallet (and subsequently, the blockchain you are building), the `#[pallet::storage]` macro is used. This macro allows the definition of abstract storage within the runtime and sets metadata for that storage. It can be applied multiple times to define different storage items. Several types are available for defining storage, which you can explore in the [Polkadot SDK documentation](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html){target=\_blank}.

This step adds a simple storage item, `Something`, which stores a single `u32` value in the pallet's runtime storage

To define storage, replace the [`#[pallet::storage]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.storage.html){target=\_blank} line with the following code block:

```rust
--8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/pallet-storage.rs'
```

## Pallet Dispatchable Extrinsics

Dispatchable functions enable users to interact with the pallet and trigger state changes. These functions are represented as "extrinsics," which are similar to transactions. They must return a [`DispatchResult`](https://paritytech.github.io/polkadot-sdk/master/frame_support/dispatch/type.DispatchResult.html){target=\_blank} and be annotated with a weight and a call index.

The `#[pallet::call_index]` macro is used to explicitly define an index for calls in the `Call` enum. This is useful for maintaining backward compatibility in the event of new dispatchables being introduced, as changing the order of dispatchables would otherwise alter their index.

The `#[pallet::weight]` macro assigns a weight to each call, determining its execution cost.

This section adds two dispatchable functions:

- **`do_something`** - takes a single `u32` value, stores it in the pallet's storage, and emits an event
- **`cause_error`** - checks if a value exists in storage. If the value is found, it increments and is stored back. If no value is present or an overflow occurs, a custom error is returned

To implement these calls, replace the [`#[pallet::call]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.call.html){target=\_blank} line with the following code block:

```rust
--8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/pallet-call.rs'
```

## Pallet Implementation Overview

After following all the previous steps, the pallet is now fully implemented. Below is the complete code, combining the configuration, events, errors, storage, and dispatchable functions:

???code
    ```rust
    --8<-- 'code/develop/parachains/customize-parachain/make-custom-pallets/full-pallet.rs'
    ```

## Where to Go Next

With the pallet implemented, the next steps involve ensuring its reliability and performance before integrating it into a runtime. Check the following sections:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Testing__

    ---

    Learn how to effectively test the functionality and reliability of your pallet to ensure it behaves as expected.

    [:octicons-arrow-right-24: Reference](/develop/parachains/testing/)

-   <span class="badge guide">Guide</span> __Benchmarking__

    ---

    Explore methods to measure the performance and execution cost of your pallet.

    [:octicons-arrow-right-24: Reference](/develop/parachains/testing/benchmarking)

-   <span class="badge guide">Guide</span> __Add a Pallet to the Runtime__

    ---

    Follow this guide to include your pallet in a Polkadot SDK-based runtime, making it ready for use in your blockchain.

    [:octicons-arrow-right-24: Reference](/develop/parachains/customize-parachain/add-existing-pallets/)

</div>
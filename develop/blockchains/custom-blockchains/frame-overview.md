---
title: FRAME Overview
description: FRAME is a powerful toolkit for Polkadot SDK runtime development, offering modular pallets and support libraries. Learn how to build your runtime logic.
---

# FRAME Overview

## Introduction

The runtime is the core component of a Polkadot SDK-based blockchain, encapsulating essential business logic and serving as the state transition function. It is responsible for:

- Defining storage items that represent the blockchain state
- Specifying transactions that allow users to modify the state
- Managing state changes in response to transactions

Polkadot SDK provides a comprehensive toolkit for constructing essential blockchain components, allowing developers to concentrate on crafting the specific runtime logic that defines their blockchain's unique set of use cases and capabilities.

FRAME (Framework for Runtime Aggregation of Modularized Entities) provides a robust collection of tools to facilitate Polkadot SDK-based blockchain development. It offers reusable modules and useful abstractions that streamline developers' development process. It consists of:

- [**Pallets**](#pallets) - modular components containing specific blockchain logic
- [**Support libraries**](#support-libraries) - tools and utilities to facilitate runtime development

## FRAME Runtime Architecture

The following diagram illustrates how FRAME components integrate into the runtime:

![](/images/develop/parachain-devs/runtime-development/FRAME/frame-overview/frame-overview-1.webp)

All transactions sent to the runtime are handled by the `frame_executive` pallet, which dispatches them to the appropriate pallet for execution. These runtime modules contain the logic for specific blockchain features. The `frame_system` module provides core functions, while `frame_support` libraries offer useful tools to simplify pallet development. Together, these components form the backbone of a FRAME-based blockchain's runtime.

### Pallets

Pallets are modular components within the FRAME ecosystem that encapsulate specific blockchain functionalities. These modules offer customizable business logic for various use cases and features that can be integrated into a runtime.

Developers have the flexibility to implement any desired behavior in the core logic of the blockchain, such as:

- Exposing new transactions
- Storing information
- Enforcing business rules

Pallets also include necessary wiring code to ensure proper integration and functionality within the runtime. FRAME provides a range of [pre-built pallets](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame){target=\_blank} for standard and common blockchain functionalities, including consensus algorithms, staking mechanisms, governance systems, and more. These pre-existing pallets serve as building blocks or templates, which developers can use as-is, modify, or reference when creating custom functionalities. 

#### Pallet Structure

Polkadot SDK heavily utilizes Rust macros, allowing developers to focus on specific functional requirements when writing pallets instead of dealing with technicalities and scaffolding code.

A typical pallet skeleton looks like this:

```rust
pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
  use frame_support::pallet_prelude::*;
  use frame_system::pallet_prelude::*;

  #[pallet::pallet]
  #[pallet::generate_store(pub(super) trait Store)]
  pub struct Pallet<T>(_);

  #[pallet::config]  // snip
  #[pallet::event]   // snip
  #[pallet::error]   // snip
  #[pallet::storage] // snip
  #[pallet::call]    // snip
}
```

All pallets, including custom ones, can implement these attribute macros:

- **`#[frame_support::pallet]`** - marks the module as usable in the runtime
- **`#[pallet::pallet]`** - applied to a structure used to retrieve module information easily
- **`#[pallet::config]`** - defines the configuration for the pallets's data types
- **`#[pallet::event]`** - defines events to provide additional information to users
- **`#[pallet::error]`** - lists possible errors in an enum to be returned upon unsuccessful execution
- **`#[pallet::storage]`** - defines elements to be persisted in storage
- **`#[pallet::call]`** - defines functions exposed as transactions, allowing dispatch to the runtime

These macros are applied as attributes to Rust modules, functions, structures, enums, and types. They enable the pallet to be built and added to the runtime, exposing the custom logic to the outer world.

!!! note
    The macros above are the core components of a pallet. For a comprehensive guide on these and additional macros, refer to the [`pallet_macros`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/index.html){target=\_blank} section in the Polkadot SDK documentation.

### Support Libraries

In addition to purpose-specific pallets, FRAME offers services and core libraries that facilitate composing and interacting with the runtime:

- [**`frame_system` pallet**](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} - provides low-level types, storage, and functions for the runtime
- [**`frame_executive` pallet**](https://paritytech.github.io/polkadot-sdk/master/frame_executive/index.html){target=\_blank} - orchestrates the execution of incoming function calls to the respective pallets in the runtime
- [**`frame_support` crate**](https://paritytech.github.io/polkadot-sdk/master/frame_support/index.html){target=\_blank} - is a collection of Rust macros, types, traits, and modules that simplify the development of Substrate pallets
- [**`frame_benchmarking` crate**](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/trait.Benchmark.html){target=\_blank} - contains common runtime patterns for benchmarking and testing purposes

## Compose a Runtime with Pallets

The Polkadot SDK allows developers to construct a runtime by combining various pallets, both built-in and custom-made. This modular approach enables the creation of unique blockchain behaviors tailored to specific requirements.

The following diagram illustrates the process of selecting and combining FRAME pallets to compose a runtime:

![](/images/develop/parachain-devs/runtime-development/FRAME/frame-overview/frame-overview-2.webp)

This modular design allows developers to:

- Rapidly prototype blockchain systems
- Easily add or remove features by including or excluding pallets
- Customize blockchain behavior without rebuilding core components
- Leverage tested and optimized code from built-in pallets

For more detailed information on implementing this process, refer to the following sections:

- [Add a Pallet to Your Runtime](TODO:update-path){target=\_blank}
- [Create a Custom Pallet](TODO:update-path){target=\_blank}
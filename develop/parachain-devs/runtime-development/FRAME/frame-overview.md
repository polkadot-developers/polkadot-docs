---
title: FRAME Overview
description: FRAME is a powerful toolkit for Polkadot SDK runtime development, offering modular pallets and support libraries. Learn how to build your runtime logic.
---

# FRAME Overview

## Introduction

The runtime in a Polkadot SDK-based blockchain acts as the core component, encapsulating all essential business logic for:

- Executing transactions
- Managing state transitions
- Facilitating node interactions

Polkadot SDK provides a comprehensive toolkit for constructing essential blockchain components, allowing developers to concentrate on crafting the specific runtime logic that defines their blockchain's unique behavior and capabilities.

FRAME (Framework for Runtime Aggregation of Modularized Entities) is one of the most powerful tools available to you as a runtime developer. It consists of:

- [Pallets](#pallets) - modular components containing specific blockchain logic
- [Support libraries](#support-libraries) - tools and utilities to facilitate runtime development

## FRAME Runtime Architecture

The following diagram illustrates how FRAME components integrate into the runtime:

![](/images/develop/parachain-devs/runtime-development/FRAME/frame-overview/frame-overview-1.webp)

### Pallets

Pallets are modular components within the FRAME ecosystem that encapsulate specific blockchain functionalities. These modules offer customizable business logic for various use cases and features that can be integrated into a runtime.

Developers have the flexibility to implement any desired behavior in the core logic of the blockchain, such as:

- Exposing new transactions
- Storing sensitive information
- Enforcing business rules

Each pallet communicates with the core client through a specific API, allowing the runtime to expose transactions, access storage, and encode/decode on-chain information.

Pallets also include necessary wiring code to ensure proper integration and functionality within the node. FRAME provides a range of [pre-built pallets](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame){target=\_blank} for common blockchain activities, including staking mechanisms, consensus algorithms, governance systems, and other standard operations. These pre-existing pallets serve as building blocks or templates, which developers can use as-is, modify, or reference when creating custom functionalities. 

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

All pallets, including custom ones, implement these attribute macros:

- `#[frame_support::pallet]` - marks the module as usable in the runtime
- `#[pallet::pallet]` - applied to a structure used to retrieve module information easily
- `#[pallet::config]` - defines the configuration for the pallets's data types
- `#[pallet::event]` - defines events to provide additional information to users
- `#[pallet::error]` - lists possible errors in an enum to be returned upon unsuccessful execution
- `#[pallet::storage]` - defines elements to be persisted in storage
- `#[pallet::call]` - defines functions exposed as transactions, allowing dispatch to the runtime

These macros are applied as attributes to Rust modules, functions, structures, enums, and types. They enable the pallet to be built and added to the runtime, exposing the custom logic to the outer world.

!!! note
    The macros above are the core components of a pallet. For a comprehensive guide on these and additional macros, refer to the [pallet_macros](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/index.html){target=\_blank} section in the Polkadot SDK documentation.

### Support Libraries

In addition to pallets, FRAME provides services to interact with the runtime through the following libraries and modules:

- [`frame_system` crate]() - provides low-level types, storage, and functions for the runtime
- [frame_support crate]() - is a collection of Rust macros, types, traits, and modules that simplify the development of Substrate pallets
- [`frame_executive` pallet]() - orchestrates the execution of incoming function calls to the respective pallets in the runtime

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

- [Add a Pallet to Your Runtime]()
- [Create a Custom Pallet]()
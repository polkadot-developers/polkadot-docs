---
title: Overview of FRAME
description: Learn how Polkadot SDK’s FRAME framework simplifies blockchain development with modular pallets and support libraries for efficient runtime design.
---

# Overview

## Introduction

The runtime is the heart of any Polkadot SDK-based blockchain, handling the essential logic that governs state changes and transaction processing. With Polkadot SDK’s [FRAME (Framework for Runtime Aggregation of Modularized Entities)](/polkadot-protocol/glossary/#frame-framework-for-runtime-aggregation-of-modularized-entities){target=\_bank}, developers gain access to a powerful suite of tools for building custom blockchain runtimes. FRAME offers a modular architecture, featuring reusable pallets and support libraries, to streamline development.

This guide provides an overview of FRAME, its core components like pallets and system libraries, and demonstrates how to compose a runtime tailored to your specific blockchain use case. Whether you’re integrating pre-built modules or designing custom logic, FRAME equips you with the tools to create scalable, feature-rich blockchains.

## FRAME Runtime Architecture

The following diagram illustrates how FRAME components integrate into the runtime:

![](/images/develop/parachains/customize-parachain/overview/frame-overview-1.webp)

All transactions sent to the runtime are handled by the `frame_executive` pallet, which dispatches them to the appropriate pallet for execution. These runtime modules contain the logic for specific blockchain features. The `frame_system` module provides core functions, while `frame_support` libraries offer useful tools to simplify pallet development. Together, these components form the backbone of a FRAME-based blockchain's runtime.

### Pallets

Pallets are modular components within the FRAME ecosystem that encapsulate specific blockchain functionalities. These modules offer customizable business logic for various use cases and features that can be integrated into a runtime.

Developers have the flexibility to implement any desired behavior in the core logic of the blockchain, such as:

- Exposing new transactions
- Storing information
- Enforcing business rules

Pallets also include necessary wiring code to ensure proper integration and functionality within the runtime. FRAME provides a range of [pre-built pallets](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame){target=\_blank} for standard and common blockchain functionalities, including consensus algorithms, staking mechanisms, governance systems, and more. These pre-existing pallets serve as building blocks or templates, which developers can use as-is, modify, or reference when creating custom functionalities. 

#### Pallet Structure

Polkadot SDK heavily utilizes Rust macros, allowing developers to focus on specific functional requirements when writing pallets instead of dealing with technicalities and scaffolding code.

A typical pallet skeleton looks like this:

```rust
--8<-- 'code/develop/parachains/customize-parachain/overview/pallet-skeleton.rs'
```

All pallets, including custom ones, can implement these attribute macros:

- **`#[frame_support::pallet]`** - marks the module as usable in the runtime
- **`#[pallet::pallet]`** - applied to a structure used to retrieve module information easily
- **`#[pallet::config]`** - defines the configuration for the pallets's data types
- **`#[pallet::event]`** - defines events to provide additional information to users
- **`#[pallet::error]`** - lists possible errors in an enum to be returned upon unsuccessful execution
- **`#[pallet::storage]`** - defines elements to be persisted in storage
- **`#[pallet::call]`** - defines functions exposed as transactions, allowing dispatch to the runtime

These macros are applied as attributes to Rust modules, functions, structures, enums, and types and serve as the core components of a pallet. They enable the pallet to be built and added to the runtime, exposing the custom logic to the outer world.

For a comprehensive guide on these and additional macros, see the [`pallet_macros`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/index.html){target=\_blank} section in the Polkadot SDK documentation.

### Support Libraries

In addition to purpose-specific pallets, FRAME offers services and core libraries that facilitate composing and interacting with the runtime:

- [**`frame_system` pallet**](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} - provides low-level types, storage, and functions for the runtime
- [**`frame_executive` pallet**](https://paritytech.github.io/polkadot-sdk/master/frame_executive/index.html){target=\_blank} - orchestrates the execution of incoming function calls to the respective pallets in the runtime
- [**`frame_support` crate**](https://paritytech.github.io/polkadot-sdk/master/frame_support/index.html){target=\_blank} - is a collection of Rust macros, types, traits, and modules that simplify the development of Substrate pallets
- [**`frame_benchmarking` crate**](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/trait.Benchmark.html){target=\_blank} - contains common runtime patterns for benchmarking and testing purposes

## Compose a Runtime with Pallets

The Polkadot SDK allows developers to construct a runtime by combining various pallets, both built-in and custom-made. This modular approach enables the creation of unique blockchain behaviors tailored to specific requirements.

The following diagram illustrates the process of selecting and combining FRAME pallets to compose a runtime:

![](/images/develop/parachains/customize-parachain/overview/frame-overview-2.webp)

This modular design allows developers to:

- Rapidly prototype blockchain systems
- Easily add or remove features by including or excluding pallets
- Customize blockchain behavior without rebuilding core components
- Leverage tested and optimized code from built-in pallets

## Starting from Templates

Using pre-built templates is an efficient way to begin building a custom blockchain. Templates provide a foundational setup with pre-configured modules, letting developers avoid starting from scratch and instead focus on customization. Depending on your project’s goals—whether you want a simple test chain, a standalone chain, or a parachain that integrates with Polkadot’s relay chains—there are templates designed to suit different levels of complexity and scalability.

Within the Polkadot SDK, the following templates are available to get you started:

- [**`minimal-template`**](https://github.com/paritytech/polkadot-sdk/tree/master/templates/minimal){target=\_blank} - includes only the essential components necessary for a functioning blockchain. It’s ideal for developers who want to gain familiarity with blockchain basics and test simple customizations before scaling up

- [**`solochain-template`**](https://github.com/paritytech/polkadot-sdk/tree/master/templates/solochain){target=\_blank} - provides a foundation for creating standalone blockchains with moderate features, including a simple consensus mechanism and several core FRAME pallets. It’s a solid starting point for developers who want a fully functional chain that doesn’t depend on a relay chain

- [**`parachain-template`**](https://github.com/paritytech/polkadot-sdk/tree/master/templates/parachain){target=\_blank} - designed for connecting to relay chains like Polkadot, Kusama, or Paseo, this template enables a chain to operate as a parachain. For projects aiming to integrate with Polkadot’s ecosystem, this template offers a great starting point

In addition, several external templates offer unique features and can align with specific use cases or developer familiarity:

- [**`OpenZeppelin`**](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main){target=\_blank} - offers two flexible starting points:
    - The [`generic-runtime-template`](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main/generic-template){target=\_blank} provides a minimal setup with essential pallets and secure defaults, creating a reliable foundation for custom blockchain development
    - The [`evm-runtime-template`](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main/evm-template){target=\_blank} enables EVM compatibility, allowing developers to migrate Solidity contracts and EVM-based dApps. This template is ideal for Ethereum developers looking to leverage Substrate's capabilities

- [**`Tanssi`**](https://github.com/moondance-labs/tanssi/tree/master/container-chains/runtime-templates){target=\_blank} - provides developers with pre-built templates that can help accelerate the process of creating appchain

- [**`Pop Network`**](https://learn.onpop.io/appchains/pop-cli/new#templates){target=\_blank} - designed with user-friendliness in mind, Pop Network offers an approachable starting point for new developers, with a simple CLI interface for creating appchains 

Choosing a suitable template depends on your project’s unique requirements, level of customization, and integration needs. Starting from a template speeds up development and lets you focus on implementing your chain’s unique features rather than the foundational blockchain setup.

## Where to Go Next

For more detailed information on implementing this process, refer to the following sections:

- [Add a Pallet to Your Runtime](/develop/parachains/customize-parachain/add-existing-pallets/)
- [Create a Custom Pallet](/develop/parachains/customize-parachain/make-custom-pallet/)
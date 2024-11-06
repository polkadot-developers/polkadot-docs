---
title: Polkadot SDK
description: Learn about the Polkadot SDK, what it is comprised of, and how it powers and forms the foundation of the Polkadot protocol
---

## Introduction

The Polkadot SDK is a powerful and versatile developer kit designed to facilitate building on the Polkadot network. It provides the necessary components for creating custom blockchains, parachains, generalized rollups, and more. Written in the Rust Programming Language, it puts security and robustness at the forefront of its design.

!!!tip
    See some notable projects that use the Polkadot SDK as part of their tech stack: [Trophy Section: Notable Downstream Projects.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html#trophy-section-notable-downstream-projects){target=\blank}

Whether you're building a standalone chain or deploying a parachain on Polkadot, this SDK equips developers with the libraries and tools needed to manage runtime logic, compile the codebase, and utilize core features like staking, governance, and Cross-Consensus Messaging (XCM). It also provides a means for building generalized peer-to-peer systems, whether a blockchain or an alternative technology. The Polkadot SDK houses the following overall functionality:

- Networking & Peer-to-peer communication (powered by [Libp2p](./glossary.md#libp2p))
- Consensus protocols, such as [BABE](./glossary.md#blind-assignment-of-blockchain-extension-babe), [GRANDPA](./glossary.md#grandpa), or [Aura](./glossary.md#authority-round-aura)
- Cryptography
- A selection of pre-built modules, called [pallets](./glossary.md#pallet)
- Benchmarking and testing suites
- The ability to create portable, Wasm runtimes

Polkadot's architecture, components, and features are built using the Polkadot SDK. Much of it is contained in the repository on GitHub: [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\blank}. The runtimes for Polkadot and Kusama are kept separately, under the [Polkadot Fellowship](https://github.com/polkadot-fellows/runtimes){target=\blank}, but are also built using the Polkadot SDK.

## Polkadot SDK - An Overview

The Polkadot SDK is composed of five major components:

![](/images/polkadot-protocol/architecture/polkadot-sdk-structure.webp)

- Substrate - a set of libraries for building blockchains
- FRAME - a framework built on Substrate, which is used for building blockchains
- Cumulus - a set of libraries and pallets that can add parachain capabilities to a Substrate/FRAME runtime
- XCM (Cross Consensus Messaging) - The primary format for conveying messages between parachains 
- Polkadot - The node implementation for the Polkadot protocol

### Substrate, FRAME, and Cumulus

- [*Substrate*](./glossary.md#substrate) is a Software Development Kit (SDK) that uses Rust-based libraries and tools to enable you to build application-specific blockchains from modular and extensible components. Application-specific blockchains built with Substrate can run as standalone services or in parallel with other chains to take advantage of the shared security provided by the Polkadot ecosystem. Substrate includes default implementations of the core components of the blockchain infrastructure to allow you to focus on the application logic

- [*FRAME*](./glossary.md#frame-framework-for-runtime-aggregation-of-modularized-entities) provides the core modular and extensible components that make the Substrate software development kit flexible and adaptable to different use cases.
FRAME includes Rust-based programs and libraries that simplify and streamline the development of application-specific logic.
Most of the functionality that FRAME provides takes the form of plug-in modules called [*pallets*](./glossary.md#pallet) that you can add and configure to suit your requirements

- *Cumulus* provides utilities and libraries to turn FRAME-based runtimes into runtimes that can be a parachain on Polkadot. Cumulus runtimes are still FRAME runtimes but contain the necessary functionality that allows for that runtime to become a parachain on a relay chain

### Building Custom Runtimes

Separating responsibilities into client-driven and runtime-driven activities is a critical part of what makes Substrate nodes upgradeable.
The application logic makes your chain unique and is stored on-chain in the form of a WebAssembly binary. If you change the application logic, you simply compile a new WebAssembly binary. You can then submit a transaction to update the WebAssembly binary currently stored on-chain with your updated binary. Because the custom runtime is a self-contained object stored as part of the chain state, you can quickly iterate on the application design and evolve your project as your community grows.

#### Using Substrate and FRAME

Using Substrate and FRAME, you can build proof-of-concept application-specific blockchains without the complexity of building a blockchain from scratch or the limitations of building on a general-purpose blockchain.

With Substrate and FRAME, you can focus on crafting the business logic that makes your chain unique and innovative with the additional benefits of flexibility, upgradeability, open-source licensing, and cross-consensus interoperability.

#### Substrate Nodes and Runtimes

Every blockchain platform relies on a decentralized network of computers—called nodes—that communicate with each other about transactions and blocks.
In general, a node in this context is the software running on the connected devices rather than the physical or virtual machine in the network.
As software, Substrate nodes consist of two main parts with separate responsibilities:

- A **core client** with outer node services to handle network and blockchain infrastructure activity
- A **runtime** with the business logic for state transitions and the current state of the blockchain

## What's Next

- Dive into the Polkadot SDK Rust docs: [Polkadot SDK Docs](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/index.html#){target=\blank}
- Read the Polkadot Protocol Specification: [Polkadot Protocol Specification](https://spec.polkadot.network/){target=\blank}

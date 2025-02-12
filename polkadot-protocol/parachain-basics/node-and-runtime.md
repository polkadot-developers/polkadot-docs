---
title: Node and Runtime
description: Learn how Polkadot SDK-based nodes function, how the client and runtime are separated, and how they communicate using SCALE-encoded data.
---

# Node and Runtime

## Introduction

Every blockchain platform relies on a decentralized network of computers, called nodes, that communicate with each other about transactions and blocks. In this context, a node refers to the software running on the connected devices rather than the physical or virtual machines in the network.

Polkadot SDK-based nodes consist of two main components, each with distinct responsibilities: the client (also called node) and the runtime.

If the system were a monolithic protocol, any modification would require updating the entire system. Instead, Polkadot achieves true upgradeability by defining an immutable meta-protocol (the client) and a protocol (the runtime) that can be upgraded independently.

This separation gives the [Polkadot Relay Chain](/polkadot-protocol/architecture/polkadot-chain){target=\_blank} and all connected [parachains](/polkadot-protocol/architecture/parachains){target=\_blank} an evolutionary advantage over other blockchain platforms.

## Architectural Principles

The Polkadot SDK-based blockchain architecture is fundamentally built on two distinct yet interconnected components:

- **Client (Meta-protocol)**
    - Handles the foundational infrastructure of the blockchain
    - Manages runtime execution, networking, consensus, and other off-chain components
    - Provides an immutable base layer that ensures network stability
    - Upgradable only through hard forks

- **Runtime (Protocol)** 
    - Defines the blockchain's state transition logic
    - Determines the specific rules and behaviors of the blockchain
    - Compiled to WebAssembly (Wasm) for platform-independent execution
    - Capable of being upgraded without network-wide forking

### Advantages of this Architecture

- **Forkless upgrades** - runtime can be updated without disrupting the entire network
- **Modularity** - clear separation allows independent development of client and runtime
- **Flexibility** - enables rapid iteration and evolution of blockchain logic
- **Performance** - WebAssembly compilation provides efficient, cross-platform execution

## Node (Client)

The node, also known as the client, is the core component responsible for executing the Wasm runtime and orchestrating various essential blockchain components. It ensures the correct execution of the state transition function and manages multiple critical subsystems, including:

- **Wasm execution** - runs the blockchain runtime, which defines the state transition rules
- **Database management** - stores blockchain data
- **Networking** - facilitates peer-to-peer communication, block propagation, and transaction gossiping
- **Transaction pool (Mempool)** - manages pending transactions before they are included in a block
- **Consensus mechanism** - ensures agreement on the blockchain state across nodes
- **RPC services** - provides external interfaces for applications and users to interact with the node

## Runtime

The runtime is more than just a set of rules. It's the fundamental logic engine that defines a blockchain's entire behavior. In Polkadot SDK-based blockchains, the runtime represents a complete, self-contained description of the blockchain's state transition function.

### Characteristics

The runtime is distinguished by three key characteristics:

- **Business logic** - defines the complete application-specific blockchain behavior
- **WebAssembly compilation** - ensures platform-independent, secure execution
- **On-chain storage** - stored within the blockchain's state, allowing dynamic updates

### Key Functions

The runtime performs several critical functions, such as:

- Define state transition rules
- Implement blockchain-specific logic
- Manage account interactions
- Control transaction processing
- Define governance mechanisms
- Handle custom pallets and modules

## Communication Between Node and Runtime

The client and runtime communicate exclusively using [SCALE-encoded](/polkadot-protocol/basics/data-encoding){target=\_blank} communication. This ensures efficient and compact data exchange between the two components.

### Runtime APIs

The Runtime API consists of well-defined functions and constants a client assumes are implemented in the Runtime Wasm blob. These APIs enable the client to interact with the runtime to execute blockchain operations and retrieve information. The client invokes these APIs to:

- Build, execute, and finalize blocks
- Access metadata
- Access consensus related information
- Handle transaction execution

### Host Functions

During execution, the runtime can access certain external client functionalities via host functions. The specific functions the client exposes allow the runtime to perform operations outside the WebAssembly domain. Host functions enable the runtime to:

- Perform cryptographic operations
- Access the current blockchain state
- Handle storage modifications
- Allocate memory
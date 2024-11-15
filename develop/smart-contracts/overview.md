---
title: Overview
description: Learn how developers can build smart contracts on Polkadot by leveraging either WASM/ink! or EVM contracts across many different parachains.
---

# Overview

## Introduction

Polkadot is a chain specifically designed to service other chains. As a result, developers cannot deploy smart contract applications directly to Polkadot.

Therefore, developers looking to build smart contract applications in Polkadot need to leverage the smart contract functionality that chains in the Ecosystem offer. Developers can generally choose between two main development paths within the ecosystem. 

On one end, developers can leverage WASM-based smart contracts chains that support [ink!](TODO:update-path){target=\_blank}, a Rust-based smart contract language that acts as an embedded domain-specific language (eSDL) for Rust. This allows developers to benefit from Rust’s syntax, type safety, memory safety, and extensive tooling.

Conversely, developers can deploy EVM smart contracts on Ethereum-compatible chains that Polkadot secures. Due to EVM compatibility, developers can use any smart contract language that compiles to EVM bytecode, like [Solidity](https://soliditylang.org/){target=\_blank} and [Vyper](https://vyperlang.org/){target=\_blank}. Additionally, popular wallets like [MetaMask](https://metamask.io/){target=\_blank} can be connected and developers can leverage tools they are familiar with, like [Remix](https://remix.ethereum.org/){target=\_blank}, [Hardhat](https://hardhat.org/){target=\_blank}, [Foundry](https://getfoundry.sh/){target=\_blank}, among others.

This guide highlights some differences between building smart contract applications or parachains within Polkadot's scalable and interoperable framework. It also explores the different development paths for smart contract developers on Polkadot.

!!!info "Parachain Developer?" 
    If you are a Parachain developer looking to add smart contract functionality to your chain, please check the following sections for [WASM-based](TODO:update-path){target=\_blank} or [EVM-based contracts](TODO:update-path){target=\_blank}.

## Smart Contracts Versus Parachains

In a smart contract, you create a program that executes specific logic isolated to the chain on which it is being executed. All the logic executed is bound to the same state transition rules given by the underlying virtual machine (VM). Consequently, smart contracts are more streamlined to develop, and programs can easily interact with each other through similar interfaces.

``` mermaid
flowchart LR
    A[(Chain State)] --> B[[Virtual Machine]]
    C[Transaction] --> B
    D["Program Logic and Storage<br/>(Smart Contract)"] --> B
    B --> E[(New State)]
    B --> F[Execution Logs]
```

In addition, because smart contracts are programs that execute on top of existing chains, teams don't have to think about the underlying consensus they are built on. 

However, these strengths come with certain limitations. Contracts are immutable by default. Hence, developers have developed different [proxy strategies](https://blog.openzeppelin.com/proxy-patterns){target=\_blank} to be able to upgrade them over time. Generally speaking, such patterns rely on a proxy contract, where the program storage lives, forwarding a call to an implementation contract, and where the execution logic resides. Therefore, smart contract upgrades require changing the implementation contract while retaining the same storage structure, necessitating careful planning. 

Another downside is that smart contracts often follow a gas metering model, where program execution is associated with a given unit and a marketplace is set up to pay for such an execution unit. This fee system is often very rigid, and some complex flows (like account abstraction, among others) have been developed to circumvent this problem.

In contrast, parachains can create their own custom logic and state transition function (STF or runtime) thanks to the modularity provided by the [Polkadot-SDK](TODO:update-path){target=\_blank}. Consequently, logic executed within the parachain runtime can give developers a lot of flexibility when building applications on top of it.

``` mermaid
flowchart LR
    A[(Chain State)] --> B[["STF<br/>[Logic 1]<br/>[Logic 2]<br/>...<br/>[Logic N]"]]
    C[Transaction<br/>for Logic 2] --> B
    B --> E[(New State)]
    B --> F[Execution Logs]
```

Parachains inherently offer features such as logic upgradeability, flexible transaction fee mechanisms, and chain abstraction logic. Moreso, by using Polkadot, parachains can benefit from robust consensus guarantees with little engineering overhead.

!!!info "Additional information" 
    To read more about the differences between smart contracts and parachain runtimes, please Refer to the [Runtime vs. Smart Contracts](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/runtime_vs_smart_contract/index.html){target=\_blank} section of the Polkadot SDK Rust docs. For a more in-depth discussion on choosing between runtime development and smart contract development, you can check the post ["When should one build a Polkadot SDK runtime versus a Substrate (Polkadot SDK) smart contract?"](https://stackoverflow.com/a/56041305){target=\_blank} from Stack Overflow.

## Building a Smart Contract

As stated earlier, Polkadot's primary purpose is to provide security for parachains that connect to it. Therefore, it is not meant to support smart contract execution. Consquently, developers looking to build smart contracts projects in Polkadot need to look into its ecosystem for parachains that support it.

At the time of writing, the Polkadot SDK supports two different smart contracts logic execution:

- **EVM** - through [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank}. It consists of a full Ethereum JSON RPC compatible client, an Ethereum emulation layer, and a [Rust-based EVM](https://github.com/rust-ethereum/evm){target=\_blank}. This is used by chains like [Acala](https://acala.network/){target=\_blank}, [Astar](https://astar.network/){target=\_blank}, [Moonbeam](https://moonbeam.network){target=\_blank} and more
- **Wasm/ink!** - through the [Contracts pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/contracts/){target=\_blank} in the FRAME library. [ink!](https://use.ink/){target=\_blank} is a smart contract language that provides a compiler to Wasm. Wasm contracts can be used by chains like [Astar](https://astar.network/){target=\_blank}
<!---
TODO: We need to consider Pallet Revive and PolkaVM shortly
-->

### EVM Contracts through Frontier

The [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank} project provides a set of modules that enables a Polkadot SDK-based chain to run an Ethereum emulation layer that allows the execution of EVM smart contracts natively with the same API/RPC interface. 

Ethereum addresses (ECDSA) can also be mapped directly to and from the Polkadot SDK's SS58 scheme from existing accounts. Moreover, you can modify Polkadot SDK to use the ECDSA signature scheme directly to avoid any mapping.

At a high level, [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank} is composed of three main components:

- [**Ethereum Client**](https://github.com/polkadot-evm/frontier/tree/master/client){target=\_blank} - an Ethereum JSON RPC compliant client that allows any request coming from an Ethereum tool, such as [Remix](https://remix.ethereum.org/){target=\_blank}, [Hardhat](https://hardhat.org/){target=\_blank} or [Foundry](https://getfoundry.sh/), to be admitted by the network
- [**Pallet Ethereum**](https://docs.rs/pallet-ethereum/latest/pallet_ethereum/){target=\_blank} - a block emulation and Ethereum transaction validation layer that works jointly with the Ethereum client to ensure compatibility with Ethereum tools
- [**Pallet EVM**](https://docs.rs/pallet-evm/latest/pallet_evm/){target=\_blank} - access layer to the [Rust-based EVM](https://github.com/rust-ethereum/evm){target=\_blank}, enabling the execution of EVM smart contract logic natively

Broadly speaking, in this configuration, an EVM transaction follows the path presented in the diagram below:

``` mermaid
flowchart TD
    A[Users and Devs] -->|Send Tx| B[Frontier RPC Ext]
    subgraph C[Pallet Ethereum]
        D[Validate Tx]
        E[Send<br/>Valid Tx]    
    end
    B -->|Interacts with| C
    D --> E
    subgraph F[Pallet EVM]
        G[Rust EVM]
    end
    I[(Current EVM<br/>Emulated State)]

    H[Smart Contract<br/>Solidity, Vyper...] <-->|Compiled to EVM<br/>Bytecode| F

    C --> F
    I --> F
    F --> J[(New Ethereum<br/>Emulated State)]
    F --> K[Execution Logs]

    style C fill:#ffffff,stroke:#000000,stroke-width:1px
    style F fill:#ffffff,stroke:#000000,stroke-width:1px
```

Although it seems complex, users and developers are abstracted of that complexity, and tools can easily interact with the parachain as they would with any other EVM-compatible environment.

The Rust EVM is capable of executing regular [EVM bytecode](https://www.ethervm.io/){target=\_blank}. Consequently, any language that compiles to EVM bytecode can be used to create programs that the parachain can execute.

ou can find more information on deploying EVM smart contracts to [Polkadot's native smart contract platform](TODO:update-path){target=\_blank}, or any of [the ecosystem parachains](TODO:update-path){target=\_blank}.

### Contracts Pallet

The [`pallet_contracts`](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank} provides the execution environment for Wasm-based smart contracts. Consequently, any smart contract language that compiles to Wasm can be executed in a parachain that enables this module.

At the time of writing there are two main languages that can be used for Wasm programs:

- [**ink!**](https://use.ink/){target=\_blank} - it is a Rust-based language that compiles to WASM. It allows developers to inherent all its safety guarantees, and use normal Rust tooling, being the dedicated domain-specific language
- [**Solang**](https://github.com/hyperledger-solang/solang/){target=\_blank} - it is a Solidity-to-Wasm compiler that allows developers to write Solidity-based programs (compatible with Solidity 0.8) that can be executed as Wasm programs in parachains

Broadly speaking, with [`pallet_contracts`](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank}, a transaction follows the path presented in the diagram below:

``` mermaid
flowchart TD
    
    subgraph A[Wasm Bytecode API]
        C[Pallet Contracts]
    end

    B[Users and Devs] -- Interacts with --> A
    
    D[(Current State)]

    E[Smart Contract<br/>ink!, Solidity...] <-->|Compiled to Wasm<br/>Bytecode| A

    D --> A
    A --> F[(New State)]
    A --> G[Execution Logs]

    style A fill:#ffffff,stroke:#000000,stroke-width:1px
```

Learn more on how to deploy Wasm smart contracts on [ecosystem parachains](TODO:update-path){target=\_blank}.
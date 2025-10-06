---
title: Overview
description: Learn about parachains, specialized blockchains on Polkadot that gain shared security and interoperability. Discover how they work and the tools to build them.
categories: Basics, Parachains
---

# Overview

## Introduction

A parachain is a specialized blockchain that connects to the Polkadot relay chain, benefiting from shared security, interoperability, and scalability. Parachains are built using the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank}, a powerful toolkit written in Rust that provides everything needed to create custom blockchain logic while integrating seamlessly with the Polkadot network.

Unlike standalone blockchains that must bootstrap their own validator sets and security, parachains leverage Polkadot's pooled security model. This allows parachain developers to focus on their application-specific functionality rather than consensus and security infrastructure. Parachains can communicate with each other through Cross-Consensus Messaging (XCM), enabling seamless interoperability across the Polkadot ecosystem.

Key capabilities that parachains provide include:

- **Shared Security**: Inherit security from Polkadot's validator set without maintaining your own.
- **Interoperability**: Communicate trustlessly with other parachains via XCM
- **Scalability**: Process transactions in parallel with other parachains
- **Customization**: Build application-specific logic tailored to your use case
- **Upgradeability**: Upgrade runtime logic without hard forks
- **Flexibility**: Choose your own governance, token economics, and features

For a comprehensive understanding of how parachains fit into the broader ecosystem, see the [Polkadot SDK Rust documentation](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html){target=\_blank}.

## Parachain Architecture

Building a parachain involves understanding and utilizing several key components of the Polkadot SDK:

![](/images/develop/parachains/intro-polkadot-sdk/intro-polkadot-sdk-1.webp)

- **[Substrate](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/substrate/index.html){target=\_blank}**: The foundation providing core blockchain primitives and libraries
- **[FRAME](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank}**: A modular framework for building your parachain's runtime logic
- **[Cumulus](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/cumulus/index.html){target=\_blank}**: Essential libraries and pallets that enable parachain functionality
- **[XCM (Cross Consensus Messaging)](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/xcm/index.html){target=\_blank}**: The messaging format for communicating with other parachains and the relay chain
- **[Polkadot](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/polkadot/index.html){target=\_blank}**: The relay chain that provides security and coordination

### Substrate: The Foundation

Substrate provides the core infrastructure that every parachain is built upon. It handles the low-level blockchain functionality, allowing you to focus on your application's unique features. Substrate includes implementations for networking, database management, consensus participation, and the execution environment for your runtime.

Every parachain node consists of two main components:

- **Client (Host)**: Handles infrastructure services

    - Native binary that runs on validator and collator nodes
    - Executes the Wasm-compiled runtime
    - Manages networking, database, mempool, and block production
    - Interfaces with the relay chain for validation

- **Runtime (State Transition Function)**: Contains your business logic

    - Defines how your parachain processes transactions
    - Compiled to [Wasm](https://webassembly.org/){target=\_blank} for deterministic execution
    - Stored on-chain and upgradeable via governance
    - Validated by Polkadot's relay chain validators

```mermaid
%%{init: {'flowchart': {'padding': 5, 'nodeSpacing': 50, 'rankSpacing': 10}}}%%
graph TB
    classDef title font-size:20px,font-weight:bold,stroke-width:0px
    classDef clientStyle font-size:16px,font-weight:bold
    classDef clientSubNodeStyle margin-top:10px
    classDef runtimeCallExecutorStyle padding-top:10px

    subgraph sg1[Parachain<br /> Node]
        direction TB

        I[RuntimeCall Executor]
        B[Wasm Runtime - STF]

        subgraph sg2[Client]
            direction TB
            C[Network and Blockchain<br/>Infrastructure Services<br/>+ Relay Chain Interface]
        end

        I --> B
    end

    class sg1 title
    class sg2 clientStyle
    class C clientSubNodeStyle
    class I runtimeCallExecutorStyle

```

### FRAME: Building Blocks for Your Runtime

FRAME provides modular components called [pallets](/polkadot-protocol/glossary#pallet){target=\_blank} that you can compose to build your parachain's runtime. Each pallet provides specific functionality that you can customize and configure for your needs. This modular approach allows you to quickly assemble complex functionality without writing everything from scratch.

```mermaid
graph LR
    subgraph SP["<b style='font-size:18px;'>Parachain Runtime</b>"]
        direction LR
        Timestamp ~~~ Aura ~~~ ParachainSystem
        Balances ~~~ TransactionPayment ~~~ XcmHandler
        subgraph Timestamp["Timestamp"]
            SS1[Custom Config]
        end
        subgraph Aura["Aura"]
            SS2[Custom Config]
        end
        subgraph ParachainSystem["Parachain System"]
            SS3[Custom Config]
        end
        subgraph Balances["Balances"]
            SS4[Custom Config]
        end
        subgraph TransactionPayment["Transaction Payment"]
            SS5[Custom Config]
        end
        subgraph XcmHandler["XCM Handler"]
            SS6[Custom Config]
        end
        style Timestamp stroke:#FF69B4
        style Aura stroke:#FF69B4
        style ParachainSystem stroke:#FF69B4
        style Balances stroke:#FF69B4
        style TransactionPayment stroke:#FF69B4
        style XcmHandler stroke:#FF69B4
        style SS1 stroke-dasharray: 5
        style SS2 stroke-dasharray: 5
        style SS3 stroke-dasharray: 5
        style SS4 stroke-dasharray: 5
        style SS5 stroke-dasharray: 5
        style SS6 stroke-dasharray: 5

    end
    subgraph AP["<b style='font-size:18px;'>Available FRAME Pallets</b>"]
        direction LR
        A1[Aura]~~~A2[Parachain<br>System]~~~A3[XCM<br>Handler]~~~A4[Transaction<br>Payment]
        B1[Identity]~~~B2[Balances]~~~B3[Assets]~~~B4[EVM]
        C1[Timestamp]~~~C2[Staking]~~~C3[Contracts]~~~C4[and more...]
    end
    AP --> SP
```

### Cumulus: Parachain-Specific Functionality

Cumulus is what transforms a Substrate-based runtime into a parachain-capable runtime. It provides the essential components for communicating with the relay chain, participating in Polkadot's consensus, and handling parachain-specific operations like block validation and collation.

Key Cumulus components include:

- **Parachain System Pallet**: Core parachain functionality and relay chain communication
- **Collator Consensus**: Block production logic for parachain collators
- **Relay Chain Interface**: APIs for interacting with the Polkadot relay chain
- **Validation Data**: Handling proof-of-validity data required by relay chain validators

## Why Build a Parachain?

Building a parachain offers several compelling advantages over building a standalone blockchain or deploying on a general-purpose smart contract platform:

- **Shared Security**: Leverage Polkadot's robust validator set from day one without bootstrapping your own security
- **Native Interoperability**: Communicate trustlessly with other parachains through XCM without bridges
- **Flexibility**: Full control over your blockchain's logic, governance, and economics
- **Forkless Upgrades**: Update your runtime logic through governance without requiring validators to upgrade their nodes
- **Scalability**: Process transactions in parallel with other parachains while maintaining composability
- **Open Source**: Built on open-source technology with a vibrant developer community

## Getting Started with Parachain Development

Building a parachain requires understanding the relationship between your chain and the Polkadot relay chain. Key considerations include:

- Designing your runtime logic and choosing appropriate pallets
- Implementing XCM for cross-chain communication
- Setting up collator infrastructure for block production
- Deploying your parachain by obtaining coretime
- Configuring governance and upgrade mechanisms

## In This Section

:::INSERT_IN_THIS_SECTION:::
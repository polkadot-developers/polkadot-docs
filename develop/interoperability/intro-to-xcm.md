---
title: Introduction to XCM
description: Unlock blockchain interoperability with XCM — Polkadot's Cross-Consensus Messaging format for cross-chain interactions.
---

# Introduction to XCM

## Introduction

Polkadot’s unique value lies in its ability to enable interoperability between parachains and other blockchain systems. At the core of this capability is XCM (Cross-Consensus Messaging)—a flexible messaging format that facilitates communication and collaboration between independent consensus systems.

With XCM, one chain can send intents to another one, fostering a more interconnected ecosystem. Although it was developed specifically for Polkadot, XCM is a universal format, usable in any blockchain environment. This guide provides an overview of XCM’s core principles, design, and functionality, alongside practical examples of its implementation.

## Messaging Format

XCM is not a protocol but a standardized [messaging format](https://github.com/polkadot-fellows/xcm-format){target=\_blank}. It defines the structure and behavior of messages but does not handle their delivery. This separation allows developers to focus on crafting instructions for target systems without worrying about transmission mechanics.

XCM messages are intent-driven, outlining desired actions for the receiving blockchain to consider and potentially alter its state. These messages do not directly execute changes; instead, they rely on the host chain's environment to interpret and implement them. By utilizing asynchronous composability, XCM facilitates efficient execution where messages can be processed independently of their original order, similar to how RESTful services handle HTTP requests without requiring sequential processing.

## The Four Principles of XCM

XCM adheres to four guiding principles that ensure robust and reliable communication across consensus systems:

- **Asynchronous** - XCM messages operate independently of sender acknowledgment, avoiding delays due to blocked processes
- **Absolute** - XCM messages are guaranteed to be delivered and interpreted accurately, in order, and timely. Once a message is sent, one can be sure it will be processed as intended
- **Asymmetric** - XCM messages follow the 'fire and forget' paradigm meaning no automatic feedback is provided to the sender. Any results must be communicated separately to the sender with an additional message back to the origin
- **Agnostic** - XCM operates independently of the specific consensus mechanisms, making it compatible across diverse systems

These principles guarantee that XCM provides a reliable framework for cross-chain communication, even in complex environments.

## The XCM Tech Stack

![Diagram of the XCM tech stack](/images/develop/interoperability/intro-to-xcm/intro-to-xcm-01.webp)

The XCM tech stack is designed to faciliate seamless interoperable communication between chains that reside within the Polkadot ecosystem. XCM can be used to ecpress the meaning of the messages over each of the communicatio channels.

## Core Functionalities of XCM

XCM enhances cross-consensus communication by introducing several powerful features:

- **Programmability** - supports dynamic message handling, allowing for more comprehensive use cases. Includes branching logic, safe dispatches for version checks, and asset operations like NFT management
- **Functional Multichain Decomposition** - enables mechanisms such as remote asset locking, asset namespacing, and inter-chain state referencing, with contextual message identification 
- **Bridging** - establishes a universal reference framework for multi-hop setups, connecting disparate systems like Ethereum and Bitcoin with the Polkadot relay chain acting as a universal location

The standardized format for messages allows parachains to handle tasks like user balances, governance, and staking, freeing the Polkadot relay chain to focus on shared security. These features make XCM indispensable for implementing scalable and interoperable blockchain applications. 

## XCM Example

The following is a simplified XCM message demonstrating a token transfer from Alice to Bob on the same chain (ParaA).

```rust
--8<-- 'code/develop/interoperability/intro-to-xcm/XCM-first-look.rs'
```

The message consists of three instructions described as follows:

- [**WithdrawAsset**](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#withdrawasset){target=\_blank} - transfers a specified number of tokens from Alice's account to a holding register
```rust
--8<-- 'code/develop/interoperability/intro-to-xcm/XCM-first-look.rs:2:2'
```
    - `Here` - the native parachain token
    - `amount` - the number of tokens that are transferred

    The first instruction takes as an input the MultiAsset that should be withdrawn. The MultiAsset describes the native parachain token with the `Here` keyword. The `amount` parameter is the number of tokens that are transferred. The withdrawal account depends on the origin of the message. In this example the origin of the message is Alice. The `WithdrawAsset` instruction moves `amount` number of native tokens from Alice's account into the holding register.

- [**BuyExecution**](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#buyexecution){target=\_blank} - allocates fees to cover the execution [weight](/polkadot-protocol/glossary/#weight){target=\_blank} of the XCM instructions
```rust
--8<-- 'code/develop/interoperability/intro-to-xcm/XCM-first-look.rs:3:6'
```

    - `fees` - describes the asset in the holding register that should be used to pay for the weight 
    - `weight_limit` - defines the maximum fees that can be used to buy weight

- [**DepositAsset**](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#depositasset){target=\_blank} - moves the remaining tokens from the holding register to Bob’s account
```rust
--8<-- 'code/develop/interoperability/intro-to-xcm/XCM-first-look.rs:7:16'
```

    - `All` - the wildcard for the asset(s) to be deposited. In this case, all assets in the holding register should be deposited
    
This step-by-step process showcases how XCM enables precise state changes within a blockchain system. You can find a complete XCM message example in the [XCM repository](https://github.com/paritytech/xcm-docs/blob/main/examples/src/0_first_look/mod.rs){target=\_blank}.

## Overview

XCM revolutionizes cross-chain communication by enabling use cases such as:

- Token transfers between blockchains
- Asset locking for cross-chain smart contract interactions
- Remote execution of functions on other blockchains

These functionalities empower developers to build innovative, multi-chain applications, leveraging the strengths of various blockchain networks. To stay updated on XCM’s evolving format or contribute, visit the [XCM repository](https://github.com/paritytech/xcm-docs/blob/main/examples/src/0_first_look/mod.rs){target=\_blank}.

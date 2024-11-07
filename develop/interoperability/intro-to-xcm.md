---
title: Introduction to XCM
description: A basic introduction to the world of XCM, covering a range of topics that will help you get started with learning XCM and its use cases.
---

# Introduction to XCM

## What is 'XCM' - Cross-Consensus Messaging?

XCM (Cross Consensus Messaging) is a language that enables communication between chains in the Polkadot ecosystem. XCM allows blockchains to seamlessly send messages to each other, enabling the transfer of assets, data, and other information across different chains and smart contracts. XCM was devleoped within the Polkadot ecosystem, but is designed to be general enough to provide a common format for cross-consensus communication that can be used anywhere. This document will provide you with an introduction to XCM, covering the basics to help you futher understand the language.

One of Polkadot's main functionalities is interoperability amongst parachains and any other participating consensus-driven systems. XCM is the language through which complex, cross-consensus interactions can occur. Two blockchains can "speak" XCM to seamlessly interact with each other using a standard messaging format.

## A format, not a protocol

It's important to remember that XCM is a [messaging format](https://github.com/polkadot-fellows/xcm-format){target=\_blank}, not a protocol. It cannot be used to 'send messages' but instead express what should be done by the receiver. XCM does not define how messages are delivered but rather how they should look, act, and contain relative instructions to the on-chain actions the message intends to perform.

XCM messagges, by themselves, are not considered transactions. XCM just describes how to change the state of the target network, but the message by itself doesn't perform the state change. 

This partly ties to what is called asynchronous composability, which allows XCM messages to bypass the concept of time-constrained mechanisms, like on-chain scheduling and execution over time in the correct order in which it was intended.

XCM works similarly to how RESTful services use REST as an architectural style of development, where HTTP requests contain specific parameters to perform an action.

## The Four Principles of XCM

XCM has four high-level core design principles which it stands to follow:

- **Asynchronous** - XCM messages do not assume the sender will be blocking on its completion
- **Absolute** - XCM messages are guaranteed to be delivered and interpreted accurately, in an order, and timely fashion. Once a message is sent, one can be sure it will be processed as intended
- **Asymmetric** - XCM messages, by default, do not provide results that inform the sender that the message was received; they follow the 'fire and forget' paradigm. Any results must be communicated separately to the sender with an additional message back to the origin
- **Agnostic** - XCM makes no assumptions about the nature of the consensus systems between which the messages are passed. XCM, as a message format, should be usable in any system that derives finality through consensus

These four crucial design decisions allow for XCM messages to be a reliable yet convenient way to properly convey the intentions from one consensus system to another without any compatibility issues.

## The XCM Tech Stack

<figure markdown>
  <img src="../../../images/develop/parachain-devs/interoperability/xcm-tech-stack/cross-consensus-tech-stack-e9c1b2ab8b6f6f3f9a78b3a412af0698.png" width="800">
  <figcaption>The XCM Tech Stack</figcaption>
</figure>

## Core Functionalities of XCM

Some of the key features and additions to cross-consensus messaging include:

- **Programmability** - the ability to set expectations for messages, allowing for more comprehensive use cases, safe dispatches for version checking, branching, and NFT/Asset support
- **Functional Multichain Decomposition** - the ability to define mechanisms for cross-referencing and performing actions on other chains on behalf of the originating chain (remote locking), context/id for these messages, and asset namespacing
- **Bridging** - introduces the concept of a universal location, which allows for a base reference for global consensus systems in multi-hop setups. This location is above the parent relay chain and other consensus systems like Ethereum or Bitcoin.

A core part of the vision that XCM provides is improving communication between the chains to make system parachains a reality. For example, the Polkadot relay chain handles more than just parachain management and shared security - it handles user balances/assets, governance, and staking. Ideally, the relay chain should be for what it's intended to be - a place for shared security. System parachains can alleviate these core responsibilities from the relay chain but only by using a standard format like XCM.

This is where system parachains come in, where each of these core responsibilities can be delegated to a system parachain respectively.

## XCM Example
Below shows a simple example of an XCM message. In the example, the native token is withdrawn from the account of Alice and deposited into the account of Bob. The message simulates a transfer between the two accoubts in the same consensus system (ParaA).  You can find the complete example in the [repo](https://github.com/paritytech/xcm-docs/tree/main/examples){target=_blank}.

```rust
--8<-- 'code/develop/parachain-devs/interoperability/XCM/XCM-first-look.rs'
```
The message consists of three instructions

* **WithdrawAsset**
```rust
--8<-- 'code/develop/parachain-devs/interoperability/XCM/XCM-withdrawasset.rs'
```
    The first instruction takes as an input the MultiAsset that should be withdrawn. The MultiAsset describes the native parachain token with the `Here` keyword. The `amount` parameter is the number of tokens that are transferred. The withdrawal account depends on the origin of the message. In this example the origin of the message is Alice. The `WithdrawAsset` instruction moves `amount` number of native tokens from Alice's account into the holding register.

* **BuyExecution**
```rust
--8<-- 'code/develop/parachain-devs/interoperability/XCM/XCM-buyexecution.rs'
```
    To execute XCM instructions, weight (some amount of resources) has to be bought. The amount of weight needed to execute an XCM depends on the number and type of instructions in the XCM. The `BuyExecution` instruction pays for the weight using the `fees`. The `fees` parameter describes the asset in the holding register that should be used for paying for the weight. The `weight_limit` parameter defines the maximum amount of fees that can be used for buying weight. There are special occasions where it is not necessary to buy weight. 

* **DepositAsset**
```rust
--8<-- 'code/develop/parachain-devs/interoperability/XCM/XCM-depositasset.rs'
```
    The `DepositAsset` instruction is used to deposit funds from the holding register into the account of the beneficiary. You dont actually know how much is remaining in the holding register after the `BuyExecution` instruction, but that does not matter since you can specify a wildcard for the asset(s) which should be deposited.
    
    In this case, the wildcard is `All`, meaning that all assets in the holding register at that point in the execution should be deposited. The beneficiary in this case is the account of Bob in the current consensus system. 
    
    When the three instructions are combined, you withdraw `amount` native tokens from the account of Alice, pay for the execution of these instructions, and deposit the remaining tokens in the account of Bob.

## Overview
XCM enables different consensus systems to communicate with each other. Common cross-consensus use-cases include:

* Sending tokens between blockchains
* Locking assets on one blockchain in order to gain some benefit on a smart contract on another blockchain
* Calling specific functions on another blockchain

These are just a few basic examples; once you can communicate with other consensus systems, you can create applications that can leverage multiple blockchains' capabilities. The potential it provides is especially evident in an ecosystem of highly specialized blockchains like Polkadot.

Decentralized distributed systems are very complex, so it's easy to make errors when building interactions between them. XCM is meant to be used by developers to package these interactions into their runtime logic before exposing that functionality to end users.

XCM is constantly evolving; the format is expected to change over time. To keep up with the development of the format, or to propose changes, go to the [XCM format repository](https://github.com/polkadot-fellows/xcm-format).

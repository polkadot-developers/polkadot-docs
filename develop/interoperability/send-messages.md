---
title: Send XCM Messages
description: Unlock blockchain interoperability with XCM — Polkadot's Cross-Consensus Messaging format for cross-chain interactions.
---

# Send XCM Messages

## Introduction

This page provides an overview of the `pallet-xcm`, an essential FRAME pallet enabling parachains to send and execute XCM messages, interact with the XCM executor, and facilitate asset transfers between chains. It will help you understand the key roles and primary extrinsics of the `pallet-xcm`

## XCM Frame Pallet Overview

The XCM pallet ([`pallet-xcm`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/index.html){target=\_blank}) provides a set of pre-defined, commonly used [`XCVM programs`](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#12-the-xcvm){target=\_blank} in the form of a set of extrinsics using [FRAME](https://docs.substrate.io/reference/frame-pallets/).

This pallet provides some default implementations for traits required by [`XcmConfig`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm_benchmarks/trait.Config.html#associatedtype.XcmConfig){target=\_blank}. The [XCM executor](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/struct.XcmExecutor.html){target=\_blank} is also included as an associated type within the pallet's configuration.

!!!note
    For further details on configuration, please check the [XCM Configuration](TODO-add link here) page.

Where the [`XCM format`](https://github.com/polkadot-fellows/xcm-format){target=\_blank} defines a set of instructions used to construct XCVM programs, `pallet-xcm` defines a set of extrinsics that can be utilized to build XCVM programs, either to target the local or external chains. The `pallet-xcm` functionality is divided into three categories:

- **Primitive** - dispatchable functions to locally execute an XCM

- **High-level** - dispatchable functions for asset transfers

- **Version negotiation-specific** - dispatchable functions

### Key Roles of `pallet-xcm`

The XCM pallet plays a central role in managing cross-chain messages, with its primary responsibilities including:

1. **Execute XCM Messages**
    - Facilitates interaction with the XCM executor to validate and execute messages, ensuring they meet security and filter criteria.

2. **Send Messages Across Chains**
    - Enables authorized origins to send XCM messages to other chains, ensuring controlled and secure cross-chain communication.

3. **Reserve-Based Transfers and Teleports**
    - Provides a streamlined way to move assets between chains, governed by filters to restrict operations to designated origins.

4. **XCM Version Negotiation**
    - Ensures compatibility by determining the appropriate XCM version for communication between chains.

5. **Asset Trapping and Recovery**
    - Manages trapped assets, allowing them to be safely claimed and reallocated if issues arise during cross-chain transfers.

6. **Support for XCVM Operations**
    - Handles various state and configuration requirements critical for executing cross-consensus programs within the XCVM framework.

This page will highlight the two **Primary Primitive Calls** which are responsible for sending and executing XCVM programmes as dispatchable functions within the pallet.

## Primary Calls of XCM Pallet

### Execute

This call contains direct access to the XCM executor. It is the job of the executor to check the message and ensure that no barrier/filter will block the execution of the XCM.

Once it is deemed valid, the message will then be locally executed, therein returning the outcome as an event. This operation is executed on behalf of whichever account has signed the extrinsic.

!!!note
    More information about Execute extrisic can be found [here](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.execute){target=\_blank}.

!!!warning
    It is possible for partial executions to occur.

### Send

This call specifies where a message should be sent (via a transport method) externally to a particular destination, i.e. a parachain, smart contract, or any system which is governed by consensus. In contrast to execute, the executor is not called locally, as the execution will occur on the destination chain.

!!!note
    More information about Send extrisic can be found [here](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.send){target=\_blank}.

## XCM Router

It’s important to note that the XCM pallet needs the [`XcmRouter`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/trait.Config.html#associatedtype.XcmRouter){target=\_blank} to send XCMs. It is used to dictate where XCMs are allowed to be sent, and which XCM transport protocol to use. 

E.G. Kusama uses the `ChildParachainRouter` which only allows for **Downward Message Passing (DMP)** from the relay to parachains to occur.

!!!note
    For more information about XCM transport protocols, check out the [XCM Channels](TODO:update-path){target=\_blank} page.


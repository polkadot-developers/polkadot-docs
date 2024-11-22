---
title: Send XCM Messages
description: Unlock blockchain interoperability with XCM — Polkadot's Cross-Consensus Messaging format for cross-chain interactions.
---

# XCM - Send Messages

## XCM Frame Pallet Overview

The XCM pallet [(pallet-xcm)](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/pallet-xcm/src/lib.rs) provides a set of pre-defined, commonly used XCVM programs in the form of a set of extrinsics using [FRAME](https://docs.substrate.io/reference/frame-pallets/).

This pallet provides some default implementations for traits required by XcmConfig. The XCM executor is also included as an associated type within the pallet's configuration. For further details on XCM Configurations, see the previous page here.

Where the XCM format defines a set of instructions used to construct XCVM programs, pallet-xcm defines a set of extrinsics that can be utilized to build XCVM programs, either to target the local or external chains. pallet-xcm's functionality is separated into three categories:

**Primitive** - Dispatchable functions to locally execute an XCM

**High-level** - Dispatchable functions for asset transfers

**Version negotiation-specific** - Dispatchable functions

This page will highlight the two Primary Primitive Extrinsics which are responsible for sending and executing XCVM programmes as dispatchable functions within the pallet.

## Two Primary Extrinsics

### Execute

This call contains direct access to the XCM executor. It is the job of the executor to check the message and ensure that no barrier/filter will block the execution of the XCM.

Once it is deemed valid, the message will then be locally executed, therein returning the outcome as an event. This operation is executed on behalf of whichever account has signed the extrinsic.

**Note:** It is possible for partial executions to occur.

### Send

This call specifies where a message should be sent (via a transport method) externally to a particular destination, i.e. a parachain, smart contract, or any system which is governed by consensus. In contrast to execute, the executor is not called locally, as the execution will occur on the destination chain.

**XCM Router**

It’s important to note that the XCM pallet needs the XcmRouter to send XCMs. It is used to dictate where XCms are allowed to be sent, and which XCM transport protocol to use. 
E.G. Kusama uses the ChildParachainRouter which only allows for Downward Message Passing from the relay to parachains to occur.

For more information about XCM transport protocols, check out the XCM Channels page here.


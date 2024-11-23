---
title: Send XCM Messages
description: Unlock blockchain interoperability with XCM, Polkadot's Cross-Consensus Messaging format, enabling secure cross-chain communication.
---

# Send XCM Messages

## Introduction

This page provides an overview of the [`pallet-xcm`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/index.html){target=\_blank}, an essential FRAME pallet enabling parachains to send and execute XCM messages, interact with the [XCM executor](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/index.html){target=\blank}, and facilitate asset transfers between chains. It will help you understand the key roles and primary extrinsics of the `pallet-xcm`

## XCM Frame Pallet Overview

The [`pallet-xcm`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/index.html){target=\_blank} provides a set of pre-defined, commonly used [`XCVM programs`](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#12-the-xcvm){target=\_blank} in the form of a [set of extrinsics](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/index.html){target=\blank}.

This pallet provides some [default implementations](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/struct.Pallet.html#implementations){target=\_blank} for traits required by [`XcmConfig`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm_benchmarks/trait.Config.html#associatedtype.XcmConfig){target=\_blank}. The [XCM executor](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/struct.XcmExecutor.html){target=\_blank} is also included as an associated type within the pallet's configuration.

!!!note
    For further details on the XCM configuration, refer to the [XCM Configuration](/develop/interoperability/xcm-config/) page.

Where the [`XCM format`](https://github.com/polkadot-fellows/xcm-format){target=\_blank} defines a set of instructions used to construct XCVM programs, `pallet-xcm` defines a set of extrinsics that can be utilized to build XCVM programs, either to target the local or external chains. The `pallet-xcm` functionality is divided into three categories:

- **Primitive** - dispatchable functions to execute XCM locally

- **High-level** - functions for asset transfers between chains

- **Version negotiation-specific** - functions for managing XCM version compability

### Key Roles of `pallet-xcm`

The XCM pallet plays a central role in managing cross-chain messages, with its primary responsibilities including:

- **Execute XCM Messages** - interacts with the XCM executor to validate and execute messages, adhering to predefined security and filter criteria

- **Send Messages Across Chains** - allows authorized origins to send XCM messages, enabling controlled cross-chain communication

- **Reserve-Based Transfers and Teleports** - supports asset movement between chains, governed by filters that restrict operations to authorized origins

- **XCM Version Negotiation** - ensures compatibility by selecting the appropriate XCM version for inter-chain communication

- **Asset Trapping and Recovery** - manages trapped assets, enabling safe reallocation or recovery when issues occur during cross-chain transfers

- **Support for XCVM Operations** - oversees state and configuration requirements necessary for executing cross-consensus programs within the XCVM framework

## Primary Calls of XCM Pallet

This page will highlight the two **Primary Primitive Calls** which are responsible for sending and executing XCVM programmes as dispatchable functions within the pallet.

### Execute

The [`execute`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.execute){target=\_blank} call provides direct interaction with the XCM executor, allowing for the execution of XCM messages originating from a locally signed origin. The executor validates the message, ensuring it complies with any configured barriers or filters before proceeding with execution.

Once validated, the message is executed locally, and an event is emitted to indicate the result—whether the message was fully executed or only partially completed. Execution is capped by a maximum weight ([`max_weight`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.execute.field.max_weight){target=\_blank}), and if the required weight exceeds this limit, the message will not be executed.

```rust
pub fn execute<T: Config>(
    message: Box<VersionedXcm<<T as Config>::RuntimeCall>>,
    max_weight: Weight,
)
```

!!!note
    For further details on the Execute extrinsic, see the pallet-xcm documentation{target=_blank}.

!!!warning
    Partial execution of messages may occur depending on the constraints or barriers applied.

<!-- TODO: we should complement this page with some real examples of where the .execute() call is used, or maybe how to use it through papi or something like that -->

### Send

The [send](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variant.send){target=\_blank} call enables sending XCM messages to a specified destination. This could be a parachain, smart contract, or any external system governed by consensus. Unlike the execute call, the message is not executed locally; instead, it is transported to the destination chain for processing.

The destination is defined using a [Location](https://paritytech.github.io/polkadot-sdk/master/xcm_docs/glossary/index.html#location){target=\_blank}, which describes the target chain or system. This ensures precise delivery through the configured XCM transport mechanism.

```rust
pub fn send<T: Config>(
    dest: Box<MultiLocation>,
    message: Box<VersionedXcm<<T as Config>::RuntimeCall>>,
)
```
!!!note For further details on the Send extrinsic, refer to the pallet-xcm documentation{target=_blank}.

<!-- TODO: we should complement this page with some real examples of where the .send() call is used, or maybe how to use it through papi or something like that -->

## XCM Router

The [`XcmRouter`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/trait.Config.html#associatedtype.XcmRouter){target=\_blank} is a critical component required by the XCM pallet to facilitate sending XCM messages. It defines where messages can be sent and determines the appropriate XCM transport protocol for the operation.

For instance, the Kusama network employs the [`ChildParachainRouter`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_common/xcm_sender/struct.ChildParachainRouter.html){target=\_blank}, which restricts routing to [Downward Message Passing (DMP)](https://wiki.polkadot.network/docs/learn-xcm-transport#dmp-downward-message-passing){target=\_blank} from the relay chain to parachains, ensuring secure and controlled communication.

```rust
--8<-- 'https://raw.githubusercontent.com/polkadot-fellows/runtimes/refs/heads/main/relay/kusama/src/xcm_config.rs:122:125'
```

!!!note 
    For more details on XCM transport protocols, see the [XCM Channels](/develop/interoperability/xcm-channels/){target=\_blank} page.
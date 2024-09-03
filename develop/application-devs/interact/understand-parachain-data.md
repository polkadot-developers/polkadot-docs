---
title: Understanding Metadata
description: Metadata helps in creating chain-tailored experiences for your applications.  Learn how to understand, interact with, and decipher metadata from Polkadot SDK-based chains.
---

Polkadot SDK-based blockchain networks are designed to expose their runtime information, allowing developers to learn granular details regarding pallets, RPC calls, and runtime APIs. The metadata also exposes their related documentation. The chain's metadata is SCALE-encoded, allowing for the development of browser-based, mobile, or desktop applications that can seamlessly support the chain's runtime upgrades. It is also possible to develop applications that are compatible with multiple Polkadot SDK-based chains at once.

## Exposing Runtime Information as Metadata

To interact with a node or the state of the blockchain, you need to know how to connect to the chain and access the exposed runtime features.
This interaction involves a Remote Procedure Call (RPC) through a node endpoint address, typically through a secure web socket connection.
An application developer typically needs to know about the contents of the runtime's logic, including the following details:

- The version of the runtime that the application is connecting to
- The APIs that the runtime supports
- The pallets that are implemented for that specific runtime
- The functions and their type signatures that are defined for that specific runtime
- The custom types that are defined for that specific runtime
- The parameters that the runtime exposes for users to set

As the Polkadot SDK is modular and provides a composable framework for building blockchains, there are limitless opportunities to customize the schema of properties.
Each runtime can be configured with its properties, including function calls and types which can be changed over time with runtime upgrades.

To capture the information that's unique to a runtime, the Polkadot SDK enables you to generate the runtime **metadata** schema.

The metadata for a runtime describes the pallets in-use and types that are defined for a specific version of the runtime.

For every pallet, the metadata includes information about its storage items, functions, events, errors, and constants.
The metadata also includes type definitions for any custom types included in the runtime.

Because it provides a complete inventory of the runtime of a chain, the metadata is the key to enabling client applications to interact with the node, parse responses, and correctly format message payloads that are sent back to that chain.

## Generating Metadata

To efficiently use the blockchain's networking resources and minimize the transmission data over the network, the metadata schema is encoded using the [Parity SCALE Codec](https://github.com/paritytech/parity-scale-codec?tab=readme-ov-file#parity-scale-codec){target=\_blank}.
This encoding is done automatically through the [`scale-info`](https://docs.rs/scale-info/latest/scale_info/){target=\_blank}crate.

At a high level, generating the metadata involves the following steps:

- The pallets in the runtime logic exposes callable functions, types, parameters, and documentation that need to be encoded in the metadata
- The `scale-info` crate collects type information for the pallets in the runtime and builds a registry of the pallets that exist in a particular runtime and the relevant types for each pallet in the registry. The type information is detailed enough to enable encoding and decoding for every type
- The [`frame-metadata`](https://github.com/paritytech/frame-metadata){target=\_blank} crate describes the structure of the runtime based on the registry provided by the `scale-info` crate
- Nodes provide the RPC method `state_getMetadata` to return a complete description of all the types in the current runtime as a hex-encoded vector of SCALE-encoded bytes

## Getting Metadata for a Runtime

The type information provided by the metadata enables applications to communicate with nodes with different versions of the runtime and across chains that expose different calls, events, types, and storage items.
The metadata also allows libraries to generate a substantial portion of the code needed to communicate with a given node, enabling libraries like [`subxt`](https://github.com/paritytech/subxt){target=\_blank} to generate front-end interfaces that are specific to a target chain.


### Using Polkadot JS

Use the [Polkadot JS Portal](https://polkadot.js.org/apps/#/rpc){target=\_blank} to connect to a blockchain or node and select the **state** endpoint and the **getMetadata** method to return the metadata in JSON format.

### Using `curl` For Metadata Retrieval

By calling the node's RPC endpoint, the metadata for the network can be fetched.  This request returns the metadata in bytes rather than human-readable JSON:

```sh
curl -H "Content-Type: application/json" \
-d '{"id":1, "jsonrpc":"2.0", "method": "state_getMetadata"}' \
https://rpc.polkadot.io
```

### Using `subxt` For Metadata Retrieval

[`subxt`](https://github.com/paritytech/subxt) may also be used to fetch the metadata of any data in a human-readable JSON format: 

```sh
subxt metadata  --url wss://rpc.polkadot.io --format json > spec.json
```

Another option is to use the [`subxt` explorer web UI](https://paritytech.github.io/subxt-explorer/#/){target=\_blank}.

## Client Applications and Metadata

Client applications use the metadata to interact with the node, parse responses, and format message payloads sent to the node.
To use the metadata, client applications must use the [SCALE codec library](https://github.com/paritytech/parity-scale-codec?tab=readme-ov-file#parity-scale-codec){target=\_blank} to encode and decode RPC payloads.
Because the metadata exposes how every type is expected to be decoded, applications can send, retrieve, and process application information without manual encoding and decoding.

## Metadata Format

Although the SCALE-encoded bytes can be decoded using the `frame-metadata` and [`parity-scale-codec`](https://github.com/paritytech/parity-scale-codec){target=\_blank} libraries, there are other tools—such as `subxt` and the Polkadot-JS API—that can convert the raw data to human-readable JSON format.

The types and type definitions included in the metadata returned by the `state_getMetadata` RPC call depend on the metadata version of the runtime.
In general, the metadata includes the following information:

- A constant that identifies the file as containing metadata
- The version of the metadata format used in the runtime
- Type definitions for all types used in the runtime and generated by the `scale-info` crate
- Pallet information for all of the pallets included in the runtime in the order that they are defined in the `construct_runtime` macro

The following example illustrates a condensed and annotated section of metadata decoded and converted to JSON:

--8<-- 'code/application-devs/interact/metadata-format.md'

<!-- todo: signed transactions -> glossary -->

The constant `1635018093` is a magic number that identifies the file as a metadata file.
The rest of the metadata has divided into the `types`, `pallets` and `extrinsic` sections.
The `types` section contains an index of the types and for each type information about its type signature.
The `pallets` section contains information about each of the pallets in the runtime.
The `extrinsic` section describes the type identifier and transaction format version that the runtime is using.
Different extrinsic versions can have different formats, especially when considering signed transactions.

### Pallets

The following is a condensed and annotated example of a single element in the `pallets` array (the [`sudo`](https://paritytech.github.io/polkadot-sdk/master/pallet_sudo/index.html) pallet):

--8<-- 'code/application-devs/interact/sudo-metadata.md'

Every element contains the name of the pallet that it represents and information about its storage, calls, events, and errors.
You can look up details about the definition of the calls, events, and errors by viewing the type index identifier.
The type index identifier for each item is the `u32` integer used to access the type information for that item.
For example, the type index identifier for calls in the Sudo pallet is 117.
If you view information for that type identifier in the `types` section of the metadata, it provides information about the available calls including the documentation for each call.

For example, the following is a condensed excerpt of the calls for the Sudo pallet:

```json
--8<-- 'code/application-devs/interact/sudo-metadata-calls.json'
```

For each field, you can access type information and metadata for the following:

- Storage metadata provides the information that is required to enable applications to get information for specific storage items
- Call metadata includes information about the runtime calls defined by the `#[pallet]` macro including call names, arguments and documentation
- Event metadata provides the metadata generated by the `#[pallet::event]` macro, including the name, arguments, and documentation for each pallet event
- Constants metadata provides metadata generated by the `#[pallet::constant]` macro, including the name, type, and hex-encoded value of the constant
- Error metadata provides metadata generated by the `#[pallet::error]` macro, including the name and documentation for each pallet error

You should note that type identifiers change from time to time.
You should avoid relying type identifiers in your applications.

### Extrinsic

Extrinsic metadata is generated by the runtime and provides useful information about how transactions are formatted.
When decoded, the metadata contains the transaction version and the list of signed extensions.
For example:

```json
--8<-- 'code/application-devs/interact/extrinsic-metadata.json'
```

The type system is [composite](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_runtime_types/index.html).
Each type identifier contains a reference to a specific type or to another type identifier that provides information about the associated primitive types.
For example, you can encode the `BitVec<Order, Store>` type, but to decode it properly you must know the types used for the `Order` and `Store` types.
To find type information for `Order` and `Store`, you can use the path in the decoded JSON to locate their type identifiers.

## Other RPC APIs

A standard node comes with the following APIs to interact with a node:

- [`AuthorApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/author/trait.AuthorApiServer.html): An API to make calls into a full node, including authoring extrinsics and verifying session keys
- [`ChainApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/chain/trait.ChainApiServer.html): An API to retrieve block header and finality information
- [`OffchainApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/offchain/trait.OffchainApiServer.html): An API for making RPC calls for offchain workers
- [`StateApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/state/trait.StateApiServer.html): An API to query information about on-chain state such as runtime version, storage items, and proofs
- [`SystemApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/system/trait.SystemApiServer.html): An API to retrieve information about network state, such as connected peers and node roles

## Where to go next

- [Subxt Explorer](https://paritytech.github.io/subxt-explorer/#/){target=\_blank}
- [Metadata Portal 🌗](https://github.com/paritytech/metadata-portal){target=\_blank}
- [De[code] Sub[strate]](https://github.com/paritytech/desub){target=\_blank}
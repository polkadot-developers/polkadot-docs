---
title: Understanding Metadata
description: Learn how to interact and decipher parachain data (metadata).
---

Polkadot SDK-based blockchain networks are designed to expose their runtime information, allowing developers to learn granular details regarding pallets, RPC calls, and runtime APIs. The metadata also exposes their related documentation. The chain's metadata is SCALE-encoded, allowing for the development of browser-based, mobile, or desktop applications that can seamlessly support the chain's runtime upgrades. It is also possible to develop applications that are compatible with multiple Polkadot SDK-based chains at once.

## Exposing runtime information as metadata

To interact with a node or the state of the blockchain, you need to know how to connect to the chain and access the exposed runtime features.
This interaction involves a Remote Procedure Call (RPC) through a node endpoint address, typically through a secure web socket connection.
An application developer typically needs to know about the contents of the runtime's logic, including the following details:

- The version of the runtime that the application is connecting to.
- The APIs that the runtime supports.
- The pallets that are implemented for that specific runtime.
- The functions and their type signatures that are defined for that specific runtime.
- The custom types that are defined for that specific runtime.
- The parameters that the runtime exposes for users to set.

As the Polkadot SDK is modular and provides a composable framework for building blockchains, there are limitless opportunities to customize the schema of properties.
Instead, every runtime is configured with its own set of properties and those properties—including functions and types—can change over time with runtime upgrades.

To capture the information that's unique to a runtime, the Polkadot SDK enables you to generate the runtime **metadata** schema.
The metadata for a runtime describes the pallets in-use and types that are defined for a specific version of the runtime.

For every pallet, the metadata includes information about its storage items, functions, events, errors, and constants.
The metadata also includes type definitions for any custom types included in the runtime.

Because it provides a complete inventory of the runtime, the metadata is the key to enabling client applications to interact with the node, parse responses, and format message payloads correctly per chain.

## Generating metadata

To minimize the bandwidth required to transmit data over the network, the metadata schema is encoded using the [SCALE codec library](https://github.com/paritytech/parity-scale-codec?tab=readme-ov-file#parity-scale-codec).
This encoding is done automatically for you when you compile a node by using the [`scale-info`](https://docs.rs/scale-info/latest/scale_info/) crate.

At a high level, generating the metadata involves the following steps:

- The pallets in the runtime logic exposes callable functions, types, parameters, and documentation that need to be encoded in the metadata.

- The `scale-info` crate collects type information for the pallets in the runtime and builds a registry of the pallets that exist in a particular runtime and the relevant types for each pallet in the registry.
  The type information is detailed enough to enable encoding and decoding for every type.

- The [`frame-metadata`](https://github.com/paritytech/frame-metadata) crate describes the structure of the runtime based on the registry provided by the `scale-info` crate.

- Nodes provide the RPC method `state_getMetadata` to return a complete description of all the types in the current runtime as a hex-encoded vector of SCALE-encoded bytes.

<!-- The following diagram provides a simplified overview of how the metadata is generated when the runtime logic is compiled and then accessed by connecting to the node with an RPC request.

![Compiling the runtime generates the metadata](/media/images/docs/metadata.png) -->

## Getting metadata for a runtime

There are several ways you can get the metadata for a runtime.
For example, you can do any of the following:

- Use the [Polkadot Portal](https://polkadot.js.org/apps/#/rpc) to connect to a blockchain or node and select the **state** endpoint and the **getMetadata** method to return the metadata in JSON format.
- Use the command-line `polkadot-js-api` to call the `state_getMetadata` RPC method to return the metadata as a hex-encoded vector of SCALE-encoded bytes.
- Use the `subxt metadata` command to download the metadata in JSON, hex, or raw bytes.
- Use the `sidecar` API and `/runtime/metadata` endpoint to connect to a node and retrieve the metadata in JSON format.

The type information provided by the metadata enables applications to communicate with nodes with different versions of the runtime and across chains that expose different calls, events, types, and storage items.
The metadata also allows libraries to generate a substantial portion of the code needed to communicate with a given node, enabling libraries like [`subxt`](https://github.com/paritytech/subxt) to generate front-end interfaces that are specific to a target chain.


### Using `subxt` for metadata retrieval

One of the quickest ways is to use `subxt`, which you may use to fetch the metadata of any data in a human-readable JSON format: 

```sh
subxt metadata  --url wss://rpc.polkadot.io --format json > spec.json
```

Another option is to use the [`subxt` explorer web UI](https://paritytech.github.io/subxt-explorer/#/).

## Client applications and metadata

Client applications use the metadata to interact with the node, parse responses, and format message payloads sent to the node.
To use the metadata, client applications must use the [SCALE codec library](https://github.com/paritytech/parity-scale-codec?tab=readme-ov-file#parity-scale-codec) to encode and decode RPC payloads.
Because the metadata exposes how every type is expected to be decoded, applications can send, retrieve, and process application information without manual encoding and decoding.

## Metadata format

Although the SCALE-encoded bytes can be decoded using the `frame-metadata` and [`parity-scale-codec`](https://github.com/paritytech/parity-scale-codec) libraries, there are other tools—such as `subxt` and the Polkadot-JS API—that can convert the raw data to human-readable JSON format.

The types and type definitions included in the metadata returned by the `state_getMetadata` RPC call depend on the metadata version of the runtime.
In general, the metadata includes the following information:

- A constant that identifies the file as containing metadata.
- The version of the metadata format used in the runtime.
- Type definitions for all types used in the runtime and generated by the `scale-info` crate.
- Pallet information for all of the pallets included in the runtime in the order that they are defined in the `construct_runtime` macro.

The following example illustrates a condensed and annotated section of metadata decoded and converted to JSON:

```json
[
  1635018093,
  {
    "V14": {
      "types": {
        "types": [
          {
            // index of types
          }
        ]
      },
      "pallets": [
        {
          // index of pallets and within each pallet the metadata each pallet exposes
        }
      ],
      "extrinsic": {
        "ty": 126, // the type index identifier that defines the format of an extrinsic
        "version": 4, // the transaction version used to encode and decode an extrinsic
        "signed_extensions": [
          {
            // index of signed extensions
          }
        ]
      },
      "ty": 141 // the type ID for the system pallet
    }
  }
]
```

<!-- todo: signed transactions -> glossary -->

The constant `1635018093` is a magic number that identifies the file as a metadata file.
The rest of the metadata has divided into the `types`, `pallets` and `extrinsic` sections.
The `types` section contains an index of the types and for each type information about its type signature.
The `pallets` section contains information about each of the pallets in the runtime.
The `extrinsic` section describes the type identifier and transaction format version that the runtime is using.
Different extrinsic versions can have different formats, especially when considering signed transactions.

### Pallets

The following is a condensed and annotated example of a single element in the `pallets` array:

```json
{
  "name": "Sudo",        // name of the pallet
  "storage": {           // storage information for the pallet
      "prefix": "Sudo",  // database prefix for the pallet storage items
      "entries": [
        {
          "name": "Key",
          "modifier": "Optional",
          "ty": {
             "Plain": 0
          },
          "default": [
             0
          ],
          "docs": [
             "The `AccountId` of the sudo key."
          ]
        }
      ]
  },
  "calls": {       // pallet call types
      "ty": 117    // type identifier in the types section
  },
  "event": {       // pallet event types
      "ty": 42     // type identifier in the types section
  },
  "constants": [], // pallet constants
  "error": {       // pallet error types
      "ty": 124    // type identifier in the types section
          },
  "index": 8       // index identifier for the pallet in the runtime
},
```

Every element contains the name of the pallet that it represents and information about its storage, calls, events, and errors.
You can look up details about the definition of the calls, events, and errors by viewing the type index identifier.
The type index identifier for each item is the `u32` integer used to access the type information for that item.
For example, the type index identifier for calls in the Sudo pallet is 117.
If you view information for that type identifier in the `types` section of the metadata, it provides information about the available calls including the documentation for each call.

For example, the following is a condensed excerpt of the calls for the Sudo pallet:

```json
    {
      "id": 117,
      "type": {
          "path": [
              "pallet_sudo",
              "pallet",
              "Call"
          ],
          "params": [
            {
              "name": "T",
              "type": null
            }
          ],
          "def": {
              "variant": {
                  "variants": [
                    {
                      "name": "sudo",
                      "fields": [
                        {
                          "name": "call",
                          "type": 114,
                          "typeName": "Box<<T as Config>::RuntimeCall>"
                        }
                  ],
                      "index": 0,
                      "docs": [
                        "Authenticates the sudo key and dispatches a function call with `Root` origin.",
                      ]
                    },
                    {
                      "name": "sudo_unchecked_weight",
                      "fields": [
                        {
                          "name": "call",
                          "type": 114,
                          "typeName": "Box<<T as Config>::RuntimeCall>"
                        },
                        {
                          "name": "weight",
                          "type": 8,
                          "typeName": "Weight"
                        }
                      ],
                      "index": 1,
                      "docs": [
                        "Authenticates the sudo key and dispatches a function call with `Root` origin.",
                      ]
                    },
                    {
                      "name": "set_key",
                      "fields": [
                        {
                          "name": "new",
                          "type": 103,
                          "typeName": "AccountIdLookupOf<T>"
                        }
                      ],
                      "index": 2,
                      "docs": [
                        "Authenticates the current sudo key and sets the given AccountId (`new`) as the new sudo",
                      ]
                    },
                    {
                      "name": "sudo_as",
                      "fields": [
                        {
                          "name": "who",
                          "type": 103,
                          "typeName": "AccountIdLookupOf<T>"
                        },
                        {
                          "name": "call",
                          "type": 114,
                          "typeName": "Box<<T as Config>::RuntimeCall>"
                        }
                      ],
                      "index": 3,
                      "docs": [
                        "Authenticates the sudo key and dispatches a function call with `Signed` origin from",
                        "a given account.",
                      ]
                    }
                  ]
                }
              },
            },
```

For each field, you can access type information and metadata for the following:

- Storage metadata provides the information that is required to enable applications to get information for specific storage items.
- Call metadata includes information about the runtime calls defined by the `#[pallet]` macro including call names, arguments and documentation.
- Event metadata provides the metadata generated by the `#[pallet::event]` macro, including the name, arguments, and documentation for each pallet event.
- Constants metadata provides metadata generated by the `#[pallet::constant]` macro, including the name, type, and hex-encoded value of the constant.
- Error metadata provides metadata generated by the `#[pallet::error]` macro, including the name and documentation for each pallet error.

You should note that type identifiers change from time to time.
You should avoid relying type identifiers in your applications.

### Extrinsic

Extrinsic metadata is generated by the runtime and provides useful information about how transactions are formatted.
When decoded, the metadata contains the transaction version and the list of signed extensions.
For example:

```json
    "extrinsic": {
        "ty": 126,
        "version": 4,
        "signed_extensions": [
          {
            "identifier": "CheckNonZeroSender",
            "ty": 132,
            "additional_signed": 41
          },
          {
            "identifier": "CheckSpecVersion",
            "ty": 133,
            "additional_signed": 4
          },
          {
            "identifier": "CheckTxVersion",
            "ty": 134,
            "additional_signed": 4
          },
          {
            "identifier": "CheckGenesis",
            "ty": 135,
            "additional_signed": 11
          },
          {
            "identifier": "CheckMortality",
            "ty": 136,
            "additional_signed": 11
          },
          {
            "identifier": "CheckNonce",
            "ty": 138,
            "additional_signed": 41
          },
          {
            "identifier": "CheckWeight",
            "ty": 139,
            "additional_signed": 41
          },
          {
            "identifier": "ChargeTransactionPayment",
            "ty": 140,
            "additional_signed": 41
          }
        ]
      },
      "ty": 141
    }
  }
]
```

The type system is [composite](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_runtime_types/index.html).
Each type identifier contains a reference to a specific type or to another type identifier that provides information about the associated primitive types.
For example, you can encode the `BitVec<Order, Store>` type, but to decode it properly you must know the types used for the `Order` and `Store` types.
To find type information for `Order` and `Store`, you can use the path in the decoded JSON to locate their type identifiers.

## Other RPC APIs

A standard node comes with the following APIs to interact with a node:

- [`AuthorApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/author/trait.AuthorApiServer.html): An API to make calls into a full node, including authoring extrinsics and verifying session keys.
- [`ChainApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/chain/trait.ChainApiServer.html): An API to retrieve block header and finality information.
- [`OffchainApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/offchain/trait.OffchainApiServer.html): An API for making RPC calls for offchain workers.
- [`StateApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/state/trait.StateApiServer.html): An API to query information about on-chain state such as runtime version, storage items, and proofs.
- [`SystemApiServer`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/system/trait.SystemApiServer.html): An API to retrieve information about network state, such as connected peers and node roles.


<!-- todo: link offchain worker page -->
## Connecting to a node

Applications typically connect to Substrate nodes by using JSON-RPC methods through an open HTTP or WebSocket port.
Most applications use a WebSocket port because a single connection can be used for multiple messages to and from a node.
With an HTTP connection, applications can only send and receive responses one message at a time.
The most common reason you would use HTTP to connect to a node is if you want to fetch data using offchain workers.

As an alternative to connecting using RPC, you can use the [Polkadot API (PAPI)](https://github.com/polkadot-api/polkadot-api).

It runs in a browser and allows applications to create their own light client node (via [smoldot](https://github.com/smol-dot/smoldot?tab=readme-ov-file#introduction)) and connect directly to the exposed JSON-RPC endpoint.

## Building front-end applications

The following libraries use the [JSON-RPC API](https://github.com/paritytech/jsonrpsee) to enable applications to interact with nodes:

| Name                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Language   |
|--:----------------------------------------------|--:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--:---------|
| [Polkadot API](https://papi.how)                | Provides a TypeScript toolkit for crafting interactions with Polkadot SDK-based chains. The toolkit includes FRAME utilities, a functional effect system, and a fluent API to facilitate multi-step, multi-chain interactions for end users without compromising performance or safety.                                                                                                                                                                                                                                          | Typescript |
| [`subxt`](https://github.com/paritytech/subxt/) | Provides a Rust library that generates a statically-typed Rust interface to interact with a node's RPC APIs based on a target chain's metadata. The `subxt`—submit extrinsics—library enables you to build lower-level applications—such as non-browser graphical user interfaces, chain-specific CLIs, or user-facing applications that require type-safe communication between the node and the generated interface—that prevent users from constructing transactions with bad inputs or submitting calls that don't exist. | Rust       |

For more information about the JSON-RPC API and the latest interface specification, see the [JSON-RPC specification](https://paritytech.github.io/json-rpc-interface-spec/).

## Where to go next

- [View Subxt's Tool for looking at metadata](https://paritytech.github.io/subxt-explorer/#/)
- [Generate a metadata QR code](https://github.com/paritytech/metadata-portal)
- [Get backwards-compatible metadata (desub)](https://github.com/paritytech/desub)
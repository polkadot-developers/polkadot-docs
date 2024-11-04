---
title: Generate Chain Specs and WASM
description: Describes the role of the chain specification in a network, how to specify its parameters when starting a node, and how to customize and distribute it.
---

# Generate Chain Specs and WASM

## Introduction

A _chain specification_ is the collection of information that describes a Polkadot SDK-based network. When starting a node, a chain specification is a crucial parameter, providing the genesis configurations, bootnodes, and other parameters relating to that particular network. It identifies the network that a blockchain node connects to, the other nodes that it initially communicates with, and the initial state that nodes must agree on to produce blocks.

The chain specification is defined using the [`ChainSpec`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/struct.GenericChainSpec.html){target=\_blank} struct. This struct separates the information required for a chain into two parts:

- A _client specification_ that contains information used by the _node_ to communicate with network participants and send data to telemetry endpoints. Many of these chain specification settings can be overridden by command-line options when starting a node or can be changed after the blockchain has started

- The initial _genesis state_ that all nodes in the network agree on. The genesis state must be established when the blockchain is first started and it cannot be changed thereafter without starting an entirely new blockchain

!!!note
    To learn more about the particularities about chain specifications, refer to the [reference docs](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/chain_spec_genesis/index.html){target=\_blank}.


## Node Settings Customization

For the node, the chain specification controls information such as:

- The bootnodes the node will communicate with
- The server endpoints for the node to send telemetry data to
- The human and machine-readable names for the network the node will connect to

The chain specification can be customized to include additional information. For example, you can configure the node to connect to specific blocks at specific heights to prevent long range attacks when syncing a new node from genesis.

Note that you can customize node settings after genesis. However, nodes only add peers that use the same [`protocolId`](https://paritytech.github.io/polkadot-sdk/master/polkadot_parachain_lib/chain_spec/trait.ChainSpec.html#tymethod.protocol_id){target=_blank}.

## Genesis Configuration Customization

All nodes in the network must agree on the genesis state before they can agree on any subsequent blocks. The information configured in the genesis portion of a chain specification is used to create a genesis block. It takes effect when you start the first node and cannot be overridden with command-line options. However, you can configure some information in the genesis portion of a chain specification. For example, you can customize the genesis portion of the chain specification to include information such as:

- Initial account balances
- Accounts that are initially part of a governance council
- The account that controls the `sudo` key
- Any other genesis state for a pallet

Nodes also require the compiled Wasm for executing the runtime logic on the chain, so the initial runtime must also be supplied in the chain specification.

## Declaring storage items for a runtime

In most cases, a runtime requires some storage items to be configured at genesis. This includes the initial state for pallets, for example, how much balance `Alice` or `Bob` has, or the account that has sudo permissions.

These storage values are configured in the genesis portion of the chain specification. You can either create a [patch](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/index.html#chain-spec-formats){target=_blank}  file for [`chain-spec-builder`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/chain_spec_genesis/index.html){target=_blank} to ingest, or if you're using `chain_spec.rs`, the pallet can be configured in the code.

## Chain specification JSON format

Users generally work with the JSON format of the chain specification. Internally, the chain specification is embodied by the [`GenericChainSpec`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/struct.GenericChainSpec.html){target=\_blank} struct, with specific properties accessible through the [`ChainSpec`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/trait.ChainSpec.html){target=\_blank} struct. The chain specification includes the following keys:

- `name` - the human-readable name for the network
- `id` - the machine-readable identifier for the network
- `chainType` - the type of chain to start (refer to [ChainType](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/enum.ChainType.html){target=\_blank} for more details)
- `bootNodes` - a list of multiaddresses belonging to the chain's boot nodes
- `telemetryEndpoints` - an optional list of multiaddresses for telemetry endpoints, with verbosity levels ranging from 0 to 9 (0 being the lowest verbosity)
- `protocolId` - the optional protocol identifier for the network
- `forkId` - an optional fork ID that should typically be left empty; it can be used to signal a fork at the network level when two chains share the same genesis hash
- `properties` - custom properties provided as a key-value JSON object
- `codeSubstitutes` - an optional mapping of block numbers to Wasm code
- `genesis` - the genesis configuration for the chain

For example, the following JSON shows a basic chain specification file:

```json
{
  "name": "chainName",
  "id": "chainId",
  "chainType": "Local",
  "bootNodes": [],
  "telemetryEndpoints": null,
  "protocolId": null,
  "properties": null,
  "codeSubstitutes": {},
  "genesis": {
      "code": "0x..."
    }
  }
}
``` 


## Creating a Custom Chain Specification

To create a custom chain specification, you can the `chain-spec-builder` tool. This a CLI tool that is used for generating chain specifications from the runtime of a node. Patch files may be used for genesis values, or a "baseline" chain specification can be generated:

```bash
chain-spec-builder create -v -r <path-to-wasm-runtime-here>
```

## Raw chain specifications

With runtime upgrades, the blockchain's runtime can be upgraded with newer business logic. Chain specifications contain information structured in a way that can be understood by the node's runtime. For example, consider this excerpt of a common entry for a chain specification:

```json
"sudo": {
  "key": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

In the JSON file, this key and its associated value are human-readable text. However, this information can't be stored in this format in the underlying storage structures that Substrate uses. Before you can use the chain specification to initialize the genesis storage for a node, the human-readable keys must be transformed into actual storage keys that allow the values to be stored in the storage trie. This transformation is straight-forward, but it requires that the chain specification to be encoded in a format that node runtime can read.

To enable a node with an upgraded runtime to synchronize with a chain from genesis, the plain chain specification is encoded in a **raw** format.
The raw format enables you distribute chain specifications that all nodes can use to synchronize the chain even after runtime upgrades.

Nodes support the `--raw` command-line option to produce the raw chain specifications.
For example, you can produce the raw chain specification for a human-readable `myCustomSpec.json` file by running the following command:

```bash
polkadot-parachain build-spec --chain myCustomSpec.json --raw > customSpecRaw.json
```

After the conversion to the raw format, the `sudo key` snippet looks like this:

```json
"0x50a63a871aced22e88ee6466fe5aa5d9": "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
```
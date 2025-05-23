---
title: Generate Chain Specs
description: Describes the role of the chain specification in a network, how to specify its parameters when starting a node, and how to customize and distribute it.
---

# Generate Chain Specs

## Introduction

A chain specification collects information that describes a Polkadot SDK-based network. A chain specification is a crucial parameter when starting a node, providing the genesis configurations, bootnodes, and other parameters relating to that particular network. It identifies the network a blockchain node connects to, the other nodes it initially communicates with, and the initial state that nodes must agree on to produce blocks.

The chain specification is defined using the [`ChainSpec`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/struct.GenericChainSpec.html){target=\_blank} struct. This struct separates the information required for a chain into two parts:

- **Client specification** - contains information the _node_ uses to communicate with network participants and send data to telemetry endpoints. Many of these chain specification settings can be overridden by command-line options when starting a node or can be changed after the blockchain has started

- **Initial genesis state** - agreed upon by all nodes in the network. It must be set when the blockchain is first started and cannot be changed after that without starting a whole new blockchain

## Node Settings Customization

For the node, the chain specification controls information such as:

- The bootnodes the node will communicate with
- The server endpoints for the node to send telemetry data to
- The human and machine-readable names for the network the node will connect to

The chain specification can be customized to include additional information. For example, you can configure the node to connect to specific blocks at specific heights to prevent long-range attacks when syncing a new node from genesis.

Note that you can customize node settings after genesis. However, nodes only add peers that use the same [`protocolId`](https://paritytech.github.io/polkadot-sdk/master/sc_service/struct.GenericChainSpec.html#method.protocol_id){target=_blank}.

## Genesis Configuration Customization

All nodes in the network must agree on the genesis state before they can agree on any subsequent blocks. The information configured in the genesis portion of a chain specification is used to create a genesis block. When you start the first node, it takes effect and cannot be overridden with command-line options. However, you can configure some information in the genesis section of a chain specification. For example, you can customize it to include information such as:

- Initial account balances
- Accounts that are initially part of a governance council
- The account that controls the `sudo` key
- Any other genesis state for a pallet

Nodes also require the compiled Wasm to execute the runtime logic on the chain, so the initial runtime must also be supplied in the chain specification. For a more detailed look at customizing the genesis chain specification, be sure to check out the [Polkadot SDK Docs](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/chain_spec_genesis/index.html){target=_blank}.

## Declaring Storage Items for a Runtime

A runtime usually requires some storage items to be configured at genesis. This includes the initial state for pallets, for example, how much balance specific accounts have, or which account will have sudo permissions.

These storage values are configured in the genesis portion of the chain specification. You can create a [patch](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/index.html#chain-spec-formats){target=_blank} file and ingest it using the [`chain-spec-builder`](https://paritytech.github.io/polkadot-sdk/master/staging_chain_spec_builder/index.html){target=_blank} utility, that is explained in the [Creating a Custom Chain Specification](#creating-a-custom-chain-specification) section.

## Chain Specification JSON Format

Users generally work with the JSON format of the chain specification. Internally, the chain specification is embedded in the [`GenericChainSpec`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/struct.GenericChainSpec.html){target=\_blank} struct, with specific properties accessible through the [`ChainSpec`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/trait.ChainSpec.html){target=\_blank} struct. The chain specification includes the following keys:

- **`name`** - the human-readable name for the network
- **`id`** - the machine-readable identifier for the network
- **`chainType`** - the type of chain to start (refer to [`ChainType`](https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/enum.ChainType.html){target=\_blank} for more details)
- **`bootNodes`** - a list of multiaddresses belonging to the chain's boot nodes
- **`telemetryEndpoints`** - an optional list of multiaddresses for telemetry endpoints with verbosity levels ranging from 0 to 9 (0 being the lowest verbosity)
- **`protocolId`** - the optional protocol identifier for the network
- **`forkId`** - an optional fork ID that should typically be left empty; it can be used to signal a fork at the network level when two chains share the same genesis hash
- **`properties`** - custom properties provided as a key-value JSON object
- **`codeSubstitutes`** - an optional mapping of block numbers to Wasm code
- **`genesis`** - the genesis configuration for the chain

For example, the following JSON shows a basic chain specification file:

```json
--8<-- "code/develop/parachains/deployment/generate-chain-specs/basic-chain-specs.json"
``` 

## Creating a Custom Chain Specification

To create a custom chain specification, you can use the [`chain-spec-builder`](https://paritytech.github.io/polkadot-sdk/master/staging_chain_spec_builder/index.html){target=\_blank} tool. This is a CLI tool that is used to generate chain specifications from the runtime of a node. To install the tool, run the following command:

```bash
cargo install --git https://github.com/paritytech/polkadot-sdk --force staging-chain-spec-builder
```

To verify the installation, run the following:

```bash
chain-spec-builder --help
```

### Plain Chain Specifications

To create a plain chain specification, first ensure that the runtime has been compiled and is available at the specified path. Next, you can use the following utility within your project:

```bash
chain-spec-builder create -r INSERT_RUNTIME_WASM_PATH INSERT_COMMAND
```

Replace `INSERT_RUNTIME_WASM_PATH` with the path to the runtime Wasm file and `INSERT_COMMAND` with the command to insert the runtime into the chain specification. 

The available commands are:

- **`patch`** - overwrites the runtime's default genesis config with the provided patch. You can check the following [patch file](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/substrate/bin/utils/chain-spec-builder/tests/input/patch.json){target=\_blank} as a reference
- **`full`** - build the genesis config for runtime using the JSON file. No defaults will be used. As a reference, you can check the following [full file](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/substrate/bin/utils/chain-spec-builder/tests/input/full.json){target=\_blank}
- **`default`** - gets the default genesis config for the runtime and uses it in `ChainSpec`. Please note that the default genesis config may not be valid. For some runtimes, initial values should be added there (e.g., session keys, BABE epoch)
- **`named-preset`** - uses named preset provided by the runtime to build the chain spec

### Raw Chain Specifications

With runtime upgrades, the blockchain's runtime can be upgraded with newer business logic. Chain specifications contain information structured in a way that the node's runtime can understand. For example, consider this excerpt of a common entry for a chain specification:

```json
"sudo": {
    "key": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
}
```

In the plain chain spec JSON file, the keys and associated values are in a human-readable format, which can be used to initialize the genesis storage. When the chain specification is loaded, the runtime converts these readable values into storage items within the trie. However, for long-lived networks like testnets or production chains, using the raw format for storage initialization is preferred. This avoids the need for conversion by the runtime and ensures that storage items remain consistent, even when runtime upgrades occur.

To enable a node with an upgraded runtime to synchronize with a chain from genesis, the plain chain specification is encoded in a raw format. The raw format allows the distribution of chain specifications that all nodes can use to synchronize the chain even after runtime upgrades.

To convert a plain chain specification to a raw chain specification, you can use the following utility:

```bash
chain-spec-builder convert-to-raw chain_spec.json
```

After the conversion to the raw format, the `sudo key` snippet looks like this:

```json
"0x50a63a871aced22e88ee6466fe5aa5d9": "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d",
```

The raw chain specification can be used to initialize the genesis storage for a node.

## Generate Custom Keys for Your Collator

To securely deploy your parachain, you must generate custom cryptographic keys for your collators (block producers). Each collator requires two distinct sets of keys with different security requirements and operational purposes.

- **Account keys** - serve as the primary identity and financial controller for your collator. These keys are used to interact with the network and manage funds. They should be treated as cold storage and must never exist on the filesystem of the collator node. Secure offline backup is essential

- **Session keys** - handle block production operations to identify your node and sign blocks on the network. These keys are stored in the parachain keystore and function as operational "hot wallet" keys. If compromised, an attacker could impersonate your node, potentially resulting in slashing of your funds. To minimize these risks, implement regular session key rotation and treat them with the same caution as hot wallet keys

To perform this step, you can use [subkey](https://docs.rs/crate/subkey/latest){target=\_blank}, a command-line tool for generating and managing keys:

```bash
docker run -it parity/subkey:latest generate --scheme sr25519
```

The output should look similar to the following:

--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/key.html'

Ensure that this command is executed twice to generate the keys for both the account and session keys. Save them for future reference.

After generating the plain chain specification, you need to edit this file by inserting the account IDs and session keys in SS58 format generated for your collators in the `collatorSelection.invulnerables` and `session.keys` fields

### Add Invulnerables

In the `collatorSelection.invulnerables` array, add the SS58 addresses (account keys) of your collators. These addresses will be automatically included in the active collator set:

```json
"collatorSelection": {
    "candidacyBond": 16000000000,
    "desiredCandidates": 0,
    "invulnerables": [
        "INSERT_ACCOUNT_ID_COLLATOR_1",
        "INSERT_ACCOUNT_ID_COLLATOR_2",
        "INSERT_ACCOUNT_ID_COLLATOR_3"
    ]
}
```

- **candidacyBond**: Minimum stake required for collator candidates (in planck units)

- **desiredCandidates**: Number of candidates beyond invulnerables (set to 0 for invulnerables-only)

- **invulnerables**: Use the SS58 addresses from your generated account keys as collators

### Add Session Keys

For each invulnerable collator, add a corresponding entry in the `session.keys` array. This maps each collator's account ID to their session keys:

```json
"session": {
    "keys": [
        [
            "INSERT_ACCOUNT_ID_COLLATOR_1",
            "INSERT_ACCOUNT_ID_COLLATOR_1",
            {
                "aura": "INSERT_SESSION_KEY_COLLATOR_1"
            }
        ],
        [
            "INSERT_ACCOUNT_ID_COLLATOR_2",
            "INSERT_ACCOUNT_ID_COLLATOR_2",
            {
                "aura": "INSERT_SESSION_KEY_COLLATOR_2"
            }
        ],
        [
            "INSERT_ACCOUNT_ID_COLLATOR_3",
            "INSERT_ACCOUNT_ID_COLLATOR_3",
            {
                "aura": "INSERT_SESSION_KEY_COLLATOR_3"
            }
        ]
    ],
    "nonAuthorityKeys": []
}
```

## Where to Go Next

After generating a chain specification, you can use it to initialize the genesis storage for a node. Refer to the following guides to learn how to proceed with the deployment of your blockchain:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Obtain Coretime__

    ---

    Learn how to obtain the necessary coretime configuration to synchronize your blockchain’s timestamping and enhance its performance.

    [:octicons-arrow-right-24: Reference](/develop/parachains/deployment/obtain-coretime/)

-   <span class="badge guide">Guide</span> __Deployment__

    ---

    Explore the steps required to deploy your chain specification, ensuring a smooth launch of your network and proper node operation.


    [:octicons-arrow-right-24: Reference](/develop/parachains/deployment/)

-   <span class="badge guide">Guide</span> __Maintenance__

    ---

    Discover best practices for maintaining your blockchain post-deployment, including how to manage upgrades and monitor network health.


    [:octicons-arrow-right-24: Reference](/develop/parachains/maintenance/)

</div>
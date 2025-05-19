---
title: Polkadot Omni Node
description: Run parachain nodes easily with the polkadot-omni-node, a white-labeled binary that can run parachain nodes using a single pre-built solution.
---

# Polkadot Omni Node

## Introduction

The [`polkadot-omni-node`]((https://crates.io/crates/polkadot-omni-node/{{dependencies.crates.polkadot_omni_node.version}})){target=\_blank} stands as a versatile, pre-built binary designed to simplify the operation of nodes for a multitude of parachains. Its core capability lies in its independence from specific runtime code. Instead, it operates by ingesting a chain specification, adapting its functionality based on this input. 

This unique property allows the `polkadot-omni-node` to function as a "white-labeled" solution, capable of running most parachains that do not require node-level customizations.

This guide provides a comprehensive guide for developers seeking to leverage the `polkadot-omni-node` to run a full node for their chosen parachain. 

## Prerequisites

Before getting started, ensure you have the following prerequisites:

- [Rust](https://www.rust-lang.org/tools/install){target=_blank} installed on your operating system

## Install the Polkadot Omni Node

To install the `polkadot-omni-node` globally, execute the the following command:

```bash
cargo install --locked polkadot-omni-node@{{dependencies.crates.polkadot_omni_node.version}}
```

This command will download and install the version {{dependencies.crates.polkadot_omni_node.version}} of the `polkadot-omni-node` binary, making it available for use in your development environment.

Verify the installation by checking the installed version by running:

```bash
polkadot-omni-node --version
```

This should return the version number of the installed `polkadot-omni-node`, confirming that the installation was successful.

## Obtain Chain Specifications

The `polkadot-omni-node` relies on a chain specification file to understand the network configuration of the parachain you intend to run. These JSON files detail the genesis state and runtime settings of the blockchain.

The primary source for chain specification files is the [paritytech/chainspecs](https://github.com/paritytech/chainspecs){target=\_blank} repository. This repository contains chain specifications for various Polkadot ecosystem networks.

To obtain the chain specification for your desired parachain:

1. Navigate to the [Chainspect Collection](https://paritytech.github.io/chainspecs/){target=\_blank} website
2. Locate the chain specification file corresponding to the parachain you wish to run
3. Click on it to view the file's content. Copy it and save it as a .json file on your local machine

## Running a Parachain Full Node

Once you have installed the `polkadot-omni-node` and downloaded the chain specification file, you can launch a full node for your chosen parachain.

To check all the available options and flags for the `polkadot-omni-node`, you can run the following command in your terminal:

```bash
polkadot-omni-node --help
```

In order to run a parachain node, execute the `polkadot-omni-node` command replacing `./INSERT_PARACHAIN_CHAIN_SPEC.json` with the actual path to your downloaded file:

```bash
polkadot-omni-node --chain ./INSERT_PARACHAIN_CHAIN_SPEC.json --sync warp
```

The node will start, load the chain specification, and begin the process of synchronizing with the network defined. You will see logs and status updates in your terminal reflecting the node's operation.

The `--chain` flag instructs the `polkadot-omni-node` to initialize and run a node based on the provided chain specification. Its architecture allows it to interpret the chain specification and operate as a full node for that specific parachain without needing a dedicated node binary.

The `--sync` flag specifies the synchronization method. The `warp` option ensures that your node quickly updates to the latest finalized state. The historical blocks are downloaded in the background as the node continues to operate.
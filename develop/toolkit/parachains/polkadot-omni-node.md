---
title: Polkadot Omni Node
description: Run parachain nodes easily with the polkadot-omni-node, a white-labeled binary that can run parachain nodes using a single pre-built solution.
---

# Polkadot Omni Node

## Introduction

The [`polkadot-omni-node`]((https://crates.io/crates/polkadot-omni-node/{{dependencies.crates.polkadot_omni_node.version}})){target=\_blank} is a versatile, pre-built binary designed to simplify running parachains in the Polkadot ecosystem. Unlike traditional node binaries that are tightly coupled to specific runtime code, the `polkadot-omni-node` operates using an external [chain specification](polkadot-protocol/glossary#chain-specification){target=\_blank} file, allowing it to adapt dynamically to different parachains.

This approach enables it to act as a white-labeled node binary, capable of running most parachains that do not require custom node-level logic or extensions. Developers can leverage this flexibility to test, deploy, or operate parachain nodes without maintaining a dedicated codebase for each network.

This guide provides step-by-step instructions for installing the `polkadot-omni-node`, obtaining a chain specification, and launching a parachain node.

## Prerequisites

Before getting started, ensure you have the following prerequisites:

- **[Rust](https://www.rust-lang.org/tools/install){target=_blank}** - required to build and install the polkadot-omni-node binary

Ensure Rust's `cargo` command is available in your terminal by running:

```bash
cargo --version
```

## Install the Polkadot Omni Node

To install the `polkadot-omni-node` globally using `cargo`, run:

```bash
cargo install --locked polkadot-omni-node@{{dependencies.crates.polkadot_omni_node.version}}
```

This command downloads and installs version {{dependencies.crates.polkadot_omni_node.version}} of the binary, making it available system-wide.

To confirm the installation, run:

```bash
polkadot-omni-node --version
```

You should see the installed version number printed to the terminal, confirming a successful installation.

## Obtain Chain Specifications

The `polkadot-omni-node` uses a chain specification file to configure and launch a parachain node. This file defines the parachain's genesis state and network settings.

The most common source for official chain specifications is the [paritytech/chainspecs](https://github.com/paritytech/chainspecs){target=\_blank} repository. These specifications are also browsable in a user-friendly format via the [Chainspect Collection](https://paritytech.github.io/chainspecs/){target=\_blank} website.

To obtain a chain specification:

1. Visit the [Chainspect Collection](https://paritytech.github.io/chainspecs/){target=\_blank} website

2. Find the parachain you want to run

3. Click the chain spec to open it

4. Copy the JSON content and save it locally as a .json file, e.g., `chain_spec.json`

## Running a Parachain Full Node

Once you've installed the `polkadot-omni-node` and saved the appropriate chain specification file, you can start a full node for your chosen parachain.

To see all available flags and configuration options, run:

```bash
polkadot-omni-node --help
```

To launch the node, run the following command, replacing `./INSERT_PARACHAIN_CHAIN_SPEC.json` with the actual path to your saved chain spec file.

This command will:

- Load the chain specification

- Initialize the node using the provided network configuration

- Begin syncing with the parachain network

```bash
polkadot-omni-node --chain ./INSERT_PARACHAIN_CHAIN_SPEC.json --sync warp
```

- The `--chain` flag tells the `polkadot-omni-node` which parachain to run by pointing to its chain specification file

- The `--sync warp` flag enables warp sync, allowing the node to quickly catch up to the latest finalized state. Historical blocks are fetched in the background as the node continues operating

Once started, the node will begin connecting to peers and syncing with the network. You’ll see logs in your terminal reflecting its progress.
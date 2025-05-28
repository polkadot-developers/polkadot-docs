---
title: Local Development Node
description: Set up a local node for smart contract development. Follow this step-by-step guide to install the substrate node & ETH-RPC for testing in a local environment.
---

# Local Development Node

## Introduction

A local development node provides an isolated blockchain environment where you can deploy, test, and debug smart contracts without incurring network fees or waiting for block confirmations. This guide demonstrates how to set up a local Polkadot SDK-based node with smart contract capabilities.

By the end of this guide, you'll have:

- A running substrate node with smart contract support
- An ETH-RPC adapter for Ethereum-compatible tooling integration accessible at `http://localhost:8545`

## Prerequisites

Before getting started, ensure you have done the following:

- Completed the [Install Polkadot SDK Dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} guide and successfully installed [Rust](https://www.rust-lang.org/){target=\_blank} and the required packages to set up your development environment

## Installation

The Polkadot SDK repository contains both the substrate node implementation and the ETH-RPC adapter required for Ethereum compatibility. Start by cloning the repository and navigating to the project directory:

```bash
git clone https://github.com/paritytech/polkadot-sdk.git
cd polkadot-sdk
```

Next, you need to compile the two essential components for your development environment. The substrate node provides the core blockchain runtime with smart contract support, while the ETH-RPC adapter enables Ethereum JSON-RPC compatibility for existing tooling:

```bash
cargo build --bin substrate-node --release
cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release
```

The compilation process may take 10-30 minutes depending on your system specifications. Release builds are optimized for performance but take longer to compile than debug builds. After successful compilation, you can verify the binaries are available in the `target/release` directory:

- **Substrate node path** - `polkadot-sdk/target/release/substrate-node`
- **ETH-RPC adapter path** - `polkadot-sdk/target/release/eth-rpc`

## Running the Local Node

With the binaries compiled, you can now start your local development environment. The setup requires running two processes.

Start the substrate node first, which will initialize a local blockchain with the `dev` chain specification. This configuration includes `pallet-revive` for smart contract functionality and uses pre-funded development accounts for testing:

```bash
./target/release/substrate-node --dev
```

The node will begin producing blocks immediately and display initialization logs. For debugging purposes or to monitor low-level operations, you can enable detailed logging by setting environment variables before running the command:

```bash
RUST_LOG="error,evm=debug,sc_rpc_server=info,runtime::revive=debug" ./target/release/substrate-node --dev
```

Once the substrate node is running, open a new terminal window and start the ETH-RPC adapter. This component translates Ethereum JSON-RPC calls into substrate-compatible requests, allowing you to use familiar Ethereum tooling like MetaMask, Hardhat, or ethers.js:

```bash
./target/release/eth-rpc --dev
```

Similar to the substrate node, you can enable detailed logging for the ETH-RPC adapter to troubleshoot issues:

```bash
RUST_LOG="info,eth-rpc=debug" ./target/release/eth-rpc --dev
```

Your local development environment is now active and accessible at `http://localhost:8545`. This endpoint accepts standard Ethereum JSON-RPC requests, enabling seamless integration with existing Ethereum development tools and workflows. 

You can connect wallets, deploy contracts using Remix or Hardhat, and interact with your smart contracts as you would on any Ethereum-compatible network.

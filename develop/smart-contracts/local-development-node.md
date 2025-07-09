---
title: Local Development Node
description: Follow this step-by-step guide to install a Substrate node and ETH-RPC adapter for smart contract development in a local environment.
categories: Smart Contracts
---

# Local Development Node

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

A local development node provides an isolated blockchain environment where you can deploy, test, and debug smart contracts without incurring network fees or waiting for block confirmations. This guide demonstrates how to set up a local Polkadot SDK-based node with smart contract capabilities.

By the end of this guide, you'll have:

- A running Substrate node with smart contract support
- An ETH-RPC adapter for Ethereum-compatible tooling integration accessible at `http://localhost:8545`

## Prerequisites

Before getting started, ensure you have done the following:

- Completed the [Install Polkadot SDK Dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} guide and successfully installed [Rust](https://www.rust-lang.org/){target=\_blank} and the required packages to set up your development environment

## Install the Substrate Node and ETH-RPC Adapter

The Polkadot SDK repository contains both the [Substrate node](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/bin/node){target=\_blank} implementation and the [ETH-RPC adapter](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/revive/rpc){target=\_blank} required for Ethereum compatibility. Start by cloning the repository and navigating to the project directory:

```bash
git clone -b {{dependencies.repositories.polkadot_sdk_contracts_node.version}} https://github.com/paritytech/polkadot-sdk.git
cd polkadot-sdk
```

Next, you need to compile the two essential components for your development environment. The Substrate node provides the core blockchain runtime with smart contract support, while the ETH-RPC adapter enables Ethereum JSON-RPC compatibility for existing tooling:

```bash
cargo build --bin substrate-node --release
cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release
```

The compilation process may take some time depending on your system specifications, potentially up to 30 minutes. Release builds are optimized for performance but take longer to compile than debug builds. After successful compilation, you can verify the binaries are available in the `target/release` directory:

- **Substrate node path** - `polkadot-sdk/target/release/substrate-node`
- **ETH-RPC adapter path** - `polkadot-sdk/target/release/eth-rpc`

## Run the Local Node

With the binaries compiled, you can now start your local development environment. The setup requires running two processes.

Start the Substrate node first, which will initialize a local blockchain with the `dev` chain specification. This configuration includes `pallet-revive` for smart contract functionality and uses pre-funded development accounts for testing:

```bash
./target/release/substrate-node --dev
```

The node will begin producing blocks immediately and display initialization logs:

--8<-- 'code/develop/smart-contracts/local-development-node/local-development-node-1.html'

For debugging purposes or to monitor low-level operations, you can enable detailed logging by setting environment variables before running the command:

```bash
RUST_LOG="error,evm=debug,sc_rpc_server=info,runtime::revive=debug" ./target/release/substrate-node --dev
```

Once the Substrate node is running, open a new terminal window and start the ETH-RPC adapter. This component translates Ethereum JSON-RPC calls into Substrate-compatible requests, allowing you to use familiar Ethereum tools like MetaMask, Hardhat, or Ethers.js:

```bash
./target/release/eth-rpc --dev
```

You should see logs indicating that the adapter is ready to accept connections:

--8<-- 'code/develop/smart-contracts/local-development-node/local-development-node-2.html'

Similar to the Substrate node, you can enable detailed logging for the ETH-RPC adapter to troubleshoot issues:

```bash
RUST_LOG="info,eth-rpc=debug" ./target/release/eth-rpc --dev
```

Your local development environment is now active and accessible at `http://localhost:8545`. This endpoint accepts standard Ethereum JSON-RPC requests, enabling seamless integration with existing Ethereum development tools and workflows. 

You can connect wallets, deploy contracts using Remix or Hardhat, and interact with your smart contracts as you would on any Ethereum-compatible network.

---
title: Local Development Node
description: Follow this step-by-step guide to install a Revive Dev node and ETH-RPC
  adapter for smart contract development in a local environment.
categories: Smart Contracts
url: https://docs.polkadot.com/develop/smart-contracts/local-development-node/
---

# Local Development Node

-!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

## Introduction

A local development node provides an isolated blockchain environment where you can deploy, test, and debug smart contracts without incurring network fees or waiting for block confirmations. This guide demonstrates how to set up a local Polkadot SDK-based node with smart contract capabilities.

By the end of this guide, you'll have:

- A running node with smart contract support.
- An ETH-RPC adapter for Ethereum-compatible tooling integration accessible at `http://localhost:8545`.

## Prerequisites

Before getting started, ensure you have done the following:

- Completed the [Install Polkadot SDK Dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} guide and successfully installed [Rust](https://www.rust-lang.org/){target=\_blank} and the required packages to set up your development environment.

## Install the Revive Dev Node and ETH-RPC Adapter

The Polkadot SDK repository contains both the [Revive Dev node](https://github.com/paritytech/polkadot-sdk/tree/8e2b6f742a38bb13688e12abacded0aab2dbbb23/substrate/frame/revive/dev-node){target=\_blank} implementation and the [ETH-RPC adapter](https://github.com/paritytech/polkadot-sdk/tree/8e2b6f742a38bb13688e12abacded0aab2dbbb23/substrate/frame/revive/rpc){target=\_blank} required for Ethereum compatibility. Start by cloning the repository and navigating to the project directory:

```bash
git clone https://github.com/paritytech/polkadot-sdk.git
cd polkadot-sdk
git checkout 8e2b6f742a38bb13688e12abacded0aab2dbbb23
```

Next, you need to compile the two essential components for your development environment. The Substrate node provides the core blockchain runtime with smart contract support, while the ETH-RPC adapter enables Ethereum JSON-RPC compatibility for existing tooling:

```bash
cargo build -p revive-dev-node --bin revive-dev-node --release
cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release
```

The compilation process may take some time depending on your system specifications, potentially up to 30 minutes. Release builds are optimized for performance but take longer to compile than debug builds. After successful compilation, you can verify the binaries are available in the `target/release` directory:

- **Revive Dev node path**: `polkadot-sdk/target/release/revive-dev-node`
- **ETH-RPC adapter path**: `polkadot-sdk/target/release/eth-rpc`

## Run the Local Node

With the binaries compiled, you can now start your local development environment. The setup requires running two processes.

Start the node first, which will initialize a local blockchain with the `dev` chain specification. This configuration includes `pallet-revive` for smart contract functionality and uses pre-funded development accounts for testing:

```bash
./target/release/revive-dev-node --dev
```

The node will begin producing blocks immediately and display initialization logs:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>./target/release/revive-dev-node --dev</span>
  <br />
  <span data-ty>2025-05-29 10:42:35 Substrate Node</span>
  <span data-ty>2025-05-29 10:42:35 ✌️ version 3.0.0-dev-38b7581fc04</span>
  <span data-ty>2025-05-29 10:42:35 ❤️ by Parity Technologies &lt;admin@parity.io&gt;, 2017-2025</span>
  <span data-ty>2025-05-29 10:42:35 📋 Chain specification: Development</span>
  <span data-ty>2025-05-29 10:42:35 🏷 Node name: annoyed-aunt-3163</span>
  <span data-ty>2025-05-29 10:42:35 👤 Role: AUTHORITY</span>
  <span data-ty>2025-05-29 10:42:35 💾 Database: RocksDb at /var/folders/x0/xl_kjddj3ql3bx7752yr09hc0000gn/T/substrate2P85EF/chains/dev/db/full</span>
  <span data-ty>2025-05-29 10:42:40 🔨 Initializing Genesis block/state (state: 0xfc05…482e, header-hash: 0x1ae1…b8b4)</span>
  <span data-ty>2025-05-29 10:42:40 Creating transaction pool txpool_type=SingleState ready=Limit { count: 8192, total_bytes: 20971520 } future=Limit { count: 819, total_bytes: 2097152 }</span>
  <span data-ty>2025-05-29 10:42:40 👴 Loading GRANDPA authority set from genesis on what appears to be first startup.</span>
  <span data-ty>2025-05-29 10:42:40 👶 Creating empty BABE epoch changes on what appears to be first startup.</span>
  <span data-ty>2025-05-29 10:42:40 Using default protocol ID "sup" because none is configured in the chain specs</span>
  <span data-ty>2025-05-29 10:42:40 🏷 Local node identity is: 12D3KooWAH8fgJv3hce7Yv4yKG4YXQiRqESFu6755DBnfZQU8Znm</span>
  <span data-ty>2025-05-29 10:42:40 Running libp2p network backend</span>
  <span data-ty>2025-05-29 10:42:40 local_peer_id=12D3KooWAH8fgJv3hce7Yv4yKG4YXQiRqESFu6755DBnfZQU8Znm</span>
  <span data-ty>2025-05-29 10:42:40 💻 Operating system: macos</span>
  <span data-ty>2025-05-29 10:42:40 💻 CPU architecture: aarch64</span>
  <span data-ty>2025-05-29 10:42:40 📦 Highest known block at #0</span>
  <span data-ty>2025-05-29 10:42:40 Error binding to '127.0.0.1:9615': Os { code: 48, kind: AddrInUse, message: "Address already in use" }</span>
  <span data-ty>2025-05-29 10:42:40 Running JSON-RPC server: addr=127.0.0.1:63333,[::1]:63334</span>
  <span data-ty>2025-05-29 10:42:40 🏁 CPU single core score: 1.24 GiBs, parallelism score: 1.08 GiBs with expected cores: 8</span>
  <span data-ty>2025-05-29 10:42:40 🏁 Memory score: 49.42 GiBs</span>
  <span data-ty>2025-05-29 10:42:40 🏁 Disk score (seq. writes): 1.91 GiBs</span>
  <span data-ty>2025-05-29 10:42:40 🏁 Disk score (rand. writes): 529.02 MiBs</span>
  <span data-ty>2025-05-29 10:42:40 👶 Starting BABE Authorship worker</span>
  <span data-ty>2025-05-29 10:42:40 🥩 BEEFY gadget waiting for BEEFY pallet to become available...</span>
  <span data-ty>2025-05-29 10:42:40 Failed to trigger bootstrap: No known peers.</span>
  <span data-ty>2025-05-29 10:42:42 🙌 Starting consensus session on top of parent 0x1ae19030b13592b5e6fd326f26efc7b31a4f588303d348ef89ae9ebca613b8b4 (#0)</span>
  <span data-ty>2025-05-29 10:42:42 🎁 Prepared block for proposing at 1 (5 ms) hash: 0xe046f22307fba58a3bd0cc21b1a057843d4342da8876fd44aba206f124528df0; parent_hash: 0x1ae1…b8b4; end: NoMoreTransactions; extrinsics_count: 2</span>
  <span data-ty>2025-05-29 10:42:42 🔖 Pre-sealed block for proposal at 1. Hash now 0xa88d36087e7bf8ee59c1b17e0003092accf131ff8353a620410d7283657ce36a, previously 0xe046f22307fba58a3bd0cc21b1a057843d4342da8876fd44aba206f124528df0.</span>
  <span data-ty>2025-05-29 10:42:42 👶 New epoch 0 launching at block 0xa88d…e36a (block slot 582842054 >= start slot 582842054).</span>
  <span data-ty>2025-05-29 10:42:42 👶 Next epoch starts at slot 582842254</span>
  <span data-ty>2025-05-29 10:42:42 🏆 Imported #1 (0x1ae1…b8b4 → 0xa88d…e36a)</span>
</div>


For debugging purposes or to monitor low-level operations, you can enable detailed logging by setting environment variables before running the command:

```bash
RUST_LOG="error,evm=debug,sc_rpc_server=info,runtime::revive=debug" ./target/release/revive-dev-node --dev
```

Once the node is running, open a new terminal window and start the ETH-RPC adapter. This component translates Ethereum JSON-RPC calls into Substrate-compatible requests, allowing you to use familiar Ethereum tools like MetaMask, Hardhat, or Ethers.js:

```bash
./target/release/eth-rpc --dev
```

You should see logs indicating that the adapter is ready to accept connections:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>./target/release/eth-rpc --dev</span>
  <br />
  <span data-ty>2025-05-29 10:48:48 Running in --dev mode, RPC CORS has been disabled.</span>
  <span data-ty>2025-05-29 10:48:48 Running in --dev mode, RPC CORS has been disabled.</span>
  <span data-ty>2025-05-29 10:48:48 🌐 Connecting to node at: ws://127.0.0.1:9944 ...</span>
  <span data-ty>2025-05-29 10:48:48 🌟 Connected to node at: ws://127.0.0.1:9944</span>
  <span data-ty>2025-05-29 10:48:48 💾 Using in-memory database, keeping only 256 blocks in memory</span>
  <span data-ty>2025-05-29 10:48:48 〽️ Prometheus exporter started at 127.0.0.1:9616</span>
  <span data-ty>2025-05-29 10:48:48 Running JSON-RPC server: addr=127.0.0.1:8545,[::1]:8545</span>
  <span data-ty>2025-05-29 10:48:48 🔌 Subscribing to new blocks (BestBlocks)</span>
  <span data-ty>2025-05-29 10:48:48 🔌 Subscribing to new blocks (FinalizedBlocks)</span>
</div>


Similar to the Revive Dev node, you can enable detailed logging for the ETH-RPC adapter to troubleshoot issues:

```bash
RUST_LOG="info,eth-rpc=debug" ./target/release/eth-rpc --dev
```

Your local development environment is now active and accessible at `http://localhost:8545`. This endpoint accepts standard Ethereum JSON-RPC requests, enabling seamless integration with existing Ethereum development tools and workflows. 

You can connect wallets, deploy contracts using Remix or Hardhat, and interact with your smart contracts as you would on any Ethereum-compatible network.

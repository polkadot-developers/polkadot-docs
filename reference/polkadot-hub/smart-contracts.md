---
title: Asset Hub Smart Contracts 
description: Learn how developers can build smart contracts on Asset Hub by leveraging either Wasm/ink! or EVM contracts across many parachains.
categories: Basics, Polkadot Protocol
---

# Smart Contracts on Asset Hub

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

Polkadot’s Relay Chain does not support smart contracts directly, so developers build contract-based applications on parachains that provide execution environments. Asset Hub is one of those parachains, offering flexible smart contract capabilities alongside native asset management.

## Building a Smart Contract

Asset Hub supports multiple smart contract environments, giving developers the freedom to choose the workflow and tooling that best fits their project:

- **PolkaVM**: A next-generation virtual machine designed specifically for Polkadot. Built on a high-performance [RISC-V-based register architecture](https://en.wikipedia.org/wiki/RISC-V){target=_blank}, PolkaVM enables fast, scalable execution and is optimized for modern smart contract development.
- **REVM**: The [REVM backend](https://github.com/bluealloy/revm){target=_blank} brings a full Rust implementation of the EVM to Asset Hub. This allows developers to deploy existing Solidity contracts without modification, preserving compatibility with Ethereum tools and libraries.

Each of these environments is fully compatible with Asset Hub, giving teams the option to reuse Ethereum code, build with Rust security guarantees, or explore high-performance innovation with PolkaVM.

### PolkaVM Contracts

PolkaVM is Asset Hub’s native execution environment for smart contracts, designed to go beyond the limitations of the traditional EVM. Instead of emulating Ethereum bytecode, PolkaVM uses a high-performance RISC-V instruction set to natively execute smart contracts. 

This architecture enables faster execution, better parallelization, and lower resource consumption while still maintaining compatibility with Solidity tooling.

Smart contracts written for PolkaVM compile down to a RISC-V bytecode format, which is optimized for verification and execution within Polkadot’s Wasm-based runtime. Developers can interact with PolkaVM using familiar Ethereum developer tools.

### REVM Contracts

### PolkaVM Contracts

PolkaVM is Asset Hub’s native, high-performance smart contract engine. Instead of emulating EVM bytecode, it executes contracts compiled to a RISC-V instruction set, giving tighter control over execution, metering, and parallelization while staying friendly to Ethereum-style development.

**What it enables for developers**
- **Ethereum-compatible development** – Write contracts in Solidity and use familiar tooling (e.g., Hardhat/Foundry workflows) with PolkaVM targets.
- **Fast, predictable execution** – RISC-V bytecode is designed for efficient interpretation and careful gas/weight metering within the Substrate runtime.
- **Seamless Asset Hub integration** – Call into native pallets (Assets / Foreign Assets), use fee payment options, and compose with XCM for cross-chain flows.
- **Better observability** – Substrate events + contract logs for clean indexing and debugging.

**How it works (at a glance)**

1. **Author & compile** – Your Solidity contract is compiled for PolkaVM (RISC-V target), producing bytecode plus ABI.
2. **Deploy** – Submit a signed extrinsic to Asset Hub; collators include it in a parachain block.
3. **Execute** – PolkaVM runs the contract code, mapping gas ↔ weight and persisting state via Substrate storage.
4. **Integrate** – Contracts can interact with Asset Hub pallets and send/receive XCM messages for cross-chain actions.
5. **Finalize & index** – The Relay Chain finalizes the block; events/logs are available to indexers and UIs.

**When to choose PolkaVM**

- You want **max performance** and tighter execution control than a traditional EVM.
- You plan to **compose with Substrate pallets** (assets, governance) and **XCM** frequently.
- You prefer a path that’s **Solidity-friendly** but optimized for Polkadot’s architecture.

### REVM Contracts

REVM brings full EVM compatibility to Asset Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Asset Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s cross-chain ecosystem.

For more details, explore the REVM integration in the Asset Hub smart contract documentation.

If you want to learn more about the dual virtual stack please go to the [DualVM Stack](polkadot-docs/smart-contracts/for-eth-devs/dual-vm-stack.md){target=_blank}.
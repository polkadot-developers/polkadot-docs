---
title: Polkadot Hub Smart Contracts
description: Learn how Polkadot Hub supports smart contracts through the REVM, a Rust-based Ethereum Virtual Machine compatible runtime.
categories: Polkadot Protocol
---

# Smart Contracts on Polkadot Hub

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

Polkadot Hub introduces native support for smart contracts through REVM, a high-performance, Rust-based implementation of the Ethereum Virtual Machine. This enables developers to deploy and interact with Solidity contracts directly on Polkadot Hub, combining Ethereum compatibility with Polkadot’s cross-chain interoperability and shared security.

REVM brings Ethereum compatibility to Polkadot Hub, letting developers run Solidity contracts alongside Polkadot’s native features—such as governance, treasury, multisig, and XCM—within a unified, interoperable runtime environment.

This guide explains how smart contracts are deployed, executed, and integrated on Polkadot Hub using REVM.

<!-- TODO: Can we scrap this?
 ## Building a Smart Contract

Polkadot's smart contract platform supports two distinct virtual machine (VM) architectures, providing developers with flexibility in selecting the optimal execution backend for their specific needs. This approach strikes a balance between immediate Ethereum compatibility and long-term innovation, enabling developers to deploy either unmodified (Ethereum Virtual Machine) EVM contracts using Rust Ethereum Virtual Machine (REVM) or optimize for higher performance using PolkaVM (PVM).

- **REVM**: The [REVM backend](https://github.com/bluealloy/revm){target=_blank} brings a full Rust implementation of the EVM to Polkadot Hub. This allows developers to deploy existing Solidity contracts without modification, preserving compatibility with Ethereum tools and libraries.
- **PolkaVM**: A next-generation virtual machine designed specifically for Polkadot. Built on a high-performance [RISC-V-based register architecture](https://en.wikipedia.org/wiki/RISC-V){target=_blank}, PolkaVM enables fast, scalable execution and is optimized for modern smart contract development.

Each of these environments is fully compatible with Polkadot Hub, giving teams the option to reuse Ethereum code, build with Rust security guarantees, or explore high-performance innovation with PolkaVM.

### PolkaVM Smart Contracts

PolkaVM is Polkadot Hub’s native, high-performance smart contract engine. Instead of emulating EVM bytecode, it executes contracts compiled to a RISC-V instruction set, giving tighter control over execution, metering, and parallelization while staying friendly to Ethereum-style development.

**What it enables for developers**
- **Ethereum-compatible development** – Write contracts in Solidity and use familiar tooling (e.g., Hardhat/Foundry workflows) with PolkaVM targets.
- **Fast, predictable execution** – RISC-V bytecode is designed for efficient interpretation and careful gas/weight metering within the Substrate runtime.
- **Better observability** – Substrate events + contract logs for clean indexing and debugging.

**How it works (at a glance)**

1. **Author & compile** – Your Solidity contract is compiled for PolkaVM (RISC-V target), producing bytecode plus ABI.
2. **Deploy** – Submit a signed extrinsic to Polkadot Hub; collators include it in a parachain block.
3. **Execute** – PolkaVM runs the contract code, mapping gas ↔ weight and persisting state via Substrate storage.
4. **Integrate** – Contracts can interact with Polkadot Hub pallets and send/receive XCM messages for cross-chain actions.
5. **Finalize & index** – The relay chain finalizes the block; events/logs are available to indexers and UIs.

**When to choose PolkaVM**

- You want **max performance** and tighter execution control than a traditional EVM.
- You plan to **compose with Substrate pallets** (assets, governance) and **XCM** frequently.
- You prefer a path that’s **Solidity-friendly** but optimized for Polkadot’s architecture. -->

### REVM Contracts

<!-- TODO: This content is basically duplicated https://beta-docs.polkadot.com/smart-contracts/for-eth-devs/contract-deployment/#revm-deployment -->

REVM brings full EVM compatibility to Polkadot Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Polkadot Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s cross-chain ecosystem.

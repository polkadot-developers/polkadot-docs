---
title: Polkadot Hub Smart Contracts
description: Learn how Polkadot Hub supports smart contracts through the REVM, a Rust-based Ethereum Virtual Machine compatible runtime.
categories: Polkadot Protocol
---

# Smart Contracts on Polkadot Hub

## Introduction

Polkadot Hub enables developers to deploy and interact with Solidity contracts through REVM, a high-performance, Rust-based Ethereum Virtual Machine implementation. This brings Ethereum compatibility to Polkadot Hub, letting teams use familiar Solidity tooling, integrate with on-chain features like governance and XCM, and take advantage of cross-chain interoperability.

For projects that require maximum computational performance, Polkadot Hub also supports PolkaVM (PVM), a native RISC-V execution engine. PVM is optional and designed for high-throughput, performance-intensive smart contracts.

### REVM Smart Contracts

[REVM](https://github.com/bluealloy/revm){target=_blank} brings full EVM compatibility to Polkadot Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Polkadot Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s native features—such as governance, treasury, multisig, and XCM—within a unified, interoperable runtime environment.

### PVM Smart Contracts

PVM is Polkadot Hub’s native, high-performance smart contract engine. Instead of emulating EVM bytecode, it runs contracts compiled to a [RISC-V](https://en.wikipedia.org/wiki/RISC-V){target=_blank} instruction set, unlocking higher performance and parallel execution while staying friendly to Ethereum-style development.

With PVM, developers can:

- Write Solidity contracts and use familiar tooling (e.g., Hardhat, Foundry) targeting PVM
- Benefit from fast, predictable execution with carefully metered gas/weight.
- Access detailed observability through Substrate events and contract logs for indexing and debugging.

PolkaVM delivers maximum performance for computationally intensive contracts, offering a native, high-throughput option for Ethereum-style developers on Polkadot Hub.

--8<-- 'text/smart-contracts/polkaVM-warning.md'


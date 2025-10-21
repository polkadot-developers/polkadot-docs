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

REVM brings full EVM compatibility to Asset Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Asset Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s cross-chain ecosystem.

For more details, explore the REVM integration in the Asset Hub smart contract documentation.

If you want to learn more about the dual virtual stack please go to the [DualVM Stack](polkadot-docs/smart-contracts/for-eth-devs/dual-vm-stack.md){target=_blank}.
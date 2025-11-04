---
title: Polkadot Hub Smart Contracts
description: Learn how Polkadot Hub supports smart contracts through the REVM, a Rust-based Ethereum Virtual Machine compatible runtime.
categories: Polkadot Protocol
url: https://docs.polkadot.com/reference/polkadot-hub/smart-contracts/
---

# Smart Contracts on Polkadot Hub

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
## Introduction

Polkadot Hub introduces native support for smart contracts through REVM, a high-performance, Rust-based implementation of the Ethereum Virtual Machine. This enables developers to deploy and interact with Solidity contracts directly on Polkadot Hub, combining Ethereum compatibility with Polkadot’s cross-chain interoperability and shared security.

REVM brings Ethereum compatibility to Polkadot Hub, letting developers run Solidity contracts alongside Polkadot’s native features—such as governance, treasury, multisig, and XCM—within a unified, interoperable runtime environment.

This guide explains how smart contracts are deployed, executed, and integrated on Polkadot Hub using REVM.



### REVM Smart Contracts



REVM brings full EVM compatibility to Polkadot Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Polkadot Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s cross-chain ecosystem.

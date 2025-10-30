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

Polkadot’s relay chain does not support smart contracts directly. Instead, developers deploy contract-based applications on parachains that provide execution environments. Polkadot Hub supports smart contracts through the REVM, a Rust-based Ethereum Virtual Machine compatible runtime.

REVM enables developers to run standard Ethereum bytecode on Polkadot Hub, giving teams a path to migrate existing Solidity contracts while interacting with on-chain assets and other parachains via XCM.

This guide explains how smart contracts are deployed, executed, and integrated on Polkadot Hub using REVM.



### REVM Contracts



REVM brings full EVM compatibility to Polkadot Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Polkadot Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s cross-chain ecosystem.

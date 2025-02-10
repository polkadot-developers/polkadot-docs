---
title: PolkaVM Design
description: Discover PolkaVM, a high-performance smart contract VM for Polkadot, enabling Ethereum compatibility via pallet_revive, Solidity support, and optimized execution.
---

# PolkaVM Design

## Introduction

The Asset Hub smart contracts solution includes multiple components to ensure Ethereum compatibility and high performance. Its architecture allows for integration with current Ethereum tools, while its innovative virtual machine design enhances performance characteristics.

## PolkaVM

[**PolkaVM**](https://github.com/paritytech/polkavm){target=\_blank} is a custom virtual machine optimized for performance with [RISC-V-based](https://en.wikipedia.org/wiki/RISC-V){target=\_blank} architecture, supporting Solidity and additional high-performance languages. It serves as the core execution environment, integrated directly within the runtime. It features:

- An efficient interpreter for immediate code execution
- A planned JIT compiler for optimized performance
- Dual-mode execution capability, allowing selection of the most appropriate backend for specific workloads
- Optimized performance for short-running contract calls through the interpreter

The interpreter remains particularly beneficial for contracts with minimal code execution, as it eliminates JIT compilation overhead and enables immediate code execution through lazy interpretation.

### Architecture

PolkaVM introduces two fundamental architectural differences compared to the Ethereum Virtual Machine (EVM):

- **Register-Based design** - unlike EVM's stack-based architecture, PolkaVM utilizes a RISC-V register-based approach. This design:

    - Employs a finite set of registers for argument passing instead of an infinite stack
    - Facilitates efficient translation to underlying hardware architectures
    - Optimizes register allocation through careful register count selection
    - Enables simple 1:1 mapping to x86-64 instruction sets
    - Reduces compilation complexity through strategic register limitation
    - Improves overall execution performance through hardware-aligned design

- **64-Bit word size**  - PolkaVM operates with a 64-bit word size, contrasting with EVM's 256-bit architecture:

    - Enables direct hardware-supported arithmetic operations
    - Maintains compatibility with Solidity's 256-bit operations through YUL translation
    - Allows integration of performance-critical components written in lower-level languages
    - Optimizes computation-intensive operations through native word size alignment
    - Reduces overhead for operations not requiring extended precision
    - Facilitates efficient integration with modern CPU architectures

## Pallet Revive

[**`pallet_revive`**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} is a runtime module that executes smart contracts by adding extrinsics, runtime APIs, and logic to convert Ethereum-style transactions into formats compatible with Polkadot SDK-based blockchains. It processes Ethereum-style transactions through the following workflow:

- Users interact with a proxy server that emulates the Ethereum JSON RPC interface
- The proxy server transforms Ethereum transactions into special dispatchable transactions while preserving the original payload
- The pallet's internal logic decodes and processes these transactions for blockchain compatibility

This proxy-based approach eliminates the need for node binary modifications, maintaining compatibility across different client implementations. Preserving the original Ethereum transaction payload simplifies adapting existing tools, which can continue processing familiar transaction formats.

## Revive Compiler

[**Revive**](https://github.com/paritytech/revive){target=\_blank} enables Solidity execution on PolkaVM through a particular compilation pipeline:

- Utilizes the standard Solidity compiler (solc) as its foundation
- Converts Solidity's [YUL](https://docs.soliditylang.org/en/latest/yul.html){target=\_blank} intermediate representation to RISC-V instructions
- Maintains complete compatibility with all Solidity versions and features
- Simplifies implementation by focusing on YUL transformation rather than full compiler development
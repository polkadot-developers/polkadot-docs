---
title: Native EVM Contracts
description: TODO
---

# Native EVM Contracts

## Introduction

The Asset Hub parachain serves as the central repository for assets within the Polkadot ecosystem. Numerous blockchain applications depend on secure and user-friendly access to these assets.

Currently, two permissionless approaches exist for developing and deploying on-chain logic on Polkadot to interact with Asset Hub assets:

- Polkadot SDK - functionality can be developed using the Polkadot SDK and deployed as a parachain that interacts with Asset Hub via XCM in an asynchronous manner

- Smart Contracts - functionality can be developed using Solidity or ink! and deployed on a parachain with a Frontier or pallet-contracts smart contract execution environment (e.g., Moonbeam, Astar). These smart contracts also interact with Asset Hub via XCM asynchronously

In both scenarios, the communication overhead and increased complexity from interacting with assets on another chain are significant to the developers. Also,  the involvement of another token, governance system, or brand when building an application are factors that might slow down the development process.

To address these challenges, it is proposed to enable direct deployment of smart contracts on Asset Hub. By making all assets within the `pallet_asset` accessible to contracts, applications can bypass asynchronous operations. Each asset in `pallet_assets` would be represented as an emulated ERC20 contract, ensuring an ergonomic experience for Solidity developers

## Components

This smart contracts solution is composed by some of the folllowing components:

- [`pallet_revive`](){target=\_blank} - executes smart contracts by adding extrinsics, runtime APIs, and logic for processing Ethereum-style transactions. These transactions, instead of being submitted directly to the blockchain, are sent through a proxy server that emulates the Ethereum JSON RPC interface. The proxy converts Ethereum transactions into a special dispatchable, leaving the payload intact. The pallet's logic decodes and transforms these transactions into a format compatible with the blockchain, simplifying tooling integration. Using a proxy avoids modifying the node binary, ensuring compatibility with alternative clients without requiring additional implementation.
- [`PolkaVM`](){target=\_blank} - a custom virtual machine replacing EVM, featuring a RISC-V-based register architecture for efficient hardware translation and 64-bit word size for faster arithmetic. Includes an interpreter for lightweight tasks and plans for a JIT compiler, allowing Solidity to interact with high-performance languages
- [`Revive`](){target=\_blank} - compiles Solidity for PolkaVM by translating YUL, the intermediate output from the solc compiler, to RISC-V. This approach simplifies development and ensures full compatibility with all Solidity versions and features
- [`Revive Remix`](){target=\_blank} - a modified fork of Remix adapted to use a backend compiler instead of an in-browser one, accommodating the LLVM-based Revive compiler's complexity


## PolkaVM: Key Performance and Compatibility Differences

PolkaVM offers significant performance improvements over existing Polkadot smart contract execution environments, such as Frontier, thanks to its custom architecture based on RISC-V and 64-bit word size. This approach enables more efficient hardware translation and faster arithmetic, allowing additional languages like C or Rust to be integrated for further performance optimization. Unlike Ethereum, which uses a stack-based EVM, PolkaVM’s register-based design allows for faster compilation times and better compatibility with modern hardware. However, PolkaVM’s focus on performance means it deviates from Ethereum in key areas, such as gas modeling and contract execution.

To address these differences, PolkaVM introduces a multi-dimensional gas model, incorporating resources like computation time, proof size, and storage deposits. This provides a more accurate representation of contract execution costs and reduces overcharging for memory allocations. PolkaVM also avoids Ethereum’s approach of using a single resource for gas, making it possible to meter resources at the transaction level and for cross-contract calls. For compatibility, PolkaVM’s RPC interface closely mirrors Ethereum’s, with minor adjustments needed for some operations. Additionally, to ensure smooth operation across networks, PolkaVM hides the existential deposit requirement, ensuring users aren’t surprised by the underlying balance limitations.
 

## Get Started

### Connect to Asset Hub

Install the MetaMask browser extension, and manually add a custom network using the settings provided below:

- **Network name** - Asset-Hub Westend Testnet
- **RPC URL URL** - https://westend-asset-hub-eth-rpc.polkadot.io
- **Chain ID** - 420420421
- **Currency Symbol** - WND
- **Block Explorer URL** - https://assethub-westend.subscan.io

### Deployment

To deploy a contract to the westend asset Hub, you need to get WND tokens, to do so, you can use the [Westend Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}.


---
title: Overview
description: Learn how developers can build smart contracts on Polkadot by leveraging either WASM/ink! or EVM contracts across many different parachains.
---

# Overview

## Introduction

Polkadot is a chain specifically designed to service other chains. Consequently, developers cannot deploy smart contract-based applications to Polkadot.

Therefore, developers looking to build smart contract applications in Polkadot need to leverage the smart contract functionality that chains in the Ecosystem offer. Broadly speaking, in such an ecosystem making, they can find two main paths in their development journey. 

On one end, developers can leverage WASM-based smart contracts chains that support [ink!](TODO:update-path){target=\_blank}, a Rust-based smart contract language that leverages as an embedded domain-specific language (eSDL) for Rust. Consequently, developers can benefit from Rust syntax, type and memory-safe features, and tooling, among other neat features.

Conversely, developers can deploy EVM smart contracts on Ethereum-compatible chains that Polkadot secures. Broadly speaking, their EVM compatibility means that any smart contract language that compiles to EVM bytecode can be used, like [Solidity](https://soliditylang.org/){target=\_blank} and [Vyper](https://vyperlang.org/){target=\_blank}. Furthermore, developers can connect popular wallets like [MetaMask](https://metamask.io/){target=\_blank} and leverage tools they are familiar with, like [Remix](https://remix.ethereum.org/){target=\_blank}, [Hardhat](https://hardhat.org/){target=\_blank}, [Foundry](https://getfoundry.sh/){target=\_blank}, among others.

This guide highlights some differences between building smart contract applications or parachains within Polkadot's scalable and interoperable framework. It also explores the different development paths for smart contract developers on Polkadot.

!!!info "Parachain Developer?" 
    If you are a Parachain developer looking to add smart contract functionality to your chain, please check the following sections for [WASM-based](TODO:update-path){target=\_blank} or [EVM-based contracts](TODO:update-path){target=\_blank}.

## Smart Contracts Versus Pallets

When developing a smart contract, you create a sandboxed program that executes specific logic associated with a chain address. Unlike pallets, which integrate directly into a blockchain's runtime and define its core logic, smart contracts operate independently in a more isolated environment. Pallets can manage critical tasks like block production or governance and can be added, modified, or removed through forkless runtime upgrades.

Smart contracts, on the other hand, require careful upgrade planning, as their functionality can't be updated without explicitly coding mechanisms for future changes. Parachains offer flexibility, allowing developers to define the environment where these contracts run and enabling others to build on it.

These two options also differ in how they handle fees. Smart contracts follow a gas metering model for execution costs, while pallets and runtimes offer more flexible options for fee models.

!!!info "Additional information" 
      - Refer to the [Runtime vs. Smart Contracts](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/runtime_vs_smart_contract/index.html){target=\_blank} section of the Polkadot SDK Rust docs
      - Refer to this Stack Overflow post for a technically deeper discussion of when a developer might choose to develop a runtime versus a smart contract: [When should one build a Substrate (Polkadot SDK) runtime versus a Substrate (Polkadot SDK) smart contract?](https://stackoverflow.com/a/56041305){target=\_blank}

## Building a Smart Contract

Remember, the relay chain doesn't support smart contracts natively. However, since the parachains that connect to it support arbitrary state transitions, they also support smart contracts.

The Polkadot SDK presently supports smart contracts out-of-the-box in multiple ways:

- The EVM pallet offered by [Frontier](https://github.com/paritytech/frontier){target=\_blank}
- The [Contracts pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/contracts/){target=\_blank} in the FRAME library for Wasm-based contracts

### Frontier EVM Contracts

[Frontier](https://github.com/paritytech/frontier) is the suite of tools that enables a Polkadot SDK-based chain to run Ethereum contracts (EVM) natively with the same API/RPC interface. Ethereum addresses can also be mapped directly to and from the Polkadot SDK's SS58 scheme from existing accounts.

- [**Pallet EVM**](https://docs.rs/pallet-evm/latest/pallet_evm/){target=\_blank} - enables functionality of running EVM (Solidity) contracts
- [**Pallet Ethereum**](https://docs.rs/pallet-ethereum/latest/pallet_ethereum/){target=\_blank} - Ethereum RPC implementation, block emulation, and Ethereum transaction validation

### Contracts Pallet

The Contracts pallet ([`pallet_contracts`](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank}) implements a Wasm-based approach to smart contracts.

1. **Wasm** - the contracts pallet uses Wasm as its compilation target. Any language that compiles to Wasm could be used to write smart contracts. Nevertheless, it is better to have a dedicated domain-specific language, so Parity offers the [ink!](#ink) language

2. **Deposit** - contracts must hold a deposit (named `ContractDeposit` ) suitably large enough to justify their existence on-chain. The developer must deposit this into the new contract on top of the `ExistentialDeposit`

3. **Caching** - contracts are cached by default, which means they only need to be deployed once and can be instantiated as many times as you want afterward. Caching helps minimize on-chain storage requirements. Additionally, contracts that are no longer in use and have an `ExistentialDeposit` balance of zero are erased from storage in a process called reaping

### ink!

[ink!](https://github.com/use-ink/ink){target=\_blank} is a domain-specific language for writing smart contracts in Rust and compiles to Wasm code.

Additional resources available to developers who want to start writing smart contracts to deploy on Polkadot SDK-based parachains:

- [**ink!**](https://use.ink/){target=\_blank} - Polkadot's "native" smart contract stack, based on Wasm
- [**OpenBrush**](https://docs.openbrush.io/){target=\_blank} - an `ink!` library providing standard contracts based on [PSP](https://github.com/w3f/PSPs){target=\_blank} with useful contracts and macros for building
- [**ink!athon**](https://inkathon.xyz/){target=\_blank} - starter kit for full-stack dApps with ink! smart contracts and frontend

ink! has laid much of the groundwork for a new smart contract stack that is based on a Wasm virtual machine and compatible with Polkadot SDK-based chains.

## Smart Contract Environments

Many smart contract platforms are building to become a parachain in the ecosystem. A community-created and maintained list of different smart contract platforms can be found at [PolkaProjects](https://www.polkaproject.com/#/projects?cateID=1&tagID=6){target=\_blank}. Additionally, information about ink! smart contracts can be accessed at [use.ink](https://use.ink/#where-can-i-deploy-ink-contracts){target=\_blank}.
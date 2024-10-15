---
title: Smart Contracts
description: Learn how to navigate the smart contract aspect of the Polkadot ecosystem, including available languages (Solidity, ink), platforms, and compilation targets.
---

# Smart Contracts

## Introduction

Polkadot's unique multi-chain ecosystem allows parachains to support smart contracts, even though the relay chain itself does not. Developers can build decentralized applications using both [ink!](#ink), a Rust-based language for Wasm, and the Solidity-based Ethereum Virtual Machine (EVM) smart contract environments. Multiple [parachains that support both environments](#smart-contract-environments) are available.

This guide explores key differences between developing smart contracts and parachains, details the available platforms and supported languages, and outlines best practices for building smart contracts within Polkadot's scalable and interoperable framework. 

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

### Moonbeam

- **ink!**- unsupported
- **EVM (Solidity)** - [supported](https://docs.moonbeam.network/builders/get-started/quick-start/){target=\_blank}

[Moonbeam](https://moonbeam.network/){target=\_blank} is a Polkadot parachain that supports Ethereum-compatible smart contracts. Since Moonbeam uses [Frontier](https://github.com/paritytech/frontier){target=\_blank}, an interoperability layer with existing Ethereum tooling, it supports all applications that are written to target the EVM environment with little friction.

[Moonriver](https://docs.moonbeam.network/networks/moonriver/){target=\_blank}, a companion network to Moonbeam, launched as a parachain on Kusama.

Try deploying a smart contract to Moonbeam by following their [documentation](https://docs.moonbeam.network/){target=\_blank}.

### Astar

- **ink!** - [supported](https://docs.astar.network/docs/build/#wasm-smart-contracts){target=\_blank}
- **EVM (Solidity)** - [supported](https://docs.astar.network/docs/build/#evm-smart-contracts){target=\_blank}

[Astar Network](https://astar.network/){target=\_blank} supports the building of dApps with EVM and Wasm smart contracts and offers developers true interoperability. True interoperability with cross-consensus messaging [XCM](https://wiki.polkadot.network/docs/learn-xcm){target=\_blank} and cross-virtual machine [XVM](https://astar.network/developers){target=\_blank}.Astar's unique [Build2Earn](https://docs.astar.network/docs/build/#build2earn){target=\_blank} model empowers developers to get paid through a dApp staking mechanism for the code they write and dApps they build.

[Shiden Network](https://shiden.astar.network/){target=\_blank} is the canary network of Astar Network, live as a parachain on Kusama, and supports the EVM and Wasm environment for all developers who want to build out use-cases in a canary network with economic value. Shiden acts as a playground for developers.

Try deploying an Ethereum or ink! smart contract by following their [documentation](https://docs.astar.network/){target=\_blank}.

### Acala

- **ink!** - unsupported
- **EVM (Solidity)** - [supported](https://wiki.acala.network/build/development-guide){target=\_blank}

[Acala](https://acala.network/){target=\_blank} is a decentralized finance consortium and DeFi infrastructure chain delivering a set of protocols to serve as the DeFi hub on Polkadot.

[Karura](https://acala.network/karura){target=\_blank}, Acala's canary network is live as a parachain on Kusama. Interested teams are now able to deploy DApps and smart contracts on Karura's platform. Acala is also implementing the [Acala EVM](https://wiki.acala.network/learn/acala-evm/why-acala-evm){target=\_blank}.

Try deploying an Acala EVM smart contract by following their [documentation](https://wiki.acala.network/build/development-guide/smart-contracts){target=\_blank}.

### Phala

- **ink!** - unsupported
- **EVM (Solidity)** - unsupported
- **Phat Contracts** / **AI Agent Contracts** - [supported](https://phala.network/phat-contract){target=\_blank}

[Phala](https://phala.network){target=\_blank} is an off-chain trustless compute infrastructure that provides fully verifiable computation. [Khala](https://phala.network/en/khala){target=\_blank} is Phala's canary network and is live as a parachain on Kusama.

Try deploying a smart contract that interacts with Etherscan's Web2 API by following their [documentation](https://docs.phala.network/ai-agent-contract/build){target=\_blank}.

### Darwinia

- **ink!** - unsupported
- **EVM (Solidity)** - [supported](https://docs.darwinia.network/build/getting-started/networks/overview/){target=\_blank}

[Darwinia](https://darwinia.network/){target=\_blank} is a community-run technology and service powering the cross-chain capabilities of decentralized applications. By crafting secure and efficient cross-chain messaging protocols, Darwinia is at the forefront of facilitating seamless communication between disparate blockchain networks. The newest addition to the suite of protocols is Darwinia Msgport, an innovative messaging abstraction that has been successfully implemented across a wide array of mainstream smart contract platforms, broadening the potential for interoperability and enabling developers to create more versatile and connected blockchain ecosystems.

Try deploying a smart contract to Darwinia by following their [documentation](https://docs.darwinia.network/build/ethereum-tools/interact-with-web3js/){target=\_blank}.
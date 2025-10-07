---
title: Get Started
description: Practical examples and tutorials for building and deploying parachains on Polkadot, from launching to customization and cross-chain messaging.
categories: Basics, Parachains
---

# Get Started

This resource provides examples and tutorials for building parachains on Polkadot. Each tutorial focuses on specific aspects of parachain development while providing hands-on examples and practical usage patterns.

## Quick Start Tutorials

Quick start tutorials help developers set up and interact with the Polkadot parachain ecosystem using various tools and frameworks.

| Tutorial | Tools | Description |
|-------|-------|-------------|
| [Choose a Template](/parachains/launch-a-parachain/choose-a-template){target=\_blank} | Polkadot SDK | Explore runtime templates and understand development possibilities |
| [Launch a Local Parachain](/parachains/testing/run-a-parachain-network){target=\_blank} | Zombienet, Chopsticks | Set up a local development environment for testing |
| [Connect to Polkadot](/chain-interactions/query-on-chain-data){target=\_blank} | Polkadot.js, Substrate Connect | Connect your application to Polkadot networks |
| [Fork an Existing Parachain](/parachains/testing/fork-a-parachain){target=\_blank} | Chopsticks | Create a local fork of a live parachain for testing |

## Launch a Simple Parachain

Learn the fundamentals of launching and deploying a parachain to the Polkadot network.

| Tutorial | Description |
|-------|-------------|
| [Choose a Template](/parachains/launch-a-parachain/choose-a-template){target=\_blank} | Explore different runtime templates and understand the possibilities of runtime development |
| [Deploy to Polkadot](/parachains/launch-a-parachain/deploy-to-polkadot){target=\_blank} | Step-by-step tutorial to deploying your parachain to Polkadot |
| [Obtain Coretime](/parachains/launch-a-parachain/obtain-coretime){target=\_blank} | Learn how to acquire blockspace using Polkadot's coretime model (RegionX) |

## Customize Your Runtime

Build custom functionality for your parachain by composing and creating pallets.

| Tutorial | Description |
|-------|-------------|
| [Add Existing Pallets to the Runtime](/parachains/customize-your-runtime/add-existing-pallets){target=\_blank} | Integrate pre-built pallets from the FRAME ecosystem |
| [Add Multiple Instances of a Pallet](/parachains/customize-your-runtime/add-multiple-instances-of-a-pallet){target=\_blank} | Configure and use multiple instances of the same pallet |
| [Add Smart Contract Functionality](/parachains/customize-your-runtime/add-smart-contract-functionality){target=\_blank} | Enable smart contract capabilities using Contracts or EVM pallets |

### Pallet Development

Deep dive into creating and managing custom pallets for your parachain.

| Tutorial | Description |
|-------|-------------|
| [Create a Custom Pallet](/parachains/customize-your-runtime/pallet-development/create-a-custom-pallet){target=\_blank} | Build a pallet from scratch with custom logic |
| [Mock Your Runtime](/parachains/customize-your-runtime/pallet-development/mock-your-runtime){target=\_blank} | Set up a mock runtime environment for testing |
| [Pallet Unit Testing](/parachains/customize-your-runtime/pallet-development/pallet-unit-testing){target=\_blank} | Write comprehensive tests for your pallet logic |
| [Add Your Custom Pallet to the Runtime](/parachains/customize-your-runtime/pallet-development/add-custom-pallet){target=\_blank} | Integrate your custom pallet into your parachain runtime |
| [Benchmark the Custom Pallet](/parachains/customize-your-runtime/pallet-development/benchmark-custom-pallet){target=\_blank} | Measure and optimize pallet performance with benchmarking |

## Testing

Test your parachain in various environments before production deployment.

| Tutorial | Description |
|-------|-------------|
| [Fork a Parachain](/parachains/testing/fork-a-parachain){target=\_blank} | Use Chopsticks to create a local fork for testing |
| [Run a Parachain Network](/parachains/run-a-parachain-network){target=\_blank} | Launch a complete parachain test network with Zombienet |

## Runtime Upgrades and Maintenance

Manage your parachain's lifecycle with forkless upgrades and maintenance operations.

| Tutorial | Description |
|-------|-------------|
| [Runtime Upgrades](/parachains/runtime-maintenance/runtime-upgrades){target=\_blank} | Perform forkless runtime upgrades via governance |
| [Storage Migrations](/parachains/runtime-maintenance/storage-migrations){target=\_blank} | Safely migrate storage when updating runtime logic |
| [Unlock Parachains](/parachains/runtime-maintenance/unlock-parachains){target=\_blank} | Understand parachain lifecycle and unlock mechanisms |

## Interoperability

Configure your parachain for cross-chain communication using XCM (Cross-Consensus Messaging).

| Tutorial | Description |
|-------|-------------|
| [Open HRMP Channels Between Parachains](/parachains/interoperability/channels-between-parachains){target=\_blank} | Establish communication channels with other parachains |
| [Open HRMP Channels with System Parachains](/parachains/interoperability/channels-with-system-parachains){target=\_blank} | Connect with Asset Hub and other system parachains |

## Integrations

Integrate your parachain with essential ecosystem tools and services.

| Tutorial | Description |
|-------|-------------|
| [Wallets](/parachains/integrations/wallets){target=\_blank} | Integrate wallet support for user interactions |
| [Indexers](/parachains/integrations/indexers){target=\_blank} | Set up indexing solutions for querying blockchain data |
| [Oracles](/parachains/integrations/oracles){target=\_blank} | Connect your parachain to off-chain data sources |

---

## Additional Resources

- [Polkadot SDK Documentation](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html){target=\_blank}
- [Polkadot Wiki - Parachains](https://wiki.polkadot.network/docs/learn-parachains){target=\_blank}

## Community Support

Need help? Connect with the parachain developer community:

- [Polkadot Stack Exchange](https://polkadot.stackexchange.com/){target=\_blank}
- [Polkadot Discord](https://dot.li/discord){target=\_blank}
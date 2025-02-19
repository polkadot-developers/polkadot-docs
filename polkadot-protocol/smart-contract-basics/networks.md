---
title: Networks for Asset Hub Smart Contracts
description: Explore the available networks for smart contract development on Asset Hub, including Westend Asset Hub, Kusama Asset Hub, and Polkadot Asset Hub.
---

# Networks

## Introduction

Asset Hub provides smart contract functionality across multiple networks to facilitate smart contract development in the Polkadot ecosystem. Whether you're testing new contracts or deploying to production, Asset Hub offers several network environments tailored for each stage of development. Developers can thoroughly test, iterate, and validate their smart contracts from local testing environments to production networks like Polkadot Asset Hub.

This guide will introduce you to the current and upcoming networks available for smart contract development and explain how they fit into the development workflow.

## Network Overview

Smart contract development on Asset Hub follows a structured process to ensure rigorous testing of new contracts and upgrades before deployment on production networks. Development progresses through a well-defined path, beginning with local environments, advancing through TestNets, and ultimately reaching MainNets. The diagram below illustrates this progression:

``` mermaid
flowchart LR
    id1[Local Asset Hub] --> id2[TestNet Asset Hub] --> id4[MainNet Asset Hub]
```

This progression ensures developers can thoroughly test and iterate their smart contracts without risking real tokens or affecting production networks. A typical development journey consists of three main stages:

1. **Local Development**

    - Developers start in a local environment to create, test, and iterate on smart contracts
    - Provides rapid experimentation in an isolated setup without external dependencies

2. **TestNet Development**

    - Contracts move to TestNets like Westend Asset Hub and Paseo Asset Hub
    - Enables testing in simulated real-world conditions without using real tokens

3. **Production Deployment**

    - Final deployment to MainNets like Kusama Asset Hub and Polkadot Asset Hub
    - Represents the live environment where contracts interact with real economic value

## Local Development

The local development environment is crucial for smart contract development on Asset Hub. It provides developers a controlled space for rapid testing and iteration before moving to public networks. The local setup consists of several key components:

- [**Kitchensink node**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/subxt_client/src_chain/runtime_types/kitchensink_runtime/index.html){taget=\_blank} - a local node that can be run for development and testing. It includes logging capabilities for debugging contract execution and provides a pre-configured development environment with pre-funded accounts for testing purposes
- [**Ethereum RPC proxy**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/index.html){target=\_blank} - bridges Ethereum-compatible tools with the Polkadot SDK-based network. It enables seamless integration with popular development tools like MetaMask and Remix IDE. The purpose of this component is to translate Ethereum RPC calls into Substrate format

## Test Networks

The following test networks provide controlled environments for testing smart contracts. TestNet tokens are available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. They provide a stable environment for testing your contracts without using real tokens.

``` mermaid
flowchart TB
    id1[Asset Hub TestNets] --> id2[Paseo Asset Hub]
    id1[Asset Hub TestNets] --> id3[Westend Asset Hub]
```

### Paseo Asset Hub

The Paseo Asset Hub will be a community-managed TestNet designed specifically for smart contract development. It will mirror Asset Hub's runtime and provide developers with an additional environment for testing their contracts before deployment to production networks.

### Westend Asset Hub

Westend Asset Hub is the TestNet for smart contract development and its cutting-edge features. The network maintains the same features and capabilities as the production Asset Hub, and also incorporates the latest features developed by core developers.

## Production Networks

The MainNet environments represent the final destination for thoroughly tested and validated smart contracts, where they operate with real economic value and serve actual users.

``` mermaid
flowchart TB
    id1[Asset Hub MainNets] --> id2[Polkadot Asset Hub]
    id1[Asset Hub MainNets] --> id3[Kusama Asset Hub]
```

### Polkadot Asset Hub

Polkadot Asset Hub is the primary production network for deploying smart contracts in the Polkadot ecosystem. It provides a secure and stable environment for running smart contracts with real economic value. The network supports PolkaVM-compatible contracts written in Solidity or Rust, maintaining compatibility with Ethereum-based development tools.

### Kusama Asset Hub

Kusama Asset Hub is the experimental version of Polkadot Asset Hub. It is designed for developers who want to move quickly and test their smart contracts in a real-world environment with economic incentives. It provides a more flexible space for innovation while maintaining the same core functionality as Polkadot Asset Hub.

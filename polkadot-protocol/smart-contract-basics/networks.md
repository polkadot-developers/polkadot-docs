---
title: Networks for Asset Hub Smart Contracts
description: Explore the available networks for smart contract development on Asset Hub, including Westend Asset Hub, Kusama Asset Hub, and Polkadot Asset Hub.
---

# Networks

## Introduction

Smart contract development in the Polkadot ecosystem is primarily facilitated through Asset Hub, which provides robust smart contract functionality across multiple networks. Whether you're testing new contracts or deploying to production, Asset Hub offers several network environments tailored for each stage of development. Developers can thoroughly test, iterate, and validate their smart contracts from local testing environments to production networks like Polkadot Asset Hub.

This guide will introduce you to the various networks available (and incoming) for smart contract development and explain how they fit into the development workflow.

## Network Overview

Smart contract development on Asset Hub follows a structured process to ensure new contracts and upgrades are rigorously tested before deployment on production networks. The progression follows a well-defined path, starting from local environments and advancing through TestNets, ultimately reaching the Polkadot Asset Hub. The diagram below outlines the typical progression of the smart contract development cycle:

``` mermaid
flowchart LR
    id1[Local] --> id2[Westend Asset Hub] --> id4[Kusama Asset Hub] --> id5[Polkadot Asset Hub]
    id1[Local] --> id3[Paseo Asset Hub] --> id5[Polkadot Asset Hub]
```

This flow ensures developers can thoroughly test and iterate their smart contracts without risking real tokens or affecting production networks. Development tools and various TestNets make it easier to experiment safely before releasing it to production.

A typical journey through the smart contract development process might look like this:

1. **Local development node** - development starts in a local environment, where developers can create, test, and iterate on smart contracts using a local development node. This stage allows rapid experimentation in an isolated setup without any external dependencies

2. **Westend Asset Hub** - after testing locally, contracts are deployed to Westend Asset Hub, the primary TestNet for smart contract development. It simulates real-world conditions without using real tokens, making it ideal for rigorous contract testing

3. **Kusama Asset Hub** - once contracts have passed extensive testing on Westend, they can be deployed to Kusama Asset Hub, the "canary" network version. This provides a high-fidelity testing ground with actual economic incentives

4. **Polkadot Asset Hub** - after passing tests on Westend and Kusama Asset Hub, smart contracts are considered ready for deployment to Polkadot Asset Hub, the live production network

In addition, developers can leverage the upcoming Paseo Asset Hub for additional testing capabilities:

- **Paseo Asset Hub** - Serves as a community-run TestNet that mirrors Asset Hub's runtime. Like Westend Asset Hub for protocol development, Paseo provides a testing ground for smart contract development without affecting live networks

## Local Development

The local development environment is crucial for smart contract development on Asset Hub. It provides developers a controlled space for rapid testing and iteration before moving to public networks. The local setup consists of several key components:

- [**Kitchensink node**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/subxt_client/src_chain/runtime_types/kitchensink_runtime/index.html){taget=\_blank} - a local node that can be run for development and testing. It includes logging capabilities for debugging contract execution and provides a pre-configured development environment with pre-funded accounts for testing purposes
- [**Ethereum RPC proxy**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/index.html){target=\_blank} - bridges Ethereum-compatible tools with the Polkadot SDK-based network. It enables seamless integration with popular development tools like MetaMask and Remix IDE. The purpose of this component is to translate Ethereum RPC calls into Substrate format

## Test Networks

The following test networks provide controlled environments for testing smart contracts. TestNet tokens are available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}.

### Westend Asset Hub

Westend Asset Hub is the primary permanent TestNet for smart contract development. It provides a stable environment for testing contracts without using real tokens. The network maintains the same features and capabilities as the production Asset Hub, making it an ideal environment for thorough testing before moving to production networks.

### Paseo Asset Hub

The upcoming Paseo Asset Hub will serve as a community-managed TestNet specifically designed for smart contract development. It will mirror Asset Hub's runtime and provide developers with an additional environment for testing their contracts before deployment to production networks.

## Production Networks

### Polkadot Asset Hub

Polkadot Asset Hub is the primary production network for deploying smart contracts in the Polkadot ecosystem. It provides a secure and stable environment for running smart contracts with real economic value. The network supports PolkaVM-compatible contracts written in Solidity or Rust, maintaining compatibility with Ethereum-based development tools.

### Kusama Asset Hub

Kusama Asset Hub is the experimental version of Polkadot Asset Hub. It is designed for developers who want to move quickly and test their smart contracts in a real-world environment with economic incentives. It provides a more flexible space for innovation while maintaining the same core functionality as Polkadot Asset Hub.
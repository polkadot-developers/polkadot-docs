---
title: Upgrade a Running Network
description: TODO
---

# Upgrade a Running Network

## Introduction

One of the key advantages of the Polkadot-SDK development framework is its support for forkless upgrades to the blockchain runtime, which forms the core logic of the chain. Unlike many other blockchains, where introducing new features or improving existing ones often requires a hard fork, Polkadot-SDK enables seamless upgrades even when introducing breaking changes—without disrupting the network's operation.

In traditional blockchain systems, a hard fork is necessary to implement changes, forcing participants to update their software to remain in sync. However, Polkadot-SDK's design incorporates the runtime directly into the blockchain's state, allowing participants to upgrade the runtime by calling the `set_code` function within a transaction. This mechanism ensures that updates are validated using the blockchain's consensus and cryptographic guarantees, allowing runtime logic to be updated or extended without forking the chain or requiring a new blockchain client.

In this tutorial, you'll learn how to upgrade the runtime of a Polkadot-SDK-based blockchain without stopping the network or creating a fork. 

You'll make the following changes to a running network node's runtime:

- Increase the `spec_version`
- Add the Utility pallet
- Increase the minimum balance for network accounts

By the end of this tutorial, you’ll have the skills to upgrade the runtime and submit a transaction to deploy the modified runtime on a live network.

## Prerequisites

Before starting this tutorial, ensure you meet the following requirements:

- Installed and configured Rust on your system. Refer to the [Installation]() guide for detailed instructions on installing Rust and setting up your development environment
- Completed the [Build a Local Blockchain]() tutorial and have the [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank}installed on your machine
- Reviewed the [Add a Pallet to the Runtime]() guide
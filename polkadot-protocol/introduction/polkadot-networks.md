---
title: Development Networks
description: This section contains the list of networks and resources available for testing purposes for developers in the Polkadot ecosystem. 
---

# Polkadot Development Networks

## Introduction

Development and testing are vital to building robust dApps, parachains, and network upgrades in the Polkadot ecosystem. This section provides a comprehensive overview of the networks and tools for developers to experiment, test, and refine their innovations in a risk-free environment before deploying them to production networks. 

Whether you're a Polkadot core developer, parachain engineer, or application developer, the resources outlined here will help you ensure your solutions are thoroughly tested and ready for real-world usage. By leveraging these networks, developers can avoid the costs and risks associated with live deployments while testing functionalities such as governance, cross-chain messaging, and runtime upgrades.

This guide covers the tools and networks designed to support a wide variety of development and testing needs in the Polkadot ecosystem, from local development nodes to community-run TestNets.

## Network Overview

Polkadot's development process is a well-structured path designed to ensure that upgrades and new features undergo thorough testing before reaching the live production networks. This diagram illustrates the typical progression of a Polkadot development cycle, starting from local environments and eventually reaching the Polkadot MainNet. 

### Development Flow

``` mermaid

flowchart LR
    id1[Local] --> id2[Westend] --> id4[Kusama] --> id5[Polkadot]  
    id1[Local] --> id3[Paseo] --> id5[Polkadot] 
```

In the Polkadot ecosystem, various features can be explored without risking or spending tokens on production networks by utilizing testing tools like [Chopsticks](#chopsticks) and engaging with TestNets. 

A typical journey through the Polkadot development process might look like this:

1. **Local development node** - for core Polkadot developers, the process begins in a local environment where you can work on upgrades and experiment with new features using a local development node. This environment allows for rapid iteration and testing in an isolated setup without the need for interacting with external networks

2. **Westend** - once the upgrades are ready, they are deployed to [Westend](#westend), Polkadot's primary TestNet. Westend is designed to mimic the conditions of a live network without the risk of using real tokens. You can extensively test features here to ensure that everything works as expected before rolling them out to Kusama or Polkadot

3. **Paseo** - parachain developers often use Paseo, a community-run TestNet that mirrors Polkadot's runtime. Paseo provides parachain and dApp developers a space to test their applications with runtime environments that are closely aligned with Polkadot's without risking their projects on live networks

4. **Kusama** - after rigorous testing on Westend, the next step is Kusama. Kusama serves as Polkadot's experimental version and operates as a “canary network,” where features are deployed in a real-world environment with actual economic incentives. It's a high-fidelity testing ground for any potential network upgrade

5. **Polkadot** - if an upgrade passes testing on Westend or Paseo and Kusama, it is ready to deploy to Polkadot. This workflow ensures that only thoroughly vetted changes make it to production

Parachain developers use local TestNets powered by tools like [Zombienet](#zombienet) and then deploy the upgrades on their respective parachains to a TestNet.

!!!note
    The Rococo TestNet deprecation date is October 14, 2024. Teams should use Westend for Polkadot protocol and feature testing and Paseo for chain development-related testing.

## Kusama Network

Kusama is the experimental development network for teams who want to innovate, move fast, and test their applications in a production-grade environment with economics and game theory involved. It comprises a relay chain with its own governance, system chains, and parachains.

The native token for Kusama is KSM. You can find more information about KSM on the [Native Assets](https://wiki.polkadot.network/docs/learn-DOT#kusama){target=\_blank} page.

## Test Networks

The tokens for the test networks listed below are available through the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}.

### Westend

Westend is a perma-TestNet that is not reset back to the genesis block. It is intended for Polkadot core developers and maintained by Parity Technologies. Westend is primarily used to test features that will be deployed onto Kusama and then to Polkadot. 

The native token for Westend is WND. You can find more information about WND on the [Native Assets](https://wiki.polkadot.network/docs/learn-DOT#getting-tokens-on-the-westend-testnet){target=\_blank} page.

### Paseo

[Paseo](https://github.com/paseo-network){target=\_blank} is a community-run TestNet that mirrors the runtime of Polkadot and its system chains. It is intended for parachain and dApp developers and maintained by members of the Polkadot community.

The native token for Paseo is PAS. You can find more information about PAS on the [Native Assets](https://wiki.polkadot.network/docs/learn-DOT#getting-tokens-on-the-paseo-testnet){target=\_blank} page.

## Local Test Networks

### Zombienet

[Zombienet](https://github.com/paritytech/zombienet){target=\_blank} is a testing framework for Polkadot SDK-based blockchains, allowing users to spawn and test ephemeral networks. 

### Chopsticks

[Chopsticks](https://github.com/AcalaNetwork/chopsticks){target=\_blank} lets you create a fork of any Polkadot SDK-based blockchain and interact with it. This tool can also be used to test cross chain applications.

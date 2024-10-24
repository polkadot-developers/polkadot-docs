---
title: Deployment Overview
description: A guide to deploying Polkadot SDK-based blockchains, outlining the critical steps to configure, prepare, and launch a custom network.
---

# Deployment Overview

## Introduction

Deploying a blockchain built with the Polkadot SDK is a crucial phase in the development lifecycle, transforming a locally developed network into a fully functioning and secure system ready for public or private use. This section provides a high-level overview of the deployment process, introducing developers to key concepts, tools, and best practices to ensure a smooth transition from development to production.

Deploying a blockchain is more than just launching a runtime; it involves preparing the network configuration, ensuring compatibility with the Polkadot ecosystem, and implementing strategies for long-term maintenance and updates. Whether you're deploying a test network for development purposes or launching a mainnet for production, this article covers the essential points required to get your blockchain up and running.

## Key Considerations for Deployment

Before diving into the technical aspects, it’s important to understand some key aspects of blockchain deployment. Proper planning and configuration are critical to ensuring the long-term stability and success of your blockchain. Here are a few factors to consider:

- Chain Specifications - the chain spec file defines the structure and configuration of your blockchain. It includes parameters like initial node identities, session keys, and other parameters. Defining a clear chain specification ensures that your network will operate smoothly and according to your intended design

- Runtime Compilation - Polkadot SDK-based blockchains are built with WebAssembly (Wasm), a highly portable and efficient format. Compiling your blockchain's runtime into Wasm ensures that it can be executed reliably across a wide range of environments, ensuring network-wide compatibility and security. The [srtool](https://github.com/paritytech/srtool){target=\_blank} is useful for this purposes, since it allows you to compile Deterministic Runtimes (for more on this, see the [Building Deterministic Runtimes](TODO:update-path) guide)

- Deployment Environment - whether you’re launching a local test network or a production-grade blockchain, selecting the right infrastructure is key. For further information about these topics, see the [Infrastructure](/infrastructure/) section

- Maintenance and Upgrade - a blockchain doesn't stop evolving after deployment. As the network grows and changes, upgrades to the runtime, governance, and even the underlying code may be necessary. For an in-depth guide on this topic, see the [Maintenance](/develop/blockchains/maintenance/) section

## The Deployment Process

1. Prepare Chain Specifications
The first step in the deployment process is to prepare and generate the chain specification. The chain spec acts as a blueprint for your blockchain, defining the network's genesis state, node identities, and important parameters like token distribution and block production settings.

Creating a well-defined chain spec is critical for both test and production networks. Developers typically generate two types of chain specifications:

Raw chain specs for initial network bootstrapping and test environments.
Live chain specs for production networks, ensuring that all parameters are locked in and prepared for long-term operation.
The chain spec is the foundation of your network, and changes to this file can drastically alter how your blockchain operates. It’s important to ensure accuracy during this step to avoid issues down the road.

2. Compile the Runtime
Once your chain spec is prepared, the next step is to compile your runtime into WebAssembly (Wasm). Wasm is a key component of Polkadot's runtime architecture, enabling code portability and cross-platform execution.

Compiling the runtime ensures your blockchain’s logic is ready to be deployed on any Polkadot network, from local testnets to public-facing blockchains. During this process, developers should ensure that all custom pallets and features are properly integrated and optimized for Wasm execution.

By compiling your runtime into Wasm, you're effectively packaging the core business logic of your blockchain into a secure and efficient format that can be executed by nodes across the network.

3. Set Up and Launch the Network
After generating the chain spec and compiling the runtime, it's time to set up the network. This involves configuring the node infrastructure and launching the blockchain. Depending on the network type, this could range from deploying a few validator nodes for a private chain to coordinating a large-scale public blockchain launch.

Here are a few key steps in network setup:

Node Configuration: Set up the necessary nodes, including validators and full nodes, to ensure network security and stability. Nodes need to be properly configured to communicate with each other and process transactions efficiently.
Block Production: Ensure the block production mechanism (e.g., Proof of Stake or other consensus algorithms) is set up correctly to maintain the health and integrity of the network.
Monitoring and Logs: Implement tools for monitoring node performance, network health, and block production. Monitoring is essential for catching issues early and maintaining high uptime.
Launching the network is the moment where all your development work is tested in a real-world environment. Whether it's a testnet or a mainnet, ensuring that all components are configured correctly and that there’s a solid monitoring system in place is essential for success.

4. Manage and Maintain the Blockchain
After deployment, the work doesn’t stop. A live blockchain requires ongoing management and maintenance to ensure optimal performance, security, and adaptability as the ecosystem grows and evolves.

Post-launch tasks include:

Runtime Upgrades: As the blockchain evolves, upgrades to the runtime are inevitable. These updates may include new features, performance improvements, or critical bug fixes. Polkadot’s governance mechanisms allow for seamless upgrades without hard forks, ensuring continuous improvement.

Coretime Synchronization: Ensuring that the network stays in sync with Polkadot's runtime, especially for parachains, is crucial for maintaining the integrity of block production and validation. Proper coretime management guarantees that your network aligns with the broader Polkadot ecosystem.

Lifecycle Management: Tools like Tanssi allow developers to manage the entire lifecycle of a blockchain, from deployment to ongoing upgrades. Tanssi provides a decentralized platform for managing blockchain upgrades, ensuring that the network remains secure and up-to-date.

## Conclusion
Deploying a Polkadot SDK-based blockchain is a multi-step process that requires careful planning, from generating chain specs and compiling the runtime to managing post-launch updates. By understanding the deployment process and utilizing the right tools, developers can confidently take their blockchain from development to production.

This section offers an overview of the essential steps in deploying a blockchain, while subsequent guides will provide in-depth instructions for each stage. Whether you're launching a testnet, a parachain, or a standalone blockchain, following best practices during deployment ensures that your network is secure, scalable, and ready for the future.


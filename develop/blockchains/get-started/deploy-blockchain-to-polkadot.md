---
title: Deploy a Blockchain to Polkadot
description: A guide to deploying Polkadot SDK-based blockchains, outlining the critical steps to configure, prepare, and launch a custom network.
---

# Deployment Overview

## Introduction

Deploying a blockchain with the Polkadot SDK is a critical step in transforming a locally developed network into a secure, fully functioning system for public or private use. It involves more than just launching a runtime; you'll need to prepare the chain specification, ensure ecosystem compatibility, and plan for long-term maintenance and updates.

Whether deploying a test network for development or a mainnet for production, this guide highlights the essential steps to get your blockchain operational. It provides an overview of the deployment process, introducing key concepts, tools, and best practices for a smooth transition from development to production.

## Deployment Process

Taking your Polkadot SDK-based blockchain from a local environment to production involves several steps, ensuring your network is stable, secure, and ready for real-world use. The following diagram outlines the process at a high level:

```mermaid
flowchart TD
    %% Group 1: Pre-Deployment
    subgraph group1 [Pre-Deployment]
        direction LR
        A("Local \nDevelopment \nand Testing") --> B("Runtime \nCompilation")
        B --> C("Generate \nChain \nSpecifications")
        C --> D("Prepare \nDeployment \nEnvironment")
        D --> E("Acquire \nCoretime")
    end
    
    %% Group 2: Deployment
    subgraph group2 [Deployment]
        F("Launch \nand \nMonitor")
    end

    %% Group 3: Post-Deployment
    subgraph group3 [Post-Deployment]
        G("Maintenance \nand \nUpgrades")
    end

    %% Connections Between Groups
    group1 --> group2
    group2 --> group3

    %% Styling
    style group1 fill:#ffffff,stroke:#6e7391,stroke-width:1px
    style group2 fill:#ffffff,stroke:#6e7391,stroke-width:1px
    style group3 fill:#ffffff,stroke:#6e7391,stroke-width:1px
```

- **Local development and testing** - the process begins with local development and testing. Developers focus on building the runtime by selecting and configuring the necessary pallets while refining network features. In this phase, it's essential to run a local TestNet to verify transactions and ensure the blockchain behaves as expected. Unit and integration tests are also crucial for ensuring the network works as expected before launch. Thorough testing is conducted, not only for individual components but also for interactions between pallets

- **Runtime compilation** - Polkadot SDK-based blockchains are built with Wasm, a highly portable and efficient format. Compiling your blockchain's runtime into Wasm ensures it can be executed reliably across various environments, guaranteeing network-wide compatibility and security. The [srtool](https://github.com/paritytech/srtool){target=\_blank} is helpful for this purpose since it allows you to compile [deterministic runtimes](/develop/blockchains/deployment/build-deterministic-runtime/){target=\_blank}

- **Generate chain specifications** - the chain spec file defines the structure and configuration of your blockchain. It includes initial node identities, session keys, and other parameters. Defining a well thought-out chain specification ensures that your network will operate smoothly and according to your intended design

- **Deployment environment** - whether launching a local test network or a production-grade blockchain, selecting the proper infrastructure is vital. For further information about these topics, see the [Infrastructure](/infrastructure/){target=\_blank} section

- **Acquire coretime** - to build on top of the Polkadot network, users need to acquire coretime (either on-demand or in bulk) to access the computational resources of the relay chain. This allows for the secure validation of parachain blocks through a randomized selection of relay chain validators

    !!! note
        If you’re building a standalone blockchain (solochain) that won’t connect to Polkadot as a parachain, you can skip this step, as there’s no need to acquire coretime or implement [Cumulus](https://wiki.polkadot.network/docs/build-pdk#cumulus){target=\_blank} .

- **Launch and monitor** - once everything is configured, you can launch the blockchain, initiating the network with your chain spec and Wasm runtime. Validators or collators will begin producing blocks, and the network will go live. Post-launch, monitoring is vital to ensuring network health—tracking block production, node performance, and overall security

- **Maintenance and upgrade** - a blockchain continues to evolve post-deployment. As the network expands and adapts, it may require runtime upgrades, governance updates, coretime renewals, and even modifications to the underlying code. For an in-depth guide on this topic, see the [Maintenance](/develop/blockchains/maintenance/){target=\_blank} section

## Where to Go Next

Deploying a Polkadot SDK-based blockchain is a multi-step process that requires careful planning, from generating chain specs and compiling the runtime to managing post-launch updates. By understanding the deployment process and utilizing the right tools, developers can confidently take their blockchain from development to production. For more on this topic, check out the following resources:

- [**Generate Chain Specifications**](/develop/blockchains/deployment/generate-chain-specs/){target=\_blank} - learn how to generate a chain specification for your blockchain
- [**Building Deterministic Runtimes**](/develop/blockchains/deployment/build-deterministic-runtime/){target=\_blank} - learn how to build deterministic runtimes for your blockchain
- [**Infrastructure**](/infrastructure/){target=\_blank} - learn about the different infrastructure options available for your blockchain
- [**Maintenance**](/develop/blockchains/maintenance/){target=\_blank} - discover how to manage updates on your blockchain to ensure smooth operation
---
title: Build Custom Parachains
description: Learn how to build custom parachains using the Polkadot SDK, focusing on pre-built chain templates for faster development.
---

# Build Custom Parachains

## Introduction

Building custom parachains with the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2412){target=\_blank} allows developers to create specialized blockchain solutions tailored to unique requirements. By leveraging [Substrate](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2412/substrate){target=\_blank}—a Rust-based, modular blockchain development framework—the Polkadot SDK provides powerful tools to construct chains that can either stand-alone or connect to Polkadot’s shared security network as parachains. This flexibility empowers projects across various sectors to launch blockchains that meet specific functional, security, and scalability needs.

This guide covers the core steps for building a custom blockchain using the Polkadot SDK, starting from pre-built chain templates. These templates simplify development, providing an efficient starting point that can be further customized, allowing you to focus on implementing the features and modules that set your blockchain apart.

## Starting from Templates

Using pre-built templates is an efficient way to begin building a custom blockchain. Templates provide a foundational setup with pre-configured modules, letting developers avoid starting from scratch and instead focus on customization. Depending on your project’s goals—whether you want a simple test chain, a standalone chain, or a parachain that integrates with Polkadot’s relay chains—there are templates designed to suit different levels of complexity and scalability.

Within the Polkadot SDK, the following templates are available to get you started:

- [**`minimal-template`**](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2412/templates/minimal){target=\_blank} - includes only the essential components necessary for a functioning blockchain. It’s ideal for developers who want to gain familiarity with blockchain basics and test simple customizations before scaling up

- [**`solochain-template`**](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2412/templates/solochain){target=\_blank} - provides a foundation for creating standalone blockchains with moderate features, including a simple consensus mechanism and several core FRAME pallets. It’s a solid starting point for developers who want a fully functional chain that doesn’t depend on a relay chain

- [**`parachain-template`**](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2412/templates/parachain){target=\_blank} - designed for connecting to relay chains like Polkadot, Kusama, or Paseo, this template enables a chain to operate as a parachain. For projects aiming to integrate with Polkadot’s ecosystem, this template offers a great starting point

In addition, several external templates offer unique features and can align with specific use cases or developer familiarity:

- [**`OpenZeppelin`**](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main){target=\_blank} - offers two flexible starting points:
    - The [`generic-runtime-template`](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main/generic-template){target=\_blank} provides a minimal setup with essential pallets and secure defaults, creating a reliable foundation for custom blockchain development
    - The [`evm-runtime-template`](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main/evm-template){target=\_blank} enables EVM compatibility, allowing developers to migrate Solidity contracts and EVM-based dApps. This template is ideal for Ethereum developers looking to leverage Substrate's capabilities

- [**`Tanssi`**](https://github.com/moondance-labs/tanssi/tree/master/container-chains/runtime-templates){target=\_blank} - provides developers with pre-built templates that can help accelerate the process of creating appchain

- [**`Pop Network`**](https://learn.onpop.io/appchains/pop-cli/new#templates){target=\_blank} - designed with user-friendliness in mind, Pop Network offers an approachable starting point for new developers, with a simple CLI interface for creating appchains 

Choosing a suitable template depends on your project’s unique requirements, level of customization, and integration needs. Starting from a template speeds up development and lets you focus on implementing your chain’s unique features rather than the foundational blockchain setup.

## High-Level Steps to Build a Custom Chain


Building a custom blockchain with the Polkadot SDK involves several core steps, from environment setup to deployment. Here’s a breakdown of each stage:

1. **Set up the development environment** - install Rust and configure all necessary dependencies to work with the Polkadot SDK (for more information, check the [Install Polkadot SDK dependencies](/develop/parachains/get-started/install-polkadot-sdk/){target=\_blank} page). Ensuring your environment is correctly set up from the start is crucial for avoiding compatibility issues later

2. **Clone the chain template** - start by downloading the code for one of the pre-built templates that best aligns with your project needs. Each template offers a different configuration, so select one based on your chain’s intended functionality

3. **Define your chain's custom logic** - with your chosen template, check the runtime configuration to customize the chain’s functionality. Polkadot’s modular “pallet” system lets you easily add or modify features like account balances, transaction handling, and staking. Creating custom pallets to implement unique features and combining them with existing ones enables you to define the unique aspects of your chain

4. **Test and debug** - testing is essential to ensure your custom chain works as intended. Conduct unit tests for individual pallets and integration tests for interactions between pallets

5. **Compile** - after finalizing and testing your custom configurations, compile the blockchain to generate the necessary executable files for running a node. Run the node locally to validate that your customizations work as expected and that your chain is stable and responsive

Each of these steps is designed to build on the last, helping ensure that your custom blockchain is functional, optimized, and ready for deployment within the Polkadot ecosystem or beyond.

## Where to Go Next

Once your chain is functional locally, depending on your project’s goals, you can deploy to a TestNet to monitor performance and gather feedback or launch directly on a MainNet. To learn more about this process, check the [Deploy a Parachain](/develop/parachains/deployment/) section of the documentation.

After deployment, regular monitoring and maintenance are essential to ensure that the chain is functioning as expected. Developers need to be able to monitor the chain's performance, identify issues, and troubleshoot problems. Key activities include tracking network health, node performance, and transaction throughput. It's also essential to test the blockchain’s scalability under high load and perform security audits regularly to prevent vulnerabilities. For more information on monitoring and maintenance, refer to the [Maintenance](/develop/parachains/maintenance/) section.

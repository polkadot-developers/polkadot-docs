---
title: Build Custom Blockchains
description: TODO
---

# Build Custom Blockchains

The Polkadot SDK provides a set of tools and libraries for building custom blockchains using Substrate, a Rust-based blockchain development framework. This guide will provide a step-by-step guide for building a custom blockchain upon pre-built chain templates.

## Overview

Custom blockchains on Polkadot are typically created using Substrate, Polkadot's blockchain development framework. Substrate provides a modular structure where different components, known as pallets, are combined to form a custom runtime. By using pre-built chain templates, developers can avoid starting from scratch and focus on configuring essential features.

## Starting from Pre-Built Chains

For developers looking to deploy a chain quickly, the following templates offer solid starting points:

- OpenZeppelin Substrate - this chain template includes basic, widely used modules from OpenZeppelin, a familiar name for developers with an Ethereum background
- Tanssi - offers a streamlined setup and includes pre-configured runtime modules, allowing for quick customization
- Pop Network - a user-friendly option tailored for new developers, simplifying initial setup with the flexibility to expand with more custom runtime logic

These templates offer pre-configured environments and can be easily tailored to meet custom requirements.

## High-Level Steps to Build a Custom Chain

- Set Up the Development Environment - install Rust, the language used for Substrate, and set up necessary dependencies. This ensures compatibility with Substrate and enables smooth development

- Clone the Chain Template - begin by downloading the code for one of the pre-built chain templates. Each template offers a slightly different configuration and setup, allowing developers to choose a foundation that aligns with their project goals

- Define Custom Modules - with the template cloned, explore the runtime configuration to customize the chain’s core logic. Polkadot uses modular components called pallets, which define blockchain features like account balances, transaction processing, and governance. Common pallets like Balances and Sudo can be configured or customized based on project needs

- Set Initial Storage Values chain initialization settings, including initial balances, validator lists, and other state configurations, are typically defined in a JSON file. For simple or early-stage chains, a human-readable format suffices. For long-lived or production chains, it’s advisable to use a "raw" format to ensure consistency across runtime upgrades

- Compile and Launch - after finalizing the runtime setup and initial configuration, compile the blockchain to prepare it for deployment. This will generate the necessary executable to run a node. Running a node locally allows developers to test the chain’s behavior and verify that modules work as expected

- Deploy to a Testnet or Mainnet - once testing is complete, the chain is ready for deployment. Developers can launch their chain on a local network, testnet, or Polkadot parachain slot depending on project requirements. Deploying on a testnet is recommended initially to monitor performance, confirm stability, and gather feedback.

## Testing and Iteration

Before final deployment, thorough testing is crucial. Validate that modules and configurations work together correctly and confirm that initial state values and storage items are accurate. Testing in a controlled environment will help identify potential issues and ensure that the blockchain operates smoothly post-deployment.

## Monitoring and Maintenance

After deployment, regular monitoring and maintenance are essential to ensure that the chain is functioning as expected. Polkadot provides various tools and resources to help developers monitor the chain's performance, identify issues, and troubleshoot problems.
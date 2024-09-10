---
title: Connect a Parachain
description: This tutorial will guide you through the comprehensive process of connecting a parachain to a relay chain, covering steps from setup to successful integration.
---

# Connect a Parachain

## Introduction

This tutorial illustrates reserving a parachain identifier with a local relay chain and connect a local parachain to that relay chain. By completing this tutorial, you will accomplish the following objectives:

- Compile a local parachain node
- Reserve a unique identifier with the local relay chain for the parachain to use
- Configure a chain specification for the parachain
- Export the runtime and genesis state for the parachain
- Start the local parachain and see that it connects to the local relay chain

## Prerequisites

Before you begin, ensure that you have the following prerequisites:

- Configured a local relay chain with two validators as described in the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/) tutorial
- You are aware that parachain versions and dependencies are tightly coupled with the version of the relay chain they connect to and know the software version you used to configure the relay chain

Tutorials generally demonstrate features using the latest Polkadot branch. If a tutorial doesn't work as expected, check whether you have the latest Polkadot branch in your local environment and update your local software if needed.

## Build the Parachain Template

This tutorial uses the [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank} to illustrate how to launch a parachain that connects to a local relay chain. The parachain template is similar to the [Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} used in development. You can also use the parachain template as the starting point for developing a custom parachain project.

To build the parachain template, follow these steps:

1. Clone the branch of the `polkadot-sdk-parachain-template` repository:

    ```bash
    git clone https://github.com/paritytech/polkadot-sdk-parachain-template.git
    ```

    !!! note
        Ensure that you clone the correct branch of the repository that matches the version of the relay chain you are connecting to.

2. Change the directory to the cloned repository:

    ```bash
    cd polkadot-sdk-solochain-template
    ```

3. Build the parachain template collator by running the following command:

    ```bash
    cargo build --release
    ```

    !!! note
        Compiling the node can take a few minutes, depending on your system's performance.





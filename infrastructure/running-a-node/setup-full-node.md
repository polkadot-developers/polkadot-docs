---
title: Set Up a Full Node
description: Learn how to set up and secure a full Polkadot node. Follow step-by-step instructions for installation, node types, RPC setup, and WebSocket security.
---

## Introduction

If you're building dApps or products on a Polkadot SDK-based chain, running a node as a back-end provides increased operational control and decentralization. All Polkadot SDK node implementations include the RPC server, crucial for accessing and interacting with the Polkadot network.

This guide demonstrates connecting to [Polkadot](https://polkadot.network/){target=\_blank}, but the same process applies to any other [Polkadot SDK](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html){target=\_blank}-based chain. This tutorial will guide you through configuring, securing, and maintaining a full node. You'll learn about the differences between archive and pruned nodes, how to secure the WebSocket connection, and the steps necessary to safely expose and maintain your node's RPC server for external access.

## Types of Nodes

- **Pruned node** - prunes historical states of all finalized block states older than a specified number except for the genesis block's state
- **Archive node** - keeps all the past blocks and their states, making it convenient to query the past state of the chain at any given time. Archive nodes use a lot of disk space, which means they should be limited to use cases that require easy access to past on-chain data
- **Light node** - has only the runtime and the current state but doesn't store past blocks, making them useful for resource-restricted devices

!!!tip
    On [Stakeworld](https://stakeworld.io/docs/dbsize){target=\_blank}, you can find a list of the database sizes of Polkadot and Kusama nodes.

### State vs. Block Pruning

A pruned node only keeps a limited number of finalized blocks of the network, not its complete history. State and block pruning are two ways of removing old blocks from a system. State pruning removes the states of old blocks while preserving block headers. Block pruning removes the block bodies of old blocks while retaining block headers. You can complete many frequently required actions with a pruned node, such as displaying account balances, making transfers, setting up session keys, and staking. 

## Setup Instructions

Follow these steps for initial set up:

1. Visit [Install Dependencies for the Polkadot SDK](/develop/blockchains/get-started/install-polkadot-sdk.md){target=\_blank} to ensure dependencies, such as Rust, are installed and your development environment is set up before continuing.

2. Once dependencies are installed and your development environment is set up, visit [Install Polkadot SDK](TODO: update-path){target=\_blank} for guidance on installing the Polkadot binaries required to use to SDK

Both guides offer specific guidance for macOS, Windows, and Linux systems.

!!! warning "Not intended for validators"
    This process isn't recommended if you're a validator. If you are running a validator, please see the [Set Up a Validator](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator.md){target=\_blank} guide.

## Connect to the Node

Open [Polkadot.js Apps](https://polkadot.js.org/apps){target=\_blank} and click the logo in the top left to switch the node. Activate the **Development** toggle and input your node's domain or IP address. Remember to prefix with `wss://`, and if you're using the 443 port, append `:443` as follows:

```bash
wss://example.com:443
```

??? info "Adjustments for Kusama" 
    The bash commands that are provided to run against your node use `polkadot` as the default chain. 

    Use the `--chain` flag to set up a Kusama node. For example:

    ```bash
    polkadot --name "Your Node's Name" --chain kusama
    ```

    Depending on where your binary is located (in some cases, it may be located within the `target/release` folder), you would use the same binary for Polkadot as you would for Kusama or any other relay chain:

    ```bash
    polkadot --name "Your Node's Name"
    ```

Use the `--help` flag to determine which flags you can use when running the node. For example, if you want to connect to your node remotely, you'll probably want to use `--rpc-external` and `--rpc-cors all`.

The syncing process will take a while, depending on your capacity, processing power, disk speed, and RAM. For example, the process can be completed on a $10 DigitalOcean droplet in ~36 hours. Once it is synced, you may find it in [Telemetry](https://telemetry.polkadot.io/#list/Polkadot){target=_blank}.

Congratulations, you're now syncing with Polkadot. The process is identical when using any other Polkadot SDK-based chain.

## Secure the RPC Server

The node startup settings allow you to choose what to expose, how many connections to expose, and which systems should be granted access through the RPC server. Some settings you can configure to increase node security include:

- **Limit usable methods** - with the `--rpc-methods` flag. An easy way to set this to a safe mode is: 
```bash
--rpc-methods safe
```
- **Set maximum number of connections** - with the `--rpc-max-connections` flag. For example, to limit maximum connections to 200 use:
```bash
--rpc-max-connections 200
```
- **Set server access permissions** - with the `--rpc-cors` flag. By default, localhost and Polkadot.js can access the RPC server. To allow access from everywhere, you can use: 
```bash
--rpc-cors all
```

For a list of important flags when running RPC nodes, refer to the Parity DevOps documentation: [Important Flags for Running an RPC Node](https://paritytech.github.io/devops-guide/guides/rpc_index.html?#important-flags-for-running-an-rpc-node){target=\_blank}.

## Secure the WebSocket Port

To securely access your WebSocket (WS) connection over an SSL-enabled connection (necessary for SSL-enabled developer consoles), you'll need to convert the WS connection to a secure WSS connection. You can complete this conversion using a proxy and an SSL certificate.
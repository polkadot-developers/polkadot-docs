---
title: Simulate a Network
description: Create a private blockchain network with authorized validators using Polkadot-SDK. Start nodes, connect peers and verify block production.
---

# Simulate a Network

## Introduction

This tutorial introduces you to the process of initiating a private blockchain network with a set of authorized validators. The [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} implements an authority consensus model to regulate block production.

In this model, the creation of blocks is restricted to a predefined list of authorized accounts, known as "authorities", who operate in a round-robin fashion. 

To demonstrate this concept, you'll simulate a network environment using two nodes running on a single computer, each configured with different accounts and keys. Throughout this tutorial, you'll gain practical insight into the functionality of the authority consensus model by observing how these two predefined accounts, serving as authorities, enable the nodes to produce blocks.

By completing this tutorial, you will accomplish the following objectives:

- Start a blockchain node using a predefined account
- Learn the key command-line options used to start a node
- Determine if a node is running and producing blocks
- Connect a second node to a running network
- Verify peer computers produce and finalize blocks

## Prerequisites

- Installed and configured Rust on your system. Refer to the [Installation]() guide for detailed instructions on installing Rust and setting up your development environment
- Completed the [Build a Local Blockchain](#build-a-local-blockchain) guide and have the [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} installed on your local machine

## Start the First Blockchain Node

This tutorial demonstrates the fundamentals of a private network using a predefined chain specification called local and two preconfigured user accounts. You'll simulate a private network by running two nodes on a single local computer, using accounts named `Alice` and `Bob`.

Follow these steps to start your first blockchain node:
   
1. Navigate to the root directory where you compiled the Polkadot-SDK Solochain Template
   
2. Clear any existing chain data by executing the following:
    ```bash
    ./target/release/solochain-template-node purge-chain --base-path /tmp/alice --chain local
    ```

    When prompted to confirm, type `y` and press *Enter*. This step ensures a clean start for your new network.

3. Launch the first blockchain node using the `Alice` account:
    ```bash
    ./target/release/solochain-template-node \
    --base-path /tmp/alice \
    --chain local \
    --alice \
    --port 30333 \
    --rpc-port 9945 \
    --node-key 0000000000000000000000000000000000000000000000000000000000000001 \
    --validator
    ```

### Review the Command-Line Options

Before proceeding, examine the key command-line options used to start the node:

- `--base-path` - specifies the directory for storing all chain-related data
- `--chain` - defines the chain specification to use
- `--alice` - adds the predefined keys for the `Alice` account to the node's keystore. This account is used for block production and finalization
- `--port` - sets the listening port for peer-to-peer (p2p) traffic. Different ports are necessary when running multiple nodes on the same machine
- `--rpc-port` - specifies the port for incoming JSON-RPC traffic via WebSocket and HTTP
- `--node-key` - defines the Ed25519 secret key for libp2p networking
- `--validator` - enables this node to participate in block production and finalization for the network

For a comprehensive overview of all available command-line options for the node template, you can access the built-in help documentation. Execute the following command in your terminal:

```bash
./target/release/solochain-template-node --help
```

## Review the Node Messages

Upon successful node startup, the terminal displays messages detailing network operations and information relevant to the running node. This output includes details about the chain specification, system data, network status, and other crucial parameters. You should see output similar to this:

<div id='termynal' data-termynal>
    <span data-ty="input"><span class="file-path"></span>./target/release/solochain-template-node \
--base-path /tmp/alice \
--chain local \
--alice \
--port 30333 \
--rpc-port 9945 \
--node-key 0000000000000000000000000000000000000000000000000000000000000001 \
--validator
    </span>
    <span data-ty>2024-09-10 08:35:43 Substrate Node</span>
    <span data-ty>2024-09-10 08:35:43 ✌️  version 0.1.0-8599efc46ae</span>
    <span data-ty>2024-09-10 08:35:43 ❤️  by Parity Technologies <admin@parity.io>, 2017-2024</span>
    <span data-ty>2024-09-10 08:35:43 📋 Chain specification: Local Testnet</span>
    <span data-ty>2024-09-10 08:35:43 🏷  Node name: Alice</span>
    <span data-ty>2024-09-10 08:35:43 👤 Role: AUTHORITY</span>
    <span data-ty>2024-09-10 08:35:43 💾 Database: RocksDb at /tmp/alice/chains/local_testnet/db/full</span>
    <span data-ty>2024-09-10 08:35:43 🔨 Initializing Genesis block/state (state: 0x074c…27bd, header-hash: 0x850f…951f)</span>
    <span data-ty>2024-09-10 08:35:43 👴 Loading GRANDPA authority set from genesis on what appears to be first startup.</span>
    <span data-ty>2024-09-10 08:35:43 Using default protocol ID "sup" because none is configured in the chain specs</span>
    <span data-ty>2024-09-10 08:35:43 🏷  Local node identity is: 12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp</span>
    <span data-ty>2024-09-10 08:35:43 Running libp2p network backend</span>
    <span data-ty>2024-09-10 08:35:43 💻 Operating system: macos</span>
    <span data-ty>2024-09-10 08:35:43 💻 CPU architecture: aarch64</span>
    <span data-ty>2024-09-10 08:35:43 📦 Highest known block at #0</span>
    <span data-ty>2024-09-10 08:35:43 〽️ Prometheus exporter started at 127.0.0.1:9615</span>
    <span data-ty>2024-09-10 08:35:43 Running JSON-RPC server: addr=127.0.0.1:9945, allowed origins=["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"]</span>
    <span data-ty>2024-09-10 08:35:48 💤 Idle (0 peers), best: #0 (0x850f…951f), finalized #0 (0x850f…951f), ⬇ 0 ⬆ 0</span>
</div>

Pay particular attention to the following key messages:

- Genesis Block Initialization:

    ```plain
    2024-09-10 08:35:43 🔨 Initializing Genesis block/state (state: 0x074c…27bd, header-hash: 0x850f…951f)
    ```

    This message identifies the initial state or genesis block used by the node. When starting subsequent nodes, ensure these values match.

- Node Identity:

    ```plain
    2024-09-10 08:35:43 🏷  Local node identity is: 12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp
    ```

    This string uniquely identifies the node. It's determined by the `--node-key` used to start the node with the `Alice` account. Use this identifier when connecting additional nodes to the network.

- Network Status:

    ```plain
    2024-09-10 08:35:48 💤 Idle (0 peers), best: #0 (0x850f…951f), finalized #0 (0x850f…951f), ⬇ 0 ⬆ 0
    ```

    This message indicates that:

    - No other nodes are currently in the network
    - No blocks are being produced
    - Block production will commence once another node joins the network

## Add a Second Node to the Network

After successfully running the first node with the `Alice` account keys, you can expand the network by adding a second node using the `Bob` account. This process involves connecting to the existing network using the running node as a reference point. The commands are similar to those used for the first node, with some key differences to ensure proper network integration.

To add a node to the running blockchain:

1. Open a new terminal shell on your computer

2. Navigate to the root directory where you compiled the Polkadot-SDK Solochain Template

3. Clear any existing chain data for the new node:

    ```bash
    ./target/release/solochain-template-node purge-chain --base-path /tmp/bob --chain local -y
    ```

    !!!note
        The `-y` flag automatically confirms the operation without prompting.

4. Start the second local blockchain node using the `Bob` account:
    ```bash
    ./target/release/solochain-template-node \
    --base-path /tmp/bob \
    --chain local \
    --bob \
    --port 30334 \
    --rpc-port 9946 \
    --node-key 0000000000000000000000000000000000000000000000000000000000000002 \
    --validator \
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp
    ```

    Key differences in this command:
    
    1. Unique paths and ports - to avoid conflicts on the same machine, different values are used for:
        - `--base-path` - set to `/tmp/bob`
        - `--port` - set to `30334`
        - `--rpc-port` - set to `9946`

    2. Bootnode specification - the `--bootnodes` option is crucial for network discovery:
        - Format - `/ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp`
        - Components:
            - `ip4` - indicates IPv4 format
            - `127.0.0.1` - IP address of the running node (localhost in this case)
            - `tcp` - specifies TCP for peer-to-peer communication
            - `30333` - port number for peer-to-peer TCP traffic
            - `12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp` - unique identifier of the `Alice` node

## Verify Blocks are Produced and Finalized

After starting the second node, both nodes should connect as peers and commence block production.

Follow these steps to verify that blocks are being produced and finalized:

1. Observe the output in the terminal of the first node (`Alice`):

    <div id='termynal' data-termynal>
        <data-ty>...</span>
        <span data-ty>2024-09-10 09:04:57 discovered: 12D3KooWHdiAxVd8uMQR1hGWXccidmfCwLqcMpGwR6QcTP6QRMuD /ip4/192.168.1.4/tcp/30334</span>
        <span data-ty>2024-09-10 09:04:58 💤 Idle (0 peers), best: #0 (0x850f…951f), finalized #0 (0x850f…951f), ⬇ 0.3kiB/s ⬆ 0.3kiB/s</span>
        <span data-ty>2024-09-10 09:05:00 🙌 Starting consensus session on top of parent 0x850ffab4827cb0297316cbf01fc7c2afb954c5124f366f25ea88bfd19ede951f (#0)</span>
        <span data-ty>2024-09-10 09:05:00 🎁 Prepared block for proposing at 1 (2 ms) [hash: 0xe21a305e6647b0b0c6c73ba31a49ae422809611387fadb7785f68d0a1db0b52d; parent_hash: 0x850f…951f; extrinsics (1): [0x0c18…08d8]</span>
        <span data-ty>2024-09-10 09:05:00 🔖 Pre-sealed block for proposal at 1. Hash now 0x75bbb026db82a4d6ff88b96f952a29e15dac2b7df24d4cb95510945e2bede82d, previously 0xe21a305e6647b0b0c6c73ba31a49ae422809611387fadb7785f68d0a1db0b52d.</span>
        <span data-ty>2024-09-10 09:05:00 🏆 Imported #1 (0x850f…951f → 0x75bb…e82d)</span>
        <span data-ty>2024-09-10 09:05:03 💤 Idle (1 peers), best: #1 (0x75bb…e82d), finalized #0 (0x850f…951f), ⬇ 0.7kiB/s ⬆ 0.8kiB/s</span>
        <span data-ty>2024-09-10 09:05:06 🏆 Imported #2 (0x75bb…e82d → 0x774d…a176)</span>
        <span data-ty>2024-09-10 09:05:08 💤 Idle (1 peers), best: #2 (0x774d…a176), finalized #0 (0x850f…951f), ⬇ 0.6kiB/s ⬆ 0.5kiB/s</span>
        <span data-ty>2024-09-10 09:05:12 🙌 Starting consensus session on top of parent 0x774dec6bff7a27c38e21106a5a7428ae5d50b991f39cda7c0aa3c0c9322da176 (#2)</span>
        <span data-ty>2024-09-10 09:05:12 🎁 Prepared block for proposing at 3 (0 ms) [hash: 0x10bb4589a7a13bac657219a9ff06dcef8d55e46a4275aa287a966b5648a6d486; parent_hash: 0x774d…a176; extrinsics (1): [0xdcd4…b5ec]</span>
        <span data-ty>2024-09-10 09:05:12 🔖 Pre-sealed block for proposal at 3. Hash now 0x01e080f4b8421c95d0033aac7310b36972fdeef7c6025f8a153c436c1bb214ee, previously 0x10bb4589a7a13bac657219a9ff06dcef8d55e46a4275aa287a966b5648a6d486.</span>
        <span data-ty>2024-09-10 09:05:12 🏆 Imported #3 (0x774d…a176 → 0x01e0…14ee)</span>
        <span data-ty>2024-09-10 09:05:13 💤 Idle (1 peers), best: #3 (0x01e0…14ee), finalized #0 (0x850f…951f), ⬇ 0.6kiB/s ⬆ 0.6kiB/s</span>
        <span data-ty>2024-09-10 09:05:18 🏆 Imported #4 (0x01e0…14ee → 0xe176…0430)</span>
        <span data-ty>2024-09-10 09:05:18 💤 Idle (1 peers), best: #4 (0xe176…0430), finalized #1 (0x75bb…e82d), ⬇ 0.6kiB/s ⬆ 0.6kiB/s</span>
    </div>

    Key information in this output:

    - Second node discovery - `discovered: 12D3KooWHdiAxVd8uMQR1hGWXccidmfCwLqcMpGwR6QcTP6QRMuD`
    - Peer count - `1 peers`
    - Block production - `best: #4 (0xe176…0430)`
    - Block finalization - `finalized #1 (0x75bb…e82d)`

2. Check the terminal of the second node (`Bob`) for similar output

3. Shut down one node using `Control-C` in its terminal. Observe the remaining node's output:

    <div id='termynal' data-termynal>
        <span data-ty>2024-09-10 09:10:03 💤 Idle (1 peers), best: #51 (0x0dd6…e763), finalized #49 (0xb70a…1fc0), ⬇ 0.7kiB/s ⬆ 0.6kiB/s</span>
        <span data-ty>2024-09-10 09:10:08 💤 Idle (0 peers), best: #52 (0x2c40…a50e), finalized #49 (0xb70a…1fc0), ⬇ 0.3kiB/s ⬆ 0.3kiB/s</span>
    </div>

    Note that the peer count drops to zero, and block production stops.

4. Shut down the second node using `Control-C` in its terminal

5. Clean up chain state. To remove the chain state from the simulated network, use the `purge-chain` subcommand:

    - For Alice's node:
        ```bash
        ./target/release/solochain-template-node purge-chain --base-path /tmp/alice --chain local -y
        ```
    - For Bob's node:
        ```bash
        ./target/release/solochain-template-node purge-chain --base-path /tmp/bob --chain local -y
        ```
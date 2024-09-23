---
title: Simulate a Network
description: Create a private blockchain network with authorized validators using Polkadot SDK. Start nodes, connect peers and verify block production.
---

# Simulate a Network

## Introduction

This tutorial introduces you to the process of initiating a private blockchain network with a set of authorized validators. The [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} implements an authority consensus model to regulate block production. In this model, the creation of blocks is restricted to a predefined list of authorized accounts, known as "authorities," who operate in a round-robin fashion. 

To demonstrate this concept, you'll simulate a network environment using two nodes running on a single computer, each configured with different accounts and keys. Throughout this tutorial, you'll gain practical insight into the functionality of the authority consensus model by observing how these two predefined accounts, serving as authorities, enable the nodes to produce blocks.

By completing this tutorial, you will accomplish the following objectives:

- Start a blockchain node using a predefined account
- Learn the key command-line options used to start a node
- Determine if a node is running and producing blocks
- Connect a second node to a running network
- Verify peer computers produce and finalize blocks

## Prerequisites

Before proceeding, ensure you have the following prerequisites in place:

- Installed and configured Rust on your system. Refer to the [Installation]() guide for detailed instructions on installing Rust and setting up your development environment
- Completed the [Build a Local Blockchain](#build-a-local-blockchain) guide and have the [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} installed on your local machine

## Start the First Blockchain Node

This tutorial demonstrates the fundamentals of a private network using a predefined chain specification called local and two preconfigured user accounts. You'll simulate a private network by running two nodes on a single local computer, using accounts named Alice and Bob.

Follow these steps to start your first blockchain node:
   
1. Navigate to the root directory where you compiled the Polkadot SDK Solochain Template
   
2. Clear any existing chain data by executing the following:
    ```bash
    ./target/release/solochain-template-node purge-chain --base-path /tmp/alice --chain local
    ```

    When prompted to confirm, type `y` and press `Enter`. This step ensures a clean start for your new network

3. Launch the first blockchain node using the Alice account:
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
- `--alice` - adds the predefined keys for the Alice account to the node's keystore. This account is used for block production and finalization
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

--8<-- 'code/tutorials/polkadot-sdk/build-a-blockchain/simulate-a-network/node-output.html'

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

    This string uniquely identifies the node. It's determined by the `--node-key` used to start the node with the Alice account. Use this identifier when connecting additional nodes to the network.

- Network Status:

    ```plain
    2024-09-10 08:35:48 💤 Idle (0 peers), best: #0 (0x850f…951f), finalized #0 (0x850f…951f), ⬇ 0 ⬆ 0
    ```

    This message indicates that:

    - No other nodes are currently in the network
    - No blocks are being produced
    - Block production will commence once another node joins the network

## Add a Second Node to the Network

After successfully running the first node with the Alice account keys, you can expand the network by adding a second node using the Bob account. This process involves connecting to the existing network using the running node as a reference point. The commands are similar to those used for the first node, with some key differences to ensure proper network integration.

To add a node to the running blockchain:

1. Open a new terminal shell on your computer

2. Navigate to the root directory where you compiled the Polkadot SDK Solochain Template

3. Clear any existing chain data for the new node:

    ```bash
    ./target/release/solochain-template-node purge-chain --base-path /tmp/bob --chain local -y
    ```

    !!!note
        The `-y` flag automatically confirms the operation without prompting.

4. Start the second local blockchain node using the Bob account:
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
            - `12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp` - unique identifier of the Alice node

## Verify Blocks are Produced and Finalized

After starting the second node, both nodes should connect as peers and commence block production.

Follow these steps to verify that blocks are being produced and finalized:

1. Observe the output in the terminal of the first node (Alice):

    --8<-- 'code/tutorials/polkadot-sdk/build-a-blockchain/simulate-a-network/node-output-1.html'

    Key information in this output:

    - Second node discovery - `discovered: 12D3KooWHdiAxVd8uMQR1hGWXccidmfCwLqcMpGwR6QcTP6QRMuD`
    - Peer count - `1 peers`
    - Block production - `best: #4 (0xe176…0430)`
    - Block finalization - `finalized #1 (0x75bb…e82d)`

2. Check the terminal of the second node (Bob) for similar output

3. Shut down one node using `Control-C` in its terminal. Observe the remaining node's output:

    --8<-- 'code/tutorials/polkadot-sdk/build-a-blockchain/simulate-a-network/node-shutdown.html'

    Note that the peer count drops to zero, and block production stops.

4. Shut down the second node using `Control-C` in its terminal

5. Clean up chain state from the simulated network by using the `purge-chain` subcommand:

    - For Alice's node:
        ```bash
        ./target/release/solochain-template-node purge-chain \
        --base-path /tmp/alice \
        --chain local \
        -y
        ```
    - For Bob's node:
        ```bash
        ./target/release/solochain-template-node purge-chain \
        --base-path /tmp/bob \
        --chain local \
        -y
        ```
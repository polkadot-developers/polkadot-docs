---
title: Prepare a Relay Chain
description: This tutorial will guide you through preparing a relay chain so that you can connect a test parachain node to it for local testing.
---

# Prepare a Relay Chain

## Introduction

This tutorial illustrates how to configure and spin up a local relay chain. The local relay chain is needed to set up a local testing environment to which a test parachain node can connect. Setting up a local relay chain is a crucial step in parachain development. It allows developers to test their parachains in a controlled environment, simulating the interaction between a parachain and the relay chain without needing a live network. This local setup facilitates faster development cycles and easier debugging.

The scope of this tutorial includes:

- Installing necessary components for a local relay chain
- Configuring the relay chain settings
- Starting and running the local relay chain
- Verifying the relay chain is operational

## Prerequisites

Before diving into this tutorial, it's recommended that you have a basic understanding of how adding trusted nodes works in Polkadot. For further information about this process, refer to the [Add Trusted Nodes](/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes){target=\_blank} tutorial.

To complete this tutorial, ensure that you have:

- Installed Rust and the Rust toolchain. Refer to the [Installation](/develop/parachains/get-started/install-polkadot-sdk){target=\_blank} guide for step-by-step instructions on setting up your development environment
- Completed [Build a Local Blockchain](/tutorials/blockchains/custom-blockchains/build-a-blockchain/build-a-local-blockchain){target=\_blank} tutorial and know how to compile and run a Polkadot SDK-based node

## Build a Local Relay Chain

To build a local relay chain, follow these steps:

1. Clone the most recent release branch of the Polkadot SDK repository to prepare a stable working environment:

    ```bash
    git clone --depth 1 --branch polkadot-stable2407-2 \
    https://github.com/paritytech/polkadot-sdk.git
    ```

    !!! note
        The branch `polkadot-stable2407-2` is used in this tutorial since it is the branch that contains the latest stable release of the Polkadot SDK. You can find the latest release of the Polkadot SDK on the [Release](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} tab on the Polkadot GitHub repository.

    !!! note
        Note that the `--depth 1` flag is used to clone only the latest commit of the branch, which speeds up the cloning process.

2. Change the directory to the Polkadot SDK repository:

    ```bash
    cd polkadot-sdk
    ```

3. Build the relay chain node:

    ```bash
    cargo build --release
    ```

    !!! note
        Depending on your machine's specifications, the build process may take some time.

4. Verify that the node is built correctly:

    ```bash
    ./target/release/polkadot --version
    ```

If command-line help is displayed, the node is ready to configure.

## Relay Chain Configuration

Every Substrate-based chain requires a [chain specification](/develop/parachains/deployment/generate-chain-specs){target=\_blank}. The relay chain's chain specification provides the same configuration settings as the chain specification for other networks. Many of the chain specification file settings are critical for network operations. For example, the chain specification identifies peers participating in the network, keys for validators, bootnode addresses, and other information.

### Sample Chain Configuration

The local relay chain uses a sample chain specification file with two validator relay chain nodes—Alice and Bob—as authorities for this tutorial. Because a relay chain must have at least one more validator node running than the total number of connected parachain collators, you can only use the chain specification from this tutorial for a local relay chain network with a single parachain.

If you wanted to connect two parachains with a single collator each, you must run three or more relay chain validator nodes. You must modify the chain specification and hard-code additional validators to set up a local test network for two or more parachains.

### Plain and Raw Chain Specification

The chain specification file is available in two formats: a JSON file in plain text and a JSON file in SCALE-encoded raw format.

You can read and edit the plain text version of the chain specification file. However, the chain specification file must be converted to the SCALE-encoded raw format before you can use it to start a node. For information about converting a chain specification to the raw format, see [Customize a Chain Specification](/develop/parachains/deployment/generate-chain-specs/#creating-a-custom-chain-specification){target=\_blank}.

The sample chain specification is only valid for a single parachain with two validator nodes. If you add other validators, add additional parachains to your relay chain, or want to use custom account keys instead of the predefined account, you'll need to create a custom chain specification file.

Suppose you are completing this tutorial simultaneously as anyone on the same local network. In that case, you must download and modify the plain sample relay chain spec to prevent accidentally peering with their nodes. Find the following line in the plain chain spec and add characters to make the `protocolId` field unique:

```json
"protocolId": "dot",
```

## Start the Relay Chain Node

Before starting block production for a parachain, you need to start a relay chain for them to connect.

To start the validator nodes, follow these steps:

1. Generate the chain specification file in the plain text format and use it to create the raw chain specification file. Save the raw chain specification file in a local working directory

    1. Generate the plain text chain specification file:

        ```bash
        ./target/release/polkadot build-spec \
          --chain rococo-local-testnet > /tmp/plain-local-chainspec.json
        ```

        !!! note
            Note that the network values are set to the default when generating the chain specification file with the `build-spec`. You can customize the network values by editing the chain specification file for production networks.

    2. Convert the plain text chain specification file to the raw format:

        ```bash
        ./target/release/polkadot build-spec \
          --chain plain-local-chainspec.json \
          --raw > /tmp/raw-local-chainspec.json
        ```

2. Start the first validator using the `alice` account by running the following command:

      ```bash
      ./target/release/polkadot \
        --alice \
        --validator \
        --base-path /tmp/alice \
        --chain /tmp/raw-local-chainspec.json \
        --port 30333 \
        --rpc-port 9944 \
        --insecure-validator-i-know-what-i-do \
        --force-authoring
      ```

    This command uses `/tmp/raw-local-chainspec.json` as the location of the sample chain specification file. Ensure the `--chain` command line specifies the path to your generated raw chain specification. This command also uses the default values for the port (`port`) and WebSocket port (`ws-port`). The values are explicitly included here as a reminder to always check these settings. After the node starts, no other nodes on the same local machine can use these ports.

3. Review log messages as the node starts and take note of the `Local node identity` value. This value is the node's peer ID, which you need to connect the parachain to the relay chain:

    --8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-parachain/prepare-relay-chain/relay-chain-1.html'

    !!! note
        You need to specify this identifier to enable other nodes to connect. In this case, the `Local node identity` is `12D3KooWG393uX82rR3QgDkZpb7U8StzuRx9BQUXCvWsP1ctgygp`.

4. Open a new terminal and start the second validator using the `bob` account. The command is similar to the command used to start the first node, with a few crucial differences:

    ```bash
    ./target/release/polkadot \
      --bob \
      --validator \
      --base-path /tmp/bob \
      --chain /tmp/raw-local-chainspec.json \
      --port 30334 \
      --rpc-port 9945
    ```

    Notice that this command uses a different base path (`/tmp/relay/bob`), validator key (`--bob`), and ports (`30334` and `9945`).

    Because both validators are running on a single local computer, it isn't necessary to specify the `--bootnodes` command-line option and the first node's IP address and peer identifier. The `--bootnodes` option is required to connect nodes outside the local network or not identified in the chain specification file.

    If you don't see the relay chain producing blocks, try disabling your firewall or adding the bootnodes command-line option with the address of Alice's node to start the node. Adding the bootnodes option looks like this (with the node identity of Alice's node):

    ```bash
    --bootnodes \
      /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWG393uX82rR3QgDkZpb7U8StzuRx9BQUXCvWsP1ctgygp
    ```

5. Verify that the relay chain nodes are running by checking the logs for each node. The logs should show that the nodes are connected and producing blocks. For example, Bob's logs will be displayed as follows:

    --8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-parachain/prepare-relay-chain/relay-chain-2.html'

Once the relay chain nodes are running, you can proceed to the next tutorial to [set up a test parachain node and connect it](/tutorials/blockchains/custom-blockchains/build-a-parachain/connect-a-parachain) to the relay chain.

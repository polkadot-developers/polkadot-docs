---
title: Prepare a Relay Chain
description: This tutorial will guide you through preparing a relay chain so that you can connect a test parachain node to it for local testing.
---

# Prepare Relay Chain

## Introduction

This tutorial illustrates how to configure and spin up a local relay chain. The local relay chain is required to set up a local testing environment to which a test parachain node can connect. Setting up a local relay chain is a crucial step in parachain development. It allows developers to test their parachains in a controlled environment, simulating the interaction between a parachain and the relay chain without needing a live network. This local setup facilitates faster development cycles and easier debugging.

The scope of this tutorial includes:

- Installing necessary components for a local relay chain
- Configuring the relay chain settings
- Starting and running the local relay chain
- Verifying the relay chain is operational

## Prerequisites

Before diving into this tutorial, it's recommended that you have a basic understanding of how adding trusted nodes works in Polkadot. For further information about this process, refer to the [Add Trusted Nodes](TODO: add the absolute path to the Add Trusted Nodes tutorial) tutorial.

To complete this tutorial, ensure that you have:

- Configured your environment for Substrate development by installing [Rust and the Rust toolchain](https://docs.substrate.io/install/){target=\_blank}
- Completed [Build a local blockchain](TODO: the add absolute path to the Build a local blockchain tutorial){target=\_blank} tutorial and know how to compile and run a Substrate node

## Build a Local Relay Chain

To build a local relay chain, follow these steps:

1. Clone the most recent release branch of the Polkadot SDK repository to prepare a stable working environment.

```bash
git clone --depth 1 --branch polkadot-stable2407-2 https://github.com/paritytech/polkadot-sdk.git
```

!!! note
    The branch `polkadot-stable2407-2` is used in this tutorial since it is the branch that contains the latest stable release of the Polkadot SDK. You can find the latest release of the Polkadot SDK on the [Release](https://github.com/paritytech/polkadot/releases){target=\_blank} tab on the Polkadot GitHub repository.


!!! note
    Note that the `--depth 1` flag is used to clone only the latest commit of the branch, which speeds up the cloning process.
2. Change the directory to the Polkadot SDK repository.

```bash
cd polkadot-sdk
```

3. Build the relay chain node by running the following command:

```bash
cargo build --release
```

!!! note
    Depending on your machine’s specifications, the build process may take some time.

4. Verify that the node is built correctly by running the following command:

```
./target/release/polkadot --version
```

If command-line help is displayed, the node is ready to configure.

## Relay Chain Configuration

Every Substrate-based chain requires a [chain specification](https://docs.substrate.io/build/chain-spec/){target=\_blank}. The relay chain network’s chain specification provides the same configuration settings as the chain specification does for other networks. Many of the chain specification file settings are critical for network operations. For example, the chain specification identifies peers participating in the network, keys for validators, boot node addresses, and other information.

### Sample Chain Configuration

The local relay chain uses a sample chain specification file with two validator relay chain nodes—Alice and Bob—as authorities for this tutorial. Because a relay chain must have at least one more validator node running than the total number of connected parachain collators, you can only use the chain specification from this tutorial for a local relay chain network with a single parachain.

If you wanted to connect two parachains with a single collator each, you would need to run three or more relay chain validator nodes. You would need to modify the chain specification and hard-code additional validators to set up a local test network for two or more parachains.

### Plain and Raw Chain Specification

The chain specification file is available in two formats: a JSON file in plain text and a JSON file in SCALE-encoded raw format.

- [Plain sample relay chain spec](https://docs.substrate.io/assets/tutorials/relay-chain-specs/plain-local-chainspec.json/){target=\_blank}
- [Raw sample relay chain spec](https://docs.substrate.io/assets/tutorials/relay-chain-specs/raw-local-chainspec.json/){target=\_blank}

You can read and edit the plain text version of chain specification file. However, the chain specification file must be converted to the SCALE-encoded raw format before you can use it to start a node. For information about converting a chain specification to use the raw format, see [Customize a chain specification](https://docs.substrate.io/reference/how-to-guides/basics/customize-a-chain-specification/){target=\_blank}.

The sample chain specification is only valid for a single parachain with two validator nodes. If you add other validators, add additional parachains to your relay chain, or want to use custom account keys instead of the predefined account, you'll need to create a custom chain specification file.

Suppose you are completing this tutorial simultaneously as anyone on the same local network. In that case, you must download and modify the Plain sample relay chain spec to prevent accidentally peering with their nodes. Find the following line in the plain chain spec and add characters to make your protocolId unique:

```json
"protocolId": "dot",
```
## Start the Relay Chain Node

Before starting block production for a parachain, you need to start a relay chain for them to connect.

To start the validator nodes using the [raw sample chain specification file](https://docs.substrate.io/assets/tutorials/relay-chain-specs/raw-local-chainspec.json/){target=\_blank}, follow these steps:

1. Download the raw chain specification file to a working directory on the local computer.

    For example, save the file as `raw-local-chainspec.json` in the `/tmp` directory. When starting the nodes, you’ll need to specify the path to the file in the commands.

2. Start the first validator using the alice account by running the following command:

      ```bash
      ./target/release/polkadot \
      --alice \
      --validator \
      --base-path /tmp/relay/alice \
      --chain /tmp/raw-local-chainspec.json \
      --port 30333 \
      --rpc-port 9944 \
      --insecure-validator-i-know-what-i-do \
      --force-authoring
      ```

    This command uses `/tmp/raw-local-chainspec.json` as the location of the sample chain specification file. Be sure the `--chain` command line specifies the path to the raw chain specification you downloaded into a local working directory. This command also uses the default values for the port (`port`) and WebSocket port (`ws-port`). The values are explicitly included here as a reminder to always check these settings. After the node starts, no other nodes on the same local machine can use these ports.

3. Review log messages as the node starts and take note of the `Local node identity` value. This value is the node’s peer ID, which you need to connect the parachain to the relay chain.

      <div id="termynal" data-termynal>
          <span data-ty="input"><span class="file-path"></span>./target/release/polkadot \
      --alice \
      --validator \
      --base-path /tmp/relay/alice \
      --chain /tmp/raw-local-chainspec.json \
      --port 30333 \
      --rpc-port 9944 \
      --insecure-validator-i-know-what-i-do \
      --force-authoring 
          </span>
         <span>2024-09-09 13:49:58 Parity Polkadot</span>
          <br>
         <span>2024-09-09 13:49:58 ✌️  version 1.15.2-d6f482d5593</span>
          <br>
         <span>2024-09-09 13:49:58 ❤️  by Parity Technologies <admin@parity.io>, 2017-2024</span>
         <br>
         <span>2024-09-09 13:49:58 📋 Chain specification: Rococo Local Testnet</span>
         <br>
         <span>2024-09-09 13:49:58 🏷  Node name: Alice</span>
         <br>
         <span>2024-09-09 13:49:58 👤 Role: AUTHORITY</span>
         <br>
         <span>2024-09-09 13:49:58 💾 Database: RocksDb at /tmp/relay/alice/chains/rococo_local_testnet/db/full<span>
         <br>
         <span>2024-09-09 13:49:59 🏷  Local node identity is: 12D3KooWG393uX82rR3QgDkZpb7U8StzuRx9BQUXCvWsP1ctgygp</span>
         <br>
         <span>2024-09-09 13:49:59 Running libp2p network backend</span>
         <br>
         <span>...</span>
      </div>

!!! note
    You need to specify this identifier to enable other nodes to connect. In this case, the `Local node identity` is `12D3KooWG393uX82rR3QgDkZpb7U8StzuRx9BQUXCvWsP1ctgygp`.


4. Open a new terminal and start the second validator using the bob account.

The command is similar to the command used to start the first node, with a few crucial differences. 

```bash
./target/release/polkadot \
--bob \
--validator \
--base-path /tmp/relay/bob \
--chain /tmp/raw-local-chainspec.json \
--port 30334 \
--rpc-port 9945
```

Notice that this command uses a different base path (/tmp/relay/bob), validator key (`--bob`), and ports (`30334` and `9945`).

Because both validators are running on a single local computer, it isn't necessary to specify the --bootnodes command-line option and the first node’s IP address and peer identifier. The bootnodes option is required to connect nodes outside the local network or not identified in the chain specification file.

If you don't see the relay chain producing blocks, try disabling your firewall or adding the bootnodes command-line option with the address of the alice node to start the node. Adding the bootnodes option looks like this (with the node identity from above): 
```bash
--bootnodes \
/ip4/127.0.0.1/tcp/30333/p2p/12D3KooWG393uX82rR3QgDkZpb7U8StzuRx9BQUXCvWsP1ctgygp
```

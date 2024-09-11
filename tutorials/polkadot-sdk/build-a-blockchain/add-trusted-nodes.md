---
title: Add Trusted Nodes
description: TODO
---

# Add Trusted Nodes

## Introduction

This tutorial demonstrates how to start a small, standalone blockchain network with a private set of authorized validators. 

In blockchain networks, nodes must agree on the data state at any given time - a concept known as consensus. The [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} uses a proof of authority consensus model called Aura (Authority Round), which limits block production to a rotating list of authorized accounts. These trusted participants, or authorities, create blocks in a round-robin fashion.

This approach provides a simple method for launching a solo blockchain with a limited number of participants. 

You'll learn how to generate keys for network authorities, create a custom chain specification file, and launch a private two-node blockchain network.

## Prerequisites

Before starting this tutorial, ensure you have:

- Installed and configured Rust on your system. For detailed instructions on installing Rust and setting up your development environment, refer to the [Installation]() guide
- Completed the [Build a Local Blockchain]() tutorial and have the [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} installed on your local machine
- Experience using predefined accounts to start nodes on a single computer, as described in the [Simulate a Network]() guide

## Generate an Account and Keys

Unlike in the [Simulate a Network]() tutorial where you used predefined accounts and keys to start peer nodes, this tutorial requires you to generate unique secret keys for your validator nodes. It's crucial to understand that in a real blockchain network, each participant is responsible for generating and managing their own unique set of keys.
This process of generating your own keys serves several important purposes:

- It enhances the security of your network by ensuring that each node has its own unique cryptographic identity
- It simulates a more realistic blockchain environment where participants don't share key information
- It helps you understand the process of key generation, which is a fundamental skill in blockchain operations

### Key Generation Options

### Generate Local Keys with the Node Template

Best practices for key generation:

- Ideally, use an air-gapped computer (never connected to the internet) when generating keys for a production blockchain
- At minimum, disconnect from the internet before generating keys for any public or private blockchain not under your control

For this tutorial, however, we'll use the `solochain-template-node `command-line options to generate random keys locally while remaining connected to the internet. This method is suitable for learning and testing purposes.

Follow these steps to generate your keys:

1. Navigate to the root directory where you compiled the Substrate node template

2. Generate a random secret phrase and Sr25519 keys. Enter a password when prompted:

    ```bash
    ./target/release/solochain-template-node key generate --scheme Sr25519 --password-interactive
    ```

    The command will output information about the generated keys similar to the following:

    ```plain
    Secret phrase:       digital width rely long insect blind usual name oyster easy steak spend
      Network ID:        substrate
      Secret seed:       0xc52405d0b45dd856cbf1371f3b33fbde20cb76bf6ee440d12ea15f7ed17cca0a
      Public key (hex):  0xea23fa399c6bd91af3d7ea2d0ad46c48aff818b285342d9aaf15b3172270e914
      Account ID:        0xea23fa399c6bd91af3d7ea2d0ad46c48aff818b285342d9aaf15b3172270e914
      Public key (SS58): 5HMhkSHpD4XcibjbU9ZiGemLpnsTUzLsG5JhQJQEcxp3KJaW
      SS58 Address:      5HMhkSHpD4XcibjbU9ZiGemLpnsTUzLsG5JhQJQEcxp3KJaW
    ```

    Note the Sr25519 public key for the account. This key will be used for producing blocks with `aura`. In this example, the Sr25519 public key for the account is `5HMhkSHpD4XcibjbU9ZiGemLpnsTUzLsG5JhQJQEcxp3KJaW`.

3. Use the generated secret phrase to derive keys using the Ed25519 signature scheme. Enter the same password you used in the previous step:

    ```bash
    ./target/release/solochain-template-node key inspect --password-interactive --scheme Ed25519 "INSERT_SECRET_PHRASE"
    ```

    !!! note
        Replace `INSERT_SECRET_PHRASE` with the secret phrase generated in step 2.

    The command will output information about the generated keys similar to the following:

    ```plain
    Secret phrase:       digital width rely long insect blind usual name oyster easy steak spend
      Network ID:        substrate
      Secret seed:       0xc52405d0b45dd856cbf1371f3b33fbde20cb76bf6ee440d12ea15f7ed17cca0a
      Public key (hex):  0xc9c2cd111f98f2bf78bab6787449fc007dd7f2a5d02f099919f7fb50ade97dd6
      Account ID:        0xc9c2cd111f98f2bf78bab6787449fc007dd7f2a5d02f099919f7fb50ade97dd6
      Public key (SS58): 5GdFMFbXy24uz8mFZroFUgdBkY2pq6igBNGAq9tsBfEZRSzP
      SS58 Address:      5GdFMFbXy24uz8mFZroFUgdBkY2pq6igBNGAq9tsBfEZRSzP
    ```

    The Ed25519 key you've generated is crucial for block finalization using the `grandpa` consensus algorithm. The Ed25519 public key for the account is `5GdFMFbXy24uz8mFZroFUgdBkY2pq6igBNGAq9tsBfEZRSzP`.


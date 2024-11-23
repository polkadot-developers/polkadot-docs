---
title: Spin Your Nodes
description: Launch a blockchain with a private set of authorized validators. Generate keys, create a custom chain spec, and start a two-node network with Aura consensus.
---

# Spin Your Own Nodes

## Introduction

This tutorial guides you through launching a private blockchain network with a small, trusted set of validators. In decentralized networks, consensus ensures that nodes agree on the state of the data at any given time. The [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=_blank} uses Aura (Authority Round), a proof of authority consensus mechanism where a fixed set of trusted validators produces blocks in a round-robin fashion. This approach offers an easy way to launch a standalone blockchain with a predefined list of validators.

You'll learn how to generate keys, create a custom chain specification, and start a two-node blockchain network using the Aura consensus mechanism.

## Prerequisites

Before starting this tutorial, ensure you have:

- Installed and configured Rust on your system. For detailed instructions on installing Rust and setting up your development environment, refer to the [Installation](/develop/blockchains/get-started/install-polkadot-sdk){target=\_blank} guide
- Completed the [Build a Local Blockchain](/tutorials/blockchains/custom-blockchains/build-a-blockchain/build-a-local-blockchain){target=\_blank} tutorial and have the [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} installed on your local machine
- Experience using predefined accounts to start nodes on a single computer, as described in the [Simulate a Network](/tutorials/blockchains/custom-blockchains/build-a-blockchain/simulate-a-network){target=\_blank} guide

## Generate an Account and Keys

Unlike in the [Simulate a Network](/tutorials/blockchains/custom-blockchains/build-a-blockchain/simulate-a-network){target=\_blank} tutorial, where you used predefined accounts and keys to start peer nodes, this tutorial requires you to generate unique secret keys for your validator nodes. It's crucial to understand that each participant is responsible for generating and managing their own unique set of keys in a real blockchain network.

This process of generating your own keys serves several important purposes:

- It enhances the security of your network by ensuring that each node has its own unique cryptographic identity
- It simulates a more realistic blockchain environment where participants don't share key information
- It helps you understand the process of key generation, which is a fundamental skill in blockchain operations

There are a couple of Polkadot Wiki articles that may help you better understand the different signing algorithms used in this tutorial. See the [Keypairs and Signing](https://wiki.polkadot.network/docs/learn-cryptography#keypairs-and-signing){target=\_blank} section to learn about the sr25519 and ed25519 signing algorithms. Refer to the [Keys](https://wiki.polkadot.network/docs/learn-cryptography#keys){target=\_blank} section to learn more about the different types of keys used in the ecosystem.

### Key Generation Options

There are several ways you can generate keys. The available methods are:

- **[`solochain-template-node key` subcommand](https://docs.rs/sc-cli/0.46.0/sc_cli/commands/enum.KeySubcommand.html){target=\_blank}** - the most straightforward method for developers working directly with the node is to use the integrated key generation feature. Using the `key` subcommand, you can generate keys directly from your node's command line interface. This method ensures compatibility with your chain and is convenient for quick setup and testing
- **[subkey](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/bin/utils/subkey){target=\_blank}** - it is a powerful standalone utility specifically designed for Polkadot SDK-based chains. It offers advanced options for key generation, including support for different key types such as `ed25519` and `sr25519`. This tool allows fine-grained control over the key generation process
- **Third-party key generation utilities** - various tools developed by the community

### Generate Local Keys with the Node Template

Best practices for key generation:

- Whenever possible, use an air-gapped computer, meaning never connected to the internet, when generating keys for a production blockchain
- If an air-gapped computer is not an option, disconnect from the internet before generating keys for any public or private blockchain not under your control

For this tutorial, however, you'll use the `solochain-template-node` command-line options to generate random keys locally while remaining connected to the internet. This method is suitable for learning and testing purposes.

Follow these steps to generate your keys:

1. Navigate to the root directory where you compiled the node template

2. Generate a random secret phrase and Sr25519 keys. Enter a password when prompted:

    ```bash
    ./target/release/solochain-template-node key generate \
    --scheme Sr25519 \
    --password-interactive
    ```

    The command will output information about the generated keys similar to the following:

    --8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes/key-sr25519-1.html'

    Note the Sr25519 public key for the account (SS58 format). This key will be used for producing blocks with Aura. In this example, the Sr25519 public key for the account is `5HMhkSHpD4XcibjbU9ZiGemLpnsTUzLsG5JhQJQEcxp3KJaW`.

3. Use the generated secret phrase to derive keys using the Ed25519 signature scheme. 

    ```bash
    ./target/release/solochain-template-node key inspect \
    --scheme Ed25519 \
    --password-interactive \
    ```

    When prompted for a **Key password**, enter the same password you used in the previous step

    !!! note
        Replace `INSERT_SECRET_PHRASE` with the secret phrase generated in step 2.

    The command will output information about the generated keys similar to the following:

    --8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes/key-ed25519-1.html'

    The Ed25519 key you've generated is crucial for block finalization using the `grandpa` consensus algorithm. The Ed25519 public key for the account is `5GdFMFbXy24uz8mFZroFUgdBkY2pq6igBNGAq9tsBfEZRSzP`.

### Generate a Second Set of Keys

In this tutorial, the private network will consist of two nodes, meaning you'll need two distinct sets of keys. You have several options for generating this second set of keys:

- Use the keys from one of the predefined accounts
- Follow the steps from the previous section, but use a different identity on your local machine to create a new key pair
- Derive a child key pair to simulate a second identity on your local machine

For this tutorial, the second set of keys will be:

- **Sr25519 (for Aura)** - `5Df9bvnbqKNR8S1W2Uj5XSpJCKUomyymwCGf6WHKyoo3GDev`
- **Ed25519 (for Grandpa)** - `5DJRQQWEaJart5yQnA6gnKLYKHLdpX6V4vHgzAYfNPT2NNuW`

## Create a Custom Chain Specification

After generating key pairs for your blockchain, the next step is creating a custom chain specification. You will share this specification with trusted validators participating in your network.

To enable others to participate in your blockchain, ensure that each participant generates their own key pair. Once you collect the keys from all network participants, you can create a custom chain specification to replace the default local one.

In this tutorial, you'll modify the local chain specification to create a custom version for a two-node network. The same process can be used to add more nodes if you have the necessary keys.

### Steps to Create a Custom Chain Specification

1. Open a terminal and navigate to the root directory of your compiled node template

2. Export the local chain specification:

    ```bash
    ./target/release/solochain-template-node build-spec \
    --disable-default-bootnode \
    --chain local > customSpec.json
    ```

3. Preview the `customSpec.json` file:

    - Preview first fields:

        ```bash
        head customSpec.json
        ```
    --8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes/chainspec-head.html'

    - Preview last fields:
        ```bash
        tail -n 78 customSpec.json
        ```
    --8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes/chainspec-tail.html'

        This command will display fields that include configuration details for pallets, such as sudo and balances, as well as the validator settings for the Aura and Grandpa keys.

4. Edit `customSpec.json`:

    1. Update the `name` field:
    ```json
    "name": "My Custom Testnet",
    ```

    2. Add Sr25519 addresses for each validator in the authorities array to the `aura` field to specify the nodes with authority to create blocks:

        ```json
        "aura": {
          "authorities": [
            "5HMhkSHpD4XcibjbU9ZiGemLpnsTUzLsG5JhQJQEcxp3KJaW",
            "5Df9bvnbqKNR8S1W2Uj5XSpJCKUomyymwCGf6WHKyoo3GDev"
          ]
        },
        ```

    3. Add Ed25519 addresses for each validator in the authorities array to the `grandpa` field to specify the nodes with the authority to finalize blocks. Include a voting weight (typically `1`) for each validator to define their voting power:
    
        ```json
        "grandpa": {
          "authorities": [
            [
              "5GdFMFbXy24uz8mFZroFUgdBkY2pq6igBNGAq9tsBfEZRSzP",
              1
            ],
            [
              "5DJRQQWEaJart5yQnA6gnKLYKHLdpX6V4vHgzAYfNPT2NNuW",
              1
            ]
          ]
        },
        ```

5. Save and close `customSpec.json`

### Convert Chain Specification to Raw Format

After creating your custom chain specification, the next crucial step is converting it to a raw format. This process is essential because the raw format includes encoded storage keys that nodes use to reference data in their local storage. By distributing a raw chain specification, you ensure that each node in the network stores data using the same storage keys, which is vital for maintaining data integrity and facilitating network synchronization.

To convert your chain specification to the raw format, follow these steps:

1. Navigate to the root directory where you compiled the node template
   
2. Run the following command to convert the `customSpec.json` chain specification to the raw format and save it as `customSpecRaw.json`:

    ```bash
    ./target/release/solochain-template-node build-spec \
    --chain=customSpec.json \
    --raw \
    --disable-default-bootnode > customSpecRaw.json
    ```

## Add Keys to the Keystore

To enable block production and finalization, you need to add two types of keys to the keystore for each node in the network:

- `aura` authority keys for block production
- `grandpa` authority keys for block finalization

Follow these steps for each node in your network:

1. Open a terminal and navigate to the root directory where you compiled the node template

2. Insert the `aura` secret key:

    ```bash
    ./target/release/solochain-template-node key insert \
    --base-path /tmp/node01 \
    --chain customSpecRaw.json \
    --scheme Sr25519 \
    --suri "INSERT_SECRET_PHRASE" \
    --password-interactive \
    --key-type aura
    ```

    !!!note
        Replace `INSERT_SECRET_PHRASE` with the secret phrase or seed you generated earlier. When prompted, enter the password you used to generate the keys.

3. Insert the `grandpa` secret key:
    ```bash
    ./target/release/solochain-template-node key insert \
    --base-path /tmp/node01 \
    --chain customSpecRaw.json \
    --scheme Ed25519 \
    --suri "INSERT_SECRET_PHRASE" \
    --password-interactive \
    --key-type gran
    ```

    !!!note
        Use the same secret phrase or seed and password as in step 2.

4. Verify that your keys are in the keystore by running the following command:

    ```bash
    ls /tmp/node01/chains/local_testnet/keystore
    ```

    You should see output similar to:

    <div id='termynal' data-termynal>
        <span data-ty="input"><span class="file-path"></span>ls /tmp/node01/chains/local_testnet/keystore</span>
        <br>
        <span data-ty>61757261ea23fa399c6bd91af3d7ea2d0ad46c48aff818b285342d9aaf15b3172270e914</span>
        <span data-ty>6772616ec9c2cd111f98f2bf78bab6787449fc007dd7f2a5d02f099919f7fb50ade97dd6</span>
    </div>

## Start the First Node

Before starting the first node, it's crucial to generate a network key. This key ensures that the node's identity remains consistent, allowing other nodes to connect to it reliably as a bootnode for synchronization.

To generate a network key, run the following command:

```bash
./target/release/solochain-template-node key \
generate-node-key --base-path /tmp/node01
```

!!!note
    This command generates a network key and stores it in the same base path used for storing the `aura` and `grandpa` keys.

After generating the network key, start the first node using your custom chain specification with the following command:

```bash
./target/release/solochain-template-node \
--base-path /tmp/node01 \
--chain ./customSpecRaw.json \
--port 30333 \
--rpc-port 9945 \
--validator \
--name MyNode01 \
--password-interactive
```

Upon execution, you should see output similar to the following:

--8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes/node-output.html'

After starting the first node, you'll notice:

- The node is running with the custom chain specification ("My Custom Testnet")
- The local node identity is displayed (`12D3KooWSbaPxmb2tWLgkQVoJdxzpBPTd9dQPmKiJfsvtP753Rg1` in this example). This identity is crucial for other nodes to connect to this one
- The node is currently idle with 0 peers, as it's the only node in the network at this point
- No blocks are being produced. Block production will commence once another node joins the network

## Add More Nodes

Block finalization requires at least two-thirds of the validators. In this example network configured with two validators, block finalization can only start after the second node has been added.

Before starting additional nodes, ensure you've properly configured their keys as described in the [Add Keys to the Keystore](#add-keys-to-the-keystore) section. For this node, the keys should be stored under the `/tmp/node02` base path.

To add a second validator to the private network, run the following command:

```bash
./target/release/solochain-template-node \
--base-path /tmp/node02 \
--chain ./customSpecRaw.json \
--port 30334 \
--rpc-port 9946 \
--validator \
--name MyNode02 \
--bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWSbaPxmb2tWLgkQVoJdxzpBPTd9dQPmKiJfsvtP753Rg1 \
--unsafe-force-node-key-generation \
--password-interactive
```

Key points about this command:

- It uses a different `base-path` and name to identify this as the second validator
- The `--chain` option specifies the same chain specification file used for the first node
- The `--bootnodes` option is crucial. It should contain the local node identifier from the first node in the network
- The `--unsafe-force-node-key-generation` parameter forces the generation of a new node key if one doesn't exist. For non-bootnode validators (like this second node and any subsequent nodes), it's less critical if the key changes because they won't be used as bootnodes. However, for consistency and best practices, it's recommended to generate and maintain a stable node key for all validators once the network is set up

After both nodes have added their keys to their respective keystores (under `/tmp/node01` and `/tmp/node02`) and been run, you should see:

- The same genesis block and state root hashes on both nodes
- Each node showing one peer
- Block proposals being produced 
- After a few seconds, new blocks being finalized on both nodes
  
If successful, you should see logs similar to the following on both nodes:

--8<-- 'code/tutorials/blockchains/custom-blockchains/build-a-blockchain/add-trusted-nodes/node-output-1.html'
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

1. Navigate to the root directory where you compiled the node template

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

### Generate a Second Set of Keys

In this tutorial, the private network will consist of two nodes, meaning you'll need two distinct sets of keys. You have several options for generating these second set of keys:

- Use the keys from one of the predefined accounts
- Follow the steps from the previous section, but use a different identity on your local machine to create a new key pair
- Derive a child key pair to simulate a second identity on your local machine

For the purpose of this tutorial, the second set of keys will be:

- Sr25519 (for Aura) - `5Df9bvnbqKNR8S1W2Uj5XSpJCKUomyymwCGf6WHKyoo3GDev`
- Ed25519 (for Grandpa)  `5DJRQQWEaJart5yQnA6gnKLYKHLdpX6V4vHgzAYfNPT2NNuW`

## Create a Custom Chain Specification

After generating key pairs for your blockchain, the next step is creating a custom chain specification. This specification will be shared with trusted validators participating in your network.

To enable others to participate in your blockchain, ensure that each participant generates their own key pair. Once you collect the keys from all network participants, you can create a custom chain specification to replace the default local one.

In this tutorial, you'll modify the local chain specification to create a custom version for a two-node network. The same process can be used to add more nodes if you have the necessary keys.

### Add Validators

When creating your custom chain specification, you'll need to add validators by modifying two key sections:

1. Aura Section - controls block production
    - Add Sr25519 addresses for each validator
    - Example: `"aura": { "authorities": ["5CfB...", "5CXG..."] }`
  

2. Grandpa Section - controls block finalization
    - Add Ed25519 addresses for each validator
    - Include a voting weight (typically 1 for equal voting power)
    - Example: `"grandpa": { "authorities": [["5Cuq...", 1], ["5Dpd...", 1]] }`

!!!note
    Always use unique keys for each validator to prevent conflicts in block production.

### Steps to Create a Custom Specification

1. Open a terminal and navigate to the root directory of your compiled node template

2. Export the local chain specification:

    ```bash
    ./target/release/solochain-template-node build-spec --disable-default-bootnode --chain local > customSpec.json
    ```

3. Preview the `customSpec.json` file:

    - Preview first fields
    <div id='termynal' data-termynal>
        <span data-ty='input'><span class='file-path'></span>head customSpec.json</span>

        <br>
        <span data-ty>{</span>
        <span data-ty>  "name": "Local Testnet",</span>
        <span data-ty>  "id": "local_testnet",</span>
        <span data-ty>  "chainType": "Local",</span>
        <span data-ty>  "bootNodes": [],</span>
        <span data-ty>  "telemetryEndpoints": null,</span>
        <span data-ty>  "protocolId": null,</span>
        <span data-ty>  "properties": null,</span>
        <span data-ty>  "codeSubstitutes": {},</span>
        <span data-ty>  "genesis": {</span>
    </div>

    - Preview last fields
    <div id='termynal' data-termynal>
        <span data-ty='input'><span class='file-path'>tail -n 78 customSpec.json</span></span>

        <br>
        <span data-ty>      "patch": {</span>
        <span data-ty>        "aura": {</span>
        <span data-ty>          "authorities": [</span>
        <span data-ty>            "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",</span>
        <span data-ty>            "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"</span>
        <span data-ty>          ]</span>
        <span data-ty>        },</span>
        <span data-ty>        "balances": {</span>
        <span data-ty>          "balances": [</span>
        <span data-ty>            [</span>
        <span data-ty>              "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5Ck5SLSHYac6WFt5UZRSsdJjwmpSZq85fd5TRNAdZQVzEAPT",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5HKPmK9GYtE1PSLsS1qiYU9xQ9Si1NcEhdeCq9sw5bqu4ns8",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5FCfAonRZgTFrTd9HREEyeJjDpT397KMzizE6T3DvebLFE7n",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5CRmqmsiNFExV6VbdmPJViVxrWmkaXXvBrSX8oqBT8R9vmWk",</span>
        <span data-ty>              1152921504606846976</span>
        <span data-ty>            ]</span>
        <span data-ty>          ]</span>
        <span data-ty>        },</span>
        <span data-ty>        "grandpa": {</span>
        <span data-ty>          "authorities": [</span>
        <span data-ty>            [</span>
        <span data-ty>              "5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu",</span>
        <span data-ty>              1</span>
        <span data-ty>            ],</span>
        <span data-ty>            [</span>
        <span data-ty>              "5GoNkf6WdbxCFnPdAnYYQyCjAKPJgLNxXwPjwTh6DGg6gN3E",</span>
        <span data-ty>              1</span>
        <span data-ty>            ]</span>
        <span data-ty>          ]</span>
        <span data-ty>        },</span>
        <span data-ty>        "sudo": {</span>
        <span data-ty>          "key": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"</span>
        <span data-ty>        }</span>
        <span data-ty>      }</span>
        <span data-ty>    }</span>
        <span data-ty>  }</span>
        <span data-ty>}%</span>
    </div>

        This command will display fields that include configuration details for pallets such as sudo and balances, as well as the validator settings for the Aura and Grandpa keys.

4. Edit `customSpec.json`:

    1. Update the `name` field:
    ```json
    "name": "My Custom Testnet",
    ```

    2. Modify the `aura` field to specify the nodes with the authority to create blocks by adding the Sr25519 SS58 address keys:
    ```json
    "aura": {
      "authorities": [
        "5HMhkSHpD4XcibjbU9ZiGemLpnsTUzLsG5JhQJQEcxp3KJaW",
        "5Df9bvnbqKNR8S1W2Uj5XSpJCKUomyymwCGf6WHKyoo3GDev"
      ]
    },
    ```

    3. Update the `grandpa` field to specify the nodes with the authority to finalize blocks by adding the Ed25519 SS58 address keys:
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
   
2. Run the following command to convert the `customSpec.json` chain specification to the raw format, saving it as `customSpecRaw.json`:

    ```bash
    ./target/release/solochain-template-node build-spec --chain=customSpec.json --raw --disable-default-bootnode > customSpecRaw.json
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
        <span data-ty='input'><span class='file-path'></span>ls /tmp/node01/chains/local_testnet/keystore</span>
        <br>
        <span data-ty>61757261ea23fa399c6bd91af3d7ea2d0ad46c48aff818b285342d9aaf15b3172270e914</span>
        <span data-ty>6772616ec9c2cd111f98f2bf78bab6787449fc007dd7f2a5d02f099919f7fb50ade97dd6</span>
    </div>

## Start the First Node

Before starting the first node, it's crucial to generate a network key. This key ensures that the node's identity remains consistent, allowing other nodes to reliably connect to it as a bootnode for synchronization.

To generate a network key, run the following command:

```bash
./target/release/solochain-template-node key generate-node-key --base-path /tmp/node01
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

<div id='termynal' data-termynal>
    <span data-ty>2024-09-12 11:18:46 Substrate Node</span>
    <span data-ty>2024-09-12 11:18:46 ✌️  version 0.1.0-8599efc46ae</span>
    <span data-ty>2024-09-12 11:18:46 ❤️  by Parity Technologies <admin@parity.io>, 2017-2024</span>
    <span data-ty>2024-09-12 11:18:46 📋 Chain specification: My Custom Testnet</span>
    <span data-ty>2024-09-12 11:18:46 🏷  Node name: MyNode01</span>
    <span data-ty>2024-09-12 11:18:46 👤 Role: AUTHORITY</span>
    <span data-ty>2024-09-12 11:18:46 💾 Database: RocksDb at /tmp/node01/chains/local_testnet/db/full</span>
    <span data-ty>2024-09-12 11:18:46 Using default protocol ID "sup" because none is configured in the chain specs</span>
    <span data-ty>2024-09-12 11:18:46 🏷  Local node identity is: 12D3KooWSbaPxmb2tWLgkQVoJdxzpBPTd9dQPmKiJfsvtP753Rg1</span>
    <span data-ty>2024-09-12 11:18:46 Running libp2p network backend</span>
    <span data-ty>2024-09-12 11:18:46 💻 Operating system: macos</span>
    <span data-ty>2024-09-12 11:18:46 💻 CPU architecture: aarch64</span>
    <span data-ty>2024-09-12 11:18:46 📦 Highest known block at #0</span>
    <span data-ty>2024-09-12 11:18:46 〽️ Prometheus exporter started at 127.0.0.1:9615</span>
    <span data-ty>2024-09-12 11:18:46 Running JSON-RPC server: addr=127.0.0.1:9945, allowed origins=["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"]</span>
    <span data-ty>2024-09-12 11:18:51 💤 Idle (0 peers), best: #0 (0x850f…951f), finalized #0 (0x850f…951f), ⬇ 0 ⬆ 0</span>
</div>

After starting the first node, you'll notice:

- The node is running with the custom chain specification ("My Custom Testnet")
- The local node identity is displayed (12D3KooWSbaPxmb2tWLgkQVoJdxzpBPTd9dQPmKiJfsvtP753Rg1 in this example). This identity is crucial for other nodes to connect to this one
- The node is currently idle with 0 peers, as it's the only node in the network at this point
- No blocks are being produced.  Block production will commence once another node joins the network

## Add More Nodes

Block finalization requires at least two-thirds of the validators. In this example network configured with two validators, block finalization can only start after the second node has been added.

Before starting additional nodes, ensure you've properly configured their keys as described in the [Add Keys to the Keystore](#add-keys-to-the-keystore) section. For this node, the keys should be stored under the `/tmp/node02` base path.

To add a second validator to the private network run the following command:

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
  
If every step was correctly performed, you should see logs similar to the following on both nodes:

<div id='termynal' data-termynal>
    <span data-ty>2024-09-12 15:37:05 💤 Idle (0 peers), best: #0 (0x8af7…53fd), finalized #0 (0x8af7…53fd), ⬇ 0 ⬆ 0</span>
    <span data-ty>2024-09-12 15:37:08 discovered: 12D3KooWMaL5zqYiMnVikaYCGF65fKekSPqXGgyz92eRcqcnfpey /ip4/192.168.1.2/tcp/30334</span>
    <span data-ty>2024-09-12 15:37:10 💤 Idle (1 peers), best: #0 (0x8af7…53fd), finalized #0 (0x8af7…53fd), ⬇ 0.6kiB/s ⬆ 0.6kiB/s</span>
    <span data-ty>2024-09-12 15:37:12 🙌 Starting consensus session on top of parent 0x8af7c72457d437486fe697b4a11ef42b26c8b4448836bdb2220495aea39f53fd (#0)</span>
    <span data-ty>2024-09-12 15:37:12 🎁 Prepared block for proposing at 1 (6 ms) [hash: 0xb97cb3a4a62f0cb320236469d8e1e13227a15138941f3c9819b6b78f91986262; parent_hash: 0x8af7…53fd; extrinsics (1): [0x1ef4…eecb]</span>
    <span data-ty>2024-09-12 15:37:12 🔖 Pre-sealed block for proposal at 1. Hash now 0x05115677207265f22c6d428fb00b65a0e139c866c975913431ddefe291124f04, previously 0xb97cb3a4a62f0cb320236469d8e1e13227a15138941f3c9819b6b78f91986262.</span>
    <span data-ty>2024-09-12 15:37:12 🏆 Imported #1 (0x8af7…53fd → 0x0511…4f04)</span>
    <span data-ty>2024-09-12 15:37:15 💤 Idle (1 peers), best: #1 (0x0511…4f04), finalized #0 (0x8af7…53fd), ⬇ 0.5kiB/s ⬆ 0.6kiB/s</span>
    <span data-ty>2024-09-12 15:37:18 🏆 Imported #2 (0x0511…4f04 → 0x17a7…a1fd)</span>
    <span data-ty>2024-09-12 15:37:20 💤 Idle (1 peers), best: #2 (0x17a7…a1fd), finalized #0 (0x8af7…53fd), ⬇ 0.6kiB/s ⬆ 0.5kiB/s</span>
    <span data-ty>2024-09-12 15:37:24 🙌 Starting consensus session on top of parent 0x17a77a8799bd58c7b82ca6a1e3322b38e7db574ee6c92fbcbc26bbe5214da1fd (#2)</span>
    <span data-ty>2024-09-12 15:37:24 🎁 Prepared block for proposing at 3 (1 ms) [hash: 0x74d78266b1ac2514050ced3f34fbf98a28c6a2856f49dbe8b44686440a45f879; parent_hash: 0x17a7…a1fd; extrinsics (1): [0xe35f…8d48]</span>
    <span data-ty>2024-09-12 15:37:24 🔖 Pre-sealed block for proposal at 3. Hash now 0x12cc1e9492988cfd3ffe4a6eb3186b1abb351a12a97809f7bae4a7319e177dee, previously 0x74d78266b1ac2514050ced3f34fbf98a28c6a2856f49dbe8b44686440a45f879.</span>
    <span data-ty>2024-09-12 15:37:24 🏆 Imported #3 (0x17a7…a1fd → 0x12cc…7dee)</span>
    <span data-ty>2024-09-12 15:37:25 💤 Idle (1 peers), best: #3 (0x12cc…7dee), finalized #1 (0x0511…4f04), ⬇ 0.5kiB/s ⬆ 0.6kiB/s</span>
</div>
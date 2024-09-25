---
title: Acquire a TestNet Slot
description: This guide walks you through the journey of securing a TestNet slot on Paseo for your parachain, detailing each step to a successful registration.
---

# Acquire a TestNet Slot

## Introduction

This tutorial demonstrates deploying a parachain on a public test network, such as the Paseo network. Public TestNets have a higher bar to entry than a private network but represent an essential step in preparing a parachain project to move into a production network. 

## Prerequisites

Before you start, you need to have the following prerequisites:

- You know how to generate and modify chain specification files as described in the [Add Trusted Nodes](TODO:update-path){target=\_blank} tutorial
- You know how to generate and store keys as described in the [Add Trusted Nodes](TODO:update-path){target=\_blank} tutorial
- You have completed the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/){target=\_blank} and the [Connect a Local Parachain](/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain.md){target=\_blank} tutorials on your local computer

## Get Started with an Account and Tokens

To perform any action on Paseo, you need PAS tokens, which can be requested from the [Polkadot Faucet](https://faucet.polkadot.io/){target=\_blank}. Also, to store the tokens, you must have access to a Substrate-compatible digital currency wallet. You can't use [development keys and accounts](TODO:update-path){target=\_blank} for operations in any public setting. Many options are available for holding digital currency—including hardware wallets and browser-based applications—and some are more reputable than others. You should do your own research before selecting one.

However, you can use the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface to get you started for testing purposes.

To prepare an account, follow these steps:

1. Open the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and connect to the Paseo network

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.webp)

2. Navigate to the **Accounts** section
    1. Click on the **Accounts** tab in the top menu
    2. Select the **Accounts** option from the dropdown menu
   
    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-2.webp)

3. Copy the address of the account you want to use for the parachain deployment

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-3.webp)

4. Visit the [Polkadot Faucet](https://faucet.polkadot.io){target=\_blank} and paste the copied address in the input field. Ensure that the network is set to Paseo and click on the **Get some PASs** button

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-4.webp)

    After a few seconds, you will receive 100 PAS tokens in your account.

## Reserve a Parachain Identifier

You must reserve a parachain identifier before you can register as a parathread on Paseo. The steps are similar to the ones you followed in [Connect a Local Parachain](/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/){target=_\blank} to reserve an identifier on the local relay chain. However, for the public TestNet, you'll be assigned the next available identifier.

To reserve a parachain identifier, follow these steps:

1. Navigate to the **Parachains** section
    1. Click on the **Network** tab in the top menu
    2. Select the **Parachains** option from the dropdown menu

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-5.webp)

2. Register a parathread
    1. Select the **Parathreads** tab
    2. Click on the **+ ParaId** button 

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-6.webp)

3. Review the transaction and click on the **+ Submit** button

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-7.webp)

    For this case, the next available parachain identifier is `4508`.

4. After submitting the transaction, you can navigate to the Explorer tab and check the list of recent events for successful `registrar.Reserved`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-8.webp)

## Modify the Chain Specification File

The files required to register a parachain must specify the correct relay chain to connect to and parachain identifier that you have been assigned. To make these changes, you must build and modify the chain specification file for your parachain. In this tutorial, the relay chain is `paseo` and the para identifier is `4508`.

To modify the chain specification:

1. Generate the plain text chain specification for the parachain template node by running the following command

    ```bash
    ./target/release/parachain-template-node build-spec --disable-default-bootnode > plain-parachain-chainspec.json
    ```

2. Open the plain text chain specification for the parachain template node in a text editor

3. Set relay-chain to paseo and `para_id` to the identifier you've been assigned

      For example, if your reserved identifier is 4508, set the `para_id` field to `4508`:

      ```json
      ...
      "relay_chain": "paseo",
      "para_id": 4508,
      "codeSubstitutes": {},
      "genesis": {
        ...
      }
      ...
      ```

4. Set the `parachainId` to the parachain identifier that you previously reserved

      ```json
      ...
        "parachainSystem": null,
        "parachainInfo": {
          "parachainId": 4508
        },
      ...
      ```

5. Add the public key for your account to the session keys section. Each configured session key will require a running collator

      ```json
      ...
        "session": {
          "keys": [
           [
             "5HErbKmL5JmUKDVsH1aGyXTGZb4i9iaNsFhSgkNDr8qp2Dvj",
             "5HErbKmL5JmUKDVsH1aGyXTGZb4i9iaNsFhSgkNDr8qp2Dvj",
             {
              "aura": "5HErbKmL5JmUKDVsH1aGyXTGZb4i9iaNsFhSgkNDr8qp2Dvj"
             }
           ],
          ]
        }
      ...
      ```

6. Save your changes and close the plain text chain specification file

7. Generate a raw chain specification file from the modified chain specification file by running the following command

      ```bash
      ./target/release/parachain-template-node build-spec --chain plain-parachain-chainspec.json --disable-default-bootnode --raw > raw-parachain-chainspec.json
      ```

      After running the command, you will see the following output:

       <div id="termynal" data-termynal>
       <span data-ty="input"><span class="file-path"></span>./target/release/parachain-template-node build-spec --chain plain-parachain-chainspec.json --disable-default-bootnode --raw > raw-parachain-chainspec.json</span>
       <br>
       <span data-ty="progress">2024-09-11 09:48:15 Building chain spec</span>
       <span data-ty="progress">2024-09-11 09:48:15 assembling new collators for new session 0 at #0</span>
       <span data-ty="progress">2024-09-11 09:48:15 assembling new collators for new session 1 at #0</span>
       </div>

## Export Required Files

To prepare the parachain collator to be registered on Paseo, follow these steps:

1. Export the WebAssembly runtime for the parachain by running a command similar to the following
 
      ```bash
      ./target/release/parachain-template-node export-genesis-wasm --chain raw-parachain-chainspec.json para-4508-wasm
      ```

2. Export the genesis state for the parachain by running a command similar to the following

      ```bash
      ./target/release/parachain-template-node export-genesis-state --chain raw-parachain-chainspec.json para-4508-state
      ```

## Start the Collator Node

You must have the ports for the collator publicly accessible and discoverable to enable parachain nodes to peer with Paseo validator nodes to produce blocks. You can specify the ports with the --port command-line option. For example, you can start the collator with a command similar to the following:

```bash
./target/release/parachain-template-node --collator \
  --chain raw-parachain-chainspec.json \
  --base-path /tmp/parachain/pubs-demo \
  --port 50333 \
  --rpc-port 8855 \
  -- \
  --execution wasm \
  --chain paseo \
  --port 50343 \
  --rpc-port 9988
```

In this example, the first `--port` setting specifies the port for the collator node and the second `--port` specifies the embedded relay chain node port. The first `--rpc-port` setting specifies the port you can use to connect to collator. The second `--rpc-port` specifies the port for connecting to the embedded relay chain.

## Obtain CoreTime 

With your parachain collator operational, the next step is acquiring CoreTime. This is essential for ensuring your parachain's security through the relay chain. [Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime){target=\_blank} enhances Polkadot's resource management, offering developers greater economic adaptability. Once you have configured your parachain, you can to follow two paths:

- Bulk CoreTime is purchased via the `Broker` pallet, on the respective Coretime system parachain. You can purchase bulk coretime on [Coretime chain](TODO:update-path){target=\_blank} and assign the purchased core to the registered ParaID
- On-demand CoreTime is ordered via the `OnDemandAssignment` pallet, which is located on the respective relay chain

For more information on Coretime, refer to the [Coretime documentation](TODO:update-path){target=\_blank}.
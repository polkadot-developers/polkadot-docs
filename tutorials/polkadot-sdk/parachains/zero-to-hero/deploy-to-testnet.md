---
title: Deploy on Paseo TestNet
description: This guide walks you through the journey of deploying your Polkadot SDK blockchain on Paseo, detailing each step to a successful TestNet deployment.
---

# Deploy on Paseo

## Introduction

This tutorial demonstrates deploying a parachain on a public test network like the Paseo network. Public TestNets have a higher bar to entry than a private network but represent an essential step in preparing a parachain project to move into a production network.

## Get Started with an Account and Tokens

To perform any action on Paseo, you need PAS tokens, which can be requested from the [Polkadot Faucet](https://faucet.polkadot.io/){target=\_blank}. To store the tokens, you must have access to a Substrate-compatible wallet. Go to the [Wallets and Extensions](https://wiki.polkadot.network/docs/wallets-and-extensions){target=\_blank} page on the Polkadot Wiki to view different options for a wallet, or use the [Polkadot.js browser extension](https://polkadot.js.org/extension/){target=\_blank}, which is suitable for development purposes.

!!!warning 
    Development keys and accounts should never hold assets of actual value and should not be used for production.

The [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface can be used to get you started for testing purposes.

To prepare an account, follow these steps:

1. Open the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and connect to the Paseo network. Alternatively use this link to connect directly to Paseo: [Polkadot.js Apps: Paseo](https://polkadot.js.org/apps/?rpc=wss://paseo.dotters.network#/explorer){target=\_blank}

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.webp)

2. Navigate to the **Accounts** section
    1. Click on the **Accounts** tab in the top menu
    2. Select the **Accounts** option from the dropdown menu
  
    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-2.webp)

3. Copy the address of the account you want to use for the parachain deployment

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-3.webp)

4. Visit the [Polkadot Faucet](https://faucet.polkadot.io){target=\_blank} and paste the copied address in the input field. Ensure that the network is set to Paseo and click on the **Get some PASs** button

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-4.webp)

    After a few seconds, you will receive 100 PAS tokens in your account.

## Reserve a Parachain Identifier

You must reserve a parachain identifier (ID) before registering your parachain on Paseo. You'll be assigned the next available identifier.

To reserve a parachain identifier, follow these steps:

1. Navigate to the **Parachains** section
    1. Click on the **Network** tab in the top menu
    2. Select the **Parachains** option from the dropdown menu

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-5.webp)

2. Register a ParaId
    1. Select the **Parathreads** tab
    2. Click on the **+ ParaId** button

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-6.webp)

3. Review the transaction and click on the **+ Submit** button

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-7.webp)

    For this case, the next available parachain identifier is `4508`.

4. After submitting the transaction, you can navigate to the **Explorer** tab and check the list of recent events for successful `registrar.Reserved`

    ![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-8.webp)

## Generate the Chain Specification

The files required to register a parachain must specify the correct relay chain to connect to and the parachain identifier you have been assigned. To make these changes, you must build and modify the chain specification file for your parachain. In this tutorial, the relay chain is `paseo`, and the parachain identifier is `4508`.

To modify the chain specification:

1. Generate the plain chain specification for the parachain template node by running the following command. You should find your runtime's Wasm file inside `target/release/wbuild`:

    ```bash
    chain-spec-builder create --relay-chain paseo \
    --para-id 4508 \
    -r <runtime.compact.compressed.wasm> \
    default
    ```
!!!info
    Be sure to use the `*.compact.compressed.wasm` version of your file when generating your chain specification.

2. Open the plain text chain specification for the parachain template node in a text editor

3. Set the `parachainId` to the parachain identifier that you previously reserved:

      ```json
      --8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.json::2'
      --8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.json:5:10'
      --8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.json:22:25'
      ```

4. Add the public key for your account to the session keys section. Each configured session key will require a running collator:

      ```json
      --8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.json::2'
      --8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.json:5:7'
      --8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.json:11:25'
      ```

5. Save your changes and close the plain text chain specification file

6. Convert the modified plain chain specification file to a raw chain specification file:

      ```bash
      chain-spec-builder convert-to-raw plain-parachain-chainspec.json
      ````

    You should now see your chain specification containing SCALE-encoded hex values versus plain text.

## Export Required Files

To prepare the parachain collator to be registered on Paseo, follow these steps:

1. Export the Wasm runtime for the parachain by running a command similar to the following:

      ```bash
      polkadot-omni-node export-genesis-wasm \
        --chain raw-parachain-chainspec.json para-wasm
      ```

2. Export the genesis state for the parachain by running a command similar to the following:

      ```bash
      polkadot-omni-node export-genesis-state \
        --chain raw-parachain-chainspec.json para-state
      ```

## Register a Parathread

Once you have the genesis state and runtime, you can now register these with your parachain ID.

1. Go to the [Parachains > Parathreads](https://polkadot.js.org/apps/#/parachains/parathreads){target=\_blank} tab, and select **+ Parathread**
   
2. You should see fields to place your runtime Wasm and genesis state respectively, along with the parachain ID. Select your parachain ID, and upload `para-wasm` in the "code" field and `para-state` in the "initial state" field:

![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-9.webp)
   
3. Confirm your details and **+ Submit** button, where there should be a new Parathread with your parachain ID and an active **Deregister** button:

![](/images/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/acquire-a-testnet-slot-10.webp)

Your parachain's runtime logic and genesis are now part of the relay chain. The next step is to ensure you are able to run a collator to produce blocks for your parachain.

## Start the Collator Node

Before starting a collator, generate a node key. A node key is responsible for communicating with other nodes over Libp2p:

```bash
polkadot-omni-node key generate-node-key \
    --base-path /tmp/parachain/pubs-demo \
    --chain raw-parachain-chainspec.json
```

After running the command, you should see the following output, indicating the base path now has a suitable node key: 

--8<-- 'code/tutorials/polkadot-sdk/parachains/connect-to-relay-chain/acquire-a-testnet-slot/deploy-on-paseo-3.html'

You must have the ports for the collator publicly accessible and discoverable to enable parachain nodes to peer with Paseo validator nodes to produce blocks. You can specify the ports with the `--port` command-line option. For example, you can start the collator with a command similar to the following:

```bash
polkadot-omni-node --collator \
  --chain raw-parachain-chainspec.json \
  --base-path /tmp/parachain/pubs-demo \
  --port 50333 \
  --rpc-port 8855 \
  -- \
  --chain paseo \
  --port 50343 \
  --rpc-port 9988
```

In this example, the first `--port` setting specifies the port for the collator node and the second `--port` specifies the embedded relay chain node port. The first `--rpc-port` setting specifies the port you can connect to the collator. The second `--rpc-port` specifies the port for connecting to the embedded relay chain.

## Producing Blocks

With your parachain collator operational, the next step is acquiring coretime. This is essential for ensuring your parachain's security through the relay chain. [Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime){target=\_blank} enhances Polkadot's resource management, offering developers greater economic adaptability. Once you have configured your parachain, you can follow two paths:

- Bulk coretime is purchased via the Broker pallet on the respective coretime system parachain. You can purchase bulk coretime on the coretime chain and assign the purchased core to the registered `ParaID`
- On-demand coretime is ordered via the `OnDemandAssignment` pallet, which is located on the respective relay chain

Once coretime is correctly assigned to your parachain, whether bulk or on-demand, blocks should be produced (provided your collator is running).

For more information on coretime, refer to the [Coretime](/polkadot-protocol/architecture/system-chains/coretime/){target=\_blank} documentation.

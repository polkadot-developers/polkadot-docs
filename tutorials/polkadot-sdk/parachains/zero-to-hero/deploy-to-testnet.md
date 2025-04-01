---
title: Deploy on Paseo TestNet
description: This guide walks you through the journey of deploying your Polkadot SDK blockchain on Paseo, detailing each step to a successful TestNet deployment.
---

# Deploy on Paseo TestNet

## Introduction

Previously, you learned how to [build and run a blockchain locally](/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/){target=\_blank}. Now, you'll take the next step towards a production-like environment by deploying your parachain to a public test network.

This tutorial guides you through deploying a parachain on the Paseo network, a public TestNet that provides a more realistic blockchain ecosystem. While public testnets have a higher barrier to entry compared to private networks, they are crucial for validating your parachain's functionality and preparing it for eventual mainnet deployment.

## Get Started with an Account and Tokens

To perform any action on Paseo, you need PAS tokens, which can be requested from the [Polkadot Faucet](https://faucet.polkadot.io/){target=\_blank}. To store the tokens, you must have access to a Substrate-compatible wallet. Go to the [Wallets and Extensions](https://wiki.polkadot.network/docs/wallets-and-extensions){target=\_blank} page on the Polkadot Wiki to view different options for a wallet, or use the [Polkadot.js browser extension](https://polkadot.js.org/extension/){target=\_blank}, which is suitable for development purposes.

!!!warning 
    Development keys and accounts should never hold assets of actual value and should not be used for production.

The [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface can be used to get you started for testing purposes.

To prepare an account, follow these steps:

1. Open the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and connect to the Paseo network. Alternatively use this link to connect directly to Paseo: [Polkadot.js Apps: Paseo](https://polkadot.js.org/apps/?rpc=wss://paseo.dotters.network#/explorer){target=\_blank}

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-1.webp)

2. Navigate to the **Accounts** section
    1. Click on the **Accounts** tab in the top menu
    2. Select the **Accounts** option from the dropdown menu
  
    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-2.webp)

3. Copy the address of the account you want to use for the parachain deployment

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-3.webp)

4. Visit the [Polkadot Faucet](https://faucet.polkadot.io){target=\_blank} and paste the copied address in the input field. Ensure that the network is set to Paseo and click on the **Get some PASs** button

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-4.webp)

    After a few seconds, you will receive 5000 PAS tokens in your account.

## Reserve a Parachain Identifier

You must reserve a parachain identifier (ID) before registering your parachain on Paseo. You'll be assigned the next available identifier.

To reserve a parachain identifier, follow these steps:

1. Navigate to the **Parachains** section
    1. Click on the **Network** tab in the top menu
    2. Select the **Parachains** option from the dropdown menu

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-5.webp)

2. Register a ParaId
    1. Select the **Parathreads** tab
    2. Click on the **+ ParaId** button

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-6.webp)

3. Review the transaction and click on the **+ Submit** button

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-7.webp)

    For this case, the next available parachain identifier is `4508`.

4. After submitting the transaction, you can navigate to the **Explorer** tab and check the list of recent events for successful `registrar.Reserved`

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-8.webp)

## Generate Customs Keys for Your Collator

To securely deploy your parachain, it is essential to generate custom keys specifically for your collators (block producers). You should generate two sets of keys for each collator:

- **Account keys** - used to interact with the network and manage funds. These should be protected carefully and should never exist on the filesystem of the collator node

- **Session keys** - used in block production to identify your node and its blocks on the network. These keys are stored in the parachain keystore and function as disposable "hot wallet" keys. If these keys are leaked, someone could impersonate your node, which could result in the slashing of your funds. To minimize these risks, rotating your session keys frequently is essential. Treat them with the same level of caution as you would a hot wallet to ensure the security of your node

To perform this step, you can use [subkey](https://docs.rs/crate/subkey/latest){target=\_blank}, a command-line tool for generating and managing keys:

```bash
docker run -it parity/subkey:latest generate --scheme sr25519
```

The output should look similar to the following:

--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/key.html'

Ensure that this command is executed twice to generate the keys for both the account and session keys. Save them for future reference.

## Generate the Chain Specification

Polkadot SDK-based blockchains are defined by a file called the [chain specification](/develop/parachains/deployment/generate-chain-specs/){target=\_blank}, or chain spec for short. There are two types of chain spec files:

- **Plain chain spec** - a human-readable JSON file that can be modified to suit your parachain's requirements. It serves as a template for initial configuration and includes human-readable keys and structures
- **Raw chain spec** - a binary-encoded file used to start your parachain node. This file is generated from the plain chain spec and contains the encoded information necessary for the parachain node to synchronize with the blockchain network. It ensures compatibility across different runtime versions by providing data in a format directly interpretable by the node's runtime, regardless of upgrades since the chain's genesis

The files required to register a parachain must specify the correct relay chain to connect to and the parachain identifier you have been assigned. To make these changes, you must build and modify the chain specification file for your parachain. In this tutorial, the relay chain is `paseo`, and the parachain identifier is `4508`.

To define your chain specification:

1. Generate the plain chain specification for the parachain template node by running the following command. Make sure to use the `*.compact.compressed.wasm` version of your compiled runtime when generating your chain specification, and replace `INSERT_PARA_ID` with the ID you obtained in the [Reserve a Parachain Identifier](#reserve-a-parachain-identifier) section:

    ```bash
    chain-spec-builder \
    --chain-spec-path ./plain_chain_spec.json \
    create \
    --relay-chain paseo \
    --para-id INSERT_PARA_ID \
    --runtime target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    named-preset local_testnet
    ```

2. Edit the `plain_chain_spec.json` file:

    - Update the `name`, `id`, and `protocolId` fields to unique values for your parachain
    - Change `para_id` and `parachainInfo.parachainId` fields to the parachain ID you obtained previously. Make sure to use a number without quotes
    - Modify the `balances` field to specify the initial balances for your accounts in SS58 format
    - Insert the account IDs and session keys in SS58 format generated for your collators in the `collatorSelection.invulnerables` and `session.keys` fields
    - Modify the `sudo` value to specify the account that will have sudo access to the parachain
  
    ```json
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/chain_spec_placeholder.json'
    ```

    For this tutorial, the `plain_chain_spec.json` file should look similar to the following. Take into account that the same account is being used for the collator and sudo, which must not be the case in a production environment:

    ??? code "View complete script"

        ```json title="plain_chain_spec.json"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/plain_chain_spec.json'
        ```

3. Save your changes and close the plain text chain specification file

4. Convert the modified plain chain specification file to a raw chain specification file:

    ```bash
    chain-spec-builder \
    --chain-spec-path ./raw_chain_spec.json \
    convert-to-raw plain_chain_spec.json
    ```

    You should now see your chain specification containing SCALE-encoded hex values versus plain text.

## Export Required Files

To prepare the parachain collator to be registered on Paseo, follow these steps:

1. Export the Wasm runtime for the parachain by running the following command:

    ```bash
    polkadot-omni-node export-genesis-wasm \
    --chain raw_chain_spec.json para-wasm
    ```

2. Export the genesis state for the parachain by running the following command:

    ```bash
    polkadot-omni-node export-genesis-state \
    --chain raw_chain_spec.json para-state
    ```

## Register a Parathread

Once you have the genesis state and runtime, you can now register these with your parachain ID.

1. Go to the [Parachains > Parathreads](https://polkadot.js.org/apps/#/parachains/parathreads){target=\_blank} tab, and select **+ Parathread**
   
2. You should see fields to place your runtime Wasm and genesis state respectively, along with the parachain ID. Select your parachain ID, and upload `para-wasm` in the **code** field and `para-state` in the **initial state** field:

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-9.webp)
   
3. Confirm your details and **+ Submit** button, where there should be a new Parathread with your parachain ID and an active **Deregister** button:

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-to-testnet-10.webp)

Your parachain's runtime logic and genesis are now part of the relay chain. The next step is to ensure you are able to run a collator to produce blocks for your parachain.

!!!note 
    You may need to wait several hours for your parachain to onboard. Until it has onboarded, you will be unable to purchase coretime, and therefore will not be able to perform transactions on your network.

## Start the Collator Node

Before starting a collator, you need to generate a node key. This key is responsible for communicating with other nodes over Libp2p:

```bash
polkadot-omni-node key generate-node-key \
--base-path data \
--chain raw_chain_spec.json
```

After running the command, you should see the following output, indicating the base path now has a suitable node key: 

--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/deploy-on-paseo.html'

You must have the ports for the collator publicly accessible and discoverable to enable parachain nodes to peer with Paseo validator nodes to produce blocks. You can specify the ports with the `--port` command-line option. You can start the collator with a command similar to the following:

```bash
polkadot-omni-node --collator \
--chain raw_chain_spec.json \
--base-path data \
--port 40333 \
--rpc-port 8845 \
--force-authoring \
--node-key-file ./data/chains/custom/network/secret_ed25519 \
-- \
--sync warp \
--chain paseo \
--port 50343 \
--rpc-port 9988
```

In this example, the first `--port` setting specifies the port for the collator node, and the second `--port` specifies the embedded relay chain node port. The first `--rpc-port` setting specifies the port you can connect to the collator. The second `--rpc-port` specifies the port for connecting to the embedded relay chain.

Before proceeding, ensure that the collator node is running. Then, open a new terminal and insert your generated session key into the collator keystore by running the following command. Use the same port specified in the `--rpc-port` parameter when starting the collator node (`8845` in this example) to connect to it. Replace `INSERT_SECRET_PHRASE` and `INSERT_PUBLIC_KEY_HEX_FORMAT` with the values from the session key you generated in the [Generate Customs Keys for Your Collator](#generate-customs-keys-for-your-collator) section:

```bash
curl -H "Content-Type: application/json" \
--data '{
  "jsonrpc":"2.0",
  "method":"author_insertKey",
  "params":[
    "aura",
    "INSERT_SECRET_PHRASE",
    "INSERT_PUBLIC_KEY_HEX_FORMAT"
  ],
  "id":1
}' \
http://localhost:8845
```

If successful, you should see the following response:

```json
{"jsonrpc":"2.0","result":null,"id":1}
```

Once your collator is synced with the Paseo relay chain, and your parathread finished onboarding, it will be ready to start producing blocks. This process may take some time.

## Producing Blocks

With your parachain collator operational, the next step is acquiring coretime. This is essential for ensuring your parachain's security through the relay chain. [Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime){target=\_blank} enhances Polkadot's resource management, offering developers greater economic adaptability. Once you have configured your parachain, you can follow two paths:

- Bulk coretime is purchased via the Broker pallet on the respective coretime system parachain. You can purchase bulk coretime on the coretime chain and assign the purchased core to the registered `ParaID`
- On-demand coretime is ordered via the `OnDemandAssignment` pallet, which is located on the respective relay chain

Once coretime is correctly assigned to your parachain, whether bulk or on-demand, blocks should be produced (provided your collator is running).

For more information on coretime, refer to the [Coretime](/polkadot-protocol/architecture/system-chains/coretime/){target=\_blank} documentation.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Obtain Coretime__

    ---

    Get coretime for block production now! Follow this guide to explore on-demand and bulk options for seamless and efficient operations.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/)

</div>

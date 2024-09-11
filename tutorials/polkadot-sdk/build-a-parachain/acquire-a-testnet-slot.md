---
title: Acquire a TestNet Slot
description: This guide walks you through the journey of securing a TestNet slot on Rococo for your parachain, detailing each step to a successful registration.
---

# Acquire a TestNet Slot

## Introduction

This tutorial demonstrates deploying a parachain on a public test network, such as the Rococo test network. Public TestNets have a higher bar to entry than a private network but represent an essential step in preparing a parachain project to move into a production network. 

## Prerequisites

Before you start, you need to have the following prerequisites:

- You know how to generate and modify chain specification files as described in the [Add Trusted Nodes](/tutorials/polkadot-sdk/build-a-blockchain/add-trusted-nodes/){target=\_blank} tutorial
- You know how to generate and store keys as described in the [Add Trusted Nodes](/tutorials/polkadot-sdk/build-a-blockchain/add-trusted-nodes/){target=\_blank} tutorial
- You have completed the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/){target=\_blank} and the [Connect a Local Parachain](/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain.md){target=\_blank} tutorials on your local computer

## Get Started with an Account and Tokens

To perform any action on Rococo, you need ROC tokens, and to store the tokens, you must have access to a Substrate-compatible digital currency wallet. You can't use [development keys and accounts](https://docs.substrate.io/reference/command-line-tools/subkey/#predefined-accounts-and-keys){target=\_blank} for operations in any public setting. Many options are available for holding digital currency—including hardware wallets and browser-based applications—and some are more reputable than others. You should do your own research before selecting one.

However, you can use the [Polkadot.Js Apps](https://polkadot.js.org/apps/){target=\_blank} interface to get you started for testing purposes.

To prepare an account, follow these steps:

1. Open the [Polkadot.Js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and connect to the Rococo network

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-1.webp)

2. Navigate to the **Accounts** section:
    1. Click on the **Accounts** tab in the top menu
    2. Select the **Accounts** option from the dropdown menu
   
    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-2.webp)

3. Copy the address of the account you want to use for the parachain deployment

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-3.webp)

4. Visit the [Polkadot Faucet](https://faucet.polkadot.io){target=\_blank} and paste the copied address in the input field. Ensure that the network is set to Rococo and click on the **Get some ROCs** button

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-4.webp)

    After a few seconds, you will receive 100 ROC tokens in your account.

    !!! note
        Alternatively, you can join the [Rococo Element Channel](https://matrix.to/#/#rococo-faucet:matrix.org){target=\_blank} and send a message with `!drip` and the public address for your Rococo to get 100 ROC in your wallet. For example, send a message similar to the following: `!drip 5HErbKmL5JmUKDVsH1aGyXTGZb4i9iaNsFhSgkNDr8qp2Dvj`

## Reserve a Parachain Identifier

You must reserve a parachain identifier before you can register as a parathread on Rococo. The steps are similar to the ones you followed in [Connect a Local Parachain](/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/){target=_\blank} to reserve an identifier on the local relay chain. However, for the public TestNet, you'll be assigned the next available identifier.

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

    For this case, the next available parachain identifier is `4105`.

4. After submitting the transaction, you can navigate to the Explorer tab and check the list of recent events for successful `registrar.Reserved`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-8.webp)

## Modify the Chain Specification File

The files required to register a parachain must specify the correct relay chain to connect to and parachain identifier that you have been assigned. To make these changes, you must build and modify the chain specification file for your parachain. In this tutorial, the relay chain is `rococo` instead of `rococo-local` used in the [Connect a Local Parachain](/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/){target=\_blank} tutorial and the para identifier is `4105`.

To modify the chain specification:

1. Generate the plain text chain specification for the parachain template node by running the following command:

    ```bash
    ./target/release/parachain-template-node build-spec --disable-default-bootnode > plain-parachain-chainspec.json
    ```

2. Open the plain text chain specification for the parachain template node in a text editor

3. Set relay-chain to rococo and para_id to the identifier you've been assigned

      For example, if your reserved identifier is 4105, set the `para_id` field to `4105`:

      ```json
      ...
      "relay_chain": "rococo",
      "para_id": 4105,
      "codeSubstitutes": {},
      "genesis": {
        ...
      }
      ...
      ```

4. Set the `parachainId` to the parachain identifier that you previously reserved.

      ```json
      ...
        "parachainSystem": null,
        "parachainInfo": {
          "parachainId": 4105
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

7. Generate a raw chain specification file from the modified chain specification file by running the following command:

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

To prepare the parachain collator to be registered on Rococo, follow these steps:

1. Export the WebAssembly runtime for the parachain by running a command similar to the following:
 
      ```bash
      ./target/release/parachain-template-node export-genesis-wasm --chain raw-parachain-chainspec.json para-4105-wasm
      ```

2. Export the genesis state for the parachain by running a command similar to the following:

      ```bash
      ./target/release/parachain-template-node export-genesis-state --chain raw-parachain-chainspec.json para-4105-state
      ```

## Start the Collator Node

You must have the ports for the collator publicly accessible and discoverable to enable parachain nodes to peer with Rococo validator nodes to produce blocks. You can specify the ports with the --port command-line option. For example, you can start the collator with a command similar to the following:

```bash
./target/release/parachain-template-node --collator \
  --chain raw-parachain-chainspec.json \
  --base-path /tmp/parachain/pubs-demo \
  --port 50333 \
  --rpc-port 8855 \
  -- \
  --execution wasm \
  --chain rococo \
  --port 50343 \
  --rpc-port 9988
```

In this example, the first `--port` setting specifies the port for the collator node and the second `--port` specifies the embedded relay chain node port. The first `--rpc-port` setting specifies the port you can use to connect to collator. The second `--rpc-port` specifies the port for connecting to the embedded relay chain.

## Register as a Parathread

Before leasing a slot on a public relay chain to become a parachain, you must register as a parathread on Rococo.

To register as a parathread, follow these steps:

1. Navigate to the **Parachains** section
    1. Click on the **Network** tab in the top menu
    2. Select the **Parachains** option from the dropdown menu

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-5.webp) 

2. Register a parathread
    1. Select the **Parathreads** tab
    2. Click on the **+ ParaThread** button

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-9.webp)

3. Fill in the required fields:
    - **parachain owner** - the account that will own the parachain
    - **code** - the Wasm code of the parachain
    - **initial state** - the genesis state of the parachain
    - Click on the **+ Submit** button

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-10.webp)

4. After submitting the transaction, you can navigate to the Explorer tab and check the list of recent events for successful `parathread.Registered`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/acquire-a-testnet-slot/acquire-a-testnet-slot-11.webp)

After registering as a parathread, you can lease a slot on the Rococo relay chain to become a parachain.

## Request a Parachain Slot

After the parachain is active as a parathread, the related project team should open a request for either a permanent or a temporary parachain slot on Rococo.

- `Permanent slots` are typically assigned to teams who have completed a successful slot lease auction and have deployed a parachain with a slot on Polkadot.
  Permanent slots enable those teams to continuously test their codebase for compatibility with the latest Polkadot continuously features in a live public environment. Only a limited number of permanent slots are available.

- `Temporary slots` are parachain slots dynamically allocated in a continuous, round-robbin style rotation.

  At the start of every lease period, a certain number of parathreads—up to a maximum defined in the relay chain configuration—are automatically upgraded to parachains for a certain duration. The parachains that were active during the ending lease period are automatically downgraded to parathreads to free the slots for others to use in the subsequent period. Temporary slots with dynamic allocation enable teams who don't have a parachain slot on Polkadot to test their runtimes more often in a realistic network environment.

### Submitting a Slot Request

The Rococo runtime requires sudo access to assign slots. For example, the Rococo runtime specifies that the account used to assign slots must have root-level permissions:

```rust
AssignSlotOrigin = EnsureRoot<Self::AccountId>;
```

Eventually, slot assignment is intended to be community-driven through Rococo governance. However, the Rococo sudo key is currently controlled by Parity Technologies. Therefore, you must submit a [Rococo Slot Request](https://github.com/paritytech/subport/issues/new?assignees=&labels=Rococo&template=rococo.yaml){target=\_blank} to receive a slot assignment. After the slot is assigned, you'll receive a notification and be ready to connect.

### Assigning a Slot using an Administrative Account

If you have an account with the `AssignSlotOrigin` origin, you can use that account to assign a temporary slot on the Rococo network.

To assign a temporary slot, you can use the `assignTempParachainSlot` extrinsic from the `assignedSlots` pallet. The extrinsic will need the reserved parachain identifier and the lease period start (you can use the current block number as the lease period start, by choosing the `Current` option). If the current slot is full, you'll be assigned the next available slot.

In your account doesn't have sufficient privileges, the transaction will fail with a `BadOrigin` error.

### Lease duration

The current lease duration and slot availability settings for assigned parachain slots on Rococo are currently:

- Permanent slot lease duration: 1 year (365 days)
- Temporary slot lease duration: 3 days
- Maximum number of permanent slots: up to 25 permanent slots
- Maximum number of temporary slots: up to 20 temporary slots
- Maximum temporary slots allocated per leased period: up to 5 temporary slots per 3-day temporary lease periods

These setting are subject to change based on the needs of the community.

## Test your parachain

After a slot is assigned and activated for you, you can test your parachain on the Rococo test network. Note that when the temporary slot lease period ends, the parachain is automatically downgraded to a parathread. Registered and approved slots are cycled through automatically in a round-robin fashion, so you can expect to come back online as a parachain from time to time.
---
title: Obtain Coretime
description: Learn how to obtain and manage coretime for your Polkadot parachain. Explore bulk and on-demand options, prerequisites, and initial setup.
---

# Obtain Coretime

## Introduction

Securing coretime is essential for operating a parachain on Polkadot. It provides your parachain with guaranteed computational resources and access to Polkadot's shared security model, ensuring your blockchain can process transactions, maintain its state, and interact securely with other parachains in the network. Without coretime, a parachain cannot participate in the ecosystem or leverage the relay chain's validator set for security.

Coretime represents the computational resources allocated to your parachain on the Polkadot network. It determines when and how often your parachain can produce blocks and have them validated by the relay chain.

There are two primary methods to obtain coretime:

- **Bulk coretime** - purchase computational resources in advance for a full month
- **On-demand coretime** - buy computational resources as needed for individual block production

This guide explains the different methods of obtaining coretime and walks through the necessary steps to get your parachain running. 

## Prerequisites

Before obtaining coretime, ensure you have:

- Developed your parachain runtime using the Polkadot SDK
- Set up and configured a parachain collator for your target relay chain
- Successfully compiled your parachain collator node
- Generated and exported your parachain's genesis state
- Generated and exported your parachain's validation code (Wasm)

## Initial Setup Steps

1. Reserve a unique identifier, `ParaID`, for your parachain:

    1. Connect to the relay chain
    2. Submit the [`registrar.reserve`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_common/paras_registrar/pallet/dispatchables/fn.reserve.html){target=\_blank} extrinsic

    Upon success, you'll receive a registered `ParaID`

2. Register your parachain's essential information by submitting the [`registrar.register`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_common/paras_registrar/pallet/dispatchables/fn.register.html){target=\_blank} extrinsic with the following parameters:

    - **`id`** - your reserved `ParaID`
    - **`genesisHead`** - your exported genesis state
    - **`validationCode`** - your exported Wasm validation code

3. Start your parachain collator and begin synchronization with the relay chain

## Obtaining Coretime

### Bulk Coretime

Bulk coretime provides several advantages:

- Monthly allocation of resources
- Guaranteed block production slots (every 12 seconds, or 6 seconds with [Asynchronous Backing](https://wiki.polkadot.network/docs/learn-async-backing#asynchronous-backing){target=\_blank})
- Priority renewal rights
- Protection against price fluctuations
- Ability to split and resell unused coretime

To purchase bulk coretime:

1. Access the Coretime system parachain
2. Interact with the Broker pallet
3. Purchase your desired amount of coretime
4. Assign the purchased core to your registered `ParaID`

After successfully obtaining coretime, your parachain will automatically start producing blocks at regular intervals.

For current marketplaces and pricing, consult the [Coretime Marketplaces](https://wiki.polkadot.network/docs/learn-guides-coretime-marketplaces){target=\_blank} page on the Polkadot Wiki.

### On-demand Coretime

On-demand coretime allows for flexible, as-needed block production. To purchase:

1. Ensure your collator node is fully synchronized with the relay chain
2. Submit the `onDemand.placeOrderAllowDeath` extrinsic on the relay chain with:

    - **`maxAmountFor`** - sufficient funds for the transaction
    - **`paraId`** - your registered `ParaID`

After succesfully executing the extrinsic, your parachain will produce a block.

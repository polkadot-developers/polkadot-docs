---
title: XCM Transfers from Relay Chain to Rollup
description: Learn how to perform a reserve-backed asset transfer between a relay chain and a rollup using XCM for cross-chain interoperability.
---

# From Relay Chain to Rollup

## Introduction

[Cross-Consensus Messaging (XCM)](/develop/interoperability/intro-to-xcm/){target=\_blank} facilitates asset transfers both within the same consensus system and between different ones, such as between a relay chain and its rollups. For cross-system transfers, two main methods are available:

- [**Asset teleportation**](https://paritytech.github.io/xcm-docs/journey/transfers/teleports.html){target=\_blank} - a simple and efficient method involving only the source and destination chains, ideal for systems with a high level of trust
- [**Reserve-backed transfers**](https://paritytech.github.io/xcm-docs/journey/transfers/reserve.html){target=\_blank} - involves a trusted reserve holding real assets and mints derivative tokens to track ownership. This method is suited for systems with lower trust levels

In this tutorial, you will learn how to perform a reserve-backed transfer of DOT between a relay chain (Polkadot) and a rollup (Astar).

## Prerequisites

When adapting this tutorial for other chains, before you can send messages between different consensus systems, you must first open HRMP channels. For detailed guidance, refer to the [XCM Channels](/develop/interoperability/xcm-channels/#xcm-channels){target=\_blank} article before for further information about.

This tutorial uses Chopsticks to fork a relay chain and a rollup connected via HRMP channels. For more details on this setup, see the [XCM Testing](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} section on the Chopsticks page.

## Setup

To simulate XCM operations between different consensus systems, start by forking the network with the following command:

```bash
chopsticks xcm -r polkadot -p astar
```
After executing this command, the relay chain and rollup will expose the following WebSocket endpoints:

| Chain                  | WebSocket Endpoint                   |
|------------------------|--------------------------------------|
| Polkadot (relay chain) | <pre>```ws://localhost:8001```</pre> |
| Astar (rollup)      | <pre>```ws://localhost:8000```</pre> |

You can perform the reserve-backed transfer using either the [Polkadot.js Apps interface](#using-polkadotjs-apps) or the [Polkadot API](#using-papi), depending on your preference. Both methods provide the same functionality to facilitate asset transfers between the relay chain and rollup.

## Use Polkadot.js Apps

Open two browser tabs and can connect these endpoints using the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface:

a. Add the custom endpoint for each chain

b. Click **Switch** to connect to the respective network

![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-01.webp)

This reserve-backed transfer method facilitates asset transfers from a local chain to a destination chain by trusting a third party called a reserve to store the real assets. Fees on the destination chain are deducted from the asset specified in the assets vector at the `fee_asset_item` index, covering up to the specified `weight_limit.` The operation fails if the required weight exceeds this limit, potentially putting the transferred assets at risk.

The following steps outline how to execute a reserve-backed transfer from the Polkadot relay chain to the Astar rollup.

### From the Relay Chain Perspective

1. Navigate to the Extrinsics page
    1. Click on the **Developer** tab from the top navigation bar
    2. Select **Extrinsics** from the dropdown

    ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-02.webp)

2. Select **xcmPallet**

    ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-03.webp)

3. Select the **limitedReservedAssetTransfer** extrinsic from the dropdown list

    ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-04.webp)

4. Fill out the required fields:
    1. **dest** - specifies the destination context for the assets. Commonly set to `[Parent, Parachain(..)]` for rollup-to-rollup transfers or `[Parachain(..)]` for relay chain-to-rollup transfers. In this case, since the transfer is from a relay chain to a rollup, the destination ([`Location`](https://paritytech.github.io/xcm-docs/fundamentals/multilocation/index.html){target=\_blank}) is the following:

        ```bash
        { parents: 0, interior: { X1: [{ Parachain: 2006 }] } }
        ```

    3. **beneficiary** - defines the recipient of the assets within the destination context, typically represented as an `AccountId32` value. This example uses the following account present in the destination chain:


        ```bash
        X2mE9hCGX771c3zzV6tPa8U2cDz4U4zkqUdmBrQn83M3cm7
        ```

    4. **assets** - lists the assets to be withdrawn, including those designated for fee payment on the destination chain
    5. **feeAssetItem** - indicates the index of the asset within the assets list to be used for paying fees
    6. **weightLimit** - specifies the weight limit, if applicable, for the fee payment on the remote chain
    7. Click on the **Submit Transaction** button to send the transaction

        ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-05.webp)

After submitting the transaction, verify that the `xcmPallet.FeesPaid` and `xcmPallet.Sent` events have been emitted:

![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-06.webp)

### From the Rollup Perspective

After submitting the transaction from the relay chain, confirm its success by checking the rollup's events. Look for the `assets.Issued` event, which verifies that the assets have been issued to the destination as expected:

![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/from-relaychain-to-rollup-07.webp)

## Use PAPI

To programmatically execute the reserve-backed asset transfer between the relay chain and the rollup, you can use [Polkadot API (PAPI)](/develop/toolkit/api-libraries/papi/){target=\_blank}. PAPI is a robust toolkit that simplifies interactions with Polkadot-based chains. For this project, you'll first need to set up your environment, install necessary dependencies, and create a script to handle the transfer process.

1. Start by creating a folder for your project:

   ```bash
   mkdir reserve-backed-asset-transfer
   cd reserve-backed-asset
   ```

2. Initialize a Node.js project and install the required dependencies. Execute the following commands:

    ```bash
    npm init
    npm install polkadot-api @polkadot-labs/hdkd @polkadot-labs/hdkd-helpers
    ```

3. To enable static, type-safe APIs for interacting with the Polkadot and Astar chains, add their metadata to your project using PAPI:

    ```bash
    npx papi add dot -n polkadot
    npx papi add astar -w wss://rpc.astar.network
    ```

    !!! note 
        - `dot` and `astar` are arbitrary names you assign to the chains, allowing you to access their metadata information
        - The first command uses the well-known Polkadot chain, while the second connects to the Astar chain using its WebSocket endpoint

4. Create a `index.js` file and insert the following code to configure the clients and handle the asset transfer

    ```js
    --8<-- 'code/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/reserve-backed-transfer.js'
    ```

    !!! note
        To use this script with real-world blockchains, you'll need to update the WebSocket endpoint to the appropriate one, replace the Alice account with a valid account, and ensure the account has sufficient funds to cover transaction fees.

4. Execute the script 

    ```bash 
    node index.js
    ```

5. Check the terminal output. If the operation is successful, you should see the following message:

    --8<-- 'code/tutorials/interoperability/xcm-transfers/from-relaychain-to-rollup/output.html'

## Additional Resources

You can perform these operations using the Asset Transfer API for an alternative approach. Refer to the [Asset Transfer API](/develop/toolkit/interoperability/asset-transfer-api/){target=\_blank} guide in the documentation for more details.
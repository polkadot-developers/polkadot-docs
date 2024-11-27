---
title: From Relay Chain to Parachain
description: Learn how to perform a reserve-backed asset transfer between a relay chain and a parachain using XCM for cross-chain interoperability.
---

# From Relay Chain to Parachain

## Introduction

[Cross-Consensus Messaging (XCM)](/develop/interoperability/intro-to-xcm/){target=\_blank} facilitates asset transfers both within the same consensus system and between different ones, such as between a relay chain and its parachains. For cross-system transfers, two main methods are available:

- **Asset teleportation** - a simple and efficient method involving only the source and destination chains, ideal for systems with a high level of trust
- **Reserve-Backed transfers** - involves a trusted reserve holding real assets and mints derivative tokens to track ownership. This method is suited for systems with lower trust levels

In this tutorial, you will learn how to perform a reserve-backed transfer between a relay chain (Polkadot) and a parachain (Astar).

## Prerequisites

To send messages between different consensus systems, you must first open HRMP channels. For detailed guidance, refer to the [XCM Channels](/develop/interoperability/xcm-channels/#xcm-channels){target=\_blank} article before for further information about.

This tutorial uses Chopsticks to fork a relay chain and a parachain connected via HRMP channels. For more details on this setup, see the [XCM Testing](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} section on the Chopsticks page.

## Setup

To simulate XCM operations between different consensus systems, start by forking the network with the following command:

```bash
chopsticks xcm -r polkadot -p astar
```
After executing this command, the relay chain and parachain will expose the following WebSocket endpoints:

=== "Polkadot (relay chain)"

    ```bash
    ws://localhost:8001
    ```

=== "Astar (parachain)"

    ```bash
    ws://localhost:8000
    ```

You can connect these endpoints using the [Polkadot.Js Apps](https://polkadot.js.org/apps/){target=\_blank} interface. Open two browser tabs and add the custom endpoint for each chain as shown below:

![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-01.webp)

Click **Switch** to connect to the respective network.

## Procedure to Execute a Reserve-Backed Transfer

Using their reserve system, this method facilitates asset transfers from a local chain to a destination chain. Fees on the destination chain are deducted from the asset specified in the assets vector at the `fee_asset_item` index, covering up to the specified `weight_limit.` The operation fails if the required weight exceeds this limit, potentially putting the transferred assets at risk.

!!! warning
    The [`reserve_transfer_assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.reserve_transfer_assets.html){target=\_blank} extrinsic is deprecated in favor of the [`limited_reserve_transfer_assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.limited_reserve_transfer_assets.html){target=\_blank} extrinsic. 

The following steps outline how to execute a reserve-backed transfer from the Polkadot relay chain to the Astar parachain.

### From the Relay Chain Perspective

1. Navigate to the Extrinsics page
    1. Click on the **Developer** tab from the top navigation bar
    2. Select **Extrinsics** from the dropdown

    ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-02.webp)

2. Select the **xcmPallet** pallet

    ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-03.webp)

3. Select the **limitedReservedAssetTransfer** extrinsic from the dropdown list

    ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-04.webp)

4. Fill out the required fields
    1. **dest** - specifies the destination context for the assets. Commonly set to `[Parent, Parachain(..)]` for parachain-to-parachain transfers or `[Parachain(..)]` for relay chain-to-parachain transfers. In this case, since the transfer is from a relay chain to a parachain, the destination context is the following:

        ```bash
        { parents: 1, interior: { X1: [{ Parachain: 2006 }] } }
        ```

    2. **beneficiary** - defines the recipient of the assets within the destination context, typically represented as an `AccountId32` value. This example uses the following account present in the destination chain:

        ```bash
        X2mE9hCGX771c3zzV6tPa8U2cDz4U4zkqUdmBrQn83M3cm7
        ```

    3. **assets** - lists the assets to be withdrawn, including those designated for fee payment on the destination chain
    4. **feeAssetItem** - indicates the index of the asset within the assets list to be used for paying fees
    5. **weightLimit** - specifies the weight limit, if applicable, for the fee payment on the remote chain
    6. Click on the **Submit Transaction** button to send the transaction

        ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-05.webp)

After submitting the transaction, verify that the `xcmPallet.FeesPaid` and `xcmPallet.Sent` events have been emitted:

![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-06.webp)

### From the Parachain Perspective

After submitting the transaction from the relay chain, confirm its success by checking the parachain's events. Look for the `assets.Issued` event, which verifies that the assets have been issued to the destination as expected:


![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-07.webp)

## Additional Resources

You can perform these operations using the Asset Transfer API for an alternative approach. Refer to the [Asset Transfer API](/develop/toolkit/interoperability/asset-transfer-api/){target=\_blank} guide in the documentation for more details.
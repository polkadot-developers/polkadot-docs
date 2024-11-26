---
title: XCM Transfers
description: TODO
---

# XCM Transfers

## Introduction

[Cross-Consensus Messaging (XCM)](/develop/interoperability/intro-to-xcm/){target=\_blank} facilitates asset transfers both within the same consensus system and between different ones, such as between a relay chain and its parachains. For cross-system transfers, two main methods are available:

- **Asset teleport** - simple and efficient method involving only the source and destination chains, ideal for systems with a high level of trust
- **Reserve-Backed transfers** - involves a trusted reserve that holds the real assets and mints derivative tokens to track ownership. This method is suited for systems with lower trust levels

This tutorial will cover both types of transfer between a relay chain and a parachain.

## Prerequisites

To send messages between different consensus systems you need to open HRMP channels, so ensure that you have checked the [XCM Channels](/develop/interoperability/xcm-channels/#xcm-channels){target=\_blank} article before for further information about.

This tutorial uses Chopsticks to fork a relay chain and a parachain that are connected to each other throguh HRMP channels, for further details about how this works, check the [XCM Testing](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} section in the Chopsticks page.

## Setup

To simulate the XCMs operations betwween different consensus systems, you can run the following command:

```bash
chopsticks xcm -r polkadot -p astar
```

After running that command, those chains will expose the following endpoints:

=== "Polkadot (relay chain)"

    ```bash
    ws://localhost:8001
    ```

=== "Astar (parachain)"

    ```bash
    ws://localhost:8000
    ```

To access through the [Polkadot.Js Apps](https://polkadot.js.org/apps/){target=\_blank} interface, you can open 2 tabs in the browser and in each of them add to the custom endpoint as follows:

![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-01.webp)

Click the **Switch** button to switch to the corresponding network.

## Procedure to execute XCM Transfers

To transfer assets from a relay chain to a parachain (in this case polkadot and astar respectively), you need to follow these steps:

1. From the relay chain perspective, navigate to the Extrinsics page
    1. Click on the **Developer** tab from the top navigation bar
    2. Select **Extrinsics** from the dropdown

    ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-02.webp)

2. Select the **xcmPallet** pallet

    ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-03.webp)

Now, you can proceed to perform either an [asset teleport](#perform-an-asset-teleportation) or a [reserved transfer](#perform-a-reserve-backed-transfer).

### Perform an Asset Teleport

The [`teleport_assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.teleport_assets.html){target=\_blank} extrinsic is deprecated in favor of the [`limited_teleport_assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.limited_teleport_assets.html){target=\_blank} extrinsic. 

This method transfer assets from a local chain to a destination chain using teleportation. On the destination chain, fees are paid using the asset specified in the assets vector at the index `fee_asset_item`. The payment will cover the weight up to the defined `weight_limit`. If the required weight exceeds this limit, the operation will fail, potentially putting the transferred assets at risk.

To continue, take the following steps:

1. Select the **limitedTeleportAssets** extrinsic from the dropdown list

    ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-04.webp)

2. Fill out the required fields
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
    6. Click on the **Submit** button to send the transaction

        ![](/images/tutorials/interoperability/xcm-transfers/xcm-transfers-05.webp)


### Perform a Reserve-Backed Transfer
---
title: Transfer Assets with XCM
description: This tutorial will guide you through the process of transferring assets between parachains using Cross Consensus Messaging (XCM) instructions.
---

# Transfer Assets with XCM

## Introduction

XCM (Cross Consensus Messaging) is a language that enables communication between chains in the Polkadot ecosystem. XCM allows parachains to send messages to each other, enabling the transfer of assets, data, and other information across different chains. This article will explore how to transfer assets between parachains using XCM instructions.

To transfer assets between two chains, you have the options of [Teleporting Assets](https://wiki.polkadot.network/docs/learn-teleport){target=\_blank} or performing a [Reserve Asset Transfer](https://wiki.polkadot.network/docs/learn/xcm/journey/transfers-reserve){target=\_blank}. This tutorial will cover both methods.

## Prerequisites

Before you begin, verify the following:

- You have a network running with a relay chain and some parachains connected to it
- Parachains can transmit and receive XCM messages, meaning that the HRMP channels between the parachains are properly configured and open, and that the parachains’ runtime is set up to handle XCM messages

## Teleporting Assets

Asset teleportation enables the transfer of digital assets, including fungible and non-fungible tokens, across different parachains. This process allows the transferred assets to function as if they were native to the receiving chain. To simulate the teleportation of assets, this tutorial showcases the transfer of fungible tokens between the Polkadot relay chain and the Asset Hub system chain.

To replicate the scenario, you can locally simulate the interaction between the two chains using Chopsticks, as shown in the [XCM Testing](/develop/application-devs/tooling/chopsticks/overview.md#xcm-testing){target=\_blank} section of the Chopsticks documentation. For this tutorial, the relay chain is Polkadot ([`polkadot`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot.yml){target=\_blank}), and the destination chain is the Asset Hub system chain ([`polkadot-asset-hub`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot-asset-hub.yml){target=\_blank}).

To teleport assets between the two chains, follow these steps:

1. Navigate to the **Extrinsics** tab of the relay chain in the Polkadot.js Apps interface
    1. Select the **Developer** tab from the sidebar
    2. Choose the **Extrinsics** option

        ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-1.webp)

2. Select the **xcmPallet** and the **limitedTeleportAssets** extrinsic
    1. Choose the **xcmPallet** from the list of pallets
    2. Select the **limitedTeleportAssets** extrinsic from the extrinsics available

        ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-2.webp)

3. Fill in the required parameters for the extrinsic
    1. Enter the **dest** multilocation of the destination chain. In this case, since the destination chain is Asset Hub (ID `1000`), its multilocation from the relay chain perspective is:
        ```json
        {
            "parent": 0,
            "interior": {
                "X1": {
                    "Parachain": 1000
                }
            }
        }
        ```
    2. Specify the **beneficiary** to receive the assets. The beneficiary should be specified from the perspective of the destination chain. This tutorial uses the account `14BPeNxwQUBCDkZhAZMBTCD4ZbJ3VN4AdvDaUwDk8GxQbPbD` on the Asset Hub system chain, so the beneficiary multilocation is:
        ```json
        {
            "parent": 0,
            "interior": {
                "X1": {
                    "AccountId32": "14BPeNxwQUBCDkZhAZMBTCD4ZbJ3VN4AdvDaUwDk8GxQbPbD"
                }
            }
        }
        ```
    3. Define the **assets** to teleport. This fields specifies the multilocation of the asset and the fungibility of the asset
    4. Provide the **feeAssetItem** to define the asset to be used as the fee for the teleportation
    5. Specify the **weightLimit** as the maximum weight to be used for the extrinsic execution
    6. Click on **Submit Transaction** to execute the extrinsic

        ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-3.webp)

4. After submitting the transaction, you can check the status of the teleportation by navigating to the **Events** tab on the **Explorer** page for the relay chain in the Polkadot.js Apps interface. If the XCM message is successfully sent, you will see the event `xcmPallet.Sent` in the list of events

    ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-4.webp)

5. To verify the teleportation on the Asset Hub system chain, navigate to the **Events** section of the **Explorer** page. You should see two events: **`messageQueue.Processed`** and **`balances.Transfer`**

    ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-5.webp)

These events indicate that the teleportation of assets was successful. You can now verify the balance of the beneficiary account on the Asset Hub system chain to confirm the transfer.

## Reserve Asset Transfer

A reserve asset transfer transfers assets between two parachains (or consensus systems) that don't trust each other by using a third system (like the Asset Hub system chain) they both trust, called the reserve. Both the source and destination chains typically create derivative tokens to track ownership of the reserve-held assets. Each chain maintains a dedicated account, known as a sovereign account, on the reserve to manage its asset holdings. 

Typically, the sender chain burns a certain amount of derivative tokens, signals the reserve to move the real assets from its sovereign account to the destination chain's sovereign account, and then signals the recipient to mint the right amount of derivatives.

To simulate a reserve asset transfer, you can spin up the network locally using Chopsticks as described in the [XCM Testing](/develop/application-devs/tooling/chopsticks/overview.md#xcm-testing){target=\_blank} section of the Chopsticks documentation. For this tutorial, the relay chain is Polkadot ([`polkadot`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot.yml){target=\_blank}), and the destination chain is the Astar parachain ([`astar`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/astar.yml){target=\_blank}).

To do a reserve asset transfer between the two chains, follow these steps:

1. Navigate to the **Extrinsics** tab of the relay chain in the Polkadot.js Apps interface
    1. Select the **Developer** tab from the sidebar
    2. Choose the **Extrinsics** option

        ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-1.webp)

2. Select the **xcmPallet** and the **limitedReservedTransferAssets** extrinsic
    1. Choose the **xcmPallet** from the list of pallets
    2. Select the **limitedReserveTransferAssets** extrinsic from the extrinsics available

        ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-6.webp)

3. Fill in the required parameters for the extrinsic
    1. Enter the **dest** multilocation of the destination chain. In this case, since the destination chain is the Astar parachain (ID `2006`), its multilocation from the relay chain perspective is:
        ```json
        {
            "parent": 0,
            "interior": {
                "X1": {
                    "Parachain": 2006
                }
            }
        }
        ```
    2. Specify the **beneficiary** to receive the assets. The beneficiary should be specified from the perspective of the destination chain. This tutorial uses the account `Z7gwLfxKvYq13b1hDkJLhYBo21WmHCmaczEZMSFSYvr16Ao` on the Astar parachain, so the beneficiary multilocation is:
        ```json
        {
            "parent": 0,
            "interior": {
                "X1": {
                    "AccountId32": "Z7gwLfxKvYq13b1hDkJLhYBo21WmHCmaczEZMSFSYvr16Ao"
                }
            }
        }
        ```
    3. Define the **assets** to teleport. This fields specifies the multilocation of the asset and the fungibility of the asset
    4. Provide the **feeAssetItem** to define the asset to be used as the fee for the teleportation
    5. Specify the **weightLimit** as the maximum weight to be used for the extrinsic execution
    6. Click on **Submit Transaction** to execute the extrinsic

        ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-7.webp)

4. After submitting the transaction, you can check the status of the teleportation by navigating to the **Events** tab of the relay chain in the Polkadot.js Apps interface. If the XCM message is successfully sent, you will see the event **`xcmPallet.Sent`** in the list of events

    ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-8.webp)

5. To verify the transferred assets on the Astar parachain, navigate to the **Events** section. You should see three events: **`messageQueue.Processed`**, **`balances.Issued`** and **`balances.Transfer`**

    ![](/images/develop/parachain-devs/interoperability/transfer-assets-with-xcm/transfer-assets-with-xcm-9.webp)

These events indicate that the reserve asset transfer was successful. You can now verify the balance of the beneficiary account on the Astar parachain to confirm the transfer.

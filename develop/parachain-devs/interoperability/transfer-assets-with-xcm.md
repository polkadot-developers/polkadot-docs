---
title: Transfer Assets with XCM
description: This tutorial will guide you through the process of transferring assets between parachains using Cross-Chain Message (XCM) instructions.
---

# Transfer Assets with XCM

## Introduction

In the tutorial on [Open Message Passing Channels](TODO:update-path){target=\_blank} you learned how to establish a two-way communication channel between chains by sending messages to the relay chain. You can apply a similar approach to send messages that enable a local chain to manage an account on a remote chain. This tutorial will teach you how to transfer assets between chains using Cross-Chain Message (XCM) instructions.

To transfer assets between two chains, you have the options of [Teleporting Assets](https://wiki.polkadot.network/docs/learn-teleport){target=\_blank} or performing a [Reserve Asset Transfer](https://wiki.polkadot.network/docs/learn/xcm/journey/transfers-reserve){target=\_blank}. This tutorial will cover both methods.

## Prerequisites

Before you begin, verify the following:

- You have a relay chain and a parachain running to test the XCM instructions
- You have opened the message passing channel to allow communication between the two chains

## Teleporting Assets

Asset teleportation enables the transfer of digital assets, including fungible and non-fungible tokens, across different parachains. This process allows the transferred assets to function as if they were native to the receiving chain. To simulate the teleportation of assets, this tutorial showcases the transfer of fungible tokens between the Polkadot relay chain and the Asset Hub system parachain.

To replicate the scenario, this guide uses [Chopsticks](https://github.com/AcalaNetwork/chopsticks){target=\_blank} to interact with the relay chain and the Asset Hub parachain. To setup the same environment, run the following command:

```bash
chopsticks xcm \
--r polkadot \
--p polkadot-asset-hub
```

The command above initializes the Chopsticks tool to interact with the Polkadot relay chain and the Asset Hub parachain. You can replace the `polkadot` and `polkadot-asset-hub` parameters with the actual names of the chains you want to interact with. For further details on the Chopsticks tool, refer to the [Chopsticks documentation](TODO:update-path){target=\_blank}.

To teleport assets between the two chains, follow these steps:

1. Navigate to the **Extrinsics** tab of the relay chain in the Polkadot.js interface
    1. Select the **Developer** tab from the sidebar
    2. Choose the **Extrinsics** option

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-1.webp)

2. Select the **xcmPallet** and the **limitedTeleportAssets** extrinsic
    1. Choose the **xcmPallet** from the list of pallets
    2. Select the **limitedTeleportAssets** extrinsic from the extrinsics available

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-2.webp)

3. Fill in the required parameters for the extrinsic
    1. Enter the **dest** multilocation of the destination chain. In this case, since the destination chain is Asset Hub (ID `1000`), its Multilocation from the Relay Chain perspective is:
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
    2. Specify the **beneficiary** to receive the assets. The beneficiary should be specified from the perspective of the destination chain. This tutorial uses the account `14BPeNxwQUBCDkZhAZMBTCD4ZbJ3VN4AdvDaUwDk8GxQbPbD` on the Asset Hub parachain, so the beneficiary MultiLocation is:
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
    3. Define the **assets** to teleport. This fields specifies the Multilocation fo the asset and the fungibility of the asset
    4. Provide the **feeAssetItem** to define the asset to be used as the fee for the teleportation
    5. Specify the **weightLimit** as the maximum weight to be used for the extrinsic execution
    6. Click on **Submit Transaction** to execute the extrinsic

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-3.webp)

4. After submitting the transaction, you can check the status of the teleportation by navigating to the **Events** tab of the relay chain in the Polkadot.js interface. If the XCM message is successfully sent, you will see the event `xcmPallet.Sent` in the list of events

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-4.webp)

5. To verify the teleportation on the Asset Hub parachain, navigate to the **Events** section. You should see two events, `messageQueu.Processed` and `balances.Transfer`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-5.webp)

These events indicate that the teleportation of assets was successful. You can now verify the balance of the beneficiary account on the Asset Hub parachain to confirm the transfer.
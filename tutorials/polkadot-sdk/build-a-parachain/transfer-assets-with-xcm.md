---
title: Transfer Assets with XCM
description: This tutorial will guide you through the process of transferring assets between parachains using Cross-Chain Message (XCM) in a Polkadot parachain.
---

# Transfer Assets with XCM

## Introduction

In the [Open Message Passing Channels](/tutorials/polkadot-sdk/build-a-parachain/open-message-passing-channels/){target=\_blank} tutorial, you saw how to open a two-way communication channel between chains by sending messages to the relay chain. You can use a similar strategy to send messages that allow a local chain to manage an account on a remote chain. In this tutorial, parachain B transfers assets into the sovereign account on the relay chain for parachain A.

The outcome for this tutorial is similar to using the `transfer` function from the balances pallet, except in this case the transfer is initiated by a parachain and demonstrates how the holding register is used when executing the `WithdrawAsset` and `DepositAssetXCM` instructions.

## Prerequisites

Before you begin, verify the following:

- You have the Sudo pallet available for both local parachains to use
- You have opened the message passing channel to allow communication between parachain B and parachain A
- You have set up a parachain test network using Zombienet or a local relay chain using the `rococo-local` chain specification. This tutorial uses the following Zombienet configuration file:

    ```toml
    [relaychain]
    default_command = "polkadot"
    chain = "rococo-local"

    [[relaychain.nodes]]
    name = "alice"
    validator = true
    ws_port = 9944

    [[relaychain.nodes]]
    name = "bob"
    validator = true
    ws_port = 9955

    [[parachains]]
    id = 1000

    [parachains.collator]
    name = "parachainA"
    ws_port = 9988
    command = "parachain-template-node"
    args = [ "-l=xcm=trace" ]

    [[parachains]]
    id = 1001

    [parachains.collator]
    name = "parachainB"
    ws_port = 9989
    command = "parachain-template-node"
    args = [ "-l=xcm=trace" ]

    [settings]
    timeout = 1000

    [[hrmp_channels]]
      sender = 1000
      recipient = 1001
      max_capacity = 8
      max_message_size = 512

    [[hrmp_channels]]
      sender = 1001
      recipient = 1000
      max_capacity = 8
      max_message_size = 512
    ```
    !!! note
        The HRMP channels are configured to allow communication between parachain A and parachain B. The parachain A and parachain B collators are configured to trace XCM messages, with id 1000 and 1001, respectively.


## Configure XCM Instructions

To illustrate the interaction between the two chains, in the following example, parachain B sends XCM instructions to deposit assets into an account on parachain A.

1. Navigate to the **Extrinsics** tab in the Polkadot.Js Apps interface
      1. Select the **Developer** tab
      2. Choose the **Extrinsics** option from the dropdown menu

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-1.webp)

2. Use the **sudo** pallet to send the XCM instructions
      1. Select the **sudo** pallet from the dropdown menu
      2. Choose the **sudo(call)** extrinsic to use the Sudo pallet to execute privileged transactions

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-2.webp)

3. Select the **polkadotXcm** pallet to send the XCM instructions
      1. Select **polkadotXcm** pallet from the dropdown menu
      2. Select **send(dest, message)** extrinsic to send a Cross-Chain Message (XCM) to the destination chain
      3. Specify the **dest** parameter to indicate the destination chain for the message. The destination chain is the relay chain, so the value destination looks like this:
            ```javascript
            { "parents": 1, "interior": "Here" }
            ```
      4. Specify the **message** parameter to indicate the XCM version for the message. In this case, the value is `V2`
      5. Click on **+ Add item** to construct the message to be executed

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-3.webp)

Now that you have configured the XCM instructions, you can proceed to execute the message between parachains.

## WithdrawAsset Instruction

To move assets into the virtual [holding register](https://wiki.polkadot.network/docs/learn/xcm/reference-glossary#holding-register){target=\_blank}, follow these steps:

1. Prepare the [WithdrawAsset](https://github.com/polkadot-fellows/xcm-format#withdrawasset){target=\_blank} as the first instruction for this message
      1. Select **WithdrawAsset** from the dropdown menu
      2. Click on **+ Add item** to add the instruction to the message

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-4.webp)

2. Configure the **WithdrawAsset** instruction
      1. Set the **id** parameter to the location of the asset to be withdrawn. In this case, the asset is located in parachain B, so the value looks like this:
            ```javascript
            { "parents": 0, "interior": "Here" }
            ```
      2. Set the **fungible** parameter to `true` to identify the asset as a fungible asset
      3. Specify the **amount** parameter to indicate the total fungible assets to withdraw. For example, this tutorial uses `12000000000000`

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-5.webp) 

## BuyExecution Instruction

To pay for execution from assets deposited in the holding register, follow these steps:

1. Prepare the [BuyExecution](https://github.com/polkadot-fellows/xcm-format#buyexecution){target=\_blank} as the second instruction for this message
      1. Click on **+ Add item** to add the instruction to the message
      2. Select **BuyExecution** from the dropdown menu
      3. Set the **id** parameter to the location of the asset to be withdrawn. In this case, the asset is located in parachain B, so the value looks like this:

          ```json
          { 
            "parents": 0, 
            "interior": "Here"
          }
          ```

      4. Set the **fun** parameter to `true` to identify the asset as a fungible asset
      5. Specify the **fungible** parameter to indicate the total fungible assets to withdraw. For example, this tutorial uses `12000000000000`
      6. Select `Unlimited` to skip setting a weight limit for this instruction on the **weightLimit** parameter

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-6.webp)

## DepositAsset Instruction

To deposit assets after fees from the holding register into a specific account:

1. Prepare the [DepositAsset](https://github.com/polkadot-fellows/xcm-format#depositasset){target=\_blank} as the third instruction for this message
      1. Click on **+ Add item** to add the instruction to the message
      2. Select **DepositAsset** from the dropdown menu
      3. For the **asset** parameter, set `Wild` to allow an unspecified number of assets to be deposited. Then, set `All` for the *wild* parameter to allow all of the remaining assets after fees are paid to be deposited
      4. For the **maxAssets** parameter, set `1` as the maximum number of unique assets to remove from the holding register for the deposit. In this tutorial, there's only one asset instance available to be removed
      5. For the **beneficiary** parameter, set the destination account for the deposit. In this case, the account is located in parachain A, so the value looks like this:

         ```json
         {
           "parents": 0,
           "interior": {
             "X1": {
               "junction": {
                 "AccountId32": {
                   "network": "Any",
                   "id": "5DEy8ViuBxh8z8hxeNyBhj4y5Mz2sNybv2aPqDHBh7EsyRAz"
               }
             }
           }
         }
         ```

        ![](/images/tutorials/polkadot-sdk/build-a-parachain/transfer-assets-with-xcm/transfer-assets-with-xcm-7.webp)

        !!! note
            If you want to deposit the assets into the sovereign account for parachain A, you could specify the beneficiary using the following settings:
                  ```json
                  {
                    "parents": 0,
                    "interior": {
                      "X1": {
                        "junction": "Parachain",
                        "parachainIndex": 1000
                      }
                    }
                  }
                  ```
After you configure all of the XCM instructions to be executed, you're ready to submit the transaction.

## Submit and Check the Transaction

After submitting the transaction, you can check the status of the transaction in the **Extrinsics** tab. The transaction should be successful if the assets are transferred from parachain B to parachain A.

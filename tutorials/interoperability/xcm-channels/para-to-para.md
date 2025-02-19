---
title: Opening HRMP Channels Between Parachains
description: Learn how to open HRMP channels between parachains on Polkadot. Discover the step-by-step process for establishing uni- and bidirectional communication.
---

# Opening HRMP Channels Between Parachains

## Introduction

For establishing communication channels between parachains on the Polkadot network using the Horizontal Relay-routed Message Passing (HRMP) protocol, the following steps are required:

1. **Channel request** - the parachain that wants to open an HRMP channel must make a request to the parachain it wishes to have an open channel with
2. **Channel acceptance** - the other parachain must then accept this request to complete the channel establishment

This process results in a unidirectional HRMP channel, where messages can flow in only one direction between the two parachains.

An additional HRMP channel must be established in the opposite direction to enable bidirectional communication. This requires repeating the request and acceptance process but with the parachains reversing their roles.

Once both unidirectional channels are established, the parachains can send messages back and forth freely through the bidirectional HRMP communication channel.

## Prerequisites

Before proceeding, ensure you meet the following requirements:

- Blockchain network with a relay chain and at least two connected parachains
- Wallet with sufficient funds to execute transactions on the participant chains

## Procedure to Initiate an HRMP Channel

This example will demonstrate how to open a channel between parachain 2500 and parachain 2600, using Rococo Local as the relay chain.

### Fund Sender Sovereign Account
<!-- This content will be moved to a new page because it is used in multiple places -->
The [sovereign account](https://github.com/polkadot-fellows/xcm-format/blob/10726875bd3016c5e528c85ed6e82415e4b847d7/README.md?plain=1#L50){target=_blank} for parachain 2500 on the relay chain must be funded so it can take care of any XCM transact fees.

Use [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} UI to connect to the relay chain and transfer funds from your account to the parachain 2500 sovereign account.
![](/images/tutorials/interoperability/xcm-channels/hrmp-channels-2.webp)

??? note "Calculating Parachain Sovereign Account"
    To generate the sovereign account address for a parachain, you'll need to follow these steps:

    1. Determine if the parachain is an "up/down" chain (parent or child) or a "sibling" chain:

        - Up/down chains use the prefix `0x70617261` (which decodes to `b"para"`)

        - Sibling chains use the prefix `0x7369626c` (which decodes to `b"sibl"`)

    2. Calculate the u32 scale encoded value of the parachain ID:
        - Parachain 2500 would be encoded as `c4090000`

    3. Combine the prefix and parachain ID encoding to form the full sovereign account address:

        The sovereign account of parachain 2500 in relay chain will be `0x70617261c4090000000000000000000000000000000000000000000000000000`
        and the SS58 format of this address is `5Ec4AhPSY2GEE4VoHUVheqv5wwq2C1HMKa7c9fVJ1WKivX1Y`
    
    To perform this conversion, you can also use the **"Para ID" to Address** section in [Substrate Utilities](https://www.shawntabrizi.com/substrate-js-utilities/){target=_blank}.

### Create Channel Opening Extrinsic

1. In Polkadot.js Apps, connect to the relay chain, navigate to the **Developer** dropdown and select the **Extrinsics** option

    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-1.webp)

2. Construct an `hrmpInitOpenChannel` extrinsic call

    1. Select the **`hrmp`** pallet
    2. Choose the **`hrmpInitOpenChannel`** extrinsic
    3. Fill in the parameters
        - **`recipient`** - parachain ID of the target chain (in this case, 2600)
        - **`proposedMaxCapacity`** - max number of messages that can be pending in the channel at once
        - **`proposedMaxMessageSize`** - max message size that could be put into the channel
    4. Copy the encoded call data
    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-2.webp)
    The encoded call data for opening a channel with parachain 2600 is `0x3c00280a00000800000000001000`.

### Craft and Submit the XCM Message from the Sender

To initiate the HRMP channel opening process, you need to create an XCM message that includes the encoded `hrmpInitOpenChannel` call data from the previous step. This message will be sent from your parachain to the relay chain.

This example uses the `sudo` pallet to dispatch the extrinsic. Verify the XCM configuration of the parachain you're working with and ensure you're using an origin with the necessary privileges to execute the `polkadotXcm.send` extrinsic.

The XCM message should contain the following instructions:

- **`WithdrawAsset`** - withdraws assets from the origin's ownership and places them in the Holding Register
- **`BuyExecution`** - pays for the execution of the current message using the assets in the Holding Register
- **`Transact`** - execute the encoded transaction call
- **`RefundSurplus`** - increases the Refunded Weight Register to the value of the Surplus Weight Register, attempting to reclaim any excess fees paid via BuyExecution
- **`DepositAsset`** - subtracts assets from the Holding Register and deposits equivalent on-chain assets under the specified beneficiary's ownership

!!!note 
    For more detailed information about XCM's functionality, complexities, and instruction set, refer to the [xcm-format](https://github.com/polkadot-fellows/xcm-format){target=_blank} documentation.

In essence, this process withdraws funds from the parachain's sovereign account to the XCVM Holding Register, then uses these funds to purchase execution time for the XCM `Transact` instruction, executes `Transact`, refunds any unused execution time and deposits any remaining funds into a specified account.

To send the XCM message to the relay chain, connect to parachain 2500 in Polkadot.js Apps. Fill in the required parameters as shown in the image below, ensuring that you:

1. Replace the **`call`** field with your encoded `hrmpInitOpenChannel` call data from the previous step
2. Use the correct beneficiary information
3. Click the **Submit Transaction** button to dispatch the XCM message to the relay chain

![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-3.webp)

!!! note
    The exact process and parameters for submitting this XCM message may vary depending on your specific parachain and relay chain configurations. Always refer to the most current documentation for your particular network setup.

After submitting the XCM message to initiate the HRMP channel opening, you should verify that the request was successful. Follow these steps to check the status of your channel request:

1. Using Polkadot.js Apps, connect to the relay chain and navigate to the **Developer** dropdown, then select the **Chain state** option

    ![](/images/tutorials/interoperability/xcm-channels/hrmp-channels-1.webp)

2. Query the HRMP open channel requests
    1. Select **`hrmp`**
    2. Choose the **`hrmpOpenChannelRequests`** call
    3. Click the **+** button to execute the query
    4. Check the status of all pending channel requests

    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-4.webp)

If your channel request was successful, you should see an entry for your parachain ID in the list of open channel requests. This confirms that your request has been properly registered on the relay chain and is awaiting acceptance by the target parachain.

## Procedure to Accept an HRMP Channel

For the channel to be fully established, the target parachain must accept the channel request by submitting an XCM message to the relay chain.

### Fund Receiver Sovereign Account

Before proceeding, ensure that the sovereign account of parachain 2600 on the relay chain is funded. This account will be responsible for covering any XCM transact fees.
To fund the account, follow the same process described in the previous section, [Fund Sovereign Account](#fund-sender-sovereign-account).

### Create Channel Accepting Extrinsic

1. In Polkadot.js Apps, connect to the relay chain, navigate to the **Developer** dropdown and select the **Extrinsics** option

    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-1.webp)

2. Construct an `hrmpAcceptOpenChannel` extrinsic call

    1. Select the **`hrmp`** pallet
    2. Choose the **`hrmpAcceptOpenChannel`** extrinsic
    3. Fill in the parameters:
        - **`sender`** - parachain ID of the requesting chain (in this case, 2500)
    4. Copy the encoded call data
    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-5.webp)
    The encoded call data for accepting a channel with parachain 2500 should be `0x3c01c4090000`

### Craft and Submit the XCM Message from the Receiver

To accept the HRMP channel opening, you need to create and submit an XCM message that includes the encoded `hrmpAcceptOpenChannel` call data from the previous step. This process is similar to the one described in the previous section, [Craft and Submit the XCM Message](#craft-and-submit-the-xcm-message-from-the-sender), with a few key differences:

- Use the encoded call data for `hrmpAcceptOpenChannel` obtained in Step 2 of this section
- In the last XCM instruction (DepositAsset), set the beneficiary to parachain 2600's sovereign account to receive any surplus funds

To send the XCM message to the relay chain, connect to parachain 2600 in Polkadot.js Apps. Fill in the required parameters as shown in the image below, ensuring that you:

1. Replace the **`call`** field with your encoded `hrmpAcceptOpenChannel` call data from the previous step
2. Use the correct beneficiary information
3. Click the **Submit Transaction** button to dispatch the XCM message to the relay chain

![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-6.webp)

After submitting the XCM message to accept the HRMP channel opening, verify that the channel has been set up correctly.

1. Using Polkadot.js Apps, connect to the relay chain and navigate to the **Developer** dropdown, then select the **Chain state** option

    ![](/images/tutorials/interoperability/xcm-channels/hrmp-channels-1.webp)

2. Query the HRMP channels
    1. Select **`hrmp`**
    2. Choose the **`hrmpChannels`** call
    3. Click the **+** button to execute the query
    4. Check the status of the opened channel

    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-7.webp)

If the channel has been successfully established, you should see the channel details in the query results.

By following these steps, you will have successfully accepted the HRMP channel request and established a unidirectional channel between the two parachains. 

!!! note
    Remember that for full bidirectional communication, you'll need to repeat this process in the opposite direction, with parachain 2600 initiating a channel request to parachain 2500.
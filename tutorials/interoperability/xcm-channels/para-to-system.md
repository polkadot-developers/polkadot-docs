---
title: Opening HRMP Channels with System Parachains
description: Learn how to open HRMP channels with Polkadot system parachains. Discover the process for establishing bi-directional communication using a single XCM message.
---

# Opening HRMP Channels with System Parachains

## Introduction

While establishing Horizontal Relay-routed Message Passing (HRMP) channels between regular parachains involves a two-step request and acceptance procedure, opening channels with system parachains follows a more straightforward approach.

System parachains are specialized chains that provide core functionality to the Polkadot network. Examples include Asset Hub for cross-chain asset transfers and Bridge Hub for connecting to external networks. Given their critical role, establishing communication channels with these system parachains has been optimized for efficiency and ease of use.

Any parachain can establish a bidirectional channel with a system chain through a single operation, requiring just one XCM message from the parachain to the relay chain.

## Prerequisites

To successfully complete this process, you'll need to have the following in place:

- Access to a blockchain network consisting of:
    - A relay chain
    - A parachain
    - An Asset Hub system chain
- A wallet containing enough funds to cover transaction fees on each of the participating chains

## Procedure to Establish an HRMP Channel

This guide demonstrates opening an HRMP channel between parachain 2500 and system chain Asset Hub (parachain 1000) on the Rococo Local relay chain.

### Fund Parachain Sovereign Account
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
    
    To perform this conversion, you can also use the **"Para ID" to Address** section in [Substrate Utilities](https://www.shawntabrizi.com/substrate-js-utilities/){target=\_blank}.

### Create Establish Channel with System Extrinsic

1. In Polkadot.js Apps, connect to the relay chain, navigate to the **Developer** dropdown and select the **Extrinsics** option

    ![](/images/tutorials/interoperability/xcm-channels/para-to-para/hrmp-para-to-para-1.webp)

2. Construct an `establish_channel_with_system` extrinsic call

    1. Select the **`hrmp`** pallet
    2. Choose the **`establish_channel_with_system`** extrinsic
    3. Fill in the parameters:
        - **`target_system_chain`** - parachain ID of the target system chain (in this case, 1000)
    4. Copy the encoded call data
    ![](/images/tutorials/interoperability/xcm-channels/para-to-system/hrmp-para-to-system-1.webp)
    The encoded call data for establishing a channel with system parachain 1000 should be `0x3c0ae8030000`

### Craft and Submit the XCM Message

Connect to parachain 2500 using Polkadot.js Apps to send the XCM message to the relay chain. Input the necessary parameters as illustrated in the image below. Make sure to:

1. Insert your previously encoded `establish_channel_with_system` call data into the **`call`** field
2. Provide beneficiary details
3. Dispatch the XCM message to the relay chain by clicking the **Submit Transaction** button
![](/images/tutorials/interoperability/xcm-channels/para-to-system/hrmp-para-to-system-2.webp)

!!! note
    The exact process and parameters for submitting this XCM message may vary depending on your specific parachain and relay chain configurations. Always refer to the most current documentation for your particular network setup.

After successfully submitting the XCM message to the relay chain, two HRMP channels should be created, establishing bidirectional communication between parachain 2500 and system chain 1000. To verify this, follow these steps:

1. Using Polkadot.js Apps, connect to the relay chain and navigate to the **Developer** dropdown, then select **Chain state**
    ![](/images/tutorials/interoperability/xcm-channels/hrmp-channels-1.webp)

2. Query the HRMP channels
    1. Select **`hrmp`** from the options
    2. Choose the **`hrmpChannels`** call
    3. Click the **+** button to execute the query
    ![](/images/tutorials/interoperability/xcm-channels/para-to-system/hrmp-para-to-system-3.webp)
    
3. Examine the query results. You should see output similar to the following:
    ```json
    --8<-- 'code/tutorials/interoperability/xcm-channels/para-to-system/hrmp-query-output.json'
    ```

The output confirms the successful establishment of two HRMP channels:

- From chain 1000 (system chain) to chain 2500 (parachain)
- From chain 2500 (parachain) to chain 1000 (system chain)

This bidirectional channel enables direct communication between the system chain and the parachain, allowing for cross-chain message passing.
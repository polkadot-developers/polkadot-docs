---
title: Unlock a Parachain
description: TODO
---

# Unlock a Parachain

## Introduction

Parachain locks are designed in such way to ensure the decentralization of parachains. If parachains are not locked when it should be, it could introduce centralization risk for new parachains.

A parachain can be locked only with following conditions:

- Relaychain governance MUST be able to lock any parachain.
- A parachain MUST be able to lock its own lock.
- A parachain manager SHOULD be able to lock the parachain.
- A parachain SHOULD be locked when it successfully produced a block for the first time.

A parachain can be unlocked only with following conditions:
- Relaychain governance MUST be able to unlock any parachain.
- A parachain MUST be able to unlock its own lock.

## Check if a Parachain is Locked

To check if a parachain is locked:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the relay chain, navigate to the **Developer** dropdown and select the **Chain State** option

2. Query the parachain locked status:
    1. Select **`registrar`**
    2. Choose the **`paras`** option
    3. Input the parachain ID you want to check as a parameter (e.g. `2006`)
    4. Click the **+** button to execute the query
    5. Check the status of the parachain lock

    ![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-1.webp)

## How to Unlock a Parachain

Unlocking a parachain is then allowed by sending an XCM call to the relay chain with the parachain origin or by executing this from the governance of the relay chain as a roo call.

From a parachain, the XCM message has to be sent from the Root origin. Depending on the parachain, this can be done by using the Sudo pallet or by using the governance mechanism of the parachain.

This guide explains how to send this message assuming your parachain has a Sudo pallet (and the XCM configuration/pallets).

### Prepare the Call

First, you need to prepara the call that will be executed on the relay chain. To do this:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the relay chain, navigate to the **Developer** dropdown and select the **Extrinsics** option

2. Build the `registrar.removeLock` extrinsic
    1. Select the **registrar** pallet
    2. Choose the **removeLock** extrinsic
    3. Fill in the parachain ID parameter (e.g. `2006`)
    4. Copy the encoded call data

    ![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-2.webp)

3. Check the transaction weight for executing the call. You can estimate this by executing the `transactionPaymentCallApi.queryCallInfo` runtime call with the encoded call data previously obtained:

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-3.webp)

### Fund Sovereign Account

The [sovereign account](https://github.com/polkadot-fellows/xcm-format/blob/10726875bd3016c5e528c85ed6e82415e4b847d7/README.md?plain=1#L50){target=\_blank} of your parachain on the relay chain needs adequate funding to cover the XCM transaction fees.
To determine your parachain's sovereign account address, you can:

- Use the **"Para ID" to Address** section in [Substrate Utilities](https://www.shawntabrizi.com/substrate-js-utilities/){target=\_blank} with the **Sibling** option selected

- Calculate it manually:

    1. Identify the appropriate prefix:

        - For parent/child chains use the prefix `0x70617261` (which decodes to `b"para"`)
         
    2. Encode your parachain ID as a u32 [SCALE](https://docs.polkadot.com/polkadot-protocol/basics/data-encoding/#data-types){target=\_blank} value:

        - For parachain 2006, this would be `d6070000`

    3. Combine the prefix with the encoded ID to form the sovereign account address:

        - **Hex** - `0x70617261d6070000000000000000000000000000000000000000000000000000`
        - **SS58 format** - `5Ec4AhPW97z4ZyYkd3mYkJrSeZWcwVv4wiANES2QrJi1x17F`

### Craft and Submit the XCM

To unlock your parachain, you will submit an XCM from your parachain to the relay chain using Root origin.

The XCM needs to execute these operations:

1. Withdraw DOT from your parachain's sovereign account on the relay chain
2. Buy execution to pay for transaction fees
3. Execute the `registrar.removeLock` extrinsic
4. Refund surplus DOT back to the sovereign account

Here's how to submit this XCM using Astar (Parachain 2006) as an example:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the parachain, navigate to the **Developer** dropdown and select the **Extrinsics** option

2. Create a `sudo.sudo` extrinsic that executes `polkadotXcm.send`:
    1. Use the `sudo.sudo` extrinsic to execute the following call as Root
    2. Select the **polkadotXcm** pallet
    3. Choose the **send** extrinsic
    4. Set the **dest** parameter as the relay chain

    ![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-4.webp) 

3. Construct the XCM and submit it:
    1. Add a **WithdrawAsset** instruction
    2. Add a **BuyExecution** instruction
    3. Add a **Transact** instruction with the following parameters:
        - **originKind** - use `Native`
        - **requireWeightAtMost** - use the weight calculated previously
        - **call** - use the encoded call data generated before
    4. Add a **RefundSurplus** instruction
    5. Add a **DepositAsset** instruction to send the remaining funds to the parachain sovereign account
    6. Click the **Submit Transaction** button

    ![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-5.webp)

After successful execution, your parachain should be unlocked. To verify this, check the status of the parachain lock again using the method described in the [Check if a Parachain is Locked](#check-if-a-parachain-is-locked) section. You should see that the lock has been removed.

![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-6.webp)
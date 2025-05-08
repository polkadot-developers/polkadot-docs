---
title: Unlock a Parachain
description: Learn how to unlock your parachain. This step-by-step guide covers verifying lock status, preparing calls, and executing the unlock process.
---

# Unlock a Parachain

## Introduction

Parachain locks are a critical security mechanism in the Polkadot ecosystem designed to maintain decentralization during the parachain lifecycle. These locks prevent potential centralization risks that could emerge during the early stages of parachain operation.
The locking system follows strict, well-defined conditions that distribute control across multiple authorities:

The locking system follows strict, well-defined conditions that distribute control across multiple authorities:

- Relay chain governance has the authority to lock any parachain
- A parachain can lock its own lock
- Parachain managers have permission to lock the parachain
- Parachains are locked automatically when they successfully produce their first block

Similarly, unlocking a parachain follows controlled procedures:

- Relay chain governance retains the authority to unlock any parachain
- A parachain has the ability to unlock its own lock

This document guides you through the process of checking a parachain's lock status and safely executing the unlock procedure from a parachain using XCM (Cross-Consensus Messaging).

## Check if the Parachain is Locked

Before attempting to unlock a parachain, you should verify its current lock status. This can be done through the Polkadot.js interface:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the relay chain, navigate to the **Developer** dropdown and select the **Chain State** option

2. Query the parachain locked status:
    1. Select **`registrar`**
    2. Choose the **`paras`** option
    3. Input the parachain ID you want to check as a parameter (e.g. `2006`)
    4. Click the **+** button to execute the query
    5. Check the status of the parachain lock

    ![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-1.webp)

## How to Unlock a Parachain

Unlocking a parachain requires sending an XCM (Cross-Consensus Message) to the relay chain from the parachain itself, sending a message with Root origin, or this can be accomplished through the relay chain's governance mechanism executing a root call.

If sending an XCM, the parachain origin must have proper authorization, which typically comes from either the parachain's sudo pallet (if enabled) or through its governance system.

This guide demonstrates the unlocking process using a parachain with the sudo pallet. For parachains using governance-based authorization instead, the process will require adjustments to how the XCM is sent.

### Prepare the Unlock Call

Before sending the XCM, you need to construct the relay chain call that will be executed. Follow these steps to prepare the `registrar.removeLock` extrinsic:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the relay chain, navigate to the **Developer** dropdown and select the **Extrinsics** option

2. Build the `registrar.removeLock` extrinsic
    1. Select the **registrar** pallet
    2. Choose the **removeLock** extrinsic
    3. Fill in the parachain ID parameter (e.g. `2006`)
    4. Copy the encoded call data

    ![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-2.webp)

3. Determine the transaction weight required for executing the call. You can estimate this by executing the `transactionPaymentCallApi.queryCallInfo` runtime call with the encoded call data previously obtained:

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-3.webp)

    This weight information is crucial for properly configuring your XCM message's execution parameters in the next steps.

### Fund the Sovereign Account

For a successful XCM execution, the [sovereign account](https://github.com/polkadot-fellows/xcm-format/blob/10726875bd3016c5e528c85ed6e82415e4b847d7/README.md?plain=1#L50){target=\_blank} of your parachain on the relay chain must have sufficient funds to cover transaction fees. The sovereign account is a deterministic address derived from your parachain ID.

You can identify your parachain's sovereign account using either of these methods:

- Use the **"Para ID" to Address** section in [Substrate Utilities](https://www.shawntabrizi.com/substrate-js-utilities/){target=\_blank} with the **Sibling** option selected

- Calculate it manually:

    1. Identify the appropriate prefix:

        - For parent/child chains use the prefix `0x70617261` (which decodes to `b"para"`)
         
    2. Encode your parachain ID as a u32 [SCALE](https://docs.polkadot.com/polkadot-protocol/basics/data-encoding/#data-types){target=\_blank} value:

        - For parachain 2006, this would be `d6070000`

    3. Combine the prefix with the encoded ID to form the sovereign account address:

        - **Hex** - `0x70617261d6070000000000000000000000000000000000000000000000000000`
        - **SS58 format** - `5Ec4AhPW97z4ZyYkd3mYkJrSeZWcwVv4wiANES2QrJi1x17F`
  
You can transfer funds to this account from any account on the relay chain using a standard transfer.

### Craft and Submit the XCM

With the call data prepared and the sovereign account funded, you can now construct and send the XCM from your parachain to the relay chain. The XCM will need to perform several operations in sequence:

1. Withdraw DOT from your parachain's sovereign account
2. Buy execution to pay for transaction fees
3. Execute the `registrar.removeLock` extrinsic
4. Return any unused funds to your sovereign account

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

After submitting the transaction, wait for it to be finalized and then verify that your parachain has been successfully unlocked by following the steps described in the [Check if a Parachain is Locked](#check-if-a-parachain-is-locked) section. If the parachain shows as unlocked, your operation has been successful. If it still appears locked, verify that your XCM transaction was processed correctly and consider troubleshooting the XCM built.

![](/images/develop/parachains/maintenance/unlock-parachain/unlock-parachain-6.webp)
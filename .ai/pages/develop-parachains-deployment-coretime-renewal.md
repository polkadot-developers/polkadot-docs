---
title: Coretime Renewal
description: Learn how to renew coretime manually or automatically to ensure uninterrupted parachain operation with predictable pricing and minimal risk.
categories: Parachains
url: https://docs.polkadot.com/develop/parachains/deployment/coretime-renewal/
---

# Coretime Renewal

## Introduction

Coretime can be purchased in bulk for a period of 28 days, providing access to Polkadot's shared security and interoperability for Polkadot parachains. The bulk purchase of coretime includes a rent-control mechanism that keeps future purchases within a predictable price range of the initial purchase. This allows cores to be renewed at a known price without competing against other participants in the open market.

## Bulk Sale Phases

The bulk sale process consists of three distinct phases:

1. **Interlude phase**: The period between bulk sales when renewals are prioritized.
2. **Lead-in phase**: Following the interlude phase, a new `start_price` is set, and a Dutch auction begins, lasting for `leadin_length` blocks. During this phase, prices experience downward pressure as the system aims to find market equilibrium. The final price at the end of this phase becomes the `regular_price`, which will be used in the subsequent fixed price phase.
3. **Fixed price phase**: The final phase where remaining cores are sold at the `regular_price` established during the lead-in phase. This provides a stable and predictable pricing environment for participants who did not purchase during the price discovery period.

For more comprehensive information about the coretime sales process, refer to the [Coretime Sales](https://wiki.polkadot.com/learn/learn-agile-coretime/#coretime-sales){target=\_blank} section in the Polkadot Wiki.

## Renewal Timing

While renewals can technically be made during any phase, it is strongly recommended that they be completed during the interlude phase. Delaying renewal introduces the risk that the core could be sold to another market participant, preventing successful renewal. Renewals must be initiated well in advance to avoid the scenario above. 

For example, if you purchase a core in bulk sale #1, you obtain coretime for the upcoming bulk period (during which bulk sale #2 takes place).
Your renewal must be completed during bulk sale #2, ideally during its interlude phase, to secure coretime for the subsequent period.

## Manual Renewal

Cores can be renewed by issuing the [`broker.renew(core)`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.renew){target=\_blank} extrinsic during the coretime sale period. While this process is straightforward, it requires manual action that must not be overlooked. Failure to complete this renewal step before all available cores are sold could result in your parachain being unable to secure a core for the next operational period.

To manually renew a core:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the Coretime chain, navigate to the **Developer** dropdown, and select the **Extrinsics** option.

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-1.webp)

2. Submit the `broker.renew` extrinsic:

    1. Select the **broker** pallet.
    2. Choose the **renew** extrinsic.
    3. Fill in the **core** parameter.
    4. Click the **Submit Transaction** button.

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-2.webp)

For optimal results, the renewal should be performed during the interlude phase. Upon successful submission, your core will be renewed for the next coretime period, ensuring the continued operation of your parachain.

## Auto-Renewal

The coretime auto-renewal feature simplifies maintaining continuous coretime allocation by automatically renewing cores at the beginning of each sale period. This eliminates the need for parachains to manually renew their cores for each bulk period, reducing operational overhead and the risk of missing renewal deadlines.

When auto-renewal is enabled, the system follows this process at the start of each sale:

1. The system scans all registered auto-renewal records.
2. For each record, it attempts to process renewal payments from the task's [sovereign account](/polkadot-protocol/glossary/#sovereign-account){target=\_blank} (which is the sibling account on the Coretime chain derived from the parachain ID).
3. Upon successful payment, the system emits a `Renewed` event and secures the core for the next period.
4. If payment fails due to insufficient funds or other issues, the system emits an `AutoRenewalFailed` event.

Even if an auto-renewal attempt fails, the auto-renewal setting remains active for subsequent sales. This means the setting persists across multiple periods once you've configured auto-renewal.

To enable auto-renewal for your parachain, you must configure several components, as detailed in the following sections.

### Set Up an HRMP Channel

A Horizontal Relay-routed Message Passing (HRMP) channel must be opened between your parachain and the Coretime system chain before configuring auto-renewal. 

For instructions on establishing this connection, consult the [Opening HRMP Channels with System Parachains](/tutorials/interoperability/xcm-channels/para-to-system/){target=\_blank} guide.

### Fund Sovereign Account

The [sovereign account](https://github.com/polkadot-fellows/xcm-format/blob/10726875bd3016c5e528c85ed6e82415e4b847d7/README.md?plain=1#L50){target=\_blank} of your parachain on the Coretime chain needs adequate funding to cover both XCM transaction fees and the recurring coretime renewal payments.

To determine your parachain's sovereign account address, you can:

- Use the **"Para ID" to Address** section in [Substrate Utilities](https://www.shawntabrizi.com/substrate-js-utilities/){target=\_blank} with the **Sibling** option selected.

- Calculate it manually:

    1. Identify the appropriate prefix:

        - **For sibling chains**: `0x7369626c` (decodes to `b"sibl"`).
         
    2. Encode your parachain ID as a u32 [SCALE](/polkadot-protocol/parachain-basics/data-encoding#data-types){target=\_blank} value:

        - For parachain 2000, this would be `d0070000`.

    3. Combine the prefix with the encoded ID to form the sovereign account address:

        - **Hex**: `0x7369626cd0070000000000000000000000000000000000000000000000000000`
        - **SS58 format**: `5Eg2fntJ27qsari4FGrGhrMqKFDRnkNSR6UshkZYBGXmSuC8`

### Auto-Renewal Configuration Extrinsics

The Coretime chain provides two primary extrinsics for managing the auto-renewal functionality:

- **[`enable_auto_renew(core, task, workload_end_hint)`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.enable_auto_renew){target=\_blank}**: Use this extrinsic to activate automatic renewals for a specific core. This transaction must originate from the sovereign account of the parachain task.

    **Parameters:**

    - **`core`**: The core currently assigned to the task.
    - **`task`**: The task for which auto-renewal is being enabled.
    - **`workload_end_hint`**: The timeslice at which the currently assigned core will stop being used. This value helps the system determine when auto-renewal should begin. It is recommended to always provide this value to avoid ambiguity.

        - If the coretime expires in the current sale period, use the last timeslice of the current sale period.

        - If the coretime expires at the end of the next sale period (e.g., because you've already renewed), use the last timeslice of the next sale period.

        - If a lease is active, use the timeslice when the lease ends.

- **[`disable_auto_renew(core, task)`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.disable_auto_renew){target=\_blank}**: Use this extrinsic to stop automatic renewals. This extrinsic also requires that the origin is the sovereign account of the parachain task.

     **Parameters:**

    - **`core`**: The core currently assigned to the task.
    - **`task`**: The task for which auto-renewal is enabled.

### Construct the Enable Auto-Renewal Extrinsic

To configure auto-renewal, you'll need to gather specific information for the `enable_auto_renew` extrinsic parameters:

- **`core`**: Identify which core your parachain is assigned to when it expires. This requires checking both current assignments and planned future assignments.
    - **For current period**: Query `broker.workload()`.
    - **For next period**: Query `broker.workplan()`.

    **Example for parachain `2000`:**
    
    - Current assignment (workload):

        ```txt
        [
          [50]
          [{
            mask: 0xffffffffffffffffffff
            assignment: {Task: 2,000}
          }]
        ]
        ```

    - Future assignment (workplan):

        ```txt
        [
          [[322,845, 48]]
          [{
            mask: 0xffffffffffffffffffff
            assignment: {Task: 2,000}
          }]
        ]
        ```

    **Note:** Use the core from workplan (`48` in this example) if your task appears there. Only use the core from workload if it's not listed in workplan.

- **`task`**: Use your parachain ID, which can be verified by connecting to your parachain and querying `parachainInfo.parachainId()`.

- **`workload_end_hint`**: You should always set it explicitly to avoid misbehavior. This value indicates when your assigned core will expire. Here's how to calculate the correct value based on how your core is assigned.
    - If the parachain uses bulk coretime, query `broker.saleinfo`. You’ll get a result like:

        ```json
        {
        "saleStart": 1544949,
        "leadinLength": 100800,
        "endPrice": 922760076,
        "regionBegin": 322845,
        "regionEnd": 327885,
        "idealCoresSold": 18,
        "coresOffered": 18,
        "firstCore": 44,
        "selloutPrice": 92272712073,
        "coresSold": 18
        }
        ```

        - If the core expires in the current sale, use the `regionBegin` value, which in this case is  `322845`.

        - If the core has already been renewed and will expire in the next sale, use the `regionEnd` value. In this example, that would be `327885`.


    - If the parachain has a lease, query `broker.leases`, which returns entries like:

        ```json
        [
          {
            "until": 359280,
            "task": 2035
          },
          ...
        ]
        ```

        - Use the `until` value of the lease that corresponds to your task. For example, `359280` would be the value for `workload_end_hint` in the case of task `2035`.

Once you have these values, construct the extrinsic:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to the Coretime chain, navigate to the **Developer** dropdown, and select the **Extrinsics** option.

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-1.webp)

2. Create the `broker.enable_auto_renew` extrinsic:

    1. Select the **broker** pallet.
    2. Choose the **enableAutoRenew** extrinsic.
    3. Fill in the parameters.
    4. Copy the encoded call data.

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-3.webp)

    For parachain `2000` on core `48` with `workload_end_hint` `327885`, the **encoded call data** is:`0x32153000d007000001cd000500`.

3. Check the transaction weight for executing the call. You can estimate this by executing the `transactionPaymentCallApi.queryCallInfo` runtime call with the encoded call data previously obtained.

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-4.webp)

### Submit the XCM from Your Parachain

To activate auto-renewal, you must submit an XCM from your parachain to the Coretime chain using Root origin.  This can be done through the sudo pallet (if available) or your parachain's governance system.

The XCM needs to execute these operations:

1. Withdraw DOT from your parachain's sovereign account on the Coretime chain.
2. Buy execution to pay for transaction fees.
3. Execute the auto-renewal extrinsic.
4. Refund surplus DOT back to the sovereign account.

Here's how to submit this XCM using Acala (Parachain 2000) as an example:

1. In [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}, connect to your parachain, navigate to the **Developer** dropdown and select the **Extrinsics** option.

2. Create a `sudo.sudo` extrinsic that executes `polkadotXcm.send`:
    1. Use the `sudo.sudo` extrinsic to execute the following call as Root.
    2. Select the **polkadotXcm** pallet.
    3. Choose the **send** extrinsic.
    4. Set the **dest** parameter as the Coretime chain (Parachain 1005).

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-5.webp)


3. Construct the XCM and submit it:

    1. Add a **WithdrawAsset** instruction.
    2. Add a **BuyExecution** instruction.
    3. Add a **Transact** instruction with the following parameters:

        - **originKind**: Use `SovereignAccount`.
        - **requireWeightAtMost**: Use the weight calculated previously.
        - **call**: Use the encoded call data generated before.

    4. Add a **RefundSurplus** instruction.
    5. Add a **DepositAsset** instruction to send the remaining funds to the parachain sovereign account.
    6. Click the **Submit Transaction** button.

    ![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-6.webp)

After successful execution, your parachain should have auto-renewal enabled. To verify this, check the events emitted in the Coretime chain. You should see a confirmation event named `broker.AutoRenewalEnabled`, which includes two parameters:

- **core**: The core currently assigned to your task, in this example, `48`.
- **task**: The task for which auto-renewal was enabled, in this example, `2000`.

You can find this event in the list of recent events. It should look similar to the following:

![](/images/develop/parachains/deployment/coretime-renewal/coretime-renewal-7.webp)

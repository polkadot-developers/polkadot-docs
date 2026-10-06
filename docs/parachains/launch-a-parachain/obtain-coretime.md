---
title: Obtain Coretime
description: Learn how to obtain coretime for block production with this guide, covering both on-demand and bulk options for smooth operations.
short_description: Acquire blockspace using Polkadot's coretime model.
categories: Parachains
page_badges:
  tutorial_badge: Advanced
---

# Obtain Coretime

## Introduction

After deploying a parachain to Paseo in the [Deploy on Polkadot](/parachains/launch-a-parachain/deploy-to-polkadot/){target=\_blank} tutorial, the next critical step is obtaining coretime. Coretime is the mechanism through which validation resources are allocated from the relay chain to your parachain. Your parachain can only produce and finalize blocks on the relay chain by obtaining coretime.

There are two primary ways to obtain coretime:

- **[On-demand coretime](#order-on-demand-coretime)**: Purchase coretime on a block-by-block basis, ideal for variable or unpredictable workloads.
- **[Bulk coretime](#purchase-bulk-coretime)**: Obtain a core or portion of a core for an extended period (up to 28 days), requiring renewal upon lease expiration.

In this tutorial, you will:

- Understand the different coretime options available.
- Learn how bulk coretime is purchased and assigned to a parachain.
- Explore on-demand coretime as an alternative approach.

## Prerequisites

Before proceeding, ensure you have the following:

- A parachain ID reserved on Paseo.
- A properly configured chain specification file (both plain and raw versions).
- A registered parathread with the correct genesis state and runtime.
- A synced collator node running and connected to the Paseo relay chain.
- [PAS tokens](https://faucet.polkadot.io/?parachain=1005){target=\_blank} in your account on the Coretime Chain for transaction fees.

If you haven't completed these prerequisites, start by referring to the [Deploy on Polkadot](/parachains/launch-a-parachain/deploy-to-polkadot/){target=\_blank} tutorial.

## Order On-Demand Coretime

On-demand coretime allows you to purchase validation resources on a per-block basis. This approach is useful when you don't need continuous block production or want to test your parachain before committing to bulk coretime.

### On-Demand Extrinsics

There are two extrinsics available for ordering on-demand coretime:

- **[`onDemand.placeOrderAllowDeath`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/on_demand/pallet/struct.Pallet.html#method.place_order_allow_death){target=\_blank}**: Will [reap](https://wiki.polkadot.com/learn/learn-accounts/#existential-deposit-and-reaping){target=\_blank} the account once the provided funds are depleted.
- **[`onDemand.placeOrderKeepAlive`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/on_demand/pallet/struct.Pallet.html#method.place_order_keep_alive){target=\_blank}**: Includes a check to prevent reaping the account, ensuring it remains alive even if funds run out.

### Place an On-Demand Order

To place an on-demand coretime order, follow these steps:

1. Open the [Polkadot.js Apps interface connected to the Polkadot TestNet (Paseo)](https://polkadot.js.org/apps/?rpc=wss://paseo.dotters.network){target=\_blank}.

2. Navigate to **Developer > Extrinsics** in the top menu.

3. Select the account that registered your parachain ID.

4. From the **submit the following extrinsic** dropdown, select **onDemand** and then choose **placeOrderAllowDeath** as the extrinsic.

5. Configure the parameters:

    - **maxAmount**: The maximum amount of tokens you're willing to spend (e.g., `1000000000000`). This value may vary depending on network conditions.
    - **paraId**: Your reserved parachain ID (e.g., `4508`).

6. Review the transaction details and click **Submit Transaction**.

![Placing an on-demand order for coretime](/images/parachains/launch-a-parachain/obtain-coretime/obtain-coretime-01.webp)

Upon successful submission, your parachain will produce a new block. You can verify this by checking your collator node logs, which should display output confirming block production.

!!!note
    Each successful on-demand extrinsic will trigger one block production cycle. For continuous block production, you'll need to place multiple orders or consider bulk coretime.

## Purchase Bulk Coretime

Bulk coretime offers a cost-effective way to maintain continuous block production. It lets you reserve a core for up to 28 days and renew it as needed.

You purchase and manage cores on the [Coretime Chain](https://wiki.polkadot.com/learn/learn-system-chains/#coretime-chain), a system parachain that runs [`pallet_broker`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html) to handle core sales, allocation, and renewal across the Polkadot ecosystem.

### Bulk Coretime Extrinsics

Obtaining bulk coretime for a parachain takes two extrinsics on the Coretime Chain:

- **[`broker.purchase`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.purchase)**: Buys a core in the current sale. The `price_limit` parameter caps what you pay, and the call fails with an `Overpriced` error if the current price is higher. A successful purchase emits a [`Purchased`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/enum.Event.html#variant.Purchased) event containing the `region_id` of the region you now own.
- **[`broker.assign`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.assign)**: Assigns a region you own to a task, which for a parachain is its parachain ID. The [`finality`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/enum.Finality.html) parameter is either `Provisional`, which keeps the region with you so you can change the assignment later, or `Final`, which fixes the assignment and makes the region eligible for renewal. Choose `Final` if you plan to renew the core.

The region you buy covers the sale's upcoming period, so your parachain starts producing blocks on that core when the region begins, not immediately after assignment.

### Obtain Coretime Chain Funds

To purchase a core, you need funds on the Coretime Chain. You can fund your account directly on the Coretime Chain using the Polkadot Faucet:

1. Visit the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=0){target=\_blank}.

2. Select the **Coretime (Paseo)** network from the dropdown menu.

3. Paste your wallet address in the input field.

4. Click **Get some PASs** to receive 5000 PAS tokens.

!!!note
    The Polkadot Faucet has a daily limit of 5,000 PAS tokens per account. If you need more tokens than this limit allows, you have two options:
    
    - Return to the faucet on consecutive days to accumulate additional tokens.
    - Create additional accounts, fund each one separately, and then transfer the tokens to your primary account that will be making the bulk coretime purchase.

    Alternatively, to expedite the process, you can send a message to the [Paseo Support channel](https://matrix.to/#/#paseo-testnet-support:parity.io){target=\_blank} on Matrix, and the Paseo team will assist you in funding your account.

### Obtain a Core on Paseo

Paseo allocates cores through its own onboarding process, which prioritizes teams based on the resources available on the network:

1. Read the [PAS-10 Onboard Paras Coretime](https://github.com/paseo-network/paseo-action-submission/blob/main/pas/PAS-10-Onboard-paras-coretime.md#summary) guide, which describes the onboarding flow.

2. Open a parachain onboarding issue in the [Paseo support repository](https://github.com/paseo-network/support/issues).

3. Once the Paseo team has processed your request, purchase a core with `broker.purchase` and assign it to your parachain ID with `broker.assign`, using `Final` finality if you plan to renew.

If no cores are available or you run into problems, follow up on your onboarding issue or ask in the [Paseo Support channel](https://matrix.to/#/#paseo-testnet-support:parity.io) on Matrix.

### Verify Block Production

Once the region assigned to your parachain begins, check your collator node logs. They should show new blocks being produced and finalized, provided your collator is running and synced with the relay chain.

## Next Steps

Your parachain is now set up for block production. Consider the following:

- **Monitor your collator**: Keep your collator node running and monitor its performance.
- **Plan coretime renewal**: If using bulk coretime, plan to renew your core before the current lease expires.
- **Explore runtime upgrades**: Once comfortable with your setup, explore how to upgrade your parachain's runtime without interrupting block production.
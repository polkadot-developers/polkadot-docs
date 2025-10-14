---
title: Obtain Coretime
description: Learn how to obtain coretime for block production with this guide, covering both on-demand and bulk options for smooth operations.
tutorial_badge: Advanced
categories: Parachains
---

# Obtain Coretime

## Introduction

After deploying a parachain to Paseo in the [Deploy on Polkadot](/parachains/launch-a-parachain/deploy-on-polkadot/){target=\_blank} tutorial, the next critical step is obtaining coretime. Coretime is the mechanism through which validation resources are allocated from the relay chain to your parachain. Your parachain can only produce and finalize blocks on the relay chain by obtaining coretime.

There are two primary ways to obtain coretime:

- **[On-demand coretime](#order-on-demand-coretime)**: Purchase coretime on a block-by-block basis, ideal for variable or unpredictable workloads.
- **[Bulk coretime](#purchase-bulk-coretime)**: Obtain a core or portion of a core for an extended period (up to 28 days), requiring renewal upon lease expiration.

In this tutorial, you will:

- Understand the different coretime options available.
- Learn how to purchase a core via bulk coretime.
- Assign your parachain to a core for block production.
- Explore on-demand coretime as an alternative approach.

## Prerequisites

Before proceeding, ensure you have the following:

- A parachain ID reserved on Paseo.
- A properly configured chain specification file (both plain and raw versions).
- A registered parathread with the correct genesis state and runtime.
- A synced collator node running and connected to the Paseo relay chain.
- PAS tokens in your account for transaction fees.

If you haven't completed these prerequisites, refer to the [Deploy on Polkadot](/parachains/launch-a-parachain/deploy-on-polkadot/){target=\_blank} tutorial.

## Order On-Demand Coretime

On-demand coretime allows you to purchase validation resources on a per-block basis. This approach is useful when you don't need continuous block production or want to test your parachain before committing to bulk coretime.

### Using the OnDemand Extrinsics

There are two extrinsics available for ordering on-demand coretime:

- **`onDemand.placeOrderAllowDeath`**: Will [reap](https://wiki.polkadot.com/learn/learn-accounts/#existential-deposit-and-reaping){target=\_blank} the account once the provided funds are depleted.
- **`onDemand.placeOrderKeepAlive`**: Includes a check to prevent reaping the account, ensuring it remains alive even if funds run out.

### Placing an On-Demand Order

![Placing an on-demand order for coretime](/images/parachains/launch-a-parachain/obtain-coretime/obtain-coretime-1.webp)

To place an on-demand coretime order, follow these steps:

1. Open the [Polkadot.js Apps interface connected to Paseo](https://polkadot.js.org/apps/?rpc=wss://paseo.dotters.network){target=\_blank}.

2. Navigate to **Developer > Extrinsics** in the top menu.

3. Select the account that registered your parachain ID.

4. From the pallet dropdown, select `onDemand` and then choose `placeOrderAllowDeath` as the extrinsic.

5. Configure the parameters:
    - **maxAmount**: The maximum amount of tokens you're willing to spend (e.g., `1000000000000`). This value may vary depending on network conditions.
    - **paraId**: Your reserved parachain ID (e.g., `4508`).

6. Review the transaction details and click **Submit**.

Upon successful submission, your parachain will produce a new block. You can verify this by checking your collator node logs, which should display output confirming block production.

!!!note
    Each successful on-demand extrinsic will trigger one block production cycle. For continuous block production, you'll need to place multiple orders or consider bulk coretime.

## Purchase Bulk Coretime

Bulk coretime provides a more economical option for ongoing block production. You purchase a core on the Coretime Chain for a specified duration (up to 28 days), which must be renewed upon expiration.

### Understanding the Coretime Chain

The Coretime Chain is a system parachain that hosts an instance of the [`pallet_broker`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=\_blank} (Broker pallet). This pallet manages core sales, allocation, and assignment within the Polkadot ecosystem.

!!!tip
    Paseo has a unique process for obtaining coretime cores. Refer to the [PAS-10 Onboard Paras Coretime](https://github.com/paseo-network/paseo-action-submission/blob/main/pas/PAS-10-Onboard-paras-coretime.md#summary){target=\_blank} guide for specific instructions on applying for a core on Paseo.

### Using the RegionX Coretime Marketplace

The [RegionX Coretime Marketplace](https://app.regionx.tech){target=\_blank} provides a user-friendly interface for purchasing and managing bulk coretime. It supports both Paseo TestNet and production networks.

![RegionX home page with Wallet connected](/images/parachains/launch-a-parachain/obtain-coretime/obtain-coretime-2.webp)

#### Step 1: Connect Your Wallet

1. Visit the [RegionX App](https://app.regionx.tech){target=\_blank}.

2. Click the **Connect Wallet** button in the upper right corner.

3. Select your wallet provider and approve the connection.

#### Step 2: Obtain Coretime Chain Funds

To purchase a core, you need funds on the Coretime Chain. You can fund your account directly on the Coretime Chain using the Polkadot Faucet:

1. Visit the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=0){target=\_blank}.

2. Select the **Coretime (Paseo)** network from the dropdown menu.

3. Paste your wallet address in the input field.

4. Click **Get some PASs** to receive 5000 PAS tokens.

!!!note
    The Polkadot Faucet has a limit of 5000 PAS tokens per account per day. If you need more tokens than this limit allows, you have two options:
    
    - Return to the faucet on consecutive days to accumulate additional tokens
    - Create additional accounts, fund each one separately, and then transfer the tokens to your primary account that will be making the bulk coretime purchase

    Alternatively, to expedite the process, you can drop a message in the [Paseo Support channel](https://matrix.to/#/#paseo-testnet-support:parity.io){target=\_blank} and the Paseo team can help fund your account.

#### Step 3: Purchase a Core

1. From the RegionX home page, ensure the correct network is selected using the network switch in the top right corner (should be set to **Paseo**).

2. Review the information displayed on the home page, including:
    - **Cores Remaining**: Number of available cores
    - **Cores Offered**: Total cores in the current sale
    - **Current price**: The price per core in PAS tokens
    - **Auction Phase Status**: Current phase and progress

3. Click the **Purchase New Core** button displayed on the page.

4. A modal will appear detailing the transaction details and fees. Review the information carefully.

5. Click **Ok** and sign the transaction using your connected wallet.

6. Wait for the transaction to be confirmed on-chain.

#### Step 4: Verify Your Purchase

1. Once the transaction is confirmed, navigate to [RegionX My Regions](https://app.regionx.tech/regions){target=\_blank} from the left menu.

2. You should see your newly purchased core listed in your dashboard.

Congratulations! You've successfully purchased a core using RegionX.

#### Step 5: Assign Your Parachain to the Core

With your core purchased, you now need to assign your parachain to it for block production:

1. From the **My Regions** page, click on your core to select it.

2. Click the **Assign** option from the left-hand menu.

3. A modal will appear where you can add a new task.

4. Click **Add Task** and enter the following information:
    - **Parachain ID**: Your reserved parachain identifier
    - **Project Name**: The name of your parachain project

5. Click **Add Task** to proceed.

6. Select your parachain task from the list.

7. Set the core's **Finality** setting:
    - **Provisional**: Allows interlacing and partitioning of the core, but the region cannot be renewed as-is.
    - **Final**: Prevents modification of the core but allows renewal. Choose this if you plan to renew the core.

8. Sign and submit the transaction.

Once confirmed, your parachain will be assigned to the core and should begin producing blocks (provided your collator is running and synced with the relay chain).

## Next Steps

Your parachain is now set up for block production! Consider the following:

- **Monitor your collator**: Keep your collator node running and monitor its performance.
- **Plan coretime renewal**: If using bulk coretime, plan to renew your core before the current lease expires.
- **Explore runtime upgrades**: Once comfortable with your setup, explore how to upgrade your parachain runtime without interrupting block production.
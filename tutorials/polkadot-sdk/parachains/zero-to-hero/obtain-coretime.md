---
title: Obtain Coretime
description: Learn how to obtain coretime for block production with this guide, covering both on-demand and bulk options for smooth operations.
---

## Introduction

After deploying a parachain to the Paseo TestNet in the [Deploy to TestNet](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/){target=\_blank} tutorial, the focus shifts to understanding Coretime, which is the mechanism in which validation resources are allocated from the relay chain to the respective task, such as a parachain. A parachain could only produce blocks and finalize them on the relay chain by obtaining coretime.

There are two ways to obtain coretime:

- **[On-demand coretime](#order-on-demand-coretime)** - on-demand coretime allows you to buy coretime on a block-by-block basis
- **[Bulk coretime](#purchase-bulk-coretime)** - bulk coretime allows you to obtain a core or part of a core. It is purchased for some time, up to 28 days. It must be renewed once the lease finishes

In this tutorial, you will:

- Learn about the different coretime interfaces available
- Learn how to purchase a core via bulk coretime
- Assign a task / parachain to the core for block production
- Alternatively, use on-demand coretime to produce blocks as required

## Prerequisites 

Before proceeding, you should have the following items:

- A parachain ID
- A chain specification
- A registered parathread with the correct genesis, runtime, and parachain ID that matches the chain specification
- A properly configured and synced (with the relay chain) collator

Once the above is complete, obtaining coretime is the last step to enable your parachain to start producing and finalizing blocks using the relay chain's validator set. If you don't, refer to the previous tutorial: [Deploy on Paseo TestNet](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/){target=\_blank}.

## Order On Demand Coretime

There are two extrinsics which allow you to place orders for on-demand coretime:

- [**`onDemand.placeOrderAllowDeath`**](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/on_demand/pallet/dispatchables/fn.place_order_allow_death.html){target=\_blank} - will [reap](https://wiki.polkadot.network/docs/learn-accounts#existential-deposit-and-reaping){target=\_blank} the account once the provided funds run out
- [**`onDemand.placeOrderKeepAlive`**](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/on_demand/pallet/dispatchables/fn.place_order_keep_alive.html){target=\_blank} - includes a check that will **not** reap the account if the provided funds run out, ensuring the account is kept alive

To produce a block in your parachain, navigate to Polkadot.js Apps and ensure you're connected to the Paseo relay chain. Then, access the [**Developer > Extrinsics**](https://polkadot.js.org/apps/#/extrinsics){target=\_blank} tab and execute the `onDemand.placeOrderAllowDeath` extrinsic from the account that registered the `ParaID`. For this example, `maxAmount` is set to `1000000000000` (this value may vary depending on the network conditions), and `paraId` is set to `4518`:

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-9.webp)

With each successful on-demand extrinsic, the parachain will produce a new block. You can verify this by checking the collator logs. If the extrinsic is successful, you should see output similar to the following:

--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-1.html'

## Purchase Bulk Coretime

Purchasing bulk coretime involves purchasing a core from the [Coretime Chain](/polkadot-protocol/architecture/system-chains/coretime/){target=\_blank}, which has an instance of [`pallet_broker`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=\_blank} (the Broker pallet). Although this can be done via sending extrinsics through a tool like Polkadot.js Apps, there are user interfaces for purchasing and managing bulk coretime:

- [RegionX Coretime Marketplace (includes Paseo support)](https://app.regionx.tech){target=\_blank}
- [Lastic Coretime Marketplace](https://www.lastic.xyz/polkadot/bulkcore1){target=\_blank}
  
!!!tip
    Obtaining a core for bulk coretime on Paseo follows a different process from Polkadot or Kusama. To apply for a core on Paseo, visit their guide for doing so: [PAS-10 Onboard Paras Coretime](https://github.com/paseo-network/paseo-action-submission/blob/main/pas/PAS-10-Onboard-paras-coretime.md#summary){target=\_blank}. 

### Get Coretime Funds

First, ensure your wallet is connected to the [RegionX](https://app.regionx.tech){target=\_blank} interface. To do so, go to **Home** in the RegionX app and click the **Connect Wallet** button in the upper right.

After connecting your wallet, you must obtain funds on the Coretime chain. You can use the [RegionX Transfer](https://app.regionx.tech/transfer){target=\_blank} page to perform a cross-chain transfer from the relay to the system chain.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-1.webp)

If you are purchasing a core on a TestNet, be sure to visit the [Polkadot Faucet](https://faucet.polkadot.io/westend){target=\_blank} for TestNet tokens.

If successful, you should see the balance in the upper right of the **Transfer** page update with balances on the relay and Coretime chain, respectively.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-2.webp)

### Purchase a Core

For this tutorial, we will use [RegionX](https://app.regionx.tech){target=\_blank}. Once you open the app, you should be presented with the following screen:

![Screenshot of the RegionX app displaying the main interface.](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-3.webp)

On the top left is a network switch. Ensure you have selected your parachain and that it is registered before purchasing a core.

To purchase a core, go to the menu on the left and select the **Purchase A Core** item under **Primary Market**. Here, you should see the cores available for purchase, details regarding the sale period, and its current phase. Alternatively, you may use this link to visit it: [**Primary Market > Purchase A Core**](https://app.regionx.tech/purchase){target=\_blank}.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-4.webp)

At the bottom-right corner of the page, select the **Purchase a Core** button. A modal detailing the fees will appear. Review the details, then click **Ok** and sign the transaction using the wallet of your choice.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-5.webp)

Once the transaction is confirmed, click [**My Regions**](https://app.regionx.tech/regions){target=\_blank} on the left-hand menu, and you will see your purchased core.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-6.webp)

Congratulations, you just purchased a core using RegionX! You can assign the core to your parachain, partition, interlace, and more using RegionX.

### Assign a Core

Once you have the core as shown in the dashboard, select it by clicking on it, then click the **Assign** option on the left-hand side. You will be presented with a modal in which you can add a new task.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-7.webp)

Click the **Add Task** button and input the parachain identifier, along with the name of your project, and finalize it by clicking **Add Task**.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/obtain-coretime-8.webp)

You may now select a task from the list. You must also set the core's finality, which determines whether you can renew this specific core. Provisional finality allows for interlacing and partitioning, whereas Final finality does not allow the region to be modified. A core must not be interlaced or partitioned to be renewable, so Finality should be selected if you want to renew this specific core.

Once you sign and send this transaction, your parachain will be assigned to that core.
---
title: Coretime Chain
description: Learn about the role of the Coretime system parachain, which facilitates the sale, purchase, assignment, and mechanisms of bulk coretime.
---

## Introduction

The Coretime system chain facilitates the allocation, procurement, sale, and scheduling of bulk [coretime](/polkadot-protocol/glossary/#coretime){target=\_blank}, enabling tasks (such as [parachains](/polkadot-protocol/glossary/#parachain){target=\_blank}) to utilize the computation and security provided by Polkadot. 

The [Broker pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=\_blank}, along with [Cross Consensus Messaging (XCM)](/develop/interoperability/intro-to-xcm/){target=\_blank}, enables this functionality to be delegated to the system chain rather than the relay chain. Using [XCMP's Upward Message Passing (UMP)](https://wiki.polkadot.network/docs/learn-xcm-transport#ump-upward-message-passing){target=\_blank} to the relay chain allows for core assignments to take place for a task registered on the relay chain.

The Fellowship RFC [RFC-1: Agile Coretime](https://github.com/polkadot-fellows/RFCs/blob/main/text/0001-agile-coretime.md){target=\_blank} contains the specification for the Coretime system chain and coretime as a concept.

Besides core management, its responsibilities include: 

- The number of cores that should be made available
- Which tasks should be running on which cores and in what ratios
- Accounting information for the on-demand pool

From the relay chain, it expects the following via [Downward Message Passing (DMP)](https://wiki.polkadot.network/docs/learn-xcm-transport#dmp-downward-message-passing){target=\_blank}:

- The number of cores available to be scheduled
- Account information on on-demand scheduling

The details for this interface can be found in [RFC-5: Coretime Interface](https://github.com/polkadot-fellows/RFCs/blob/main/text/0005-coretime-interface.md){target=\_blank}.

## Bulk Coretime Assignment

The Coretime chain allocates coretime before its usage. It also manages the ownership of a core. As cores are made up of regions (by default, one core is a single region), a region is recognized as a non-fungible asset. The Coretime chain exposes Regions over XCM as an NFT. Users can transfer individual regions, partition, interlace, or allocate them to a task. Regions describe how a task may use a core.

A core can be considered a logical representation of an active validator set on the relay chain, where these validators commit to verifying the state changes for a particular task running on that region. With partitioning, having more than one region per core is possible, allowing for different computational schemes. Therefore, running more than one task on a single core is possible.

Regions can be managed in the following manner on the Coretime chain:

- **Assigning region** - regions can be assigned to a task on the relay chain, such as a parachain/rollup using the [`assign`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/dispatchables/fn.assign.html){target=\_blank} dispatchable

- **Transferring regions** - regions may be transferred on the Coretime chain, upon which the [`transfer`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/dispatchables/fn.transfer.html){target=\_blank} [dispatchable](/polkadot-protocol/glossary/#dispatchable){target=\_blank} in the Broker pallet would assign a new owner to that specific region

- **Partitioning regions** - using the [`partition`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/dispatchables/fn.partition.html){target=\_blank} dispatchable, regions may be partitioned into two non-overlapping subregions within the same core. A partition involves specifying a *pivot*, wherein the new region will be defined and available for use

- **Interlacing regions** - using the [`interlace`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/dispatchables/fn.interlace.html){target=\_blank} dispatchable, interlacing regions allows a core to have alternative-compute strategies. Whereas partitioned regions are mutually exclusive, interlaced regions overlap because multiple tasks may utilize a single core in an alternating manner

When bulk coretime is obtained, block production is not immediately available. It becomes available to produce blocks for a task in the next Coretime cycle. To view the status of the current or next Coretime cycle, see the [Subscan Coretime Dashboard](https://coretime-polkadot.subscan.io/coretime_dashboard){target=\_blank}.

For more information regarding these mechanisms, see the coretime page on the Polkadot Wiki: [Introduction to Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime){target=\_blank}. 

## On Demand Coretime

At this writing, on-demand coretime is currently deployed on the relay chain and will eventually be deployed to the Coretime chain. On-demand coretime allows parachains (previously known as parathreads) to utilize available cores per block.

The Coretime chain also handles coretime sales, details of which can be found on the Polkadot Wiki: [Agile Coretime: Coretime Sales](https://wiki.polkadot.network/docs/learn-agile-coretime#coretime-sales){target=\_blank}.

## Where to Go Next

- Learn about [Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime#introduction-to-agile-coretime){target=\_blank} on the Polkadot Wiki
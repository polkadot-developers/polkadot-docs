---
title: Coretime
description: Learn about the role of the Coretime system parachain, which facilitates the sale, purchase, assignment, and mechanisms of bulk coretime.
---

## Introduction

The Coretime system chain facilitates the allocation, procurement, sale, and scheduling of bulk [coretime](../../glossary.md#coretime), enabling tasks (such as [parachains](../../glossary.md#parachain)) to utilize the computation and security provided by Polkadot. 

The [Broker pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=_blank}, along with [Cross Consensus Messaging (XCM)](todo:addlink), enables this functionality to be delegated to the system chain, rather than on the relay chain. Using XCMP's Upward Message Passing (UMP) to the relay chain allows for core assignments to take place for a task registered on the relay chain.

The specification for the Coretime system chain, along with Coretime as a concept, can be found in the Fellowship RFC: [RFC-1: Agile Coretime](https://github.com/polkadot-fellows/RFCs/blob/main/text/0001-agile-coretime.md){target=_blank}. 

Besides core management, its responsibilities include: 

- The number of cores that should be made available
- Which tasks should be running on which cores and in what ratios
- Accounting information for the on-demand pool

From the relay chain, it expects the following via Downward Message Passing (DMP):

- The number of cores available to be scheduled
- Account information on on-demand scheduling

The details for this interface can be found in [RFC-5: Coretime Interface](https://github.com/polkadot-fellows/RFCs/blob/main/text/0005-coretime-interface.md){target=_blank}.

## Bulk Coretime Assignment

The Coretime chain allocates coretime before its usage. It also manages the ownership of a core. As cores are made up of regions (by default, one core is a single region), a region is recognized as a non-fungible asset. The Coretime chain exposes Regions over XCM as an NFT. Users can transfer individual regions, partition, interlace, or allocate them to a task. Regions describe how a task may use a core.

!!!info "One core can contain more than one region."
 A core can be considered a logical representation of an active validator set on the relay chain, where these validators commit to verifying the state changes for a particular task running on that region. With partitioning, having more than one region per core is possible, allowing for different computational schemes. Therefore, running more than one task on a single core is possible.

<!-- TODO: Some sort of diagram of this would be pretty helpful, maybe -->

### Assigning Region

Regions can be assigned to a task on the relay chain, such as a parachain/rollup. 

### Transferring Regions

Regions may be transferred on the Coretime chain, upon which the [`transfer`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/dispatchables/fn.transfer.html){target=_blank} [dispatchable](../../glossary.md#dispatchable) in the Broker pallet would assign a new owner to that specific region.

### Partitioning Regions

Regions may be partitioned into two non-overlapping subregions within the same core. A partition involves specifying a *pivot*, wherein the new region will be defined and available for use.

### Interlacing Regions

Interlacing a region adds the ability to have alternative-compute strategies for a core. Whereas partitioned regions are non-overlappable, interlaced regions overlap because multiple tasks may utilize a single core alternatingly.

## On Demand Coretime

At this writing, on-demand coretime is currently deployed on the relay chain and will eventually be deployed to the coretime chain. On-demand coretime allows parachains (previously known as parathreads) to utilize available cores per block.

## Coretime Sales

The coretime chain also handles Coretime sales, details of which can be found on the Polkadot Wiki: [Agile Coretime: Coretime Sales](https://wiki.polkadot.network/docs/learn-agile-coretime#coretime-sales).

## What's Next?

- Learn about [Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime#coretime-sales){target=_blank} on the Polkadot Wiki
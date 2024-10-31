---
title: Coretime
description: Learn about the role of the Coretime system parachain, which facilitates the sale, purchase, assignment, and mechanisms of bulk coretime.
---

## Introduction

The Coretime system chain facilitates the allocation, procurement, sale, and scheduling of bulk [coretime](../../glossary.md#coretime), enabling tasks (such as parachains) to utilize the computation and security that Polkadot provides. 

The [Broker pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=_blank}, which along with [Cross Consensus Messaging (XCM)](todo:addlink), are used extensively to enable this functionality to be delegated to the system chain. The usage of XCM's upwards message passing (UMP) to the relay chain allows for core assignments to take place for a task which is registered on relay chain, utilizing the security that the relay chain provides.

The specification for the Coretime system chain, along with Coretime as a concept, can be found in the Fellowship RFC: [RFC-1: Agile Coretime](https://github.com/polkadot-fellows/RFCs/blob/main/text/0001-agile-coretime.md){target=_blank}. 

Besides core management, its responsibilities include: 

- The number of cores which should be made available
- Which tasks should be running on which cores and in what ratios
- Accounting information for the on-demand pool

From the relay chain, it expects the following via downwards message passing (DMP):

- The number of cores available to be scheduled
- Account information on on-demand scheduling

The details for this interface can be found in [RFC-5: Coretime Interface](https://github.com/polkadot-fellows/RFCs/blob/main/text/0005-coretime-interface.md){target=_blank}.

## Bulk Coretime Assignment

Bulk coretime is allocated in advance of its usage, wherein the ownership of a core is managed by the Coretime system chain. As cores are made up of region (by default, one core is a single region), a region is recognized as a non-fungible asset. Regions are exposed over XCM as an NFT - allowing for individual regions to be transferred, allocation to a task, or to be utilized in the on-demand pool.Regions, in turn, describe how a task may use a core.

!!!info "One core can contain more than one region"
    A core can be thought of as a logical representation of an active validator set on the relay chain, where these validators are committing to verifying the state changes for a particular task running on that region. As cores can be partitioned, it is possible to have more than one region per core, allowing for different computational models to be utilized. Therefore, it is possible to run more than one task on a single core, provided it is managed correctly.

<!-- TODO: Some sort of diagram of this would be pretty helpful, maybe -->

### Assigning Region

Regions can be assigned to a task on the relay chain, such as a parachain/rollup. 

### Transferring Regions

Regions may be transferred on the Coretime chain, upon which the [`transfer`](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/dispatchables/fn.transfer.html){target=_blank} [dispatchable](../../glossary.md#dispatchable) in the Broker pallet would assign a new owner to that specific region.

### Partitioning Regions

Regions may be partitioned into two, non-overlapping subregions within the same core. A partition involves specifying a *pivot*, wherein the new region will be defined and available for use.

### Interlacing Regions

Interlacing a region adds the ability to have alternative-compute strategies for a core. Whereas partitioned regions are non-overlappable, interlaced regions overlap in the sense that multiple tasks may utilize a single core in an alternating fashion.

## On Demand Coretime

At the time of this writing, on demand coretime is currently deployed on the relay chain, and will be deployed to the Coretime chain eventually. On demand coretime allows on-demand parachains (previously known as parathreads) to utilize available cores on a per-block basis.

## Coretime Sales

The coretime chain also handles Coretime sales, details of which can be found on the Polkadot Wiki: [Agile Coretime: Coretime Sales](https://wiki.polkadot.network/docs/learn-agile-coretime#coretime-sales).

## What's Next?

- Learn about [Agile Coretime](https://wiki.polkadot.network/docs/learn-agile-coretime#coretime-sales){target=_blank} on the Polkadot Wiki
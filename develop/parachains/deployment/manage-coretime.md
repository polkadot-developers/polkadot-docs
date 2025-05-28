---
title: Manage Coretime
description: Learn to manage bulk coretime regions through transfer, partition, interlace, assign, and pool operations for optimal resource allocation.
---

# Manage Coretime

## Introduction

Coretime management involves manipulating [bulk coretime](/develop/parachains/deployment/obtain-coretime/#bulk-coretime){target=\_blank} regions to optimize resource allocation and usage. Regions represent allocated computational resources on cores and can be modified through various operations to meet different project requirements. This guide covers the essential operations for managing your coretime regions effectively.

## Transfer

[Transfer](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.transfer){target=\_blank} ownership of a bulk coretime region to a new owner. This operation allows you to change who controls and manages a specific region. 

Use this operation when you need to delegate control of computational resources to another account or when selling regions to other parties.

```rust
pub fn transfer<T: Config>(region_id: RegionId, new_owner: T::AccountId)
```

**Parameters:**

- **`origin`**: Must be a signed origin of the account which owns the region `region_id`.
- **`region_id`**: The region whose ownership should change.
- **`new_owner`**: The new owner for the region.

## Partition

Split a bulk coretime region into two non-overlapping regions at a specific time point. This operation divides a region temporally, creating two shorter regions that together span the same duration as the original.

The [partition](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.partition){target=\_blank} operation removes the original region and creates two new regions with the same owner and core mask. The first new region spans from the original start time to the pivot point, while the second spans from the pivot point to the original end time.

This is useful when you want to use part of your allocated time immediately and reserve the remainder for later use or when you want to sell or transfer only a portion of your time allocation.

```rust
pub fn partition<T: Config>(region_id: RegionId, pivot: Timeslice)
```

**Parameters:**

- **`origin`**: Must be a signed origin of the account which owns the region `region_id`.
- **`region_id`**: The region which should be partitioned into two non-overlapping regions.
- **`pivot`**: The offset in time into the region at which to make the split.

## Interlace

Split a bulk coretime region into two wholly-overlapping regions with complementary interlace masks. This operation allows core sharing by dividing computational resources between two projects that run simultaneously.

The [interlace](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.interlace){target=\_blank} operation removes the original region and creates two new regions with the same time span and owner. One region receives the specified core mask, while the other receives the XOR of the specified mask and the original region's core mask.

Use interlacing when you want to share core resources between multiple tasks or when you need to optimize resource utilization by running complementary workloads simultaneously.

```rust
pub fn interlace<T: Config>(region_id: RegionId, pivot: CoreMask)
```

Parameters:

- **`origin`**: Must be a signed origin of the account which owns the region `region_id`.
- **`region_id`**: The region which should become two interlaced regions of incomplete regularity.
- **`pivot`**: The interlace mask of one of the two new regions (the other is its partial complement).

## Assign

[Assign](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.assign){target=\_blank} a bulk coretime region to a specific task for execution.

This operation places an item in the work plan corresponding to the region's properties and assigns it to the target task. If the region's end time has already passed, the operation becomes a no-op. If the region's beginning has passed, it effectively starts from the next schedulable timeslice.

Use this operation to execute your tasks on the allocated cores. Choose a final assignment when you're certain about the task allocation or provisional when you might need flexibility for later changes.

```rust
pub fn assign<T: Config>(region_id: RegionId, task: TaskId, finality: Finality)
```

**Parameters:**

- **`origin`**: Must be a signed origin of the account which owns the region `region_id`.
- **`region_id`**: The region which should be assigned to the task.
- **`task`**: The task to assign.
- **`finality`**: Indication of whether this assignment is final or provisional.

## Pool

Place a bulk coretime region into the instantaneous coretime pool to earn revenue from unused computational resources.

The [pool](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/pallet/struct.Pallet.html#method.pool){target=\_blank} operation places the region in the workplan and assigns it to the instantaneous coretime pool. The region details are recorded to calculate a pro rata share of the instantaneous coretime sales revenue relative to other pool providers.

Use pooling when you have unused coretime that you want to monetize, or when you want to contribute to the network's available computational resources while earning passive income.

```rust
pub fn pool<T: Config>(region_id: RegionId, payee: T::AccountId, finality: Finality)
```

**Parameters:**

- **`origin`**: Must be a signed origin of the account which owns the region `region_id`.
- **`region_id`**: The region which should be assigned to the pool.
- **`payee`**: The account which can collect revenue from the usage of this region.
- **`finality`**: Indication of whether this pool assignment is final or provisional.
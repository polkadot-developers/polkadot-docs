---
title: Bulletin Chain Renewal
description: The retention lifecycle for data on the Bulletin Chain — default window, what happens at expiration, and the mechanics of renewing data before it falls off.
categories: Apps, Reference
---

# Renewal

## Introduction

Data on the Bulletin Chain has a bounded retention window. The chain doesn't promise to keep bytes forever; it promises to keep them for a default period (about two weeks), after which the storage record expires and the bytes can be evicted from the collator network unless the record is renewed.

This page documents the renewal lifecycle: what counts as "alive," what happens at expiration, what a Product has to do to keep data alive, and what costs renewal incurs.

## The Default Retention Window

When a Product writes to Bulletin, the resulting storage record carries an expiration block — by default, approximately two weeks of blocks from the write. Between the write and the expiration block:

- **The data is _alive_**: Any reader with the CID can fetch the bytes from the collator network.
- **The chain enforces availability**: The on-chain record exists, and collators serving the network are expected to hold the bytes.

After the expiration block:

- The on-chain record is no longer "active." Fetches against the CID may continue to succeed for a window depending on collator caching, but the chain no longer guarantees the bytes are reachable.
- Eventually, collators evict the bytes. The CID still exists as a content reference, but the network can no longer serve it.

## What Renewal Does

A _renewal_ is a separate transaction, submitted to the `DataRenewal` pallet, that keeps a storage record alive for another retention window. Renewal comes in three forms:

- **One-time renewal (`renew`)**: Registered ahead of time. When the current window ends, the chain stores the data again for another full window.
- **Immediate renewal (`force_renew`)**: Stores the data again right away. The new window starts from the current block.
- **Auto-renewal (`enable_auto_renew`)**: Renews the data at the end of every window, until the account's authorization can no longer cover a renewal.

A renewal identifies the data by its content hash, which is the multihash digest of its CID, or by its position (block number and index). Each renewal stores the data at a new position, so a position stops resolving once the data is renewed, while the content hash always resolves to the most recent one.

A chunked upload is several storage records: one per chunk, plus the manifest. Each record has its own window, so keeping a chunked file available means renewing the manifest and every chunk.

Renewal does not change the CID — readers continue to use the same hash they had before. A Product that has published a CID externally (in another statement, embedded in a `.dot` site, referenced by another pallet) does not have to update those references when it renews.

## What Renewal Costs

Renewal draws on the renewing account's [authorization](/reference/apps/infrastructure/bulletin-chain/authorization/): each renewal uses one transaction and counts the size of the data against the account's byte allowance. One-time and immediate renewals are charged when you submit them; auto-renewal prepays the first renewal and charges each later one when it takes effect.

Unlike a store, a renewal is rejected when the bytes it would add exceed the account's remaining byte allowance (`PERMANENT_ALLOWANCE_EXCEEDED`). The chain also caps the total size of renewed data across all accounts (`CHAIN_PERMANENT_CAP_REACHED`). If an auto-renewal cannot be paid, its registration is dropped and the data expires.

For long-lived content (a profile photo, a published article, an app bundle), a Product should:

- Budget for periodic renewals, in both transactions and bytes, as part of the account's quota planning.
- Register renewals before the expiration block, not at it, because submission, inclusion, and finalization take time. For auto-renewal, keep the account's authorization active, because each later renewal is charged to it.

## What Happens to Forgotten Data

If a Product (or its operator) forgets to renew, the data eventually becomes unreachable. There is no manual recovery: once collators have evicted the bytes, only re-uploading the same payload from outside the chain restores availability. The CID will be the same (because the bytes are the same), but a new upload is a fresh transaction against a fresh authorization slot.

!!! warning "Provisional"
    The exact default retention window and the renewal grace period (if any) between expiration and eviction are still being finalized. The conceptual lifecycle above is stable.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Authorization**

    ---

    The quota model that renewals consume — why a renewal needs a live authorization the same way a fresh upload does.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/authorization/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to that covers the renewal call alongside the basic store and retrieve flow.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)
</div>

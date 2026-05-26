---
title: Bulletin Chain Renewal
description: The retention lifecycle for data stored on the Bulletin Chain — default window, what happens at expiration, and the mechanics of renewing data before it falls off.
categories: Apps, Reference
---

# Renewal

## Introduction

Data on the Bulletin Chain has a **bounded retention window**. The chain doesn't promise to keep bytes forever; it promises to keep them for a default period (about two weeks), after which the storage record expires and the bytes can be evicted from the collator network unless the record is **renewed**.

This page documents the renewal lifecycle: what counts as "alive," what happens at expiration, what a Product has to do to keep data alive, and what costs renewal incurs.

## The Default Retention Window

When a Product writes to Bulletin, the resulting storage record carries an expiration block — by default, approximately two weeks of blocks from the write. Between the write and the expiration block:

- The data is **alive**: any reader with the CID can fetch the bytes from the collator network.
- The chain enforces availability: the on-chain record exists, and collators serving the network are expected to hold the bytes.

After the expiration block:

- The on-chain record is no longer "active." Fetches against the CID may continue to succeed for a window depending on collator caching, but the chain no longer guarantees the bytes are reachable.
- Eventually, collators evict the bytes. The CID still exists as a content reference, but the network can no longer serve it.

## What Renewal Does

A **renewal** is a separate transaction (signed and submitted like any other) that extends the expiration block of an existing storage record. The data itself doesn't move — what changes is the record's expiration. After renewal:

- The on-chain record's expiration is pushed forward by another default window.
- Collators continue to hold and serve the bytes.

Renewal does not change the CID — readers continue to use the same hash they had before. A Product that has published a CID externally (in another statement, embedded in a `.dot` site, referenced by another pallet) does not have to update those references when it renews.

## What Renewal Costs

Renewal consumes a transaction from the renewing account's [authorization](/reference/apps/infrastructure/bulletin-chain/authorization/){target=\_blank} quota — same as the original upload would. Bytes are *not* counted again (you are not re-uploading content), so the byte counter doesn't decrement, but each renewal call consumes one transaction.

For long-lived content (a profile photo, a published article, an app bundle), a Product should:

- **Budget for periodic renewals** as part of the account's quota planning.
- **Schedule renewals before the expiration block**, not at it — submission, inclusion, and finalization take time, and an authorization that itself expires on the same block prevents the renewal from going through.

## What Happens to Forgotten Data

If a Product (or its operator) forgets to renew, the data eventually becomes unreachable. There is no manual recovery: once collators have evicted the bytes, only re-uploading the same payload from outside the chain restores availability. The CID will be the same (because the bytes are the same), but a new upload is a fresh transaction against a fresh authorization slot.

!!! warning "Provisional"
    The exact default retention window, the renewal grace period (if any) between expiration and eviction, and any batch-renewal primitives for renewing many CIDs in a single transaction are still being finalized. The conceptual lifecycle above is stable.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Authorization**

    ---

    The quota model that renewals consume — why a renewal needs a live authorization just like a fresh upload does.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/authorization/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to that covers the renewal call alongside the basic store and retrieve flow.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/){target=\_blank}

</div>

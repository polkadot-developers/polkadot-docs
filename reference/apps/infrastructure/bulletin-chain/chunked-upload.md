---
title: Chunked Uploads on the Bulletin Chain
description: How payloads larger than the per-transaction byte limit are uploaded as chunks under a DAG-PB manifest, transparently to the Product.
categories: Apps, Reference
---

# Chunked Uploads

## Introduction

Every Bulletin Chain storage extrinsic carries a hard per-transaction byte limit. A payload smaller than the limit goes in a single transaction. A payload larger than the limit is **chunked**: the SDK splits the bytes into chunks, uploads each chunk in its own transaction, and writes a small **DAG-PB manifest** describing how the chunks reassemble. The CID returned for a chunked upload is the CID of the manifest, not of any individual chunk; readers fetching that CID get the manifest, follow it to the chunk CIDs, and reassemble the original payload.

For most Products, this is transparent — `app.bulletin.upload(bytes)` accepts a payload of any size up to the SDK's supported maximum, and the chunking pipeline runs underneath. This page documents what the pipeline does and what trade-offs it surfaces.

## What Happens Under the Hood

The SDK's chunking pipeline runs roughly this sequence:

1. **Split** the payload into fixed-size chunks (the chunk size is the SDK default, sized to fit comfortably under the per-transaction byte limit).
2. **Upload each chunk** in its own extrinsic, accumulating CIDs as the chain returns them.
3. **Build a DAG-PB manifest** — a small object that lists the chunk CIDs in order, encoded in the DAG-PB format that IPFS-style readers recognize.
4. **Upload the manifest itself** as a final small transaction.
5. **Return the manifest CID** to the Product.

Readers retrieving the manifest CID get back the manifest first, then issue parallel fetches for each chunk CID and reassemble. Because both the chunks and the manifest are content-addressed, readers can verify each piece independently.

## What This Costs

Chunked uploads cost more than single-transaction uploads because each chunk consumes one transaction from the [authorization](/reference/apps/infrastructure/bulletin-chain/authorization/) quota. A Product uploading large payloads on behalf of many users should budget transaction quota accordingly — running out of transactions even with plenty of bytes remaining is a realistic failure mode.

The manifest itself counts as one additional transaction on top of the chunk count.

!!! warning "Provisional"
    The exact chunk size used by the SDK, the maximum supported payload size, the per-transaction byte limit on the current chain build, and any tunables exposed for advanced flows are still being finalized. The conceptual pipeline above is stable; per-value specifics will be added once confirmed.

## What a Product Sees

A Product calling `app.bulletin.upload(bytes)` sees the same shape regardless of whether chunking ran underneath:

- The call returns a CID.
- The call decremented the account's authorization quota by the appropriate amount (1 + chunk count for a chunked upload, 1 for a single-transaction upload).
- A subsequent `app.bulletin.fetch(cid)` retrieves the original payload.

The chunking is an implementation detail of the upload pipeline, not part of the surface a Product needs to manage. For Products that want explicit control (custom chunk size, parallelism limits, progress reporting on large uploads), the [Store Data on Chain](/apps/build/store-data-on-chain/){target=\_blank} guide covers the lower-level `BulletinClient` and the chunk-level controls it exposes.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Authorization**

    ---

    The quota model that chunked uploads consume — why transaction count, not just byte count, matters when uploading large files.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/authorization/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to: small writes, larger files with chunking, and the lower-level `BulletinClient` surface for advanced control.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/){target=\_blank}

</div>

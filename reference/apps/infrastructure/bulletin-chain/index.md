---
title: Bulletin Chain Reference
description: Reference for the Bulletin Chain — Polkadot's decentralized, content-addressed storage layer for Products, with authorization, chunked uploads, and renewal.
categories: Apps, Reference
---

# Bulletin Chain

## Introduction

The Bulletin Chain is Polkadot's decentralized cloud storage layer for Products. Your Product's files and content live there, addressed by their hash so anyone can verify what they fetched. A Product writes data; the chain returns a [Content Identifier (CID)](/reference/glossary/#content-identifier-cid), which is a Blake2b-256 hash of the bytes, and anyone with that CID can fetch the data back peer-to-peer from the network.

If you have used IPFS, the mental model is the same: content addressed by hash, retrieved without a central host. The difference is that storage records and authorizations live natively on Polkadot.

Four properties define how a Product interacts with Bulletin:

- **Content-addressed by design**: The CID is the hash of the bytes; two users uploading identical bytes produce the same CID. Readers verify they got the bytes they expected without trusting the host that served them.
- **Permissionless reads**: Anyone with the CID can fetch from the network — no URL signing, no read auth, no CDN to configure. Privacy through encryption is the Product's responsibility (encrypt before storing if the payload is sensitive).
- **Explicit authorization for writes**: Bulletin Chain has no token balance for storage. Every account needs an [authorization](/reference/apps/infrastructure/bulletin-chain/authorization/) — a quota of transactions and bytes — before it can store anything.
- **Time-bound retention with renewal**: Data is retained for a default window (about two weeks); [renewal](/reference/apps/infrastructure/bulletin-chain/renewal/) keeps it alive past expiration; without renewal it falls off.

## Architecture

!!! warning "Provisional"
    The full architecture diagram — the relationship between the on-chain storage records, the collator network that serves CIDs to readers, and the cross-chain delivery path from People Chain — is still being finalized. Per-layer specifics will be added once they are confirmed.

At a high level, two layers cooperate:

- The on-chain Bulletin Chain holds the _records_ — the CIDs, who is authorized to store, when each item expires. This is where writes are gated and where the authorization model is enforced. See [Authorization](/reference/apps/infrastructure/bulletin-chain/authorization/).
- The collator-served content network holds the _bytes_. Readers fetch by CID over the peer-to-peer layer; the chain holds the commitment that the bytes existed and the CID was valid at write time, the collator network actually delivers them.

This split is what makes Bulletin practical at content sizes that would not fit on a typical blockchain's storage: the chain's job is to bound _what counts as authorized storage_, not to physically hold every byte.

## When to Use Bulletin

Bulletin is the right layer for content that needs to outlive a session and be fetched later by hash. Profile photos, published articles, app bundles, encrypted message content for chat — anything where the readers are not all present at the same moment and the bytes have to be there later, by hash.

For the storage-layer comparison (Bulletin vs Statement Store vs local `KvStore`) see [Storage options for your Product](/apps/build/store-data-on-chain/), and for the Product-side how-to use [Store Data on Chain](/apps/build/store-data-on-chain/).

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Authorization**

    ---

    The model that gates writes: no token balance, an explicit per-account authorization with a transaction-and-byte quota and an expiration block.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/authorization/)

- <span class="badge learn">Learn</span> **Chunked Uploads**

    ---

    How a payload larger than the per-transaction limit is uploaded as chunks under a DAG-PB manifest, transparently to the Product.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/chunked-upload/)

- <span class="badge learn">Learn</span> **Renewal**

    ---

    The retention lifecycle and the mechanics of renewing data before it falls off the network.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/renewal/)

- <span class="badge learn">Learn</span> **Cross-Chain**

    ---

    How a write initiated from the People Chain (where a Product's PoP identity lives) reaches the Bulletin Chain via XCM.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/cross-chain/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to: setting up the storage client, the Hello World write, retrieval, larger files, renewal.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)
</div>

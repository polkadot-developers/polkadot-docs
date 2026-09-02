---
title: Cloud Storage
description: Overview of the Product SDK cloud-storage package — upload and retrieve content-addressed data by CID on the Polkadot Bulletin Chain.
categories: Apps
---

# Cloud Storage

## Introduction

[`@parity/product-sdk-cloud-storage`](https://paritytech.github.io/product-sdk/api/cloud-storage/) stores content-addressed data on the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/). You upload bytes and get back a CID; you fetch by CID from anywhere inside a Host. It handles chunking, DAG-PB manifests, and CID calculation for you, and adds network presets, container-only read helpers, and an authorization pre-flight.

Reach for it when your Product needs content that outlives a session and is addressable by anyone who has the CID: profile photos, published posts, file uploads, or full snapshots of app state.

## When to Use It

- To store bytes or files on chain and receive a CID plus a block receipt (`store(data).send()`).
- To fetch content by CID inside a Host, with automatic reassembly of chunked uploads (`fetchBytes`, `fetchJson`).
- To check an account's storage quota before uploading, so a missing allowance becomes an actionable error rather than a bare on-chain rejection (`checkAuthorization`).
- Reads are Host-only; there is no public gateway fallback. To confirm a CID landed on chain without fetching the bytes, use `verifyStored`.

## Core Concepts

- **`CloudStorageClient`**: The main class. Create it with `CloudStorageClient.create({ environment, signer })`, then call `store`, `fetchBytes`, and `fetchJson`.
- **Content addressing**: Uploads are identified by a CID (CIDv1) derived from their content, not by a path or key. The same bytes always produce the same CID.
- **`store(data)` builder**: A fluent builder ending in `.send()`, which resolves with a `StoreResult`. Only `size` is always present; `cid`, `blockNumber`, and `extrinsicIndex` are optional. Large payloads are chunked automatically.
- **Read helpers return a `Result`**: `fetchBytes` and `fetchJson` return a `Result` (check `.ok`); DAG-PB chunked content is reassembled for you unless you opt out.
- **Authorization pre-flight**: `checkAuthorization` returns an `AuthorizationStatus` with the remaining transactions, bytes, and expiration, and never throws. Uploading requires an [authorization](/apps/get-started/get-testnet-tokens/) on the account.
- **`createLazySigner(getSigner)`**: A signer wrapper that resolves the underlying signer on each call, so you can build the client before an account is selected.

## Store and Fetch by CID

Create a client with a lazy signer, upload bytes, and fetch them back by CID:

```typescript
import {
  CloudStorageClient,
  createLazySigner,
} from '@parity/product-sdk-cloud-storage';

const client = await CloudStorageClient.create({
  environment: 'paseo',
  signer: createLazySigner(() => manager.getSigner()),
});

const stored = await client.store(bytes).send();
console.log(stored.cid, stored.blockNumber, stored.size);

const fetched = await client.fetchBytes(stored.cid);
if (fetched.ok) {
  console.log(new TextDecoder().decode(fetched.value));
}
```

## Check the Quota Before Uploading

Confirm the account is authorized and has room before you submit an upload:

```typescript
import { checkAuthorization } from '@parity/product-sdk-cloud-storage';

const status = await checkAuthorization(api, address);
if (!status.ok) {
  console.error(status.error.message);
} else if (!status.value.authorized) {
  // The account has no storage authorization yet.
} else if (status.value.remainingBytes < BigInt(bytes.length)) {
  // The upload exceeds the remaining quota.
}
```

## Limitations

- Reads run inside a Host only; outside a container, `fetchBytes` returns a `CloudStorageHostUnavailableError`.
- Uploading requires a signer and an on-chain storage authorization for the account.
- `authorizeAccount` is additive and is deliberately not retried; verify the result with `checkAuthorization` before retrying yourself.
- `verifyStored` needs a known block; it does not scan the whole chain.
- A chunked upload (large files) returns no `blockNumber` or `extrinsicIndex` — the `(block, index)` pair [renewal](/apps/deploy-your-app/#keep-your-app-available) needs. Capture that pair from a single, unchunked store, or track renewal for large data another way.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The task-focused recipe: upload to the Bulletin Chain and fetch by CID, with chunking and authorization.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

-   <span class="badge learn">Learn</span> **Statement Store**

    ---

    Pair durable storage with real-time signaling: announce a fresh CID to other users as it changes.

    [:octicons-arrow-right-24: Statement Store](/apps/product-sdk/statement-store/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `cloud-storage` surface: `CloudStorageClient`, CID helpers, and authorization.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/cloud-storage/)

</div>

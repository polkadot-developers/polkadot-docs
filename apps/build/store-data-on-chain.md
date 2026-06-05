---
title: Store Data on Chain
description: Store and retrieve data on the Bulletin Chain from your Polkadot Product — Hello World, larger files, renewal, cross-chain via People Chain, and preimage-authorized uploads.
categories: Basics, Apps
---

# Store Data on Chain

## Prerequisites

- Completed [Install and Pair](/apps/set-up/install-and-pair/){target=\_blank}, [Verify Your Identity](/apps/set-up/verify-your-identity/){target=\_blank}, and [Get TestNet Funds](/apps/set-up/get-testnet-funds/){target=\_blank} — your account has PAS funds **and** a Bulletin Chain authorization.
- A Hello World Product scaffolded — see [Start a Local Dev Loop](/apps/build/start-a-local-dev-loop/){target=\_blank} if you don't have one yet.

## Introduction

The Bulletin Chain is Polkadot's decentralized, content-addressed storage layer for Products. You write data, the chain returns a Content Identifier (CID — a Blake2b-256 hash of the bytes), and anyone with that CID can fetch the data back from the network. If you've used IPFS, this is the same mental model — content addressed by hash, retrieved peer-to-peer; the difference is that the storage records and authorizations live natively on Polkadot. Data is retained for about two weeks by default; renewing keeps it alive, and without renewal it falls off.

Why a Polkadot Product would pick this over a centralized cloud bucket:

- **No vendor account or infrastructure to provision.** Your Product writes through the chain client it already uses — there's no AWS account, no bucket policies, and no presigned URLs to issue.
- **Content-addressed by design.** The CID is a hash of the bytes, so readers verify what they got matches what was stored without having to trust the host. Two users uploading the same file produce the same CID, which means deduplication is automatic.
- **Permissionless reads.** Anyone with the CID can fetch. There's no URL signing, no read auth, and no CDN to configure. Privacy via encryption is your responsibility — encrypt before storing if the payload is sensitive.
- **Composable with on-chain identity.** A CID can be referenced from the People Chain, attached to a Statement, pointed at by a `.dot` name, or read by any pallet. The data shares a trust boundary with your Product's accounts and authorizations.

There are no token balances on the Bulletin Chain itself; access is gated by an explicit storage authorization (covered in [Get TestNet Funds](/apps/set-up/get-testnet-funds/){target=\_blank}).

!!! info "Storage options for your Product"
    The Bulletin Chain is the right layer for content that needs to outlive a session and be fetched later by hash. For other shapes of data, reach for a different layer:

    - **Local KvStore** — per-Product, per-device key-value. User preferences, drafts, cached values. Not synced across devices. See [Persist Data Locally](/apps/build/persist-data-locally/){target=\_blank}.
    - **Bulletin Chain** (this page) — content-addressed, on-chain, retained ~2 weeks by default and renewable. Content readers fetch later by hash — profile photos, published articles, app bundles.
    - **Statement Store** — gossip-distributed, short-lived (default 30s TTL), allowance-gated. Real-time signaling between users — chat messages, presence, typing indicators, multiplayer state. See [Exchange Ephemeral Messages](/apps/build/exchange-ephemeral-messages/){target=\_blank}.

This page covers five flows, in order of complexity:

- A small Hello World store + retrieve.
- A larger file (any binary asset under the per-transaction limit).
- Long-lived data with renewal.
- Cross-chain storage initiated from the People Chain (where your PoP identity lives) via XCM.
- Submitting a Preimage through Polkadot Desktop.

By the end you will have stored data on the Bulletin Chain, retrieved it, renewed it, and understand how to dispatch the cross-chain and Preimage paths — the building blocks for any Product that publishes content on Polkadot.

!!! note "Network"
    The flows on this page target **Paseo Next**, the default environment in Polkadot Desktop development builds. If you switched environments during set-up, see [Choose a Network](/apps/set-up/choose-a-network/){target=\_blank} for the corresponding endpoints.

All flows in this guide use [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank}, the canonical Polkadot Product SDK. Bulletin Chain operations come through `CloudStorageClient` from [`@parity/product-sdk-cloud-storage`](https://www.npmjs.com/package/@parity/product-sdk-cloud-storage){target=\_blank} (re-exported by the umbrella), which wraps the lower-level `@parity/bulletin-sdk` with built-in chunking, DAG-PB manifests, authorization helpers, and a bundled chain descriptor. The SDK is pre-1.0 — minor API changes are expected during the `0.x` line.

## Set Up Your Storage Client

Every snippet in this guide is **Product code** — modules you place inside the Product running at `localhost:3000` (per [Start a Local Dev Loop](/apps/build/start-a-local-dev-loop/){target=\_blank}), loaded by Polkadot Desktop. Run nothing from a terminal; the snippets execute in the browser context Polkadot Desktop's localhost bypass loads them into. The signer for every Bulletin transaction comes from the Host (your paired account in Polkadot Desktop) — your Product never derives keys.

1. Install the SDK in your Product's project:

    ```bash
    npm install @parity/product-sdk
    ```

    The umbrella package brings in `@parity/product-sdk-cloud-storage` (where `CloudStorageClient` lives, used later for advanced operations), `@parity/product-sdk-host` (the Preimage manager used later), and `polkadot-api` itself.

2. Create the SDK app and connect the wallet:

    ```typescript title="setup-app.ts"
    --8<-- "code/apps/build/store-data-on-chain/setup-app.ts"
    ```

    `createApp({ name })` returns an `App` with `app.wallet`, `app.storage`, `app.chain`, and `app.cloudStorage` — the high-level Bulletin Chain API exposing `upload()`, `fetch()`, and `computeCid()`. The exported `app` is reused across the simple sections that follow.

## Store a Hello World

The simplest write: a short string, one line.

```typescript title="hello-bulletin.ts"
--8<-- "code/apps/build/store-data-on-chain/hello-bulletin.ts"
```

`app.cloudStorage.upload(data)` accepts a string or `Uint8Array`, signs the underlying transaction with your paired account, and resolves with the **CID** — a Blake2b-256 content hash encoded as a CIDv1 string. Internally the SDK uses the chunking pipeline with a DAG-PB manifest, so the same call shape works for any payload size; see [Store a Larger File](#store-a-larger-file) for the chunk-level controls.

You should see something like:

```text
CID: bafk2bzacea6wlxyalo6gbajlwuubv7w5dvss3vmfqmavlqy63e4vypth2ov6u
```

## Retrieve Your Data

The Bulletin Chain follows a "write-to-chain, read-from-network" model: the chain holds the storage commitment, the data itself lives at collator nodes addressable by CID. **Reading is permissionless** — no authorization, no fees, no signature. `app.cloudStorage.fetch(cid)` routes through the Host's preimage subscription with caching:

```typescript title="retrieve-data.ts"
--8<-- "code/apps/build/store-data-on-chain/retrieve-data.ts"
```

The snippet verifies the bytes by recomputing their CID with `app.cloudStorage.computeCid(bytes)` and comparing to the CID you asked for. If the host returned the wrong bytes, the recomputed CID won't match — that's the integrity property content addressing gives you.

For libp2p / Helia / Smoldot retrieval paths (when you want to fetch outside a Polkadot Desktop container), see [Retrieve Your Data](/chain-interactions/store-data/bulletin-chain/#retrieve-your-data){target=\_blank} in the canonical tutorial.

## Store a Larger File

`app.cloudStorage.upload()` chunks transparently above a 2 MiB threshold and stores a DAG-PB manifest that references each chunk's CID, returning the manifest CID. For most Products that's all you need — pass any `Uint8Array` to `upload()` and the SDK handles chunking, manifest generation, and the underlying transactions for you.

For finer control — custom chunk size, per-chunk progress callbacks, or access to the individual chunk CIDs — drop one level lower to `CloudStorageClient` from `@parity/product-sdk-cloud-storage`. This is also the path you use for the next two sections (authorization checks, renewal), so the setup snippet pays off immediately:

```typescript title="setup-client.ts"
--8<-- "code/apps/build/store-data-on-chain/setup-client.ts"
```

`CloudStorageClient.create({ environment: 'paseo', signer })` resolves with `client.store / client.renew / client.checkAuthorization / client.fetchBytes / client.estimateAuthorization` for the high-level operations, plus `client.api` for the typed Bulletin Chain API when you need to drop one level lower still. The exported `client` and `account` are reused by the advanced sections that follow.

The `client.store(...)` builder takes the same chunking pipeline `app.cloudStorage.upload` uses internally, with the controls exposed:

```typescript title="store-large-file.ts"
--8<-- "code/apps/build/store-data-on-chain/store-large-file.ts"
```

The returned `StoreResult.cid` is the manifest CID; `StoreResult.chunks.chunkCids` lists each chunk's individual CID. `withCallback()` receives per-chunk progress events as the upload streams. The Bulletin Chain has a per-transaction byte limit (~8 MiB on TestNet — see [Size Limits](/reference/polkadot-hub/data-storage/#size-limits){target=\_blank}); chunks must stay under that.

**Chunked uploads are not atomic.** Each chunk is a separate transaction, and the manifest is one more on top. If chunk N fails after chunks 0..N-1 have already landed, the earlier chunks remain on chain (and consume your authorization) — there is no rollback. Inspect the `chunkCids` on the thrown error and either resume from the failed chunk or, if the use case demands it, abandon the partial upload.

## Get Authorization

The Bulletin Chain has no token balance for storage — every account needs an explicit authorization that grants a quota of transactions and bytes before it can write. You should already have one from [Get TestNet Funds](/apps/set-up/get-testnet-funds/){target=\_blank}; if not, follow the [Get Authorization](/chain-interactions/store-data/bulletin-chain/#get-authorization){target=\_blank} steps in the canonical tutorial to request your storage quota through the Console UI faucet.

!!! note
    The `authorize_account` extrinsic requires Root origin. You cannot self-authorize programmatically — on Polkadot TestNet, use the Console UI faucet before submitting any `store` extrinsic from your Product.

`CloudStorageClient` (introduced in [Store a Larger File](#store-a-larger-file)) exposes `client.checkAuthorization(address)` as a pre-flight check before submitting a store:

```typescript title="check-authorization.ts"
--8<-- "code/apps/build/store-data-on-chain/check-authorization.ts"
```

The returned `AuthorizationStatus`:

- **`authorized`**: `true` when an authorization record exists for the account.
- **`remainingTransactions`**: number of `store` calls remaining in the quota.
- **`remainingBytes`**: bytes remaining across those calls (`bigint`).
- **`expiration`**: the block at which any unused quota expires.

`client.estimateAuthorization(dataSize)` returns the `{ transactions, bytes }` you would need to authorize a hypothetical payload of `dataSize` bytes — useful before requesting a quota top-up.

## Renew Long-Lived Data

Stored data is retained for roughly two weeks. If your Product needs the data to outlive that window, renew the storage record before it expires.

Renewal needs the `(block, index)` pair from the `Stored` event of the original write — and that's where `app.cloudStorage.upload()` runs out of road. `upload()` returns just the CID string. To get the bookkeeping pair, use `CloudStorageClient.store(...).send()` instead, which returns a full `StoreResult` (`cid`, `blockNumber`, `extrinsicIndex`, `size`). Persist `(blockNumber, extrinsicIndex)` for each record you intend to renew.

As you approach the expiry block (current block + retention period), submit a renewal:

```typescript title="renew-data.ts"
--8<-- "code/apps/build/store-data-on-chain/renew-data.ts"
```

`client.renew(block, index).send()` builds and submits the call, returning a `TransactionReceipt` with `blockHash`, `txHash`, and `blockNumber`. The `Renewed` event carries the **new** `(block, index)` pair — capture it so the next renewal uses the latest values.

The SDK's typed Bulletin API does not currently expose `RetentionPeriod` or the `Utility` pallet directly. If you need to read the retention period from chain state, or batch many renewals atomically via `Utility.batch_all`, generate the full PAPI bulletin descriptor with `npx papi add bulletin -w <RPC>` and submit through `polkadot-api` directly — `@parity/product-sdk-cloud-storage` is intentionally a narrow surface.

!!! warning
    Each renewal generates a **new** `(block, index)` pair. Track the values from the latest `Renewed` event for any subsequent renewal — using the original values after a renewal will fail. The Bulletin Chain pallet does not currently emit retention events ahead of expiry; your Product needs its own scheduler (cron job, queue, or background worker) to renew before the storage expires.

## Cross-Chain Storage from People Chain

PoP-gated identity lives on the People Chain. When a Product needs to attach content to that identity (for example, a PoP-Lite communication identifier or a verified-person attestation), the store has to be initiated on People Chain and dispatched to the Bulletin Chain via XCM.

!!! warning "Provisional"
    The cross-chain path is in flight. The flow described here is the intended shape; XCM message format and authorization model may change before the path is finalized.

The flow has three phases:

1. People Chain authorizes your account against its local `transactionStorage` instance. (Authorization on People Chain is independent of your Bulletin Chain authorization.)
2. Your account submits `transactionStorage.store(data)` on People Chain. The receipt yields a People-Chain-side `(block, index)` pair plus the computed CID.
3. People Chain dispatches an XCM message to the Bulletin Chain that mirrors the storage record. Once XCM execution completes, the data is addressable from the Bulletin Chain's collator network with the same CID — your Product can read it via `client.fetchBytes(cid)` exactly as if you had written directly to Bulletin.

Until the XCM dispatch is wired up, treat this section as the design contract for the path; the hand-rolled cross-chain code samples will be added once the pallet shape stabilizes.

## Submit a Preimage

Bulletin Chain has a second authorization model alongside the per-account quota you've been using. Instead of authorizing your account to store transactions and bytes, a privileged caller (Root on Bulletin, or the People Chain via the cross-chain dispatch covered in [Cross-Chain Storage from People Chain](#cross-chain-storage-from-people-chain)) can pre-authorize a specific **content hash** via the `authorize_preimage` extrinsic. Once that authorization is in place, anyone — including your Product — can submit the matching bytes via an **unsigned transaction**: no fees, no per-account quota debited.

This is the right path when:

- A sponsor (an app, a parachain, or governance) pre-authorizes content for someone else to upload.
- The People Chain → Bulletin XCM flow described in [Cross-Chain Storage from People Chain](#cross-chain-storage-from-people-chain) authorizes a hash on Bulletin, and the actual bytes get submitted by the user's Product.

The Host API exposes the submission side through `getPreimageManager` from `@parity/product-sdk-host` (already installed via the umbrella package in Set Up). Polkadot Desktop mediates the call — the Product never holds a signer for this path because the underlying transaction is unsigned.

```typescript title="submit-preimage.ts"
--8<-- "code/apps/build/store-data-on-chain/submit-preimage.ts"
```

`preimageManager.submit(payload)` resolves with the Blake2b-256 hash of the payload — the same hash format as a Bulletin CID. The submission is rejected if no `authorize_preimage` exists for that hash. Reading is permissionless; subscribe via `preimageManager.lookup(key, callback)`.

!!! warning "Provisional"
    The Bulletin Chain preimage authorization flow is live on TestNet today, but the cross-chain authorization path (People Chain → Bulletin) and production environment endpoints are not yet finalized. The submission has a Host-side timeout (~120s on the current dev build) before it resolves; production timeouts may shift. The `@parity/product-sdk` API surface is pre-1.0 — minor API changes are expected during the `0.x` line.

The mechanics:

- Some upstream caller (Root on Bulletin, or People Chain via XCM) calls `authorize_preimage(contentHash, maxSize)`.
- Your Product calls `preimageManager.submit(payload)`.
- Polkadot Desktop computes the Blake2b-256 hash of the payload; the chain accepts the submission only if a matching authorization exists.
- The bytes are stored on Bulletin Chain via an unsigned transaction — no fees, no per-account quota debited.
- Reading is permissionless: any account can fetch the bytes by hash via `preimageManager.lookup`.
- Retention is roughly two weeks per the standard Bulletin Chain retention window; renewal works the same way as for account-authorized stores.
- Per-transaction byte limit is the same ~8 MiB; larger payloads are split into chunks and authorized as a DAG-PB manifest plus the chunk hashes.

For the underlying pallet surface (`authorize_preimage`, `refresh_preimage_authorization`, `remove_expired_preimage_authorization`), see [Preimage Authorization](/reference/polkadot-hub/data-storage/#preimage-authorization){target=\_blank} in the Data Storage reference.

## Storage Paths at a Glance

The flows in this guide target the same chain but differ in authorization, atomicity, and consumer access. Use this table to pick the right path before writing.

| Path | Authorization | Atomicity | Retention | Use When |
| :---- | :---- | :---- | :---- | :---- |
| Bulletin store (small) | Bulletin authorization | Single tx | ~2 weeks (renewable) | Most Product writes |
| Bulletin store (chunked) | Bulletin authorization | Multi-tx + DAG-PB manifest | ~2 weeks (renewable) | Files larger than 8 MiB |
| Cross-chain via People Chain | People-Chain authorization | XCM (eventually consistent) | ~2 weeks (renewable) | PoP-attached writes |
| Bulletin preimage submission | Pre-authorized hash (no per-account quota, no fees) | Single unsigned tx | ~2 weeks (renewable) | Sponsored uploads; receiving People Chain → Bulletin XCM dispatches |

For deeper comparison and the full pallet reference, see [Data Storage Reference](/reference/polkadot-hub/data-storage/){target=\_blank}.

## Ship It

Once your Product reads and writes data correctly against TestNet, ship it:

1. Bundle and publish: [Publish Your App Bundle](/apps/deploy-and-publish/publish-your-app-bundle/){target=\_blank}.
2. Register a `.dot` name: [Register and Publish](/apps/deploy-and-publish/register-and-publish/){target=\_blank}.
3. Open your live Product: [Open Your App](/apps/deploy-and-publish/open-your-app/){target=\_blank}.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Exchange Ephemeral Messages**

    ---

    For pub/sub semantics rather than durable content addressing, route through the Statement Store.

    [:octicons-arrow-right-24: Get Started](/apps/build/exchange-ephemeral-messages/){target=\_blank}

-   <span class="badge guide">Guide</span> **Read Chain State**

    ---

    Pair Bulletin writes with chain reads via the Host API's PAPI provider.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/){target=\_blank}

</div>

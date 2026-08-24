---
title: Transactions
description: Overview of the Product SDK tx package — submit transactions, follow them to finality, batch calls atomically, and handle a typed error hierarchy.
categories: Apps
---

# Transactions

## Introduction

[`@parity/product-sdk-tx`](https://paritytech.github.io/product-sdk/api/tx/) is the submission layer. It signs and broadcasts an extrinsic, follows it through its lifecycle to block inclusion or finality, and reports every status transition. It also covers the machinery around a submission: atomic batching, dry-run extraction, weight buffering, Asset Hub account mapping, retries, and readable error formatting.

It closes the loop that [Signer](/apps/product-sdk/signer/) and [Chain Client](/apps/product-sdk/chain-client/) open: the signer gives you a `PolkadotSigner`, the chain client gives you the typed API to build a transaction, and this package submits it and tells you what happened.

## When to Use It

- To sign, broadcast, and track a single extrinsic with per-status callbacks (`submitAndWatch`).
- To submit several calls as one atomic batch through the Utility pallet (`batchSubmitAndWatch`).
- For the surrounding steps: dry-run extraction and weight buffering, Asset Hub account mapping for `pallet-revive`, retries with backoff, and dev signers for tests.
- Do not use it to build the transaction object or open connections; that is the typed API from the chain client. To submit a contract call, prefer the higher-level [Contracts](/apps/product-sdk/contracts/) package, which wraps this one.

## Core Concepts

- **`submitAndWatch(tx, signer, options)`**: Signs, broadcasts, and watches through `signing`, `broadcasting`, `in-block`, and `finalized`. It returns a `Result`, resolving expected failures on the error channel rather than throwing.
- **`TxResult` and `TxStatus`**: `TxResult` carries the `txHash`, the `block`, and the emitted `events`. `TxStatus` drives the `onStatus` callback for progress UI.
- **One `Result` to check**: `result.ok` means the transaction was included and its dispatch succeeded. A dispatch that fails on chain is reported on `result.error` as a `TxDispatchError`, not as a successful result — so you branch on `result.ok`, not on a flag inside the value.
- **Typed error hierarchy**: `TxError` is the base, with `TxTimeoutError`, `TxDispatchError` (dispatch failed on chain), `TxValidityError` (rejected before inclusion), `TxSigningRejectedError` (the user declined), `TxBatchError`, and `TxDryRunError`.
- **`batchSubmitAndWatch(calls, api, signer, options)`**: Wraps calls in `Utility.batch_all` by default (or `batch` / `force_batch`) and submits them as one transaction. All calls must target the same chain as the passed API.

## Submit and Track a Transaction

Build a transaction from the typed API, then submit it with a status callback:

```typescript
import { submitAndWatch } from '@parity/product-sdk-tx';
import { Binary } from 'polkadot-api';

const tx = chain.assetHub.tx.System.remark({ remark: Binary.fromText('hello') });

const result = await submitAndWatch(tx, signer, {
  onStatus: (status) => console.log(status.type),
});

if (result.ok) {
  console.log(`Landed in block #${result.value.block.number}`);
} else {
  console.error(result.error.message); // TxError
}
```

## Batch Calls Atomically

Group several calls into one atomic transaction with `batchSubmitAndWatch`. With `batch_all`, either every call succeeds or the whole batch rolls back:

```typescript
import { batchSubmitAndWatch } from '@parity/product-sdk-tx';
import { Binary } from 'polkadot-api';

const calls = [1, 2, 3].map((i) =>
  chain.assetHub.tx.System.remark({ remark: Binary.fromText(`batch-${i}`) }),
);

const result = await batchSubmitAndWatch(calls, chain.assetHub, signer, {
  mode: 'batch_all',
});
```

## Limitations

- Expected failures (dispatch error, timeout, signing rejection, validity error) arrive on the `Result` error channel, not as thrown exceptions.
- A dispatch that fails on chain comes back on `result.error` as `TxDispatchError`; a `result.ok` transaction has both landed in a block and dispatched successfully.
- The default `waitFor` is `'best-block'`; the default timeout is 300 seconds.
- Every call in a batch must target the same chain as the passed API; an empty call list returns a `TxBatchError`.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Sign and Submit Transactions**

    ---

    The task-focused recipe: derive an account, sign, and submit end to end.

    [:octicons-arrow-right-24: Sign and Submit Transactions](/apps/build/sign-and-submit/)

-   <span class="badge learn">Learn</span> **Signer**

    ---

    Where the `PolkadotSigner` this package consumes comes from.

    [:octicons-arrow-right-24: Signer](/apps/product-sdk/signer/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `tx` surface: `submitAndWatch`, `batchSubmitAndWatch`, and the error hierarchy.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/tx/)

</div>

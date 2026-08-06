---
title: Contracts
description: Overview of the Product SDK contracts package — typed query, transaction, and batch calls to pallet-revive contracts on Asset Hub, resolved from a cdm.json manifest.
categories: Apps
---

# Contracts

## Introduction

[`@parity/product-sdk-contracts`](https://paritytech.github.io/product-sdk/api/contracts/) gives your Product typed access to smart contracts deployed on Asset Hub. It calls `pallet-revive` (PolkaVM) contracts through the typed chain API, resolves each contract's address and ABI from a `cdm.json` manifest, and exposes reads, signed writes, and atomic batches on a typed handle.

It is the frontend counterpart to deploying a contract: once a contract is deployed and registered, this package turns its manifest entry into a typed object you call by name.

## When to Use It

- To call a contract deployed on Asset Hub: reads with `query`, signed writes with `tx`, or atomic multi-call batches with `prepare`.
- When you have a `cdm.json` manifest (address and ABI per installed contract), which is the primary path via `ContractManager.fromClient`.
- Not for deploying contracts; deployment is handled by the `cdm` toolchain, covered in [Deploy and Integrate a Smart Contract](/apps/build/deploy-a-smart-contract/). The target chain must expose the `Revive` pallet.

## Core Concepts

- **`ContractManager`**: Resolves contracts from a `cdm.json` manifest. `fromClient(...)` is synchronous and uses the addresses snapshotted in the manifest; `getContract(name)` returns a typed handle and throws `ContractNotFoundError` if the name is not in the manifest.
- **Contract handle**: Each ABI method exposes `query`, `tx`, and `prepare`.
- **`query` returns a discriminated result**: A read is a dry run that returns `{ success, value, gasRequired }`. It does not throw on a revert, so branch on `.success` rather than using `try`/`catch`.
- **`tx` returns a `Result`**: A signed write returns a `Result` (check `.ok`). Before signing, it dry-runs the call to size gas and fail fast on a revert.
- **Account mapping**: `pallet-revive` requires each signing account to be mapped to its H160 address once. Call `ensureContractAccountMapped` at startup, or every `tx` on a fresh account fails with `AccountNotMapped`.
- **Product-account signing**: Writes are signed by your Product-scoped account, so contract calls route to the user's phone for approval like any other transaction.

## Call a Contract

Build a manager from the manifest and the chain client, map the account once, then read and write:

```typescript
import {
  ContractManager,
  ensureContractAccountMapped,
} from '@parity/product-sdk-contracts';
import { paseo_asset_hub } from '@parity/product-sdk-descriptors/paseo-asset-hub';
import cdmJson from './cdm.json';

const manager = ContractManager.fromClient(
  cdmJson,
  chain.raw.assetHub,
  paseo_asset_hub,
  { signerManager },
);

await ensureContractAccountMapped(manager.getRuntime(), account.address, signer);

const counter = manager.getContract('@my-app/counter');

// Read: a dry run. Check .success, not .ok.
const count = await counter.getCount.query();
if (count.success) console.log(count.value);

// Write: signs through the Host. Check .ok.
const result = await counter.increment.tx({ signer });
if (!result.ok) console.error(result.error.message);
```

## Limitations

- `query` never throws on a chain-side failure; it returns `{ success: false, value: <error> }`, so branch on `.success`.
- A fresh signing account fails every `tx` with `AccountNotMapped` until `ensureContractAccountMapped` runs once.
- Passing both `gasLimit` and `storageDepositLimit` skips the dry-run, including the revert pre-check, so a reverting transaction is still submitted and its gas paid.
- The `/codegen` and `/pvm` subpaths pull in Node-only modules; keep them out of browser bundles.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Deploy and Integrate a Smart Contract**

    ---

    The task-focused recipe: scaffold, deploy, and register a contract, then wire it into your frontend.

    [:octicons-arrow-right-24: Deploy and Integrate a Smart Contract](/apps/build/deploy-a-smart-contract/)

-   <span class="badge learn">Learn</span> **Transactions**

    ---

    The submission layer this package builds on for its signed writes and batches.

    [:octicons-arrow-right-24: Transactions](/apps/product-sdk/tx/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `contracts` surface: `ContractManager`, contract handles, and the `pvm` subpath.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/contracts/)

</div>

---
title: Deploy and Integrate a Smart Contract
description: Add a PolkaVM smart contract to your Polkadot Product — deploy it to Asset Hub with the Contract Dependency Manager and call it from your frontend.
categories: Apps
page_badges:
  tutorial_badge: Advanced
---

# Deploy and Integrate a Smart Contract

## Introduction

Some Products need on-chain logic and shared state that no single user owns: a leaderboard, a registry, an escrow, a game whose rules must be enforced for everyone. That is what a smart contract gives you. This guide adds a [PolkaVM](/reference/glossary/#polkadot-virtual-machine-pvm) contract to a Product, deploys it to Asset Hub, and calls it from your frontend with the [`@parity/product-sdk-contracts`](https://paritytech.github.io/product-sdk/) package.

Contracts on Polkadot run as PolkaVM bytecode through the `pallet-revive` runtime on Asset Hub. You author them in Rust or Solidity, and the [Contract Dependency Manager](https://github.com/paritytech/contract-dependency-manager) (`cdm`) builds, deploys, and registers them, the same tool the `playground` CLI runs for you when it deploys a Product that has contracts. `cdm` fills the role npm fills for libraries, but for on-chain contracts: it publishes each contract under a global name (`@scope/name`) in an on-chain registry, so your frontend resolves it by name instead of hardcoding an address.

!!! note "Contracts are optional"
    Many Products never need a contract. If all you need is durable content or real-time state between users, [Store Data on Chain](/apps/build/store-data-on-chain/) and [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/) cover those without any contract at all. Reach for a contract when you need enforced, shared on-chain logic.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project running locally. See [Set Up Your Project](/apps/build/#set-up-your-project).
- An account for `cdm` to sign with. `cdm` signs contract deploys from the CLI, not through the Polkadot App; run `cdm init` to generate a keypair for the network, or pass your own with `--suri`.
- PAS funds, an Asset Hub account mapping, and a Bulletin Chain authorization for that account. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/). Deploying a contract writes to Asset Hub (fees) and publishes metadata to the Bulletin Chain (authorization).
- A local toolchain for your contract language. Contracts compile to PolkaVM, so unlike the frontend capabilities, this step needs a workstation rather than a browser alone.

## How Contracts Fit Together

Four things happen when you publish a contract, and `cdm` handles all of them in one flow:

- **Build**: Your Rust or Solidity contract compiles to PolkaVM bytecode targeting `pallet-revive` (Solidity via `resolc`).
- **Deploy**: The bytecode is instantiated on Asset Hub at a deterministic address.
- **Publish metadata**: The contract's ABI and docs are uploaded to the Bulletin Chain, addressed by CID.
- **Register**: The contract's global name (`@scope/name`) is recorded in the on-chain `ContractRegistry`, mapping the name to its address and metadata CID.

Your frontend then reads a project-local manifest, `cdm.json`, which holds the deployed address and ABI for each contract your Product depends on. The [`@parity/product-sdk-contracts`](https://paritytech.github.io/product-sdk/) package turns that manifest into typed contract objects.

!!! warning "The registry is append-only"
    Registration is permanent: the first account to publish a name owns it, versions only ever increment, and nothing can be overwritten or deleted. Do not publish a name you are only testing with as your real account, and never register anything you want to keep from a shared dev account such as `//Alice`.

## Scaffold a Contract

`cdm` ships example templates. Scaffold the `shared-counter` template, which defines a minimal counter contract you can adapt:

```bash
cdm template shared-counter
```

This creates a Cargo workspace and a `cdm.json` manifest. The `shared-counter` template ships three crates under `contracts/` that demonstrate a dependency graph: `counter` holds the shared count, `counter-writer` calls `counter.increment()` through a CDM reference, and `counter-reader` queries `counter.get_count()`.

Each crate declares its CDM package name in its own `Cargo.toml`:

```toml title="contracts/counter/Cargo.toml"
[package.metadata.cdm]
package = "@example/counter"
```

The contract itself is a module holding a storage struct and an `impl` block, annotated with the PolkaVM contract SDK macros:

```rust title="contracts/counter/lib.rs"
#![cfg_attr(not(feature = "abi-gen"), no_main, no_std)]

#[pvm_contract_sdk::contract(allocator = "pico", allocator_size = 1024)]
mod counter {
    use pvm_contract_sdk::Lazy;

    pub struct Counter {
        // Storage slots are auto-numbered in declaration order (`count` gets slot 0).
        count: Lazy<u32>,
    }

    impl Counter {
        #[pvm_contract_sdk::constructor]
        pub fn new(&mut self) {
            self.count.set(&0);
        }

        #[pvm_contract_sdk::method]
        pub fn increment(&mut self) {
            let current = self.count.get();
            self.count.set(&(current + 1));
        }

        #[pvm_contract_sdk::method]
        pub fn get_count(&self) -> u32 {
            self.count.get()
        }
    }
}
```

Note that the constructor takes `&mut self` and initializes storage in place; it does not return `Self`. Storage fields are wrapped in `Lazy<T>` so each is read and written on demand rather than loaded wholesale.

Before deploying, change **every** `[package.metadata.cdm] package = "@example/…"` entry in the workspace to a scope you control, for example `@my-app/counter`. Package names are global per registry, the scaffolded `@example` scope is a placeholder, and registration is first-writer-owns, so you want your own scope on all three crates.

!!! tip "Prefer Solidity?"
    `cdm` also ships Solidity templates (`foundry-counter` and `hardhat-counter`) that compile to PolkaVM via `resolc`. Scaffold one the same way, for example `cdm template foundry-counter`. The deploy and frontend steps below are identical regardless of the contract language.

## Install the Toolchain

`cdm setup` installs the exact Rust nightly and the `cargo-pvm-contract` build tool the contract compiler needs. Run it once per workstation:

```bash
cdm setup
```

!!! tip
    Pass `cdm setup --check` to verify the toolchain without installing anything.

## Build and Deploy

Deploy with `cdm deploy`, selecting the target network with `-n`. This builds the bytecode, deploys it to Asset Hub, uploads the ABI to the Bulletin Chain, and registers the name, all in one flow:

```bash
cdm deploy -n paseo --suri "INSERT_ACCOUNT_SECRET_URI"
```

`cdm` signs from the CLI with the account you pass as `--suri`, or with the keypair `cdm init` generated for the network. It does not sign through the Polkadot App or a phone. The `-n` preset also selects the registry for the network, so you do not set a registry address by hand.

!!! warning "Always pass a signer you control"
    With no `--suri` and no `cdm init` account, `cdm` falls back to the shared `//Alice` development key. Because registration is first-writer-owns, deploying that way parks your contract name on a public key anyone can use. Pass `--suri` (or run `cdm init` first) so the name and contract belong to you.

!!! note "Deploying alongside your Product"
    When you deploy the whole Product with [`playground deploy`](/apps/deploy-your-app/), the CLI runs this contract step for you. At the `did you change your smart contracts?` prompt, choose `yes` and the CLI redeploys the contracts and rebuilds the site to match. Use `cdm deploy` directly when you want to iterate on the contract on its own, without redeploying the frontend.

## Add the Contract to Your Manifest

Your frontend resolves contracts from `cdm.json`, and `cdm deploy` does not write that file — `cdm install` does. After deploying, install your contract to write its address and ABI into the manifest. Installing works the same for a contract someone else published, so pass whichever `@scope/name` you need:

```bash
cdm install @my-app/counter -n paseo
```

`cdm install` resolves the name against the on-chain registry, fetches the ABI from the Bulletin Chain, and writes the entry into `cdm.json`:

```json title="cdm.json"
{
  "dependencies": {
    "@my-app/counter": "latest"
  },
  "contracts": {
    "@my-app/counter": {
      "version": 1,
      "address": "0x…",
      "abi": [ /* … */ ],
      "metadataCid": "bafy…"
    }
  }
}
```

The `shared-counter` template ships its `cdm.json` already populated for the example contracts, so you only run `cdm install` when you deploy your own contract or add someone else's.

## Call the Contract From Your Frontend

Install the contracts package (or use the umbrella `@parity/product-sdk`):

```bash
npm install @parity/product-sdk-contracts @parity/product-sdk-chain-client @parity/product-sdk-descriptors
```

Build a `ContractManager` from the manifest and the host-routed chain client, map your signing account once (every contract write fails with `AccountNotMapped` until you do), then get a typed handle by name. Reads use `query` (a dry run — check `.success`), and writes use `tx` (which signs through the Host — check `.ok`):

```typescript
import { createChainClient } from '@parity/product-sdk-chain-client';
import { paseo_asset_hub } from '@parity/product-sdk-descriptors/paseo-asset-hub';
import {
  ContractManager,
  ensureContractAccountMapped,
} from '@parity/product-sdk-contracts';
import cdmJson from './cdm.json';

const client = await createChainClient({ chains: { assetHub: paseo_asset_hub } });

const manager = ContractManager.fromClient(
  cdmJson,
  client.raw.assetHub,
  paseo_asset_hub,
  { signerManager },
);

// pallet-revive requires each signing account to be mapped once.
await ensureContractAccountMapped(manager.getRuntime(), account.address, signer);

const counter = manager.getContract('@my-app/counter');

// Read: a dry run. Check .success before reading .value.
const count = await counter.getCount.query();
if (count.success) {
  console.log(count.value);
}

// Write: signs through the Host. Returns a Result — check .ok.
const result = await counter.increment.tx({ signer });
if (!result.ok) {
  console.error(result.error.message);
}
```

The `signerManager` is the same [`SignerManager`](/apps/build/sign-and-submit/) you set up for signing, and `account` and `signer` come from it. Contract writes are signed by your Product-scoped account, so they route to the user's phone for approval like any other transaction. For the full frontend surface, see [Contracts](/apps/product-sdk/contracts/).

!!! note "query returns a status, tx returns a Result"
    `query` is a dry run that does not throw on a revert; branch on `.success`, because on failure `.value` holds the dispatch-error payload, not your data. `tx` returns a `Result`; check `.ok` before assuming the write landed.

## Redeploy After a Contract Change

Contracts are immutable once deployed. Changing contract code means deploying a new version: run `cdm deploy -n paseo --suri ...` again (or choose `yes` at the contract prompt in `playground deploy`). The registry appends a new version under the same name; run `cdm install @my-app/counter -n paseo` afterward to refresh the address and ABI in `cdm.json` so your frontend picks up the new deployment.

Because a redeploy gives your contract a new on-chain address, existing users pointed at the old address keep using the old contract until they load the new bundle. For a contract with live users and stored state, plan the migration deliberately rather than redeploying in place.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Deploy Your App**

    ---

    Deploy the whole Product, contracts and frontend together, and register a `.dot` name with the `playground` CLI.

    [:octicons-arrow-right-24: Deploy Your App](/apps/deploy-your-app/)

-   <span class="badge external">External</span> **Product SDK API Reference**

    ---

    The full `@parity/product-sdk-contracts` surface: `ContractManager`, contract handles, and the `query`, `tx`, and `prepare` methods.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/)

-   <span class="badge external">External</span> **Contract Dependency Manager**

    ---

    The `cdm` toolchain in depth: templates, the registry model, versioning, and installing published contracts.

    [:octicons-arrow-right-24: Visit Repo](https://github.com/paritytech/contract-dependency-manager)

</div>

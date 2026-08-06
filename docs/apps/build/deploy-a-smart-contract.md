---
title: Deploy and Integrate a Smart Contract
description: Add a PolkaVM smart contract to your Polkadot Product with the Contract Dependency Manager, deploy it to Asset Hub, and call it from your frontend with product-sdk.
categories: Apps
page_badges:
  tutorial_badge: Advanced
---

# Deploy and Integrate a Smart Contract

## Introduction

Some Products need on-chain logic and shared state that no single user owns: a leaderboard, a registry, an escrow, a game whose rules must be enforced for everyone. That is what a smart contract gives you. This guide adds a [PolkaVM](/reference/glossary/#polkadot-virtual-machine-pvm) contract to a Product, deploys it to Asset Hub, and calls it from your frontend with the [`@parity/product-sdk-contracts`](https://paritytech.github.io/product-sdk/) package.

Contracts on Polkadot run as PolkaVM bytecode through the `pallet-revive` runtime on Asset Hub. You author them in Rust, and the [Contract Dependency Manager](https://github.com/paritytech/contract-dependency-manager) (`cdm`) builds, deploys, and registers them, the same tool the `playground` CLI runs for you when it deploys a Product that has contracts. `cdm` fills the role npm fills for libraries, but for on-chain contracts: it publishes each contract under a global name (`@scope/name`) in an on-chain registry, so your frontend resolves it by name instead of hardcoding an address.

!!! note "Contracts are optional"
    Many Products never need a contract. If all you need is durable content or real-time state between users, [Store Data on Chain](/apps/build/store-data-on-chain/) and [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/) cover those without any contract at all. Reach for a contract when you need enforced, shared on-chain logic.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project running locally. See [Set Up Your Project](/apps/build/#set-up-your-project).
- The [Polkadot App](/apps/) installed and paired, so you can sign the deploy on your phone. See [Install Desktop and Pair](/apps/get-started/).
- PAS funds, an Asset Hub account mapping, and a Bulletin Chain authorization for your account. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/). Deploying a contract writes to Asset Hub (fees) and publishes metadata to the Bulletin Chain (authorization).
- A Rust toolchain on your workstation. Contract builds compile Rust to PolkaVM, so unlike the frontend capabilities, this step needs a local toolchain rather than a browser alone.

## How Contracts Fit Together

Four things happen when you publish a contract, and `cdm` handles all of them in one flow:

- **Build**: Your Rust contract compiles to PolkaVM bytecode targeting `pallet-revive`.
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

This creates a contract crate and a `cdm.json` manifest. The generated contract uses the PolkaVM contract SDK macros and declares its package name in `Cargo.toml`:

```toml title="Cargo.toml"
[package.metadata.cdm]
package = "@example/counter"
```

```rust title="src/lib.rs"
#[pvm_contract_sdk::contract]
mod counter {
    #[pvm_contract_sdk::constructor]
    pub fn new() -> Self { /* ... */ }

    #[pvm_contract_sdk::method]
    pub fn get_count(&self) -> u64 { /* ... */ }

    #[pvm_contract_sdk::method]
    pub fn increment(&mut self) { /* ... */ }
}
```

Rename the package from `@example/counter` to a scope you control (for example, `@my-app/counter`) before deploying. The scaffolded name is a placeholder, and because registration is first-writer-owns, you want your own scope.

## Install the Toolchain

`cdm setup` installs the exact Rust nightly and the `cargo-pvm-contract` build tool the contract compiler needs. Run it once per workstation:

```bash
cdm setup
```

!!! tip
    Pass `cdm setup --check` to verify the toolchain without installing anything.

## Set the Target Network

Open `cdm.json` and confirm the `registry` field points at the `ContractRegistry` for your target network. This address is network-specific; using the wrong one publishes your contract to the wrong registry. The manifest starts out with only your dependencies declared:

```json title="cdm.json (before deploy)"
{
  "registry": "0xf62c2ece29cd8df2e10040ecfa5a894a5c5d9cb0",
  "dependencies": {
    "@my-app/counter": "latest"
  }
}
```

## Build and Deploy

Deploy the contract with `cdm deploy`, selecting your target network with `-n`. This builds the bytecode, deploys it to Asset Hub, uploads the ABI to the Bulletin Chain, and registers the name, all in one signed flow:

```bash
cdm deploy -n paseo
```

Sign the deploy with your phone when prompted. When it completes, `cdm` writes the real deployment details back into `cdm.json`, so the manifest now carries the address, ABI, and metadata CID your frontend needs:

```json title="cdm.json (after deploy)"
{
  "registry": "0xf62c2ece29cd8df2e10040ecfa5a894a5c5d9cb0",
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

!!! note "Deploying alongside your Product"
    When you deploy the whole Product with [`playground deploy`](/apps/deploy-your-app/), the CLI runs this contract step for you. At the `did you change your smart contracts?` prompt, choose `yes` and the CLI redeploys the contracts and rebuilds the site to match. Use `cdm deploy` directly when you want to iterate on the contract on its own, without redeploying the frontend.

## Consume a Published Contract

To depend on a contract someone else already published, add it to `cdm.json` and install it. `cdm install` resolves the name against the on-chain registry, fetches the ABI from the Bulletin Chain, and writes the address and ABI into your manifest:

```bash
cdm install @some-scope/their-contract -n paseo
```

This is the same manifest your own deploy produces, so the frontend integration below works identically whether you deployed the contract or installed it.

## Call the Contract From Your Frontend

Install the contracts package (or use the umbrella `@parity/product-sdk`):

```bash
npm install @parity/product-sdk-contracts @parity/product-sdk-chain-client @parity/product-sdk-descriptors
```

Build a `ContractManager` from the manifest and the host-routed chain client, then get a typed handle to your contract by name. Reads use `query` (a dry run that costs nothing and does not sign), and state changes use `tx` (which signs through the Host):

```typescript
import { createChainClient } from '@parity/product-sdk-chain-client';
import { paseo_asset_hub } from '@parity/product-sdk-descriptors/paseo-asset-hub';
import { ContractManager } from '@parity/product-sdk-contracts';
import cdmJson from './cdm.json';

const client = await createChainClient({ chains: { assetHub: paseo_asset_hub } });

const manager = ContractManager.fromClient(
  cdmJson,
  client.raw.assetHub,
  paseo_asset_hub,
  { signerManager },
);

const counter = manager.getContract('@my-app/counter');

// Read: a dry run against the best block. No signature, no fee.
const { value } = await counter.getCount.query();

// Write: signs through the Host and submits. Returns a Result — check .ok.
const result = await counter.increment.tx();
if (!result.ok) {
  console.error(result.error.message);
}
```

The `signerManager` is the same [`SignerManager`](/apps/build/sign-and-submit/) you set up for signing. Contract transactions are signed by your Product-scoped account, so the write above routes to the user's phone for approval exactly like any other transaction your Product submits.

!!! note "Reads never throw, writes return a Result"
    `query` defaults to the best block and does not throw on a revert, so it is safe to call on render. `tx` returns a `Result` rather than throwing; always check `.ok` before assuming the state change landed.

## Redeploy After a Contract Change

Contracts are immutable once deployed. Changing contract code means deploying a new version: run `cdm deploy -n paseo` again (or choose `yes` at the contract prompt in `playground deploy`). The registry appends a new version under the same name and updates the address in `cdm.json`, so your frontend picks up the new deployment on its next build.

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

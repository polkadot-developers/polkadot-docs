---
title: Polkadot Product Skills
description: Reference for the product-sdk skills — modular instructions that teach an AI agent how to work effectively across the Polkadot Products stack.
categories: Apps, Reference
---

# Skills

## Introduction

Product Skills are small, modular instruction sets that teach an AI coding agent how to work effectively across specific parts of the Polkadot Products stack. A skill bundles together what the agent needs to know about one slice of the surface (chain connections, bulletin storage, contract interactions, and so on) so that when you ask it for help in that area, it has the right context loaded.

If you are working on a Polkadot Product with an AI coding agent, installing the relevant skills tilts the agent toward correct, idiomatic answers instead of generic boilerplate.

The skills live inside the [`paritytech/product-sdk`](https://github.com/paritytech/product-sdk) monorepo under `product-sdk/skills/`.

## Skills List

| Skill                                                                                                                       | What It Covers                                                                                                                                                                                                          |
|:---------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| [`product-sdk-app-builder`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-app-builder) | End-to-end scaffolding and implementation of Polkadot apps using `@parity/product-sdk` packages. Foundational orchestrator skill — reach for this when starting a new project or scaffolding chain interactions.        |
| [`product-sdk-bulletin`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-bulletin)             | Upload and retrieve data on the Polkadot Bulletin Chain. Covers CID-based content-addressed storage, IPFS gateway access, the `BulletinClient` SDK, batch uploads, and CID computation.                                 |
| [`product-sdk-chain-connection`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-chain-connection) | Typed access to Polkadot chains via `@parity/product-sdk-chain-client` and `@parity/product-sdk-descriptors`. Covers preset and BYOD (bring-your-own-descriptors) paths, state queries, and storage subscriptions. |
| [`product-sdk-contracts`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-contracts)           | Smart contract interaction (PolkaVM / Solidity) on Asset Hub. Covers `ContractManager` with `cdm.json` manifests, ad-hoc `createContract`, `ContractRuntime`, and contract type codegen.                                |
| [`product-sdk-statement-store`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-statement-store) | Publish and subscribe to ephemeral messages on the Polkadot Statement Store. Covers `StatementStoreClient` lifecycle, host and local connection modes, channels with last-write-wins semantics, and the 512-byte size limit. |
| [`product-sdk-transactions`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-transactions)     | Submit transactions, manage signers, and derive keys. Covers `@parity/product-sdk-tx`, `@parity/product-sdk-signer`, and `@parity/product-sdk-keys` — multi-provider wallet accounts, Host API signing (Desktop/Mobile), and dev signers for testnet. |
| [`product-sdk-utilities`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/skills/product-sdk-utilities)           | Foundational utilities — SS58/H160 address encoding, AES/ChaCha/NaCl crypto, HKDF key derivation, byte encoding, token (planck) formatting, key-value storage, and structured logging.                                  |

## How to Install

Clone the `paritytech/product-sdk` repo:

```bash
git clone https://github.com/paritytech/product-sdk.git
```

Skills live under `product-sdk/skills/<skill-name>/` in the cloned directory. Register whichever skills are relevant with your agent — Claude Code, Cursor, Codex, or a custom harness — using that agent's skill or context-loading mechanism.

Skills trigger based on context. You can also invoke a skill directly by name before asking a question. For example, before asking the agent for help chunking a large upload to the Bulletin Chain, load the relevant context up front:

```text
/product-sdk-bulletin how do I chunk a 50 MB file across multiple transactions?
```

The agent now has the SDK's API patterns and best practices loaded before it answers, instead of falling back on generic JavaScript knowledge.

## Updating

!!! tip "Keep skills current"
    Polkadot Products surfaces are in active development. A skill that has not been refreshed for a while will teach the agent stale API patterns, which is worse than no skill at all. Refresh after major releases.

Pull the latest changes from your clone:

```bash
git pull
```

Then re-register any updated skills with your agent as needed.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **App Development How-To**

    ---

    The how-to guides themselves, the same conceptual content the skills above index into.

    [:octicons-arrow-right-24: Get Started](/apps/get-started/)

- <span class="badge external">External</span> **product-sdk repo**

    ---

    The source of truth for the skills documented above, including per-skill README files and updates.

    [:octicons-arrow-right-24: Visit Repo](https://github.com/paritytech/product-sdk)

</div>

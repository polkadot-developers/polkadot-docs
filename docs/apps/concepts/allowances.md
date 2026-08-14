---
title: Allowances and Permissions
description: What the allowances a Polkadot Product requests actually authorize — Statement Store, Bulletin storage, contracts, and auto-signing — their scope, lifetime, and how re-approval works.
categories: Apps
---

# Allowances and Permissions

## Introduction

Some capabilities let your Product act on chain on the user's behalf, so the user has to grant them first. Your Product requests these grants — _allowances_, or resource allocations — from the Host, and the user approves them. A prompt such as "sign and submit on-chain transactions on your behalf" is one of these grants.

Allowances are granted **per account**. This is why they are closely tied to [Accounts and Signing](/apps/concepts/accounts/): granting an allowance to one account does nothing for a different one.

## What Your Product Can Request

Your Product requests allowances through the SDK, typically once on connect. The resource types are:

| Resource                  | What it authorizes                                                                 |
|---------------------------|------------------------------------------------------------------------------------|
| `StatementStoreAllowance` | Publishing to the [Statement Store](/apps/product-sdk/statement-store/).           |
| `BulletinAllowance`       | Storing data on the [Bulletin Chain](/apps/product-sdk/cloud-storage/).            |
| `SmartContractAllowance`  | Sponsoring transactions for a product account, keyed by its derivation index, for [contract](/apps/product-sdk/contracts/) calls. |
| `AutoSigning`             | Signing and submitting transactions on the user's behalf without a per-action prompt. |

!!! note "Tag spelling differs by toolchain"
    The Host and frontend codec spells the storage tag `BulletinAllowance`. The CLI and terminal codec spells it `BulletInAllowance` (capital `I`). They are two different codecs; use the spelling that matches the surface you are calling, and do not "correct" one to the other.

## Requesting an Allowance

The [`signer`](/apps/product-sdk/signer/) package requests allocations through its `onConnect` hook, which fires once per connection. Each request resolves to an outcome:

- **`Allocated`**: The user granted it.
- **`Rejected`**: The user declined it.
- **`NotAvailable`**: The Host or wallet cannot provide it right now.

Request the allowances your Product needs up front, then treat a non-`Allocated` outcome as a feature being unavailable rather than a fatal error, so a declined grant degrades gracefully.

!!! warning "AutoSigning is not available on mobile today"
    `AutoSigning` returns `NotAvailable` on both the Android and iOS wallets today. A Product can request it, but the wallet will not grant it yet, so do not build a flow that depends on it. Fall back to per-transaction signing, where each submission prompts the user's phone.

## Scope and Lifetime

- **Scope**: An allowance authorizes one capability for one account. `AutoSigning` is the broadest — it hands your Product a signing subtree so it can sign without prompting for each action — which is why it is gated behind an explicit approval.
- **Lifetime**: The exact lifetime and expiry policy of an allowance is not documented. In practice, an expired allowance surfaces as an error telling you to re-pair the wallet. Treat allowances as revocable and potentially expiring rather than permanent.

## Re-Approval Is Expected

Users are prompted once, and operations covered by a granted allowance do not prompt again. Two cases where you will see a prompt again are by design, not bugs:

- **Redeploys**: The CLI caches granted allowances on disk, so subsequent deploys skip most prompts. A fresh environment prompts again.
- **Page reload**: A Product re-requests its allocations each time it connects. If the Host still holds the grant, this is silent; otherwise the user is prompted again.

Design for re-approval: make requesting allowances idempotent, and do not treat a repeat prompt as an error state.

## Inspect and Revoke

- **Inspect**: There are cached checks for whether a storage or Statement Store allowance is present (they read local state and do not prompt the wallet). There is no documented way to inspect an `AutoSigning` grant specifically, and these checks read cached state rather than querying on-chain records.
- **Revoke**: There is no documented per-allowance revoke. The coarse lever is tearing down the session — signing out clears the granted state. Revoking a single allowance while keeping others is not supported.

!!! info "Dismissing the approval modal"
    Declining or dismissing an approval resolves that request as `Rejected` or `NotAvailable` rather than crashing your Product. The exact outcome a dismissed modal returns is not documented, so handle both.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Accounts and Signing**

    ---

    Allowances are per account; make sure you grant them to the account that signs.

    [:octicons-arrow-right-24: Accounts and Signing](/apps/concepts/accounts/)

-   <span class="badge guide">Guide</span> **Get TestNet Tokens**

    ---

    Grant your account the Bulletin storage authorization and other service allowances.

    [:octicons-arrow-right-24: Get TestNet Tokens](/apps/get-started/get-testnet-tokens/)

-   <span class="badge learn">Learn</span> **Permissions Reference**

    ---

    The Host-to-Product permission model at the protocol level.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/permissions/)

</div>

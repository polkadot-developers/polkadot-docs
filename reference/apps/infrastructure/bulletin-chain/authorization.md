---
title: Bulletin Chain Authorization
description: How writes to the Bulletin Chain are gated — the explicit per-account authorization model, the transaction-and-byte quota, and the expiration lifecycle.
categories: Apps, Reference
---

# Authorization

## Introduction

The Bulletin Chain has no token balance for storage — you cannot "pay for storage" the way you pay a transaction fee on a typical chain. Instead, every account that wants to write to Bulletin needs an explicit **authorization**: an on-chain record that grants a quota of transactions and bytes, with an expiration block.

A write attempted without authorization is rejected at the boundary. This page is the reference for how authorizations are shaped, how they are checked, and what happens when they expire.

## What an Authorization Records

An authorization is a per-account on-chain record stored in the `Authorizations` storage map of the `transaction-storage` pallet. It records, for the account it covers:

- **Remaining transactions**: How many storage extrinsics the account may still submit before the quota is exhausted.
- **Remaining bytes**: How many bytes total the account may still write across those transactions.
- **Expiration block**: The block at which the authorization expires. Unused capacity is _not_ refunded when this block passes.

A Product can verify an account's current authorization by reading the `Authorizations` storage map for that account through the standard chain client.

## What a Write Costs

Each storage submission decrements both counters:

- The transaction counter decrements by one per extrinsic.
- The byte counter decrements by the payload size.

The transaction counter is the one most Products will hit first. Even a small upload that uses chunking (because the payload exceeds the per-transaction byte limit) consumes one transaction per chunk; large files consume the corresponding count.

## Expiration

Authorizations are time-bounded for a reason: storage on the network is finite, and an unexpiring authorization would let an inactive account hold reserved capacity indefinitely. When the expiration block passes:

- Any remaining transaction and byte quota in that authorization is _forfeited_ (not credited to a new authorization, not refunded to the user).
- Subsequent storage attempts return an authorization error until a new authorization is provisioned.

A Product whose users store data over time needs to think about authorization renewal as a first-class concern, not a once-at-onboarding step.

## Provisioning on TestNet

!!! warning "Provisional"
    The TestNet provisioning flow — the faucet endpoint, the request UX, governance- or sudo-routed grants where they apply — is being firmed up. The current flow lives in the [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/) guide; that guide is the source of truth as the surface stabilizes.

On TestNet today, authorizations are provisioned through a faucet built into the Bulletin Chain Console. The [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/) guide walks through requesting an authorization for a paired account.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Renewal**

    ---

    What happens when an authorization or a stored item approaches expiration, and the mechanics of keeping data alive.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/renewal/)

- <span class="badge guide">Guide</span> **Get TestNet Funds**

    ---

    The setup step that provisions an authorization on TestNet alongside PAS tokens for transaction fees.

    [:octicons-arrow-right-24: Get Started](/apps/get-started/get-testnet-tokens/)
</div>

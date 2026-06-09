---
title: pallet-ubc Reference
description: The Universal Basic Capacity pallet — per-person on-chain capacity primitives, including the periodic fee-free transaction quota for verified persons.
categories: Apps, Reference
---

# `pallet-ubc`

## Introduction

`pallet-ubc` is the Universal Basic Capacity pallet. Its job is to give every verified person a periodic on-chain _capacity allotment_ — most notably, a quota of fee-free transactions per period. The motivating use case is the "first interaction is free" pattern: a new user can sign and submit one or more transactions without first acquiring DOT, removing the cold-start friction that gates Web3 onboarding.

For a Product developer, `pallet-ubc` is the mechanism that lets your Product be the first thing a new user touches without forcing them to fund their account before they can do anything.

!!! warning "Provisional"
    The exact dispatch surface, the per-period quota amount, the period length, and the precise eligibility rules of `pallet-ubc` on the current build are still being finalized. The "Q11" open question on `pallet-ubc` stable flows is one of the items being firmed up. This page documents the conceptual model; per-extrinsic specifics will be added once confirmed.

## What the Pallet Provides

Three primitives, organized around the per-period capacity model:

- **The capacity allotment**: Each verified person receives a quota per period (the period length and quota amount are runtime parameters). Within the quota, the user can perform certain operations without paying transaction fees.
- **Consumption tracking**: The pallet records each person's consumption against their current period's quota so subsequent operations correctly account for what is remaining.
- **Eligibility checks**: Operations that _can_ be performed under UBC have their eligibility verified at dispatch — a non-verified account, or an account that has already exhausted the period's quota, falls back to the normal fee path.

## When a Product Reaches for UBC

The canonical pattern is the first-interaction onboarding flow:

1. A new user opens a Polkadot Product.
2. The Product has the user complete (or confirm) PoP via the App.
3. The Product invokes a UBC-eligible action — typically a small initial setup transaction, a "welcome" claim, a vote, or an action that establishes the user's presence in your Product.
4. The action goes through under the user's UBC quota; the user has not yet acquired any DOT and is still able to participate.
5. After the UBC quota is exhausted (within the period), subsequent transactions follow the normal fee path; by then the user has had a chance to fund their account through the normal channels.

The pallet's value is largely UX: removing the requirement to acquire and hold DOT before doing anything in the Product.

## Eligibility Constraints

Not every transaction is eligible to consume UBC quota. Typical constraints:

- The user must be a verified person — accounts without PoP cannot consume.
- The operation must be one the runtime has declared UBC-eligible — this is a runtime configuration, not an arbitrary application choice.
- The user must have remaining quota in the current period.

When any of these fail, the transaction does not silently fail — it follows the normal fee path, and the user pays in DOT.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **pallet-people**

    ---

    The pallet that records PoP status — the eligibility input UBC checks against.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/pallet-people/)

- <span class="badge guide">Guide</span> **Verify Your Identity**

    ---

    The setup step that produces the PoP status UBC requires.

    [:octicons-arrow-right-24: Get Started](/reference/apps/infrastructure/pop/)
</div>

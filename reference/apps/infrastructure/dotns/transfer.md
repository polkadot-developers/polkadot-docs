---
title: Name Transfers
description: Transferring ownership of a .dot name to another account — the flow, the validation rules, and what changes on the new owner's side.
categories: Apps, Reference
---

# Name Transfers

## Introduction

A `.dot` name is owned by an account on Asset Hub, and that ownership is transferable. A transfer changes _who controls the name's record_ — who can update where it points (its `contenthash`), sell it on, or set administrative fields — without changing the name itself or what it currently resolves to.

This page documents the conceptual transfer flow and the rules dotNS enforces on it.

!!! warning "Provisional"
    The exact dispatch path for a name transfer (which contract, which signed extrinsic, the precise parameter shape), the supported acceptance / rejection mechanics on the receiving side, and any time-locked or escrow variants of transfer are still being finalized. This page documents the conceptual model; the operational reference will be added once confirmed.

## What Changes on Transfer

A transfer modifies one field of the name's record: the _owner_. Specifically:

- The new owner becomes the account that can sign updates to the name's record (changing the `contenthash`, transferring again, setting fields).
- The name itself — the dotted string the user sees — does not change.
- The currently-attached `contenthash` does not change. Users navigating to the name continue to see the same Product bundle they saw before, unless and until the new owner updates it.
- The PoP tier the original owner used to qualify for the name (Full or Lite tier eligibility) does _not_ transfer with the name. The new owner inherits the name regardless of their own PoP tier, but any future renewal-time or PopRules-evaluated operations are checked against the new owner's status.

## When the Tier Lock Matters

The "PopRules-checked operations" caveat above matters most for Lite-to-Full migration reservations. If a PoP Lite holder registered `alice01.dot` and consequently has `alice.dot` reserved for 12 weeks, that reservation is tied to the _original_ account, not to the name's record. Transferring `alice01.dot` to another account does not transfer the reserved `alice.dot` claim. Reservations are not transferable; the original holder either claims or forfeits the reservation themselves.

## What a Product Should Know

A Product reading a name's record from chain state should treat the owner field as _mutable_. A name pointing at the Product today may be transferred to a new owner tomorrow; the new owner may update the `contenthash` to a different Product. Products that depend on a specific name (linking to it, referencing it from on-chain state) should verify the `contenthash` at use, not cache the assumption that "name X points at this Product forever."

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Name Mechanism**

    ---

    The resolution flow that turns a name into bytes — what a Host actually does between the user typing a `.dot` and a Product loading.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/name-mechanism/)

- <span class="badge learn">Learn</span> **Architecture**

    ---

    The contract responsibilities split, including which contract handles the transfer dispatch.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/architecture/)

</div>

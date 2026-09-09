---
title: Name Transfers
description: Transferring ownership of a .dot name to another account, covering which names can move, the transfer fee, and what the new owner inherits.
categories: Apps, Reference
---

# Name Transfers

## Introduction

A `.dot` name is owned by an account on Asset Hub. A transfer changes _who controls the name's record_: who can update where it points (its `contenthash`), sell it on, or set administrative fields, without changing the name itself or what it resolves to.

Not every name can move. A name registered on the public path is transferable. A name issued through the personhood gateway is soulbound and permanently non-transferable, so both the transfer and a fee quote for it are refused. Read `isSoulbound(tokenId)` on the registrar before offering a transfer.

This page documents the conceptual transfer flow and the rules dotNS enforces on it.

!!! warning "Provisional"
    The exact dispatch path for a name transfer (which contract call, the precise parameter shape) and the acceptance or rejection mechanics on the receiving side are still being finalized. This page documents the conceptual model and the rules the contracts enforce; the per-call reference will be added once confirmed.

## What Changes on Transfer

A transfer modifies one field of the name's record: the _owner_. Specifically:

- The new owner becomes the account that can sign updates to the name's record (changing the `contenthash`, transferring again, setting fields).
- The name itself — the dotted string the user sees — does not change.
- The currently-attached `contenthash` does not change. Users navigating to the name continue to see the same Product bundle they saw before, unless and until the new owner updates it.
- The PoP tier the original owner used to qualify for the name does _not_ transfer with the name. The new owner inherits the name regardless of their own PoP tier, and any later `PopRules`-evaluated operation is checked against the new owner's status.
- The deposit follows the name rather than the account that paid it.

## The Transfer Fee

Most transfers are free. A charge applies only when one of two independent conditions holds, and it is assessed against the name itself rather than against what the sender paid:

- **The recipient cannot clear the name's band**: Moving a name from a band the recipient could not have registered in, such as a six-character name going to an account without PoP Full.
- **The move is a personhood downgrade**: If the recipient holds a lower tier than the sender, the charge applies even when both could have registered a name of that length. Passing a nine-character name from a PoP Full holder to a PoP Lite holder is charged for this reason alone.

Whichever condition applies, the fee is the name's own price under the registered cost model rather than the sum of both. Because the deployed model charges one amount for every band, that is the same figure a fresh registration pays. Two moves are exempt even when a condition would otherwise hold: a transfer to the same address, and any transfer into or out of escrow, which is what makes releasing and reclaiming a name cost nothing beyond gas.

The registrar quotes the amount through `quoteTransferFee(tokenId, to)`. Quote it before submitting: the same call reverts for a soulbound name, which is the cheapest way to learn that a name cannot move at all.

## Reservations Do Not Transfer

A stem reserved for a Lite username holder to claim later as a full-person name is tied to the _account_ that the gateway named, not to the name's record. Transferring the Lite username does not carry the reservation with it, and reservations cannot be transferred on their own. The account the gateway named either claims the stem or lets the reservation lapse.

Since a gateway-issued Lite username is soulbound, this situation does not arise from a transfer of the username itself.

## What a Product Should Know

A Product reading a name's record from chain state should treat the owner field as _mutable_. A name pointing at the Product today may be transferred to a new owner tomorrow; the new owner may update the `contenthash` to a different Product. Products that depend on a specific name (linking to it, referencing it from on-chain state) should verify the `contenthash` at use, not cache the assumption that "name X points at this Product forever."

A buyer acquiring a name outside the registration path should know that a bare ERC-721 `transferFrom` does not route through the registry, so the name arrives still pointing at the seller's resolver. Registration and reclaim from escrow both reset that pointer; a private sale does not. Overwrite the records you care about rather than assuming they start clean.

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

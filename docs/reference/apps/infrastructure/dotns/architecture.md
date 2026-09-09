---
title: dotNS Architecture
description: The cooperating contracts on Asset Hub that back the dotNS registry — name records, ownership, content references, and PopRules enforcement.
categories: Apps, Reference
---

# Architecture

## Introduction

dotNS is implemented as a set of cooperating contracts on Asset Hub, not as a single monolithic registrar. The split exists because the responsibilities are genuinely different — managing name records, enforcing PopRules pricing, and handling transfers are separate jobs — and contract boundaries map cleanly onto those slices.

This page documents what each contract is responsible for at a conceptual level, so a Product developer building against the dotNS surface knows which contract handles which interaction.

!!! warning "Provisional"
    The complete contract map (every contract's name, address, ABI, and the precise responsibilities split between them) is still being finalized. This page documents the conceptual responsibilities; the per-contract reference will be added once the deployment is confirmed. The [TestNet Contracts](/reference/apps/infrastructure/dotns/testnet-contracts/) page tracks the current addresses as they stabilize.

## Conceptual Responsibilities

The contract set covers the registry's job in three families:

- **Registry core**: The contracts that hold the name records themselves:

    - A registry contract holding the `(namehash → record)` mapping and gating who can write to each record.
    - Resolver contracts responding to queries and holding the records themselves: the `contenthash`, addresses, text entries, chat keys, and reverse names. There is no separate records contract; a resolver is where a record lives.
    - A per-user label store holding the readable label strings for the names an account owns, which is the only route back from a `namehash` to the text it came from.

- **Registration and pricing**: The contracts that gate who can register what:

    - A PopRules contract that places a label in a length band and decides who may register it, with the deposit coming from a separately registered cost model.
    - A registrar contract that orchestrates the full registration flow: PopRules check, fee collection if applicable, write to the registry.
    - An escrow contract holding the deposits registrations pay. Deposits are refundable and stay in escrow, so no value is routed to a treasury.
    - A whitelist contract holding the per-name grants that the reserved registration path spends.

- **Lifecycle**: The contracts that handle changes after registration:

    - Owner-changes for an existing name, handled on the registrar itself through its fee-on-transfer hook and the escrow rather than by a separate contract. A gateway-issued personhood name is soulbound and cannot transfer at all. See [Name Transfers](/reference/apps/infrastructure/dotns/transfer/).
    - Governance-routed operations, which are not a contract of their own: grants are issued on the whitelist, market switches are set on PopRules, and each upgradeable contract authorizes its own upgrade through its owner.

A Product developer rarely interacts with the contracts directly — the [CLI](/reference/apps/infrastructure/dotns/cli/) and the higher-level [Register and Publish](/apps/deploy-your-app/) flow wrap the registration interactions. A Product reading name resolution data does so through the standard chain-client surface, calling into the resolver contract via the typed PAPI descriptor for Asset Hub.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **PopRules and Pricing**

    ---

    The bands the registrar contract evaluates against: name length, the PoP tier each band requires, and the deposit.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/poprules-pricing/)

- <span class="badge learn">Learn</span> **TestNet Contracts**

    ---

    The current TestNet addresses for the dotNS contract set, tracked as the surface stabilizes.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/testnet-contracts/)

</div>

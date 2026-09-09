---
title: dotNS Architecture
description: The cooperating contracts on Asset Hub that back the dotNS registry — name records, ownership, content references, and PopRules enforcement.
categories: Apps, Reference
---

# Architecture

## Introduction

dotNS is implemented as a set of cooperating contracts on Asset Hub, not as a single monolithic registrar. The split exists because the responsibilities are genuinely different: holding name records, deciding who may register a label, setting the deposit, and holding that deposit are separate jobs, and contract boundaries map cleanly onto those slices.

This page documents what each contract is responsible for at a conceptual level, so a Product developer building against the dotNS surface knows which contract handles which interaction.

!!! note "Per-contract ABIs are not documented here"
    This page documents conceptual responsibilities rather than per-contract interfaces. For the deployed contract names and their addresses, see [TestNet Contracts](/reference/apps/infrastructure/dotns/testnet-contracts/); generate the ABIs you build against from the artifact published with each release.

## Conceptual Responsibilities

Every contract resolves its siblings through a single protocol registry, a keyed address book that is the only address an integration has to configure by hand. The contract set behind it covers the registry's job in three families:

- **Registry core**: The contracts that hold the name records themselves:

    - A registry contract holding the `(namehash → record)` mapping and gating who can write to each record.
    - Resolver contracts responding to queries and holding the records themselves: the `contenthash`, addresses, text entries, chat keys, and reverse names. There is no separate records contract; a resolver is where a record lives.
    - A per-user label store holding the readable label strings for the names an account owns, which is the only route back from a `namehash` to the text it came from.
    - A lens contract listing the names issued to one person, for clients that enumerate a person's names rather than resolve a single one.

- **Registration and pricing**: The contracts that gate who can register what:

    - A PopRules contract that places a label in a length band and decides who may register it, with the deposit coming from a separately registered cost model.
    - A registrar contract that orchestrates the full registration flow: PopRules check, fee collection if applicable, write to the registry. The registrar is also the ERC-721 that carries ownership, so owning a name means holding its token.
    - An escrow contract holding the deposits registrations pay. Deposits are refundable and stay in escrow, so no value is routed to a treasury.
    - A cost model registry naming the pricing contract in force, which governance can repoint. The deployed model charges one deposit for every name it admits, whatever its length.
    - A whitelist contract holding the per-name grants that the reserved registration path spends.

- **Lifecycle**: How changes after registration are handled, in neither case by a contract of its own:

    - Owner-changes for an existing name, handled on the registrar itself through its fee-on-transfer hook and the escrow rather than by a separate contract. A gateway-issued personhood name is soulbound and cannot transfer at all. See [Name Transfers](/reference/apps/infrastructure/dotns/transfer/).
    - Governance-routed operations, spread across the contracts they act on: grants are issued on the whitelist, market switches are set on PopRules, and each upgradeable contract authorizes its own upgrade through its owner.

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

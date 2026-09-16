---
title: dotNS Architecture
description: The cooperating contracts on Polkadot Hub that back the dotNS registry, covering name records, ownership, content references, and PopRules enforcement.
categories: Apps, Reference
---

# Architecture

## Introduction

dotNS is implemented as a set of cooperating contracts on Polkadot Hub, not as a single monolithic registrar. The split exists because the responsibilities are genuinely different: holding name records, deciding who may register a label, setting the deposit, and holding that deposit are separate jobs, and each gets its own contract.

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
    - Controller contracts that orchestrate the registration flow: the PopRules check, fee collection if applicable, and the write to the registry. The public commit-reveal path and the personhood gateway are separate controllers.
    - A registrar contract that is the ERC-721 carrying ownership of public and personhood names, so owning one means holding its token. It mints and burns on a controller's instruction and holds no pricing or personhood policy of its own. A device name is the exception: it has no token, and its ownership lives on the registry record as a subname under a controller-held container.
    - An escrow contract holding the deposits registrations pay. Deposits are refundable and stay in escrow, so no value is routed to a treasury. It also runs the release, redeem, withdraw, and reclaim lifecycle by which a name returns to circulation. See [Escrow and Deposits](/reference/apps/infrastructure/dotns/escrow/).
    - A cost model registry naming the pricing contract in force, which governance can repoint. The deployed model charges one deposit for every name it admits, whatever its length.
    - A whitelist contract holding the per-name grants that the reserved registration path spends.

- **Lifecycle**: What happens to a name after registration. Neither case has a contract of its own:

    - Owner changes for an existing name happen on the registrar itself, through its fee-on-transfer hook and the escrow. A gateway-issued name cannot transfer at all: a personhood name is a soulbound token, and a device name has no token. See [Name Transfers](/reference/apps/infrastructure/dotns/transfer/).
    - Governance-routed operations, spread across the contracts they act on: grants are issued on the whitelist, and each upgradeable contract authorizes its own upgrade through its owner.

A Product developer rarely interacts with the contracts directly: the [CLI](/reference/apps/infrastructure/dotns/cli/) and the higher-level [Register and Publish](/apps/deploy-your-app/) flow wrap the registration interactions. A Product reading name resolution data does so through the standard chain-client surface, calling into the resolver contract via the typed PAPI descriptor for Polkadot Hub.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **PopRules and Pricing**

    ---

    The bands PopRules evaluates: name length, the PoP tier each band requires, and the deposit.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/poprules-pricing/)

- <span class="badge learn">Learn</span> **TestNet Contracts**

    ---

    The current TestNet addresses for the dotNS contract set, tracked as the surface stabilizes.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/testnet-contracts/)

</div>

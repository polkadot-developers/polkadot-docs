---
title: dotNS Architecture
description: The cooperating contracts on Asset Hub that back the dotNS registry — name records, ownership, content references, and PopRules enforcement.
categories: Apps, Reference
---

# Architecture

## Introduction

dotNS is implemented as a **set of cooperating contracts on Asset Hub**, not as a single monolithic registrar. The split exists because the responsibilities are genuinely different — managing name records is a different job from enforcing PopRules pricing is a different job from handling transfers — and contract boundaries map cleanly onto those slices.

This page documents what each contract is responsible for at a conceptual level, so a Product developer building against the dotNS surface knows which contract handles which interaction.

!!! warning "Provisional"
    The complete contract map (every contract's name, address, ABI, and the precise responsibilities split between them) is still being finalized. This page documents the conceptual responsibilities; the per-contract reference will be added once the deployment is confirmed. The [Testnet Contracts](/reference/apps/infrastructure/dotns/testnet-contracts/){target=\_blank} page tracks the current addresses as they stabilize.

## Conceptual Responsibilities

The contract set covers nine slices of the registry's job, grouped into three families:

**Registry core.** The contracts that hold the name records themselves:

- A **registry** contract holding the `(namehash → record)` mapping and gating who can write to each record.
- A **resolver** contract responding to queries — read-side surface for "what record does this namehash currently have?"
- A **records** contract or substructure storing the `contenthash`, owner, and other per-name fields a resolver returns.

**Registration and pricing.** The contracts that gate who can register what:

- A **PopRules** contract that evaluates a proposed registration against the pricing ladder (name length × PoP tier × suffix → free or deposit).
- A **registrar** contract that orchestrates the full registration flow: PopRules check, fee collection if applicable, write to the registry.
- A **deposit / treasury** contract managing the deposits paid by open-tier registrations.

**Lifecycle.** The contracts that handle changes after registration:

- A **transfer** contract handling owner-changes for an existing name. See [Name Transfers](/reference/apps/infrastructure/dotns/transfer/){target=\_blank}.
- A **renewal** contract (or sub-mechanism) handling annual or per-period renewals where applicable.
- An **admin** / **governance** contract for operations that need to be governance-routed (reserved-name allocations, dispute resolution, contract upgrades).

A Product developer rarely interacts with the contracts directly — the [CLI](/reference/apps/infrastructure/dotns/cli/){target=\_blank} and the higher-level [Register and Publish](/apps/deploy-and-publish/register-and-publish/){target=\_blank} flow wrap the registration interactions. A Product reading name resolution data does so through the standard chain-client surface, calling into the resolver contract via the typed PAPI descriptor for Asset Hub.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **PopRules and Pricing**

    ---

    The ladder the registrar contract evaluates against — name length, PoP tier, deposit amounts.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/poprules-pricing/)

- <span class="badge learn">Learn</span> **Testnet Contracts**

    ---

    The current TestNet addresses for the dotNS contract set, tracked as the surface stabilizes.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/testnet-contracts/)

</div>

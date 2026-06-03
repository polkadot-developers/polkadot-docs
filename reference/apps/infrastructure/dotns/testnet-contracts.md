---
title: dotNS TestNet Contracts
description: Current Paseo TestNet contract addresses for the dotNS registry — registry core, registration and pricing, and lifecycle contract families.
categories: Apps, Reference
---

# TestNet Contracts

## Introduction

This page tracks the current TestNet contract addresses for the dotNS deployment on Paseo. A Product or tool that wants to interact with the registry directly on TestNet needs these addresses; the higher-level CLI and Polkadot Product SDK surfaces resolve them internally, but anyone integrating below those layers can look up what to call here.

!!! warning "Provisional"
    The current TestNet contract addresses are still being finalized as the dotNS deployment stabilizes. Addresses can change across redeployments during this window. The table below will be populated and kept in sync as the deployment is confirmed; until then, the [CLI](/reference/apps/infrastructure/dotns/cli/) and the [Register and Publish](/apps/deploy-and-publish/register-and-publish/) flow target the current deployment automatically, and most developers should rely on those rather than calling contracts directly.

## Contract Address Table

| Contract    | Responsibility                                                    | Paseo TestNet Address |
|:------------|:------------------------------------------------------------------|:----------------------|
| `Registry`  | Holds `(namehash → record)` mappings; gates writes per-record.    | _TBD_                 |
| `Resolver`  | Read-side query surface for name records.                         | _TBD_                 |
| `Records`   | Stores `contenthash`, owner, and per-name administrative fields.  | _TBD_                 |
| `Registrar` | Orchestrates registration: PopRules check, fee collection, write. | _TBD_                 |
| `PopRules`  | Evaluates a proposed registration against the pricing ladder.     | _TBD_                 |
| `Deposit`   | Manages deposits paid by open-tier registrations.                 | _TBD_                 |
| `Transfer`  | Handles owner-changes for an existing name.                       | _TBD_                 |
| `Renewal`   | Handles renewals where they apply.                                | _TBD_                 |
| `Admin`     | Governance-routed operations (reserved names, contract upgrades). | _TBD_                 |

Addresses will appear in this table as the deployment is confirmed. In the meantime, the SDK and CLI resolve the right targets automatically.

## How to Use These Addresses

For Products that need to read name resolution data directly (most don't — the chain client surface and the resolution code in each Host handle this), point your typed chain client at the resolver contract address using the standard PAPI descriptor for Asset Hub. The query is a standard contract call; the resolver returns the record fields you read against.

For tools or batch jobs that need to mutate state (a CI pipeline registering a name on every release, for example), use the [`@parity/dotns-cli`](/reference/apps/infrastructure/dotns/cli/) instead of building contract calls by hand. The CLI handles the encoding, the PopRules pre-check, and the signing path consistently.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **CLI**

    ---

    The command-line surface that targets these contracts automatically.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/cli/)

- <span class="badge learn">Learn</span> **Architecture**

    ---

    What each contract in the table above is responsible for and how they cooperate.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/architecture/)

</div>

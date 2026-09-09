---
title: dotNS TestNet Contracts
description: Current Paseo TestNet contract addresses for the dotNS registry, what each contract is responsible for, and how to resolve the rest from one address.
categories: Apps, Reference
---

# TestNet Contracts

## Introduction

This page tracks the current TestNet contract addresses for the dotNS deployment on Paseo. A Product or tool that wants to interact with the registry directly on TestNet needs these addresses; the higher-level CLI and Polkadot Product SDK surfaces resolve them internally, but anyone integrating below those layers can look up what to call here.

!!! note "Resolve addresses rather than pinning them"
    The [CLI](/reference/apps/infrastructure/dotns/cli/) and the [Register and Publish](/apps/deploy-your-app/) flow resolve these addresses automatically, and most developers should rely on those rather than calling contracts directly. An integration that does call contracts should hold only the protocol registry address and resolve the rest from it.

## Contract Address Table

| Contract                   | Responsibility                                                                       | Paseo TestNet Address |
|:---------------------------|:------------------------------------------------------------------------------------|:---------------------------------------------|
| `DotnsProtocolRegistry`    | Keyed address book every other contract resolves its siblings through.               | `0xD19e3D0C97CF501125a04A97405e3e6592fa846E` |
| `DotnsRegistry`            | Holds `(namehash → record)` mappings, subnodes, and resolver pointers.               | `0xf34054fd76BbF85f216cf9908226D5f0A72E50CA` |
| `DotnsRegistrar`           | The ERC-721. Owning a name means holding its token.                                  | `0x4f06E818Ba3d987704fd91cf3d868E4b019106Ab` |
| `DotnsRegistrarController` | The public commit-reveal registration path.                                          | `0xBdaA01bD1bA67d709F2b1fF286Da0d854977EA30` |
| `DotnsPopController`       | The personhood gateway path, and the `isPopIssued` provenance record.                | `0xCC932348606cc1f3318cADeC5A5Cd2CA447f8a4b` |
| `DotnsPopLens`             | Listing surface for a person's names, gated on `isPopIssued`.                        | `0xfe5A45f7fD58D1A6FE09455DB799405b1dcE9411` |
| `PopRules`                 | Classification and eligibility: which band a label falls in and who may register it. | `0x747B456bE03aec0b42bd85C51513730FBD45DA31` |
| `DotnsCostModelRegistry`   | Names the cost model in force, which is what sets the deposit.                       | `0x8bfd1f0957e73716732e725802f13830B5682da4` |
| `DotnsFlatPricing`         | The registered model itself: one deposit for every band.                             | `0xD839B281dF72Df44fF275305E72cAEEc0fDAA648` |
| `DotnsNameEscrow`          | Holds deposits and runs the release, redeem, and reclaim lifecycle.                  | `0x4881Afb78e7C908cAe818168B926229D93376520` |
| `DotnsNameWhitelist`       | Per-name grants for reserved registration.                                           | `0x420166cD67Ca0233094E492a4BbA67045eD7C38C` |
| `DotnsContentResolver`     | The `contenthash` record a Product resolves through.                                 | `0x7F74D7CD50f5a834270E2ad395a01b01891AB37d` |
| `StoreFactory`             | Deploys the per-user label store that maps a node back to its text.                  | `0x709A027F446a9e2a4BB9cb9a9c754435b19e32B7` |

<!-- TODO: link the release page or repository that publishes `deployments.json`, so a reader can reach the authoritative artifact. -->

These addresses come from the `paseo-assethub` deployment artifact published with each dotNS contracts release, on chain ID `420420417`. The `deployments.json` asset attached to that release is the authoritative source if this table falls behind a tag.

Only `DotnsProtocolRegistry` needs to be configured by hand. Every other address is resolved from it at call time, so an integration that holds the registry address can find the rest without pinning them.

Addresses are derived from a CREATE3 factory and a fixed salt namespace, so redeploying to the same network reproduces them. An unchanged address is not evidence of an unchanged interface: regenerate the ABIs you build against on every release.

## How to Use These Addresses

For Products that need to read name resolution data directly (most don't — the chain client surface and the resolution code in each Host handle this), point your typed chain client at `DotnsContentResolver` using the standard PAPI descriptor for Asset Hub, resolving its address from `DotnsProtocolRegistry` rather than pinning it. The query is a standard contract call; the resolver returns the record fields you read against.

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

---
title: dotNS MainNet Contracts
description: Polkadot MainNet contract addresses for the dotNS registry, what each contract is responsible for, and how to resolve the rest from one address.
categories: Apps, Reference
---

# MainNet Contracts

## Introduction

This page lists the contract addresses for the dotNS deployment on Polkadot Hub. A Product or tool that calls the registry directly on MainNet needs these addresses; the [CLI](/reference/apps/infrastructure/dotns/cli/) ships with them for its `polkadot` environment.

!!! note "Resolve addresses rather than pinning them"
    An integration that calls contracts should hold only the protocol registry address and resolve the rest from it.

## Contract Address Table

| Contract                   | Responsibility                                                                       | Polkadot MainNet Address                     |
|:---------------------------|:------------------------------------------------------------------------------------|:---------------------------------------------|
| `DotnsProtocolRegistry`    | Keyed address book every other contract resolves its siblings through.               | `0x371693bEeAD209FBb94E2Fe5a6E43C3C15fe376F` |
| `DotnsRegistry`            | Holds `(namehash → record)` mappings, subnodes, and resolver pointers.               | `0x1Ae9a72865eC7092fC7036892f3349748d31A71e` |
| `DotnsRegistrar`           | The ERC-721 for public and personhood names. A device name has no token.             | `0x37442d086e282F7C497FC4Ffe00D0A06B84a1f81` |
| `DotnsRegistrarController` | The public commit-reveal registration path.                                          | `0x76c19abE11404e43445670F13173AFA60BED53f8` |
| `DotnsPopController`       | The personhood gateway path, and the `isPopIssued` provenance record.                | `0xA06d1CB1e3FedFF7b5dFa779b4Cc61703F8A46A1` |
| `DotnsPopLens`             | Listing surface for a person's names, gated on `isPopIssued`.                        | `0xE98fE2437eEc5e867B232409D29dAE61A0255C31` |
| `PopRules`                 | Classification and eligibility: which band a label falls in and who may register it. | `0x088C8de68FD3c199E64C65153B3B628760413BD7` |
| `DotnsCostModelRegistry`   | Names the cost model in force; that model is where the deposit amount lives.         | `0xc6ef04dcD0f7d4F8E6d918d8101eC5f9D5a16198` |
| `DotnsFlatPricing`         | The registered model itself: one deposit for every band.                             | `0x1Ad2d2078adEd836eced1D1ac297Cb664Da8DE75` |
| `DotnsNameEscrow`          | Holds deposits and runs the release, redeem, withdraw, and reclaim lifecycle.        | `0xd76134522FAF788F8dF110E1166441E4468d2c81` |
| `DotnsNameWhitelist`       | Per-name grants for reserved registration.                                           | `0xEc2f4c007b51c35DEfa96bF654f357Fc850362Ab` |
| `DotnsContentResolver`     | The `contenthash` record a Product resolves through.                                 | `0xF460c6406217E62A0d2717cD45D6385fe5832001` |
| `StoreFactory`             | Deploys the per-user label store that maps a node back to its text.                  | `0xFe75036170a5c800a939DF476D756c3d8FF56A8A` |

These addresses belong to the Polkadot Hub deployment, on chain ID `420420419`, which runs [dotNS `1.0.0`](https://github.com/paritytech/dotns/releases/tag/v1.0.0) under the `.dot` TLD and is operated by the [Polkadot Community Foundation](https://docs.polkadotcommunity.foundation/). They differ from the [TestNet Contracts](/reference/apps/infrastructure/dotns/testnet-contracts/). The dotNS repository records them in [`deployments/polkadot/420420419.json`](https://github.com/paritytech/dotns/blob/master/deployments/polkadot/420420419.json), and the protocol registry is the authoritative source: `get(key)` returns the address each key points at now.

Only `DotnsProtocolRegistry` needs to be configured by hand. Every other address is resolved from it at call time, so an integration that holds the registry address can find the rest without pinning them.

## How to Use These Addresses

To read name resolution data directly, point your typed chain client at `DotnsContentResolver` using the standard PAPI descriptor for Polkadot Hub, resolving its address from `DotnsProtocolRegistry` rather than pinning it. The query is a standard contract call; the resolver returns the record fields you read against.

For tools or batch jobs that need to mutate state (a CI pipeline registering a name on every release, for example), use the [`@parity/dotns-cli`](/reference/apps/infrastructure/dotns/cli/) instead of building contract calls by hand. The CLI targets this deployment by default and handles the encoding, the PopRules pre-check, and the signing path consistently.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **CLI**

    ---

    The command-line surface that targets these contracts by default.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/cli/)

- <span class="badge learn">Learn</span> **TestNet Contracts**

    ---

    The Paseo TestNet addresses, for building and testing before you register on MainNet.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/testnet-contracts/)

</div>

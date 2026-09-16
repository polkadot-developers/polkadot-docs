---
title: PopRules and dotNS Pricing
description: How dotNS decides who may register a .dot name and what it costs, covering the three length bands, the deposit, and gateway-issued personhood names.
categories: Apps, Reference
---

# PopRules and Pricing

## Introduction

`PopRules` decides which length band a `.dot` name falls in, and with it who may register the name. Proof of Personhood (PoP) gates the shorter bands. It does not change the amount charged.

The amount comes from a separate cost model registered in the protocol registry. The deployed model charges one refundable deposit for every name it admits, whatever its length; the deposit is not a purchase price. Governance can replace the model, so a future release may price bands differently.

This page documents the bands, the two PoP tiers `PopRules` recognizes, and how device and personhood names differ from a name bought on the public path.

## The Three Registration Paths

A name reaches an owner by one of three routes, and most of the rules on this page apply to only one of them:

- **The public path**: The commit-reveal route the CLI and the deploy flow use. It charges the deposit, applies the length bands, rejects any label carrying a separator, and refuses a label shorter than three characters.
- **The personhood gateway**: The route that issues device and personhood names. It charges no deposit and refuses a stem of five characters or fewer. Gateway names cannot be transferred; see [Name Transfers](/reference/apps/infrastructure/dotns/transfer/).
- **The reserved path**: The governance route that puts names of five characters or fewer into circulation. It mints an available label at no cost and skips the personhood check. It requires a governance-issued grant naming the label and the intended owner, or a Substrate Root origin.

## The Two PoP Tiers

`PopRules` recognizes two personhood tiers, registered separately on the People Chain:

- **PoP Full**: Proven personhood. The user completes the biometric verification flow in the Polkadot App and their key joins the membership ring on the People Chain.
- **PoP Lite**: Attested proof of a unique device, registered on a separate ring with a governance-bounded supply.

[Proof of Personhood in the Polkadot App](/reference/apps/hosts/polkadot-app/pop/) documents both mechanisms.

`PopRules` reads an account's tier from the personhood precompile on Polkadot Hub. It passes a dotNS-scoped context, so a person gets one stable identifier for dotNS that other applications cannot correlate. No tier is self-declared, and no contract holds a user-settable status.

## Length Bands on the Public Path

A name's band comes from its length, counted as written. Digits count like any other character, so `web3` is four characters and `hamilton01` is 10.

| Length     | Who may register            | Deposit                 |
|:-----------|:----------------------------|:------------------------|
| 5 or fewer | Nobody on the public path   | Not sold                |
| 6 to 8     | An account holding PoP Full | One deposit, refundable |
| 9 or more  | Anyone                      | One deposit, refundable |

The deposit is 10 units of the network's native token (10 PAS on Paseo), and it does not vary with the band. See [One Deployment per Network](/reference/apps/infrastructure/dotns/#one-deployment-per-network).

Only the public path charges it. A gateway-issued name carries no deposit, whatever its length, and holding PoP Full does not make a public registration free.

PoP Lite does not open the six-to-eight band. An ordinary label of that length requires PoP Full, because the Lite requirement attaches only to the dotted gateway shape. A Lite holder can therefore be issued `joseph.42` but cannot register `joseph` or `joseph01` on the public path.

Two rules narrow the table:

- **Names of five characters or fewer never reach the public path**: They enter circulation only through the reserved path.
- **Nothing shorter than three characters reaches the public path or the gateway**: The public path rejects a shorter label outright. The gateway applies no length floor of its own, but a stem of five or fewer classifies as reserved, so it refuses one too.

## Device and Personhood Names

A gateway name is earned rather than bought, so it carries no deposit. Proving full personhood earns a personhood name; proving a unique device (Lite personhood) earns a device name. Contract messages and tiers still say Lite and Full; those are the proofs, and device and personhood names are what they earn. The two shapes are distinct:

- **Device name**: A stem of lowercase ASCII letters, one separator, then exactly two digits, as in `joseph.42`. The stem is the part the person chose; the gateway allocates the digits so people who chose the same stem get separate names. It is banded on the stem alone rather than on the whole name.
- **Personhood name**: Lowercase ASCII letters only, as in `joseph`. No digits and no hyphens.

Neither shape can be bought. A label with digits but no separator, like `joseph42`, is an ordinary public name.

The shape alone does not prove personhood: provenance is not written into the characters. A client reads it from `isPopIssued(label)` on the PoP controller; see [Name Mechanism and Resolution](/reference/apps/infrastructure/dotns/name-mechanism/).

## Migrating a Device Name to a Personhood Name

A device-name issuance can reserve the matching stem for the same person to claim later as a personhood name, so that upgrading from Lite to Full personhood does not cost them the name they are known by.

The reservation is not automatic on a public registration, which reserves no stem at all. It is attached by the gateway, which names the base label to reserve alongside the device name it is issuing. A holder of `joseph.42` can therefore have `joseph` held for them, and claim it once they hold PoP Full.

Two clocks limit the reservation. `PopRules` holds the slot for at most 12 weeks, and the queue on the PoP controller applies its own duration, which governance can configure. Once either lapses, the stem becomes available again on whatever path its length allows.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    Where the `PopRules` contract reads the PoP tier from — the App-side mechanism that produces Full and Lite registrations.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pop/)

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The Product-side how-to that consumes the PopRules check: registering a `.dot` name and paying its deposit.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-your-app/)
</div>

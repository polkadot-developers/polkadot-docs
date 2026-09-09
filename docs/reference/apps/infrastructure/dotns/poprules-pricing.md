---
title: PopRules and dotNS Pricing
description: How dotNS decides who may register a .dot name and what it costs, covering the three length bands, the deposit, and gateway-issued personhood names.
categories: Apps, Reference
---

# PopRules and Pricing

## Introduction

`PopRules` decides two things about a `.dot` name: which band its length places it in, and therefore who may register it. Proof of Personhood (PoP) gates eligibility for the shorter bands. It does not change the amount charged.

The amount comes from a separate cost model, registered in the protocol registry and replaceable by governance. The deployed model charges one deposit for every name it admits, whatever its length, and that deposit is refundable rather than a purchase price. Because the model is replaceable, governance can register a length-sensitive one, so a future release may price bands differently.

This page documents the bands, the two PoP tiers `PopRules` recognizes, and how a personhood username differs from a name bought on the public path.

## The Three Registration Paths

A name reaches an owner by one of three routes, and most of the rules on this page apply to only one of them:

- **The public path**: The commit-reveal route the CLI and the deploy flow use. It charges the deposit, applies the length bands, rejects any label carrying a separator, and refuses a label shorter than three characters.
- **The personhood gateway**: The route that issues a personhood username. It charges no deposit, issues the name soulbound so it can never transfer, does not consult the short-name market switch, and refuses a stem of five characters or fewer.
- **The reserved path**: The governance route by which a name of five characters or fewer enters circulation. It mints an available label at no cost and skips the personhood check, and it requires either a governance-issued grant naming the label and the intended owner, or a Substrate Root origin.

## The Two PoP Tiers

`PopRules` recognizes two personhood tiers, registered separately on the People Chain:

- **PoP Full**: Cryptographically proven personhood, the destination state. The user completes the full biometric verification flow in the Polkadot App; their key joins the active membership ring on the People Chain. PoP Full holders can generate zero-knowledge proofs of personhood. See the [Proof of Personhood reference](/reference/apps/hosts/polkadot-app/pop/) for details.
- **PoP Lite**: Third-party attestation. An authorized attester submits an on-chain attestation that an account belongs to a real user; the account is registered against a separate `lite-people` ring. Lite supply is bounded by governance — it is the on-ramp; Full is the destination.

`PopRules` reads an account's tier from the personhood precompile on Asset Hub, passing a dotNS-scoped context so the same person receives a stable identifier for dotNS that cannot be correlated with other applications. No tier is self-declared, and no contract holds a user-settable status.

## Length Bands on the Public Path

A name's band comes from its length, counted as written. Digits count like any other character, so `web3` is four characters and `hamilton01` is 10.

| Length     | Who may register            | Deposit                 |
|:-----------|:----------------------------|:------------------------|
| 5 or fewer | Nobody on the public path   | Not sold                |
| 6 to 8     | An account holding PoP Full | One deposit, refundable |
| 9 or more  | Anyone                      | One deposit, refundable |

The deposit is 10 units of the network's native token, so 10 DOT on Polkadot and 10 PAS on Paseo, and it does not vary with the band. See [One Deployment per Network](/reference/apps/infrastructure/dotns/#one-deployment-per-network).

Only the public path charges it. A personhood username issued through the gateway carries no deposit, whatever its length, and holding PoP Full does not make a public registration free.

PoP Lite does not open the six-to-eight band. An ordinary label of that length classifies as requiring PoP Full, because the Lite requirement attaches only to the separated gateway form. A Lite holder can therefore be issued `joseph.42` but cannot register `joseph` or `joseph01` on the public path.

Three constraints qualify the table:

- **The band below nine characters is closed until governance opens it**: A paid registration of eight characters or fewer is refused while the short-name switch is off, whatever tier the caller holds. The switch gates the public paid path alone. The personhood gateway issues names without consulting it.
- **Names of five characters or fewer never reach the public path**: They enter circulation only through the reserved path.
- **Nothing shorter than three characters reaches the public path or the gateway**: The public path rejects a shorter label outright. The gateway applies no length floor of its own, but a stem of five or fewer classifies as reserved, so it refuses one too.

## Personhood Usernames

A personhood username is issued through the gateway rather than bought, so it carries no deposit. The two shapes are distinct:

- **Lite username**: A stem of lowercase ASCII letters, one separator, then exactly two digits, as in `joseph.42`. The separator is part of the label: the name is stored, minted, and hashed as one whole label rather than as a path. It is banded on the stem alone rather than on the whole label, because the gateway allocates the digits to separate people who chose the same stem.
- **Full-person name**: Lowercase ASCII letters only, as in `joseph`. No digits and no hyphens.

Neither shape can be bought. The public registration path rejects any label carrying a separator, so a Lite username can only arrive through the gateway, and a name spelled to resemble one is an ordinary public name.

That distinction matters to any client deciding whether a name identifies a person. `joseph.42` reads as one person to the personhood system and as `joseph` beneath `42` to the hierarchical registry, and the characters alone cannot say which. Read `isPopIssued(label)` on the PoP controller instead of inferring identity from the shape of a string.

!!! note "Digits no longer mark a Lite name"
    Earlier releases stripped a two-digit suffix before measuring a name, which made `alice01` a Lite shape. Digits are no longer stripped from an ordinary label, so `alice01` is a seven-character name in the six-to-eight band, and `hamilton01` is open to anyone because it is 10 characters rather than because it carries a suffix.

## Lite to Full Migration Reservation

A Lite issuance can reserve the matching stem for the same person to claim later as a full-person name, so that upgrading from Lite to Full does not cost them the name they are known by.

The reservation is not automatic on a public registration, which reserves no stem at all. It is attached by the gateway, which names the base label to reserve alongside the Lite username it is issuing. A holder of `joseph.42` can therefore have `joseph` held for them, and claim it once they hold PoP Full.

Two durations bound the mechanism. `PopRules` holds a reservation slot for at most 12 weeks, and the queue on the PoP controller applies its own duration, which governance can configure. Once either lapses, the stem returns to whichever path its own length admits.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    Where the `PopRules` contract reads the PoP tier from — the App-side mechanism that produces Full and Lite registrations.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pop/)

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The Product-side how-to that consumes the PopRules check — registering a `.dot` name and paying its deposit.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-your-app/)
</div>

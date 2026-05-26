---
title: pallet-identity Reference
description: The People Chain identity record associated with a PoP account — what it stores, how it relates to aliases, and how a Product reads from it.
categories: Apps, Reference
---

# `pallet-identity`

## Introduction

**`pallet-identity`** is the People Chain pallet that holds the **on-chain identity record** associated with an account. It is not part of the alias machinery (aliases live in `pallet-people`); it is the place where a verified account's *direct* identity — the fields associated with the account itself, not its per-context pseudonyms — lives.

For Product developers, the distinction matters: most personhood-gated flows reach for aliases (`under_alias`, `getAnonymousAlias`) because aliases preserve unlinkability. `pallet-identity` is the relevant pallet when the Product genuinely needs to read or write the user's *direct* identity record — for example, to display a username the user has explicitly set on their account.

!!! warning "Provisional"
    The exact dispatch surface of `pallet-identity` on the current build — the supported identity fields, the extrinsics that set them, and the verification rules — is still being finalized. This page documents the conceptual responsibilities; per-extrinsic specifics will be added once confirmed.

## What the Pallet Records

An identity record typically contains:

- **A username** — the human-readable name the user has set on their account, useful for display in cases where the user has opted in to a public-facing handle.
- **Display fields** — additional administrative or display-oriented fields the user has chosen to associate with their account on-chain.
- **Verification metadata** — markers indicating which of the fields have been verified by an authorized verifier, if applicable.

The fields are public — anyone reading chain state can see them. The user is the only party that can write to their own record (subject to the standard signing model).

## Identity vs. Aliases

A useful framing for picking the right pallet:

| You need to… | Use… |
|:---|:---|
| Recognize "the same real person" in your Product without revealing who they are | An **alias** from `pallet-people` |
| Display a username the user has chosen publicly | `pallet-identity`'s username field |
| Check whether a user is a verified person (yes/no, not who) | A Ring-VRF proof from `pallet-people` |
| Display the user's verified display name in a public context | `pallet-identity` fields |
| Gate access on personhood | `under_alias` against a PoP pallet |
| Gate access on the specific user behind an alias | This is what aliases *cannot* do — that link is intentionally severed |

## When to Use From a Product

A Product reaches for `pallet-identity` rarely. Most Products preserve unlinkability and never touch the user's direct identity. The pallet is the right tool when:

- The user has **opted in to a public-facing presence** in your Product context (a profile name, a public display name, a verified-handle badge), and you want to read or set that.
- Your Product **bridges to off-chain identity systems** that need the user's direct identity rather than a per-Product alias.

When in doubt, prefer aliases — they preserve the privacy default.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **pallet-people**

    ---

    The pallet that issues aliases — the unlinkable alternative to direct identity that most Products should prefer.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/pallet-people/)

- <span class="badge learn">Learn</span> **Ring-VRF and Aliases**

    ---

    The mechanism that makes aliases unlinkable and why most Product use cases prefer aliases over direct identity reads.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/ring-vrf-and-aliases/)

</div>

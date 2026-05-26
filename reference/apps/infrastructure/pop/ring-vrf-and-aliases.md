---
title: Ring-VRF and Aliases
description: How Polkadot's Proof of Personhood produces unlinkable per-Product aliases using Ring-VRF cryptography, and how the under_alias runtime origin lets pallets gate on aliases instead of accounts.
categories: Apps, Reference
---

# Ring-VRF and Aliases

## Introduction

The privacy property Polkadot's Proof of Personhood delivers — *"two Products cannot correlate that they share a user without an explicit cross-domain grant"* — rests on two pieces of machinery: **Ring-VRF**, the cryptographic primitive that produces context-specific pseudonyms; and the **`under_alias`** runtime origin, the mechanism that lets pallets gate logic on those pseudonyms instead of on raw accounts.

This page is the conceptual deep dive on both. The Product-side how-to for using them is [Use Personhood in Your App](/apps/build/use-personhood-in-your-app/){target=\_blank}; the App-side reference for *where* PoP runs is the [Polkadot App's Proof of Personhood](/reference/apps/hosts/polkadot-app/pop/) page.

## What PoP Produces

When a user completes Proof of Personhood in the Polkadot App, the result is **membership in a ring** on the People Chain. A "ring" here is the cryptographic group of all currently-verified persons; being in the ring is what makes the user's later proofs valid.

Two rings coexist on the People Chain:

- The **full personhood ring** — accounts that completed the biometric PoP flow (PoP Full). Membership requires the full verification ceremony.
- The **lite-people ring** — accounts that received a governance-authorized attestation (PoP Lite). A separate ring; supply is bounded by governance.

Both rings produce Ring-VRF proofs; what differs is the strength of the membership claim each ring represents.

## What an Alias Is

An **alias** is a *context-specific pseudonym* derived from the user's ring membership. Three properties define it:

- **Anchored in personhood.** A valid Ring-VRF proof over an alias is also a valid proof of personhood for the user behind it — the alias *is* the personhood claim, scoped to the specific context.
- **Scoped to a context.** The context is typically a Product's `.dot` domain. The same user produces a consistent alias every time they return to the same Product, but a different alias when they use any other Product.
- **Verifiable without revealing the account.** A verifier confirms "this alias belongs to a real person in the ring" using a Ring-VRF proof. The verifier learns the alias, not the account behind it.

That last property is the load-bearing one for privacy: aliases are **unlinkable across Products by design**. If two Products could compare their alias lists, every Product would turn into a tracking surface. The alias model makes that combination impossible by default — and the cross-domain alias path (where Product A asks for an alias scoped to Product B's `.dot`) is gated by an explicit user-consent modal.

## The `under_alias` Runtime Origin

For on-chain operations, Polkadot's runtime exposes the **`under_alias`** dispatchable origin. A user dispatches a call wrapped in `under_alias` and the runtime verifies the underlying Ring-VRF proof before letting the inner call execute. Inside the called pallet, the origin resolves to the user's **alias** — not the user's account — so the pallet's state stays unlinkable to the account that triggered it.

Two kinds of pallets consume `under_alias` differently:

- **Alias-gated pallets** key on the alias value itself. The pallet's storage maps from alias to some per-alias state (a vote, a score, a balance, a registration). Two visits from the same user produce the same alias, so the pallet recognizes "the same person came back," but the pallet's storage carries no link back to the user's account.
- **Personhood-gated pallets** key on the proof itself, not the alias value. The pallet only needs to know that *some* verified person performed the action; the alias is discarded after the proof check. Useful for "any verified person gets a fee allowance" patterns.

Both shapes are documented per-pallet in the rest of this section.

## Cross-Product Aliases

A Product can request an alias scoped to **another** Product's `.dot` domain. This is the only path by which two Products can cryptographically confirm they share a user. The request triggers a user-consent modal — the user has to explicitly grant the cross-domain alias before the request succeeds. Without that grant, the unlinkability default holds.

## Related Concepts (Glossary Cross-References)

A few related terms come up in the broader PoP literature and have their own short glossary entries:

- **DIM** — *(definition lives in the glossary)*
- **Sell-out** — *(definition lives in the glossary)*
- **Recycler** — *(definition lives in the glossary)*
- **Lite-person** — the user-facing name for an account registered in the lite-people ring; see [PopRules and Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/) for how Lite tier interacts with `.dot` name registration.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **pallet-people**

    ---

    The pallet that issues aliases and implements the `under_alias` origin — the foundation of the PoP pallet set.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/pallet-people/)

- <span class="badge guide">Guide</span> **Use Personhood in Your App**

    ---

    The Product-side how-to for alias-gated off-chain checks and `under_alias` on-chain dispatch.

    [:octicons-arrow-right-24: Get Started](/apps/build/use-personhood-in-your-app/){target=\_blank}

- <span class="badge learn">Learn</span> **Proof of Personhood in the Polkadot App**

    ---

    The App-side reference for *where* PoP verification happens, including the Full and Lite tier model.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pop/)

</div>

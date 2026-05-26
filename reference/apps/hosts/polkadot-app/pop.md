---
title: Proof of Personhood in the Polkadot App
description: Reference for how the Polkadot App runs Proof of Personhood — biometric verification, Ring-VRF aliases on the People Chain, and the PoP Full / PoP Lite tier model.
categories: Apps, Reference
---

# Proof of Personhood

## Introduction

**Proof of Personhood (PoP)** is Polkadot's privacy-preserving "real human" check. The **Polkadot App is the only place PoP verification happens** — when a user completes PoP, they do it on their phone, in the App, once. From then on, a single proof unlocks the developer-facing surface area that gates on personhood: the TestNet faucet, short `.dot` names, and any alias-gated feature inside a Polkadot Product.

The App's role is narrow but load-bearing: it runs the verification flow, registers the result on the **People Chain**, and produces **Ring-VRF aliases** on demand for Products that ask for one through the Host API. The aliases — not the underlying identity — are what Products see.

!!! warning "Provisional"
    The exact PoP verification flow inside the App (the video / biometric interaction, the on-device key-derivation path, peer-attestation cadence for ongoing membership) is still being finalized. Lifecycle diagrams and the precise list of pallets a PoP submission touches will be added once they are confirmed.

## Ring-VRF Aliases

A **Ring-VRF alias** is a context-specific pseudonym derived from the user's PoP-anchored identity. Aliases have three properties Product developers depend on:

- **Anchored in personhood.** An alias only exists for users who have completed PoP. A valid Ring-VRF proof over an alias is also a valid proof of personhood for the user behind it.
- **Scoped to a context.** The default context is the requesting Product's `.dot` domain — so the same user produces a consistent alias each time they return to *your* Product, but a different alias for any other Product.
- **Unlinkable across domains.** Two Products cannot correlate that they share a user unless the user explicitly grants a cross-domain alias.

The App is the side of the system that *holds* the alias-producing material. A Product's call to `app.wallet.getAnonymousAlias()` resolves to the App on the user's phone, which signs the alias request. For the Product-developer pattern, see [Use Personhood in Your App](/apps/build/use-personhood-in-your-app/){target=\_blank}.

## PoP Tiers: Full vs. Lite

The People Chain recognizes two personhood tiers, both registered in the App:

- **PoP Full** — cryptographically proven personhood. The user completes the full verification flow in the App (a biometric scan plus ongoing peer-attestation via recurring online sessions). The user's key joins the active membership ring on the People Chain. PoP Full holders can generate zero-knowledge proofs that they are a real person without revealing which one.
- **PoP Lite** — third-party attestation. An attester authorized by governance submits an on-chain attestation that an account belongs to a real user; the account is then registered against a separate `lite-people` ring on the People Chain alongside a communication identifier and a username. Lite supply is bounded by governance, which is the spam-resistance mechanism. Lite holders can produce lite-ring Ring-VRF proofs but do not yet hold membership in the full personhood ring.

Lite is the on-ramp; Full is the destination. The dotNS registrar uses tier to gate which name lengths a user can register for free — see [Verify Your Identity](/apps/set-up/verify-your-identity/){target=\_blank} for the full PopRules tier table.

## What This Unlocks for a Product

A Product running inside Polkadot Desktop can reach the App's PoP surface in two ways via `@parity/product-sdk`:

- **Alias-gated features** — call `getAnonymousAlias()` for the user's per-Product alias, then `createProof(challenge)` to prove control of that alias against a challenge. Gate features on the proof rather than on the user's account address.
- **On-chain personhood gates** — dispatch calls under the `under_alias` runtime origin against PoP pallets (e.g. `pallet-people`). The runtime verifies the underlying Ring-VRF proof and the called pallet's view of the caller is the alias, not the underlying account.

Both patterns are documented in [Use Personhood in Your App](/apps/build/use-personhood-in-your-app/){target=\_blank}; this reference page documents *where* the proving happens (the App) and *what* it produces (Ring-VRF aliases on the People Chain), not the Product-side API.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Use Personhood in Your App**

    ---

    The Product-side how-to: request an alias, build alias-gated off-chain checks, and dispatch on-chain calls under `under_alias`.

    [:octicons-arrow-right-24: Get Started](/apps/build/use-personhood-in-your-app/){target=\_blank}

- <span class="badge guide">Guide</span> **Verify Your Identity**

    ---

    The set-up step where the user (today: developer) completes PoP, plus the PopRules tier table.

    [:octicons-arrow-right-24: Get Started](/apps/set-up/verify-your-identity/){target=\_blank}

</div>

---
title: Proof of Personhood in the Polkadot App
description: Reference for how the Polkadot App runs Proof of Personhood, with biometric verification, Ring-VRF aliases on People Chain, and the PoP tier model.
categories: Apps, Reference
---

# Proof of Personhood

## Introduction

Proof of Personhood (PoP) is Polkadot's privacy-preserving "real human" check. The Polkadot App is the only place PoP verification happens. When a user completes PoP, they do it on their phone, in the App, once. From then on, a single proof unlocks the developer-facing surface area that gates on personhood, including the TestNet faucet, short `.dot` names, and any alias-gated feature inside a Polkadot Product.

The App's role is narrow but load-bearing. It runs the verification flow, registers the result on the People Chain, and produces Ring-VRF aliases on demand for Products that ask for one through the Host API. Products see the aliases, not the underlying identity.

!!! warning "Provisional"
    The exact PoP verification flow inside the App (the video or biometric interaction, the on-device key-derivation path, peer-attestation cadence for ongoing membership) is still being finalized. Lifecycle diagrams and the precise list of pallets a PoP submission touches will be added once they are confirmed.

## Ring-VRF Aliases

A Ring-VRF alias is a context-specific pseudonym derived from the user's PoP-anchored identity. Aliases have three properties Product developers depend on:

- **Anchored in personhood**: An alias only exists for users who have completed PoP. A valid Ring-VRF proof over an alias is also a valid proof of personhood for the user behind it.
- **Scoped to a context**: The default context is the requesting Product's `.dot` domain. The same user produces a consistent alias each time they return to your Product, but a different alias for any other Product.
- **Unlinkable across domains**: Two Products cannot correlate that they share a user unless the user explicitly grants a cross-domain alias.

The App is the side of the system that holds the alias-producing material. A Product's call to `app.wallet.getAnonymousAlias()` resolves to the App on the user's phone, which signs the alias request.

## PoP Tiers: Full vs. Lite

The People Chain recognizes two personhood tiers, both registered in the App:

- **PoP Full**: Cryptographically proven personhood. The user completes the full verification flow in the App: a biometric scan plus ongoing peer-attestation via recurring online sessions. The user's key joins the active membership ring on the People Chain. PoP Full holders can generate zero-knowledge proofs that they are a real person without revealing which one.
- **PoP Lite**: Third-party attestation. An attester authorized by governance submits an on-chain attestation that an account belongs to a real user. The account is then registered against a separate `lite-people` ring on the People Chain alongside a communication identifier and a username. Lite supply is bounded by governance, which is the spam-resistance mechanism. Lite holders can produce lite-ring Ring-VRF proofs but do not yet hold membership in the full personhood ring.

Lite is the on-ramp; Full is the destination. The dotNS registrar uses tier to gate which name lengths a user can register for free. See [dotNS PopRules Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/) for the full PopRules tier table.

## What This Unlocks for a Product

A Product running inside Polkadot Desktop can reach the App's PoP surface in two ways via `@parity/product-sdk`:

- **Alias-gated features**: Call `getAnonymousAlias()` for the user's per-Product alias, then `createProof(challenge)` to prove control of that alias against a challenge. Gate features on the proof rather than on the user's account address.
- **On-chain personhood gates**: Dispatch calls under the `under_alias` runtime origin against PoP pallets (e.g. `pallet-people`). The runtime verifies the underlying Ring-VRF proof and the called pallet's view of the caller is the alias, not the underlying account.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Verify Your Identity**

    ---

    The setup step where the developer completes PoP, plus the PopRules tier table.

    [:octicons-arrow-right-24: Get Started](/reference/apps/infrastructure/dotns/poprules-pricing/)

</div>

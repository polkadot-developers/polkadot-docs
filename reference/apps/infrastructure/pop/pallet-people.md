---
title: pallet-people Reference
description: The foundational Proof of Personhood pallet — personhood registration, ring membership, alias issuance, and the under_alias runtime origin.
categories: Apps, Reference
---

# `pallet-people`

## Introduction

`pallet-people` is the foundation of [Polkadot's Proof of Personhood](/reference/apps/infrastructure/pop/) on the People Chain. It's the pallet that records who has completed personhood verification, issues the aliases other Products gate on, and exposes the `under_alias` runtime origin every other PoP pallet (game, score, identity, ubc, coinage) builds on top of.

Its responsibilities cluster into three:

- **Maintaining the membership rings**: The full personhood ring (PoP Full) and the lite-people ring (PoP Lite) are this pallet's storage. Joining a ring means an entry is added; the ring's root is what subsequent Ring-VRF proofs are checked against.
- **Issuing aliases**: When a Product (via the App) requests an alias for a specific context, `pallet-people` is the runtime side that produces the alias and registers it as valid against the ring.
- **Implementing the `under_alias` origin**: When a runtime call comes in wrapped in `under_alias`, this is the pallet whose verification logic the runtime runs to decide whether to admit the call.

!!! warning "Provisional"
    The exact dispatch surface of `pallet-people` — the precise extrinsics, their parameter shapes, the storage map names, and the events emitted — is still being finalized. This page documents the conceptual responsibilities; the per-extrinsic reference will be added once the surface confirms.

## Ring Membership

Two storage structures on `pallet-people` hold the rings:

- **The full personhood ring**: Holds the public keys of accounts that completed biometric PoP. Joining requires the App-side verification flow; the result is an extrinsic that adds the key.
- **The lite-people ring**: Holds accounts registered via a governance-authorized attestation. Attestations are submitted by approved attesters; the pallet validates and records the registration.

Each ring exposes a _ring root_ — the cryptographic commitment used to verify Ring-VRF proofs. The root updates when membership changes; consumers of proofs read the current root from this pallet's storage when validating.

## Alias Issuance

`pallet-people` is the issuing authority for aliases. When the App produces a Ring-VRF proof for a specific context (a `.dot` domain), the proof is generated against the pallet's ring root and the context. The alias the verifier sees is deterministic for *(user, context)* — same user, same context, same alias every time.

For cross-domain aliases — a Product requesting an alias scoped to another Product's `.dot` — the pallet has additional checks to ensure the request was user-consented and the destination context is valid.

## `under_alias` Dispatch

When the runtime sees a call wrapped in `under_alias`, the validator path is:

1. Read the relevant ring root from `pallet-people`'s storage.
2. Verify the included Ring-VRF proof against the ring root and the dispatched context.
3. On valid proof, dispatch the inner call with the origin resolved to the user's alias for that context.
4. The receiving pallet sees the alias, not the underlying account.

This is the property that lets downstream pallets (game, score, identity, ubc) gate their logic on alias identity while keeping their state unlinkable to user accounts.

## Pallets That Depend on This One

Every other pallet in the PoP set ultimately reads `pallet-people`'s ring root or accepts `under_alias` calls validated against it. The downstream pallets are listed in the [Proof of Personhood overview](/reference/apps/infrastructure/pop/); the foundational guarantee they all rely on is that this pallet's rings represent the current set of real persons on the network.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Ring-VRF and Aliases**

    ---

    The cryptographic and runtime mechanism this pallet implements — what Ring-VRF is, what an alias is, how `under_alias` works at the runtime layer.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/ring-vrf-and-aliases/)

- <span class="badge guide">Guide</span> **Use Personhood in Your App**

    ---

    The Product-side how-to including the `under_alias` dispatch pattern.

    [:octicons-arrow-right-24: Get Started](/apps/build/use-personhood-in-your-app/)
</div>

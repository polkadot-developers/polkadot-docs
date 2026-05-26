---
title: Coinage in the Polkadot App
description: Reference for Coinage — the Polkadot App's peer-to-peer payment flow, with the privacy and personhood-gating properties of the pallet-coinage primitive.
categories: Apps, Reference
---

# Coinage

## Introduction

**Coinage** is the Polkadot App's peer-to-peer payment feature. From a user perspective it is a way to send and receive funds App-to-App with the privacy and personhood properties of the underlying `pallet-coinage` primitive. From a Product developer perspective, Coinage is one of two payment surfaces a Product can route through:

- **Coinage** for personhood-gated, peer-to-peer payments where the App is the originating UI on both sides.
- **The standard `Balances` transfer surface** (covered in the [Accept a Payment](/apps/build/accept-a-payment/){target=\_blank} guide) for general transfers and merchant-style flows.

!!! info "Underlying asset: HOLLAR today, pUSD later"
    Coinage is backed by a stablecoin on Asset Hub (configured via `UnderlyingAssetId`). Today that asset is **HOLLAR**; the system is designed to migrate to **pUSD** when pUSD lands. Coinage itself works today against HOLLAR — the asset is an implementation detail of the recycler / onboard / offboard layer, not a gate on the developer-facing surface. The narrative below is stable across the HOLLAR → pUSD transition.

!!! warning "Provisional"
    The App's send/receive UX details and the recommended Product-side integration pattern are still being finalized by Parity. This page documents the conceptual model; per-flow specifics will be added once the surface is confirmed.

## Conceptual Model

Three properties differentiate Coinage from a plain `Balances.transfer_keep_alive`:

- **Personhood-aware.** Coinage payments can be gated on PoP — sending to "any real person on the network" rather than to a specific account address. The recipient's address need not be known to the sender.
- **Privacy-preserving by default.** Coinage routes through the alias / Ring-VRF surface where appropriate, so the on-chain trail does not link the sender's account to the recipient's account in the same way a public transfer does.
- **App-native UX.** The send and receive flows are rendered in the Polkadot App on both sides, with the user approving the transaction on their phone.

The pallet-level details — the exact storage model, the privacy primitives used, the dispatch surface — will be documented per-pallet under the forthcoming **Infrastructure → PoP** reference.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Accept a Payment**

    ---

    The standard `Balances.transfer_keep_alive` flow for merchant-style payments — what most Products will reach for first.

    [:octicons-arrow-right-24: Get Started](/apps/build/accept-a-payment/){target=\_blank}

- <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    The personhood surface Coinage gates on, including Ring-VRF aliases and the Full / Lite tier model.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pop/)

</div>

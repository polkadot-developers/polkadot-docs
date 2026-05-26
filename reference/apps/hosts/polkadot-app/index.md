---
title: Polkadot App Reference
description: Reference for the Polkadot App — the mobile Host in the Triangle that holds the user's signing key, runs Proof of Personhood, and approves every transaction a Product submits.
categories: Apps, Reference
---

# Polkadot App

## Introduction

The **Polkadot App** is the mobile Host in the [Triangle](/reference/glossary/){target=\_blank} architecture, alongside Polkadot Desktop and Polkadot Web. It runs on the user's phone and plays three roles no other Host plays:

- **Key custodian.** The user's private key lives on the device, in the App's on-device storage. No other Host — and no Product — ever sees the key.
- **Universal signer.** Every signing request that originates from a Product (whether the Product runs inside Desktop or Web) is routed back to the App for the user to approve on their phone.
- **Proof of Personhood verifier.** [Proof of Personhood](pop/) — the privacy-preserving "real human" check that unlocks alias-gated features across Polkadot Products — is performed inside the App.

Two Host-level features the App originates (rather than mediates) are also documented here: in-App **[Chat](chat/)** (the messaging surface that pairs the Statement Store and Bulletin Chain), and **[Sign In with Polkadot](sign-in/)** (the cross-Host authentication handshake initiated by Desktop or Web). Two payment-side features round out the App's surface: **[Coinage](coinage/)**, the peer-to-peer payment flow, and **[Pocket](pocket/)**, where the App acts as the recipient counterpart to Desktop's Pocket send flow.

## How It Works

From a Product developer's perspective, three things matter about how the App runs:

- **Pairing establishes a session, not a copy of the key.** When the user pairs the App with Polkadot Desktop, the App returns a derived *session public key* (see [Install and Pair](/apps/set-up/install-and-pair/){target=\_blank}). Desktop stores that public key so it can identify the user and construct per-Product sub-accounts. The private key never leaves the phone.
- **Signing is asynchronous because it's a separate device.** When a Product calls `signAndSubmit`, Desktop renders a signing modal locally, but the actual signature happens on the user's phone after they approve in the App. Build UI that tolerates the round-trip — see the [Accounts and Signing](/apps/build/accounts-and-signing/){target=\_blank} guide for the patterns.
- **The App is the only place PoP runs.** A Product can gate features on Proof of Personhood (alias-based or general personhood), but the verification flow itself happens in the App. The Product never sees the underlying biometric or the user's identity record — only the alias or alias-proof it requested through TrUAPI.

## Host-API Consumption

At a high level, the App both *consumes* and *produces* parts of the Host-API surface:

- The App **consumes** Host-API methods for chain interaction and storage when its own internal features (Chat, Coinage, PoP) need to talk to People Chain, Statement Store, or Bulletin Chain.
- The App **produces** the signing primitive that every other Host's `signAndSubmit` ultimately resolves against. Methods like `createProof` and `getAnonymousAlias`, which Products invoke through `@parity/product-sdk`, complete in the App on the user's phone.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Chat**

    ---

    The in-App messaging surface: room/bot registration, the typed-message system, and how Chat composes the Statement Store with the Bulletin Chain.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/chat/)

- <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    Where the App's PoP verification happens, what Ring-VRF aliases are, and the PoP Full vs PoP Lite tier model.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pop/)

- <span class="badge learn">Learn</span> **Sign In with Polkadot**

    ---

    The Host-level handshake the App resolves when Desktop or Web wants to authenticate a session against the paired identity.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/sign-in/)

- <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    The how-to guide for wiring a Product up to a paired account and submitting signed transactions through the SDK.

    [:octicons-arrow-right-24: Get Started](/apps/build/accounts-and-signing/){target=\_blank}

</div>

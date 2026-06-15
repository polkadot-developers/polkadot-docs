---
title: Polkadot App Reference
description: Reference for the Polkadot App, the mobile Host in the Triangle that holds the user's signing key, runs PoP, and approves every Product transaction.
categories: Apps, Reference
---

# Polkadot App

## Introduction

The Polkadot App is the mobile wallet that holds every Polkadot Product user's private key. It runs on the user's phone and is the only place in the [Polkadot Triangle](/reference/glossary/#triangle) where the key lives — [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/) and [Polkadot Web](/reference/apps/hosts/polkadot-web/) never touch it.

From a Product developer's perspective, the App plays three roles no other Host plays:

- **It holds the user's private key**: The key lives on the device, in the App's on-device storage. No other Host and no Product ever sees the key.
- **It signs every transaction**: Every signing request that originates from a Product — whether the Product runs inside Desktop or Web — is routed back to the App for the user to approve on their phone.
- **It runs Proof of Personhood**: [Proof of Personhood](pop/) is the privacy-preserving "real human" check that unlocks alias-gated features. The verification happens inside the App; the Product never sees who the user is.

The App also exposes two groups of features that Products integrate against:

- **Host-level features**: [Chat](chat/) is the messaging surface that pairs the [Statement Store](/reference/apps/infrastructure/statement-store/) and [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/). [Sign In with Polkadot](sign-in/) is the cross-Host authentication handshake initiated by Desktop or Web.
- **Payment-side features**: [Coinage](coinage/) is the peer-to-peer payment flow. [Pocket](pocket/) is the App-side recipient counterpart to Desktop's Pocket send flow.

## How It Works

From a Product developer's perspective, three things matter about how the App runs:

- **Session pairing**: Pairing establishes a session, not a copy of the key. When the user pairs the App with Polkadot Desktop, the App returns a derived _session public key_ (see [Install Desktop and Pair](/apps/get-started/)). Desktop stores that public key so it can identify the user and construct per-Product sub-accounts. The private key never leaves the phone.
- **Asynchronous signing**: Signing is asynchronous because it happens on a separate device. When a Product calls `signAndSubmit`, Desktop renders a signing modal locally, but the actual signature happens on the user's phone after they approve in the App. Build UI that tolerates the round-trip; see the [Sign and Submit Transactions](/apps/build/sign-and-submit/) guide for the patterns.
- **PoP verification**: The App is the only place PoP runs. A Product can gate features on Proof of Personhood (alias-based or general personhood), but the verification flow itself happens in the App. The Product never sees the underlying biometric or the user's identity record, only the alias or alias-proof it requested through TrUAPI.

## Where the App Fits in the SDK Surface

The App is both a consumer and a producer of [TrUAPI](/reference/apps/protocol/truapi/) methods:

- The App **consumes** Host API methods for chain interaction and storage when its own features (Chat, Coinage, PoP) need to talk to the People Chain, Statement Store, or Bulletin Chain.
- The App **produces** the signing primitive every other Host's `signAndSubmit` ultimately resolves against. Methods Products call through the SDK — like `createProof` and `getAnonymousAlias` — complete in the App on the user's phone.

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

    [:octicons-arrow-right-24: Get Started](/apps/build/sign-and-submit/)

</div>

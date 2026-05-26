---
title: Verify Your Identity
description: Obtain a personhood-gated dev identity for building Polkadot Products — unlocks testnet funds, short .dot names, and PoP-gated features.
categories: Apps
---

# Verify Your Identity

*Set-up · Step 3 of 4 — [Install & Pair](/apps/set-up/install-and-pair/) → [Choose a Network](/apps/set-up/choose-a-network/) → **Verify Identity** → [Get TestNet Funds](/apps/set-up/get-testnet-funds/)*

## Introduction

Verifying your developer identity with **Proof of Personhood (PoP)** unlocks the developer surface you need: TestNet funds, short `.dot` names, and the ability to build and test features that gate on personhood. You do it once, in the Polkadot App.

PoP is Polkadot's privacy-preserving "real human" check. It runs on the People Chain using Ring-VRF cryptography — a primitive that lets a verified person prove "I'm one of the real users in this set" without revealing which one — and it never asks for a government ID or any personal information.

You only need PoP on the **dev account** you'll build against — the same account as the one you have paired with Polkadot Desktop.

## Prerequisites

- The Polkadot App installed and paired with Polkadot Desktop. See [Install and Pair](/apps/set-up/install-and-pair/){target=\_blank}.
- Your target environment selected. See [Choose a Network](/apps/set-up/choose-a-network/){target=\_blank}.

!!! tip "Multiple accounts for different purposes"
    The Polkadot App can hold multiple accounts as a signer, so you can keep separate keys for different purposes across the Polkadot Products ecosystem — for example, an everyday account, a Product-specific account, and a dedicated dev/test account. Each account can obtain its own personhood-gated identity.

## Complete the Verification

Complete the verification on your paired mobile device:

1. Open the Polkadot App and tap **Verify Identity** on your dev account.

    ![](/images/apps/set-up/verify-your-identity/verify-your-identity-01.webp){: .browser-extension}

2. The Polkadot App may prompt for your device's biometric (Face ID / Touch ID) to confirm the action. Once you authorize, an identity is registered for your account on the People Chain. No government ID, no personal data leaves the device.

Your account is now linked to a Ring-VRF _alias_ on the People Chain — a context-specific pseudonym derived from your identity that's unlinkable across different Products. Personhood-gated features unlock for that account.

You can verify the result by reopening the Polkadot Desktop dashboard with your dev account paired. The personhood badge appears on the account, and any PoP-gated action you trigger from a Product succeeds without prompting for re-verification.

## What This Unlocks for You

### TestNet Funds via the Faucet

The personhood-gated faucet is the developer on-ramp for TestNet tokens — without PoP you cannot pull funds. Continue at [Get TestNet Funds](/apps/set-up/get-testnet-funds/){target=\_blank}.

!!! warning "Provisional"
    The exact faucet flow is not yet finalized. The Get TestNet Funds page will be updated once the endpoint and quota model are confirmed.

### Short `.dot` Names

The dotNS registrar prices names on a scarcity ladder. The shortest, most-premium names are reserved (governance) or free for personhood holders; longer names are open to anyone for a deposit. There are two PoP tiers:

- **PoP Full**: cryptographically proven personhood — the destination state, delivered by the official Polkadot App once it ships. You complete the full verification flow there (a PoP biometric scan plus ongoing peer-attestation via recurring online sessions). Your key joins the active membership ring on the People Chain, and you can generate zero-knowledge proofs that you're a real person without revealing which one.
- **PoP Lite**: third-party attestation. An attester authorized by governance submits an on-chain attestation that your account belongs to a real user; you're then registered against a separate "lite-people" ring on the People Chain alongside a communication identifier and a username. Spam resistance comes from governance capping how many attestations can be issued — Lite supply is bounded, so it can't be minted at scale. Lite holders can produce lite-ring Ring-VRF proofs but don't yet hold membership in the full personhood ring. Lite is the on-ramp; Full is the destination.

Both tiers qualify for free name registration, just at different name-length tiers. Anyone can register longer or numerically-suffixed names without PoP, but they pay a deposit:

|                   Name format                   |     Who can register     |                 Deposit                 |
|:-----------------------------------------------:|:------------------------:|:---------------------------------------:|
|                    ≤5 chars                     |     Governance only      |                    —                    |
|          6–8 chars (no numeric suffix)          |     PoP Full holders     |                  Free                   |
|   6–8 chars + 2-digit suffix (e.g. `alice01`)   | PoP Lite or Full holders |                  Free                   |
|         9–14 chars (no numeric suffix)          |     PoP Full holders     |                  Free                   |
| 9–14 chars + 2-digit suffix (e.g. `acmecorp01`) |          Anyone          | `startingPrice × (15 − nameLength)` DOT |
|                    15+ chars                    |          Anyone          |         `startingPrice / 2` DOT         |

PoP-Lite holders can register a Lite-tier name and have the matching base name reserved for them for 12 weeks, so they can upgrade to Full without losing the name. For the full registration walkthrough see [Register and Publish](/apps/deploy-and-publish/register-and-publish/){target=\_blank}.

!!! note "Self-declared PoP tier"
    dotNS reads PoP tier from a status the user sets themselves. On-chain verification against the People Chain is a forthcoming integration; treat the tier check as cooperative, not adversarial, until that integration ships.

### PoP-Gated Features in Your Own Product

Once you have a verified dev account you can develop and test the features that depend on personhood:

- **Ring-VRF aliases for cross-product identity**: When two Products want to verifiably show that the same user is on both — say, to import reputation across apps or build a federated login — they can request a Ring-VRF alias scoped to both Products. The alias proves "same person" cryptographically without exposing the user's account or any real-world identity.
- **Per-Product unlinkable identities**: By default, the same person using `app-a.dot` and `app-b.dot` shows up to each Product as a different alias. The two Products cannot correlate that they share a user, so activity on one app stays private from another unless the user explicitly opts in to linking them. This is privacy-by-default for the cross-app case.
- **"First interaction is free" fee-allowance pattern**: Verified persons receive a periodic on-chain quota of fee-free transactions. Your Product can be the first thing a new user touches without forcing them to acquire DOT first — they can sign and submit one or more transactions on the house, removing first-use friction.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Get TestNet Funds**

    ---

    Continue setup by claiming TestNet tokens from the personhood-gated faucet so you can fund your dev account and start building.

    [:octicons-arrow-right-24: Get Started](/apps/set-up/get-testnet-funds/){target=\_blank}

</div>

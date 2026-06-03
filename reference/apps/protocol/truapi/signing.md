---
title: Signing Method Group
description: TrUAPI method group for dispatching transactions through the Host to the paired Polkadot App for per-transaction approval, signing, and results.
categories: Apps, Reference
---

# Signing

## Introduction

The Signing method group lets a Product submit a signed transaction. The Host on the other side does not sign. It mediates by rendering the signing modal, forwarding the payload to the paired Polkadot App, waiting for the user's approval on their phone, and returning the result as a signature, rejection, or timeout.

The Product SDK wraps this as `tx.signAndSubmit(signer)` on a Polkadot API (PAPI) transaction object plus a signer returned by `SignerManager.getSigner()`. From the Product's perspective, it is a single awaited promise. Underneath, it is a TrUAPI dispatch and a round trip to the user's phone.

## Conceptual Contract

The group covers:

- **Submitting a payload for signing**: The Product hands the Host a pre-built, account-bound transaction. The Host renders the signing modal and forwards the payload to the paired App.
- **Watching the result**: The Host returns the outcome — signature obtained (Host then broadcasts), explicit user rejection (`HostRejectedError`), or session timeout (`TimeoutError`).
- **Surfacing status transitions**: Through PAPI's `submitAndWatch` companion surface, the Product sees status events (`signing`, `broadcasting`, `in-block`, and `finalized`) as the transaction progresses.

The contract the Host enforces is the one that makes the model trustworthy: every transaction requires a per-request approval on the phone. There is no auto-sign mode, no session-scoped consent, and no path for a Product to obtain a signature without the user actively approving the specific payload they were shown.

For the full mediated-signing flow (the three-actor model, the `ChainSubmit` permission, failure-mode UX), see the [Signing in Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/signing/){target=\_blank} reference.

!!! warning "Provisional"
    Edge cases still being defined include multi-signature flows that aggregate across multiple Hosts, batched transactions that present as a single user prompt, and custom signing policies (delegation, time-windowed allowances). The single-transaction, single-prompt contract described in this section is stable.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Signing in Polkadot Desktop**

    ---

    The mediated-signing flow in detail: how the Host renders the modal, forwards to the paired App, and surfaces timeouts and rejections.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/signing/)

- <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    The Product-side how-to with the `try`/`catch` patterns for `HostRejectedError` and `TimeoutError`.

    [:octicons-arrow-right-24: Get Started](/apps/build/accounts-and-signing/){target=\_blank}

</div>

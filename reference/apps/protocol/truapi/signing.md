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

The default contract is the one that makes the model trustworthy: every transaction requires a per-request approval on the phone, with no session-scoped consent and no path for a Product to obtain a signature without the user approving the specific payload they were shown. This per-request flow is what a Product gets unless an Auto-Signing resource has been explicitly allocated.

### Auto-Signing

The shipping [`@parity/truapi`](https://www.npmjs.com/package/@parity/truapi){target=\_blank} wire carries an **Auto-Signing** capability on top of the per-request default. A Product requests it as an allocatable resource through `host_request_resource_allocation`; the user must explicitly grant the allocation, and the Host scopes what it covers. Polkadot Desktop ships this as `signing-bot-autopair`, which pairs a signing bot so that allocated transactions are signed without a per-transaction prompt. Auto-Signing is opt-in, user-granted, and bounded — it does not remove the approval requirement for ordinary signing; it replaces it, within the allocated scope, with an up-front consent the user can revoke.

!!! note "Newer than the v0.2 method-group surface"
    Auto-Signing is carried by the `@parity/truapi` wire but is not part of the v0.2 method-group surface documented in these pages, so it is a place where the shipping protocol is ahead of the documented groups. A Host implementer working only from the v0.2 method groups will not find it there; a Product running on today's Desktop can use it.

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

    [:octicons-arrow-right-24: Get Started](/apps/build/sign-and-submit/){target=\_blank}

</div>

---
title: Pocket Recipient in the Polkadot App
description: Reference for the App-side counterpart to Polkadot Desktop's Pocket send flow — receiving funds or assets routed via Pocket.
categories: Apps, Reference
---

# Pocket Recipient

## Introduction

**Pocket** is Polkadot Desktop's send flow — a feature that lets a Desktop user package a payment or asset transfer and route it to a recipient identified by their App identity. This page documents the **App-side counterpart**: how the Polkadot App receives a Pocket transfer initiated from Desktop, and the user-visible flow inside the App.

The Desktop sender-side view is documented at [Pocket Send Flow in Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/pocket/){target=\_blank}. This page is the receiver's view.

!!! warning "Provisional"
    The recipient-side flow inside the App is still being defined. The exact handshake between Desktop's Pocket dispatch and the App's incoming-Pocket UI, the notification surface, and the accept / decline mechanics are still being finalized. This page captures the conceptual model only; the detailed flow and any sequence diagram will be added once they are confirmed.

## Conceptual Model

From the recipient's perspective:

- A Desktop user (the **sender**) initiates a Pocket transfer addressed to the recipient's paired App identity.
- The transfer arrives at the App as a pending incoming item, surfaced to the recipient in the App's UI.
- The recipient reviews and either **accepts** or **declines** the transfer.
- On accept, the transfer settles to the recipient's account. On decline (or timeout), it does not.

The distinguishing property of Pocket relative to a plain `Balances.transfer_keep_alive` is the **accept step**. A standard transfer settles unilaterally — the recipient cannot reject it. Pocket's two-sided flow gives the recipient a chance to refuse, which matters when the transfer is contextually meaningful (an in-band payment between users who know each other) rather than just a balance change.

The Product-developer surface that bridges to Pocket — whether a Product can initiate a Pocket transfer programmatically, or only the Desktop UI can — is part of the open question above. Once resolved, the integration pattern will be documented here and cross-linked from the [Accept a Payment](/apps/build/accept-a-payment/){target=\_blank} guide.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Accept a Payment**

    ---

    The Product-side payment flow today — `Balances.transfer_keep_alive` on the Polkadot Hub via the Product SDK. Pocket-aware patterns will be added here when resolved.

    [:octicons-arrow-right-24: Get Started](/apps/build/accept-a-payment/){target=\_blank}

</div>

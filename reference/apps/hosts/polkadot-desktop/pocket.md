---
title: Pocket Send Flow in Polkadot Desktop
description: Reference for Pocket — Polkadot Desktop's peer-to-peer send flow with personhood-aware addressing, and how it pairs with the App-side recipient view.
categories: Apps, Reference
---

# Pocket

## Introduction

**Pocket** is Polkadot Desktop's peer-to-peer send flow. From the sender's side, Pocket is a UI in Desktop that lets a user package a payment or asset transfer addressed to another real person — not necessarily by their account address, but by their personhood identity in Polkadot's network. The receiver sees the incoming transfer in their paired Polkadot App and can accept or decline.

This page is the **sender's view**. The App-side receiver view is documented at [Pocket Recipient](/reference/apps/hosts/polkadot-app/pocket/){target=\_blank}.

!!! warning "Provisional"
    Pocket's exact developer surface — whether a Product can initiate a Pocket transfer programmatically, the supported asset types and amounts, and the cross-chain routing details — is still being finalized. This page captures the conceptual model and the user-visible flow only; the API-level reference and any sequence diagram will be added once the surface is confirmed.

## Conceptual Model

Three properties distinguish Pocket from a plain `Balances.transfer_keep_alive`:

- **Personhood-aware addressing.** Instead of (or alongside) an SS58 account address, the sender can address a transfer to a recipient identified by their personhood. The sender does not need to know the recipient's account up front — the recipient resolves to the right address inside their App.
- **Two-sided confirmation.** A standard transfer settles unilaterally — the recipient cannot refuse it. A Pocket transfer arrives at the recipient's App as a pending item; the recipient explicitly accepts or declines. On accept, it settles; on decline (or timeout), it does not.
- **Sender UX lives in Desktop, receiver UX lives in the App.** The two sides of the flow are deliberately on different devices: the sender packages the transfer at a desk, the receiver approves on their phone with the same per-transaction approval model that gates every signed action.

## What the User Sees

From the sender's side in Desktop:

1. The sender opens Pocket from Desktop's UI and selects a recipient (by personhood identifier, contact name, or address).
2. The sender enters the amount and any optional memo.
3. The sender confirms in Desktop — which triggers the standard signing modal and routes a per-transaction approval to the sender's own paired App.
4. After the sender approves on their App, Desktop dispatches the Pocket transfer.
5. The recipient sees an incoming Pocket item in their App and either accepts or declines (see [Pocket Recipient](/reference/apps/hosts/polkadot-app/pocket/){target=\_blank}).

For everyday merchant-style payments — where the payer is responsive in a browser or a Product and the merchant just wants the funds settled — the standard `Balances.transfer_keep_alive` flow in the [Accept a Payment](/apps/build/accept-a-payment/){target=\_blank} guide is the right tool. Pocket is the right tool when the recipient identity matters more than the recipient address, and when accept-decline semantics fit the interaction.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Pocket Recipient (App side)**

    ---

    The other half of the round trip — what a Pocket transfer looks like to the recipient, including the accept / decline mechanics.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pocket/)

- <span class="badge guide">Guide</span> **Accept a Payment**

    ---

    The standard `Balances.transfer_keep_alive` payment flow for merchant-style cases where Pocket's accept-decline semantics aren't a fit.

    [:octicons-arrow-right-24: Get Started](/apps/build/accept-a-payment/){target=\_blank}

</div>

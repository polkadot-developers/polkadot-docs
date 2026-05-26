---
title: Payment Method Group
description: TrUAPI method group for payment flows — the standard Balances transfer surface plus the Pocket peer-to-peer flow.
categories: Apps, Reference
---

# Payment

## Introduction

The **Payment** method group is the surface a Product uses to accept or initiate payments. It is not a separate primitive — payments are signed transactions like any other — but it groups the two payment shapes a Product is most likely to need into a single reference area: the standard `Balances.transfer_keep_alive` flow and the personhood-aware **Pocket** flow.

For most Product use cases, this group is consumed through `@polkadot-apps/tx` and helpers in `@polkadot-apps/utils` (formatting, validation), with the same `signAndSubmit` round trip every other signed call goes through.

## Conceptual Contract

The group covers:

- **Building a payment request** — encoding what a merchant is asking for (recipient, amount, optional memo) into a payload the payer's Product can parse and pre-fill into a transfer form. No on-chain interaction at request-build time; it's an application-layer payload.
- **Constructing a transfer extrinsic** — given a validated recipient and a planck-denominated amount, building a `Balances.transfer_keep_alive` (or `transfer_allow_death` when the sender intends to drain the account) ready to sign.
- **Submitting and watching the payment** — passing the extrinsic through the standard Signing surface and observing the status transitions (`signing` → `broadcasting` → `in-block` → `finalized`).
- **The Pocket variant** — personhood-aware, two-sided (sender on Desktop, receiver on the App, with the receiver explicitly accepting or declining). See [Pocket on Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/pocket/){target=\_blank} for the conceptual model.

The Payment group does not introduce new signing semantics — every payment-side transaction still routes through the per-transaction approval flow on the paired App.

!!! warning "Provisional"
    The Pocket-specific TrUAPI methods (whether and how a Product can initiate a Pocket transfer programmatically versus relying on Host UI), payment-request URL formats as a canonical wire format, and any asset-aware extensions (multi-asset transfers, pUSD-specific calls) are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Accept a Payment**

    ---

    The Product-side how-to for the standard `Balances.transfer_keep_alive` payment flow.

    [:octicons-arrow-right-24: Get Started](/apps/build/accept-a-payment/){target=\_blank}

- <span class="badge learn">Learn</span> **Pocket on Polkadot Desktop**

    ---

    The Pocket send flow's conceptual model and how it pairs with the App-side recipient view.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/pocket/)

</div>

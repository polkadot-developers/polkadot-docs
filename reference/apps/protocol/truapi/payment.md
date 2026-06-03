---
title: Payment Method Group
description: TrUAPI method group for payment flows, including the standard Balances transfer surface and the Pocket peer-to-peer flow for Product payments.
categories: Apps, Reference
---

# Payment

## Introduction

The Payment method group lets a Product accept or initiate payments. Payments are signed transactions like any other transaction, but this group collects the two payment shapes a Product is most likely to need, the standard `Balances.transfer_keep_alive` flow and the personhood-aware Pocket flow.

For most Product use cases, this group is consumed through `@polkadot-apps/tx` and helpers in `@polkadot-apps/utils` (formatting, validation), with the same `signAndSubmit` round trip every other signed call goes through.

## Conceptual Contract

The group covers:

- **Building a payment request**: The Product encodes what a merchant is asking for, including recipient, amount, and optional memo, into a payload the payer's Product can parse and pre-fill into a transfer form. No on-chain interaction happens at request-build time; the request is an application-layer payload.
- **Constructing a transfer extrinsic**: Given a validated recipient and a planck-denominated amount, building a `Balances.transfer_keep_alive` (or `transfer_allow_death` when the sender intends to drain the account) ready to sign.
- **Submitting and watching the payment**: The Product passes the extrinsic through the standard Signing surface and observes status transitions of `signing`, `broadcasting`, `in-block`, and `finalized`.
- **Pocket variant**: Pocket is personhood-aware and two-sided. The sender acts on Desktop, the receiver acts on the App, and the receiver explicitly accepts or declines. See [Pocket on Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/pocket/){target=\_blank} for the conceptual model.

The Payment group does not introduce new signing semantics. Every payment-side transaction still routes through the per-transaction approval flow on the paired App.

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

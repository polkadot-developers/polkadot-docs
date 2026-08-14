---
title: Accounts and Signing
description: Which component holds which account when you build and deploy a Polkadot Product — the phone, the Host, and the CLI — and why an allowance can land on the wrong account.
categories: Apps
---

# Accounts and Signing

## Introduction

More than one account is in play when you build and deploy a Polkadot Product, and they are not always the same account. Getting them confused is the most common way to hit a `no allowance set for account` error: you fund or authorize one account, then sign with a different one. This page explains which component holds which key, which account actually signs, and how to keep them aligned.

## Who Holds What

- **The phone (Polkadot App)**: Holds the user's root private key and the secret for every per-Product account derived from it. All signing happens here. The key never leaves the device.
- **The Host (Polkadot Desktop or Web)**: Holds no keys. It relays signing requests to the paired phone and shows the result.
- **The `playground` CLI**: What it holds depends on the signer mode you choose, covered next.

## The Account That Signs a Deploy

`playground deploy` signs with a different account depending on the signer mode:

- **`--signer phone`** (the default for a deploy you intend to keep): The deploy is signed by a **product account derived from the phone's root key**, scoped to your Product. The CLI holds only a paired session; the secret stays on the phone, which approves each step. The CLI does not create its own account in this mode.
- **`--signer dev --suri <uri>`**: The CLI signs with a **local development key** derived from the URI you pass (for example, `//Alice` or a mnemonic). This account is unrelated to the phone. No phone approvals happen.
- **`--signer dev` with no `--suri`**: Falls back to a **shared, publicly known development mnemonic**. Anyone can control this account; never use it for a deploy you want to keep.

!!! warning "Dev-signer deploys are owned by the dev account"
    A Product deployed with `--signer dev` is owned by that development key, not by you. Use the phone signer for anything you intend to keep or hand to real users.

## Product Accounts Are Per Product

A product account is derived deterministically from `["product", productId, derivationIndex]`, so the account you get depends on the `productId` and index in play:

- Inside a Host, your frontend derives its `productId` from where it is loaded: `localhost` maps to `playground.dot`, a `<name>.dot.li` gateway URL maps to `<name>.dot`, and otherwise it falls back to `playground.dot`. The derivation index is `0`.
- The CLI session derives its own product account from the identifier it was paired under.

The consequence: the account your running frontend signs with, and the account the CLI deployed under, are the **same only if their `productId` and index match**. A Product loaded from `localhost` (deriving under `playground.dot`) uses a different account than the same Product loaded from `my-app.dot.li` (deriving under `my-app.dot`). See [Identity](/apps/concepts/identity/) for the full derivation model.

## Why This Causes `no allowance set for account`

Storage and messaging [allowances](/apps/concepts/allowances/) are granted **per account**. A missing allowance is rejected independently of your token balance: even with enough PAS to cover fees, the service rejects the request if the signing account has no allowance.

So the failure is almost always an account mismatch: you granted the allowance (or storage authorization) to one account, but the account that actually signed was a different one — a dev key instead of the phone account, or a product account derived under a different `productId` than you expected. The fix is to grant the allowance to the account that actually signs, and to keep the `productId` consistent between where you request the allowance and where you sign. See the [troubleshooting entry](/apps/troubleshooting/#no-allowance-set-for-account) for the step-by-step resolution.

## See the Signing Address

Before granting an allowance, confirm which account will sign:

- **In a Host**: A Product running inside Polkadot Desktop or Web can read its product account through the [`signer`](/apps/product-sdk/signer/) package (`getProductAccount`), which returns the account's SS58 address and its H160 (EVM) form. Surfacing that address in your Product's own UI during development is the most reliable way to know what you are funding.

!!! warning "There is no CLI command to print the account address"
    The `playground` CLI does not expose a `whoami` or `accounts` command that prints the phone or session account's SS58 address. This is a known gap. Until it exists, read the address from a Product running inside a Host, or from the login output, rather than assuming which account the CLI paired.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Allowances and Permissions**

    ---

    What an allowance authorizes, and how to grant it to the right account.

    [:octicons-arrow-right-24: Allowances and Permissions](/apps/concepts/allowances/)

-   <span class="badge learn">Learn</span> **Identity**

    ---

    The per-Product account derivation model and why accounts differ across Products.

    [:octicons-arrow-right-24: Identity](/apps/concepts/identity/)

-   <span class="badge guide">Guide</span> **Get TestNet Tokens**

    ---

    Fund the signing account and grant it the service allowances it needs.

    [:octicons-arrow-right-24: Get TestNet Tokens](/apps/get-started/get-testnet-tokens/)

</div>

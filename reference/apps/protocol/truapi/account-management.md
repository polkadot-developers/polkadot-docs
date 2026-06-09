---
title: Account Management Method Group
description: TrUAPI Account Management method group for resolving sub-accounts, reading account state, and using @polkadot-apps/signer to get Product accounts.
categories: Apps, Reference
---

# Account Management

## Introduction

The Account Management method group lets a Product discover which account it should operate against. A Polkadot Product never sees the user's root identity; it sees a per-Product sub-account derived from the user's identity and the Product's `.dot` domain. See [Sandbox and Sub-Accounts](/reference/apps/protocol/truapi/sandbox/){target=\_blank} for the derivation model. This method group is the surface that resolves that sub-account, exposes its address, and returns related state.

The Product SDK wraps this surface as `SignerManager.getProductAccount(dotNsIdentifier, derivationIndex)` in [`@polkadot-apps/signer`](https://www.npmjs.com/package/@polkadot-apps/signer){target=\_blank}.

## Conceptual Contract

The group covers:

- **Resolving a Product-scoped account**: Given the Product's dotNS identifier and a derivation index (`0` is the conventional default), the Host returns a `SignerAccount` with the SS58-formatted address, the raw public key, and an optional display name.
- **Listing accounts available to the Product**: The Host enumerates the sub-accounts the user has approved for this Product to see.
- **Selecting an active account**: Before the Product invokes any signing operation, it tells the Host which account it intends to use for the rest of the session or until it switches accounts.

Account resolution is local and instantaneous. The Host computes the derived address without needing to round-trip to the paired App. The private key never leaves the App; the address derivation uses public information only.

!!! warning "Provisional"
    Multi-account scenarios (a Product asking for several sub-accounts at non-default indexes for distinct flows), cross-domain account requests (alias-scoped accounts spanning multiple `.dot` domains), and the precise list-accounts surface are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Sandbox and Sub-Accounts**

    ---

    The conceptual model for why a Product gets a derived sub-account in the first place, and how isolation works.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/sandbox/)

- <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    The Product-side how-to: getting an account, building a transaction, and submitting it.

    [:octicons-arrow-right-24: Get Started](/apps/build/sign-and-submit/){target=\_blank}

</div>

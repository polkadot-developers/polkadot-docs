---
title: Identity
description: How identity works for Polkadot Products — the .dot name, the per-app derived account, and Proof of Personhood as three separate identities, and why they stay separate.
categories: Apps
---

# Identity

## Introduction

A user interacting with your Product carries three distinct identities, and they are deliberately separate. Keeping them apart is what lets the platform give your Product a stable account and optional proof that the user is a real person, without turning every Product into a tracking surface.

The three identities are:

- **A `.dot` name**: A human-readable name that resolves to content, owned by an account but not itself an account.
- **A per-app account**: A per-Product account derived for each user, the identity your Product signs and transacts with.
- **Proof of Personhood**: A tier and a per-app alias that attest the user is a unique human, without revealing who they are.

## The `.dot` Name

A [`.dot` name](/apps/register-dot-domain/) is registered with [DotNS](/reference/apps/infrastructure/dotns/) and resolves to a content record — the CID of a published Product bundle. Ownership of a name is held by an Asset Hub account and is transferable, but the name is not an account and cannot sign. It names _content_, not a user.

A name is how users reach your Product; it is not how your Product identifies a user.

## The Per-App Account

When a user opens your Product, the Host derives a **product account** for that user, scoped to your Product. The same user opening `app-a.dot` and `app-b.dot` gets a _different_ account in each, derived deterministically from the user's identity and the Product's `.dot` identifier.

The account has two address forms, both derived from the same public key:

- **SS58**: The Substrate address, used across Polkadot chains.
- **H160**: The EVM-style address, used for `pallet-revive` contracts on Asset Hub.

Derivation follows a junction path of `["product", productId, derivationIndex]` applied with sr25519 soft derivation, where `productId` is normally your `.dot` name. Because soft derivation is composable on public keys, the CLI, a web Host, or any external client can compute the same address the mobile wallet derives privately, without ever seeing the secret key.

Your Product obtains this account through the [`signer`](/apps/product-sdk/signer/) package (`getProductAccount`) and signs with it; every approval routes to the user's phone. See [Sign and Submit Transactions](/apps/build/sign-and-submit/) for the working flow.

!!! info "Why per-app derivation"
    If every Product saw the same account for a user, any two Products could compare accounts and correlate the user across them. Per-Product derivation makes that impossible by default: different Products see different, unlinkable addresses for the same person. Sharing an account across your own Products is possible, but it requires an explicit permission grant; it is never the default. The same reasoning governs the sandbox model in the [TrUAPI reference](/reference/apps/protocol/truapi/sandbox/).

## Proof of Personhood

[Proof of Personhood](/reference/apps/infrastructure/pop/) is a separate signal that a user is a unique human. It has two parts:

- **A tier**: `None`, `Lite` (an attested username), or `Full` (a stronger, invitation-gated proof).
- **A per-app alias**: A Ring-VRF-derived identifier that is deterministic for a given user and Product, and unlinkable across Products.

An alias is never an account address, and — like the per-app account — it is scoped per Product so it cannot be used to correlate a user across Products. Cross-Product alias linking requires an explicit consent step. Use personhood to gate features on verified-human status (for example, one action per person) without learning who the user is.

!!! warning "Names and usernames can be coupled"
    The three identities are architecturally separate, but they are not always fully independent in practice. A `Lite` username can be mirrored into `.dot` naming by operator infrastructure, which couples a user's personhood username to a `.dot` name. Treat the identities as separate by design, but do not assume they can never be linked through operator-run mirrors.

## Usernames in Your Product

There is no built-in primitive for an in-app username, so most Products need to choose a display identity themselves. Until a primitive exists, the recommended pattern keeps you aligned with the platform's identity model rather than inventing a parallel one:

- **Prefer the personhood username where you have it.** When the user has a `Lite` or `Full` tier, read the username the platform already associates with them (through the [`signer`](/apps/product-sdk/signer/) package's `getUserId`) and use it as the display name. This reuses an identity the user already has instead of minting a new one.
- **Otherwise, let the user set a per-Product display name** and store it in [local storage](/apps/product-sdk/local-storage/) (device-local) or [cloud storage](/apps/product-sdk/cloud-storage/) (shared), keyed to their per-app account. Keep it scoped to your Product so it does not become a cross-Product identifier.
- **Do not treat a display name as identity.** Authorization and uniqueness come from the per-app account and Proof of Personhood; a display name is a label on top of them.

Following this pattern means Products converge on the same approach instead of each reinventing usernames, which eases any future migration to a platform primitive.

## How the Three Fit Together

- Users **find** your Product by its `.dot` name.
- Your Product **acts** as the user through the per-app account, signing on the user's phone.
- Your Product optionally **gates** features on Proof of Personhood, reading a tier and a per-app alias rather than a real-world identity.

None of the three reveals the user's root key or a cross-Product identifier unless the user explicitly grants it.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Sign and Submit Transactions**

    ---

    Derive and sign with the per-app account in your Product.

    [:octicons-arrow-right-24: Sign and Submit Transactions](/apps/build/sign-and-submit/)

-   <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    The Ring-VRF mechanism, tiers, and per-app aliases in depth.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/)

-   <span class="badge learn">Learn</span> **The Sandbox Model**

    ---

    How the Host isolates each Product and derives its per-domain account.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/sandbox/)

</div>

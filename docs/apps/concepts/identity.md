---
title: Identity
description: The two identities a user brings to a Polkadot Product — a per-app account and Proof of Personhood — and why your Product's own .dot address is not one of them.
categories: Apps
---

# Identity

## Introduction

A user interacting with your Product carries two identities, and they are deliberately separate:

- **A per-app account**: A per-Product account derived for each user. This is the identity your Product signs and transacts with.
- **Proof of Personhood**: A tier, a per-app alias, and sometimes a dotNS username, which together attest that the user is a unique human without revealing who they are.

Keeping them apart is what lets the platform give your Product a stable account, and optional proof that the user is a real person, without turning every Product into a tracking surface.

A third name comes up constantly and is _not_ a user identity: your Product's own `.dot` address, the name users type to reach it. It shares a namespace with the dotNS username, which makes the two easy to confuse, so it is covered in [Your Product's `.dot` Address](#your-products-dot-address) below.

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

[Proof of Personhood](/reference/apps/infrastructure/pop/) is a separate signal that a user is a unique human. It has three parts:

- **A tier**: `None`, `Lite` (an attested username), or `Full` (a stronger, invitation-gated proof).
- **A per-app alias**: A Ring-VRF-derived identifier that is deterministic for a given user and Product, and unlinkable across Products.
- **A dotNS username**: The human-readable name the personhood gateway issues to a verified user, such as `joseph.42`.

An alias is never an account address, and — like the per-app account — it is scoped per Product so it cannot be used to correlate a user across Products. Cross-Product alias linking requires an explicit consent step. Use personhood to gate features on verified-human status (for example, one action per person) without learning who the user is.

### The dotNS Username

A dotNS username is the one part of a user's identity that is human-readable and stable across Products. The personhood gateway issues it, not the public registration path, which gives it three properties that a name bought on the public path does not have:

- It is **soulbound**: permanently non-transferable, because it identifies a person rather than content.
- It carries **no deposit**, whatever its length.
- It is **not free-form**: the gateway refuses a stem of five characters or fewer, and a `Lite` username carries a digit suffix inside its label, as in `joseph.42`.

Read it with `getUserId` from the [`signer`](/apps/product-sdk/signer/) package, which returns it as `primaryUsername`. A user with tier `None` has no dotNS username, so treat it as optional and always have a fallback. For the pattern to follow when displaying a name in your Product, see [Show a Display Name](/apps/build/sign-and-submit/#show-a-display-name).

!!! info "One username, three names"
    The Polkadot App's Humanity screens call this the **dotNS username**, and that is the term these docs use. You will also see it called a _personhood username_ elsewhere in this documentation, and the SDK returns it as `primaryUsername`. All three refer to the same name issued through the personhood gateway.

## Your Product's `.dot` Address

Your Product's [`.dot` address](/apps/register-dot-domain/) is registered with [dotNS](/reference/apps/infrastructure/dotns/) and resolves to a content record: the CID of a published Product bundle. Ownership of a name is held by an Asset Hub account, but the name is not an account and cannot sign. It is how users **reach** your Product, not how your Product identifies a **user**.

The confusion is that both live in the same namespace. A name registered on the public path points at content and can be transferred. A name issued through the personhood gateway is a dotNS username: it points at a person and is soulbound.

The two are indistinguishable from the string alone, so a client that needs to tell them apart should read `isPopIssued(label)` on the PoP controller rather than inspect the text. See [PopRules and Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/) for both shapes side by side.

## How They Fit Together

- Users **find** your Product by its `.dot` address, which identifies your Product rather than them.
- Your Product **acts** as the user through the per-app account, signing on the user's phone.
- Your Product optionally **gates** features on Proof of Personhood, reading a tier and a per-app alias rather than a real-world identity, and **displays** the user's dotNS username when there is one.

None of these reveals the user's root key or a cross-Product identifier unless the user explicitly grants it.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Sign and Submit Transactions**

    ---

    Derive and sign with the per-app account, and show the user's dotNS username in your Product.

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

---
title: Identity
description: The two identities a user brings to a Polkadot Product, a per-app account and Proof of Personhood, and why your Product's own .dot address is not one of them.
categories: Apps
---

# Identity

## Introduction

A user interacting with your Product carries two identities, and they are deliberately separate:

- **A per-app account**: A per-Product account derived for each user. This is the identity your Product signs and transacts with.
- **Proof of Personhood**: A tier, a per-app alias, and sometimes an earned name, which together attest that the user is a unique human without revealing who they are.

Keeping them apart is what lets the platform give your Product a stable account, and optional proof that the user is a real person, without turning every Product into a tracking surface.

A third name comes up constantly and is _not_ a user identity: your Product's own `.dot` address, the name users type to reach it. It shares a namespace with the names the personhood gateway issues, which makes the two easy to confuse, so it is covered in [Your Product's `.dot` Address](#your-products-dot-address) below.

## The Per-App Account

When a user opens your Product, the Host derives a **product account** for that user, scoped to your Product. The same user opening `app-a.dot` and `app-b.dot` gets a _different_ account in each, derived deterministically from the user's identity and the Product's `.dot` identifier.

The account has two address forms, both derived from the same public key:

- **SS58**: The Substrate address, used across Polkadot chains.
- **H160**: The EVM-style address, used for `pallet-revive` contracts on Polkadot Hub.

Derivation follows a junction path of `["product", productId, derivationIndex]` applied with sr25519 soft derivation, where `productId` is normally your `.dot` name. Because soft derivation is composable on public keys, the CLI, a web Host, or any external client can compute the same address the mobile wallet derives privately, without ever seeing the secret key.

Your Product obtains this account through the [`signer`](/apps/product-sdk/signer/) package (`getProductAccount`) and signs with it; every approval routes to the user's phone. See [Sign and Submit Transactions](/apps/build/sign-and-submit/) for the working flow.

!!! info "Why per-app derivation"
    If every Product saw the same account for a user, any two Products could compare accounts and correlate the user across them. Per-Product derivation makes that impossible by default: different Products see different, unlinkable addresses for the same person. Sharing an account across your own Products is possible, but it requires an explicit permission grant; it is never the default. The same reasoning governs the sandbox model in the [TrUAPI reference](/reference/apps/protocol/truapi/sandbox/).

## Proof of Personhood

[Proof of Personhood](/reference/apps/infrastructure/pop/) is a separate signal that a user is a unique human. It has three parts:

- **A tier**: The strength of the proof, from none, through an attested proof of a unique device, to full personhood, proven in the Polkadot App. The [Proof of Personhood reference](/reference/apps/infrastructure/pop/) names the tiers.
- **A per-app alias**: A Ring-VRF-derived identifier that is deterministic for a given user and Product, and unlinkable across Products.
- **An earned name**: The human-readable name the personhood gateway issues to a user who has proved a tier, such as `joseph.42`.

An alias is never an account address, and — like the per-app account — it is scoped per Product so it cannot be used to correlate a user across Products. Cross-Product alias linking requires an explicit consent step. Use personhood to gate features on verified-human status (for example, one action per person) without learning who the user is.

!!! warning "Names and usernames can be coupled"
    The three identities are separate by design, but not always independent in practice: the personhood gateway issues a device name into dotNS naming, which couples that username to a dotNS name of the same text. Do not assume the identities can never be linked.

### The Earned Name

An earned name is the one part of a user's identity that is human-readable and stable across Products. The personhood gateway issues it rather than the public registration path, which gives it properties a name bought with a deposit does not have: it is soulbound, so it never transfers, and it is not free-form, because the gateway decides the shape it issues.

Read it with `getUserId` from the [`signer`](/apps/product-sdk/signer/) package, which returns it as `primaryUsername`. A user with no personhood tier has no earned name, so treat it as optional and always have a fallback. For the call and its caveats, see [Show a Display Name](/apps/build/sign-and-submit/#show-a-display-name).

!!! info "One name, several labels"
    These docs call this the **earned name**, the term the dotNS reference uses for a name the gateway grants. A name that identifies a person is a _personhood name_ and one that identifies a proved device is a _device name_; the SDK returns either as `primaryUsername`.

## Usernames in Your Product

There is no built-in primitive for an in-app username, so most Products need to choose a display identity themselves. Until a primitive exists, the recommended pattern keeps you aligned with the platform's identity model rather than inventing a parallel one:

- **Prefer the earned name where you have it.** When the user holds any personhood tier, read the username the platform already associates with them (through the [`signer`](/apps/product-sdk/signer/) package's `getUserId`) and use it as the display name. This reuses an identity the user already has instead of minting a new one. See [Show a Display Name](/apps/build/sign-and-submit/#show-a-display-name) for the call and its caveats.
- **Otherwise, let the user set a per-Product display name** and store it in [local storage](/apps/product-sdk/local-storage/) (device-local) or [cloud storage](/apps/product-sdk/cloud-storage/) (shared), keyed to their per-app account. Keep it scoped to your Product so it does not become a cross-Product identifier.
- **Do not treat a display name as identity.** Authorization and uniqueness come from the per-app account and Proof of Personhood; a display name is a label on top of them.

Following this pattern means Products converge on the same approach instead of each reinventing usernames, which eases any future migration to a platform primitive.

## Your Product's `.dot` Address

A [`.dot` name](/apps/register-dot-domain/) is registered with [dotNS](/reference/apps/infrastructure/dotns/) and resolves to a content record: the CID of a published Product bundle. Ownership of a name is held by a Polkadot Hub account, but the name is not an account and cannot sign.

Transferability depends on how the name was acquired. A name anyone registered by paying the deposit can be transferred. A name earned through the personhood gateway, the route that grants device and personhood names, cannot move: it identifies the person or device that earned it, and it stays with them. Most names point at _content_ rather than at a user, but a gateway name identifies an identity (a personhood name names a person, and a device name names a unique device its holder proved), so a client that needs to tell the kinds apart should read `isPopIssued(label)` on the PoP controller rather than inspect the string. See [PopRules and Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/).

A name is how users reach your Product; it is not how your Product identifies a user. The confusion is that both live in the same namespace: a name registered by paying the deposit points at content, while a name earned through the gateway points at a person or a device.

## How They Fit Together

- Users **find** your Product by its `.dot` address, which identifies your Product rather than them.
- Your Product **acts** as the user through the per-app account, signing on the user's phone.
- Your Product optionally **gates** features on Proof of Personhood, reading a tier and a per-app alias rather than a real-world identity, and **displays** the user's earned name when there is one.

None of these reveals the user's root key or a cross-Product identifier unless the user explicitly grants it.

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

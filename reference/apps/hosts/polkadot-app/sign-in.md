---
title: Sign In with Polkadot
description: Reference for Sign In with Polkadot, the Host-level authentication handshake between Polkadot Desktop or Polkadot Web and the paired Polkadot App.
categories: Apps, Reference
---

# Sign In with Polkadot

## Introduction

Sign In with Polkadot is the Host-level authentication handshake between a desktop or web Host (Polkadot Desktop, or Polkadot Web at `dot.li`) and the Polkadot App on the user's phone. Its job is to establish, on demand, that the user driving Desktop or Web is the same person who holds the key in the paired App, without copying the key off the phone.

This feature lives in the App's reference because the App is the side that _resolves_ the handshake, while Desktop or Web initiates it and the App signs.

!!! info "Products do not invoke this directly"
    For a Product running inside Polkadot Desktop, sign-in is complete before your code loads. The user paired their App with Desktop during set-up, and Desktop established a session at that point. Sign In with Polkadot is the host-level primitive sitting underneath your Product's session, not a function you call. The Product-side surfaces you reach for instead are `getAnonymousAlias`, `createProof`, and `under_alias`; see [Use Personhood in Your App](/apps/build/use-personhood-in-your-app/){target=\_blank}.

## How the Handshake Works

The handshake uses the Statement Store as its rendezvous and the paired session as its trust anchor:

1. The Host (Desktop or Web) posts a sign-in request statement to the Statement Store, addressed to the paired App.
2. The App, subscribed to its own inbox, picks up the request from gossip.
3. The user sees a sign-in prompt in the App and approves or rejects on their phone.
4. On approval, the App returns a signed payload back over the encrypted channel.
5. The Host validates the payload and binds the session.

The handshake is one-time per session; subsequent Product calls inside the session reuse the binding rather than re-prompting the user.

!!! warning "Provisional"
    The exact wire format of the request and response statements, the topic-filter scoping at the Statement Store boundary, the timeout/rejection failure modes, and any per-session session-key derivation steps are still being finalized. This page documents the developer-observable shape only; the protocol-level details will be added once they are confirmed.

## Where Sign In Differs from Per-Transaction Signing

Both Sign In and `signAndSubmit` route to the App and require user approval, but they serve different jobs:

- **Sign In**: Establishes session identity. It runs once when the user lands in a Host, and reruns if the session expires. It tells the Host who the user is so the Host can construct per-Product sub-accounts and surface Product UI.
- **`signAndSubmit`**: Signs a _specific transaction_ with a Product's account. Every transaction requires its own approval in the App; there is no "auto-sign for the rest of this session" mode. This is intentional. See the [Sign and Submit Transactions](/apps/build/sign-and-submit/){target=\_blank} reference for the rationale.

A Product that wants to gate a feature on "is this the real user paired with this session?" can rely on the session being authenticated already and instead reach for alias-based or `under_alias` patterns. Re-running Sign In is not the right primitive for that.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    How `signAndSubmit` works for per-transaction signing: the surface a Product actually calls, with the round-trip-to-phone pattern.

    [:octicons-arrow-right-24: Get Started](/apps/build/sign-and-submit/){target=\_blank}

- <span class="badge guide">Guide</span> **Install and Pair**

    ---

    The set-up step that establishes the initial paired session between Desktop and the App, before Sign In with Polkadot can resolve.

    [:octicons-arrow-right-24: Get Started](/apps/get-started/){target=\_blank}

</div>

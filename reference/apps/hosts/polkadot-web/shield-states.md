---
title: Shield States in Polkadot Web
description: Reference for the shield-state UI in Polkadot Web — how the Host surfaces the trust posture of the currently loaded Product and what each state means.
categories: Apps, Reference
---

# Shield States

## Introduction

A user visiting a Polkadot Product on Polkadot Web is taking on a small set of trust assumptions: that the bundle their browser fetched is the one DotNS currently points the `.dot` name at, that the Host has the expected state, and that no part of the runtime has been tampered with. **Shield states** are how Polkadot Web surfaces those assumptions in the browser UI — a security indicator the user can glance at to see whether the loaded Product is in a trusted state.

This page documents what shield states exist, what each one means, and when the state changes.

!!! warning "Provisional"
    The full list of shield states, the exact UI affordances Polkadot Web uses to surface them, and the triggers that cause a state transition are still being finalized. This page describes the conceptual model; the per-state reference (every name, color, icon, and verbatim explanation surfaced to the user) will be added once confirmed.

## Conceptual Model

A shield state communicates two things at once:

- **Bundle integrity.** Does the bundle currently running match the CID that DotNS resolves to for the `.dot` name in the address bar? A mismatch — for example, a Product loaded from a stale cache that no longer matches the current published version — is a state transition worth showing.
- **Host posture.** Is the Host's expected runtime state intact? Web's sandbox guarantees only hold if the Host itself is in a known state; the shield surfaces deviations.

A user will see a single shield indicator at any moment, and that indicator tells them whether everything is currently in the "expected" posture or whether something the user should know about has happened.

## Why Products Should Care

For a Product developer, the shield states are not a surface your code calls directly. They are a property of the Host that affects how users perceive your Product. Two implications:

- **A Product cannot override or hide the shield state.** The indicator lives in the Host's UI, outside the Product's sandbox. This is intentional — a Product cannot mask a security state from its users.
- **Drastic shield-state changes can signal a re-load.** If a user is in the middle of a long-running interaction with your Product and DotNS now points the `.dot` name at a different CID, the Host may transition to an "out-of-sync" state and prompt the user to reload. Build flows that tolerate this (idempotent retries, durable client-side state via [`KvStore`](/apps/build/persist-data-locally/){target=\_blank}) rather than assuming a single Product session is uninterrupted.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Visiting a Product**

    ---

    The visiting flow that establishes the initial shield state when a Product is loaded.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-web/visiting/)

</div>

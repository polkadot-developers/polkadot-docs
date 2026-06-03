---
title: Shield States in Polkadot Web
description: Reference for the shield-state UI in Polkadot Web, including how the Host surfaces the trust posture of the loaded Product and what each state means.
categories: Apps, Reference
---

# Shield States

## Introduction

A user visiting a Polkadot Product on Polkadot Web is taking on a small set of trust assumptions about whether the bundle their browser fetched is the one DotNS points the `.dot` name at, whether the Host has the expected state, and whether any part of the runtime has been tampered with. Shield states are how Polkadot Web surfaces those assumptions in the browser UI. The security indicator helps the user see whether the loaded Product is in a trusted state.

This page documents what shield states exist, what each one means, and when the state changes.

!!! warning "Provisional"
    The full list of shield states, the exact UI affordances Polkadot Web uses to surface them, and the triggers that cause a state transition are still being finalized. This page describes the conceptual model; the per-state reference (every name, color, icon, and verbatim explanation surfaced to the user) will be added once confirmed.

## Conceptual Model

A shield state communicates two things at once:

- **Bundle integrity**: Does the running bundle match the CID that DotNS resolves to for the `.dot` name in the address bar? A mismatch, such as a Product loaded from a stale cache that no longer matches the published version, is a state transition worth showing.
- **Host posture**: Is the Host's expected runtime state intact? Web's sandbox guarantees only hold if the Host itself is in a known state; the shield surfaces deviations.

A user will see a single shield indicator at any moment, and that indicator tells them whether everything is in the "expected" posture or whether something the user should know about has happened.

## Why Products Should Care

For a Product developer, the shield states are not a surface your code calls directly. They are a property of the Host that affects how users perceive your Product. Two implications:

- **Host-owned indicator**: A Product cannot override or hide the shield state. The indicator lives in the Host's UI, outside the Product's sandbox. This is intentional: a Product cannot mask a security state from its users.
- **Reload signals**: Drastic shield-state changes can signal a reload. If a user is in the middle of a long-running interaction with your Product and DotNS points the `.dot` name at a different CID, the Host may transition to an "out-of-sync" state and prompt the user to reload. Build flows that tolerate this, such as idempotent retries and durable client-side state via [`KvStore`](/apps/build/persist-data-locally/){target=\_blank}, rather than assuming a single Product session is uninterrupted.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Visiting a Product**

    ---

    The visiting flow that establishes the initial shield state when a Product is loaded.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-web/visiting/)

</div>

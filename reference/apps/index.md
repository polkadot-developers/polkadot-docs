---
title: App Development Reference
description: Technical reference for building Polkadot Products — the Hosts that run them, the TrUAPI protocol between Host and Product, and the on-chain infrastructure they consume.
categories: Apps, Reference
---

# App Development Reference

## Introduction

This section is the technical-depth companion to the [App Development](/apps/){target=\_blank} how-to guides. Where `/apps/set-up/` and `/apps/build/` walk you through doing things, this section explains *what each component is, how it works, and where its limits are* — at the level a developer needs when integrating against the surface, not just consuming it.

A **Polkadot Product** is a sandboxed application that runs inside a **Host** (Polkadot App, Polkadot Desktop, or Polkadot Web), talks to that Host through the **TrUAPI** protocol, and relies on Polkadot **Infrastructure** (Bulletin Chain, Statement Store, dotNS, Proof of Personhood, HOP) for the on-chain capabilities the Host doesn't provide itself. This reference is organized along those axes.

!!! info "Depth target"
    Each page in this section follows the same shape: a short conceptual frame at the top, then the developer-facing surface (Host-API method tables for Hosts, pallet surface tables for infrastructure) at the bottom.

## Hosts

[Hosts](/reference/apps/hosts/){target=\_blank} are the runtime containers that load and run Polkadot Products:

- **[Polkadot App](/reference/apps/hosts/polkadot-app/){target=\_blank}** — the mobile Host. Holds the user's signing key, runs Proof of Personhood, and is the canonical signer for every transaction a Product submits anywhere in the Triangle.
- **[Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/){target=\_blank}** — the desktop Host. Loads Products by `.dot` name, mediates signing requests to the paired mobile App, and exposes the Host API surface to the Product running inside it.
- **[Polkadot Web](/reference/apps/hosts/polkadot-web/){target=\_blank}** — the web Host (`dot.li`). Loads Products in a browser sandbox; visiting flow, shield states, and onchain `polkadot.com` integration.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Hosts**

    ---

    Start with the Polkadot App — the mobile Host that holds the signing key and runs Proof of Personhood for every Product in the Triangle.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/)

- <span class="badge guide">Guide</span> **App Development How-To**

    ---

    If you're new here, start with the how-to guides — set up Polkadot Desktop, then build your first Product against the SDK surface this reference documents.

    [:octicons-arrow-right-24: Get Started](/apps/set-up/install-and-pair/){target=\_blank}

</div>

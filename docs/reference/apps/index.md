---
title: App Development Reference
description: Technical reference for building Polkadot Products, including Hosts, TrUAPI between Host and Product, and the on-chain infrastructure they consume.
categories: Apps, Reference
---

# App Development Reference

## Introduction

This is the technical-depth companion to the [App Development](/apps/) how-to guides. Where the guides walk you through tasks step by step, this section explains _what each component is, how it works, and where its limits are_ — the level of detail you need when integrating against the surface.

A Polkadot Product is a sandboxed application you build that runs inside one of the Polkadot Apps. The Host it runs in mediates everything sensitive, including signing, chain access, storage, and outbound requests, through a protocol called TrUAPI, and the Product talks to Polkadot's on-chain infrastructure through the SDK and the Host. This reference is organized along those axes: Hosts, the TrUAPI protocol between Host and Product, and the infrastructure components Products consume.

!!! info "Depth target"
    Each page in this section follows the same shape: a short conceptual frame up top, then the developer-facing surface (Host API method tables for Hosts, pallet surface tables for infrastructure) at the bottom. The [TrUAPI](/reference/apps/protocol/truapi/) subsection, with one page per method group, is the depth model for protocol reference pages.

## Architecture

Your Product sits at the top of a layered stack. You write the Product itself; everything below — the [Product SDK](/reference/glossary/#polkadot-sdk) that exposes typed methods, the Polkadot Apps that load and sandbox your Product, and the underlying chains, decentralized storage, and name service — is provided by the platform. The [Host](/reference/glossary/#host) (whichever Polkadot App is loading your Product) mediates every interaction through [TrUAPI](/reference/apps/protocol/truapi/) and prompts the user for anything sensitive.

![Polkadot Apps architecture: your Polkadot Product uses the Product SDK to talk to a Polkadot App (App, Desktop, or Web), which accesses Polkadot infrastructure](/images/reference/apps/index/polkadot-environment.svg)
## Hosts

Hosts are the runtime containers that load and run Polkadot Products:

- **[Polkadot App](/reference/apps/hosts/polkadot-app/)**: The mobile Host. Holds the user's signing key, runs Proof of Personhood, and is the canonical signer for every transaction a Product submits anywhere in the Triangle.
- **[Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/)**: The desktop Host. Loads Products by `.dot` name, mediates signing requests to the paired mobile App, and exposes the Host API surface to the Product running inside it.
- **[Polkadot Web](/reference/apps/hosts/polkadot-web/)**: The web Host (`dot.li`). Loads Products in a browser sandbox and documents the visiting flow, shield states, and on-chain `polkadot.com` integration.

## Protocol

The [TrUAPI](/reference/apps/protocol/truapi/) reference documents the protocol between Hosts and Products: the conceptual sandbox model, the 11 method groups (TrUAPI Calls, Permissions, Local Storage, Account Management, Signing, Chat, Statement Store, Preimage, Chain Interaction, Payment, Entropy), the versioning model, and the package reference table.

## Infrastructure

Per-component reference for the on-chain infrastructure Products consume:

- **[Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/)**: Content-addressed storage with explicit authorization, chunked uploads, time-bound retention, and renewal.
- **[Statement Store](/reference/apps/infrastructure/statement-store/)**: Gossip-distributed, signed statements on the People Chain for real-time signaling between users.
- **[dotNS](/reference/apps/infrastructure/dotns/)**: The `.dot` name system, including PopRules pricing, the contract architecture, and the registration flow.
- **[Proof of Personhood](/reference/apps/infrastructure/pop/)**: The Ring-VRF mechanism and the per-pallet surface (people, game, score, identity, universal basic capacity, coinage).
- **[HOP](/reference/apps/infrastructure/hop/)**: The cross-chain hop protocol.

## Skills

The [product-sdk](/reference/apps/skills/) skills reference documents what skills exist, what each one does, and how to use them inside your Product workflow.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Hosts**

    ---

    Start with the Polkadot App, the mobile Host that holds the signing key and runs Proof of Personhood for every Product in the Triangle.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/)

- <span class="badge guide">Guide</span> **App Development How-To**

    ---

    If you are new here, start with the how-to guides: set up Polkadot Desktop, then build your first Product against the SDK surface this reference documents.

    [:octicons-arrow-right-24: Get Started](/apps/get-started/)

</div>

---
title: App Development Reference
description: Technical reference for building Polkadot Products, including Hosts, TrUAPI between Host and Product, and the on-chain infrastructure they consume.
categories: Apps, Reference
---

# App Development Reference

## Introduction

This is the technical-depth companion to the [App Development](/apps/){target=\_blank} how-to guides. Where the guides walk you through tasks step by step, this section explains _what each component is, how it works, and where its limits are_ — the level of detail you need when integrating against the surface.

A _Polkadot Product_ is a sandboxed application you build that runs inside one of the Polkadot Apps. The Host it runs in mediates everything sensitive — signing, chain access, storage, outbound requests — through a protocol called _TrUAPI_, and the Product talks to Polkadot's on-chain infrastructure through the SDK and the Host. This reference is organized along those axes: Hosts, the TrUAPI protocol between Host and Product, and the infrastructure components Products consume.

!!! info "Depth target"
    Each page in this section follows the same shape: a short conceptual frame up top, then the developer-facing surface (Host API method tables for Hosts, pallet surface tables for infrastructure) at the bottom. The [TrUAPI](/reference/apps/protocol/truapi/){target=\_blank} subsection, with one page per method group, is the depth model for protocol reference pages.

## Architecture

Your Product sits at the top of a layered stack. You write the Product itself; everything below — the [Product SDK](/reference/glossary/#polkadot-sdk) that exposes typed methods, the Polkadot Apps that load and sandbox your Product, and the underlying chains, decentralized storage, and name service — is provided by the platform. The [Host](/reference/glossary/#host) (whichever Polkadot App is loading your Product) mediates every interaction through [TrUAPI](/reference/apps/protocol/truapi/) and prompts the user for anything sensitive.

![Polkadot Apps architecture: your Polkadot Product uses the Product SDK to talk to a Polkadot App (App, Desktop, or Web), which accesses Polkadot infrastructure](/images/reference/apps/index/polkadot-environment.svg){ style="max-width: 560px; display: block; margin: 1.5rem auto;" }

## Hosts

Hosts are the runtime containers that load and run Polkadot Products:

- [Polkadot App](/reference/apps/hosts/polkadot-app/){target=\_blank}: The mobile Host. Holds the user's signing key, runs Proof of Personhood, and is the canonical signer for every transaction a Product submits anywhere in the Triangle.
- [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/){target=\_blank}: The desktop Host. Loads Products by `.dot` name, mediates signing requests to the paired mobile App, and exposes the Host API surface to the Product running inside it.
- [Polkadot Web](/reference/apps/hosts/polkadot-web/){target=\_blank}: The web Host (`dot.li`). Loads Products in a browser sandbox and documents the visiting flow, shield states, and on-chain `polkadot.com` integration.

## Protocol

The [TrUAPI](/reference/apps/protocol/truapi/){target=\_blank} reference documents the protocol between Hosts and Products: the conceptual sandbox model, the 11 method groups (TrUAPI Calls, Permissions, Local Storage, Account Management, Signing, Chat, Statement Store, Preimage, Chain Interaction, Payment, Entropy), the versioning model, and the package reference table.

## Infrastructure

Per-component reference for the on-chain infrastructure Products consume:

- [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/){target=\_blank}: Content-addressed storage with explicit authorization, chunked uploads, time-bound retention, and renewal.
- [Statement Store](/reference/apps/infrastructure/statement-store/){target=\_blank}: Gossip-distributed, signed statements on the People Chain for real-time signaling between users.
- [dotNS](/reference/apps/infrastructure/dotns/){target=\_blank}: The `.dot` name system, including PopRules pricing, the contract architecture, and the registration flow.
- [Proof of Personhood](/reference/apps/infrastructure/pop/){target=\_blank}: The Ring-VRF mechanism and the per-pallet surface (people, game, score, identity, universal basic capacity, coinage).
- [HOP](/reference/apps/infrastructure/hop/){target=\_blank}: The cross-chain hop protocol.

## Skills

The [product-skills](/reference/apps/skills/){target=\_blank} repo reference documents what skills exist, what each one does, and how to use them inside your Product workflow.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Hosts**

    ---

    Start with the Polkadot App, the mobile Host that holds the signing key and runs Proof of Personhood for every Product in the Triangle.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/)

- <span class="badge guide">Guide</span> **App Development How-To**

    ---

    If you are new here, start with the how-to guides: set up Polkadot Desktop, then build your first Product against the SDK surface this reference documents.

    [:octicons-arrow-right-24: Get Started](/apps/get-started/){target=\_blank}

</div>

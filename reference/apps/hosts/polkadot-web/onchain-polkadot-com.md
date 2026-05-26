---
title: Onchain polkadot.com
description: Reference for the on-chain-published presence backing the polkadot.com discovery surface — a Polkadot Product that itself indexes and points at other Products.
categories: Apps, Reference
---

# Onchain `polkadot.com`

## Introduction

**Onchain `polkadot.com`** is the on-chain-published presence behind the `polkadot.com` discovery surface. Practically, it is a Polkadot Product whose job is to point at *other* Polkadot Products — a directory and discovery layer for the ecosystem, served the same way any other Polkadot Product is served: as a published bundle, resolved through DotNS, and loaded by Polkadot Web (or Polkadot Desktop) into the Host sandbox.

This page explains what makes the onchain `polkadot.com` Product different from any other Product (it isn't, mechanically — that's the point), and where it fits in the larger publishing flow.

## Why an On-Chain Discovery Layer

A Polkadot Product is addressed by its `.dot` name, but `.dot` names alone are flat — a user has to know the name before they can visit it. Discovery is the layer above that: showcases, categories, recommendations, search.

Putting discovery on-chain — as a Polkadot Product itself — has two properties an off-chain discovery site does not:

- **Verifiable provenance.** The directory's contents are addressable and verifiable; a user can confirm that the discovery layer they are looking at matches the on-chain CID that DotNS resolves to, and the same shield-state checks that apply to any other Product apply here.
- **Composability.** Other Products can read the same on-chain discovery state through the chain client surface (see [Read Chain State](/apps/build/read-chain-state/){target=\_blank}), without needing a private API to a centralized directory.

## Implications for a Product Developer

If you are building a Product, two things matter about onchain `polkadot.com`:

- **It is a publishing target.** The flow for getting your Product listed on the canonical discovery surface goes through whatever submission / curation process onchain `polkadot.com` defines. The Product-side how-to for the underlying publishing steps (bundling, dotNS registration, opening the Product) is in `/apps/deploy-and-publish/`.
- **It is a model to copy.** Any Product that wants to be a discovery surface for a specific category — a games directory, a wallet directory, an asset explorer — can follow the same pattern: publish a Product whose state is the directory, read it from chain, and let the Host render it the same way.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Publish Your App Bundle**

    ---

    The Product-side how-to for bundling and publishing your Product, including the artifact-addressing steps that any directory-listed Product goes through.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-and-publish/publish-your-app-bundle/){target=\_blank}

- <span class="badge guide">Guide</span> **Read Chain State**

    ---

    The how-to for reading on-chain state from inside a Product — including reading state published by other Products like onchain `polkadot.com`.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/){target=\_blank}

</div>

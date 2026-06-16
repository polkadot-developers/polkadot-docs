---
title: On-Chain polkadot.com
description: Reference for the on-chain-published presence backing polkadot.com discovery, a Polkadot Product that indexes and points at other Polkadot Products.
categories: Apps, Reference
---

# On-Chain `polkadot.com`

## Introduction

On-chain `polkadot.com` is `polkadot.com` itself, served as a Polkadot Product. It is the discovery layer for the ecosystem, a directory that points at other Polkadot Products, but it is not hosted on a centralized server. It is published as a bundle, resolved through [DotNS](/reference/apps/infrastructure/dotns/), and loaded by Polkadot Web or Polkadot Desktop into the Host sandbox, the same way any other Product is.

This page explains what makes the on-chain `polkadot.com` Product different from any other Product, and where it fits in the larger publishing flow. Mechanically, it is not different, and that is the point.

## Why an On-Chain Discovery Layer

A Polkadot Product is addressed by its `.dot` name, but `.dot` names alone are flat. A user has to know the name before they can visit it. Discovery is the layer above that: showcases, categories, recommendations, search.

Putting discovery on-chain as a Polkadot Product itself has two properties an off-chain discovery site does not:

- **Verifiable provenance**: The directory's contents are addressable and verifiable; a user can confirm that the discovery layer they are looking at matches the on-chain CID that DotNS resolves to, and the same shield-state checks that apply to any other Product apply here.
- **Composability**: Other Products can read the same on-chain discovery state through the chain client surface (see [Read Chain State](/apps/build/read-chain-state/)), without needing a private API to a centralized directory.

## Implications for a Product Developer

If you are building a Product, two things matter about on-chain `polkadot.com`:

- **Publishing target**: The flow for getting your Product listed on the canonical discovery surface goes through whatever submission and curation process on-chain `polkadot.com` defines. The Product-side how-to for the underlying publishing steps is [Register and Publish](/apps/deploy-and-publish/register-and-publish/).
- **Model to copy**: Any Product that wants to be a discovery surface for a specific category, such as a games directory, a wallet directory, or an asset explorer, can follow the same pattern: publish a Product whose state is the directory, read it from chain, and let the Host render it the same way.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Publish Your App Bundle**

    ---

    The Product-side how-to for bundling and publishing your Product, including the artifact-addressing steps that any directory-listed Product goes through.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-and-publish/publish-your-app-bundle/)

- <span class="badge guide">Guide</span> **Read Chain State**

    ---

    The how-to for reading on-chain state from inside a Product, including reading state published by other Products like on-chain `polkadot.com`.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/)

</div>

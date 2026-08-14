---
title: Networks
description: The two TestNet environments a Polkadot Product can target — Paseo Next v2 and the devnet — how they relate, and the behavioral differences that affect your app.
categories: Apps
---

# Networks

## Introduction

Two TestNet environments are available while you build Polkadot Products, and they are separate networks, not two names for one. The [Product SDK](/apps/product-sdk/) exposes both as presets:

- **`paseo` (Paseo Next v2)**: The environment Polkadot Desktop development builds default to. It is a preview network and the successor to Paseo Next v1.
- **`devnet`**: A public Paseo TestNet, run by the Polkadot Community Foundation.

Both expose the same core chains a Product uses — Asset Hub, the Bulletin Chain, and Individuality — so most Product code runs on either without changes. The production `polkadot` and `kusama` presets are not live yet; requesting them throws.

## What Differs

The one behavioral difference documented today that can affect your app is transaction signing on Paseo Next v2:

- **`AsPgas` signed extension (Paseo Next v2)**: Paseo Next v2 ships an `AsPgas` signed extension that legacy Polkadot.js-style signing does not understand, so that path fails with an error about the unsupported signed extension. Sign through the product account instead — get a signer from [`getProductAccount(...).getSigner()`](/apps/product-sdk/signer/), which routes through the Host's transaction path and preserves the extension. This is the path the SDK guides already use, so following them keeps you compatible.

Beyond signing, the two networks are documented as parallel and equivalent in capability. Endpoints and preset details are re-homed as the networks evolve, so resolve them from the SDK preset rather than hardcoding.

## Proof of Personhood Availability

Whether the [Proof of Personhood](/apps/concepts/identity/) Full tier is active on a given network depends on operator-side configuration, so it can differ between environments and over time. Treat a `None` or `Lite` result as the safe default in your Product, and gate features so they still work when a higher tier is unavailable.

!!! warning "Confirm current per-network capabilities"
    Which personhood tiers, discovery directories, and services are live on each network is evolving and is not fully captured in these docs. Before depending on a specific capability being present on `devnet` or `paseo`, confirm its current status with the developer community rather than assuming parity between the two.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Chain Client**

    ---

    How a Product connects to these networks through the Host, and how presets map to chains.

    [:octicons-arrow-right-24: Chain Client](/apps/product-sdk/chain-client/)

-   <span class="badge guide">Guide</span> **Get TestNet Tokens**

    ---

    Fund your account and grant service allowances on your target network.

    [:octicons-arrow-right-24: Get TestNet Tokens](/apps/get-started/get-testnet-tokens/)

</div>

---
title: Apps
description: Build Polkadot Products — sandboxed apps that run inside the Polkadot Hosts, addressed by .dot domain names, and signed by the user's phone.
categories: Apps
---

# Apps

**Polkadot Apps** are the three applications that can host Polkadot Products — collectively, known as the **Polkadot Triangle**:

![The Polkadot Triangle: Polkadot Desktop at the top, Polkadot App at the bottom-left, Polkadot Web at the bottom-right, with Polkadot Product running inside](/images/apps/polkadot-triangle.svg){ style="max-width: 480px; display: block; margin: 1.5rem auto;" }

| Host | Role |
|:----:|:----:|
| **[Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/){target=\_blank}** | The workstation host. Loads Polkadot Products by their `.dot` name and runs them in a sandbox. |
| **[Polkadot App](/reference/apps/hosts/polkadot-app/){target=\_blank}** | The mobile wallet and signer. Holds the user's private key and approves every signing request. |
| **[Polkadot Web](/reference/apps/hosts/polkadot-web/){target=\_blank}** | The browser host at `dot.li`. Resolves `.dot` names client-side via a light client and renders the Product in a sandboxed iframe. |

**Polkadot Products** are what _you_ build — third-party applications that run _inside_ one of the Polkadot Apps. Products are sandboxed single-page apps (HTML / JS / CSS), addressed by `.dot` names, and never see the user's private key.

This documentation section covers everything you need to build, deploy, and ship a Polkadot Product that runs on the Polkadot Apps.

!!! info "In one sentence"
    You build Polkadot Products. They run inside one of the Polkadot Apps. This section teaches you how.

## What Is a Polkadot Product?

A Polkadot Product is a sandboxed single-page application that runs inside one of the Polkadot Apps. Products are addressed by `.dot` names (e.g. `awesome.dot`), registered onchain through a decentralized name service. The bundle itself is published to a decentralized cloud storage provider and fetched by the Host on demand.

For the architectural breakdown — how the Product, SDK, Host, and Polkadot infrastructure relate — see the [App Development Reference](/reference/apps/){target=\_blank}.

## Why Build a Polkadot Product?

Polkadot Apps is a complete environment for building Web3 decentralized applications:

**Wallet built-in**: The Polkadot App on the user's phone is the wallet for every Polkadot Product they use. No wallet integration code, no "Connect Wallet" button to design, no signing plumbing to maintain. Your Product receives a derived per-user account and asks for signatures; approvals happen on the user's phone.

**Identity built-in**: Per-Product accounts are derived from the user's `.dot` identity, so there is no signup flow. With Proof of Personhood, you can gate features on verified-human status without seeing who the user is — privacy-preserving humans-only access, built into the platform. Need to recognize the same user across two of your Products? Same alias system, scoped to your Product set.

**Decentralized hosting**: Your bundle lives on a decentralized cloud storage provider. Your `.dot` name lives in a decentralized name service. There is no centralized hosting provider, no DNS service, no platform in the middle. Users fetch your Product directly and verify it themselves.

**Product SDK**: The Product SDK covers what you would otherwise integrate yourself:

- **Chain access**: Query state and submit transactions through the Host. No RPC servers to operate; signing prompts open on the user's phone.
- **Decentralized storage**: Upload files, get a permanent content-addressed URL.
- **Real-time signed messaging**: Pub/sub between users of your Product via the [Statement Store](/reference/apps/infrastructure/statement-store/){target=\_blank}, every message verifiable.
- **Privacy-preserving payments**: Request, top up, track status. Built on [Coinage](/reference/apps/infrastructure/pop/pallet-coinage/){target=\_blank}.
- **Chat**: Rooms, bots, interactive action buttons.
- **Identity**: Derived per-Product accounts, plus optional [Proof of Personhood](/reference/apps/infrastructure/pop/){target=\_blank} gating.
- **Local storage**: Per-Product key/value, persisted on the user's device.

Permissions — things like microphone access, outbound network requests, and on-chain transaction submission — are declared in your Product's [manifest](/reference/apps/hosts/polkadot-desktop/permissions/){target=\_blank} and prompted at runtime. Users see exactly what your Product can access before they grant it. The Host enforces the boundary inside its [sandbox](/reference/apps/protocol/truapi/sandbox/){target=\_blank}, not your code.

**Three Hosts, one Product**: The same `.dot` bundle runs in the mobile Polkadot App, on the workstation in Polkadot Desktop, and in any browser via Polkadot Web. You do not write three apps — the Triangle abstracts the platform.

## Choose Your Path

Two places to start, depending on what you want to do:

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg } __Quick Start__

    ---

    Build a Polkadot Product in 15 minutes without installing a local dev environment. Use a hosted IDE (RevX) or the `dot` CLI.

    [:octicons-arrow-right-24: Try it](/apps/quick-start/)

-   :material-flag-checkered:{ .lg } __Get Started__

    ---

    Install the Polkadot App, install Polkadot Desktop, pair them, and fund your TestNet account. The universal foundation — every other path assumes you have done this.

    [:octicons-arrow-right-24: Begin](/apps/get-started/)

</div>


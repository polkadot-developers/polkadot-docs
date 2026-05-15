---
title: Choose a Network
description: Pick the right Polkadot Desktop environment (Preview / Stable / Paseo Next) for development — what each one targets, the environment matrix, and how to switch.
categories: Apps
---

# Choose a Network

*Set-up · Step 2 of 4 — [Install & Pair](/apps/set-up/install-and-pair/) → **Choose a Network** → [Verify Identity](/apps/set-up/verify-your-identity/) → [Get TestNet Funds](/apps/set-up/get-testnet-funds/)*

## Introduction

Polkadot Desktop targets one of three network environments when you build and test: Preview, Stable, or Paseo Next. Each environment is isolated, so identities, balances, and history do not carry across them.

This page explains what each environment is for and how to switch between them. By the end, you'll know which environment to use for your development workflow and how to change it when needed.

The current default in development builds is Paseo Next, which is what most developers should use unless they have a specific reason to test against the other two.

## Prerequisites

- Polkadot Desktop installed and paired with the Polkadot App. See [Install and Pair](/apps/set-up/install-and-pair/).

## The Three Environments

Polkadot Desktop's segmented control exposes three developer-facing environments:

- **Preview**: Early integration testing of unreleased changes. Use when validating against the freshest code on its way through the release pipeline.
- **Stable**: Release-candidate environment that tracks what end users are expected to see in production. Use to reproduce against the closest-to-prod stack.
- **Paseo Next**: The default in current development builds, targeting the Paseo TestNet. Use this for everyday development and faucet runs.

!!! note "Isolated state per environment"
    Each environment points to a separate People Chain deployment with its own genesis hash. Identities, balances, and chat history do not carry across environments — your account on Paseo Next is a different account from your account on Stable, even though the same key signed both.

### Environment Matrix

| Environment | Purpose                                                              | Default |
|:------------|:---------------------------------------------------------------------|:-------:|
| Preview     | Early integration testing of unreleased changes.                     |    —    |
| Stable      | Release-candidate; closest to what end users will see in production. |    —    |
| Paseo Next  | Paseo TestNet stack — everyday development.                          |    ✓    |

## Switch the Network

Polkadot Desktop offers two routes for switching environments — from the login screen before you sign in, or from **Settings** while you are already logged in. Switching is a one-click action in either case, but the consequences differ depending on whether you are already logged in.

### From the Login Screen

1. Open Polkadot Desktop. The login screen renders with the segmented control at the top-right.

    ![Polkadot Desktop login screen showing the Preview / Stable / Paseo Next segmented control at the top-right](/images/apps/set-up/choose-a-network/choose-a-network-01.webp)

2. Tap the segment for your target environment — **Preview**, **Stable**, or **Paseo Next**.
3. The selection persists in `localStorage` across sessions. Subsequent launches reopen on the environment you last selected.

### From Settings

If you are already logged in, you can switch environments from Polkadot Desktop's settings.

1. Open **Settings** from the gear icon in the top-right toolbar, then select **Testnet endpoint** under **Development** in the left sidebar.

    ![Polkadot Desktop Settings showing the Testnet endpoint dropdown with Preview, Stable, and Paseo Next options](/images/apps/set-up/choose-a-network/choose-a-network-02.webp)

2. Pick your target environment from the dropdown — **Preview**, **Stable**, or **Paseo Next**.
3. Desktop displays a confirmation dialog warning that the endpoint change will log you out and reload the app. Confirm to proceed.

!!! note "Switching environment changes your identity space"
    Each environment is backed by a distinct People Chain deployment with its own genesis hash. Your account on Paseo Next is not the same account as on Stable or Preview — separate identities, balances, and chat history. Switching is the right tool for testing against a different stack; it is not a way to "change networks" while keeping your state.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Verify Your Identity**

    ---

    With your environment selected, verify your developer identity with Proof of Personhood to unlock funds, names, and PoP-gated features.

    [:octicons-arrow-right-24: Get Started](/apps/set-up/verify-your-identity/)

</div>

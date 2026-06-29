---
title: Install Polkadot Desktop and Pair
description: Install Polkadot Desktop, pair it with the Polkadot App on your phone with a QR scan, and set up the foundation for local Polkadot Product development.
categories: Apps
page_badges:
  tutorial_badge: Beginner
---

# Install Polkadot Desktop and Pair

## Introduction

You should already have the Polkadot App on your phone from the [Apps overview](/apps/); it holds your key and approves signing. This page covers installing Polkadot Desktop, where your Product runs, and pairing the two with a QR scan, then forwards you to TestNet funding. About 10 minutes.

Two pieces of the Polkadot Triangle need to be talking to each other: Polkadot Desktop, where your Product runs, and the Polkadot App on your phone, where signing happens.

![Diagram: Polkadot Desktop displays a QR code that the Polkadot App scans; the App returns a session public key, and from then on every signing request routes from Desktop to the App for signature.](/images/apps/get-started/install-and-pair/pairing-flow.svg){: .browser-extension}

Polkadot Desktop never holds your private key. Your identity lives on the Polkadot [People Chain](/reference/glossary/#people-chain), your private key lives in the Polkadot App, and Polkadot Desktop only ever holds a derived session public key — enough to identify you and construct per-Product accounts, but not enough to sign anything on its own.

## Prerequisites

Before getting started, ensure you have:

- The [Polkadot App](/apps/) installed on your phone with an account created (your developer identity and signing device for Polkadot Products)
- A workstation running macOS, Windows, or Linux
- A device (iOS or Android) with a working camera
- Network connectivity on both devices

## Install Polkadot Desktop

1. Download the development build of [Polkadot Desktop](https://www.polkadotcommunity.foundation/desktop).

2. Install the application using your platform's standard installer.

3. Launch Polkadot Desktop. On first launch, Desktop opens into the pairing flow with a QR code.

    ![Polkadot Desktop login screen showing the pairing QR code and the network selector at the top right with Paseo Next V2 selected.](/images/apps/get-started/install-and-pair/install-and-pair-02.webp){: .browser-extension}

    !!! note "Skip for development"
        The login screen also exposes a **Skip (Dev only)** button. Skipping the pairing drops you straight into Desktop without a paired signer, useful for inspecting Desktop or testing a local Product that does not require signing, but most development flows assume a paired Polkadot App.

## Pair Polkadot Desktop with the Polkadot App

Pairing is a one-time cryptographic handshake. Desktop displays the QR code, the App scans it, and the App returns a session public key that Desktop stores. From that point forward, Desktop knows who you are and can construct per-Product sub-accounts, but every signing prompt still routes back to the App for approval.

1. Leave the QR code visible on the Polkadot Desktop login screen.

2. In the Polkadot App, open the camera-scanning view and scan the QR code shown on Desktop. A **Link a new device?** prompt appears with the Desktop version details.

    ![Polkadot App showing the "Link a new device?" prompt listing Polkadot Desktop with Cancel and Link buttons.](/images/apps/get-started/install-and-pair/install-and-pair-03.webp){: .browser-extension}

3. Tap **Link** to confirm. The App briefly shows a **Connecting device...** state while the handshake completes.

    ![Polkadot App showing the "Connecting device..." state with a loading spinner.](/images/apps/get-started/install-and-pair/install-and-pair-04.webp){: .browser-extension}

4. Desktop transitions from the QR code to a **Completing pairing...** state.

    ![Polkadot Desktop showing the "Completing pairing..." state with a loading spinner where the QR code was.](/images/apps/get-started/install-and-pair/install-and-pair-05.webp){: .browser-extension}

5. Once the handshake completes, Desktop opens the main dashboard.

    ![Polkadot Desktop showing the paired dashboard with the address bar and Browse section listing available Products.](/images/apps/get-started/install-and-pair/install-and-pair-06.webp){: .browser-extension}

After pairing, your identity on the People Chain is bound to the Polkadot App for this Desktop session. Every subsequent signing request will route to the App, and you approve or reject each one on the signing device.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Get TestNet Tokens**

    ---

    Claim TestNet tokens from the Polkadot Faucet and unlock per-service allowances.

    [:octicons-arrow-right-24: Continue](/apps/get-started/get-testnet-tokens/)

</div>

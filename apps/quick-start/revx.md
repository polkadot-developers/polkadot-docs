---
title: Build a Polkadot Product with RevX's App Builder
description: Use RevX's App Builder to scaffold a Polkadot Product end to end in the browser — configure an AI provider, generate from a prompt, and publish to .dot. No install required.
categories: Apps
---

# Build a Polkadot Product with RevX's App Builder

## Introduction

This is the browser-based quick start for getting a working Polkadot Product in front of you fast — no local install needed, your whole IDE runs in the browser.

You'll use App Builder, a track inside the [RevX](https://revx.dev/){target=\_blank} browser IDE that scaffolds Polkadot Products from a natural-language prompt and publishes them to a `.dot` name. The output is a **Polkadot Product** — the same kind of `.dot`-published app the [Build](/apps/build/){target=\_blank} guides teach you to write by hand.

By the end of this Quick Start you'll have configured an AI provider in App Builder, generated a Polkadot Product from a prompt, inspected the generated code, and published it to `.dot`.

## Prerequisites

You need an API key for an AI provider supported by App Builder (for example, OpenAI or Anthropic).

!!! warning "Provisional"
    Publish-time prerequisites for the final `Publish to .dot` step are still being confirmed — specifically which signer is used and whether the reader needs a verified identity or TestNet funds for the `.dot` registration. Until settled, the publish step may require completing parts of the [Get Started](/apps/get-started/){target=\_blank} track (install PWallet, pair, verify identity, fund the account).

## Open RevX

Open [RevX](https://revx.dev/){target=\_blank} in your browser. RevX is a browser-based IDE; we'll use its App Builder track to scaffold a Polkadot Product end to end.

![RevX IDE landing view showing the main workspace](/images/apps/revx/revx-01.webp)

## Open App Builder

From the sidebar, select **App Builder**. App Builder is RevX's track for generating Polkadot Products using AI-assisted workflows.

![RevX sidebar with the App Builder option highlighted](/images/apps/revx/revx-02.webp)

## Create a New App

Click **Create App** to start a new project. RevX automatically installs the required dependencies and initializes the project environment so you can move straight into configuration and prompting.

![RevX App Builder showing the Create App action and the initialized project environment](/images/apps/revx/revx-03.webp)

After clicking **Create App**, you will see a loading screen while the IDE initializes the project environment.

![RevX App Builder showing the loading screen while the IDE initializes the project environment](/images/apps/revx/revx-04.webp)

!!! note
    Initial setup may take a moment while dependencies install. Wait for the environment to finish initializing before configuring the builder.

Once the environment is initialized, you will see a minimal app scaffolded in the editor and running in the terminal.

![RevX App Builder showing the minimal app scaffolded in the editor and running in the terminal](/images/apps/revx/revx-05.webp)

## Configure the Builder

From the App Builder view, click the **Settings** icon to open the AI configuration panel.

![RevX App Builder settings icon](/images/apps/revx/revx-06.webp)

Configure the following:

- **AI provider**: The backend service that powers code generation.
- **API key**: The credential for your AI provider.
- **Model**: The specific model to use from the selected provider.

![RevX App Builder configuration panel showing API key, AI provider, and model fields](/images/apps/revx/revx-07.webp)

These settings let the IDE generate applications using the selected AI backend. You can change them at any time if you want to switch providers or models.

## Generate an App

Use the chat interface to describe the app you want to build. RevX generates the application structure and code automatically based on your prompt.

For example:

> Build a Product that shows the balance of Alice (a standard Substrate dev account)

After you submit the prompt, the IDE produces the project files and scaffolds the app for you to review.

![RevX chat interface with a prompt entered and the generated app structure on the right](/images/apps/revx/revx-08.webp)

!!! tip
    Keep prompts concrete and scoped. Short, specific prompts tend to produce app structures that are easier to review and iterate on.

## Inspect the Generated Code

Once generation completes, open the generated files in the editor to review what was produced. You can continue iterating on the application from within RevX — refining the prompt, editing code directly, or layering additional changes through the chat interface.

![RevX editor showing the generated app source files open for inspection](/images/apps/revx/revx-09.webp)

## Publish to `.dot`

When your app is ready, click **Publish to .dot** to deploy the application to the Polkadot ecosystem. The publish action takes the app you generated in RevX and makes it available under a `.dot` name.

![RevX App Builder showing the Publish to .dot action](/images/apps/revx/revx-10.webp)
![RevX App Builder showing the Publish to .dot action](/images/apps/revx/revx-10.webp)

After clicking **Start Deploy**, you will be asked to sign the transaction with your signer.

![RevX App Builder showing the transaction signing prompt](/images/apps/revx/revx-11.webp)

After signing the transaction, you will see the deployment progress in the terminal.

!!! warning "Provisional"
    The deployed-Product-in-the-browser step is currently blocked on a signer issue, so the final screenshot is pending. Until then, the signing prompt above is the last visible state on this page. We'll update this section once the signer flow lands.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Quick Start</span> **Build from the CLI**

    ---

    Prefer the terminal? Install the Playground CLI and ship a Polkadot Product end to end from your workstation.

    [:octicons-arrow-right-24: Open the CLI Quick Start](/apps/quick-start/playground-cli/)

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Now that you've published your first Polkadot Product, dive into the Build Guides for deeper workflows — local dev loops, signing flows, and Polkadot infrastructure integration.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

-   <span class="badge guide">Local Dev</span> **Continue Locally with Polkadot Desktop**

    ---

    Ready to write Polkadot Products from scratch (or take your RevX-built Product further)? Set up the local dev loop: Polkadot Desktop loads from `localhost`, you iterate with live reload.

    [:octicons-arrow-right-24: Local Development](/apps/local-development/)

</div>


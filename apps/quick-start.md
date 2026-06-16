---
title: Quick Start with RevX
description: Generate and publish a Polkadot Product from the browser with RevX App Builder, then sign the final .dot deployment with the Polkadot App.
categories: Apps
toggle:
  group: apps-quick-start
  canonical: true
  variant: revx
  label: Web IDE
---

# Quick Start with RevX

Generate and publish a Polkadot Product in the browser with RevX App Builder. RevX gives you a browser-based IDE, scaffolds a Product from a natural-language prompt, and publishes it to a `.dot` name after you sign the final step with the Polkadot App.

This route does not require a local development environment. By the end, you will have configured an AI provider in App Builder, generated a Polkadot Product from a prompt, inspected the generated code, and published it to `.dot`.

## Prerequisites

Before starting, make sure you have:

- The [Polkadot App](/apps/) installed on your phone with an account created; it signs the final publish step.
- An API key for an AI provider supported by App Builder, such as OpenAI or Anthropic.

## Open RevX

Open [RevX](https://revx.dev/){target=\_blank} in your browser. RevX is a browser-based IDE; you will use the App Builder track to scaffold a Polkadot Product end to end.

![RevX IDE landing view showing the main workspace](/images/apps/quick-start/revx/revx-01.webp)

## Open App Builder

From the sidebar, select **App Builder**. App Builder is RevX's track for generating Polkadot Products using AI-assisted workflows.

![RevX sidebar with the App Builder option highlighted](/images/apps/quick-start/revx/revx-02.webp)

## Create a New App

Click **Create App** to start a new project. RevX automatically installs the required dependencies and initializes the project environment so you can move straight into configuration and prompting.

![RevX App Builder showing the Create App action and the initialized project environment](/images/apps/quick-start/revx/revx-03.webp)

After clicking **Create App**, you will see a loading screen while the IDE initializes the project environment.

![RevX App Builder showing the loading screen while the IDE initializes the project environment](/images/apps/quick-start/revx/revx-04.webp)

!!! note
    Initial setup may take a moment while dependencies install. Wait for the environment to finish initializing before configuring the builder.

Once the environment is initialized, you will see a minimal app scaffolded in the editor and running in the terminal.

![RevX App Builder showing the minimal app scaffolded in the editor and running in the terminal](/images/apps/quick-start/revx/revx-05.webp)

## Configure the Builder

From the App Builder view, click the **Settings** icon to open the AI configuration panel.

![RevX App Builder settings icon](/images/apps/quick-start/revx/revx-06.webp)

Configure the following:

- **AI provider**: The backend service that powers code generation.
- **API key**: The credential for your AI provider.
- **Model**: The specific model to use from the selected provider.

![RevX App Builder configuration panel showing API key, AI provider, and model fields](/images/apps/quick-start/revx/revx-07.webp)

These settings let the IDE generate applications using the selected AI backend. You can change them at any time if you want to switch providers or models.

## Generate an App

Use the chat interface to describe the app you want to build. RevX generates the application structure and code automatically based on your prompt.

!!! example "Example prompt"
    Build a Product that shows the balance of Alice (a standard Substrate dev account)

After you submit the prompt, the IDE produces the project files and scaffolds the app for you to review.

![RevX chat interface with a prompt entered and the generated app structure on the right](/images/apps/quick-start/revx/revx-08.webp)

!!! tip
    Keep prompts concrete and scoped. Short, specific prompts tend to produce app structures that are easier to review and iterate on.

## Inspect the Generated Code

Once generation completes, open the generated files in the editor to review what was produced. You can continue iterating on the application from within RevX: refine the prompt, edit code directly, or layer additional changes through the chat interface.

![RevX editor showing the generated app source files open for inspection](/images/apps/quick-start/revx/revx-09.webp)

## Publish to `.dot`

When your app is ready, click **Publish to .dot** to deploy the application to the Polkadot ecosystem. The publish action takes the app you generated in RevX and makes it available under a `.dot` name.

![RevX App Builder showing the Publish to .dot action](/images/apps/quick-start/revx/revx-10.webp)

After clicking **Start Deploy**, you will be asked to sign the transaction with your Polkadot App.

![RevX App Builder showing the transaction signing prompt](/images/apps/quick-start/revx/revx-11.webp)

After signing the transaction, you will see the deployment progress in the terminal. Your Product is now live under its `.dot` name. Open it in Polkadot Desktop, or on Polkadot Web at `https://<name>.dot.li` in any browser.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Set up the local dev loop, then add capabilities to your Product: signing, on-chain reads, decentralized storage, off-chain pub/sub, and local persistence.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

</div>

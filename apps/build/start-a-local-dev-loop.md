---
title: Start a Local Dev Loop
description: Run a Polkadot Product locally inside Polkadot Desktop using the localhost whitelist for fast iteration with live reload, no chain or IPFS required.
categories: Basics, Apps
---

# Start a Local Dev Loop

## Introduction

With Polkadot Desktop installed, you are ready to start building — and the first thing you need is a fast inner loop: a way to see changes immediately without publishing to IPFS or registering a `.dot` name for every iteration. You do _not_ need a verified identity or TestNet funds for this loop; those matter only later, when your Product calls features that require them. This page walks you through the loop.

Polkadot Desktop is a specialized browser that loads Polkadot Products. In production, it resolves a `.dot` domain name through a chain lookup and fetches the bundle from IPFS. During development, that flow adds latency and a publishing step you do not want.

To make local development feel similar to standard web work, Polkadot Desktop whitelists `localhost` in its address bar. When you point it at `localhost:3000` (or any local port), Desktop bypasses `.dot` resolution entirely and loads your Product directly from the local origin. Live reload, source maps, and the rest of your toolchain behave exactly as they do in a regular browser.

The `localhost` whitelist is a navigation-time bypass only. Your Product still runs inside the same sandbox as a published `.dot` Product: every chain or device call goes through the Host API, and Desktop still surfaces the same permission prompts (microphone, external requests, chain submissions, and so on) for any capabilities your Product declares. This is the primary development loop you should use when building a Product.

## Prerequisites

Before starting, ensure you have:

- [Polkadot Desktop](/apps/set-up/install-and-pair/) installed
- A local development server for your Product (this page uses [Next.js](https://nextjs.org/) as the example, but any framework that serves on `localhost` works)
- [Node.js](https://nodejs.org/) v18 or higher installed

!!! note
    For the local dev loop, you do _not_ need:

    - Proof of Personhood (PoP) verification
    - Funds on any chain

    No on-chain interaction occurs while you are loading a Product from `localhost`. PoP and funds become relevant only when your Product calls features that require them — at which point you can switch to a paired account or a TestNet network.

    Each subsequent guide in the build track lists its own prerequisites — check them as you progress.

## Create Your First Product

You need a local project to serve from `localhost`. Any framework that serves over HTTP works. The steps below scaffold a minimal Next.js project as the example.

Run the following command and follow the prompts to create a new project:

```bash
npx create-next-app@latest my-product
cd my-product
```

Then add the [Product SDK](https://github.com/paritytech/product-sdk), the single package that provides everything you need to build a Polkadot Product. It includes typed modules for chain interaction, signing, storage, and the Host API that subsequent guides in this track rely on:

```bash
npm install @parity/product-sdk
```

With the SDK installed, continue to the next section to start the dev server and load the Product in Desktop.

## Start Your Local Dev Server

First, run your Product the same way you would for any web app. The example below uses a Next.js project, but the steps are identical for Vite, Create React App, or any other framework that serves over HTTP on `localhost`.

1. From your project root, install dependencies:

    ```bash
    npm install
    ```

2. Start the dev server:

    ```bash
    npm run dev
    ```

3. Confirm the server is listening. You should see output similar to the following:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npm run dev</span>
        <span data-ty></span>
        <span data-ty>&gt; test@0.1.0 dev</span>
        <span data-ty>&gt; next dev</span>
        <span data-ty></span>
        <span data-ty>▲ Next.js 16.2.4 (Turbopack)</span>
        <span data-ty>- Local:        http://localhost:3000</span>
        <span data-ty>✓ Ready in 309ms</span>
    </div>

## Load Your Product in Polkadot Desktop

With the dev server running, open Polkadot Desktop and navigate to your local origin.

1. Open Polkadot Desktop and click **"Skip (Dev only)"**:
    ![Polkadot Desktop showing the "Skip (Dev only)" button](/images/apps/build/start-a-local-dev-loop/start-a-local-dev-loop-01.webp)

2. Click the address bar and type `localhost:3000` (replace `3000` with your dev server's port if different).
3. Press **Enter**.

    Desktop recognizes `localhost` as a whitelisted origin, skips `.dot` resolution, and loads your Product directly from the local server.

    ![Polkadot Desktop showing a local Product loaded from localhost:3000](/images/apps/build/start-a-local-dev-loop/start-a-local-dev-loop-02.webp)

Your Product is running inside the Polkadot Desktop sandbox, served from your local machine.

## Iterate with Live Reload

Because Desktop is loading directly from your dev server, the standard web development feedback loop works without any extra configuration.

1. Edit a source file in your Product (for example, change a string in a React component).
2. Save the file.
3. Polkadot Desktop reloads the Product automatically as your dev server's hot module replacement (HMR) emits the update.

    ![Polkadot Desktop reflecting a live-reloaded change from the dev server](/images/apps/build/start-a-local-dev-loop/start-a-local-dev-loop-03.webp)

From here, iterate as you would in any web project: edit, save, and watch the change appear in Desktop. Source maps, browser-style devtools, and console logs all behave normally.

!!! tip
    The sandbox still applies. If your Product calls a Host API method that requires a permission, Desktop prompts the user exactly as it would for a published `.dot` Product. Test your permission flows locally — do not defer them to a staging build.

    The environment you selected during setup (Preview, Stable, or Paseo Next) determines which chain your Product connects to when it calls the Host API.

## How localhost Navigation Differs from .dot Navigation

The `localhost` whitelist changes only how Desktop finds your Product. Everything that happens after load is identical between the two flows.

|        Step         |         `.dot` navigation          |        `localhost` navigation        |
| :-----------------: | :--------------------------------: | :----------------------------------: |
|  Address bar input  |          `myproduct.dot`           |           `localhost:3000`           |
|     Resolution      | On-chain lookup of the `.dot` name |        Skipped (whitelisted)         |
|     Asset fetch     | IPFS fetch of the published bundle | HTTP fetch from the local dev server |
| Sandbox enforcement |                Full                |                 Full                 |
|   Host API access   |      Mediated by the sandbox       |       Mediated by the sandbox        |
|  Permissions model  |              Enforced              |               Enforced               |
|     Live reload     | Not applicable (immutable bundle)  | Works through your dev server's HMR  |

The key takeaway: you can rely on `localhost` for fast iteration without losing fidelity with the production runtime. A Product that works correctly under the `localhost` whitelist will behave the same way once published as a `.dot` Product, because the Polkadot Desktop sandbox applies the same constraints in both modes.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    Wire your Product up to a paired account so it can request signatures from PWallet through the Host API.

    [:octicons-arrow-right-24: Get Started](/apps/build/accounts-and-signing/)

-   <span class="badge guide">Guide</span> **Request Permissions**

    ---

    Learn how the sandbox Permissions model works and how to request capabilities your Product needs at runtime.

    [:octicons-arrow-right-24: Get Started](/apps/build/request-permissions/)

</div>

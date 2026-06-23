---
title: Quick Start with the CLI
description: Install playground-cli, pair it with the Polkadot App, build your Product, and deploy it to a live .dot name from the terminal.
categories: Apps
toggle:
  group: apps-quick-start
  variant: cli
  label: CLI
---

# Quick Start with the CLI

Deploy a Polkadot Product from your terminal with playground-cli. The `pg` command pairs with your Polkadot App, builds your Product, uploads the bundle, and publishes it to a `.dot` name.

This is the command-line route for getting a Polkadot Product deployed end to end from your workstation. The CLI is the command-line counterpart to Polkadot Desktop: Desktop runs published Products by their `.dot` names; `pg` takes a project on disk and turns it into one.

## Prerequisites

Before starting, make sure you have:

- The [Polkadot App](/apps/) installed on your phone with an account created; it pairs with `pg` and signs the publish step.
- A terminal with `curl` available and permission to install CLI tools in your user shell environment.
- A Polkadot Product project on disk with a package-manager build command.

!!! note "CLI version"
    This route targets playground-cli `0.27.1`. The CLI is in active development and breaking changes between versions are expected. To follow along, install this version, or check this page's last update against the latest release.

## Install the CLI

1. Run the installer:

    ```bash
    curl -fsSL https://raw.githubusercontent.com/paritytech/playground-cli/main/install.sh | bash
    ```

2. Open a new shell, or `source` your RC file, and verify the install:

    ```bash
    pg --version
    ```

!!! note "Command aliases"
    The installer registers two interchangeable commands: `playground` (canonical) and `pg` (short alias). This guide uses `pg` throughout.

## Initialize

`pg init` installs toolchain dependencies and pairs the CLI with your signer. It is safe to re-run; existing installs and sessions are detected and skipped.

```bash
pg init
```

--8<-- 'code/apps/quick-start/cli/termynal-init.html'

!!! tip
    Toolchain install runs in parallel with the login step, so you can scan the QR code while dependencies download.

!!! note "Signer modes"
    - **Mobile signer** (`--signer phone`, default): Pairs with the Polkadot App via QR code. Required for `pg init` and recommended for any deploy you intend to keep.
    - **Dev-only signer** (`--signer dev`): No phone needed; uses shared development keys (for example, `--suri //Alice`). The deployed `.dot` Product will be owned by the shared dev account, not by you.

## Build

`pg build` auto-detects and runs your project build.

```bash
pg build
```

--8<-- 'code/apps/quick-start/cli/termynal-build.html'

## Deploy

`pg deploy` runs the full pipeline: build the frontend, upload artifacts to the Polkadot Bulletin Chain, and register a `.dot` domain via DotNS. Before building, it always runs your package manager's install step to keep dependencies in sync.

```bash
# Interactive - pg prompts for signer, domain, and build directory
pg deploy

# Dev signer - no phone needed (the deployed Product is owned by the shared dev account)
pg deploy --signer dev --domain my-app
```

--8<-- 'code/apps/quick-start/cli/termynal-deploy.html'

!!! note
    `pg deploy` includes a memory watchdog that aborts the deploy if the process exceeds 4 GB RSS. If you hit this limit, set `DOT_MEMORY_TRACE=1` alongside `DOT_DEPLOY_VERBOSE=1` to capture per-second RSS and heap samples.

??? note "More CLI commands"

    - **`pg mod`**: Clones a moddable app from the Playground registry so you can customize and redeploy it as your own Product. Only apps that opted into `--moddable` at deploy time are listed. Pass a domain label, such as `my-app` or `my-app.dot`, to clone directly, or omit it to open an interactive picker showing every moddable app.

        ```bash
        pg mod [domain]
        ```

    - **`pg logout`**: Signs out of the paired account and clears session files under `~/.polkadot-apps/`. A no-op if you are not signed in.

        ```bash
        pg logout
        ```

    - **`pg update`**: Updates `pg` to the latest version from the GitHub releases page.

        ```bash
        pg update
        ```

You have deployed a Polkadot Product. To keep building it with your own editor and toolchain, head to the Build guides; they open with [project setup](/apps/build/#set-up-your-project) so Polkadot Desktop can load your Product from `localhost` while you iterate with live reload.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Set up the local dev loop, then add capabilities to your Product: signing, on-chain reads, decentralized storage, off-chain pub/sub, and local persistence.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

</div>

---
title: Playground CLI
description: Install playground-cli (the `dot` binary) and use it to build, deploy, and manage Polkadot Products from the command line.
categories: Apps
---

# Playground CLI

This is the terminal-based Quick Start for getting a Polkadot Product deployed end-to-end from your workstation. (Prefer a browser IDE? See [Build a Polkadot Product with RevX's App Builder](/apps/quick-start/revx/){target=\_blank}.)

You'll install playground-cli — the `dot` binary — pair it with a signer, build your Product, and publish it to a `.dot` name. The CLI is the command-line counterpart to Polkadot Desktop: Desktop runs published Products by their `.dot` names; `dot` takes a project on disk and turns it into one.

!!! info "CLI version"
    This page targets playground-cli `0.22.6`. The CLI is in active development and breaking changes between versions are expected. To follow this guide, install this version (or check the page's last update against the latest release).

## Prerequisites

- macOS or Linux with `curl` available. (Windows: use WSL.)
- A signer for the deploy step — [PWallet](https://app.dotsamalabs.com/#/){target=\_blank} is the recommended path.

!!! warning "Provisional — picking a signer"
    The CLI supports two signer modes and we're still settling on which is the Quick Start happy path:

    - Mobile signer (`--signer phone`, default) — install [PWallet](https://app.dotsamalabs.com/#/){target=\_blank} on a camera-equipped device. Required for the interactive `dot init` QR login. Recommended for any deploy you intend to keep.
    - Dev-only signer (`--signer dev`) — no phone needed; uses shared development keys (e.g., `--suri //Alice`). Positioned in the CLI for CI and local iteration. Caveat: the deployed `.dot` Product is owned by the shared dev account, not by you.

`dot init` installs the rest of the toolchain (rustup, nightly, rust-src, foundry, cdm, IPFS, gh) for you. To install them yourself, see the [CLI reference](/reference/apps/tooling/playground-cli/){target=\_blank}.

## Install the CLI

1. Run the installer:

    ```bash
    curl -fsSL https://raw.githubusercontent.com/paritytech/playground-cli/main/install.sh | bash
    ```

2. Open a new shell (or `source` your RC file) and verify the install:

    ```bash
    dot --version
    ```

## Initialize

`dot init` installs toolchain dependencies and pairs the CLI with your signer. It is safe to re-run; existing installs and sessions are detected and skipped.

```bash
dot init
```

--8<-- 'code/apps/quick-start/playground-cli/termynal-init.html'

!!! tip
    Toolchain install runs in parallel with the login step, so you can scan the QR code while dependencies download.

## Build

`dot build` auto-detects and runs your project build.

```bash
dot build
```

--8<-- 'code/apps/quick-start/playground-cli/termynal-build.html'

## Deploy

`dot deploy` runs the full pipeline: build the frontend, upload artifacts to the Polkadot Bulletin Chain, and register a `.dot` domain via DotNS. Before building, it always runs your package manager's install step to keep dependencies in sync.

```bash
# Interactive — dot prompts for signer, domain, and build directory
dot deploy

# Dev signer — no phone needed (the deployed Product is owned by the shared dev account)
dot deploy --signer dev --domain my-app
```

--8<-- 'code/apps/quick-start/playground-cli/termynal-deploy.html'

!!! note
    `dot deploy` includes a memory watchdog that aborts the deploy if the process exceeds four GB RSS. If you hit this limit, set `DOT_MEMORY_TRACE=1` (alongside `DOT_DEPLOY_VERBOSE=1`) to capture per-second RSS and heap samples.

??? note "More CLI commands"

    ### dot mod

    Clones a moddable app from the Playground registry so you can customize and redeploy it as your own Product. Only apps that opted into `--moddable` at deploy time are listed.

    ```bash
    dot mod [domain]
    ```

    Pass a domain label (e.g., `my-app` or `my-app.dot`) to clone directly, or omit it to open an interactive picker showing every moddable app.

    ### dot logout

    Signs out of the paired account and clears session files under `~/.polkadot-apps/`. A no-op if you are not signed in.

    ```bash
    dot logout
    ```

    ### dot update

    Updates `dot` to the latest version from the GitHub releases page.

    ```bash
    dot update
    ```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Quick Start</span> **Build in the Browser**

    ---

    Prefer not to leave your browser? Generate a Polkadot Product from a natural-language prompt with RevX's App Builder.

    [:octicons-arrow-right-24: Open the RevX Quick Start](/apps/quick-start/revx/)

-   <span class="badge guide">Set Up</span> **Pair Polkadot Desktop**

    ---

    If you ran the dev-only flow above, complete the canonical Set Up track to pair your wallet and run your Products in Polkadot Desktop.

    [:octicons-arrow-right-24: Start Set Up](/apps/set-up/install-and-pair/)

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Dive into the hand-written workflows: local dev loops, signing flows, on-chain reads, and Polkadot infrastructure integration.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

</div>

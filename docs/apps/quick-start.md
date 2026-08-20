---
title: Quick Start with the CLI
description: Install playground-cli, pair it with the Polkadot App, build your Product, and deploy it to a live .dot name from the terminal.
categories: Apps
toggle:
  group: apps-quick-start
  canonical: true
  variant: cli
  label: CLI
---

# Quick Start with the CLI

Deploy a Polkadot Product from your terminal with playground-cli. The `pg` command pairs with your [Polkadot App](/reference/apps/hosts/polkadot-app/), builds your Product, uploads the bundle, and publishes it to a `.dot` name. No local host setup is required to reach a live deployment.

The CLI is the command-line counterpart to [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/): Desktop runs published Products by their `.dot` names; `pg` takes a project on disk and turns it into one. By the end of this guide, you will have a Product live at its own `.dot` address, reachable in any browser through the `.dot.li` gateway.

## Before You Start

Get these in order before your first deploy. The last two are easy to skip and fail silently later, so do not leave them out:

1. **Install the [Polkadot App](/apps/)** on your phone and create an account. It pairs with `pg` and signs your deploy.
2. **Have a terminal** with `curl` available and permission to install CLI tools in your user shell.
3. **Have a Product project** on disk with a package-manager build command.
4. **Fund your account with PAS** from the [faucet](/apps/get-started/get-testnet-tokens/). PAS pays transaction fees and the `.dot` name deposit.
5. **Get a Bulletin Chain storage authorization** for the account that will sign. Without it, uploads are rejected at deploy time even when your balance is fine — a prerequisite that surfaces only as a failed publish. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/).

!!! warning "Fund the account that actually signs"
    The PAS balance and the storage authorization are both per account, and the account that signs your deploy may not be the one you expect. If a deploy fails with `no allowance set for account`, see [Accounts and Signing](/apps/concepts/accounts/) and the [troubleshooting entry](/apps/troubleshooting/#no-allowance-set-for-account). Account mapping to an EVM address is handled for you for the product account you deploy with; a smart contract needs its signing account mapped explicitly, covered in [Deploy and Integrate a Smart Contract](/apps/build/deploy-a-smart-contract/).

!!! note "What a first deploy costs"
    In one test run, taking an app live cost about 10.4 PAS: roughly 10 PAS for the `.dot` name and about 0.4 PAS for a 2.6 KB upload, with each on-chain step taking around a minute. Name cost depends on length and tier, so treat these as a ballpark. On TestNet, funding is rarely the constraint.

!!! note "CLI version"
    The CLI is in active development, and breaking changes between versions are expected. If a command below no longer matches, check this page's last update against the latest [playground-cli release](https://github.com/paritytech/playground-cli/releases).

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

!!! note "Your phone will prompt — check it"
    With the phone signer, each on-chain step waits for you to approve it in the Polkadot App, and no push notification announces the prompt. If the deploy seems to pause (including a deliberate ~60-second wait while your `.dot` name is registered), open the app and approve the pending request. See [Troubleshooting](/apps/troubleshooting/#the-app-seems-frozen-after-an-action).

!!! note
    `pg deploy` includes a memory watchdog that aborts the deploy if the process exceeds 4 GB RSS. If you hit this limit, set `DOT_MEMORY_TRACE=1` alongside `DOT_DEPLOY_VERBOSE=1` to capture per-second RSS and heap samples.

For the full interactive deploy walkthrough, including the domain-name rules, contract redeploys, and the confirmation summary, see [Deploy Your App](/apps/deploy-your-app/).

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

-   <span class="badge learn">Learn</span> **Product SDK**

    ---

    Understand the SDK that powers your Product: what each package does and how the pieces fit together.

    [:octicons-arrow-right-24: Product SDK](/apps/product-sdk/)

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Set up the local dev loop, then add capabilities to your Product: signing, on-chain reads, decentralized storage, off-chain pub/sub, local persistence, and smart contracts.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

-   <span class="badge guide">Guide</span> **Deploy Your App**

    ---

    The full deploy flow in depth: build the bundle, register a `.dot` name, publish to the playground, and go live on the Bulletin Chain.

    [:octicons-arrow-right-24: Deploy Your App](/apps/deploy-your-app/)

</div>

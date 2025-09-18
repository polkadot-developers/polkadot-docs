---
title: Quickstart Parachain Development with Pop CLI
description: Quickly bootstrap parachain projects, scaffold templates, deploy local networks, and streamline development workflows using Pop CLI.
categories: Parachains, Tooling
url: https://docs.polkadot.com/develop/toolkit/parachains/quickstart/pop-cli/
---

# Quickstart Parachain Development With Pop CLI

## Introduction

[Pop CLI](https://onpop.io/cli/){target=\_blank} is a powerful command-line tool designed explicitly for rapid parachain development within the Polkadot ecosystem. It addresses essential developer needs by providing streamlined commands to set up development environments, scaffold parachain templates, and manage local blockchain networks.

Pop CLI simplifies parachain development with features like:

- Quick initialization of parachain development environments.
- Project scaffolding from predefined parachain templates.
- Easy deployment and management of local development networks.

Developers can quickly begin coding and testing, significantly reducing setup overhead.

### Install Pop CLI

To install Pop CLI, run the following command:

```bash
cargo install --force --locked pop-cli
```

Confirm that Pop CLI is installed by running `pop --help` in your terminal:

```bash
pop --help
```

### Set Up Your Development Environment

To develop and build Polkadot SDK-based chains, preparing your local environment with the necessary tools and dependencies is essential. The [Install Polkadot SDK Dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} guide walks you through this setup step-by-step.

However, you can automate this entire process by running:

```bash
pop install
```

This command provides an interactive experience that checks and installs all necessary dependencies for you. It’s the fastest and easiest way to prepare your development environment for building parachains with Pop CLI.

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>pop install</span>
  <span data-ty>┌ Pop CLI : Install dependencies for development</span>
  <span data-ty>│ </span>
  <span data-ty></span>
  <span data-ty>⚙ ℹ️ Mac OS (Darwin) detected.</span>
  <span data-ty>│ </span>
  <span data-ty>⚙ More information about the packages to be installed here: https://docs.substrate.io/install/macos/</span>
  <span data-ty>│ </span>
  <span data-ty>◆ 📦 Do you want to proceed with the installation of the following packages: homebrew, protobuf, openssl, rustup and cmake ?</span>
  <span data-ty>│ ● Yes / ○ No </span>
</div>


### Initialize a Project

Start a new project quickly using Pop CLI's `pop new parachain` command:

<div id="termynal" data-termynal>
  <img src="/images/develop/toolkit/parachains/quickstart/pop-new.gif" alt="pop new" style="max-width: 100%" />
</div>


The command above scaffolds a new parachain project using the default template included with Pop CLI. For more specialized implementations, additional templates are available; you can explore them by running `pop new parachain --help`.

Once the project is generated, move into the new directory and build your parachain:

```
cd my-parachain
pop build --release
```

!!! note
    Under the hood, `pop build --release` runs `cargo build --release`, but `pop build` adds functionality specific to Polkadot SDK projects, such as [deterministic runtime builds](/develop/parachains/deployment/build-deterministic-runtime/){target=\_blank} and automatic management of feature flags like `benchmark` or `try-runtime`.

Pop CLI integrates the [Zombienet SDK](https://github.com/paritytech/zombienet-sdk){target=\_blank} allowing you to easily launch ephemeral local networks for development and testing. To start a network, simply run the following:

```bash
pop up network -f ./network.toml
```

This command will automatically fetch the necessary binaries and spin up a Polkadot network with your configured parachains.

You can also interact with your local network using Pop CLI's `pop call chain` command:

<div id="termynal" data-termynal>
  <img src="/images/develop/toolkit/parachains/quickstart/call-chain.gif" alt="pop call" style="max-width: 100%" />
</div>


## Where to Go Next

For a comprehensive guide to all Pop CLI features and advanced usage, see the official [Pop CLI](https://learn.onpop.io/appchains) documentation.

!!! tip
    Pop CLI also offers powerful solutions for smart contract developers. If you're interested in that path, check out the [Pop CLI Smart Contracts](https://learn.onpop.io/contracts) documentation.

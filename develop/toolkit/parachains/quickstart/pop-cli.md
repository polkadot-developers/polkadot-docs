---
title: Quickstart Parachain Development with Pop CLI
description: Quickly bootstrap parachain projects, scaffold templates, deploy local networks, and streamline development workflows using Pop CLI.
---

# Quickstart Parachain Development with Pop CLI

## Introduction

[Pop CLI](https://onpop.io/cli/){target=\_blank} is a powerful command-line tool designed explicitly for rapid parachain development within the Polkadot ecosystem. It addresses essential developer needs by providing streamlined commands to set up development environments, scaffold parachain templates, and manage local blockchain networks.

Pop CLI simplifies parachain development with features like:

- Quick initialization of parachain development environments

- Project scaffolding from predefined parachain templates

- Easy deployment and management of local development networks

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

### Set up your development environment

To develop and build Polkadot SDK-based it's essential to prepare your local environment with the necessary tools and dependencies. The [Install Polkadot SDK Dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} guide walks you through this setup step-by-step.

However, you can automate this entire process by running:

```bash
pop install
```

This command provides an interactive experience that checks for all necessary dependencies and installs them for you. It’s the fastest and easiest way to get your development environment ready for building parachains with Pop CLI.

--8<-- 'code/develop/toolkit/parachains/quickstart/pop-cli/install.html'

### Initialize a Project

Start a new project quickly using Pop CLI `pop new parachain` command:

--8<-- 'code/develop/toolkit/parachains/quickstart/pop-cli/new-parachain.html'

Once the project is generated, move into the new directory and build your parachain:

```
cd my-parachain
pop build --release
```

Pop CLI integrates the [Zombienet-SDK](https://github.com/paritytech/zombienet-sdk){target=\_blank} allowing you to easily launch ephemeral local networks for development and testing. To start a network, simply run the following:

```bash
pop up network -f ./network.toml
```

This command will automatically fetch the necessary binaries and spin up a Polkadot network with your configured parachains.

You can also interact with your local network using Pop CLI `pop call chain` command:

--8<-- 'code/develop/toolkit/parachains/quickstart/pop-cli/call-chain.html'

## Where to Go Next

For a comprehensive guide to all Pop CLI features and advanced usage, see the official [Pop CLI](https://learn.onpop.io/appchains) documentation. 
!!! tip
    Pop CLI also offers powerful solutions for smart contract developers. If you're interested in that path, check out the [Pop CLI Smart Contracts](https://learn.onpop.io/contracts) documentation.
---
title: Build Pallet
description: TODO
---

# Build Pallet

## Introduction

In Polkadot SDK-based blockchains, runtime functionality is built through modular components called pallets. These pallets are Rust-based runtime modules created using FRAME (Framework for Runtime Aggregation of Modular Entities), a powerful library that simplifies blockchain development by providing specialized macros and standardized patterns for building blockchain logic.
A pallet encapsulates a specific set of blockchain functionalities, such as managing token balances, implementing governance mechanisms, or creating custom state transitions.

For this tutorial,you'll use the [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank}, a pre-configured blockchain template that provides a functional development environment. This template offers a ready-to-use single-node blockchain with essential components like user account management and balance tracking, allowing you to focus on developing your specific blockchain logic.

The node template serves as an ideal starting point for blockchain developers, providing:

- A complete, runnable blockchain runtime
- Preconfigured core blockchain functionalities
- A minimal setup that accelerates development

Throughout this tutorial, you'll learn how to:

- Create a custom pallet from scratch
- Integrate the pallet into an existing blockchain runtime

By the end of this guide, you'll have practical experience in building modular, composable blockchain components within the Polkadot SDK ecosystem.

## Prerequisites

To set up your development environment for the Polkadot SDK, you'll need:

- Rust installation - the node template is written in [Rust](https://www.rust-lang.org/){target=\_blank}. Install it by folloing the [Installation](/develop/parachains/get-started/install-polkadot-sdk){target=\_blank} guide for step-by-step instructions on setting up your development environment

## Download and Compile the Node Template

The [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} provides a ready-to-use development environment for building using the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank}. Follow these steps to compile the node:

1. Clone the repository:
    ```bash
    git clone -b {{dependencies.polkadot_sdk_solochain_template.version}} {{dependencies.polkadot_sdk_solochain_template.repository_url}}
    ```

    !!!note
        Ensure you're using the version `{{dependencies.polkadot_sdk_solochain_template.version}}` of the Polkadot SDK Solochain Template to be able to follow this tutorial step by step.

2. Navigate to the project directory:
    ```bash
    cd polkadot-sdk-solochain-template
    ```

3. Compile the node template:
    ```bash
    cargo build --release
    ```

    !!!note
        Initial compilation may take several minutes, depending on your machine specifications. Use the `--release` flag for optimized artifacts.

4. Verify successful compilation by checking the output is similar to:
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/compilation-output.html'

## Create a New Project

Because this workshop is all about demonstrating the full workflow for creating a new custom pallet you won't start with the pallet-template. Instead, the first step is to create a new Rust package for the pallet you'll be building.

To create a project:

1. Change to the `pallets` directory in your workspace:

    ```bash
    cd pallets
    ```

2. Create a new Rust lib project for the pallet by running the following command:

    ```bash
    cargo new --lib custom-pallet
    ```

3. Change to the `custom-pallet` directory by running the following command:

    ```bash
    cd custom-pallet
    ```

4. Check that the project was created succesfully

    The file structure should look like this:

    ```
    ├── Cargo.toml
    └── src
        └── lib.rs
    ```

## Add Dependencies

The pallet that you'll build is going to be part of a Polkadot SDK-based runtime. Because of this, you need to include some modules it depends on in the `Cargo.toml` file. Your pallet is part of the runtimes workspace, so:

1. Open your `Cargo.toml` file

2. Add the following dependencies:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/Cargo.toml:10:18'
    ```

3. Add the `std` features to these packages

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/Cargo.toml:20:27'
    ```

4. Check that your `Cargo.toml` file looks like this:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/Cargo.toml'
    ```

## Build the Pallet

### Add Scaffold Pallet Structure

You now have the bare minimum of package dependencies that your pallet requires specified in the `Cargo.toml` file. The next step is to prepare the scaffolding for your new pallet.

1. Open `src/lib.rs` in a text editor and delete all the content
   
2. Prepare the scaffolding for the pallet by adding the following:

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/build-pallet/scaffold.rs'
    ```

3. Verify that it compiles by running the following command:

    ```bash
    cargo build --package custom-pallet
    ```

## 
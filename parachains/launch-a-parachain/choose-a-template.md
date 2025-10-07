---
title: Choose a Parachain Template
description: Learn about available parachain templates and set up the Polkadot SDK Parachain Template to start building your custom blockchain.
tutorial_badge: Beginner
categories: Basics, Parachains
---

# Choose a Parachain Template

## Introduction

[Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank} provides multiple parachain templates to jumpstart your blockchain development journey. Each template offers a different starting point, from minimal setups to feature-rich configurations, allowing you to choose the foundation that best matches your project requirements.

This tutorial introduces you to the available parachain templates and guides you through setting up the [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank}. This template provides a pre-configured runtime with commonly needed pallets, making it an ideal starting point for most parachain development projects.

In this tutorial, you will:

- Learn about the available parachain templates and their use cases.
- Set up the Polkadot SDK Parachain Template.
- Understand the project structure and key components.
- Verify your template is ready for development.
- Run the parachain template locally in development mode

By the end of this tutorial, you'll have a working template ready to customize and deploy as a parachain.

## Available Templates

Before diving into the setup, let's explore the main parachain templates available to help you make an informed decision for your project.

### Polkadot SDK Parachain Template

The [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank} is the recommended starting point for most developers. It provides:

- Pre-configured pallets for common blockchain functionality
- A complete runtime setup ready for customization
- Example implementations demonstrating best practices
- Built-in support for parachain consensus mechanisms

This template is ideal for building general-purpose parachains and provides the best balance of features and learning opportunities. **This is the template we'll use for this tutorial series.**

### Polkadot SDK Minimal Template

The [Polkadot SDK Minimal Template](https://github.com/paritytech/polkadot-sdk-minimal-template){target=\_blank} offers:

- A bare-bones runtime with only essential components
- Maximum flexibility for custom implementations
- A smaller codebase to understand and modify
- Perfect foundation for highly specialized chains

Choose this template if you want to build everything from the ground up or need a clean slate for a unique parachain design.

### OpenZeppelin Runtime Templates

[OpenZeppelin's runtime templates](https://github.com/OpenZeppelin/polkadot-runtime-templates){target=\_blank} provide specialized starting points with security-focused configurations.

#### Generic Template

The [generic-template](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main/generic-template){target=\_blank} includes:

- Security-focused configuration following OpenZeppelin's best practices
- Curated pallet selection for common use cases
- Production-ready defaults

#### EVM Template

The [evm-template](https://github.com/OpenZeppelin/polkadot-runtime-templates/tree/main/evm-template){target=\_blank} provides:

- Ethereum Virtual Machine (EVM) compatibility
- Support for Solidity smart contracts
- Ethereum-style accounts and transactions
- Seamless bridge between Substrate and Ethereum ecosystems

This template is perfect for projects requiring compatibility with existing Ethereum tooling and smart contracts.

## Prerequisites

Before getting started, ensure you have done the following:

- Completed the [Install Polkadot SDK Dependencies](/reference/tools/polkadot-sdk/install/){target=\_blank} guide and successfully installed [Rust](https://www.rust-lang.org/){target=\_blank} and the required packages to set up your development environment

For this tutorial series, you need to use Rust `1.86`. Newer versions of the compiler may not work with this parachain template version.

Run the following commands to set up the correct Rust version:

    === "macOS"

        ```bash
        rustup install 1.86
        rustup default 1.86
        rustup target add wasm32-unknown-unknown --toolchain 1.86-aarch64-apple-darwin
        rustup component add rust-src --toolchain 1.86-aarch64-apple-darwin
        ```

    === "Ubuntu"

        ```bash
        rustup toolchain install 1.86.0
        rustup default 1.86.0
        rustup target add wasm32-unknown-unknown --toolchain 1.86.0
        rustup component add rust-src --toolchain 1.86.0
        ```

## Polkadot SDK Utility Tools

This tutorial requires two essential tools:

- [**Chain spec builder**](https://crates.io/crates/staging-chain-spec-builder/{{dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.chain_spec_builder_version}}){target=\_blank}: A Polkadot SDK utility for generating chain specifications. Refer to the [Generate Chain Specs](/develop/parachains/deployment/generate-chain-specs/){target=\_blank} documentation for detailed usage.
    
    Install it by executing the following command:
    
    ```bash
    cargo install --locked staging-chain-spec-builder@{{dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.chain_spec_builder_version}}
    ```

    This installs the `chain-spec-builder` binary.

- [**Polkadot Omni Node**](https://crates.io/crates/polkadot-omni-node/{{dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_omni_node_version}}){target=\_blank}: A white-labeled binary, released as a part of Polkadot SDK that can act as the collator of a parachain in production, with all the related auxiliary functionalities that a normal collator node has: RPC server, archiving state, etc. Moreover, it can also run the wasm blob of the parachain locally for testing and development.

    To install it, run the following command:

    ```bash
    cargo install --locked polkadot-omni-node@{{dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_omni_node_version}}
    ```

    This installs the `polkadot-omni-node` binary.

## Clone the Template

The [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank} provides a ready-to-use development environment for building with the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank}. Follow these steps to set up the template:

1. Clone the template repository:

    ```bash
    git clone https://github.com/paritytech/polkadot-sdk-parachain-template.git parachain-template
    ```

2. Navigate into the project directory:

    ```bash
    cd parachain-template
    ```

## Explore the Project Structure

Before building the template, take a moment to familiarize yourself with its structure. Understanding this organization will help you navigate the codebase as you develop your parachain.

The template follows a standard Polkadot SDK project layout:

```
parachain-template/
├── node/              # Node implementation and client
├── pallets/           # Custom pallets for your parachain
├── runtime/           # Runtime configuration and logic
├── Cargo.toml         # Workspace configuration
└── README.md          # Documentation
```

Key directories explained:

- **runtime/**: Contains your parachain's state transition function and pallet configuration. This is where you'll define what your blockchain can do.
- **node/**: Houses the client implementation that runs your blockchain, handles networking, and manages the database.
- **pallets/**: Where you'll create custom business logic modules (pallets) for your specific use case.
- **Cargo.toml**: The workspace configuration that ties all components together.

!!!note
    The runtime is compiled to WebAssembly (Wasm), enabling forkless upgrades. The node binary remains constant while the runtime can be updated on-chain.

## Compile the Runtime

Now that you understand the template structure, let's compile the runtime to ensure everything is working correctly.

1. Compile the runtime:

    ```bash
    cargo build --release --locked
    ```

    !!!tip
        Initial compilation may take several minutes, depending on your machine specifications. Use the `--release` flag for improved runtime performance compared to the default `--debug` build. If you need to troubleshoot issues, the `--debug` build provides better diagnostics.
        
        For production deployments, consider using a dedicated `--profile production` flag - this can provide an additional 15-30% performance improvement over the standard `--release` profile.

2. Upon successful compilation, you should see output indicating the build was successful. The compiled runtime will be located at `./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm`

## Verify the Build

After compilation completes, verify that the runtime was created successfully by checking for the WebAssembly blob:

```bash
ls -la ./target/release/wbuild/parachain-template-runtime/
```

You should see the `parachain_template_runtime.compact.compressed.wasm` file in the output, confirming the build was successful.

## Understanding the Template Components

The Polkadot SDK Parachain Template comes pre-configured with several essential pallets in the runtime:

- **System**: Provides core blockchain functionality and account management.
- **Timestamp**: Tracks block timestamps for time-dependent logic.
- **Balances**: Manages token balances and transfers.
- **Transaction payment**: Handles fee calculation and payment processing.
- **Sudo**: Provides superuser access for development and testing.
- **ParachainSystem**: Contains core parachain-specific functionality.
- **Aura**: Implements the authority-based consensus mechanism for block production.
- **Cumulus pallet parachain system**: Enables communication with the relay chain.

These pallets work together to provide a functional parachain runtime out of the box. As you progress through the tutorial series, you'll learn how to customize these pallets and add new ones to extend your parachain's capabilities.

## Run the Node Locally

After successfully compiling your runtime, you can spin up a local chain and produce blocks. This process will start your local parachain using the Polkadot Omni Node and allow you to interact with it. You'll first need to generate a chain specification that defines your network's identity, initial connections, and genesis state, providing the foundational configuration for how your nodes connect and what initial state they agree upon.

Follow these steps to launch your node in development mode:

1. Generate the chain specification file of your parachain:

    ```bash
    chain-spec-builder create -t development \
    --relay-chain paseo \
    --para-id 1000 \
    --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    named-preset development
    ```

2. Start the omni node with the generated chain spec. You'll start it in development mode (without a relay chain config), producing and finalizing blocks:

    ```bash
    polkadot-omni-node --chain ./chain_spec.json --dev
    ```

    The `--dev` option does the following:

    - Deletes all active data (keys, blockchain database, networking information) when stopped
    - Ensures a clean working state each time you restart the node

3. Verify that your node is running by reviewing the terminal output. You should see log messages indicating block production and finalization

4. Confirm that your blockchain is producing new blocks by checking if the number after `finalized` is increasing in the output

The details of the log output will be explored in a later tutorial. For now, knowing that your node is running and producing blocks is sufficient.

## Interact with the Node

When running the template node, it's accessible by default at `ws://localhost:9944`. To interact with your node using the [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} interface, follow these steps:

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} in your web browser and click the network icon (which should be the Polkadot logo) in the top left corner as shown in the image below:
    
    ![](/images/parachains/launch-a-parachain/choose-a-template/choose-a-template-1.webp)

2. Connect to your local node:

    1. Scroll to the bottom and select **Development**.
    2. Choose **Custom**.
    3. **Enter `ws**: //localhost:9944` in the input field.
    4. Click the **Switch** button.
    
    ![](/images/parachains/launch-a-parachain/choose-a-template/choose-a-template-2.webp)

3. Verify connection:

    - Once connected, you should see **parachain-template-runtime** in the top left corner.
    - The interface will display information about your local blockchain.
    
    ![](/images/parachains/launch-a-parachain/choose-a-template/choose-a-template-3.webp)

You are now connected to your local node and can now interact with it through the Polkadot.js Apps interface. This tool enables you to explore blocks, execute transactions, and interact with your blockchain's features. For in-depth guidance on using the interface effectively, refer to the [Polkadot.js Guides](https://wiki.polkadot.com/general/polkadotjs/){target=\_blank} available on the Polkadot Wiki.

## Stop the Node

When you're done exploring your local node, you can stop it to remove any state changes you've made. Since you started the node with the `--dev` option, stopping the node will purge all persistent block data, allowing you to start fresh the next time.

To stop the local node:

1. Return to the terminal window where the node output is displayed
2. Press `Control-C` to stop the running process
3. Verify that your terminal returns to the prompt in the `parachain-template` directory

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy to Polkadot__

    ---

    Learn how to deploy your parachain template to a relay chain testnet. Configure your chain specification, register as a parachain, and start producing blocks.

    [:octicons-arrow-right-24: Get Started](/parachains/launch-a-parachain/deploy-to-polkadot.md)

</div>
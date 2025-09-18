---
title: Set Up a Template
description: Learn to compile and run a local parachain node using Polkadot SDK. Launch, run, and interact with a pre-configured runtime template.
categories: Basics, Parachains
url: https://docs.polkadot.com/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/
---

# Set Up a Template

## Introduction

[Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank} offers a versatile and extensible blockchain development framework, enabling you to create custom blockchains tailored to your specific application or business requirements. 

This tutorial guides you through compiling and running a parachain node using the [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk/tree/master/templates/parachain){target=\_blank}.

The parachain template provides a pre-configured, functional runtime you can use in your local development environment. It includes several key components, such as user accounts and account balances.

These predefined elements allow you to experiment with common blockchain operations without requiring initial template modifications.
In this tutorial, you will:

- Build and start a local parachain node using the node template.
- Explore how to use a front-end interface to:
    - View information about blockchain activity.
    - Submit a transaction.

By the end of this tutorial, you'll have a working local parachain and understand how to interact with it, setting the foundation for further customization and development.

## Prerequisites

Before getting started, ensure you have done the following:

- Completed the [Install Polkadot SDK Dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} guide and successfully installed [Rust](https://www.rust-lang.org/){target=\_blank} and the required packages to set up your development environment.

For this tutorial series, you need to use Rust `1.86`. Newer versions of the compiler may not work with this parachain template version.

=== "macOS"

    ```bash
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

## Utility Tools

This tutorial requires two essential tools:

- [**Chain spec builder**](https://crates.io/crates/staging-chain-spec-builder/10.0.0){target=\_blank}: A Polkadot SDK utility for generating chain specifications. Refer to the [Generate Chain Specs](/develop/parachains/deployment/generate-chain-specs/){target=\_blank} documentation for detailed usage.
    
    Install it by executing the following command:
    
    ```bash
    cargo install --locked staging-chain-spec-builder@10.0.0
    ```

    This installs the `chain-spec-builder` binary.

- [**Polkadot Omni Node**](https://crates.io/crates/polkadot-omni-node/0.5.0){target=\_blank}: A white-labeled binary, released as a part of Polkadot SDK that can act as the collator of a parachain in production, with all the related auxiliary functionalities that a normal collator node has: RPC server, archiving state, etc. Moreover, it can also run the wasm blob of the parachain locally for testing and development.

    To install it, run the following command:

    ```bash
    cargo install --locked polkadot-omni-node@0.5.0
    ```

    This installs the `polkadot-omni-node` binary.

## Compile the Runtime

The [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk/tree/master/templates/parachain){target=\_blank} provides a ready-to-use development environment for building using the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank}. Follow these steps to compile the runtime:

1. Clone the template repository:

    ```bash
    git clone -b v0.0.4 https://github.com/paritytech/polkadot-sdk-parachain-template.git parachain-template
    ```

2. Navigate into the project directory:

    ```bash
    cd parachain-template
    ```

3. Compile the runtime:

    ```bash
    cargo build --release --locked
    ```

    !!!tip
        Initial compilation may take several minutes, depending on your machine specifications. Use the `--release` flag for improved runtime performance compared to the default `--debug` build. If you need to troubleshoot issues, the `--debug` build provides better diagnostics.
        
        For production deployments, consider using a dedicated [`--profile production`](https://github.com/paritytech/polkadot-sdk-parachain-template/blob/v0.0.4/Cargo.toml#L42-L45){target=\_blank} flag - this can provide an additional 15-30% performance improvement over the standard `--release` profile.

4. Upon successful compilation, you should see output similar to:

    <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>cargo build --release --locked</span>
  <span data-ty>...</span>
  <span data-ty>Finished `release` profile [optimized] target(s) in 1.79s</span>
  <span data-ty="input"><span class="file-path"></span></span>
</div>


## Start the Local Chain

After successfully compiling your runtime, you can spin up a local chain and produce blocks. This process will start your local parachain and allow you to interact with it. You'll first need to generate a chain specification that defines your network's identity, initial connections, and genesis state, providing the foundational configuration for how your nodes connect and what initial state they agree upon, and then run the chain. 

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

    - Deletes all active data (keys, blockchain database, networking information) when stopped.
    - Ensures a clean working state each time you restart the node.

3. Verify that your node is running by reviewing the terminal output. You should see something similar to:

    <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>polkadot-omni-node --chain ./chain_spec.json --dev</span>
  <br />
  <span data-ty>2024-12-12 12:44:02 polkadot-omni-node</span>
  <span data-ty>2024-12-12 12:44:02 ✌️ version 0.1.0-da2dd9b7737</span>
  <span data-ty>2024-12-12 12:44:02 ❤️ by Parity Technologies admin@parity.io, 2017-2024</span>
  <span data-ty>2024-12-12 12:44:02 📋 Chain specification: Custom</span>
  <span data-ty>2024-12-12 12:44:02 🏷 Node name: grieving-drum-1926</span>
  <span data-ty>2024-12-12 12:44:02 👤 Role: AUTHORITY</span>
  <span data-ty>2024-12-12 12:44:02 💾 Database: RocksDb at /var/folders/x0/xl_kjddj3ql3bx7752yr09hc0000gn/T/substrateoUrZMQ/chains/custom/db/full</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] assembling new collators for new session 0 at #0</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] assembling new collators for new session 1 at #0</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] 🔨 Initializing Genesis block/state (state: 0xa6f8…5b46, header-hash: 0x0579…2153)</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] creating SingleState txpool Limit { count: 8192, total_bytes: 20971520 }/Limit { count: 819, total_bytes: 2097152 }.</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] Using default protocol ID "sup" because none is configured in the chain specs</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] 🏷 Local node identity is: 12D3KooWCSXy6rBuJVsn5mx8uyNqkdfNfFzEbToi4hR31v3PwdgX</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] Running libp2p network backend</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] 💻 Operating system: macos</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] 💻 CPU architecture: aarch64</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] 📦 Highest known block at #0</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] 〽️ Prometheus exporter started at 127.0.0.1:9615</span>
  <span data-ty>2024-12-12 12:44:03 [Parachain] Running JSON-RPC server: addr=127.0.0.1:9944,[::1]:9944</span>
  <span data-ty>2024-12-12 12:44:06 [Parachain] 🙌 Starting consensus session on top of parent 0x05794f9adcdaa23a5edd335e8310637d3a7e6e9393f2b0794af7d3e219f62153 (#0)</span>
  <span data-ty>2024-12-12 12:44:06 [Parachain] 🎁 Prepared block for proposing at 1 (2 ms) hash: 0x6fbea46711e9b38bab8e7877071423cd03feab03d3f4a0d578a03ab42dcee34b; parent_hash: 0x0579…2153; end: NoMoreTransactions; extrinsics_count: 2</span>
  <span data-ty>2024-12-12 12:44:06 [Parachain] 🏆 Imported #1 (0x0579…2153 → 0x6fbe…e34b)</span>
  <span data-ty>...</span>
</div>


4. Confirm that your blockchain is producing new blocks by checking if the number after `finalized` is increasing.

    <div id="termynal" data-termynal>
  <span data-ty>...</span>
  <span data-ty>2024-12-12 12:49:20 [Parachain] 💤 Idle (0 peers), best: #1 (0x6fbe…e34b), finalized #1 (0x6fbe…e34b), ⬇ 0 ⬆ 0</span>
  <span data-ty>...</span>
  <span data-ty>2024-12-12 12:49:25 [Parachain] 💤 Idle (0 peers), best: #3 (0x7543…bcfc), finalized #3 (0x7543…bcfc), ⬇ 0 ⬆ 0</span>
  <span data-ty>...</span>
  <span data-ty>2024-12-12 12:49:30 [Parachain] 💤 Idle (0 peers), best: #4 (0x0478…8d63), finalized #4 (0x0478…8d63), ⬇ 0 ⬆ 0</span>
  <span data-ty>...</span>
</div>


The details of the log output will be explored in a later tutorial. For now, knowing that your node is running and producing blocks is sufficient.

## Interact with the Node

When running the template node, it's accessible by default at `ws://localhost:9944`. To interact with your node using the [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} interface, follow these steps:

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} in your web browser and click the network icon (which should be the Polkadot logo) in the top left corner as shown in the image below:
    
    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/set-up-a-template-1.webp)

2. Connect to your local node:

    1. Scroll to the bottom and select **Development**.
    2. Choose **Custom**.
    3. **Enter `ws**: //localhost:9944` in the input field.
    4. Click the **Switch** button.
    
    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/set-up-a-template-2.webp)

3. Verify connection:

    - Once connected, you should see **parachain-template-runtime** in the top left corner.
    - The interface will display information about your local blockchain.
    
    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/set-up-a-template-3.webp)

You are now connected to your local node and can now interact with it through the Polkadot.js Apps interface. This tool enables you to explore blocks, execute transactions, and interact with your blockchain's features. For in-depth guidance on using the interface effectively, refer to the [Polkadot.js Guides](https://wiki.polkadot.com/general/polkadotjs/){target=\_blank} available on the Polkadot Wiki.

## Stop the Node

When you're done exploring your local node, you can stop it to remove any state changes you've made. Since you started the node with the `--dev` option, stopping the node will purge all persistent block data, allowing you to start fresh the next time.

To stop the local node:

1. Return to the terminal window where the node output is displayed.
2. Press `Control-C` to stop the running process.
3. Verify that your terminal returns to the prompt in the `parachain-template` directory.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Build a Custom Pallet__

    ---

    Build your own custom pallet for Polkadot SDK-based blockchains! Follow this step-by-step guide to create and configure a simple counter pallet from scratch.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/)

</div>

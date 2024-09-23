---
title: Build a Local Solochain
description: Learn to compile and launch a local blockchain node using Polkadot-SDK. Build, run, and interact with a pre-configured node template.
---

# Build a Local Solochain

## Introduction

[Polkadot-SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank} offers a versatile and extensible blockchain development framework, enabling you to create custom blockchains tailored to your specific application or business requirements. This tutorial guides you through compiling and launching a single local blockchain node using the [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank}.

The node template provides a pre-configured, functional single-node blockchain you can run in your local development environment. It includes several key components, such as user accounts and account balances.

These predefined elements allow you to experiment with common blockchain operations without requiring initial template modifications.
In this tutorial, you will:

- Build and start a local blockchain node using the node template
- Explore how to use a front-end interface to:
    - View information about blockchain activity
    - Submit a transaction

By the end of this tutorial, you'll have a working local solochain and understand how to interact with it, setting the foundation for further customization and development.

## Prerequisites

To get started with the node template, you'll need to have the following set up on your development machine first:

- Rust Installation - the node template is written in [Rust](https://www.rust-lang.org/){target=\_blank}, so you'll need to have it installed and configured on your system. Refer to the [Installation]() section for step-by-step instructions on setting up your development environment

## Compile a Node 

The [Polkadot-SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} provides a ready-to-use development environment for building using the [Polkadot-SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank}. Follow these steps to compile the node:

1. Clone the node template repository:
    ```bash
    git clone -b {{dependencies.polkadot_sdk_solochain_template.version}} {{dependencies.polkadot_sdk_solochain_template.repository_url}}
    ```

    !!!note
        This tutorial uses version `{{dependencies.polkadot_sdk_solochain_template.version}}` of the Polkadot SDK Solochain Template. Make sure you're using the correct version to match these instructions.

2. Navigate to the root of the node template directory:
    ```bash
    cd polkadot-sdk-solochain-template
    ```

3. Compile the node template:
    ```bash
    cargo build --release
    ```

    !!!note
        Initial compilation may take several minutes, depending on your machine specifications. Always use the `--release` flag to build optimized, production-ready artifacts.

4. Upon successful compilation, you should see output similar to:
    <div id="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>cargo build --release</span>
	<span data-ty>Compiling solochain-template-node</span>
	<span data-ty>Finished `release` profile [optimized] target(s) in 27.12s</span>
    </div>

## Start the Local Node

After successfully compiling your node, you can run it and produce blocks. This process will start your local blockchain and allow you to interact. Follow these steps to launch your node in development mode:

1. In the terminal where you compiled your node, start it in development mode:
    ```bash
    ./target/release/solochain-template-node --dev
    ```
    The `--dev` option does the following:
    - Specifies that the node runs using the predefined development chain specification
    - Deletes all active data (keys, blockchain database, networking information) when stopped
    - Ensures a clean working state each time you restart the node

2. Verify that your node is running by reviewing the terminal output. You should see something similar to:
    --8<-- 'code/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/node-output.html'

3. Confirm that your blockchain is producing new blocks by checking if the number after `finalized` is increasing
    <div id='termynal' data-termynal>
        <span data-ty>...</span>
        <span data-ty>2024-09-09 08:32:47 💤 Idle (0 peers), best: #0 (0x0eef…935d), finalized #0 (0x0eef…935d), ⬇ 0 ⬆ 0</span>
        <span data-ty>...</span>
        <span data-ty>2024-09-09 08:32:52 💤 Idle (0 peers), best: #1 (0xcb3d…265b), finalized #0 (0x0eef…935d), ⬇ 0 ⬆ 0</span>
        <span data-ty>...</span>
        <span data-ty>2024-09-09 08:32:57 💤 Idle (0 peers), best: #2 (0x16d7…083f), finalized #0 (0x0eef…935d), ⬇ 0 ⬆ 0</span>
        <span data-ty>...</span>
        <span data-ty>2024-09-09 08:33:02 💤 Idle (0 peers), best: #3 (0xe6a4…2cc4), finalized #1 (0xcb3d…265b), ⬇ 0 ⬆ 0</span>
        <span data-ty>...</span>
    </div>

    !!!note
        The details of the log output will be explored in a later tutorial. For now, knowing that your node is running and producing blocks is sufficient.

## Interact with the Node

When running the template node, it's accessible by default at:

```bash
ws://localhost:9944
```
To interact with your node using the [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} interface, follow these steps:

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} in your web browser and click the network icon in the top left corner
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-1.webp)

2. Connect to your local node:
    1. Scroll to the bottom and select **Development**
    2. Choose **Custom**
    3. Enter `ws://localhost:9944` in the input field
    4. Click the **Switch** button
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-2.webp)

3. Verify connection:
    - Once connected, you should see **solochain-template-runtime** in the top left corner
    - The interface will display information about your local blockchain
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-3.webp)

You are now connected to your local node and can interact with it through the Polkadot.js Apps interface. This interface allows you to explore blocks, make transactions, and interact with your blockchain's features.

## Transfer Funds

Now that you have a local node running and the Polkadot.js Apps user interface available, you're ready to start interacting with the blockchain. In this tutorial, you'll perform a simple transfer operation to move funds from one account to another.

To transfer funds from Alice's account to Charlie's account:

1. In Polkadot.js Apps, navigate to the **Accounts** dropdown and select **Accounts**
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-4.webp)

2. You'll see a list of pre-funded development accounts. Click the **send** button next to Alice's account
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-5.webp)

3. Fill in the transfer parameters:
    1. Select the recipient account (Charlie's account)
    2. Enter the amount you want to transfer (20 UNIT)
    3. Click the **Make Transfer** button
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-6.webp)

4. Review the transaction details and click **Sign and Submit** to confirm the transfer
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-7.webp)

5. After the transaction is processed, you can verify that Charlie's account now has the transferred funds (20 UNIT tokens)
    ![](/images/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/build-a-local-blockchain-8.webp)

## Stop the Node

When you're done exploring your local node, you can stop it to remove any state changes you've made. Since you started the node with the `--dev` option, stopping the node will purge all persistent block data, allowing you to start fresh the next time.

To stop the local node:

1. Return to the terminal window where the node output is displayed
2. Press `Control-C` to stop the running process
3. Verify that your terminal returns to the prompt in the `polkadot-sdk-solochain-template` directory
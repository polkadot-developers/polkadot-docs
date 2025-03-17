---
title: Use Hardhat with Asset Hub
description: Learn how to create, compile, test, and deploy smart contracts on Asset Hub using Hardhat, a powerful development environment for blockchain developers.
---

# Hardhat

## Overview

Hardhat is a robust development environment for EVM-compatible chains that makes smart contract development more efficient. This guide will walk you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some WND test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank})
- MetaMask wallet configured for Asset Hub (for more information, check the [How to Connect to Asset Hub](/develop/smart-contracts/connect-to-asset-hub){target=\_blank} guide)

## Setting Up Hardhat

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir hardhat-example
    cd hardhat-example
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. Install Hardhat and the required plugins:

    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```

    To interact with Asset Hub, Hardhat requires the [`hardhat-resolc`](https://www.npmjs.com/package/hardhat-resolc){target=\_blank} plugin to compile contracts to PolkaVM bytecode and the [`hardhat-revive-node`](https://www.npmjs.com/package/hardhat-revive-node){target=\_blank} plugin to spawn a local node compatible

    ```bash
    npm install --save-dev hardhat-resolc hardhat-revive-node
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select "Create a JavaScript project" when prompted and follow the instructions. After that, your project will be created with 3 mains folders:

    - **`contracts`** - where your Solidity smart contracts live
    - **`test`** - contains your test files that validate contract functionality
    - **`ignition`** - deployment modules for safely deploying your contracts to various networks

5. Update your Hardhat configuration file (`hardhat.config.js`) to include the plugins:

    ```javascript title="hardhat.config.js" hl_lines="3-4"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:8'
        ...
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:62:62'
    ```

## Compiling Your Contract

The `hardhat-resolc` plugin will compile your Solidity contracts to be PolkaVM compatible. This works for Solidity versions `0.8.0` and higher. When compiling your contract using the `hardhat-resolc` plugin, there are two ways to configure your compilation process:

- **Remix compiler** - uses the Remix online compiler backend for simplicity and ease of use
- **Binary compiler** - uses the resolc binary directly for more control and configuration options

To compile your project, you need to follow the instructions below:

1. Modify your hardhat configuration file to specify which compilation process you will be using:

    === "Remix Configuration"

        ```javascript title="hardhat.config.js"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:9'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:11:21'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:62:62'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:9'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:23:34'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:62:62'
        ```

    For the binary configuration, ensure to replace the `INSERT_PATH_TO_RESOLC_COMPILER` with the proper path to the binary. For more information about its installation, check the [installation](https://github.com/paritytech/revive?tab=readme-ov-file#installation){target=\_blank} section of the `pallet-revive`.

2. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

3. After successful compilation, you'll see the artifacts generated in the `artifacts-pvm` directory:

    ```bash
    ls artifacts-pvm/contracts/*.sol/
    ```

    This should show JSON files containing the contract ABI and bytecode of the contracts you compiled.

## Testing Your Contract

TODO: waiting for https://github.com/paritytech/contract-issues/issues/41

## Deploying with a Local Node

Before deploying to a live network, you can deploy your contract to a local node using the [`hardhat-revive-node`](https://www.npmjs.com/package/hardhat-revive-node){target=\_blank} plugin and Ignition modules:

1. First, ensure that you have compiled a substrate node and the eth rpc adapter from the polkadot sdk. Checkout the [compatible commit](https://github.com/paritytech/polkadot-sdk/commit/c29e72a8628835e34deb6aa7db9a78a2e4eabcee){target=\_blank} from the sdk and build the node and the eth-rpc from source:

    ```bash
    git clone https://github.com/paritytech/polkadot-sdk.git
    cd polkadot-sdk
    git checkout {{ dependencies.repositories.polkadot_sdk_compatible_hardhat_node }}
    ```

    Now, build the node and the eth rpc adapter. Consider that this process might take a long time to complete:

    ```bash
    # Build the substrate node
    cargo build --release
    # Build the eth-rpc adapter
    cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release
    ```

2. Update the hardhat configuration file to add the local node as a target for local deployment:

    === "Remix Configuration"

        ```javascript title="hardhat.config.js"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:9'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:11:21'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:44:62'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:9'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:23:34'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:44:62'
        ```


    Ensure to replace to replace the `INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` with the proper paths.

3. Modify the ignition modules as needed, considering that the pallet revive `block.timestamp` value is returned in seconds according to this [PR](https://github.com/paritytech/polkadot-sdk/pull/7792/files){target=\_blank}. For example, for the default `ignition/modules/Lock.js` file, the needed mofication will be:

    ```diff
    - const JAN_1ST_2030 = 1893456000;
    + const JAN_1ST_2030 = 18934560000000;
    ```

4. Start a local node:

    ```bash
    npx hardhat node-polkavm
    ```

    This will start a local PolkaVM node powered by the `hardhat-revive-node` plugin.

4. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/INSERT_IGNITION_MODULE_NAME.js --network polkavm
    ```

    Ensure to replace the `INSERT_IGNITION_MODULE_NAME` with the proper name for your contract. You'll see deployment information including the contract address.

## Deploying to a Live Network

TODO: this sections depends on the plugin release of this feature - https://github.com/paritytech/contract-issues/issues/25#issuecomment-2725019136

## Interacting with Your Contract

TODO: this sections depends on the plugin release of this feature - https://github.com/paritytech/contract-issues/issues/25#issuecomment-2725019136

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Asset Hub. Its plugin architecture allows for seamless integration with PolkaVM through the `hardhat-resolc` and `hardhat-revive-node` plugins.

Explore more about smart contracts through these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Smart Contracts on Polkadot__

    ---

    Dive into advanced smart contract concepts.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/)

-   <span class="badge external">External</span> __Hardhat Documentation__

    ---

    Learn more about Hardhat's advanced features and best practices.

    [:octicons-arrow-right-24: Get Started](https://hardhat.org/docs){target=\_blank}

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Test your skills by deploying contracts with prebuilt templates.

    [:octicons-arrow-right-24: Get Started](https://www.openzeppelin.com/solidity-contracts){target=\_blank}

</div>

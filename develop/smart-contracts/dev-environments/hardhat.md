---
title: Use Hardhat with Polkadot
description: Learn how to create, compile, test, and deploy smart contracts on Polkadot using Hardhat, a powerful development environment for blockchain developers.
---

# Hardhat

<div class="grid cards" markdown>
-   :octicons-code-16:{ .lg .middle } __Test and Deploy with Hardhat__

    ---

    Master Solidity smart contract development with Hardhat. Learn testing, deployment, and network interaction in one comprehensive tutorial.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat){target=\_blank}

</div>

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Polkadot.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some WND test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-asset-hub/#test-tokens){target=\_blank} section

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
    npm install --save-dev hardhat@"<2.23.0" @nomicfoundation/hardhat-toolbox
    ```

    To interact with Polkadot, Hardhat requires the following plugins to compile contracts to PolkaVM bytecode and to spawn a local node compatible with PolkaVM.

    ```bash
    npm install --save-dev @parity/hardhat-polkadot @parity/resolc
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select "Create a JavaScript project" when prompted and follow the instructions. After that, your project will be created with three main folders:

    - **`contracts`** - where your Solidity smart contracts live
    - **`test`** - contains your test files that validate contract functionality
    - **`ignition`** - deployment modules for safely deploying your contracts to various networks

5. Update your Hardhat configuration file (`hardhat.config.js`) to include the `hardhat-polkadot` plugin:

    ```javascript title="hardhat.config.js" hl_lines="4-4"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:7'
      // Additional configuration will be added later
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:60:60'
    ```

## Compiling Your Contract

The plugin will compile your Solidity contracts for Solidity versions `0.8.0` and higher to be PolkaVM compatible. When compiling your contract, there are two ways to configure your compilation process:

- **Npm compiler** - uses library [@parity/resolc](https://www.npmjs.com/package/@parity/resolc){target=\_blank} for simplicity and ease of use
- **Binary compiler** - uses your local `resolc` binary directly for more control and configuration options

To compile your project, follow these instructions:

1. Modify your Hardhat configuration file to specify which compilation process you will be using and activate the `polkavm` flag in the hardhat network:

    === "Npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="10-21"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:21'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:60:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="10-23"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:8'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:36'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:60:60'
        ```

    For the binary configuration, replace `INSERT_PATH_TO_RESOLC_COMPILER` with the proper path to the binary. To obtain the binary, check the [releases](https://github.com/paritytech/revive/releases){target=\_blank} section of the `resolc` compiler, and download the latest version.

    Consider that the optimizer settings are using the default values in the examples above. You can change them according to your project needs.

2. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

3. After successful compilation, you'll see the artifacts generated in the `artifacts-pvm` directory:

    ```bash
    ls artifacts-pvm/contracts/*.sol/
    ```

    You should see JSON files containing the contract ABI and bytecode of the contracts you compiled.

## Testing Your Contract

When testing your contract, be aware that [`@nomicfoundation/hardhat-toolbox/network-helpers`](https://hardhat.org/hardhat-network-helpers/docs/overview){target=\_blank} is not fully compatible with Asset Hub's available RPCs. Specifically, Hardhat-only helpers like `time` and `loadFixture` may not work due to missing RPC calls in the node. For more details, refer to the [Compatibility](https://github.com/paritytech/hardhat-revive/tree/main/packages/hardhat-revive-node#compatibility){target=\_blank} section in the `hardhat-revive` docs.

You should avoid using helpers like `time` and `loadFixture` when writing tests. For example, for the `Lock.sol` contract, you can replace the default test file under `tests/Lock.js` with the following logic:

```javascript title="Lock.js"
--8<-- "code/develop/smart-contracts/dev-environments/hardhat/lock-test.js"
```

To run your test, execute the following command:

```bash
npx hardhat test
```

## Deploying with a Local Node

Before deploying to a live network, you can deploy your contract to a local node using Ignition modules:

!!! warning "Contract Size Limitation in Testing Environment"

    When testing or deploying large contracts in Hardhat's local environment, you may encounter this error:

    `Error: the initcode size of this transaction is too large`
    
    This limitation is established by Hardhat based on Ethereum's default contract size limits. While Hardhat can disable this limitation, technical constraints currently prevent it from being applied to the PolkaVM test environment.

1. Update the Hardhat configuration file to add the local node as a target for local deployment:

    === "Npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="22-39"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:21'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:53'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="24-41"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:8'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:53'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

2. Start a local node:

    ```bash
    npx hardhat node
    ```

    This command will spawn a local substrate node along with the ETH-RPC adapter.

3. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/Lock.js --network localNode
    ```

## Deploying to a Live Network

After testing your contract locally, you can deploy it to a live network. This guide will use Westend Asset Hub as the target network. Here's how to configure and deploy:

1. Fund your deployment account with enough tokens to cover gas fees. In this case, the needed tokens are WND (on Westend). You can use the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank} to obtain testing tokens.

2. Export your private key and save it in a `.env` file:

    ```text
    PRIVATE_KEY="INSERT_PRIVATE_KEY"
    ```
    
    Replace `INSERT_PRIVATE_KEY` with your actual private key. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Never reveal your private key. Be sure you add the `.env` file to your .gitignore file. 

3. Install the [`dotenv`](https://www.npmjs.com/package/dotenv){target=\_blank} package to load the private key into your Hardhat configuration:

    ```bash
    npm install --save-dev dotenv
    ```

4. Update your config to load it:

    ```javascript title="hardhat.config.js" hl_lines="6"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

    require('dotenv').config();

    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
      // The rest remains the same...
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:50:50'
    ```

5. Update your Hardhat configuration file with network settings for the Polkadot network you want to target:

    === "Npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="39-43"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:21'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:58'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="41-45"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:8'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:58'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

5. Deploy your contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/Lock.js --network westendHub
    ```

## Interacting with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract. 

For example, for the default `Lock.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/interact.js'
```

Run your interaction script:

```bash
npx hardhat run scripts/interact.js --network westendHub
```

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Asset Hub. Its plugin architecture allows seamless integration with PolkaVM through the `hardhat-resolc` and `hardhat-revive-node` plugins.

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

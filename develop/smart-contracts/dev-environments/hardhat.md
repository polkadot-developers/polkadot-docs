---
title: Use Hardhat with Polkadot Hub
description: Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat, a powerful development environment for blockchain developers.
---

# Hardhat

--8<-- 'text/smart-contracts/polkaVM-warning.md'

<div class="grid cards" markdown>
-   :octicons-code-16:{ .lg .middle } __Test and Deploy with Hardhat__

    ---

    Master Solidity smart contract development with Hardhat. Learn testing, deployment, and network interaction in one comprehensive tutorial.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat){target=\_blank}

</div>

--8<-- 'text/smart-contracts/code-size.md'

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Polkadot Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some PAS test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot#test-tokens){target=\_blank} section

## Set Up Hardhat

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir hardhat-example
    cd hardhat-example
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. To interact with Polkadot, Hardhat requires the following plugin to compile contracts to PolkaVM bytecode and to spawn a local node compatible with PolkaVM:

    ```bash
    npm install --save-dev @parity/hardhat-polkadot@0.1.8
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat-polkadot init
    ```

    Select **Create a JavaScript project** when prompted and follow the instructions. After that, your project will be created with three main folders:

    - **`contracts`** - where your Solidity smart contracts live
    - **`test`** - contains your test files that validate contract functionality
    - **`ignition`** - deployment modules for safely deploying your contracts to various networks

5. Add the following folders to the `.gitignore` file if they are not already there:

    ```bash
    echo '/artifacts-pvm' >> .gitignore
    echo '/cache-pvm' >> .gitignore
    echo '/ignition/deployments/' >> .gitignore
    ```

6. Finish the setup by installing all the dependencies:

    ```bash
    npm install
    ```

    !!! note
        This last step is needed to set up the `hardhat-polkadot` plugin. It will install the `@parity/hardhat-polkadot` package and all its dependencies. In the future, the plugin will handle this automatically.

## Compile Your Contract

The plugin will compile your Solidity contracts for Solidity versions `0.8.0` and higher to be PolkaVM compatible. When compiling your contract, there are two ways to configure your compilation process:

- **npm compiler** - uses library [@parity/resolc](https://www.npmjs.com/package/@parity/resolc){target=\_blank} for simplicity and ease of use
- **Binary compiler** - uses your local `resolc` binary directly for more control and configuration options

To compile your project, follow these instructions:

1. Modify your Hardhat configuration file to specify which compilation process you will be using and activate the `polkavm` flag in the Hardhat network:

    === "npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="8-10 13"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:14'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:33:35'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="8-13 16"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/binary-hardhat.config.js:1:17'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/binary-hardhat.config.js:36:38'
        ```

    For the binary configuration, replace `INSERT_PATH_TO_RESOLC_COMPILER` with the proper path to the binary. To obtain the binary, check the [releases](https://github.com/paritytech/revive/releases){target=\_blank} section of the `resolc` compiler, and download the latest version.

    The default settings used can be found in the [`constants.ts`](https://github.com/paritytech/hardhat-polkadot/blob/v0.1.5/packages/hardhat-polkadot-resolc/src/constants.ts#L8-L23){target=\_blank} file of the `hardhat-polkadot` source code. You can change them according to your project needs. Generally, the recommended settings for optimized outputs are the following:

    ```javascript title="hardhat.config.js" hl_lines="4-10"
    resolc: {
      ...
      settings: {
        optimizer: {
          enabled: true,
          parameters: 'z',
          fallbackOz: true,
          runs: 200,
        },
        standardJson: true,
      },
      ...
    }
    ```

    You can check the [`ResolcConfig`](https://github.com/paritytech/hardhat-polkadot/blob/v0.1.5/packages/hardhat-polkadot-resolc/src/types.ts#L26){target=\_blank} for more information about compilation settings.

2. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

3. After successful compilation, you'll see the artifacts generated in the `artifacts-pvm` directory:

    ```bash
    ls artifacts-pvm/contracts/*.sol/
    ```

    You should see JSON files containing the contract ABI and bytecode of the contracts you compiled.

## Set Up a Testing Environment

Hardhat allows you to spin up a local testing environment to test and validate your smart contract functionalities before deploying to live networks. The `hardhat-polkadot` plugin provides the possibility to spin up a local node with an ETH-RPC adapter for running local tests.

For complete isolation and control over the testing environment, you can configure Hardhat to work with a fresh local Substrate node. This approach is ideal when you want to test in a clean environment without any existing state or when you need specific node configurations.

Configure a local node setup by adding the node binary path along with the ETH-RPC adapter path:

```javascript title="hardhat.config.js" hl_lines="11-19"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
    ...
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:12:24'
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:34:35'
```

Replace `INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` with the actual paths to your compiled binaries. The `dev: true` flag configures both the node and adapter for development mode. To obtain these binaries, check the [Installation](/develop/smart-contracts/local-development-node#install-the-substrate-node-and-eth-rpc-adapter){target=\_blank} section on the Local Development Node page.

Once configured, start your chosen testing environment with:

```bash
npx hardhat node
```

This command will launch either the forked network or local node (depending on your configuration) along with the ETH-RPC adapter, providing you with a complete testing environment ready for contract deployment and interaction. By default, the Substrate node will be running on `localhost:8000` and the ETH-RPC adapter on `localhost:8545`.

The output will be something like this:

--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat-node-output.html'

## Test Your Contract

When testing your contract, be aware that [`@nomicfoundation/hardhat-toolbox/network-helpers`](https://hardhat.org/hardhat-network-helpers/docs/overview){target=\_blank} is not fully compatible with Polkadot Hub's available RPCs. Specifically, Hardhat-only helpers like `time` and `loadFixture` may not work due to missing RPC calls in the node. For more details, refer to the [Compatibility](https://github.com/paritytech/hardhat-polkadot/tree/main/packages/hardhat-polkadot-node#compatibility){target=\_blank} section in the `hardhat-revive` docs. You should avoid using helpers like `time` and `loadFixture` when writing tests.

To run your test:

1. Update the `hardhat.config.js` file accordingly to the [Set Up a Testing Environment](#set-up-a-testing-environment) section

2. Execute the following command to run your tests:

    ```bash
    npx hardhat test
    ```

## Deploy to a Local Node

Before deploying to a live network, you can deploy your contract to a local node using [Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} modules:

1. Update the Hardhat configuration file to add the local network as a target for local deployment:

    ```javascript title="hardhat.config.js" hl_lines="12-15"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
        ...
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:12:13'
            ...
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:24:28'
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:33:35'
    ```

2. Start a local node:

    ```bash
    npx hardhat node
    ```

    This command will spawn a local Substrate node along with the ETH-RPC adapter.

3. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network localNode
    ```

## Deploying to a Live Network

After testing your contract locally, you can deploy it to a live network. This guide will use the Polkadot Hub TestNet as the target network. Here's how to configure and deploy:

1. Fund your deployment account with enough tokens to cover gas fees. In this case, the needed tokens are PAS (on Polkadot Hub TestNet). You can use the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank} to obtain testing tokens.

2. Export your private key and save it in your Hardhat environment:

    ```bash
    npx hardhat vars set PRIVATE_KEY "INSERT_PRIVATE_KEY"
    ```

    Replace `INSERT_PRIVATE_KEY` with your actual private key. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Never reveal your private key, otherwise anyone with access to it can control your wallet and steal your funds. Store it securely and never share it publicly or commit it to version control systems.

3. Check that your private key has been set up successfully by running:

    ```bash
    npx hardhat vars get PRIVATE_KEY
    ```

4. Update your Hardhat configuration file with network settings for the Polkadot network you want to target:

    ```javascript title="hardhat.config.js" hl_lines="17-21"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

    const { vars } = require('hardhat/config');

    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
        ...
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:12:13'
            ...
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:24:24'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:25:25'
            ...
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:28:33'
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:33:35'
    ```

6. Deploy your contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network polkadotHubTestnet
    ```

## Interacting with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract.

For example, for the default `MyToken.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/interact.js'
```

Run your interaction script:

```bash
npx hardhat run scripts/interact.js --network polkadotHubTestnet
```

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Polkadot Hub. Its plugin architecture allows seamless integration with PolkaVM through the `hardhat-resolc` and `hardhat-revive-node` plugins.

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

---
# Install and Configure Hardhat for Polkadot Hub
description: Learn how to install and configure Hardhat development environment for building smart contracts on Polkadot Hub with PolkaVM support.
categories: Smart Contracts, Tooling
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

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed.
    - Note: Use Node.js 22.5+ and npm version 10.9.0+ to avoid issues with the Polkadot plugin.
- Basic understanding of Solidity programming.
- Some PAS test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot#test-tokens){target=\_blank} section.

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
    npm install --save-dev @parity/hardhat-polkadot@0.1.9
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat-polkadot init
    ```

    Select **Create a JavaScript project** when prompted and follow the instructions. After that, your project will be created with three main folders:

    - **`contracts`**: Where your Solidity smart contracts live.
    - **`test`**: Contains your test files that validate contract functionality.
    - **`ignition`**: Deployment modules for safely deploying your contracts to various networks.

5. Add the following folder to the `.gitignore` file if it is not already there:

    ```bash
    echo '/ignition/deployments/' >> .gitignore
    ```

6. Finish the setup by installing all the dependencies:

    ```bash
    npm install
    ```

    !!! note
        This last step is needed to set up the `hardhat-polkadot` plugin. It will install the `@parity/hardhat-polkadot` package and all its dependencies. In the future, the plugin will handle this automatically.

--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat-node-output.html'

## Upgrading the Plugin

If you already have a Hardhat Polkadot project and want to upgrade to a newer version of the plugin, to avoid errors (for example, `Cannot find module 'run-container'`), you can clean your dependencies by running the following commands:

```bash
rm -rf node_modules package-lock.json
```

After that, you can upgrade the plugin to the latest version by running the following commands:

```bash
npm install --save-dev @parity/hardhat-polkadot@latest
npm install
```

Consider using [Node.js](https://nodejs.org/){target=\_blank} 22.18+ and [npm](https://www.npmjs.com/){target=\_blank} version 10.9.0+ to avoid issues with the plugin.

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
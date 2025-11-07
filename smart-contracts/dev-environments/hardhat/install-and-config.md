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
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat)

</div>

--8<-- 'text/smart-contracts/code-size.md'

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Polkadot Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v18.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some PAS test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot#test-tokens) section

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

3. Install Hardhat and the Hardhat Toolbox:

    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select **Create a JavaScript project** when prompted and follow the instructions. After that, your project will be created with three main folders:

    - **`contracts`**: Where your Solidity smart contracts live
    - **`test`**: Contains your test files that validate contract functionality
    - **`ignition`**: Deployment modules for safely deploying your contracts to various networks

5. Add the following folder to the `.gitignore` file if it is not already there:

    ```bash
    echo '/ignition/deployments/' >> .gitignore
    ```

--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat-node-output.html'

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Polkadot Hub. Its flexible configuration and extensive plugin ecosystem make it an excellent choice for EVM-compatible smart contract development.

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
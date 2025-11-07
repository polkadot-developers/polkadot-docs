---
# Install and Configure Hardhat for Polkadot Hub
description: Learn how to install and configure Hardhat development environment for building smart contracts on Polkadot Hub with PolkaVM support.
categories: Smart Contracts, Tooling
---

# Hardhat

<div class="grid cards" markdown>
-   :octicons-code-16:{ .lg .middle } __Test and Deploy with Hardhat__

    ---

    Master Solidity smart contract development with Hardhat. Learn testing, deployment, and network interaction in one comprehensive tutorial.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat)

</div>

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Polkadot Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (Hardhat requires an LTS version, even major numbers like 18.x, 20.x, or 22.x) and npm installed
- Basic understanding of Solidity programming
- Make sure that your Hardhat version is set to 2.x

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
    npm install --save-dev hardhat@^2.26.0
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat init
    ```

    After that you will be asked to **Create a JavaScript project**.
    
    After that, your project will be created with three main folders:

    - **`contracts`**: Where your Solidity smart contracts live
    - **`test`**: Contains your test files that validate contract functionality
    - **`ignition`**: Deployment modules for safely deploying your contracts to various networks

5. Add the following folder to the `.gitignore` file if it is not already there:

    ```bash
    echo '/ignition/deployments/' >> .gitignore
    ```

--8<-- 'code/smart-contracts/dev-environments/hardhat/get-started/hardhat-node-output.html'

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Polkadot Hub. Its flexible configuration and extensive plugin ecosystem make it an excellent choice for EVM-compatible smart contract development.

Explore more about smart contracts through these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Compile and Test__

    ---

    Dive into advanced smart contract concepts.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/compile-and-test)

-   <span class="badge external">External</span> __Hardhat Documentation__

    ---

    Learn more about Hardhat's advanced features and best practices.

    [:octicons-arrow-right-24: Get Started](https://hardhat.org/docs){target=\_blank}

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Test your skills by deploying contracts with prebuilt templates.

    [:octicons-arrow-right-24: Get Started](https://www.openzeppelin.com/solidity-contracts){target=\_blank}

</div>
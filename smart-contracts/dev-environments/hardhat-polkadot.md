---
title: Use Hardhat with Polkadot Hub
description: Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat with PVM support.
categories: Smart Contracts, Tooling
---

# Hardhat Polkadot

## Introduction

[Hardhat](https://hardhat.org/){target=\_blank} is a flexible development environment for building, testing, and deploying smart contracts. With the [`@parity/hardhat-polkadot`](https://github.com/paritytech/hardhat-polkadot){target=\_blank} plugin, you can compile Solidity contracts to PVM bytecode and deploy them to Polkadot Hub. This page demonstrates how to set up a Hardhat project for PVM development.

## Prerequisites

Before setting up Hardhat, make sure the following are installed:

- [Node.js](https://nodejs.org/){target=\_blank} version 22.5+ and [npm](https://www.npmjs.com/){target=\_blank} version 10.9.0+ to avoid issues with the Polkadot plugin
- A package manager like npm, [pnpm](https://pnpm.io/){target=\_blank}, or [yarn](https://yarnpkg.com/){target=\_blank}

## Initialize a Hardhat Project

1. Create a directory to hold your project files:

    ```bash
    mkdir hardhat-pvm-example
    cd hardhat-pvm-example
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. Install the Polkadot plugin for Hardhat:

    ```bash
    npm install --save-dev @parity/hardhat-polkadot@0.2.7
    ```

4. Install the resolc compiler (required for compiling Solidity to PVM):

    ```bash
    npm install --save-dev @parity/resolc@0.2.0
    ```

5. Initialize a Hardhat project:

    ```bash
    npx hardhat-polkadot init
    ```

    Follow the project creation wizard. Your project will be created with three main folders:

    - **`contracts`**: Stores your Solidity smart contracts
    - **`ignition`**: Contains deployment modules for safely deploying your contracts to various networks
    - **`test`**: Contains test files that validate contract functionality

6. Add the following folder to the `.gitignore` file if it is not already there:

    ```bash
    echo '/ignition/deployments/' >> .gitignore
    ```

7. Complete the setup by installing all dependencies:

    ```bash
    npm install
    ```

## Compile Your Contract

The plugin will compile your Solidity contracts (version `0.8.0` and higher) to PVM bytecode using the resolc compiler:

```bash
npx hardhat compile
```

After successful compilation, you'll see the artifacts generated in the `artifacts` directory:

```bash
ls artifacts/contracts/*.sol/
```

You should see JSON files containing the contract ABIs and bytecodes for the contracts you compiled.

## Test Your Contract Locally

Hardhat provides a local testing environment through the `hardhat-polkadot` plugin, which spins up a local Substrate node with an ETH-RPC adapter.

### Start a Local Node

To obtain the `dev-node` and `eth-rpc` binaries, check this [release](https://github.com/paritytech/hardhat-polkadot/releases/tag/nodes-19071579107){target=\_blank} and download the binaries for your platform, then update the paths in your config.

!!! note
    You might need to give executable permissions to the binaries:
    
    ```bash
    chmod +x /path/to/your/binary
    ```
    
    In macOS environments, binaries are sometimes quarantined. To remove this, run:
    
    ```bash
    xattr -d com.apple.quarantine /path/to/your/binary
    ```

Once you have set up the binaries, start your local testing node:

```bash
npx hardhat node
```

This command launches a local node with the ETH-RPC adapter. By default, the Substrate node runs on `localhost:8000`, and the ETH-RPC adapter on `localhost:8545`.

The output will be something like this:

--8<-- 'code/smart-contracts/dev-environments/hardhat-polkadot/hardhat-node-output.html'

### Run Tests

To run your contract tests:

```bash
npx hardhat test
```

!!! warning "Compatibility Note"
    Be aware that [`@nomicfoundation/hardhat-toolbox/network-helpers`](https://hardhat.org/hardhat-network-helpers/docs/overview){target=\_blank} is not fully compatible with Polkadot Hub's available RPCs. Specifically, helpers like `time` and `loadFixture` may not work due to missing RPC calls in the node. For more details, refer to the [Compatibility](https://github.com/paritytech/hardhat-polkadot/tree/main/packages/hardhat-polkadot-node#compatibility){target=\_blank} section in the hardhat-polkadot documentation.

### Deploy to Local Node

Before deploying to a live network, you can deploy your contract to a local node using [Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} modules:

1. Ensure your local node is running:

    ```bash
    npx hardhat node
    ```

2. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network localNode
    ```

!!! tip
    The `ignition.requiredConfirmations: 1` setting in your config ensures that deployment doesn't hang on local nodes that only produce blocks when transactions are submitted.

## Deploy to Polkadot Hub TestNet

After testing locally, you can deploy to the Polkadot Hub TestNet:

1. Fund your deployment account with PAS test tokens from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}

2. Set your private key as a configuration variable:

    ```bash
    npx hardhat vars set PRIVATE_KEY
    ```

    !!! warning
        Never reveal your private key. Anyone with access to it can control your wallet and steal your funds. Store it securely and never share it publicly or commit it to version control systems.

3. Verify your private key is set:

    ```bash
    npx hardhat vars get PRIVATE_KEY
    ```

4. Deploy your contract:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network polkadotTestnet
    ```

### Common Issues

- **Compilation fails with resolc errors**: Ensure you have `@parity/resolc@0.2.0` installed and the version is specified in your `hardhat.config.js`
- **Deployment hangs on local node**: You might need to set `ignition.requiredConfirmations: 1` in your config file
- **Binary permission issues**: Run `chmod +x /path/to/your/binary` and on macOS, use `xattr -d com.apple.quarantine /path/to/your/binary`

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy a Basic Contract__

    ---

    Ready to start using Hardhat with PVM? Learn how to compile, test, and deploy a basic contract.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-hardhat/)

-   <span class="badge external">External</span> __Hardhat Documentation__

    ---

    Learn more about Hardhat's advanced features and best practices.

    [:octicons-arrow-right-24: Get Started](https://hardhat.org/docs){target=\_blank}

-   <span class="badge external">External</span> __Hardhat Polkadot Plugin__

    ---

    Explore the full capabilities of the Hardhat Polkadot plugin.

    [:octicons-arrow-right-24: Get Started](https://github.com/paritytech/hardhat-polkadot){target=\_blank}

</div>
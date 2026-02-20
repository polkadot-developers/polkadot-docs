---
title: Use Hardhat with Polkadot Hub
description: Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat, a powerful development environment for blockchain developers.
categories: Smart Contracts, Tooling
toggle:
  group: hardhat
  canonical: true
  variant: evm
  label: EVM
---

# Hardhat

## Introduction

[Hardhat](https://hardhat.org/){target=\_blank} is a flexible development environment for building, testing, and deploying smart contracts on Polkadot. Its task runner and plugin system support organizing contract code, running tests, managing deployments, and adding custom tooling. This page demonstrates how to set up a Hardhat project for Polkadot Hub.

!!! info "Testing and debugging against Polkadot"
    When using standard Hardhat against Polkadot nodes, some behaviors differ (e.g., network helpers like `time.increase()` or `loadFixture` may not work). See [Differences between Ethereum-native tools and Polkadot EVM networks](/smart-contracts/get-started/#differences-between-ethereum-native-tools-and-polkadot-evm-networks){target=\_blank} for details.

## Prerequisites

Before setting up Hardhat, make sure the following are installed:

- [Node.js](https://nodejs.org/){target=\_blank} (Hardhat requires an LTS Node version, even major numbers like 18.x, 20.x, or 22.x)
- A package manager like [npm](https://www.npmjs.com/){target=\_blank}, [pnpm](https://pnpm.io/){target=\_blank}, or [yarn](https://yarnpkg.com/){target=\_blank}

## Initialize a Hardhat Project

1. Create a directory to hold your project files:

    ```bash
    mkdir hardhat-example
    cd hardhat-example
    ```

2. Initialize a Hardhat project:

    === "npm"

        This single command sets up your project, installs Hardhat (and optionally the Toolbox), and intializes the project:

        ```bash
        npx hardhat@^2.27.0 init
        ```

    === "pnpm"

        This single command sets up your project, installs Hardhat (and optionally the Toolbox), and intializes the project:

        ```bash
        pnpm dlx hardhat@^2.27.0 init
        ```

    === "yarn"

        These commands manually set up your project, install Hardhat (and optionally the Toolbox), and initializes the project:

        ```bash
        # Initialize a new Node.js project
        yarn init -y

        # Install Hardhat and the Hardhat Toolbox locally
        yarn add --dev hardhat@^2.27.0 @nomicfoundation/hardhat-toolbox

        # Initialize a Hardhat project
        npx hardhat init
        ```

3. You will be prompted to select certain configurations for your project. To quickly create a working setup, you can accept the default answers, which will create a JavaScript project, initialize it in the current directory, add a `.gitignore`, and install all dependencies.

After completing the setup, your Hardhat project will be fully initialized with all necessary files and dependencies. You'll see the following core components in your project:

- **`contracts`**: Stores your Solidity smart contracts.
- **`ignition`**: Contains deployment modules for safely deploying your contracts to various networks.
- **`test`**: Contains test files that validate contract functionality.
- **`hardhat.config.js | .ts`**: Defines your project's settings, including networks, compiler options, and plugins.

## Configure Hardhat for Polkadot Hub

To use Hardhat with Polkadot Hub, define the network configuration in your `hardhat.config.ts` file:

=== "Polkadot TestNet"

    ```ts title='hardhat.config.ts'
    import type { HardhatUserConfig } from 'hardhat/config';
    import '@nomicfoundation/hardhat-toolbox';

    // If you want to use a variable for your private key
    import { vars } from 'hardhat/config';

    const config: HardhatUserConfig = {
      solidity: '0.8.28',
      networks: {
        polkadotTestnet: {
          url: 'https://services.polkadothub-rpc.com/testnet',
          chainId: 420420417,
          accounts: [vars.get('PRIVATE_KEY')],
        },
      },
    };

    export default config;
    ```

!!! tip

    To define a [configuration variable](https://v2.hardhat.org/hardhat-runner/docs/guides/configuration-variables){target=\_blank} for your private key, run:

    ```bash
    npx hardhat vars set PRIVATE_KEY
    ```

    Hardhat will prompt you to enter your private key and store it so it can be referenced in your configuration file.

## Verify a Contract

To verify your deployed contract on Polkadot Hub, install the Hardhat verification plugin and add the explorer configuration to your config.

### Install the Verification Plugin

```bash
npm install --save-dev @nomicfoundation/hardhat-verify@^2.0.0
```

!!! note "Hardhat 2 Compatibility"
    Use `@nomicfoundation/hardhat-verify@^2.0.0` for Hardhat 2.x. The 3.x release requires Hardhat 3.

Add the plugin to your config file:

```ts
import "@nomicfoundation/hardhat-verify";
```

### Add Verification Config

Add the `etherscan` configuration to your `hardhat.config.ts`. Choose Blockscout or Routescan:

=== "Blockscout"

    Blockscout does not require an API key. Add the following to your config:

    ```ts title='hardhat.config.ts'
    import type { HardhatUserConfig } from 'hardhat/config';
    import '@nomicfoundation/hardhat-toolbox';
    import '@nomicfoundation/hardhat-verify';
    import { vars } from 'hardhat/config';

    const config: HardhatUserConfig = {
      solidity: '0.8.28',
      networks: {
        polkadotTestnet: {
          url: 'https://services.polkadothub-rpc.com/testnet',
          chainId: 420420417,
          accounts: [vars.get('PRIVATE_KEY')],
        },
      },
      etherscan: {
        apiKey: {
          polkadotTestnet: 'no-api-key-needed',
        },
        customChains: [
          {
            network: 'polkadotTestnet',
            chainId: 420420417,
            urls: {
              apiURL: 'https://blockscout-testnet.polkadot.io/api',
              browserURL: 'https://blockscout-testnet.polkadot.io/',
            },
          },
        ],
      },
    };

    export default config;
    ```

=== "Routescan"

    Routescan uses an Etherscan-compatible API. Get an API key from [Routescan](https://routescan.io/){target=\_blank} or use `verifyContract` for testnets:

    ```ts title='hardhat.config.ts'
    import type { HardhatUserConfig } from 'hardhat/config';
    import '@nomicfoundation/hardhat-toolbox';
    import '@nomicfoundation/hardhat-verify';
    import { vars } from 'hardhat/config';

    const config: HardhatUserConfig = {
      solidity: '0.8.28',
      networks: {
        polkadotTestnet: {
          url: 'https://services.polkadothub-rpc.com/testnet',
          chainId: 420420417,
          accounts: [vars.get('PRIVATE_KEY')],
        },
      },
      etherscan: {
        apiKey: {
          polkadotTestnet: 'verifyContract',
        },
        customChains: [
          {
            network: 'polkadotTestnet',
            chainId: 420420417,
            urls: {
              apiURL: 'https://api.routescan.io/v2/network/testnet/evm/420420417/etherscan',
              browserURL: 'https://polkadot.testnet.routescan.io/',
            },
          },
        ],
      },
    };

    export default config;
    ```

### Basic Verification

Replace `INSERT_CONTRACT_ADDRESS` with your deployed contract's address. For contracts without constructor arguments:

```bash
npx hardhat verify --network polkadotTestnet INSERT_CONTRACT_ADDRESS
```

### Verification with Constructor Arguments

For contracts with constructor arguments, pass them as additional arguments:

```bash
npx hardhat verify --network polkadotTestnet INSERT_CONTRACT_ADDRESS "arg1" "arg2"
```

Example for a contract with constructor `(uint256 initialValue, address owner)`:

```bash
npx hardhat verify --network polkadotTestnet INSERT_CONTRACT_ADDRESS "42" "0x1234567890123456789012345678901234567890"
```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy a Basic Contract__

    ---

    Ready to start using Hardhat? Learn how to compile, test, and deploy a basic contract.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying an NFT to Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-hardhat/)

-   <span class="badge guide">Guide</span> __Create a DApp__

    ---

    Learn step-by-step how to build a fully functional dApp that interacts with a smart contract deployed via Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/dapps/zero-to-hero/)

</div>
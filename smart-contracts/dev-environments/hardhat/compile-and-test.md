---
title: Compile and Test Smart Contracts with Hardhat
description: Learn how to compile Solidity contracts for PolkaVM compatibility and test them using Hardhat's testing framework on the Polkadot Hub.
categories: Smart Contracts, Tooling
---

# Compile and Test Smart Contracts

## Compile Your Contract

The plugin will compile your Solidity contracts for Solidity versions `0.8.0` and higher to be PolkaVM compatible. When compiling your contract, there are two ways to configure your compilation process:

- **npm compiler**: Uses library [@parity/resolc](https://www.npmjs.com/package/@parity/resolc){target=_blank} for simplicity and ease of use
- **Binary compiler**: Uses your local `resolc` binary directly for more control and configuration options

To compile your project, follow these instructions:

1. Modify your Hardhat configuration file to specify which compilation process you will be using and activate the `polkavm` flag in the Hardhat network:

    === "npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="9-11 14"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:14'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:33:35'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="9-14 17"
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

After successful compilation, you will see the artifacts generated in the `artifacts-pvm` directory:

    ```bash
    ls artifacts-pvm/contracts/*.sol/
    ```

    You should see JSON files containing the contract ABI and bytecode of the contracts you compiled.

## Set Up a Testing Environment

Hardhat allows you to spin up a local testing environment to test and validate your smart contract functionalities before deploying to live networks. The `hardhat-polkadot` plugin provides the possibility to spin up a local node with an ETH-RPC adapter for running local tests.

For complete isolation and control over the testing environment, you can configure Hardhat to work with a fresh local Substrate node. This approach is ideal when you want to test in a clean environment without any existing state or when you need specific node configurations.

Configure a local node setup by adding the node binary path along with the ETH-RPC adapter path:

```javascript title="hardhat.config.js" hl_lines="12-20"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
    ...
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:12:24'
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:34:35'
```

`INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` with the actual paths to your compiled binaries. The `dev: true` flag configures both the node and adapter for development mode. To obtain these binaries, check the [Installation](/develop/smart-contracts/local-development-node#install-the-substrate-node-and-eth-rpc-adapter) section on the Local Development Node page.

!!! warning
    If you're using the default `hardhat.config.js` created by the `hardhat-polkadot` plugin, it includes a `forking` section pointing to the Polkadot Hub TestNet. When you run `npx hardhat node`, Hardhat will start a fork of that network. To use your local node instead, comment out the `forking` section; otherwise, `npx hardhat node` will continue to use the forked network even if a local node is defined in the configuration.

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

1. Update the `hardhat.config.js` file accordingly to the [Set Up a Testing Environment](#set-up-a-testing-environment) section.

2. Execute the following command to run your tests:

    ```bash
    npx hardhat test
    ```
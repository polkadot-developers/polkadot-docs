---
title: Compile and Test Smart Contracts with Hardhat
description: Learn how to compile Solidity contracts for PolkaVM compatibility and test them using Hardhat's testing framework on the Polkadot Hub.
categories: Smart Contracts, Tooling
---

# Compile and Test Smart Contracts

## Compile Your Contract

Hardhat compiles your Solidity contracts using the Solidity compiler (solc). The compilation process generates the ABI and bytecode needed for deployment and interaction.

To compile your project, follow these instructions:

1. Modify your Hardhat configuration file to specify the Solidity compiler version and optimization settings:

    ```javascript title="hardhat.config.js"
    require("@nomicfoundation/hardhat-toolbox");

    /** @type import('hardhat/config').HardhatUserConfig */
    module.exports = {
      solidity: {
        version: "0.8.27",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    };
    ```

    The optimizer settings help reduce contract size and gas costs. You can adjust the `runs` parameter based on how frequently you expect your contract functions to be called.

2. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

After successful compilation, you will see the artifacts generated in the `artifacts` directory:

```bash
ls artifacts/contracts/*.sol/
```

You should see JSON files containing the contract ABI and bytecode of the contracts you compiled.

## Set Up a Testing Environment

Hardhat provides a built-in local Ethereum network for testing. You can use this network to run your tests without deploying to a live network.

Start the local Hardhat network with:

```bash
npx hardhat node
```

This command will launch a local Ethereum network on `http://127.0.0.1:8545` with 20 test accounts, each pre-funded with 10,000 ETH. The network will display all RPC calls and contract deployments in real-time.

The output will be something like this:

--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat-node-output.html'

## Test Your Contract

Hardhat uses Mocha as its testing framework and Chai for assertions, both included in the Hardhat Toolbox.

To run your tests:

1. Ensure your `hardhat.config.js` file is properly configured with the Solidity compiler settings as shown in the [Compile Your Contract](#compile-your-contract) section

2. Execute the following command to run your tests:

    ```bash
    npx hardhat test
    ```

    This will run all test files in the `test` directory. Hardhat automatically manages the test network lifecycle, so you don't need to run `npx hardhat node` separately for testing
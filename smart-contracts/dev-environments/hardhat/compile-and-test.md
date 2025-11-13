---
title: Compile and Test Smart Contracts with Hardhat
description: Learn how to compile Solidity contracts for PolkaVM compatibility and test them using Hardhat's testing framework on the Polkadot Hub.
categories: Smart Contracts, Tooling
---

# Compile and Test Smart Contracts

## Compile Your Contract

Hardhat compiles your Solidity contracts using the Solidity compiler (solc). The compilation process generates the ABI and bytecode needed for deployment and interaction.

To compile your project, follow these instructions:

1. Make sure that your Hardhat configuration file matches the Solidity compiler version shown in the code snippet below:

    ```javascript title="hardhat.config.js"
    require("@nomicfoundation/hardhat-toolbox");

    /** @type import('hardhat/config').HardhatUserConfig */
    module.exports = {
        solidity: "0.8.28",
    };
    ```

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

This command will launch a local Ethereum network on `http://127.0.0.1:8545` with 19 test accounts, each pre-funded with 10,000 ETH. The network will display all RPC calls and contract deployments in real-time.

The output will be something like this:

--8<-- 'code/smart-contracts/dev-environments/hardhat/compile-and-test/hardhat-node-output.html'

## Test Your Contract

Hardhat uses [Mocha](https://mochajs.org/){target=\_blank} as its testing framework and [Chai](https://www.chaijs.com/){target=\_blank} for assertions, both included in the [Hardhat Toolbox](https://v2.hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox){target=\_blank}.

To run your tests execute the following command to run your tests:

```bash
npx hardhat test
```

This will run all test files in the `test` directory. Hardhat automatically manages the test network lifecycle, so you don't need to run `npx hardhat node` separately for testing.

If you are testing `Lock.sol` contract, output should look like this:

--8<-- 'code/smart-contracts/dev-environments/hardhat/compile-and-test/test.html'

## Where to Go Next

Now that you've successfully compiled and tested your smart contracts, you're ready to deploy them to a live network. The deployment guide will walk you through deploying your contract to Local Development Network, interacting with it using Hardhat scripts, and verifying your deployment.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy a Contract__

    ---

    Learn how to deploy your compiled smart contract to Polkadot Hub TestNet and interact with it using deployment scripts.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/deploy-a-contract)

</div>
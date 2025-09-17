---
title: Test and Deploy with Hardhat
description: Learn how to set up a Hardhat development environment, write comprehensive
  tests for Solidity smart contracts, and deploy to local and Polkadot Hub networks.
categories: dApp, Tooling
url: https://docs.polkadot.com/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat/
---

# Test and Deploy with Hardhat

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

## Introduction

After creating a smart contract, the next crucial steps are testing and deployment. Proper testing ensures your contract behaves as expected, while deployment makes your contract available on the blockchain. This tutorial will guide you through using Hardhat, a popular development environment, to test and deploy the `Storage.sol` contract you created in the [Create a Smart Contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts/){target=\_blank} tutorial. For more information about Hardhat usage, check the [Hardhat guide](/develop/smart-contracts/dev-environments/hardhat/){target=\_blank}.

## Prerequisites

Before starting, make sure you have:

- The [`Storage.sol` contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts/#create-the-smart-contract){target=\_blank} created in the previous tutorial.
- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed.
- Basic understanding of JavaScript for writing tests.
- Some PAS test tokens to cover transaction fees (obtained from the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}).

## Setting Up the Development Environment

Let's start by setting up Hardhat for your Storage contract project:

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir storage-hardhat
    cd storage-hardhat
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. Install `hardhat-polkadot` and all required plugins:

    ```bash
    npm install --save-dev @parity/hardhat-polkadot@0.1.9 solc@0.8.28
    ```

    For dependencies compatibility, ensure to install the `@nomicfoundation/hardhat-toolbox` dependency with the `--force` flag:

    ```bash
    npm install --force @nomicfoundation/hardhat-toolbox 
    ```

5. Initialize a Hardhat project:

    ```bash
    npx hardhat-polkadot init
    ```

    Select **Create an empty hardhat.config.js** when prompted.

6. Configure Hardhat by updating the `hardhat.config.js` file:

    ```javascript title="hardhat.config.js"
    require("@nomicfoundation/hardhat-toolbox");

require("@parity/hardhat-polkadot");

const { vars } = require("hardhat/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  resolc: {
    compilerSource: "npm",
  },
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: 'INSERT_PATH_TO_SUBSTRATE_NODE',
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: 'INSERT_PATH_TO_ETH_RPC_ADAPTER',
        dev: true,
      },
    },
    localNode: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
    passetHub: {
      polkavm: true,
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      accounts: [vars.get("PRIVATE_KEY")],
    },
  },
};
    ```

    Ensure that `INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` are replaced with the proper paths to the compiled binaries. 

    If you need to build these binaries, follow the [Installation](/develop/smart-contracts/local-development-node#install-the-substrate-node-and-eth-rpc-adapter){target=\_blank} section on the Local Development Node page.

    The configuration also defines two network settings: 

    - **`localNode`**: Runs a PolkaVM instance on `http://127.0.0.1:8545` for local development and testing.
    - **`passetHub`**: Connects to the the Polkadot Hub TestNet network using a predefined RPC URL and a private key stored in environment variables.

7. Export your private key and save it in your Hardhat environment:

    ```bash
    npx hardhat vars set PRIVATE_KEY "INSERT_PRIVATE_KEY"
    ```

    Replace `INSERT_PRIVATE_KEY` with your actual private key. 
    
    For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Keep your private key safe, and never share it with anyone. If it is compromised, your funds can be stolen.

## Adding the Smart Contract

1. Create a new folder called `contracts` and create a `Storage.sol` file. Add the contract code from the previous tutorial:

    ```solidity title="Storage.sol"
    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Storage {
    // State variable to store our number
    uint256 private number;

    // Event to notify when the number changes
    event NumberChanged(uint256 newNumber);

    // Function to store a new number
    function store(uint256 newNumber) public {
        number = newNumber;
        emit NumberChanged(newNumber);
    }

    // Function to retrieve the stored number
    function retrieve() public view returns (uint256) {
        return number;
    }
}
    ```

2. Compile the contract:

    ```bash
    npx hardhat compile
    ```

3. If successful, you will see the following output in your terminal:

    <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat compile</span>
  <span data-ty>Compiling 1 Solidity file</span>
  <span data-ty>Successfully compiled 1 Solidity file</span>
</div>


After compilation, the `artifacts-pvm` and `cache-pvm` folders, containing the metadata and binary files of your compiled contract, will be created in the root of your project.

## Writing Tests

Testing is a critical part of smart contract development. Hardhat makes it easy to write tests in JavaScript using frameworks like [Mocha](https://mochajs.org/){target=\_blank} and [Chai](https://www.chaijs.com/){target=\_blank}.

1. Create a folder for testing called `test`. Inside that directory, create a file named `Storage.js` and add the following code:

    ```javascript title="Storage.js" 
    
        // Add your logic here
    });
});
    ```

    The `beforeEach` hook ensures stateless contract execution by redeploying a fresh instance of the Storage contract before each test case. This approach guarantees that each test starts with a clean and independent contract state by using `ethers.getSigners()` to obtain test accounts and `ethers.getContractFactory('Storage').deploy()` to create a new contract instance.

    Now, you can add custom unit tests to check your contract functionality. Some example tests are available below:

    1. **Initial state verification**: Ensures that the contract starts with a default value of zero, which is a fundamental expectation for the `Storage.sol` contract.

        ```javascript title="Storage.js"
        it('Should return 0 initially', async function () {
      expect(await storage.retrieve()).to.equal(0);
    });
        ```

        Explanation:

        - Checks the initial state of the contract.
        - Verifies that a newly deployed contract has a default value of 0.
        - Confirms the `retrieve()` method works correctly for a new contract.

    2. **Value storage test**: Validate the core functionality of storing and retrieving a value in the contract.

        ```javascript title="Storage.js"
        it('Should update when store is called', async function () {
      const testValue = 42;
      // Store a value
      await storage.store(testValue);
      // Check if the value was updated
      expect(await storage.retrieve()).to.equal(testValue);
    });
        ```

        Explanation:

        - Demonstrates the ability to store a specific value.
        - Checks that the stored value can be retrieved correctly.
        - Verifies the basic write and read functionality of the contract.

    3. **Event emission verification**: Confirm that the contract emits the correct event when storing a value, which is crucial for off-chain tracking.

        ```javascript title="Storage.js"
        it('Should emit an event when storing a value', async function () {
      const testValue = 100;
      // Check if the NumberChanged event is emitted with the correct value
      await expect(storage.store(testValue))
        .to.emit(storage, 'NumberChanged')
        .withArgs(testValue);
    });
        ```

        Explanation:

        - Ensures the `NumberChanged` event is emitted during storage.
        - Verifies that the event contains the correct stored value.
        - Validates the contract's event logging mechanism.

    4. **Sequential value storage test**: Check the contract's ability to store multiple values sequentially and maintain the most recent value.

        ```javascript title="Storage.js"
        it('Should allow storing sequentially increasing values', async function () {
      const values = [10, 20, 30, 40];

      for (const value of values) {
        await storage.store(value);
        expect(await storage.retrieve()).to.equal(value);
      }
    });
        ```

        Explanation:

        - Verifies that multiple values can be stored in sequence.
        - Confirms that each new store operation updates the contract's state.
        - Demonstrates the contract's ability always to reflect the most recently stored value.

    The complete `test/Storage.js` should look like this:

    ???--- code "View complete script"
        ```javascript title="Storage.js"
        const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Storage', function () {
  let storage;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get signers
    [owner, addr1] = await ethers.getSigners();

    // Deploy the Storage contract
    const Storage = await ethers.getContractFactory('Storage');
    storage = await Storage.deploy();
    await storage.waitForDeployment();
  });

  describe('Basic functionality', function () {
    it('Should return 0 initially', async function () {
      expect(await storage.retrieve()).to.equal(0);
    });

    it('Should update when store is called', async function () {
      const testValue = 42;
      // Store a value
      await storage.store(testValue);
      // Check if the value was updated
      expect(await storage.retrieve()).to.equal(testValue);
    });

    it('Should emit an event when storing a value', async function () {
      const testValue = 100;
      // Check if the NumberChanged event is emitted with the correct value
      await expect(storage.store(testValue))
        .to.emit(storage, 'NumberChanged')
        .withArgs(testValue);
    });

    it('Should allow storing sequentially increasing values', async function () {
      const values = [10, 20, 30, 40];

      for (const value of values) {
        await storage.store(value);
        expect(await storage.retrieve()).to.equal(value);
      }
    });
  });
});
        ```

2. Run the tests:

    ```bash
    npx hardhat test
    ```

3. After running the above command, you will see the output showing that all tests have passed:

    <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat test</span>
  <span data-ty>Storage</span>
  <span data-ty>Basic functionality</span>
  <span data-ty> ✔ Should return 0 initially</span>
  <span data-ty> ✔ Should update when store is called (1126ms)</span>
  <span data-ty> ✔ Should emit an event when storing a value (1131ms)</span>
  <span data-ty> ✔ Should allow storing sequentially increasing values (12477ms)</span>
  <span data-ty>4 passing (31s) </span>
</div>


## Deploying with Ignition

[Hardhat's Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} is a deployment system designed to make deployments predictable and manageable. Let's create a deployment script:

1. Create a new folder called`ignition/modules`. Add a new file named `StorageModule.js` with the following logic:

    ```javascript title="StorageModule.js"
    const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('StorageModule', (m) => {
  const storage = m.contract('Storage');

  return { storage };
});
    ```

2. Deploy to the local network:

    1. First, start a local node:

        ```bash
        npx hardhat node
        ```

    2. Then, in a new terminal window, deploy the contract:

        ```bash
        npx hardhat ignition deploy ./ignition/modules/StorageModule.js --network localNode
        ```

    3. If successful, output similar to the following will display in your terminal:

        <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat ignition deploy ./ignition/modules/Storage.js --network localNode</span>
  <span data-ty>✔ Confirm deploy to network localNode (420420422)? … yes</span>
  <span data-ty></span>
  <span data-ty>Hardhat Ignition 🚀</span>
  <span data-ty></span>
  <span data-ty>Deploying [ StorageModule ]</span>
  <span data-ty></span>
  <span data-ty>Batch #1</span>
  <span data-ty> Executed StorageModule#Storage</span>
  <span data-ty></span>
  <span data-ty>[ StorageModule ] successfully deployed 🚀</span>
  <span data-ty></span>
  <span data-ty>Deployed Addresses</span>
  <span data-ty></span>
  <span data-ty>StorageModule#Storage - 0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3</span>
</div>


3. Deploy to the Polkadot Hub TestNet:

    1. Make sure your account has enough PAS tokens for gas fees, then run:

        ```bash
        npx hardhat ignition deploy ./ignition/modules/StorageModule.js --network passetHub
        ```

    2. After deployment, you'll see the contract address in the console output. Save this address for future interactions.

        <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat ignition deploy ./ignition/modules/Storage.js --network passetHub</span>
  <span data-ty>✔ Confirm deploy to network localNode (420420422)? … yes</span>
  <span data-ty></span>
  <span data-ty>Hardhat Ignition 🚀</span>
  <span data-ty></span>
  <span data-ty>Deploying [ StorageModule ]</span>
  <span data-ty></span>
  <span data-ty>Batch #1</span>
  <span data-ty> Executed StorageModule#Storage</span>
  <span data-ty></span>
  <span data-ty>[ StorageModule ] successfully deployed 🚀</span>
  <span data-ty></span>
  <span data-ty>Deployed Addresses</span>
  <span data-ty></span>
  <span data-ty>StorageModule#Storage - 0xE8693cE64b294E26765573398C7Ca5C700E9C85c</span>
</div>


## Interacting with Your Deployed Contract

To interact with your deployed contract:

1. Create a new folder named `scripts` and add the `interact.js` with the following content:

    ```javascript title="interact.js"
    const hre = require('hardhat');

async function main() {
  // Replace with your deployed contract address
  const contractAddress = 'INSERT_DEPLOYED_CONTRACT_ADDRESS';

  // Get the contract instance
  const Storage = await hre.ethers.getContractFactory('Storage');
  const storage = await Storage.attach(contractAddress);

  // Get current value
  const currentValue = await storage.retrieve();
  console.log('Current stored value:', currentValue.toString());

  // Store a new value
  const newValue = 42;
  console.log(`Storing new value: ${newValue}...`);
  const tx = await storage.store(newValue);

  // Wait for transaction to be mined
  await tx.wait();
  console.log('Transaction confirmed');

  // Get updated value
  const updatedValue = await storage.retrieve();
  console.log('Updated stored value:', updatedValue.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
    ```

    Ensure that `INSERT_DEPLOYED_CONTRACT_ADDRESS` is replaced with the value obtained in the previous step.

2. Run the interaction script:

    ```bash
    npx hardhat run scripts/interact.js --network passetHub
    ```

3. If successful, the terminal will show the following output:

    <div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat run scripts/interact.js --network passetHub</span>
  <span data-ty>Current stored value: 0</span>
  <span data-ty>Storing new value: 42...</span>
  <span data-ty>Transaction confirmed</span>
  <span data-ty>Updated stored value: 42</span>
</div>


## Conclusion

Congratulations! You've successfully set up a Hardhat development environment, written comprehensive tests for your Storage contract, and deployed it to local and Polkadot Hub TestNet networks. This tutorial covered essential steps in smart contract development, including configuration, testing, deployment, and interaction.

To get started with a working example right away, you can clone the repository and navigate to the project directory:

```bash
git clone https://github.com/polkadot-developers/polkavm-hardhat-examples.git -b v0.0.8
cd polkavm-hardhat-examples/storage-hardhat
```

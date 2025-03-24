---
title: Test and Deploy with Hardhat
description: TODO
---

# Test and Deploy with Hardhat

## Introduction

After creating a smart contract, the next crucial steps are testing and deployment. Proper testing ensures your contract behaves as expected, while deployment makes your contract available on the blockchain. This tutorial will guide you through using Hardhat, a popular development environment, to test and deploy the Storage contract you created in the [previous tutorial](/tutorials/smart-contracts/launch-your-first-project/create-contracts/){target=\_blank}. For more information about Hardhat usage, check the [Hardhat guide](/develop/smart-contracts/dev-environments/hardhat/){target=\_blank}.

## Prerequisites

Before starting, make sure you have:

- The [Storage contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts/#create-the-smart-contract){target=\_blank} created in the previous tutorial
- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of JavaScript for writing tests
- Some WND test tokens to cover transaction fees (obtained from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank})
- [MetaMask](https://metamask.io/){target=\_blank} connected to Westend Asset Hub

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

3. Install Hardhat and the required plugins:

    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```

4. Install the Hardhat revive specific plugins:

    ```bash
    npm install --save-dev hardhat-resolc hardhat-revive-node dot-env
    ```

5. Initialize a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select "Create a JavaScript project" when prompted.

6. Configure Hardhat by updating the `hardhat.config.js` file:

    ```javascript title="hardhat.config.js"
    require('@nomicfoundation/hardhat-toolbox');

    require('hardhat-resolc');
    require('hardhat-revive-node');

    require('dot-env').config();

    /** @type import('hardhat/config').HardhatUserConfig */
    module.exports = {
        solidity: '0.8.19',
        resolc: {
        version: '1.5.2',
        compilerSource: 'remix',
        settings: {
            optimizer: {
            enabled: true,
            runs: 200,
            },
            evmVersion: 'istanbul',
        },
        },
        networks: {
        localNode: {
            polkavm: true,
            url: `http://127.0.0.1:8545`,
        },
        westendAssetHub: {
            polkavm: true,
            url: 'https://westend-asset-hub-eth-rpc.polkadot.io',
            accounts: [process.env.PRIVATE_KEY],
        },
        },
    };
    ```

    This setup loads essential plugins, including `hardhat-toolbox`, `hardhat-resolc`, and `hardhat-revive-node`, while also utilizing environment variables through `dotenv`. The Solidity compiler is set to version 0.8.19 with optimization enabled for improved gas efficiency. Additionally, the resolc plugin is configured to use the Remix compiler with Istanbul compatibility. The configuration also defines two network settings: 

    - `localNode` - will be used for local testing
    - `westendAssetHub` - will be used to connect to the Westend Asset Hub network using a predefined RPC URL and a private key stored in environment variables

7. Create a `.env` file in your project root to store your private key:

    ```text title=".env"
    PRIVATE_KEY="INSERT_PRIVATE_KEY"
    ```

    Replace `INSERT_PRIVATE_KEY` with your actual private key. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

## Adding the Smart Contract

1. Create a new file in the `contracts` directory named `Storage.sol` and add the contract code from the previous tutorial:

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;

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

## Writing Tests

Testing is a critical part of smart contract development. Hardhat makes it easy to write tests in JavaScript using frameworks like Mocha and Chai.

1. Create a test file in the `test` directory named `Storage.js`:

   ```javascript
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

       it('Should allow different accounts to store values', async function () {
         // Store a value from owner account
         await storage.store(123);
         expect(await storage.retrieve()).to.equal(123);
         
         // Store a value from another account
         await storage.connect(addr1).store(456);
         expect(await storage.retrieve()).to.equal(456);
       });
     });
   });
   ```

2. Run the tests:

   ```bash
   npx hardhat test
   ```

   You should see output showing that all tests have passed.

## Compiling Your Contract

Compile the contract to generate the ABI and bytecode:

```bash
npx hardhat compile
```

After compilation, the artifacts will be generated in the `artifacts-pvm` directory.

## Deploying with Ignition

Hardhat's Ignition is a deployment system designed to make deployments predictable and manageable. Let's create a deployment script:

1. Create a new file in the `ignition/modules` directory named `StorageModule.js`:

   ```javascript
   const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

   module.exports = buildModule('StorageModule', (m) => {
     const storage = m.contract('Storage');
     
     return { storage };
   });
   ```

2. Deploy to the local network:

   First, start a local node (if you have the necessary dependencies installed):

   ```bash
   npx hardhat node-polkavm
   ```

   Then in a new terminal window, deploy the contract:

   ```bash
   npx hardhat ignition deploy ./ignition/modules/StorageModule.js --network localNode
   ```

3. Deploy to Westend Asset Hub:

   Make sure your account has enough WND tokens for gas fees, then run:

   ```bash
   npx hardhat ignition deploy ./ignition/modules/StorageModule.js --network westendAssetHub
   ```

   After deployment, you'll see the contract address in the console output. Save this address for future interactions.

## Interacting with Your Deployed Contract

Let's create a script to interact with your deployed contract:

1. Create a new file in the `scripts` directory named `interact.js`:

   ```javascript
   const hre = require('hardhat');

   async function main() {
     // Replace with your deployed contract address
     const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
     
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

2. Run the script to interact with your contract:

   ```bash
   npx hardhat run scripts/interact.js --network westendAssetHub
   ```

## Understanding the Testing Process

Let's review the key components of our testing strategy:

1. **Setup Phase**: In the `beforeEach` function, we deploy a fresh instance of the contract for each test, ensuring test isolation.

2. **Test Cases**:
   - **Initial State Test**: Verifies the contract starts with the expected default value (0).
   - **State Change Test**: Checks if the contract properly updates state when the `store` function is called.
   - **Event Emission Test**: Confirms the contract emits the correct event with the right parameters.
   - **Multiple User Test**: Ensures the contract works correctly when called by different accounts.

3. **Assertions**: Using Chai's `expect` syntax, we make assertions about what should happen, making our test intentions clear.

## Deployment Process Explained

The deployment process involves several steps:

1. **Compilation**: Converts human-readable Solidity code into bytecode that can run on the blockchain.

2. **Ignition Configuration**: Defines how the contract should be deployed, including any constructor arguments or initialization steps.

3. **Network Selection**: Determines which blockchain network your contract will be deployed to.

4. **Transaction Submission**: Sends a transaction containing your contract's bytecode to the blockchain.

5. **Contract Creation**: Once the transaction is mined, your contract is assigned an address on the blockchain.

This process is the same whether you're deploying to a local test network or a live public blockchain.

## Best Practices

- **Test Thoroughly**: Cover all functions and edge cases in your tests.
- **Use Test Networks First**: Deploy to test networks like Westend Asset Hub before going to production.
- **Secure Private Keys**: Never commit private keys to version control.
- **Gas Optimization**: Monitor gas costs during testing to optimize your contract.
- **Event Logging**: Use events for important state changes to make frontend integration easier.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Contract Interaction with Web3.js__

    ---

    Learn how to interact with your deployed contract from a web application.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/interact-with-contracts)

-   <span class="badge guide">Guide</span> __Advanced Testing Techniques__

    ---

    Explore more sophisticated testing strategies for complex contracts.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/testing)

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Build upon secure, community-vetted smart contract components.

    [:octicons-arrow-right-24: Get Started](https://www.openzeppelin.com/contracts)

</div>
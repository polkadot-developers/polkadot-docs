---
title: Test and Deploy with Hardhat
description: Learn how to set up a Hardhat development environment, write comprehensive tests for a Solidity smart contract, and deploy it to local and Asset Hub networks.
---

# Test and Deploy with Hardhat

## Introduction

After creating a smart contract, the next crucial steps are testing and deployment. Proper testing ensures your contract behaves as expected, while deployment makes your contract available on the blockchain. This tutorial will guide you through using Hardhat, a popular development environment, to test and deploy the `Storage.sol` contract you created in the [Create a Smart Contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts/){target=\_blank} tutorial. For more information about Hardhat usage, check the [Hardhat guide](/develop/smart-contracts/dev-environments/hardhat/){target=\_blank}.

## Prerequisites

Before starting, make sure you have:

- The [`Storage.sol` contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts/#create-the-smart-contract){target=\_blank} created in the previous tutorial
- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of JavaScript for writing tests
- Some WND test tokens to cover transaction fees (obtained from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank})

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
    npm install --save-dev hardhat-resolc@{{ dependencies.javascript_packages.hardhat_resolc }} hardhat-revive-node@{{ dependencies.javascript_packages.hardhat_revive_node }} dotenv
    ```

5. Initialize a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select **Create an empty hardhat.config.js** when prompted.

6. Configure Hardhat by updating the `hardhat.config.js` file:

    ```javascript title="hardhat.config.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/hardhat.config.js'
    ```

    To configure the binary, replace `INSERT_PATH_TO_RESOLC_COMPILER` with the correct path to the compiler binary. Detailed installation instructions can be found in the [installation section](https://github.com/paritytech/revive?tab=readme-ov-file#installation){target=\_blank} of the `pallet-revive` repository. Also, ensure that `INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` are replaced with the proper paths to the compiled binaries. 
    
    For more information about these compiled binaries, see the [Deploying with a local node](/develop/smart-contracts/dev-environments/hardhat#deploying-with-a-local-node){target=\_blank} section in the Hardhat documentation.

    This setup loads essential plugins, including [`hardhat-toolbox`](https://www.npmjs.com/package/@nomicfoundation/hardhat-toolbox){target=\_blank}, [`hardhat-resolc`](https://www.npmjs.com/package/hardhat-resolc){target=\_blank}, and [`hardhat-revive-node`](https://www.npmjs.com/package/hardhat-revive-node){target=\_blank}, while utilizing environment variables through `dotenv`. The Solidity compiler is set to version 0.8.19 with optimization enabled for improved gas efficiency. The resolc plugin is configured to use the Remix compiler with Istanbul compatibility.

    The configuration also defines two network settings: 

    - `localNode` - runs a PolkaVM instance on `http://127.0.0.1:8545` for local development and testing
    - `westendAssetHub` - connects to the Westend Asset Hub network using a predefined RPC URL and a private key stored in environment variables

7. Create a `.env` file in your project root to store your private key:

    ```text title=".env"
    PRIVATE_KEY="INSERT_PRIVATE_KEY"
    ```

    Replace `INSERT_PRIVATE_KEY` with your actual private key. 
    
    For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Keep your private key safe, and never share it with anyone. If it is compromised, your funds can be stolen.

## Adding the Smart Contract

1. Create a new folder called `contracts` and create a `Storage.sol` file. Add the contract code from the previous tutorial:

    ```solidity title="Storage.sol"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.sol'
    ```

2. Compile the contract:

    ```bash
    npx hardhat compile
    ```

3. If successful, you will see the following output in your terminal:

    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/compilation-output.html'

After compilation, the `artifacts-pvm` and `cache-pvm` folders, containing the metadata and binary files of your compiled contract, will be created in the root of your project.

## Writing Tests

Testing is a critical part of smart contract development. Hardhat makes it easy to write tests in JavaScript using frameworks like [Mocha](https://mochajs.org/){target=\_blank} and [Chai](https://www.chaijs.com/){target=\_blank}.

1. Create a folder for testing called `test`. Inside that directory, create a file named `Storage.js` and add the following code:

    ```javascript title="Storage.js" 
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js:0:19'
        // Add your logic here
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js:48:49'
    ```

    The `beforeEach` hook ensures stateless contract execution by redeploying a fresh instance of the Storage contract before each test case. This approach guarantees that each test starts with a clean and independent contract state by using `ethers.getSigners()` to obtain test accounts and `ethers.getContractFactory('Storage').deploy()` to create a new contract instance.

    Now, you can add custom unit tests to check your contract functionality. Some example tests are available below:

    a. **Initial state verification** - ensures that the contract starts with a default value of zero, which is a fundamental expectation for the `Storage.sol` contract

    ```javascript title="Storage.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js:20:22'
    ```

    Explanation:

    - Checks the initial state of the contract
    - Verifies that a newly deployed contract has a default value of 0
    - Confirms the `retrieve()` method works correctly for a new contract

    b. **Value storage test** - validate the core functionality of storing and retrieving a value in the contract

    ```javascript title="Storage.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js:24:30'
    ```

    Explanation:

    - Demonstrates the ability to store a specific value
    - Checks that the stored value can be retrieved correctly
    - Verifies the basic write and read functionality of the contract

    c. **Event emission verification** - confirm that the contract emits the correct event when storing a value, which is crucial for off-chain tracking

    ```javascript title="Storage.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js:32:38'
    ```

    Explanation:

    - Ensures the `NumberChanged` event is emitted during storage
    - Verifies that the event contains the correct stored value
    - Validates the contract's event logging mechanism

    d. **Sequential value storage test** - check the contract's ability to store multiple values sequentially and maintain the most recent value

    ```javascript title="Storage.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js:40:47'
    ```

    Explanation:

    - Verifies that multiple values can be stored in sequence
    - Confirms that each new store operation updates the contract's state
    - Demonstrates the contract's ability always to reflect the most recently stored value

    The complete `test/Storage.js` should look like this:

    ???--- code "View complete script"
        ```javascript title="Storage.js"
        --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/Storage.test.js'
        ```

2. Run the tests:

    ```bash
    npx hardhat test
    ```

3. After running the above command, you will see the output showing that all tests have passed:

    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/testing-output.html'

## Deploying with Ignition

[Hardhat's Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} is a deployment system designed to make deployments predictable and manageable. Let's create a deployment script:

1. Create a new folder called`ignition/modules`. Add a new file named `StorageModule.js` with the following logic:

    ```javascript title="StorageModule.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/StorageModule.js'
    ```

2. Deploy to the local network:

    a. First, start a local node:

    ```bash
    npx hardhat node-polkavm
    ```

    b. Then, in a new terminal window, deploy the contract:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/StorageModule.js --network localNode
    ```

    c. If successful, output similar to the following will display in your terminal:

    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/local-deployment-output.html'

3. Deploy to Westend Asset Hub:

    a. Make sure your account has enough WND tokens for gas fees, then run:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/StorageModule.js --network westendAssetHub
    ```

    b. After deployment, you'll see the contract address in the console output. Save this address for future interactions.

    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/westend-deployment-output.html'

## Interacting with Your Deployed Contract

To interact with your deployed contract:

1. Create a new folder named `scripts` and add the `interact.js` with the following content:

    ```javascript title="interact.js"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/interact.js'
    ```

    Ensure that `INSERT_DEPLOYED_CONTRACT_ADDRESS` is replaced with the value obtained in the previous step.

2. Run the interaction script:

    ```bash
    npx hardhat run scripts/interact.js --network westendAssetHub
    ```

3. If successful, the terminal will show the following output:

    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-hardhat/interact-output.html'

## Conclusion

Congratulations! You've successfully set up a Hardhat development environment, written comprehensive tests for your Storage contract, and deployed it to local and Westend Asset Hub networks. This tutorial covered essential steps in smart contract development, including configuration, testing, deployment, and interaction.
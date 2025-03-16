
---
title: Use Hardhat with Asset Hub
description: Learn how to create, compile, test, and deploy smart contracts on Asset Hub using Hardhat, a powerful development environment for blockchain developers.
---

# Hardhat

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide will walk you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some WND test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank})
- MetaMask wallet configured for Asset Hub (for more information, check the [How to Connect to Asset Hub](/develop/smart-contracts/connect-to-asset-hub){target=\_blank} guide)

## Setting Up Hardhat

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir hardhat-example
    cd hardhat-example
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. Install Hardhat and the required plugins:

    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```

    To interact with Asset Hub, Hardhat requires the [`hardhat-resolc`](https://www.npmjs.com/package/hardhat-resolc){target=\_blank} plugin to compile contracts to PolkaVM bytecode and the [`hardhat-revive-node`](https://www.npmjs.com/package/hardhat-revive-node){target=\_blank} plugin to spawn a local node compatible

    ```bash
    npm install --save-dev hardhat-resolc hardhat-revive-node
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select "Create a JavaScript project" when prompted and follow the instructions. After that, your project will be created with 3 mains folders:

    - **`contracts`** - TODO
    - **`test`** - TODO
    - **`ignition`** - TODO

5. Update your Hardhat configuration file (`hardhat.config.js`) to include the plugins:

    ```javascript title="hardhat.config.js"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:8'
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:63:63'
    ```

## Compiling Your Contract

When compiling your contract using the `hardhat-resolc` plugin, there are two ways to configure your compilation process:

- **Binary compiler** - TODO
- **Remix compiler** - TODO

To compile your, follow the instructions below:

1. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

    !!! note
        The `hardhat-resolc` plugin will compile your Solidity contracts to be PolkaVM compatible. This works for Solidity versions 0.8.0 and higher.

2. After successful compilation, you'll see the artifacts generated in the `artifacts` directory:

    ```bash
    ls artifacts/contracts/Counter.sol/
    ```

    This should show files like `Counter.json` containing the contract ABI and bytecode.

## Testing Your Contract

TODO: waiting for https://github.com/paritytech/contract-issues/issues/41

## Deploying with a Local Node

Before deploying to a live network, you can deploy your contract to a local node using the `hardhat-revive-node` plugin and Ignition modules:

1. Create a new directory for your deployment scripts:

    ```bash
    mkdir -p deploy/ignition
    ```

2. Create a file `deploy/ignition/counter.js` with the following content:

    ???- "counter.js"
    
        ```javascript
        const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

        module.exports = buildModule("CounterModule", (m) => {
          const initialCount = 0;
          const counter = m.contract("Counter", [initialCount]);
          
          return { counter };
        });
        ```

3. Start a local node:

    ```bash
    npx hardhat node
    ```

    This will start a local PolkaVM node powered by the `hardhat-revive-node` plugin.

4. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./deploy/ignition/counter.js --network localhost
    ```

    You'll see deployment information including the contract address.

## Deploying to a Live Network

To deploy your contract to the Asset Hub on Westend testnet:

1. Ensure you have configured your Westend Asset Hub network in `hardhat.config.js` as shown earlier.

2. Create a `.env` file in your project root to store your private key:

    ```
    PRIVATE_KEY=your_private_key_here
    ```

    !!! warning
        Never commit your `.env` file to version control systems. Add `.env` to your `.gitignore` file.

3. Install and configure dotenv:

    ```bash
    npm install --save-dev dotenv
    ```

4. Update your `hardhat.config.js` to use dotenv:

    ```javascript
    require("@nomicfoundation/hardhat-toolbox");
    require("hardhat-resolc");
    require("hardhat-revive-node");
    require('dotenv').config();

    /** @type import('hardhat/config').HardhatUserConfig */
    module.exports = {
      solidity: "0.8.19",
      networks: {
        westend_asset_hub: {
          url: "https://westend-asset-hub-rpc.polkadot.io",
          accounts: [process.env.PRIVATE_KEY],
          chainId: 1000
        }
      }
    };
    ```

5. Deploy to Westend Asset Hub using Ignition:

    ```bash
    npx hardhat ignition deploy ./deploy/ignition/counter.js --network westend_asset_hub
    ```

6. After successful deployment, you'll receive the deployed contract address and transaction details.

    !!! note
        Make sure you have WND tokens in your wallet to cover gas fees.

## Interacting with Your Contract

You can interact with your deployed contract using Hardhat's console:

1. Open the Hardhat console for the network where your contract is deployed:

    ```bash
    npx hardhat console --network westend_asset_hub
    ```

2. Get your contract instance:

    ```javascript
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.attach("your_deployed_contract_address");
    ```

3. Interact with your contract:

    ```javascript
    // Get the current count
    await counter.getCount();
    
    // Increment the count
    await counter.increment();
    
    // Get the updated count
    await counter.getCount();
    ```

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Asset Hub. Its plugin architecture allows for seamless integration with PolkaVM through the `hardhat-resolc` and `hardhat-revive-node` plugins.

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

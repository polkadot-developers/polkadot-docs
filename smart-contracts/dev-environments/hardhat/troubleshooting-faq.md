---
title: Troubleshooting Hardhat
description: Common issues related to developing, compiling, and deploying smart contracts using Hardhat on Polkadot Hub, paired with troubleshooting suggestions.
categories: Smart Contracts, Tooling
---

# Hardhat Troubleshooting

This guide provides solutions to common issues you may encounter when using Hardhat with Polkadot Hub. If you're experiencing problems with installation, compilation, deployment, testing, or contract interaction, you'll likely find the solution here.

## Hardhat fails to install or run with version-related errors

- **Check Node.js version**:
    - Ensure you have an LTS version of Node.js installed (18.x, 20.x, or 22.x).
    - Check your current version with `node --version`.
    - Download the appropriate LTS version from [nodejs.org](https://nodejs.org/).

- **Use nvm for version management**:
    - Install nvm (Node Version Manager) to to switch between Node versions easily.
    - Run `nvm install --lts` to install the latest LTS version.
    - Run `nvm use --lts` to switch to it.

## Installation of Hardhat or its dependencies via npm fails

- **Clear npm cache**:
    ```bash
    npm cache clean --force
    ```

- **Delete `node_modules` and `package-lock.json`**:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

- **Check npm version**:
    - Ensure you have npm 7.x or higher
    - Update npm with `npm install -g npm@latest`

- **Install with specific version**:
    ```bash
    npm install --save-dev hardhat@^2.26.0
    ```

## Hardhat Toolbox fails to install or causes conflicts

- **Install Hardhat Toolbox separately**:
    ```bash
    npm install --save-dev @nomicfoundation/hardhat-toolbox
    ```

- **Check for peer dependency conflicts**:
    - Review the error messages for conflicting package versions.
    - Try using `npm install --legacy-peer-deps` if conflicts persist.

## Your contract fails to compile or shows errors in the terminal

- **Check Solidity version compatibility**:
    - Ensure your contract's pragma statement matches the compiler version in `hardhat.config.js`.
        - Example: If your contract uses `pragma solidity ^0.8.0;`, set `solidity: "0.8.28"` or another compatible version.

- **Verify imports**:
    - Ensure all imported contracts are in the correct paths.
    - For OpenZeppelin contracts, make sure dependencies are installed using the command: 
        ```bash
        `npm install @openzeppelin/contracts`
        ```

- **Clear artifacts and cache**:
    ```bash
    npx hardhat clean
    npx hardhat compile
    ```

- **Check for syntax errors**:
    - Carefully read error messages in the terminal.
    - Check for common syntax errors, such as missing semicolons, incorrect function visibility, or type mismatches.

## The artifacts folder is empty or missing expected files

- **Ensure compilation completed successfully**:
    - Check the terminal output for any error messages.
    - Look for the "Compiled X Solidity files successfully" message.

- **Verify contract file location**:
    - Contracts must be in the `contracts` directory or subdirectories.
    - File must have `.sol` extension.

- **Check `hardhat.config.js` settings**:
    - Ensure the paths configuration is correct.
    - Default artifacts location is `./artifacts`.

## Errors related to Solidity compiler version or features

- **Match pragma version with config**:
    ```javascript
    module.exports = {
      solidity: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    };
    ```

- **Use multiple compiler versions** (if needed):
    ```javascript
    module.exports = {
      solidity: {
        compilers: [
          { version: '0.8.28' },
          { version: '0.8.20' }
        ]
      }
    };
    ```

## Tests don't execute or Hardhat throws errors when running tests

- **Verify test file location**:
    - Test files must be in the `test` directory.
    - Files should end with `.js` or `.test.js`.

- **Check test framework imports**:
    ```javascript
    const { expect } = require('chai');
    const { ethers } = require('hardhat');
    ```

- **Ensure Hardhat Toolbox is installed**:
    ```bash
    npm install --save-dev @nomicfoundation/hardhat-toolbox
    ```

- **Run tests with verbose output**:
    ```bash
    npx hardhat test --verbose
    ```

## The Hardhat node fails to start or becomes unresponsive

1. **Check if port 8545 is already in use**:
    - Kill any process using port 8545 as follows:
        - **Linux/Mac**: `lsof -ti:8545 | xargs kill -9`
        - **Windows**: `netstat -ano | findstr :8545`, then kill the process with the appropriate process ID

2. **Specify a different port**:
    ```bash
    npx hardhat node --port 8546
    ```

3. **Reset the node**:
    - Stop the node (Ctrl+C).
    - Start it again with a fresh state.

## Tests run but fail with assertion errors

- **Check account balances**:
    - Ensure test accounts have sufficient ETH.
    - Hardhat node provides test accounts with 10,000 ETH each.

- **Wait for transaction confirmations**:
    ```javascript
    const tx = await contract.someFunction();
    await tx.wait(); // Wait for transaction to be mined
    ```

- **Verify contract state**:
    - Use `console.log` to debug values.
    - Check if the contract was properly deployed in `beforeEach` hooks.

- **Review timing issues**:
    - Add appropriate waits between transactions.
    - Use `await ethers.provider.send('evm_mine')` to mine blocks manually.

## Hardhat cannot connect to the local development node

1. **Verify the node is running**:
    - Ensure your local development node is started.
    - Check the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/) guide.

2. **Check network configuration**:
    ```javascript
    module.exports = {
      networks: {
        polkadotTestNet: {
          url: 'http://localhost:8545',
          chainId: 420420420,
          accounts: [PRIVATE_KEY]
        }
      }
    };
    ```

3. **Verify URL and port**:
    - Ensure the URL matches your local node's RPC endpoint.
    - Default is usually `http://localhost:8545`.

4. **Check firewall settings**:
    - Ensure your firewall allows connections to `localhost:8545`.

## Hardhat cannot access or use the configured private key

- **Verify private key is set**:
    ```bash
    npx hardhat vars get PRIVATE_KEY
    ```

- **Set private key correctly**:
    ```bash
    npx hardhat vars set PRIVATE_KEY "0x..."
    ```
    - Ensure the key starts with "0x".
    - Do not include quotes within the actual key value.

- **Check key format in config**:
    ```javascript
    const { vars } = require('hardhat/config');
    const PRIVATE_KEY = vars.get('PRIVATE_KEY');
    
    module.exports = {
      networks: {
        polkadotTestNet: {
          accounts: [PRIVATE_KEY] // Should be an array
        }
      }
    };
    ```

- **Alternative: Use mnemonic**:
    ```javascript
    accounts: {
      mnemonic: 'test test test test test test test test test test test junk'
    }
    ```

## Deployment or transactions go to the wrong network

- **Specify network explicitly**:
    ```bash
    npx hardhat run scripts/deploy.js --network polkadotTestNet
    ```

- **Verify network in config**:
    - Check that the network name matches what you're using in commands.
    - Ensure chainId matches the target network.

- **Check default network**:
    ```javascript
    module.exports = {
      defaultNetwork: 'polkadotTestNet',
      networks: {
        // network configs
      }
    };
    ```

## Deployment fails with "insufficient funds" error

- **Check account balance**:
    - Verify you have enough test tokens in your account.
    - For the local development node, accounts should be pre-funded.

- **Get test tokens**:
    - Visit the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank} for test networks.
    - Wait a few minutes for faucet transactions to complete.

- **Verify account address**:
    - Ensure the private key corresponds to the account you think you're using.
    - Check the account balance matches expectations.

## Deployment using Hardhat Ignition fails or throws errors

- **Check ignition module syntax**:
    ```javascript
    const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');
    
    module.exports = buildModule('LockModule', (m) => {
      const unlockTime = m.getParameter('unlockTime');
      const lock = m.contract('Lock', [unlockTime]);
      return { lock };
    });
    ```

- **Verify constructor parameters**:
    - Ensure all required constructor parameters are provided.
    - Check parameter types match the contract's constructor.

- **Clear previous deployments**:
    ```bash
    rm -rf ignition/deployments/
    ```

- **Use deployment script alternative**:
    - Create a manual deployment script in the `scripts` folder if Ignition continues to fail.

## Custom deployment scripts fail to execute

- **Check script imports**:
    ```javascript
    const hre = require('hardhat');
    // or
    const { ethers } = require('hardhat');
    ```

- **Verify contract factory**:
    ```javascript
    const Contract = await ethers.getContractFactory('INSERT_CONTRACT_NAME');
    const contract = await Contract.deploy(INSERT_CONSTRUCTOR_ARGS);
    await contract.deployed();
    ```

- **Add error handling**:
    ```javascript
    try {
      // deployment code
    } catch (error) {
      console.error('Deployment failed: ', error);
      process.exit(1);
    }
    ```

- **Check gas settings**:
    ```javascript
    const contract = await Contract.deploy({
      gasLimit: 5000000
    });
    ```

## Contract deployment hangs or times out

- **Increase timeout in config**:
    ```javascript
    module.exports = {
      networks: {
        polkadotTestNet: {
          timeout: 60000 // 60 seconds
        }
      }
    };
    ```

- **Check network connection**:
    - Verify the RPC endpoint is responsive.
    - Test with a simple read operation first.

- **Reduce contract complexity**:
    - Large contracts may take longer to deploy.
    - Consider splitting into multiple contracts.

## Scripts fail to interact with a deployed contract

- **Verify contract address**:
    - Ensure you're using the correct deployed contract address.
    - Check the deployment output or ignition deployment files.

- **Check contract ABI**:
    ```javascript
    const Contract = await ethers.getContractFactory('INSERT_CONTRACT_NAME');
    const contract = Contract.attach(contractAddress);
    ```

- **Verify network connection**:
    - Ensure you're connected to the same network where the contract was deployed.
    - Use the `--network` flag when running scripts.

## Transactions revert when calling contract functions

- **Check function requirements**:
    - Verify all `require()` conditions in the contract are satisfied.
    - Ensure you're meeting any access control requirements.

- **Add debugging**:
    ```javascript
    try {
      const tx = await contract.someFunction();
      const receipt = await tx.wait();
      console.log('Transaction successful: ', receipt);
    } catch (error) {
      console.error('Transaction failed: ', error.message);
    }
    ```

- **Check gas limits**:
    ```javascript
    const tx = await contract.someFunction({
      gasLimit: 500000
    });
    ```

- **Verify function parameters**:
    - Ensure parameter types match the function signature.
    - Check for the correct number of parameters.

## View or pure functions don't return expected values

- **Use `call()` for read-only functions**:
    ```javascript
    const value = await contract.someViewFunction();
    console.log('Returned value: ', value);
    ```

- **Check contract state**:
    - Verify the contract has been properly initialized.
    - Ensure any required state changes have been completed.

- **Handle `BigNumber` returns**:
    ```javascript
    const value = await contract.someFunction();
    console.log('Value: ', value.toString());
    ```

## State-changing functions execute but don't update state

- **Wait for transaction confirmation**:
    ```javascript
    const tx = await contract.someFunction();
    await tx.wait(); // Wait for the transaction to be mined
    const newState = await contract.getState();
    ```

- **Check transaction receipt**:
    ```javascript
    const tx = await contract.someFunction();
    const receipt = await tx.wait();
    console.log('Transaction status: ', receipt.status);
    ```

- **Verify transaction success**:
    - Check that `receipt.status === 1` (success).
    - Review any events emitted by the transaction.

- **Check for reverts**:
    - Look for any revert reasons in the error message.
    - Verify contract logic and access controls.

## Contract compilation takes a long time

- **Enable compiler cache**:
    - Hardhat caches compilation results by default.
    - Ensure the cache folder is not ignored in `.gitignore`.

- **Optimize compiler settings**:
    ```javascript
    module.exports = {
      solidity: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    };
    ```

- **Compile specific contracts**:
    ```bash
    npx hardhat compile --force
    ```

## Can't start Hardhat console or console commands fail

- **Start console with correct network**:
    ```bash
    npx hardhat console --network polkadotTestNet
    ```

- **Check console imports**:
    ```javascript
    // In console
    const Contract = await ethers.getContractFactory('INSERT_CONTRACT_NAME');
    ```

- **Verify network connection**:
    - Ensure the target network is accessible.
    - Check network configuration in `hardhat.config.js`.

## Hardhat plugins not working correctly

- **Verify plugin installation**:
    ```bash
    npm list @nomicfoundation/hardhat-toolbox
    ```

- **Check plugin import in config**:
    ```javascript
    require("@nomicfoundation/hardhat-toolbox");
    ```

- **Update plugins to latest versions**:
    ```bash
    npm update @nomicfoundation/hardhat-toolbox
    ```

- **Check for plugin conflicts**:
    - Review `package.json` for version conflicts.
    - Try removing and reinstalling conflicting plugins.

## Scripts cannot read environment variables

- **Use Hardhat vars correctly**:
    ```bash
    npx hardhat vars set VARIABLE_NAME "value"
    npx hardhat vars get VARIABLE_NAME
    ```

- **Alternatively, use dotenv**:
    ```bash
    npm install dotenv
    ```
    ```javascript
    require('dotenv').config();
    const value = process.env.VARIABLE_NAME;
    ```

- **Check variable access in config**:
    ```javascript
    const { vars } = require('hardhat/config');
    const value = vars.get('VARIABLE_NAME');
    ```
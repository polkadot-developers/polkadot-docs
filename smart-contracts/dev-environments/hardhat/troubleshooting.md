---
title: Troubleshooting Hardhat on Polkadot Hub
description: Solutions to common issues when developing, compiling, deploying, and testing smart contracts using Hardhat on Polkadot Hub.
categories: Smart Contracts, Tooling
---

# Troubleshooting Hardhat

## Overview

This guide provides solutions to common issues you may encounter when using Hardhat with Polkadot Hub. If you're experiencing problems with installation, compilation, deployment, testing, or contract interaction, you'll likely find the solution here.

## Installation Issues

### Node.js Version Incompatibility

**Problem**: Hardhat fails to install or run with version-related errors.

**Solutions**:

1. **Check Node.js version**:
    - Ensure you have an LTS version of Node.js installed (18.x, 20.x, or 22.x)
    - Check your current version with `node --version`
    - Download the appropriate LTS version from [nodejs.org](https://nodejs.org/)

2. **Use nvm for version management**:
    - Install nvm (Node Version Manager) to easily switch between Node versions
    - Run `nvm install --lts` to install the latest LTS version
    - Run `nvm use --lts` to switch to it

### Hardhat Installation Fails

**Problem**: npm fails to install Hardhat or its dependencies.

**Solutions**:

1. **Clear npm cache**:
    ```bash
    npm cache clean --force
    ```

2. **Delete node_modules and package-lock.json**:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

3. **Check npm version**:
    - Ensure you have npm 7.x or higher
    - Update npm with `npm install -g npm@latest`

4. **Install with specific version**:
    ```bash
    npm install --save-dev hardhat@^2.26.0
    ```

### Hardhat Toolbox Plugin Issues

**Problem**: Hardhat Toolbox fails to install or causes conflicts.

**Solutions**:

1. **Install Hardhat Toolbox separately**:
    ```bash
    npm install --save-dev @nomicfoundation/hardhat-toolbox
    ```

2. **Check for peer dependency conflicts**:
    - Review the error messages for conflicting package versions
    - Try using `npm install --legacy-peer-deps` if conflicts persist

## Compilation Issues

### Contract Won't Compile

**Problem**: Your contract fails to compile or shows errors in the terminal.

**Solutions**:

1. **Check Solidity version compatibility**:
    - Ensure your contract's pragma statement matches the compiler version in `hardhat.config.js`
    - Example: If your contract uses `pragma solidity ^0.8.0;`, set `solidity: "0.8.28"` or compatible version

2. **Verify imports**:
    - Ensure all imported contracts are in the correct paths
    - For OpenZeppelin contracts, make sure they're installed: `npm install @openzeppelin/contracts`

3. **Clear artifacts and cache**:
    ```bash
    npx hardhat clean
    npx hardhat compile
    ```

4. **Check for syntax errors**:
    - Carefully read error messages in the terminal
    - Common issues include missing semicolons, incorrect function visibility, or type mismatches

### Compilation Artifacts Missing

**Problem**: The artifacts folder is empty or missing expected files.

**Solutions**:

1. **Ensure compilation completed successfully**:
    - Check the terminal output for any error messages
    - Look for "Compiled X Solidity files successfully" message

2. **Verify contract file location**:
    - Contracts must be in the `contracts` directory or subdirectories
    - File must have .sol extension

3. **Check hardhat.config.js settings**:
    - Ensure the paths configuration is correct
    - Default artifacts location is `./artifacts`

### Compiler Version Errors

**Problem**: Errors related to Solidity compiler version or features.

**Solutions**:

1. **Match pragma version with config**:
    ```javascript
    module.exports = {
      solidity: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    };
    ```

2. **Use multiple compiler versions** (if needed):
    ```javascript
    module.exports = {
      solidity: {
        compilers: [
          { version: "0.8.28" },
          { version: "0.8.20" }
        ]
      }
    };
    ```

## Testing Issues

### Tests Fail to Run

**Problem**: Tests don't execute or Hardhat throws errors when running tests.

**Solutions**:

1. **Verify test file location**:
    - Test files must be in the `test` directory
    - Files should end with `.js` or `.test.js`

2. **Check test framework imports**:
    ```javascript
    const { expect } = require("chai");
    const { ethers } = require("hardhat");
    ```

3. **Ensure Hardhat Toolbox is installed**:
    ```bash
    npm install --save-dev @nomicfoundation/hardhat-toolbox
    ```

4. **Run tests with verbose output**:
    ```bash
    npx hardhat test --verbose
    ```

### Local Test Network Issues

**Problem**: `npx hardhat node` fails to start or becomes unresponsive.

**Solutions**:

1. **Check if port 8545 is already in use**:
    - Kill any process using port 8545
    - On Linux/Mac: `lsof -ti:8545 | xargs kill -9`
    - On Windows: `netstat -ano | findstr :8545`, then kill the process with the appropriate process ID.

2. **Specify a different port**:
    ```bash
    npx hardhat node --port 8546
    ```

3. **Reset the node**:
    - Stop the node (Ctrl+C)
    - Start it again with a fresh state

### Test Assertions Failing

**Problem**: Tests run but fail with assertion errors.

**Solutions**:

1. **Check account balances**:
    - Ensure test accounts have sufficient ETH
    - Hardhat node provides test accounts with 10,000 ETH each

2. **Wait for transaction confirmations**:
    ```javascript
    const tx = await contract.someFunction();
    await tx.wait(); // Wait for transaction to be mined
    ```

3. **Verify contract state**:
    - Use console.log to debug values
    - Check if contract was properly deployed in beforeEach hooks

4. **Review timing issues**:
    - Add appropriate waits between transactions
    - Use `await ethers.provider.send("evm_mine")` to mine blocks manually

## Network Configuration Issues

### Cannot Connect to Local Development Node

**Problem**: Hardhat cannot connect to the local development node.

**Solutions**:

1. **Verify the node is running**:
    - Ensure your local development node is started
    - Check the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/) guide

2. **Check network configuration**:
    ```javascript
    module.exports = {
      networks: {
        polkadotTestNet: {
          url: "http://localhost:8545",
          chainId: 420420420,
          accounts: [PRIVATE_KEY]
        }
      }
    };
    ```

3. **Verify URL and port**:
    - Ensure the URL matches your local node's RPC endpoint
    - Default is usually `http://localhost:8545`

4. **Check firewall settings**:
    - Ensure your firewall allows connections to localhost:8545

### Private Key Configuration Issues

**Problem**: Hardhat cannot access or use the configured private key.

**Solutions**:

1. **Verify private key is set**:
    ```bash
    npx hardhat vars get PRIVATE_KEY
    ```

2. **Set private key correctly**:
    ```bash
    npx hardhat vars set PRIVATE_KEY "0x..."
    ```
    - Ensure the key starts with "0x"
    - Do not include quotes within the actual key value

3. **Check key format in config**:
    ```javascript
    const { vars } = require("hardhat/config");
    const PRIVATE_KEY = vars.get("PRIVATE_KEY");
    
    module.exports = {
      networks: {
        polkadotTestNet: {
          accounts: [PRIVATE_KEY] // Should be an array
        }
      }
    };
    ```

4. **Alternative: Use mnemonic**:
    ```javascript
    accounts: {
      mnemonic: "test test test test test test test test test test test junk"
    }
    ```

### Wrong Network Selected

**Problem**: Deployment or transactions go to the wrong network.

**Solutions**:

1. **Specify network explicitly**:
    ```bash
    npx hardhat run scripts/deploy.js --network polkadotTestNet
    ```

2. **Verify network in config**:
    - Check that the network name matches what you're using in commands
    - Ensure chainId matches the target network

3. **Check default network**:
    ```javascript
    module.exports = {
      defaultNetwork: "polkadotTestNet",
      networks: {
        // network configs
      }
    };
    ```

## Deployment Issues

### Insufficient Funds Error

**Problem**: Deployment fails with "insufficient funds" error.

**Solutions**:

1. **Check account balance**:
    - Verify you have enough test tokens in your account
    - For local development node, accounts should be pre-funded

2. **Get test tokens**:
    - Visit the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank} for test networks
    - Wait a few minutes for faucet transactions to complete

3. **Verify account address**:
    - Ensure the private key corresponds to the account you think you're using
    - Check the account balance matches expectations

### Ignition Deployment Fails

**Problem**: Deployment using Hardhat Ignition fails or throws errors.

**Solutions**:

1. **Check Ignition module syntax**:
    ```javascript
    const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
    
    module.exports = buildModule("LockModule", (m) => {
      const unlockTime = m.getParameter("unlockTime");
      const lock = m.contract("Lock", [unlockTime]);
      return { lock };
    });
    ```

2. **Verify constructor parameters**:
    - Ensure all required constructor parameters are provided
    - Check parameter types match the contract's constructor

3. **Clear previous deployments**:
    ```bash
    rm -rf ignition/deployments/
    ```

4. **Use deployment script alternative**:
    - Create a manual deployment script in the `scripts` folder if Ignition continues to fail

### Deployment Script Errors

**Problem**: Custom deployment scripts fail to execute.

**Solutions**:

1. **Check script imports**:
    ```javascript
    const hre = require("hardhat");
    // or
    const { ethers } = require("hardhat");
    ```

2. **Verify contract factory**:
    ```javascript
    const Contract = await ethers.getContractFactory("ContractName");
    const contract = await Contract.deploy(/* constructor args */);
    await contract.deployed();
    ```

3. **Add error handling**:
    ```javascript
    try {
      // deployment code
    } catch (error) {
      console.error("Deployment failed:", error);
      process.exit(1);
    }
    ```

4. **Check gas settings**:
    ```javascript
    const contract = await Contract.deploy({
      gasLimit: 5000000
    });
    ```

### Contract Deployment Timeout

**Problem**: Deployment hangs or times out.

**Solutions**:

1. **Increase timeout in config**:
    ```javascript
    module.exports = {
      networks: {
        polkadotTestNet: {
          timeout: 60000 // 60 seconds
        }
      }
    };
    ```

2. **Check network connection**:
    - Verify the RPC endpoint is responsive
    - Test with a simple read operation first

3. **Reduce contract complexity**:
    - Large contracts may take longer to deploy
    - Consider splitting into multiple contracts

## Contract Interaction Issues

### Cannot Connect to Deployed Contract

**Problem**: Scripts fail to interact with a deployed contract.

**Solutions**:

1. **Verify contract address**:
    - Ensure you're using the correct deployed contract address
    - Check the deployment output or Ignition deployment files

2. **Check contract ABI**:
    ```javascript
    const Contract = await ethers.getContractFactory("ContractName");
    const contract = Contract.attach(contractAddress);
    ```

3. **Verify network connection**:
    - Ensure you're connected to the same network where the contract was deployed
    - Use the `--network` flag when running scripts

### Transaction Reverts

**Problem**: Transactions revert when calling contract functions.

**Solutions**:

1. **Check function requirements**:
    - Verify all require() conditions in the contract are satisfied
    - Ensure you're meeting any access control requirements

2. **Add debugging**:
    ```javascript
    try {
      const tx = await contract.someFunction();
      const receipt = await tx.wait();
      console.log("Transaction successful:", receipt);
    } catch (error) {
      console.error("Transaction failed:", error.message);
    }
    ```

3. **Check gas limits**:
    ```javascript
    const tx = await contract.someFunction({
      gasLimit: 500000
    });
    ```

4. **Verify function parameters**:
    - Ensure parameter types match the function signature
    - Check for correct number of parameters

### Read Functions Not Returning Values

**Problem**: View/pure functions don't return expected values.

**Solutions**:

1. **Use call() for read-only functions**:
    ```javascript
    const value = await contract.someViewFunction();
    console.log("Returned value:", value);
    ```

2. **Check contract state**:
    - Verify the contract has been properly initialized
    - Ensure any required state changes have been completed

3. **Handle BigNumber returns**:
    ```javascript
    const value = await contract.someFunction();
    console.log("Value:", value.toString());
    ```

### Write Functions Not Updating State

**Problem**: State-changing functions execute but don't update state.

**Solutions**:

1. **Wait for transaction confirmation**:
    ```javascript
    const tx = await contract.someFunction();
    await tx.wait(); // Wait for the transaction to be mined
    const newState = await contract.getState();
    ```

2. **Check transaction receipt**:
    ```javascript
    const tx = await contract.someFunction();
    const receipt = await tx.wait();
    console.log("Transaction status:", receipt.status);
    ```

3. **Verify transaction success**:
    - Check that receipt.status === 1 (success)
    - Review any events emitted by the transaction

4. **Check for reverts**:
    - Look for revert reasons in the error message
    - Verify contract logic and access controls

## Performance and Configuration Issues

### Compilation is Slow

**Problem**: Contract compilation takes a long time.

**Solutions**:

1. **Enable compiler cache**:
    - Hardhat caches compilation results by default
    - Ensure the cache folder is not ignored in .gitignore

2. **Optimize compiler settings**:
    ```javascript
    module.exports = {
      solidity: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    };
    ```

3. **Compile specific contracts**:
    ```bash
    npx hardhat compile --force
    ```

### Hardhat Console Issues

**Problem**: Cannot start Hardhat console or console commands fail.

**Solutions**:

1. **Start console with correct network**:
    ```bash
    npx hardhat console --network polkadotTestNet
    ```

2. **Check console imports**:
    ```javascript
    // In console
    const Contract = await ethers.getContractFactory("ContractName");
    ```

3. **Verify network connection**:
    - Ensure the target network is accessible
    - Check network configuration in hardhat.config.js

### Plugin Configuration Issues

**Problem**: Hardhat plugins not working correctly.

**Solutions**:

1. **Verify plugin installation**:
    ```bash
    npm list @nomicfoundation/hardhat-toolbox
    ```

2. **Check plugin import in config**:
    ```javascript
    require("@nomicfoundation/hardhat-toolbox");
    ```

3. **Update plugins to latest versions**:
    ```bash
    npm update @nomicfoundation/hardhat-toolbox
    ```

4. **Check for plugin conflicts**:
    - Review package.json for version conflicts
    - Try removing and reinstalling conflicting plugins

## Environment Variable Issues

### Cannot Access Environment Variables

**Problem**: Scripts cannot read environment variables.

**Solutions**:

1. **Use Hardhat vars correctly**:
    ```bash
    npx hardhat vars set VARIABLE_NAME "value"
    npx hardhat vars get VARIABLE_NAME
    ```

2. **Alternative: Use dotenv**:
    ```bash
    npm install dotenv
    ```
    ```javascript
    require('dotenv').config();
    const value = process.env.VARIABLE_NAME;
    ```

3. **Check variable access in config**:
    ```javascript
    const { vars } = require("hardhat/config");
    const value = vars.get("VARIABLE_NAME");
    ```

### Private Key Security Warnings

**Problem**: Concerns about private key security.

**Solutions**:

1. **Never commit private keys**:
    - Add `.env` to .gitignore if using dotenv
    - Hardhat vars are stored locally and not in git

2. **Use test accounts for development**:
    - Use the pre-funded accounts from `npx hardhat node`
    - Never use real private keys for testing

3. **Verify .gitignore includes**:
    ```
    node_modules
    .env
    coverage
    cache
    artifacts
    ignition/deployments/
    ```

## Where to Go Next

Continue improving your Hardhat workflow with these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Get Started with Hardhat__

    ---

    Return to the basics and review the Hardhat setup process.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/get-started)

-   <span class="badge guide">Guide</span> __Compile and Test Smart Contracts__

    ---

    Learn how to compile and test your smart contracts using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/compile-and-test)

-   <span class="badge guide">Guide</span> __Deploy Smart Contracts__

    ---

    Learn how to deploy and interact with smart contracts using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/deploy-a-contract)

-   <span class="badge external">External</span> __Hardhat Documentation__

    ---

    Explore official Hardhat documentation for advanced troubleshooting.

    [:octicons-arrow-right-24: Visit Docs](https://hardhat.org/docs){target=\_blank}

</div>
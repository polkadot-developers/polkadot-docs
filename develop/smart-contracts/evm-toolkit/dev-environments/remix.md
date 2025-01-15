---
title: Using Remix IDE
description: Explore the process of smart contract development and deployment on Asset Hub using Remix IDE, a visual IDE for blockchain developers.
---

# Remix IDE

## Overview

Remix IDE is a powerful browser-based development environment for smart contracts. This guide will walk you through the essential of the [Polkadot Remix IDE](https://remix.polkadot.io/){target=\_blank}, to understand the processes of compiling, developing and deploying smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- A web browser with [MetaMask](https://metamask.io/) extension installed
- Basic understanding of Solidity programming
- Some test tokens for transaction fees (you can get them from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank})

## Accessing Remix IDE

Navigate to [https://remix.polkadot.io/](https://remix.polkadot.io/){target=\_blank}. The interface will load with a default workspace containing sample contracts.

![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-1.webp)

The main interface consists of a File Explorer (left panel), a Code Editor (center) and an Extensions panel (right).

## Creating a New Contract

1. Click the **Create a new file** button in the **contracts** folder

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-2.webp)

2. Name your file with a `.sol` extension, in this case, `Counter.sol`

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-3.webp)

3. Write your Solidity code in the editor

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-4.webp)

    The code of the contract above is the following:

    ???- "code Counter.sol"
        
        ```solidity
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        contract Counter {
            int256 private count;

            function increment() public {
                count += 1;
            }

            function decrement() public {
                count -= 1;
            }

            function getCount() public view returns (int256) {
                return count;
            }
        }
        ```

## Compiling Your Contract

1. To compile your contract, you need to

    1. Navigate to the Solidity Compiler tab (third icon in the left sidebar)
    2. Click "Compile" or use `Ctrl+S`

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-5.webp)
    
        !!! note
            Compilation errors and warnings appear in the terminal panel at the bottom of the screen

After compiling your contract, you can navigate to the **File Explorer** tab (first icon in the left sidebar) and check that the **artifact** folder exists and the **Counter_metadata.json** and **Counter.json** files have been created as well.

![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-6.webp)

## Deploying Contracts

1. To deploy your contract, you need to

    1. Navigate to the **Deploy & Run Transactions** tab (fourth icon in the left sidebar)
    2. Select your deployment environment, in this case **Westend Testnet - MetaMask**
    3. Click in the **Deploy and Confirm** button

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-7.webp)


### Deploying to Westend

1. Select "Westend Testnet - MetaMask" from the environment dropdown
2. Allow Remix to connect with MetaMask when prompted
3. Verify your account details in the "ACCOUNT" section
4. Click "Deploy" and confirm the transaction in MetaMask
5. Monitor deployment status in the terminal

!!! warning
    Always ensure you're on the correct network in MetaMask before deploying

## Interacting with Contracts


Once deployed, your contract appears in the "Deployed Contracts" section:

1. Expand the contract to view available methods
2. Pin important contracts to keep them visible:
    * Click the pin icon
    * Contract moves to "Pinned Contracts"
    * Address and ABI are saved automatically

### Using Contract Methods

#### Read Operations

1. Click the method button
2. Results display immediately
3. No gas fees required

#### Write Operations

1. Enter required parameters
2. Click the method button
3. Confirm transaction in MetaMask
4. Wait for confirmation

### Loading Existing Contracts

To interact with already deployed contracts:

1. Copy the contract's address
2. Click "At Address" in the Deploy panel
3. Paste the address and click
4. Contract interface will appear


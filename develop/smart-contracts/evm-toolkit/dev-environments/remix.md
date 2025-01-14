---
title: Using Remix IDE
description: Explore the process of smart contract development and deployment on Asset Hub using Remix IDE, a visual IDE for blockchain developers.
---

# Remix IDE

## Overview

Remix IDE is a powerful browser-based development environment for smart contracts. This guide will walk you through the essential of the Polkadot Remix IDE, to understand the processes of compiling, developing and deploying smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- A web browser with [MetaMask](https://metamask.io/) extension installed
- Basic understanding of Solidity programming
- Some test tokens for transaction fees (you can get them from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank})

## Accessing Remix IDE

1. Visit [https://remix.polkadot.io/](https://remix.polkadot.io/){target=\_blank}
2. The interface will load with a default workspace containing sample contracts
3. The main interface consists of:
    * File Explorer (left panel)
    * Code Editor (center)
    * Compilation/Deployment panels (right)

## Creating and Compiling Contracts

### Creating a New Contract

1. Click the '+' button in the File Explorer
2. Name your file with a `.sol` extension
3. Write your Solidity code in the editor

### Compiling Your Contract

1. Navigate to the Solidity Compiler tab (third icon in the left sidebar)
2. Select an appropriate compiler version
3. Configure compilation settings:
    * Enable optimization if needed
    * Select EVM version
    * Adjust metadata settings
4. Click "Compile" or use `Ctrl+S`

!!! note
    Compilation errors and warnings appear in the terminal panel at the bottom of the screen

## Deploying Contracts

### Environment Setup

1. Open the "Deploy & Run Transactions" tab
2. Select your deployment environment:
    * JavaScript VM (local testing)
    * Injected Provider - MetaMask (for testnet/mainnet)
    * Custom Network

### Deploying to Westend

1. Select "Westend Testnet - MetaMask" from the environment dropdown
2. Allow Remix to connect with MetaMask when prompted
3. Verify your account details in the "ACCOUNT" section
4. Click "Deploy" and confirm the transaction in MetaMask
5. Monitor deployment status in the terminal

!!! warning
    Always ensure you're on the correct network in MetaMask before deploying

## Interacting with Contracts

### Managing Deployed Contracts

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


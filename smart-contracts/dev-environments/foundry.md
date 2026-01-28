---
title: Use Foundry with Polkadot Hub
description: Learn how to create, compile, test, deploy, and verify smart contracts on Polkadot Hub using Foundry, a fast and portable toolkit for Ethereum application development.
categories: Smart Contracts, Tooling
---

# Foundry

## Introduction

[Foundry](https://book.getfoundry.sh/){target=\_blank} is a blazing fast, portable, and modular toolkit for Ethereum application development written in Rust. It consists of:

- **Forge**: Command-line tool to test, build, and deploy smart contracts
- **Cast**: Swiss army knife for interacting with contracts, sending transactions, and getting chain data
- **Anvil**: Local Ethereum node for development and testing
- **Chisel**: Solidity REPL for testing code snippets

This page demonstrates how to set up Foundry to work with Polkadot Hub, including installation, compilation, deployment, and verification.

!!! tip "Native Polkadot Support"
    Foundry's nightly build includes native support for Polkadot chains, allowing you to use `--chain polkadotTestnet`, `--chain polkadot`, or `--chain kusama` without manually specifying RPC URLs. This makes development more streamlined and reduces configuration.

## Prerequisites

Before setting up Foundry, make sure you have:

- A Unix-based operating system (Linux or macOS) or Windows with [WSL](https://learn.microsoft.com/en-us/windows/wsl/install){target=\_blank}
- [Git](https://git-scm.com/){target=\_blank} installed
- A funded account on Polkadot Hub (see the [Connect](/smart-contracts/connect/){target=\_blank} guide to get testnet tokens)

## Install Foundry

!!! warning "Use Nightly Build"
    To use Foundry with Polkadot Hub, you must install the **nightly build** instead of the stable release. The nightly build includes features required for contract verification on Polkadot Hub.

To install the Foundry nightly build, run:

```bash
curl -L https://foundry.paradigm.xyz | bash
```

This installs `foundryup`, the Foundry toolchain installer. Then, run:

```bash
foundryup --version nightly
```

This installs the latest nightly versions of `forge`, `cast`, `anvil`, and `chisel`.

To verify the installation:

```bash
forge --version
```

You should see output indicating the nightly version, similar to:

```text
forge Version: 1.6.0-nightly
Commit SHA: 8b4f318e6a3e83a06dc4e989b9aba87894dca88e
Build Timestamp: 2026-01-28T06:06:35.086737000Z (1769580395)
Build Profile: dist
```

## Initialize a Foundry Project

Create a new Foundry project:

```bash
forge init my-foundry-project
cd my-foundry-project
```

This creates a new directory with the following structure:

- **`src/`**: Contains your Solidity smart contracts
- **`script/`**: Holds deployment scripts
- **`test/`**: Contains test files written in Solidity
- **`lib/`**: Stores project dependencies
- **`foundry.toml`**: Configuration file for Foundry settings

A sample `Counter.sol` contract will be created in the `src/` directory along with a corresponding test file.

## Compile Contracts

To compile your contracts, run:

```bash
forge build
```

Forge compiles all contracts in the `src/` directory and outputs the artifacts to the `out/` directory. You'll see output similar to:

```text
[⠊] Compiling...
[⠒] Compiling 3 files with Solc 0.8.28
[⠢] Solc 0.8.28 finished in 1.23s
Compiler run successful!
```

## Configure Foundry for Polkadot Hub

Foundry's nightly build includes native support for Polkadot chains. The nightly build includes `polkadotTestnet`, `polkadot`, and `kusama` as recognized chains with default RPC endpoints:

With the nightly build configuration, you can use `--chain polkadotTestnet` in your commands without specifying the RPC URL explicitly.

### Available Networks and RPC Endpoints

Foundry's nightly build supports three Polkadot chains:

| Network | Chain Flag | Built-in RPC Endpoint | Chain ID |
|:---------:|:-----------:|:----------------------:|:----------:|
| **Polkadot TestNet** | `--chain polkadotTestnet` | `https://services.polkadothub-rpc.com/testnet` | `420420417` |
| **Polkadot** | `--chain polkadot` | `https://services.polkadothub-rpc.com/mainnet` | `420420419` |
| **Kusama** | `--chain kusama` | `https://kusama-asset-hub-eth-rpc.polkadot.io` | `420420418` |

## Deploy a Contract

### Set Up Environment Variables

Create a `.env` file in your project root (make sure to add it to `.gitignore`):

```bash
PRIVATE_KEY=INSERT_PRIVATE_KEY_HERE
```

!!! warning "Never commit your private key"
    Replace `INSERT_PRIVATE_KEY_HERE` with your actual private key. Always keep your `.env` file in `.gitignore` to prevent accidentally committing sensitive information to version control.

Load the environment variables:

```bash
source .env
```

### Deploy Using Forge

To deploy a contract to Polkadot Hub TestNet:

```bash
forge create src/Counter.sol:Counter \
    --chain polkadotTestnet \
    --private-key $PRIVATE_KEY
```

You'll see output with the deployed contract address:

```text
Deployer: 0xYourAddress...
Deployed to: 0xContractAddress...
Transaction hash: 0xTransactionHash...
```

### Deploy Using Scripts

For more complex deployments, create a deployment script in the `script/` directory:

```solidity title='script/Counter.s.sol'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract CounterScript is Script {
    function run() external {
        // Get the deployer's private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        Counter counter = new Counter();
        
        // Stop broadcasting
        vm.stopBroadcast();
    }
}
```

Run the deployment script:

```bash
forge script script/Counter.s.sol:CounterScript \
    --chain polkadotTestnet \
    --broadcast
```

The `--broadcast` flag tells Forge to submit the transactions to the network.

## Verify a Contract

To verify your deployed contract on Polkadot Hub, use the nightly build's verification feature with the Routescan verifier.

### Basic Verification

```bash
forge verify-contract <CONTRACT_ADDRESS> \
    src/Counter.sol:Counter \
    --chain polkadotTestnet \
    --verifier-url https://polkadot-testnet.routescan.io/api \
    --verifier blockscout
```

Replace `<CONTRACT_ADDRESS>` with your deployed contract's address.

### Verification with Constructor Arguments

For contracts with constructor arguments:

```bash
forge verify-contract <CONTRACT_ADDRESS> \
    src/MyContract.sol:MyContract \
    --chain polkadotTestnet \
    --verifier-url https://polkadot-testnet.routescan.io/api \
    --verifier blockscout \
    --constructor-args $(cast abi-encode "constructor(uint256,address)" 42 0xYourAddress)
```

Upon successful verification, you'll receive a link to view your verified contract on the block explorer:

```text
Submitting verification for contract at 0xYourContractAddress...
Contract successfully verified!
View on explorer: https://blockscout-testnet.polkadot.io/address/0xYourContractAddress
```

## Interact with Contracts

### Using Cast

Cast is a powerful command-line tool for interacting with deployed contracts.

#### Read from a Contract

```bash
cast call <CONTRACT_ADDRESS> "number()(uint256)" \
    --chain polkadotTestnet
```

#### Write to a Contract

```bash
cast send <CONTRACT_ADDRESS> "setNumber(uint256)" 42 \
    --chain polkadotTestnet \
    --private-key $PRIVATE_KEY
```

#### Get Account Balance

```bash
cast balance <YOUR_ADDRESS> --chain polkadotTestnet
```

### Using Forge Scripts

For more complex interactions, create scripts in the `script/` directory that can read and write contract state programmatically.

## Run Tests

Foundry uses Solidity for writing tests, allowing you to test your contracts in the same language they're written in:

```bash
forge test
```

For verbose output showing gas usage and detailed logs:

```bash
forge test -vvv
```

Run specific tests:

```bash
forge test --match-test testIncrement
```

Run tests with gas reporting:

```bash
forge test --gas-report
```

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/){target=\_blank} - Comprehensive Foundry documentation
- [Forge Documentation](https://book.getfoundry.sh/forge/){target=\_blank} - Detailed guide to the Forge tool
- [Cast Documentation](https://book.getfoundry.sh/cast/){target=\_blank} - Learn about Cast commands
- [Foundry GitHub](https://github.com/foundry-rs/foundry){target=\_blank} - Source code and issue tracker

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy a Basic Contract__

    ---

    Ready to start using Foundry? Learn how to compile, test, and deploy a basic contract.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to Polkadot Hub using smart contract tools.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying an NFT to Polkadot Hub using smart contract development tools.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-hardhat/)

-   <span class="badge reference">Reference</span> __Connect to Polkadot Hub__

    ---

    View network details and learn how to connect your development tools to Polkadot Hub.

    [:octicons-arrow-right-24: View Network Details](/smart-contracts/connect/)

</div>

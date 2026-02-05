---
title: Use Foundry with Polkadot Hub
description: Learn how to create, compile, test, deploy, and verify smart contracts on Polkadot Hub using Foundry, a fast and portable Ethereum toolkit.
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
    Foundry's nightly build includes native support for Polkadot chains, allowing you to use `--chain polkadot-testnet`, `--chain polkadot`, or `--chain kusama` without manually specifying RPC URLs. This makes development more streamlined and reduces configuration.

## Prerequisites

Before setting up Foundry, make sure you have:

- A Unix-based operating system (Linux or macOS) or Windows with [WSL](https://learn.microsoft.com/en-us/windows/wsl/install){target=\_blank}
- [Git](https://git-scm.com/){target=\_blank} installed
- A funded account on Polkadot Hub (see the [Connect to Polkadot](/smart-contracts/connect/){target=\_blank} guide to get TestNet tokens)

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

<div class="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>forge --version</span>
    <br>
    <span data-ty>forge Version: 1.6.0-nightly</span>
    <span data-ty>Commit SHA: 8b4f318e6a3e83a06dc4e989b9aba87894dca88e</span>
    <span data-ty>Build Timestamp: 2026-01-28T06:06:35.086737000Z (1769580395)</span>
    <span data-ty>Build Profile: dist</span>
</div>

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

You should see output similar to:

<div class="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>forge build</span>
    <br>
    <span data-ty>[⠊] Compiling...</span>
    <span data-ty>[⠒] Compiling 3 files with Solc 0.8.28</span>
    <span data-ty>[⠢] Solc 0.8.28 finished in 1.23s</span>
    <span data-ty>Compiler run successful!</span>
</div>

Forge compiles all contracts in the `src/` directory and outputs the artifacts to the `out/` directory.

## Configure Foundry for Polkadot Hub

Foundry's nightly build includes native support for Polkadot chains with `polkadot-testnet`, `polkadot`, and `kusama` as recognized chains with default RPC endpoints.

Create or modify your `foundry.toml` file:

```toml title='foundry.toml'
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.28"

[etherscan]
polkadot-testnet = { key = "verifyContract", url = "https://api.routescan.io/v2/network/testnet/evm/420420417/etherscan" }
```

With this configuration, you can use `--chain polkadot-testnet` in your commands without specifying the RPC URL explicitly.

!!! note
    The `[etherscan]` section is used for contract verification using the Routescan API.

### Available Networks and RPC Endpoints

Foundry's nightly build supports three Polkadot chains:

|       Network        |         Chain Flag         |             Built-in RPC Endpoint              |  Chain ID   |
| :------------------: | :------------------------: | :--------------------------------------------: | :---------: |
| **Polkadot TestNet** | `--chain polkadot-testnet` | `https://services.polkadothub-rpc.com/testnet` | `420420417` |
|     **Polkadot**     |     `--chain polkadot`     | `https://services.polkadothub-rpc.com/mainnet` | `420420419` |
|      **Kusama**      |      `--chain kusama`      | `https://kusama-asset-hub-eth-rpc.polkadot.io` | `420420418` |

## Deploy a Contract

### Set Up Environment Variables

Create a `.env` file in your project root (make sure to add it to `.gitignore`):

```text title='.env'
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
    --chain polkadot-testnet \
    --rpc-url https://services.polkadothub-rpc.com/testnet \
    --private-key $PRIVATE_KEY \
    --broadcast
```

You'll see output with the deployed contract address:

<div class="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>forge create src/Counter.sol:Counter \
    <br>
    <span data-ty>--chain polkadot-testnet</span>
    <span data-ty>--rpc-url https://services.polkadothub-rpc.com/testnet</span>
    <span data-ty>--private-key $PRIVATE_KEY</span>
    <span data-ty>--broadcast</span>
    <span data-ty>[⠊] Compiling...</span>
    <span data-ty>No files changed, compilation skipped</span>
    <span data-ty>Deployer: 0x3427D90f1Ee5c5D3627c2EBb37f90393526066fd</span>
    <span data-ty>Deployed to: 0xF1fbAf96A16458A512A33b31c4414C4a81f50EF4</span>
    <span data-ty>Transaction hash: 0x1cba7b61c771192b297024766bed8b6e607f218e12899739fe61a3eed2690779</span>
</div>

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
    --chain polkadot-testnet \
    --broadcast
```

The `--broadcast` flag tells Forge to submit the transactions to the network.

## Verify a Contract

To verify your deployed contract on Polkadot Hub, use the verification feature with the Polkadot Hub explorer verifier.

### Basic Verification

```bash
forge verify-contract INSERT_CONTRACT_ADDRESS \
    src/Counter.sol:Counter \
    --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/420420417/etherscan' \
    --etherscan-api-key "verifyContract" \
    --chain polkadot-testnet
```

Replace `INSERT_CONTRACT_ADDRESS` with your deployed contract's address.

The `--verifier-url` is the URL of the Polkadot Hub explorer verifier. The Routescan API v2 structure is `https://api.routescan.io/v2/network/{testnet|mainnet}/evm/{CHAIN_ID}/etherscan`.

You should see output similar to:

<div class="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>forge verify-contract 0xF1fbAf96A16458A512A33b31c4414C4a81f50EF4 \
    src/Counter.sol:Counter \</span>
    <br>
    <span data-ty>--verifier-url 'https://api.routescan.io/v2/network/testnet/evm/420420417/etherscan'</span>
    <span data-ty>--etherscan-api-key "verifyContract"</span>
    <span data-ty>--chain polkadot-testnet</span>
    <span data-ty>Start verifying contract `0xF1fbAf96A16458A512A33b31c4414C4a81f50EF4` deployed on polkadot-testnet</span>
    <span data-ty>Submitting verification for [src/Counter.sol:Counter] 0xF1fbAf96A16458A512A33b31c4414C4a81f50EF4.</span>
    <span data-ty>Submitted contract for verification:</span>
    <span data-ty>	Response: `OK`</span>
    <span data-ty>	GUID: `71d14e5b-eda1-5e85-98c5-2faf93306526`</span>
    <span data-ty>	URL: https://blockscout-testnet.polkadot.io/address/0xf1fbaf96a16458a512a33b31c4414c4a81f50ef4</span>
</div>

### Verification with Constructor Arguments

For contracts with constructor arguments:

```bash
forge verify-contract INSERT_CONTRACT_ADDRESS \
    src/Counter.sol:Counter \
    --verifier-url 'https://api.routescan.io/v2/network/testnet/evm/420420417/etherscan' \
    --etherscan-api-key "verifyContract" \
    --chain polkadot-testnet \
    --constructor-args $(cast abi-encode "constructor(uint256,address)" 42 INSERT_DEPLOYER_ADDRESS)
```

Replace `INSERT_CONTRACT_ADDRESS` with your deployed contract's address.

## Interact with Contracts

### Using Cast

Cast is a powerful command-line tool for interacting with deployed contracts.

#### Read from a Contract

```bash
cast call INSERT_CONTRACT_ADDRESS "number()(uint256)" \
    --chain polkadot-testnet
```

#### Write to a Contract

```bash
cast send INSERT_CONTRACT_ADDRESS "setNumber(uint256)" 42 \
    --chain polkadot-testnet \
    --private-key $PRIVATE_KEY
```

#### Get Account Balance

```bash
cast balance <INSERT_ACCOUNT_ADDRESS> --chain polkadot-testnet
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

- **[Foundry Book](https://book.getfoundry.sh/){target=\_blank}**: Comprehensive Foundry documentation
- **[Forge Documentation](https://book.getfoundry.sh/forge/){target=\_blank}**: Detailed guide to the Forge tool
- **[Cast Documentation](https://book.getfoundry.sh/cast/){target=\_blank}**: Learn about Cast commands
- **[Foundry GitHub](https://github.com/foundry-rs/foundry){target=\_blank}**: Source code and issue tracker

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge reference">Reference</span> __Connect to Polkadot Hub__

    ---

    View network details and learn how to connect your development tools to Polkadot Hub.

    [:octicons-arrow-right-24: View Network Details](/smart-contracts/connect/)

-   <span class="badge guide">Guide</span> __For Ethereum Developers__

    ---

    Learn how smart contracts work on Polkadot Hub.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/for-eth-devs/accounts/)

</div>

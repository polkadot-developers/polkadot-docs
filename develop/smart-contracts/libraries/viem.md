---
title: viem for Asset Hub Smart Contracts
description: viem is a TypeScript library for interacting with EVM-compatible chains. This guide covers using viem to deploy and interact with smart contracts on Asset Hub.
---

# viem

## Introduction

[viem](https://viem.sh/){target=\_blank} is a lightweight TypeScript library designed for interacting with EVM-compatible blockchains. This comprehensive guide will walk you through using viem to interact with and deploy smart contracts to Asset Hub.

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** - v22.13.1 or later, check the [Node.js installation guide](https://nodejs.org/en/download/current/){target=\_blank}
- **npm** - v6.13.4 or later (comes bundled with Node.js)
- **Solidity** - this guide uses Solidity `^0.8.9` for smart contract development

## Set Up the Project

First, create a new folder and initialize your project:

```bash
mkdir viem-project
cd viem-project
npm init -y
```

## Install Dependencies

Install viem along with other necessary dependencies, including [@parity/revive](https://www.npmjs.com/package/@parity/revive){target=\_blank}, which enables to compile smart contracts to [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design/#polkavm){target=\_blank} bytecode:

```bash
# Install viem and Revive
npm install viem @parity/revive

# Install TypeScript and development dependencies
npm install --save-dev typescript ts-node @types/node
```

## Init Project

Init a TypeScript project by running the following command:

```bash
npx tsc --init
```

Add the following scripts to your `package.json` file to enable running TypeScript files:

```json
{
    "scripts": {
        "client": "ts-node src/createClient.ts",
        "compile": "ts-node src/compile.ts",
        "deploy": "ts-node src/deploy.ts",
        "interact": "ts-node src/interact.ts"
    },
}
```

Create a directory for your TypeScript source files:

```bash
mkdir src
```

## Set Up the Chain Configuration

The first step is to set up the chain configuration. Create a new file at `src/chainConfig.ts`:

```typescript title="chainConfig.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/chainConfig.ts'
```

Ensure to replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, `INSERT_CHAIN_NAME`, `INSERT_NETWORK_NAME`, `INSERT_CHAIN_DECIMALS`, `INSERT_CURRENCY_NAME`, and `INSERT_CURRENCY_SYMBOL` with the proper values. Check the [Connect to Asset Hub](/develop/smart-contracts/connect-to-asset-hub){target=\_blank} page for more information on the possible values.

## Set Up the viem Client

To interact with the chain, you need to create a client that is used solely for reading data. To accomplish this, create a new file at `src/createClient.ts`:

```typescript title="createClient.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/createClient.ts'
```

After setting up the [Public Client](https://viem.sh/docs/clients/public#public-client){target=\_blank}, you can begin querying the blockchain. Here's an example of fetching the latest block number:

??? code "Fetch Last Block code"

    ```js title="fetchLastBlock.ts"
    --8<-- 'code/develop/smart-contracts/libraries/viem/fetchLastBlock.ts'
    ```

## Set Up a Wallet

In case you need to sign transactions, you will need to instantiate a [Wallet Client](https://viem.sh/docs/clients/wallet#wallet-client){target=\_blank} object within your project. To do so, create `src/createWallet.ts`:

```typescript title="createWallet.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/createWallet.ts'
```

!!!note
    The wallet you import with your private key must have sufficient funds to pay for transaction fees when deploying contracts or interacting with them. Make sure to fund your wallet with the appropriate native tokens for the network you're connecting to.

## Sample Smart Contract

This example demonstrates compiling a `Storage.sol` Solidity contract for deployment to Asset Hub. The contract's functionality stores a number and permits users to update it with a new value.

```bash
mkdir contracts artifacts
```

You can use the following contract to interact with the blockchain. Paste the following contract in `contracts/Storage.sol`:

```solidity title="Storage.sol"
--8<-- 'code/develop/smart-contracts/libraries/viem/Storage.sol'
```

## Compile the Contract

Create a new file at `src/compile.ts` for handling contract compilation:

```typescript title="compile.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/compile.ts'
```

To compile your contract:

```bash
npm run compile
```

After executing this script, you will see the compilation results including the generated `Storage.json` (containing the contract's ABI) and `Storage.polkavm` (containing the compiled bytecode) files in the `artifacts` folder. These files contain all the necessary information for deploying and interacting with your smart contract on Asset Hub.

## Deploy the Contract

Create a new file at `src/deploy.ts` for handling contract deployment:

```typescript title="deploy.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/deploy.ts'
```

Ensure to replace `INSERT_PRIVATE_KEY` with the proper value. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

!!! warning
    Never commit or share your private key. Exposed keys can lead to immediate theft of all associated funds. Use environment variables instead.

To deploy, run the following command:

```bash
npm run deploy
```

If everything is successful, you will see the address of your deployed contract displayed in the terminal. This address is unique to your contract on the network you defined in the chain configuration, and you'll need it for any future interactions with your contract.

## Interact with the Contract

Create a new file at `src/interact.ts` for interacting with your deployed contract:

```typescript title="interact.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/interact.ts'
```

Ensure to replace `INSERT_PRIVATE_KEY` and `INSERT_CONTRACT_ADDRESS` with the proper values.

To interact with the contract:

```bash
npm run interact
```

Following a successful interaction, you will see the stored value before and after the transaction. The output will show the initial stored number (0 if you haven't modified it yet), confirm when the transaction to set the number to 42 is complete, and then display the updated stored number value. This demonstrates both reading from and writing to your smart contract.

## Complete Project Structure

After completing this guide, your project directory should have the following structure. This overview helps you verify that you've created all the necessary files in their correct locations for your viem integration with Asset Hub:

```text
viem-project/
├── package.json
├── tsconfig.json
├── src/
│   ├── chainConfig.ts
│   ├── createClient.ts
│   ├── createWallet.ts
│   ├── compile.ts
│   ├── deploy.ts
│   └── interact.ts
├── contracts/
│   └── Storage.sol
└── artifacts/
    ├── Storage.json
    └── Storage.polkavm
```

## Where to Go Next

Now that you have the foundation for using viem with Asset Hub, consider exploring:

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Advanced viem Features__

    ---
    Explore viem's documentation:
    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Multi call](https://viem.sh/docs/contract/multicall#multicall){target=\_blank}</li>

    <li>[:octicons-arrow-right-24: Batch transactions](https://viem.sh/docs/clients/transports/http#batch-json-rpc){target=\_blank}</li>

    <li>[:octicons-arrow-right-24: Custom actions](https://viem.sh/docs/clients/custom#extending-with-actions-or-configuration){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Test Frameworks__

    ---

    Integrate viem with the following frameworks for comprehensive testing:
    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Hardhat](https://hardhat.org/){target=\_blank}</li>

    <li>[:octicons-arrow-right-24: Foundry](https://book.getfoundry.sh/){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Event Handling__

    ---

    Learn how to subscribe to and process contract events:
    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Event subscription](https://viem.sh/docs/actions/public/watchEvent#watchevent){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Building dApps__

    ---

    Combine viem the following technologies to create full-stack applications:
    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Next.js](https://nextjs.org/docs){target=\_blank}</li>

    <li>[:octicons-arrow-right-24: Node.js](https://nodejs.org/en){target=\_blank}</li>
    </ul>

</div>
---
title: viem for Asset Hub Smart Contracts
description: viem is a TypeScript library for interacting with EVM-compatible chains. This guide covers using viem to deploy and interact with smart contracts on Asset Hub.
---

# viem

## Introduction

[viem](https://viem.sh/){target=\_blank} is a lightweight TypeScript library designed for interacting with EVM-compatible blockchains. This comprehensive guide will walk you through using viem to interact with and deploy smart contracts to Asset Hub.

## Set Up the Project

First, create a new folder and initialize your project:

```bash
mkdir viem-project
cd viem-project
npm init -y
```

## Install Dependencies

Install viem along with other necessary dependencies, including [@parity/revive](/polkadot-protocol/smart-contract-basics/polkavm-design/){target=\_blank}, which enables Ethereum-style transactions on Polkadot SDK-based chains:

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

## Set Up the viem Client

To interact with the chain, you need to create a client that is used solely for reading data. To accomplish this, create a new file at `src/createClient.ts`:

```typescript title="createClient.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/createClient.ts'
```

Ensure to replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, `INSERT_CHAIN_NAME`, `INSERT_NETWORK_NAME`, `INSERT_CHAIN_DECIMALS`, `INSERT_CURRENCY_NAME`, and `INSERT_CURRENCY_SYMBOL` with the proper values.

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

Ensure to replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, `INSERT_CHAIN_NAME`, `INSERT_NETWORK_NAME`, `INSERT_CHAIN_DECIMALS`, `INSERT_CURRENCY_NAME`, and `INSERT_CURRENCY_SYMBOL` with the proper values.

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

## Deploy the Contract

Create a new file at `src/deploy.ts` for handling contract deployment:

```typescript title="deploy.ts"
--8<-- 'code/develop/smart-contracts/libraries/viem/deploy.ts'
```

Ensure to replace `INSERT_PRIVATE_KEY` with the proper value.

To deploy:

```bash
npm run deploy
```

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
---
title: Wagmi for Polkadot Hub Smart Contracts
description: Learn how to use Wagmi React Hooks to fetch and interact with smart contracts on Polkadot Hub for seamless dApp integration.
---

# Wagmi

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

[Wagmi](https://wagmi.sh/){target=\_blank} is a collection of [React Hooks](https://wagmi.sh/react/api/hooks){target=\_blank} for interacting with Ethereum-compatible blockchains, focusing on developer experience, feature richness, and reliability.

This guide demonstrates how to use Wagmi to interact with and deploy smart contracts to Polkadot Hub, providing a seamless frontend integration for your dApps.

## Set Up the Project

To start working with Wagmi, create a new React project and initialize it by running the following commands in your terminal:

```bash
# Create a new React project using Next.js
npx create-next-app@latest wagmi-asset-hub
cd wagmi-asset-hub
```

## Install Dependencies

Install Wagmi and its peer dependencies:

```bash
# Install Wagmi and its dependencies
npm install wagmi viem @tanstack/react-query
```

## Configure Wagmi for Polkadot Hub

Create a configuration file to initialize Wagmi with Polkadot Hub. In your project, create a file named `src/lib/wagmi.ts` and add the code below. Be sure to replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, `INSERT_CHAIN_NAME`, `INSERT_NETWORK_NAME`, `INSERT_CHAIN_DECIMALS`, `INSERT_CURRENCY_NAME`, and `INSERT_CURRENCY_SYMBOL` with your specific values.

```typescript title="src/lib/wagmi.ts"
--8<-- 'code/develop/smart-contracts/libraries/wagmi/wagmi.ts'
```

??? code "Example Polkadot Hub TestNet Configuration"

    ```typescript title="src/lib/wagmi.ts"
    --8<-- 'code/develop/smart-contracts/libraries/wagmi/wagmi-testnet.ts'
    ```

## Set Up the Wagmi Provider

To enable Wagmi in your React application, you need to wrap your app with the [`WagmiProvider`](https://wagmi.sh/react/api/WagmiProvider#wagmiprovider){target=\_blank}. Update your `app/layout.tsx` file (for Next.js app router) with the following code:

```typescript title="app/layout.tsx"
--8<-- 'code/develop/smart-contracts/libraries/wagmi/layout.tsx'
```

!!!note
    If you are using a Next.js pages router, you should modify the `src/pages/_app.tsx` instead.

## Connect a Wallet

Create a component to connect wallets to your dApp. Create a file named `app/components/ConnectWallet.tsx`:

```typescript title="app/components/ConnectWallet.tsx"
--8<-- 'code/develop/smart-contracts/libraries/wagmi/ConnectWallet.tsx'
```

This component uses the following React hooks:

- [**`useConnect`**](https://wagmi.sh/react/api/hooks/useConnect#useconnect){target=\_blank} - provides functions and state for connecting the user's wallet to your dApp. The `connect` function initiates the connection flow with the specified connector
- [**`useDisconnect`**](https://wagmi.sh/react/api/hooks/useDisconnect#usedisconnect){target=\_blank} - provides a function to disconnect the currently connected wallet
- [**`useAccount`**](https://wagmi.sh/react/api/hooks/useAccount#useaccount){target=\_blank} - returns data about the connected account, including the address and connection status

## Fetch Blockchain Data

Wagmi provides various hooks to fetch blockchain data. Here's an example component that demonstrates some of these hooks:

```typescript title="app/components/BlockchainInfo.tsx"
--8<-- 'code/develop/smart-contracts/libraries/wagmi/BlockchainInfo.tsx'
```

This component uses the following React hooks:

- [**`useBlockNumber`**](https://wagmi.sh/react/api/hooks/useBlockNumber#useBlockNumber){target=\_blank} - fetches the current block number of the connected chain. The `watch` parameter enables real-time updates when new blocks are mined
- [**`useBalance`**](https://wagmi.sh/react/api/hooks/useBalance#useBalance){target=\_blank} - retrieves the native token balance for a specified address, including value, symbol, and decimals information

## Interact with Deployed Contract

This guide uses a simple Storage contract already deployed to the Polkadot Hub TestNet (`0x58053f0e8ede1a47a1af53e43368cd04ddcaf66f`). The code of that contract is:

??? code "Storage.sol"

    ```solidity title="Storage.sol"
    --8<-- 'code/develop/smart-contracts/libraries/wagmi/Storage.sol'
    ```

Create a component to interact with your deployed contract. Create a file named `app/components/StorageContract.tsx`:

```typescript title="app/components/StorageContract.tsx"
--8<-- 'code/develop/smart-contracts/libraries/wagmi/StorageContract.tsx'
```

This component demonstrates how to interact with a smart contract using Wagmi's hooks:

- [**`useReadContract`**](https://wagmi.sh/react/api/hooks/useReadContract#useReadContract){target=\_blank} - calls a read-only function on your smart contract to retrieve data without modifying the blockchain state
- [**`useWriteContract`**](https://wagmi.sh/react/api/hooks/useWriteContract#useWriteContract){target=\_blank} - calls a state-modifying function on your smart contract, which requires a transaction to be signed and sent
- [**`useWaitForTransactionReceipt`**](https://wagmi.sh/react/api/hooks/useWaitForTransactionReceipt#useWaitForTransactionReceipt){target=\_blank} - tracks the status of a transaction after it's been submitted, allowing you to know when it's been confirmed

The component also includes proper state handling to:

- Show the current value stored in the contract
- Allow users to input a new value
- Display transaction status (pending, confirming, or completed)
- Handle errors
- Provide feedback when a transaction is successful

## Integrate Components

Update your main page to combine all the components. Create or update the file `src/app/page.tsx`:

```typescript title="src/app/page.tsx"
--8<-- 'code/develop/smart-contracts/libraries/wagmi/page.tsx'
```

## Where to Go Next

Now that you have the foundational knowledge to use Wagmi with Polkadot Hub, consider exploring:

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Advanced Wagmi__

    ---

    Explore Wagmi's advanced features:

    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Watch Contract Events](https://wagmi.sh/core/api/actions/watchContractEvent#eventname){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Different Transports](https://wagmi.sh/react/api/transports){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Actions](https://wagmi.sh/react/api/actions){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Wallet Integration__

    ---

    Connect your dApp with popular wallet providers:

    <ul class="card-list">
    <li>[:octicons-arrow-right-24: MetaMask](https://wagmi.sh/core/api/connectors/metaMask){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: WalletConnect](https://wagmi.sh/core/api/connectors/walletConnect){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Coinbase Wallet](https://wagmi.sh/core/api/connectors/coinbaseWallet){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Testing & Development__

    ---

    Enhance your development workflow:

    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Test Suite](https://wagmi.sh/dev/contributing#_6-running-the-test-suite){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Dev Playground](https://wagmi.sh/dev/contributing#_5-running-the-dev-playgrounds){target=\_blank}</li>
    </ul>
</div>
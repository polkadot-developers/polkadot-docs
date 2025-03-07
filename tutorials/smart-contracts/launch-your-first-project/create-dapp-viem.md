---
title: Create a dApp With Viem
description: Learn how to build a decentralized application on Asset Hub using Viem and Next.js by creating a simple dApp that interacts with a smart contract.
---

# Create a dApp with Viem

Decentralized applications (dApps) are a key component of the Web3 ecosystem, enabling developers to build applications that communicate directly with blockchain networks. Asset Hub, a blockchain with smart contract support, serves as a robust platform for deploying and interacting with dApps.

This tutorial will guide you through building a fully functional dApp that interacts with a smart contract on Asset Hub. You'll use [Viem](https://viem.sh/) for blockchain interactions and [Next.js](https://nextjs.org/) for the frontend. By the end, you'll have a dApp that lets users connect their wallets, retrieve on-chain data, and execute transactions.

## Prerequisites

Before getting started, ensure you have the following:

- [Node.js](https://nodejs.org/en) v16 or later installed on your system
- A crypto wallet (such as MetaMask) funded with test tokens. Refer to the [Connect to Asset Hub](/develop/smart-contracts/connect-to-asset-hub) guide for more details
- A basic understanding of React and JavaScript
- Some familiarity with blockchain fundamentals and Solidity (useful but not required)

## Project Overview

This dApp will interact with a basic Storage contract. For a step-by-step guide on creating this contract, refer to the [Create Contracts](/tutorials/smart-contracts/launch-your-first-project/create-contracts) tutorial. The contract allows:

- Retrieving a stored number from the blockchain
- Updating the stored number with a new value

The contract has already been deployed on Westend Asset Hub for testing at: `0xabBd46Ef74b88E8B1CDa49BeFb5057710443Fd29`

Below is a high-level overview of what you'll be building:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/create-dapp-viem-1.webp)

Your project directory will be organized as follows:

```bash
viem-dapp
├── abis
│   └── Storage.json
└── app
    ├── components
    │   ├── ReadContract.tsx
    │   ├── WalletConnect.tsx
    │   └── WriteContract.tsx
    ├── favicon.ico
    ├── globals.css
    ├── layout.tsx
    ├── page.tsx
    └── utils
        ├── contract.ts
        └── viem.ts
```

## Set Up the Project

Create a new Next.js project:

```bash
npx create-next-app viem-dapp --typescript
cd viem-dapp
```

## Install Dependencies
Install viem and related packages:

```bash
npm install viem
npm install --save-dev typescript @types/node
```

## Connect to Asset Hub

To interact with Asset Hub (Westend Asset Hub in this case), you need to set up a [Public Client](https://viem.sh/docs/clients/public#public-client) that connects to the blockchain. Create a new file called `utils/viem.ts` and add the following code:

```ts title="viem.ts"
import { createPublicClient, http, createWalletClient, custom } from 'viem'
import 'viem/window';


const transport = http('https://westend-asset-hub-eth-rpc.polkadot.io')

// Configure the Asset Hub chain
export const assetHub = {
  id: 420420421,
  name: 'Westend Asset Hub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    decimals: 18,
    name: 'WND',
    symbol: 'WND',
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
} as const

// Create a public client for reading data
export const publicClient = createPublicClient({
  chain: assetHub,
  transport
})

// Create a wallet client for signing transactions
export const getWalletClient = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return createWalletClient({
      chain: assetHub,
      transport: custom(window.ethereum),
      account,
    });
  }
  throw new Error('No Ethereum browser provider detected');
};
```

This file initializes a Viem client, providing helper functions for obtaining a Public Client and a [Wallet Client](https://viem.sh/docs/clients/wallet#wallet-client). The public client enables reading blockchain data, while the wallet client allows users to sign and send transactions. Also, note that by importing `'viem/window'` the global `window.ethereum` will typed as an `EIP1193Provider`, check the [`window` Pollifyll](https://viem.sh/docs/typescript#window-polyfill) reference for more information.

## Set Up the Smart Contract Interface

For this dApp, you'll use a simple [Storage contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts) that's already deployed in Westend Asset Hub: `0xabBd46Ef74b88E8B1CDa49BeFb5057710443Fd29`. To interact with it, you need to define the contract interface.

Create a folder called `abis` at the root of your project, then create a file named `Storage.json` and paste the corresponding ABI (Application Binary Interface) of the Storage contract. You can copy and paste the following:


??? code "Storage.sol ABI"
    ```json
    [
    {
        "inputs": [
        {
            "internalType": "uint256",
            "name": "_newNumber",
            "type": "uint256"
        }
        ],
        "name": "setNumber",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "storedNumber",
        "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
        ],
        "stateMutability": "view",
        "type": "function"
    }
    ]
    ```

Next, create a file called `utils/contract.ts`:

```ts title="contract.ts"
import { getContract } from 'viem';
import { publicClient, getWalletClient } from './viem';
import StorageABI from '../../abis/Storage.json';

export const CONTRACT_ADDRESS = '0xabBd46Ef74b88E8B1CDa49BeFb5057710443Fd29';
export const CONTRACT_ABI = StorageABI;

// Create a function to get a contract instance for reading
export const getContractInstance = () => {
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: publicClient,
  });
};

// Create a function to get a contract instance with a signer for writing
export const getSignedContract = async () => {
  const walletClient = await getWalletClient();
  return getContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    client: walletClient,
  });
};
```

This file defines the contract address, ABI, and functions to create a Viem [contract instance](https://viem.sh/docs/contract/getContract#contract-instances) for reading and writing operations. Viem's contract utilities ensure a more efficient and type-safe interaction with smart contracts.

## Create the Wallet Connection Component

Now, let's create a component to handle wallet connections. Create a new file called `components/WalletConnect.tsx`:

```typescript title="WalletConnect.tsx"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/WalletConnect.tsx"
```

This component handles connecting to the wallet, switching networks if necessary, and keeping track of the connected account. It provides a button for users to connect their wallet and displays the connected account address once connected.

To use this component in your dApp, replace the existing boilerplate in `app/page.tsx` with the following code:

```typescript title="page.tsx"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx:0:4"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx:7:20"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx:23:25"
```

## Create the Read Contract Component

Now, let's create a component to read data from the contract. Create a file called `components/ReadContract.tsx`:

```typescript title="ReadContract.tsx"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/ReadContract.tsx"
```

This component reads the `storedNumber` value from the contract and displays it to the user. It also sets up a polling interval to refresh the data periodically, ensuring that the UI stays in sync with the blockchain state.

To reflect this change in your dApp, incorporate this component into the `app/page.tsx` file.

```typescript title="page.tsx"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx:0:5"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx:7:21"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx:23:25"
```

## Create the Write Contract Component

Finally, let's create a component that allows users to update the stored number. Create a file called `components/WriteContract.tsx`:

```typescript title="WriteContract.tsx"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/WriteContract.tsx"
```

This component allows users to input a new number and send a transaction to update the value stored in the contract. It provides appropriate feedback during each step of the transaction process and handles error scenarios.

Update the `app/page.tsx` file to integrate all components:

```typescript title="page.tsx"
--8<-- "code/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/page.tsx"
```

## Run Your dApp

Now you're ready to run your dApp. From your project directory, execute:

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser, and you should see your dApp with the wallet connection button, the stored number display, and the form to update the number.

## How It Works

Let's examine how the dApp interacts with the blockchain:

1. **Wallet Connection**: 
    - The `WalletConnect` component uses the browser's Ethereum provider (MetaMask) to connect to the user's wallet
    - It handles network switching to ensure the user is connected to Asset Hub
    - Once connected, it provides the user's account address to the parent component

2. **Reading Data**:
    - The `ReadContract` component uses Viem's `readContract` function to call the `storedNumber` view function
    - It periodically polls for updates to keep the UI in sync with the blockchain state
    - The component displays a loading indicator while fetching data and handles error states

3. **Writing Data**:
    - The `WriteContract` component uses Viem's `writeContract` function to send a transaction to the `setNumber` function
    - It ensures the wallet is connected before allowing a transaction
    - The component shows detailed feedback during transaction submission and confirmation
    - After a successful transaction, the value displayed in the `ReadContract` component will update on the next poll

## Conclusion

Congratulations! You've successfully built a fully functional dApp that interacts with a smart contract on Asset Hub using Viem and Next.js. Your application can now:

- Connect to a user's wallet and handle network switching
- Read data from a smart contract and keep it updated
- Write data to the blockchain through transactions

These fundamental skills provide the foundation for building more complex dApps on Asset Hub. With this knowledge, you can extend your application to interact with more sophisticated smart contracts and create advanced user interfaces.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Tutorial</span> __Create a dApp with WAGMI__

    ---

    Learn how to build a decentralized application by using the WAGMI framework.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/libraries/wagmi)

</div>
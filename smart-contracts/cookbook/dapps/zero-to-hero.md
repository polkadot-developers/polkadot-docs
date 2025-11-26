---
title: Zero to Hero Smart Contract DApp
description: Learn how to build a decentralized application on Polkadot Hub using Viem and Next.js by creating a simple dApp that interacts with a smart contract.
tutorial_badge:  Intermediate
categories: dApp, Tooling
---

# Zero to Hero Smart Contract DApp

Decentralized applications (dApps) are a key component of the Web3 ecosystem, enabling developers to build applications that communicate directly with blockchain networks. Polkadot Hub, a blockchain with smart contract support, serves as a robust platform for deploying and interacting with dApps.

This tutorial will guide you through building a fully functional dApp that interacts with a smart contract on Polkadot Hub. You'll create and deploy a smart contract with Hardhat, and then use [Viem](https://viem.sh/){target=\_blank} for blockchain interactions and [Next.js](https://nextjs.org/){target=\_blank} for the frontend. By the end, you'll have a dApp that lets users connect their wallets, retrieve on-chain data, and execute transactions.

## Prerequisites

Before getting started, ensure you have the following:

- [Node.js](https://nodejs.org/en){target=\_blank} v22.10.0 or later installed on your system.
- A crypto wallet (such as MetaMask) funded with test tokens. Refer to the [Connect to Polkadot](/smart-contracts/connect){target=\_blank} guide for more details.
- A basic understanding of React and JavaScript.
- Some familiarity with blockchain fundamentals and Solidity (helpful but not required).

## Project Overview

This dApp will interact with a basic Storage contract that you will create and deploy with Hardhat. The contract will allow you to:

- Store a number on the blockchain.
- Retrieve the stored number from the blockchain.
- Update the stored number with a new value.

Your project directory will be organized as follows:

```bash
polkadot-hub-tutorial/
├── storage-contract/          # Hardhat project for smart contract
│   ├── contracts/
│   │   └── Storage.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── artifacts/
│   │   └── contracts/
│   │       └── Storage.sol/
│   │           └── Storage.json
│   ├── hardhat.config.ts
│   ├── .env
│   └── package.json
│
└── dapp/                 # Next.js dApp project
    ├── abis/
    │   └── Storage.json
    └── app/
        ├── components/
        │   ├── ReadContract.tsx
        │   ├── WalletConnect.tsx
        │   └── WriteContract.tsx
        ├── utils/
        │   ├── contract.ts
        │   └── viem.ts
        ├── favicon.ico
        ├── globals.css
        ├── layout.tsx
        └── page.tsx
```

Create the main folder for the project:

```bash
mkdir polkadot-hub-tutorial
cd polkadot-hub-tutorial
```

## Create and Deploy the Storage Contract

Before building the dApp, you'll need to create and deploy the Storage smart contract. This section will guide you through using Hardhat to write, compile, and deploy the contract to Polkadot Hub TestNet.

### Set Up Hardhat Project

First, create a new directory for your Hardhat project and initialize it:

```bash
mkdir storage-contract
cd storage-contract
npm init -y
```

Install Hardhat and its dependencies:

```bash
npm install --save-dev hardhat@3.0.9
```

Initialize a new Hardhat project:

```bash
npx hardhat --init
```

Select **Create a TypeScript project** and accept the default options.

### Create the Storage Contract

In the `contracts` directory, create a new file called `Storage.sol` and add the following code:

```solidity title="Storage.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    uint256 private storedNumber;

    event NumberStored(uint256 newNumber);

    function setNumber(uint256 _number) public {
        storedNumber = _number;
        emit NumberStored(_number);
    }
}
```

This simple contract stores a single number and provides functions to read and update it.

### Configure Hardhat for Polkadot Hub

Update your `hardhat.config.ts` file to include the Polkadot Hub TestNet configuration:

```typescript title="hardhat.config.ts" hl_lines="39-44"
import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    polkadotTestNet: {
      type: "http",
      chainType: "l1",
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.PRIVATE_KEY || ''],
    },
  },
};

export default config;
```

Create a `.env` file in the root of your Hardhat project:

```text title=".env"
PRIVATE_KEY=INSERT_PRIVATE_KEY_HERE
```

Replace `INSERT_PRIVATE_KEY_HERE` with your actual private key. You can get this by exporting the private key from your wallet (e.g., MetaMask).

!!! warning
    Never commit your private key to version control. Use environment variables or a `.env` file (and add it to `.gitignore`) to manage sensitive information. Keep your private key safe, and never share it with anyone. If it is compromised, your funds can be stolen.


### Compile the Contract

Compile your Storage contract:

```bash
npx hardhat compile
```

You should see output indicating successful compilation.

### Deploy the Contract

Create a deployment script in the `ignition/modules` directory called `Storage.ts`:

```typescript title="Storage.ts"
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StorageModule", (m) => {
  const storage = m.contract("Storage");

  return { storage };
});
```

Deploy the contract to Polkadot Hub TestNet:

```bash
npx hardhat ignition deploy ./ignition/modules/Storage.ts --network polkadotTestNet
```

You should see output similar to:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat ignition deploy ./ignition/modules/Storage.ts --network polkadotTestNet</span>
  <span data-ty>WARNING: You are using Node.js 23.11.0 which is not supported by Hardhat.</span>
  <span data-ty>Please upgrade to 22.10.0 or a later LTS version (even major version number)</span>
  <span data-ty>✔ Confirm deploy to network polkadotTestNet (420420420)? … yes</span>
  <span data-ty>Hardhat Ignition 🚀</span>
  <span data-ty>Deploying [ StorageModule ]</span>
  <span data-ty>Batch #1</span>
  <span data-ty>  Executed StorageModule#Storage</span>
  <span data-ty>[ StorageModule ] successfully deployed 🚀</span>
  <span data-ty>Deployed Addresses</span>
  <span data-ty>StorageModule#Storage - 0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3</span>
</div>

!!! note
    Save the deployed contract address - you'll need it when building your dApp. In the following sections, we'll reference a pre-deployed contract at `0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3`, but you can use your own deployed contract address instead.

### Export the Contract ABI

After deployment, you'll need the contract's Application Binary Interface (ABI) for your dApp. You can find it in the `artifacts/contracts/Storage.sol/Storage.json` file generated by Hardhat. You'll use this in the next section when setting up your dApp.

Now that you have your contract deployed, you're ready to build the dApp that will interact with it!

## Set Up the DApp Project

Navigate to the root of the project, and create a new Next.js project called `dapp`:

```bash
npx create-next-app dapp --ts --eslint --tailwind --app --yes
cd dapp
```

## Install Dependencies

Install viem and related packages:

```bash
npm install viem@2.38.5
npm install --save-dev typescript@5.9.3 @types/node@22.19.24
```

## Connect to Polkadot Hub

To interact with Polkadot Hub, you need to set up a [Public Client](https://viem.sh/docs/clients/public#public-client){target=\_blank} that connects to the blockchain. In this example, you will interact with the Polkadot Hub TestNet, to experiment safely. Start by creating a new file called `utils/viem.ts` and add the following code:

```typescript title="viem.ts"
import { createPublicClient, http, createWalletClient, custom } from 'viem'
import 'viem/window';

const transport = http('http://127.0.0.1:8545') // TODO: change to the paseo asset hub RPC URL when it's available

// Configure the Polkadot Testnet Hub chain
export const polkadotTestnet = {
  id: 420420420,
  name: 'Polkadot Testnet',
  network: 'polkadot-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'], // TODO: change to the paseo asset hub RPC URL
    },
  },
} as const

// Create a public client for reading data
export const publicClient = createPublicClient({
  chain: polkadotTestnet,
  transport
})

// Create a wallet client for signing transactions
export const getWalletClient = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return createWalletClient({
      chain: polkadotTestnet,
      transport: custom(window.ethereum),
      account,
    });
  }
  throw new Error('No Ethereum browser provider detected');
};
```

This file initializes a viem client, providing helper functions for obtaining a Public Client and a [Wallet Client](https://viem.sh/docs/clients/wallet#wallet-client){target=\_blank}. The Public Client enables reading blockchain data, while the Wallet Client allows users to sign and send transactions. Also, note that by importing `viem/window` the global `window.ethereum` will be typed as an `EIP1193Provider`, check the [`window` Polyfill](https://viem.sh/docs/typescript#window-polyfill){target=\_blank} reference for more information.

## Set Up the Smart Contract Interface

For this dApp, you'll use a simple [Storage contract](/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/#create-the-contract){target=\_blank} that's already deployed in the Polkadot Hub TestNet: `0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3`. To interact with it, you need to define the contract interface.

Create a folder called `abis` at the root of your project, then create a file named `Storage.json` and paste the corresponding ABI of the Storage contract. You can copy and paste the following:

```bash
cp ./storage-contract/artifacts/contracts/Storage.sol/Storage.json ./dapp/abis/Storage.json
```

Next, create a file called `utils/contract.ts`:

```typescript title="contract.ts"
import { getContract } from 'viem';
import { publicClient, getWalletClient } from './viem';
import StorageABI from '../abis/Storage.json';

export const CONTRACT_ADDRESS = '0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3'; // TODO: change when the paseo asset hub RPC URL is available, and the contract is redeployed
export const CONTRACT_ABI = StorageABI.abi;

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

This file defines the contract address, ABI, and functions to create a viem [contract instance](https://viem.sh/docs/contract/getContract#contract-instances){target=\_blank} for reading and writing operations. viem's contract utilities enable more efficient, type-safe interaction with smart contracts.

## Create the Wallet Connection Component

Now, you can create a component to handle wallet connections. Create a new file called `components/WalletConnect.tsx`:

```typescript title="WalletConnect.tsx"
"use client";

import React, { useState, useEffect } from "react";
import { polkadotTestnet } from "../utils/viem";

interface WalletConnectProps {
  onConnect: (account: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has an authorized wallet connection
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // eth_accounts doesn't trigger the wallet popup
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          }) as string[];
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const chainIdHex = await window.ethereum.request({
              method: 'eth_chainId',
            }) as string;
            setChainId(parseInt(chainIdHex, 16));
            onConnect(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
          setError('Failed to check wallet connection');
        }
      }
    };

    checkConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      // Setup wallet event listeners
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) onConnect(accounts[0]);
      });

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }

    return () => {
      // Cleanup event listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [onConnect]);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError(
        'MetaMask not detected! Please install MetaMask to use this dApp.'
      );
      return;
    }

    try {
      // eth_requestAccounts triggers the wallet popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];
      
      setAccount(accounts[0]);

      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string;
      
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // Prompt user to switch networks if needed
      if (currentChainId !== polkadotTestnet.id) {
        await switchNetwork();
      }

      onConnect(accounts[0]);
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError('Failed to connect wallet');
    }
  };

  const switchNetwork = async () => {
    console.log('Switch network')
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${polkadotTestnet.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Error 4902 means the chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${polkadotTestnet.id.toString(16)}`,
                chainName: polkadotTestnet.name,
                rpcUrls: [polkadotTestnet.rpcUrls.default.http[0]],
                nativeCurrency: {
                  name: polkadotTestnet.nativeCurrency.name,
                  symbol: polkadotTestnet.nativeCurrency.symbol,
                  decimals: polkadotTestnet.nativeCurrency.decimals,
                },
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add network to wallet');
        }
      } else {
        setError('Failed to switch network');
      }
    }
  };

  // UI-only disconnection - MetaMask doesn't support programmatic disconnection
  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {!account ? (
        <button
          onClick={connectWallet}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <span className="text-sm font-mono bg-pink-100 px-2 py-1 rounded-md text-pink-700">
            {`${account.substring(0, 6)}...${account.substring(38)}`}
          </span>
          <button
            onClick={disconnectWallet}
            className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-pink-500 py-2 px-4 rounded-lg transition"
          >
            Disconnect
          </button>
          {chainId !== polkadotTestnet.id && (
            <button
              onClick={switchNetwork}
              className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Switch to Polkadot Testnet
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
```

This component handles connecting to the wallet, switching networks if necessary, and keeping track of the connected account. It provides a button for users to connect their wallet and displays the connected account address once connected.

## Create the Read Contract Component

Next, create a component to read data from the contract. Create a file called `components/ReadContract.tsx`:

```typescript title="ReadContract.tsx"
'use client';

import React, { useState, useEffect } from 'react';
import { publicClient } from '../utils/viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

const ReadContract: React.FC = () => {
  const [storedNumber, setStoredNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to read data from the blockchain
    const fetchData = async () => {
      try {
        setLoading(true);
        // Call the smart contract's storedNumber function
        const number = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'storedNumber',
            args: [],
          }) as bigint;

        setStoredNumber(number.toString());
        setError(null);
      } catch (err) {
        console.error('Error fetching stored number:', err);
        setError('Failed to fetch data from the contract');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 10 seconds to keep UI in sync with blockchain
    const interval = setInterval(fetchData, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto">
      <h2 className="text-lg font-bold text-center mb-4">Contract Data</h2>
      {loading ? (
        <div className="flex justify-center my-4">
          <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="text-center">
          <p className="text-sm font-mono bg-pink-100 px-2 py-1 rounded-md text-pink-700">
            <strong>Stored Number:</strong> {storedNumber}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadContract;
```

This component reads the `storedNumber` value from the contract and displays it to the user. It also sets up a polling interval to refresh the data periodically, ensuring that the UI stays in sync with the blockchain state.

## Create the Write Contract Component

Finally, create a component that allows users to update the stored number. Create a file called `components/WriteContract.tsx`:

```typescript title="WriteContract.tsx"
"use client";

import React, { useState, useEffect } from "react";
import { publicClient, getWalletClient } from '../utils/viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

interface WriteContractProps {
  account: string | null;
}

const WriteContract: React.FC<WriteContractProps> = ({ account }) => {
  const [newNumber, setNewNumber] = useState<string>("");
  const [status, setStatus] = useState<{
    type: string | null;
    message: string;
  }>({
    type: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);

  // Check if the account is on the correct network
  useEffect(() => {
    const checkNetwork = async () => {
      if (!account) return;

      try {
        // Get the chainId from the public client
        const chainId = await publicClient.getChainId();

        // Get the user's current chainId from their wallet
        const walletClient = await getWalletClient();
        if (!walletClient) return;

        const walletChainId = await walletClient.getChainId();

        // Check if they match
        setIsCorrectNetwork(chainId === walletChainId);
      } catch (err) {
        console.error("Error checking network:", err);
        setIsCorrectNetwork(false);
      }
    };

    checkNetwork();
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!account) {
      setStatus({ type: "error", message: "Please connect your wallet first" });
      return;
    }

    if (!isCorrectNetwork) {
      setStatus({
        type: "error",
        message: "Please switch to the correct network in your wallet",
      });
      return;
    }

    if (!newNumber || isNaN(Number(newNumber))) {
      setStatus({ type: "error", message: "Please enter a valid number" });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: "info", message: "Initiating transaction..." });

      // Get wallet client for transaction signing
      const walletClient = await getWalletClient();

      if (!walletClient) {
        setStatus({ type: "error", message: "Wallet client not available" });
        return;
      }

      // Check if account matches
      if (
        walletClient.account?.address.toLowerCase() !== account.toLowerCase()
      ) {
        setStatus({
          type: "error",
          message:
            "Connected wallet account doesn't match the selected account",
        });
        return;
      }

      // Prepare transaction and wait for user confirmation in wallet
      setStatus({
        type: "info",
        message: "Please confirm the transaction in your wallet...",
      });

      // Simulate the contract call first
      console.log('newNumber', newNumber);
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "setNumber",
        args: [BigInt(newNumber)],
        account: walletClient.account,
      });

      // Send the transaction with wallet client
      const hash = await walletClient.writeContract(request);

      // Wait for transaction to be mined
      setStatus({
        type: "info",
        message: "Transaction submitted. Waiting for confirmation...",
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      setStatus({
        type: "success",
        message: `Transaction confirmed! Transaction hash: ${receipt.transactionHash}`,
      });

      setNewNumber("");
    } catch (err: any) {
      console.error("Error updating number:", err);

      // Handle specific errors
      if (err.code === 4001) {
        // User rejected transaction
        setStatus({ type: "error", message: "Transaction rejected by user." });
      } else if (err.message?.includes("Account not found")) {
        // Account not found on the network
        setStatus({
          type: "error",
          message:
            "Account not found on current network. Please check your wallet is connected to the correct network.",
        });
      } else if (err.message?.includes("JSON is not a valid request object")) {
        // JSON error - specific to your current issue
        setStatus({
          type: "error",
          message:
            "Invalid request format. Please try again or contact support.",
        });
      } else {
        // Other errors
        setStatus({
          type: "error",
          message: `Error: ${err.message || "Failed to send transaction"}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto space-y-4">
      <h2 className="text-lg font-bold">Update Stored Number</h2>

      {!isCorrectNetwork && account && (
        <div className="p-2 rounded-md bg-yellow-100 text-yellow-700 text-sm">
          ⚠️ You are not connected to the correct network. Please switch
          networks in your wallet.
        </div>
      )}

      {status.message && (
        <div
          className={`p-2 rounded-md break-words h-fit text-sm ${
            status.type === "error"
              ? "bg-red-100 text-red-500"
              : status.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="New Number"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          disabled={isSubmitting || !account}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="submit"
          disabled={
            isSubmitting || !account || (!isCorrectNetwork && !!account)
          }
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-300"
        >
          {isSubmitting ? "Updating..." : "Update"}
        </button>
      </form>

      {!account && (
        <p className="text-sm text-gray-500">
          Connect your wallet to update the stored number.
        </p>
      )}
    </div>
  );
};

export default WriteContract;
```

This component allows users to input a new number and send a transaction to update the value stored in the contract. It provides appropriate feedback during each step of the transaction process and handles error scenarios.

Update the `app/page.tsx` file to integrate all components:

```typescript title="page.tsx"
"use client";

import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import ReadContract from "./components/ReadContract";
import WriteContract from "./components/WriteContract";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);

  const handleConnect = (connectedAccount: string) => {
    setAccount(connectedAccount);
  };

  return (
    <section className="min-h-screen bg-white text-black flex flex-col justify-center items-center gap-4 py-10">
      <h1 className="text-2xl font-semibold text-center">
        Polkadot Hub - Zero To Hero DApp
      </h1>
      <WalletConnect onConnect={handleConnect} />
      <ReadContract />
      <WriteContract account={account} />
    </section>
  );
}
```

Run the dApp:

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser, and you should see your dApp with the wallet connection button, the stored number displayed, and the form to update the number. You should see something like this:

<!-- TODO: add gif of the dApp running -->

## How It Works

This dApp uses components to interact with the blockchain in several ways.

### Wallet Connection 

The `WalletConnect` component uses the browser's Ethereum provider (MetaMask) to connect to the user's wallet and handles network switching to ensure the user is connected to the Polkadot Hub TestNet. Once connected, it provides the user's account address to the parent component.

### Data Reads

The `ReadContract` component uses viem's `readContract` function to call the `storedNumber` view function and periodically poll for updates to keep the UI in sync with the blockchain state. The component also displays a loading indicator while fetching data and handles error states.

### Data Writes

The `WriteContract` component uses viem's `writeContract` function to send a transaction to the `setNumber` function and ensures the wallet is connected before allowing a transaction. The component shows detailed feedback during transaction submission and confirmation. After a successful transaction, the value displayed in the `ReadContract` component will update on the next poll.

## Conclusion

Congratulations! You've successfully built a fully functional dApp that interacts with a smart contract on Polkadot Hub using viem and Next.js. Your application can now:

- Create a smart contract with Hardhat and deploy it to Polkadot Hub TestNet.
- Connect to a user's wallet and handle network switching.
- Read data from a smart contract and keep it updated.
- Write data to the blockchain through transactions.

These fundamental skills provide the foundation for building more complex dApps on Polkadot Hub. With this knowledge, you can extend your application to interact with more sophisticated smart contracts and create advanced user interfaces.

To get started right away with a working example, you can clone the repository and navigate to the implementation:

```bash
git clone https://github.com/polkadot-developers/revm-hardhat-examples.git
cd zero-to-hero-dapp
```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Port Ethereum Projects to Polkadot Hub__

    ---

    Learn how to port an Ethereum project to Polkadot Hub using Hardhat and Viem.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/)

-   <span class="badge guide">Guide</span> __Dive Deeper into Polkadot Precompiles__

    ---

    Learn how to use the Polkadot precompiles to interact with the blockchain.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/precompiles/)
</div>
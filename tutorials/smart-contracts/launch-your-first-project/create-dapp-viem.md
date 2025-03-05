---
title: Create a dApp With Viem
description: Learn how to build a decentralized application on Asset Hub using Viem and Next.js by creating a simple dApp that interacts with a smart contract.
---

# Create a dApp with viem

viem is a lightweight TypeScript library for interacting with Ethereum-compatible blockchains. This tutorial will guide you through building a decentralized application (dApp) on Asset Hub using viem.

## Prerequisites
- Node.js
- npm or yarn
- MetaMask or Web3 wallet
- Basic understanding of TypeScript and React

## Set Up the Project
Create a new Next.js project:

```bash
npx create-next-app@latest viem-dapp --typescript
cd viem-dapp
```

## Install Dependencies
Install viem and related packages:

```bash
npm install viem
npm install --save-dev typescript @types/node
```

## Smart Contract
Create a simple Storage contract:

`contracts/Storage.sol`:
```solidity
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Storage {
    uint256 public storedNumber;

    function setNumber(uint256 _newNumber) public {
        storedNumber = _newNumber;
    }
}
```

## Wallet Connection Component
Create a component to connect user wallets:

`components/WalletConnect.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { assetHub } from '../utils/chain';

const WalletConnect = () => {
  const [account, setAccount] = useState<`0x${string}` | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const [address] = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        // Create wallet client
        const walletClient = createWalletClient({
          chain: assetHub,
          transport: custom(window.ethereum)
        });

        setAccount(address as `0x${string}`);
      } catch (error) {
        console.error('Failed to connect wallet', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      {account ? (
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Connected: {account}
          </p>
          <button 
            onClick={disconnectWallet}
            className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={connectWallet}
          className="w-full bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
```

## Blockchain Configuration
Create a utility file for blockchain configuration:

`utils/chain.ts`:
```typescript
import { defineChain } from 'viem';

export const assetHub = defineChain({
  id: 1_000, // Replace with actual Asset Hub chain ID
  name: 'Asset Hub',
  network: 'assethub',
  nativeCurrency: {
    name: 'Asset Hub Token',
    symbol: 'AHT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.asset-hub.com'], // Replace with actual RPC URL
    },
    public: {
      http: ['https://rpc.asset-hub.com'], // Replace with actual RPC URL
    },
  },
  blockExplorers: {
    default: { 
      name: 'Asset Hub Explorer',
      url: 'https://explorer.asset-hub.com' 
    },
  },
});
```

## Read Contract Component
Create a component to read data from the contract:

`components/ReadContract.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbi } from 'viem';
import { assetHub } from '../utils/chain';

const publicClient = createPublicClient({
  chain: assetHub,
  transport: http(),
});

const contractAddress = '0x...' as `0x${string}`; // Replace with deployed contract address
const abi = parseAbi([
  'function storedNumber() public view returns (uint256)',
]);

const ReadContract = () => {
  const [storedNumber, setStoredNumber] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStoredNumber() {
      try {
        const data = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: 'storedNumber',
        });
        setStoredNumber(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch stored number');
        setIsLoading(false);
      }
    }

    fetchStoredNumber();
    const interval = setInterval(fetchStoredNumber, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      {isLoading ? (
        <div className="w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="text-center">
          <p className="text-sm font-mono bg-pink-100 px-2 py-1 rounded-md text-pink-700">
            <strong>Stored Number:</strong> {storedNumber?.toString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadContract;
```

## Write Contract Component
Create a component to write data to the contract:

`components/WriteContract.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { 
  createPublicClient, 
  createWalletClient, 
  custom,
  http, 
  parseAbi 
} from 'viem';
import { assetHub } from '../utils/chain';

const publicClient = createPublicClient({
  chain: assetHub,
  transport: http(),
});

const contractAddress = '0x...' as `0x${string}`; // Replace with deployed contract address
const abi = parseAbi([
  'function setNumber(uint256 _newNumber) public',
]);

const WriteContract = () => {
  const [newNumber, setNewNumber] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [account, setAccount] = useState<`0x${string}` | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const [address] = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(address as `0x${string}`);
      } catch (error) {
        console.error('Failed to connect wallet', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setStatus({ type: 'error', message: 'Please connect your wallet' });
      return;
    }

    try {
      const walletClient = createWalletClient({
        account: account,
        chain: assetHub,
        transport: custom(window.ethereum)
      });
      
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: 'setNumber',
        args: [BigInt(newNumber)],
        account: account,
      });

      const hash = await walletClient.writeContract(request);
      
      setStatus({
        type: 'success', 
        message: `Transaction sent: ${hash}`
      });
    } catch (err) {
      setStatus({
        type: 'error', 
        message: 'Failed to update number'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Update Stored Number</h2>
      {!account ? (
        <button 
          onClick={connectWallet}
          className="w-full bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
        >
          Connect Wallet
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="New Number"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Update
          </button>
        </form>
      )}
      {status.message && (
        <div className={`mt-4 p-2 rounded ${
          status.type === 'error' 
            ? 'bg-red-100 text-red-500' 
            : 'bg-green-100 text-green-700'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default WriteContract;
```

## Update Main Page
Update the main page to integrate components:

`app/page.tsx`:
```typescript
'use client';

import WalletConnect from '../components/WalletConnect';
import ReadContract from '../components/ReadContract';
import WriteContract from '../components/WriteContract';

export default function Home() {
  return (
    <section className="min-h-screen bg-white text-black flex flex-col justify-center items-center gap-4 py-10">
      <h1 className="text-2xl font-semibold text-center">
        viem dApp - Asset Hub Smart Contracts
      </h1>
      <WalletConnect />
      <ReadContract />
      <WriteContract />
    </section>
  );
}
```

## Conclusion
Congratulations! You've built a complete dApp that interacts with a smart contract on Asset Hub using viem and Next.js. Your application can now:

- Connect to a user's wallet
- Read data from a smart contract
- Send transactions to update the contract state

These fundamental skills provide the foundation for building more complex dApps on Asset Hub.

## Where to Go Next
### Tutorial: Advanced viem Features

Learn more advanced techniques for using viem:
- Multi-call functionality
- Batch transactions
- Custom contract actions

[Get Started →]
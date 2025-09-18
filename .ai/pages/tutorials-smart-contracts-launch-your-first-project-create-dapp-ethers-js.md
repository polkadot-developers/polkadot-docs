---
title: Create a dApp With Ethers.js
description: Learn how to build a decentralized application on Polkadot Hub using Ethers.js and Next.js by creating a simple dApp that interacts with a smart contract.
categories: dApp, Tooling
url: https://docs.polkadot.com/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/
---

# Create a DApp With Ethers.js

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

## Introduction

Decentralized applications (dApps) have become a cornerstone of the Web3 ecosystem, allowing developers to create applications that interact directly with blockchain networks. Polkadot Hub, a blockchain that supports smart contract functionality, provides an excellent platform for deploying and interacting with dApps.

In this tutorial, you'll build a complete dApp that interacts with a smart contract deployed on the Polkadot Hub TestNet. It will use [Ethers.js](/develop/smart-contracts/libraries/ethers-js){target=\_blank} to interact with the blockchain and [Next.js](https://nextjs.org/){target=\_blank} as the frontend framework. By the end of this tutorial, you'll have a functional dApp that allows users to connect their wallets, read data from the blockchain, and execute transactions.

## Prerequisites

Before you begin, make sure you have:

- [Node.js](https://nodejs.org/en){target=\_blank} v16 or newer installed on your machine.
- A crypto wallet (like MetaMask) with some test tokens. For further information, check the [Connect to Polkadot](/develop/smart-contracts/connect-to-polkadot){target=\_blank} guide.
- Basic understanding of React and JavaScript.
- Familiarity with blockchain concepts and Solidity (helpful but not mandatory).

## Project Overview

The dApp will interact with a simple Storage contract. For a step-by-step guide on creating it, refer to the [Create Contracts](/tutorials/smart-contracts/launch-your-first-project/create-contracts){target=\_blank} tutorial. This contract allows:

- Reading a stored number from the blockchain.
- Updating the stored number with a new value.

The contract has already been deployed to the Polkadot Hub TestNet for testing purposes: `0x58053f0e8ede1a47a1af53e43368cd04ddcaf66f`. If you want to deploy your own, follow the [Deploying Contracts](/develop/smart-contracts/dev-environments/remix/#deploying-contracts){target=\_blank} section.

Here's a simplified view of what you'll be building:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-1.webp)

The general structure of the project should end up as follows:

```bash
ethers-dapp
├── abis
│   └── Storage.json
└── app
    ├── components
    │   ├── ReadContract.js
    │   ├── WalletConnect.js
    │   └── WriteContract.js
    ├── favicon.ico
    ├── globals.css
    ├── layout.js
    ├── page.js
    └── utils
        ├── contract.js
        └── ethers.js
```

## Set Up the Project

Let's start by creating a new Next.js project:

```bash
npx create-next-app ethers-dapp --js --eslint --tailwind --app --yes
cd ethers-dapp
```

Next, install the needed dependencies:

```bash
npm install ethers@6.13.5
```

## Connect to Polkadot Hub

To interact with the Polkadot Hub, you need to set up an [Ethers.js Provider](/develop/smart-contracts/libraries/ethers-js/#set-up-the-ethersjs-provider){target=\_blank} that connects to the blockchain. In this example, you will interact with the Polkadot Hub TestNet, so you can experiment safely. Start by creating a new file called `utils/ethers.js` and add the following code:

```javascript title="app/utils/ethers.js"
import { JsonRpcProvider } from 'ethers';

export const PASSET_HUB_CONFIG = {
  name: 'Passet Hub',
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io/', // Passet Hub testnet RPC
  chainId: 420420422, // Passet Hub testnet chainId
  blockExplorer: 'https://blockscout-passet-hub.parity-testnet.parity.io/',
};

export const getProvider = () => {
  return new JsonRpcProvider(PASSET_HUB_CONFIG.rpc, {
    chainId: PASSET_HUB_CONFIG.chainId,
    name: PASSET_HUB_CONFIG.name,
  });
};

// Helper to get a signer from a provider
export const getSigner = async (provider) => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    return ethersProvider.getSigner();
  }
  throw new Error('No Ethereum browser provider detected');
};
```

This file establishes a connection to the Polkadot Hub TestNet and provides helper functions for obtaining a [Provider](https://docs.ethers.org/v5/api/providers/provider/){target=_blank} and [Signer](https://docs.ethers.org/v5/api/signer/){target=_blank}. The provider allows you to read data from the blockchain, while the signer enables users to send transactions and modify the blockchain state.

## Set Up the Smart Contract Interface

For this dApp, you'll use a simple Storage contract already deployed. So, you need to create an interface to interact with it. First, ensure to create a folder called `abis` at the root of your project, create a file `Storage.json`, and paste the corresponding ABI (Application Binary Interface) of the Storage contract. You can copy and paste the following:

???+ code "Storage.sol ABI"

    ```json title="abis/Storage.json"
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

Now, create a file called `app/utils/contract.js`:

```javascript title="app/utils/contract.js"
import { Contract } from 'ethers';
import { getProvider } from './ethers';
import StorageABI from '../../abis/Storage.json';

export const CONTRACT_ADDRESS = '0x58053f0e8ede1a47a1af53e43368cd04ddcaf66f';

export const CONTRACT_ABI = StorageABI;

export const getContract = () => {
  const provider = getProvider();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const getSignedContract = async (signer) => {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
```

This file defines the contract address, ABI, and functions to create instances of the contract for reading and writing.

## Create the Wallet Connection Component

Next, let's create a component to handle wallet connections. Create a new file called `app/components/WalletConnect.js`:

```javascript title="app/components/WalletConnect.js"
'use client';

import React, { useState, useEffect } from 'react';
import { PASSET_HUB_CONFIG } from '../utils/ethers';

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user already has an authorized wallet connection
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // eth_accounts doesn't trigger the wallet popup
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            const chainIdHex = await window.ethereum.request({
              method: 'eth_chainId',
            });
            setChainId(parseInt(chainIdHex, 16));
          }
        } catch (err) {
          console.error('Error checking connection:', err);
          setError('Failed to check wallet connection');
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      // Setup wallet event listeners
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
        if (accounts[0] && onConnect) onConnect(accounts[0]);
      });

      window.ethereum.on('chainChanged', (chainIdHex) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [onConnect]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError(
        'MetaMask not detected! Please install MetaMask to use this dApp.'
      );
      return;
    }

    try {
      // eth_requestAccounts triggers the wallet popup
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);

      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId',
      });
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // Prompt user to switch networks if needed
      if (currentChainId !== PASSET_HUB_CONFIG.chainId) {
        await switchNetwork();
      }

      if (onConnect) onConnect(accounts[0]);
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError('Failed to connect wallet');
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${PASSET_HUB_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Error 4902 means the chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${PASSET_HUB_CONFIG.chainId.toString(16)}`,
                chainName: PASSET_HUB_CONFIG.name,
                rpcUrls: [PASSET_HUB_CONFIG.rpc],
                blockExplorerUrls: [PASSET_HUB_CONFIG.blockExplorer],
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
          {chainId !== PASSET_HUB_CONFIG.chainId && (
            <button
              onClick={switchNetwork}
              className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Switch to Passet Hub
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
```

This component handles connecting to the wallet, switching networks if necessary, and keeping track of the connected account. 

To integrate this component to your dApp, you need to overwrite the existing boilerplate in `app/page.js` with the following code:

```javascript title="app/page.js"

import { useState } from 'react';

import WalletConnect from './components/WalletConnect';
export default function Home() {
  const [account, setAccount] = useState(null);

  const handleConnect = (connectedAccount) => {
    setAccount(connectedAccount);
  };

  return (
    <section className="min-h-screen bg-white text-black flex flex-col justify-center items-center gap-4 py-10">
      <h1 className="text-2xl font-semibold text-center">
        Ethers.js dApp - Passet Hub Smart Contracts
      </h1>
      <WalletConnect onConnect={handleConnect} />
</section>
  );
}
```

In your terminal, you can launch your project by running:

```bash
npm run dev
```

And you will see the following:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-2.webp)

## Read Data from the Blockchain

Now, let's create a component to read data from the contract. Create a file called `app/components/ReadContract.js`:

```javascript title="app/components/ReadContract.js"
'use client';

import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/contract';

const ReadContract = () => {
  const [storedNumber, setStoredNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to read data from the blockchain
    const fetchData = async () => {
      try {
        setLoading(true);
        const contract = getContract();
        // Call the smart contract's storedNumber function
        const number = await contract.storedNumber();
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

This component reads the `storedNumber` value from the contract and displays it to the user. It also sets up a polling interval to refresh the data periodically.

To see this change in your dApp, you need to integrate this component into the `app/page.js` file:

```javascript title="app/page.js"

import { useState } from 'react';

import WalletConnect from './components/WalletConnect';
import ReadContract from './components/ReadContract';
export default function Home() {
  const [account, setAccount] = useState(null);

  const handleConnect = (connectedAccount) => {
    setAccount(connectedAccount);
  };

  return (
    <section className="min-h-screen bg-white text-black flex flex-col justify-center items-center gap-4 py-10">
      <h1 className="text-2xl font-semibold text-center">
        Ethers.js dApp - Passet Hub Smart Contracts
      </h1>
      <WalletConnect onConnect={handleConnect} />
      <ReadContract />
</section>
  );
}
```

Your dApp will automatically be updated to the following:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-3.webp)

## Write Data to the Blockchain

Finally, let's create a component that allows users to update the stored number. Create a file called `app/components/WriteContract.js`:

```javascript title="app/components/WriteContract.js"
'use client';

import { useState } from 'react';
import { getSignedContract } from '../utils/contract';
import { ethers } from 'ethers';

const WriteContract = ({ account }) => {
  const [newNumber, setNewNumber] = useState('');
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!account) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!newNumber || isNaN(Number(newNumber))) {
      setStatus({ type: 'error', message: 'Please enter a valid number' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: 'info', message: 'Initiating transaction...' });

      // Get a signer from the connected wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = await getSignedContract(signer);

      // Send transaction to blockchain and wait for user confirmation in wallet
      setStatus({
        type: 'info',
        message: 'Please confirm the transaction in your wallet...',
      });

      // Call the contract's setNumber function
      const tx = await contract.setNumber(newNumber);

      // Wait for transaction to be mined
      setStatus({
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...',
      });
      const receipt = await tx.wait();

      setStatus({
        type: 'success',
        message: `Transaction confirmed! Transaction hash: ${receipt.hash}`,
      });
      setNewNumber('');
    } catch (err) {
      console.error('Error updating number:', err);

      // Error code 4001 is MetaMask's code for user rejection
      if (err.code === 4001) {
        setStatus({ type: 'error', message: 'Transaction rejected by user.' });
      } else {
        setStatus({
          type: 'error',
          message: `Error: ${err.message || 'Failed to send transaction'}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-pink-500 rounded-lg p-4 shadow-md bg-white text-pink-500 max-w-sm mx-auto space-y-4">
      <h2 className="text-lg font-bold">Update Stored Number</h2>
      {status.message && (
        <div
          className={`p-2 rounded-md break-words h-fit text-sm ${
            status.type === 'error'
              ? 'bg-red-100 text-red-500'
              : 'bg-green-100 text-green-700'
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
          disabled={isSubmitting || !account}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-300"
        >
          {isSubmitting ? 'Updating...' : 'Update'}
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

This component allows users to input a new number and send a transaction to update the value stored in the contract. When the transaction is successful, users will see the stored value update in the `ReadContract` component after the transaction is confirmed.

Update the `app/page.js` file to integrate all components:

```javascript title="app/page.js"
'use client';

import { useState } from 'react';

import WalletConnect from './components/WalletConnect';
import ReadContract from './components/ReadContract';
import WriteContract from './components/WriteContract';

export default function Home() {
  const [account, setAccount] = useState(null);

  const handleConnect = (connectedAccount) => {
    setAccount(connectedAccount);
  };

  return (
    <section className="min-h-screen bg-white text-black flex flex-col justify-center items-center gap-4 py-10">
      <h1 className="text-2xl font-semibold text-center">
        Ethers.js dApp - Passet Hub Smart Contracts
      </h1>
      <WalletConnect onConnect={handleConnect} />
      <ReadContract />
      <WriteContract account={account} />
    </section>
  );
}
```

The completed UI will display:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-4.webp)

## Conclusion

Congratulations! You've built a complete dApp that interacts with a smart contract on the Polkadot Hub TestNet using Ethers.js and Next.js. Your application can now:

- Connect to a user's wallet.
- Read data from a smart contract.
- Send transactions to update the contract state.

These fundamental skills provide the foundation for building more complex dApps on Polkadot Hub. With these building blocks, you can extend your application to interact with more sophisticated smart contracts and create more advanced user interfaces.

To get started right away with a working example, you can clone the repository and navigate to the implementation:

```
git clone https://github.com/polkadot-developers/polkavm-storage-contract-dapps.git -b v0.0.2
cd polkavm-storage-contract-dapps/ethers-dapp
```

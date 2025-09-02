---
title: [Your dApp Tutorial Title - Max 45 chars]
description: [Description of the dApp functionality - 120-160 chars]
tutorial_badge: Beginner | Intermediate | Advanced
categories: dApps, Frontend, API Integration, Wallet Integration
---

# [Your dApp Tutorial Title]

## Introduction

[2-3 paragraphs explaining:]
- What dApp users will build
- What functionality it provides (UI, wallet integration, chain interaction)
- What technologies and APIs will be used

## Prerequisites

Before starting, ensure you have:

- Node.js (v18 or later) and npm/yarn installed
- Basic knowledge of [JavaScript/TypeScript/React/Vue]
- Polkadot.js extension installed in browser
- Test tokens on [relevant network]
- Code editor of your choice

## Step 1: Project Setup

Set up the development environment:

```bash
# Create new project
npx create-react-app my-polkadot-dapp --template typescript
cd my-polkadot-dapp

# Install Polkadot dependencies
npm install @polkadot/api @polkadot/extension-dapp @polkadot/util
```

### Project Structure
```
my-polkadot-dapp/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   └── ChainInteraction.tsx
│   ├── hooks/
│   │   └── usePolkadotApi.ts
│   └── App.tsx
├── package.json
└── README.md
```

## Step 2: API Connection Setup

Create a connection to the Polkadot network:

```typescript
// src/hooks/usePolkadotApi.ts
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useEffect, useState } from 'react';

export const usePolkadotApi = () => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectToChain = async () => {
      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      const api = await ApiPromise.create({ provider: wsProvider });
      
      setApi(api);
      setIsConnected(true);
    };

    connectToChain();
  }, []);

  return { api, isConnected };
};
```

## Step 3: Wallet Integration

Implement wallet connection functionality:

```typescript
// src/components/WalletConnect.tsx
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useState, useEffect } from 'react';

export const WalletConnect = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);

  const connectWallet = async () => {
    const extensions = await web3Enable('My Polkadot dApp');
    
    if (extensions.length === 0) {
      alert('No wallet extension found. Please install Polkadot.js extension.');
      return;
    }

    const accounts = await web3Accounts();
    setAccounts(accounts);
  };

  return (
    <div>
      {accounts.length === 0 ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <select onChange={(e) => setSelectedAccount(accounts[parseInt(e.target.value)])}>
          {accounts.map((account, index) => (
            <option key={account.address} value={index}>
              {account.meta.name} ({account.address})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
```

## Step 4: Chain Interaction Component

Create components for interacting with the blockchain:

```typescript
// src/components/ChainInteraction.tsx
import { ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { useState } from 'react';

interface Props {
  api: ApiPromise;
  account: InjectedAccountWithMeta;
}

export const ChainInteraction = ({ api, account }: Props) => {
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getBalance = async () => {
    if (!api || !account) return;

    const { data: balance } = await api.query.system.account(account.address);
    setBalance(balance.free.toHuman());
  };

  const sendTransaction = async () => {
    if (!api || !account) return;

    setLoading(true);
    try {
      const injector = await web3FromAddress(account.address);
      
      // Example transaction - adjust based on your needs
      const transfer = api.tx.balances.transfer('DESTINATION_ADDRESS', '1000000000000');
      
      await transfer.signAndSend(account.address, { signer: injector.signer }, (result) => {
        console.log('Transaction status:', result.status.toString());
        
        if (result.status.isInBlock) {
          console.log('Transaction included in block:', result.status.asInBlock.toString());
        }
        
        if (result.status.isFinalized) {
          console.log('Transaction finalized');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Account: {account.meta.name}</h3>
      <p>Address: {account.address}</p>
      <p>Balance: {balance}</p>
      
      <button onClick={getBalance}>Get Balance</button>
      <button onClick={sendTransaction} disabled={loading}>
        {loading ? 'Sending...' : 'Send Transaction'}
      </button>
    </div>
  );
};
```

## Step 5: Main App Component

Bring everything together:

```typescript
// src/App.tsx
import React, { useState } from 'react';
import { usePolkadotApi } from './hooks/usePolkadotApi';
import { WalletConnect } from './components/WalletConnect';
import { ChainInteraction } from './components/ChainInteraction';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

function App() {
  const { api, isConnected } = usePolkadotApi();
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);

  return (
    <div className="App">
      <header>
        <h1>My Polkadot dApp</h1>
        <p>Connection status: {isConnected ? 'Connected' : 'Connecting...'}</p>
      </header>
      
      <main>
        <WalletConnect onAccountSelect={setSelectedAccount} />
        
        {api && selectedAccount && (
          <ChainInteraction api={api} account={selectedAccount} />
        )}
      </main>
    </div>
  );
}

export default App;
```

## Step 6: Testing Your dApp

Test the application:

```bash
# Start development server
npm start

# Open browser to http://localhost:3000
```

### Testing Checklist
1. **Wallet Connection**: Verify extension detection and account selection
2. **API Connection**: Check network connection status
3. **Balance Queries**: Test balance retrieval functionality
4. **Transactions**: Test transaction signing and submission
5. **Error Handling**: Test behavior with disconnected wallet/network

![dApp interface screenshot](/images/tutorials/dapps/[category]/[tutorial-name]/dapp-interface.webp)

!!!tip "Screenshot Dimensions"
    Use 1512px width for desktop screenshots, 400x600px for browser extensions.

## Step 7: Advanced Features [Optional]

Enhance your dApp with additional features:

### Real-time Updates
```typescript
// Subscribe to balance changes
const unsubscribe = await api.query.system.account(address, (account) => {
  setBalance(account.data.free.toHuman());
});
```

### Error Handling
```typescript
// Robust error handling
try {
  // API calls
} catch (error) {
  if (error.message.includes('1010')) {
    setError('Insufficient balance for transaction');
  } else {
    setError('Transaction failed: ' + error.message);
  }
}
```

### Multiple Network Support
```typescript
// Support for multiple networks
const networks = {
  polkadot: 'wss://rpc.polkadot.io',
  kusama: 'wss://kusama-rpc.polkadot.io',
  westend: 'wss://westend-rpc.polkadot.io'
};
```


## Deployment

Deploy your dApp:

```bash
# Build for production
npm run build

# Deploy to hosting service (Netlify, Vercel, etc.)
```

## Where to Go Next

Enhance your dApp development skills:
- [Advanced PAPI integration tutorial]
- [Multi-chain dApp development]
- [dApp security best practices]

## Additional Resources

- [Polkadot.js API Documentation](https://polkadot.js.org/docs/) 
- [PAPI Documentation](https://papi.how/)
- [Polkadot Developer Console](https://console.polkadot.io/)
- [Substrate Connect](https://substrate.io/developers/substrate-connect/)
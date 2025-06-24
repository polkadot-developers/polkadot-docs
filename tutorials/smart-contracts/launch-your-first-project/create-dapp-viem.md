---
title: Create a dApp With Viem
description: Learn how to build a decentralized application on Polkadot Hub using Viem and Next.js by creating a simple dApp that interacts with a smart contract.
tutorial_badge:  Intermediate
---

# Create a DApp with Viem

--8<-- 'text/smart-contracts/polkaVM-warning.md'

Decentralized applications (dApps) are a key component of the Web3 ecosystem, enabling developers to build applications that communicate directly with blockchain networks. Polkadot Hub, a blockchain with smart contract support, serves as a robust platform for deploying and interacting with dApps.

This tutorial will guide you through building a fully functional dApp that interacts with a smart contract on Polkadot Hub. You'll use [Viem](https://viem.sh/){target=\_blank} for blockchain interactions and [Next.js](https://nextjs.org/){target=\_blank} for the frontend. By the end, you'll have a dApp that lets users connect their wallets, retrieve on-chain data, and execute transactions.

## Prerequisites

Before getting started, ensure you have the following:

- [Node.js](https://nodejs.org/en){target=\_blank} v16 or later installed on your system
- A crypto wallet (such as MetaMask) funded with test tokens. Refer to the [Connect to Polkadot](/develop/smart-contracts/connect-to-polkadot){target=\_blank} guide for more details
- A basic understanding of React and JavaScript
- Some familiarity with blockchain fundamentals and Solidity (useful but not required)

## Project Overview

This dApp will interact with a basic Storage contract. Refer to the [Create Contracts](/tutorials/smart-contracts/launch-your-first-project/create-contracts){target=\_blank} tutorial for a step-by-step guide on creating this contract. The contract allows:

- Retrieving a stored number from the blockchain
- Updating the stored number with a new value


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
npx create-next-app viem-dapp --ts --eslint --tailwind --app --yes
cd viem-dapp
```

## Install Dependencies

Install viem and related packages:

```bash
npm install viem@{{dependencies.javascript_packages.viem.version}}
npm install --save-dev typescript @types/node
```

## Connect to Polkadot Hub

To interact with Polkadot Hub, you need to set up a [Public Client](https://viem.sh/docs/clients/public#public-client){target=\_blank} that connects to the blockchain. In this example, you will interact with the Polkadot Hub TestNet, so you can experiment safely. Start by creating a new file called `utils/viem.ts` and add the following code:

```typescript title="viem.ts"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/utils/viem.ts"
```

This file initializes a viem client, providing helper functions for obtaining a Public Client and a [Wallet Client](https://viem.sh/docs/clients/wallet#wallet-client){target=\_blank}. The Public Client enables reading blockchain data, while the Wallet Client allows users to sign and send transactions. Also, note that by importing `'viem/window'` the global `window.ethereum` will be typed as an `EIP1193Provider`, check the [`window` Polyfill](https://viem.sh/docs/typescript#window-polyfill){target=\_blank} reference for more information.

## Set Up the Smart Contract Interface

For this dApp, you'll use a simple [Storage contract](/tutorials/smart-contracts/launch-your-first-project/create-contracts){target=\_blank} that's already deployed in the Polkadot Hub TestNet: `0x58053f0e8ede1a47a1af53e43368cd04ddcaf66f`. To interact with it, you need to define the contract interface.

Create a folder called `abis` at the root of your project, then create a file named `Storage.json` and paste the corresponding ABI (Application Binary Interface) of the Storage contract. You can copy and paste the following:

??? code "Storage.sol ABI"
    ```json title="Storage.json"
    --8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/abis/Storage.json"
    ```

Next, create a file called `utils/contract.ts`:

```typescript title="contract.ts"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/utils/contract.ts"
```

This file defines the contract address, ABI, and functions to create a viem [contract instance](https://viem.sh/docs/contract/getContract#contract-instances){target=\_blank} for reading and writing operations. viem's contract utilities ensure a more efficient and type-safe interaction with smart contracts.

## Create the Wallet Connection Component

Now, let's create a component to handle wallet connections. Create a new file called `components/WalletConnect.tsx`:

```typescript title="WalletConnect.tsx"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/components/WalletConnect.tsx"
```

This component handles connecting to the wallet, switching networks if necessary, and keeping track of the connected account. It provides a button for users to connect their wallet and displays the connected account address once connected.

To use this component in your dApp, replace the existing boilerplate in `app/page.tsx` with the following code:

```typescript title="page.tsx"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx:4:4"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx:7:20"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx:23:25"
```

Now you're ready to run your dApp. From your project directory, execute:

```bash
npm run dev
```

Navigate to `http://localhost:3000` in your browser, and you should see your dApp with the wallet connection button, the stored number display, and the form to update the number.

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/create-dapp-viem-2.webp)

## Create the Read Contract Component

Now, let's create a component to read data from the contract. Create a file called `components/ReadContract.tsx`:

```typescript title="ReadContract.tsx"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/components/ReadContract.tsx"
```

This component reads the `storedNumber` value from the contract and displays it to the user. It also sets up a polling interval to refresh the data periodically, ensuring that the UI stays in sync with the blockchain state.

To reflect this change in your dApp, incorporate this component into the `app/page.tsx` file.

```typescript title="page.tsx"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx:5:5"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx:7:21"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx:23:25"
```

And you will see in your browser:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/create-dapp-viem-3.webp)

## Create the Write Contract Component

Finally, let's create a component that allows users to update the stored number. Create a file called `components/WriteContract.tsx`:

```typescript title="WriteContract.tsx"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/components/WriteContract.tsx"
```

This component allows users to input a new number and send a transaction to update the value stored in the contract. It provides appropriate feedback during each step of the transaction process and handles error scenarios.

Update the `app/page.tsx` file to integrate all components:

```typescript title="page.tsx"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.2/viem-dapp/app/page.tsx"
```
After that, you will see:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-viem/create-dapp-viem-4.webp)

## How It Works

Let's examine how the dApp interacts with the blockchain:

1. **Wallet Connection**: 
    - The `WalletConnect` component uses the browser's Ethereum provider (MetaMask) to connect to the user's wallet
    - It handles network switching to ensure the user is connected to the Polkadot Hub TestNet
    - Once connected, it provides the user's account address to the parent component

2. **Reading Data**:
    - The `ReadContract` component uses viem's `readContract` function to call the `storedNumber` view function
    - It periodically polls for updates to keep the UI in sync with the blockchain state
    - The component displays a loading indicator while fetching data and handles error states

3. **Writing Data**:
    - The `WriteContract` component uses viem's `writeContract` function to send a transaction to the `setNumber` function
    - It ensures the wallet is connected before allowing a transaction
    - The component shows detailed feedback during transaction submission and confirmation
    - After a successful transaction, the value displayed in the `ReadContract` component will update on the next poll

## Conclusion

Congratulations! You've successfully built a fully functional dApp that interacts with a smart contract on Polkadot Hub using viem and Next.js. Your application can now:

- Connect to a user's wallet and handle network switching
- Read data from a smart contract and keep it updated
- Write data to the blockchain through transactions

These fundamental skills provide the foundation for building more complex dApps on Polkadot Hub. With this knowledge, you can extend your application to interact with more sophisticated smart contracts and create advanced user interfaces.

To get started right away with a working example, you can clone the repository and navigate to the implementation:

```
git clone https://github.com/polkadot-developers/polkavm-storage-contract-dapps.git -b v0.0.2
cd polkavm-storage-contract-dapps/viem-dapp
```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Create a dApp with Wagmi__

    ---

    Learn how to build a decentralized application by using the Wagmi framework.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/libraries/wagmi)

</div>
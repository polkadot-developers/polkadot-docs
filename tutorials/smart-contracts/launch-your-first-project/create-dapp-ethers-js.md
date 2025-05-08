---
title: Create a dApp With Ethers.js
description: Learn how to build a decentralized application on Asset Hub using Ethers.js and Next.js by creating a simple dApp that interacts with a smart contract.
tutorial_badge:  Intermediate
---

# Create a dApp With Ethers.js

## Introduction

Decentralized applications (dApps) have become a cornerstone of the Web3 ecosystem, allowing developers to create applications that interact directly with blockchain networks. Asset Hub, a blockchain that supports smart contract functionality, provides an excellent platform for deploying and interacting with dApps.

In this tutorial, you'll build a complete dApp that interacts with a smart contract deployed on Asset Hub. It will use [Ethers.js](/develop/smart-contracts/libraries/ethers-js){target=\_blank} to interact with the blockchain and [Next.js](https://nextjs.org/){target=\_blank} as the frontend framework. By the end of this tutorial, you'll have a functional dApp that allows users to connect their wallets, read data from the blockchain, and execute transactions.

## Prerequisites

Before you begin, make sure you have:

- [Node.js](https://nodejs.org/en){target=\_blank} v16 or newer installed on your machine
- A crypto wallet (like MetaMask) with some test tokens. For further information, check the [Connect to Asset Hub](/develop/smart-contracts/connect-to-asset-hub){target=\_blank} guide
- Basic understanding of React and JavaScript
- Familiarity with blockchain concepts and Solidity (helpful but not mandatory)

## Project Overview

The dApp will interact with a simple Storage contract. For a step-by-step guide on creating it, refer to the [Create Contracts](/tutorials/smart-contracts/launch-your-first-project/create-contracts){target=\_blank} tutorial. This contract allows:

- Reading a stored number from the blockchain
- Updating the stored number with a new value

The contract has already been deployed to Westend Asset Hub for testing purposes: `0xabBd46Ef74b88E8B1CDa49BeFb5057710443Fd29`. If you want to deploy your own, follow the [Deploying Contracts](/develop/smart-contracts/dev-environments/remix/#deploying-contracts){target=\_blank} section.

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

```
npx create-next-app ethers-dapp --js --eslint --tailwind --app --yes
cd ethers-dapp
```

Next, install the needed dependencies:

```
npm install ethers@{{ dependencies.javascript_packages.ethersjs.version }}
```

## Connect to Asset Hub

To interact with Asset Hub (Westend Asset Hub in this case), you need to set up an [Ethers.js Provider](/develop/smart-contracts/libraries/ethers-js/#set-up-the-ethersjs-provider){target=\_blank} that connects to the blockchain. Create a new file called `utils/ethers.js` and add the following code:

```javascript title="ethers.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/utils/ethers.js"
```
This file establishes a connection to Asset Hub and provides helper functions for obtaining a [Provider](https://docs.ethers.org/v5/api/providers/provider/){target=_blank} and [Signer](https://docs.ethers.org/v5/api/signer/){target=_blank}. The provider allows you to read data from the blockchain, while the signer enables users to send transactions and modify the blockchain state.

## Set Up the Smart Contract Interface

For this dApp, you'll use a simple Storage contract already deployed. So, you need to create an interface to interact with it. First, ensure to create a folder called `abis` at the root of your project, create a file `Storage.json`, and paste the corresponding ABI (Application Binary Interface) of the Storage contract. You can copy and paste the following:

??? code "Storage.sol ABI"

    ```json title="Storage.json"
    --8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/abis/Storage.json"
    ```

Now, create a file called `utils/contract.js`:

```javascript title="contract.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/utils/contract.js"
```

This file defines the contract address, ABI, and functions to create instances of the contract for reading and writing.

## Create the Wallet Connection Component

Next, let's create a component to handle wallet connections. Create a new file called `components/WalletConnect.js`:

```javascript title="WalletConnect.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/components/WalletConnect.js"
```

This component handles connecting to the wallet, switching networks if necessary, and keeping track of the connected account. 

To integrate this component to your dApp, you need to overwrite the existing boilerplate in `app/page.js` with the following code:

```javascript title="page.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js::5"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js:8:21"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js:24:26"
```

In your terminal, you can launch your project by running:

```bash
npm run dev
```

And you will see the following:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-2.webp)

## Read Data from the Blockchain

Now, let's create a component to read data from the contract. Create a file called `components/ReadContract.js`:

```javascript title="ReadContract.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/components/ReadContract.js"
```

This component reads the `storedNumber` value from the contract and displays it to the user. It also sets up a polling interval to refresh the data periodically.

To see this change in your dApp, you need to integrate this component into the `app/page.js` file:

```javascript title="page.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js::6"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js:8:22"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js:24:26"
```

Your dApp will automatically be updated to the following:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-3.webp)

## Write Data to the Blockchain

Finally, let's create a component that allows users to update the stored number. Create a file called `components/WriteContract.js`:

```javascript title="WriteContract.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/components/WriteContract.js"
```

This component allows users to input a new number and send a transaction to update the value stored in the contract. When the transaction is successful, users will see the stored value update in the `ReadContract` component after the transaction is confirmed.

Update the `app/page.js` file to integrate all components:

```javascript title="page.js"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-storage-contract-dapps/refs/tags/v0.0.1/ethers-dapp/app/page.js"
```

The completed UI will display:

![](/images/tutorials/smart-contracts/launch-your-first-project/create-dapp-ethers-js/create-dapp-ethers-js-4.webp)

## Conclusion

Congratulations! You've built a complete dApp that interacts with a smart contract on Asset Hub using Ethers.js and Next.js. Your application can now:

- Connect to a user's wallet
- Read data from a smart contract
- Send transactions to update the contract state

These fundamental skills provide the foundation for building more complex dApps on Asset Hub. With these building blocks, you can extend your application to interact with more sophisticated smart contracts and create more advanced user interfaces.

To get started right away with a working example, you can clone the repository and navigate to the implementation:

```
git clone https://github.com/polkadot-developers/polkavm-storage-contract-dapps.git -b v0.0.1
cd polkavm-storage-contract-dapps/ethers-dapp
```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Create a dApp with WAGMI__

    ---

    Learn how to build a decentralized application by using the WAGMI framework.

    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/create-dapp-wagmi/)

</div>

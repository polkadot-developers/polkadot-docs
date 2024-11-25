---
title: Native EVM Contracts
description: Deploy Solidity smart contracts directly on Asset Hub with PolkaVM, a high-performance virtual machine enabling native EVM support in Polkadot.
---

# Native EVM Contracts

## Introduction

The Asset Hub parachain is the cornerstone of asset management within the Polkadot ecosystem, providing seamless, secure access to digital assets. Native EVM contracts allow developers to deploy Solidity-based smart contracts directly on Asset Hub, enhancing developer efficiency and simplifying application design. This approach eliminates the complexity of asynchronous cross-chain communication and avoids the overhead of additional governance systems or tokens.

This guide will help you understand the role of native EVM contracts and how they integrate with the Polkadot ecosystem. You will explore the components powering this functionality, including PolkaVM and Revive, and learn how to deploy and interact with smart contracts on Asset Hub using tools like MetaMask, Revive Remix, and Ethers.js.

By enabling native smart contract deployment, Polkadot's Asset Hub streamlines blockchain development while preserving its secure, scalable foundation.

## Components

The native EVM contracts feature leverages several powerful components to deliver high performance and Solidity compatibility:

- [**`pallet_revive`**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} - a runtime module that executes smart contracts by adding extrinsics, runtime APIs, and logic to convert Ethereum-style transactions into formats compatible with the blockchain. The workflow is as follows: 

    - Transactions are sent via a proxy server emulating Ethereum JSON RPC
    - The proxy converts Ethereum transactions into a special dispatchable, leaving the payload intact 
    - The pallet's logic decodes and transforms these transactions into a format compatible with the blockchain

    Using a proxy avoids modifying the node binary, ensuring compatibility with alternative clients without requiring additional implementation.

- [**PolkaVM**](https://github.com/paritytech/polkavm){target=\_blank} - a custom virtual machine optimized for performance with RISC-V-based architecture, supporting Solidity and additional high-performance languages

- [**Revive**](https://github.com/paritytech/revive){target=\_blank} - compiles Solidity for PolkaVM by translating the solc compiler's [YUL](https://docs.soliditylang.org/en/latest/yul.html){target=\_blank} output into RISC-V. This translation simplifies development and ensures full compatibility with all Solidity versions and features

- [**Revive Remix**](https://github.com/paritytech/revive-remix){target=\_blank} - a modified fork of Remix IDE supporting backend compilation via LLVM-based Revive. Allows for efficient Solidity contract deployment on Polkadot

## PolkaVM

PolkaVM is a cutting-edge virtual machine tailored to optimize smart contract execution on Polkadot. Unlike traditional Ethereum Virtual Machines (EVM), PolkaVM is built with a RISC-V-based register architecture and a 64-bit word size, enabling:

- Faster arithmetic operations and efficient hardware translation
- Seamless integration of high-performance languages like C and Rust for advanced optimization
- Improved scalability for modern blockchain applications

### Compared to Traditional EVMs

- **Architecture** - PolkaVM's register-based design offers significant performance improvements over Ethereum's stack-based EVM. It allows for faster compilation times and aligns better with modern hardware, reducing bottlenecks in contract execution
- **Gas modeling** - PolkaVM employs a multi-dimensional gas model, metering resources like computation time, storage, and proof sizes. This ensures more accurate cost assessments for contract execution, reducing overcharging for memory allocation and enabling efficient cross-contract calls
- **Compatibility** - while optimized for performance, PolkaVM remains compatible with Ethereum tools through a closely mirrored RPC interface, with minor adjustments for certain operations. It also hides the existential deposit requirement, simplifying user interactions by abstracting balance limitations

### Performance Benefits

PolkaVM's innovations translate into significant performance gains, such as:

- **Enhanced developer experience** - faster execution and better tooling support
- **Optimized resource use** - reduced transaction costs with precise metering
- **Broader language support** - potential integration of languages like Rust and C for specialized use cases

By combining advanced performance optimizations with Ethereum compatibility, PolkaVM bridges the gap between cutting-edge blockchain development and the familiar tools developers rely on.

## Deploy a Smart Contract to Asset Hub

The following sections guide you through the steps to connect to Asset Hub, deploy a smart contract, and interact with the contract using Ethers.js.

### Connect to Asset Hub

Install any EVM-compatible wallet. To follow this example, install the [MetaMask browser extension](https://metamask.io/download/){target=\_blank} and add the Westend TestNet Asset Hub as a custom network using the following settings:

- **Network name** - `Asset-Hub Westend Testnet`
- **RPC URL** - `https://westend-asset-hub-eth-rpc.polkadot.io`
- **Chain ID** - `420420421`
- **Currency symbol** - `WND`
- **Block explorer URL** - [`https://assethub-westend.subscan.io`](https://assethub-westend.subscan.io){target=\_blank}

### Deploy a Contract

To deploy a contract to the Westend Asset Hub, you must get WND tokens. To do so, you can use the [Westend Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}. You need to specify the address where you want to receive the tokens from the faucet.

For deploying and interacting with contracts in [Revive Remix](https://remix.polkadot.io/){target=\_blank}, you can use the following steps:

1. Open the Remix IDE, select any Solidity contract available, and compile it using the **▶️** button or the **Solidity Compiler** tab

    ![](/images/develop/smart-contracts/native-evm-contracts/native-evm-contracts-1.webp)

2. Deploy the contract
    1. Click on the **Deploy & Run** tab
    2. Choose the **Westend TestNet - Metamask** button. Your account address and balance will appear in the **ACCOUNT** field
    3. Click on the **Deploy** button to launch the contract

        ![](/images/develop/smart-contracts/native-evm-contracts/native-evm-contracts-2.webp)

After deployment, you can interact with the contract listed in the **Deployed/Unpinned Contracts** section within the **Deploy & Run** tab. You can either call the smart contract methods or run tests against the contract to see if it works as expected.

### Use Ethers.js to Interact

Once deployed, you can use the [Ethers.js](https://docs.ethers.org/v6/){target=\_blank} library to allow your application to interact with the contract. This library provides the tools needed to query data, send transactions, and listen to events through a provider, which links your application and the blockchain.

- In browsers, providers are available through wallets like [MetaMask](https://metamask.io/){target=\_blank}, which inject an `ethereum` object into the `window`. Ensure that Metamask is installed and connected to Westend Asset Hub

    ```js
    --8<-- 'code/develop/smart-contracts/native-evm-contracts/ether-js-browser-connection.js'
    ```

- For server-side applications, `JsonRpcProvider` can connect directly to RPC nodes:

    ```js
    --8<-- 'code/develop/smart-contracts/native-evm-contracts/ether-js-server-connection.js'
    ```

Once your application is connected, you can retrieve network data, access contract methods, and fully interact with the deployed smart contract.

## Where to Go Next

For further information about the Asset Hub smart contracts, please refer to the [official documentation](https://contracts.polkadot.io/){target=\_blank}.

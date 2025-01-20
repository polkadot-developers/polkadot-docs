---
title: Using Remix IDE
description: Explore the smart contract development and deployment process on Asset Hub using Remix IDE, a visual IDE for blockchain developers.
---

# Remix IDE

## Overview

Remix IDE is a robust browser-based development environment for smart contracts. This guide will walk you through the essentials of the [Polkadot Remix IDE](https://remix.polkadot.io/){target=\_blank} to understand the processes of compiling, developing, and deploying smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- A web browser with [MetaMask](https://metamask.io/) extension installed
- Basic understanding of Solidity programming
- Some test tokens to cover transaction fees (easily obtainable from [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank})

## Accessing Remix IDE

Navigate to [https://remix.polkadot.io/](https://remix.polkadot.io/){target=\_blank}. The interface will load with a default workspace containing sample contracts.

![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-1.webp)

The interface is organized into three main sections: the Extensions panel on the right, the Code Editor in the center, and the File Explorer on the left.

## Creating a New Contract

To create a new contract using the Polkadot Remix IDE, you can follow these steps:

1. Click the **Create a new file** button in the **contracts** folder

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-2.webp)

2. Name your file with a `.sol` extension, in this case, `Counter.sol`

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-3.webp)

3. Write your Solidity code in the editor

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-4.webp)

    The code of the contract above is the following:

    ???- "Counter.sol"
        
        ```solidity
        --8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/remix/Counter.sol'
        ```

## Compiling Your Contract

1. To compile your contract, you need to

    1. Navigate to the Solidity Compiler tab (third icon in the left sidebar)
    2. Click "Compile" or use `Ctrl+S`

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-5.webp)
    
        !!! note
            Compilation errors and warnings appear in the terminal panel at the bottom of the screen

After compiling your contract, you can navigate to the **File Explorer** tab (first icon in the left sidebar) and check that the **artifact** folder exists and that the **Counter_metadata.json** and **Counter.json** files have also been created.

![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-6.webp)

## Deploying Contracts

1. To deploy your contract, you need to

    1. Navigate to the **Deploy & Run Transactions** tab (fourth icon in the left sidebar)
    2. Select your deployment environment, in this case, **Westend Testnet - MetaMask**
    3. Click in the **Deploy and Confirm** button

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-7.webp)

Once your contract is deployed successfully, you will see the following output in the REMIX terminal:

![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-8.webp)

## Interacting with Contracts

Once deployed, your contract appears in the **Deployed/Unpinned Contracts** section:

1. Expand the contract to view available methods

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-9.webp)

    !!! tip
        Pin your frequently used contracts to the **Pinned Contracts** section for easy access.

2. To interact with the contract, you can click on any of the exposed methods

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-10.webp)

    In this manner, you can interact with your deployed contract either by reading its state or by writing to it.

## Where to Go Next

The Polkadot Remix IDE offers a robust environment for developing, compiling, and deploying smart contracts on Asset Hub. Its intuitive interface allows developers to easily write Solidity code, compile contracts, and interact with them directly in the browser.

Explore more about smart contracts through these resources:

- [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank} repository – learn about EVM compatibility on Polkadot-SDK-based chains
- [Smart Contracts on Polkadot](/develop/smart-contracts/){target=\_blank} – dive into advanced contract development techniques
- [OpenZeppelin contracts](https://www.openzeppelin.com/solidity-contracts){target=\_blank} – test your skills by deploying a sample dApp
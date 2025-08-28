---
title: Use the Polkadot Remix IDE
...
description: Explore the smart contract development and deployment process on Asset Hub using Remix
  IDE, a visual IDE for blockchain developers.
...
categories: Smart Contracts, Tooling
...
url: https://docs.polkadot.com/develop/smart-contracts/dev-environments/remix/
...
---

# Remix IDE

-!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

<div class="grid cards" markdown>
-   :octicons-code-16:{ .lg .middle } __Deploy NFTs Using Remix IDE__

    ---

    Mint your NFT on Polkadot's Asset Hub. Use PolkaVM and OpenZeppelin to bring your digital asset to life with Polkadot Remix IDE.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/deploy-nft){target=\_blank}

-   :octicons-code-16:{ .lg .middle } __Deploy ERC20s Using Remix IDE__

    ---

    Mint your custom ERC-20 token on Polkadot's Asset Hub. Leverage PolkaVM and Polkadot Remix IDE to bring your blockchain project to life.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/deploy-erc20){target=\_blank}
</div>

!!! warning
    The Polkadot Remix IDE's contract compilation functionality is currently limited to Google Chrome. Alternative browsers are not recommended for this task.

## Overview

Remix IDE is a robust browser-based development environment for smart contracts. This guide will walk you through the essentials of the [Polkadot Remix IDE](https://remix.polkadot.io/){target=\_blank} to understand the processes of compiling, developing, and deploying smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- A web browser with [Talisman](https://talisman.xyz/){target=\_blank} extension installed.
- Basic understanding of Solidity programming.
- Some WND test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}).

## Accessing Remix IDE

Navigate to [https://remix.polkadot.io/](https://remix.polkadot.io/){target=\_blank}. The interface will load with a default workspace containing sample contracts.

![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-1.webp)

In this interface, you can access a file explorer, edit your code, interact with various plugins for development, and use a terminal.

## Creating a New Contract

To create a new contract using the Polkadot Remix IDE, you can follow these steps:

1. Select the **Create a new file** button in the `contracts` folder.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-2.webp)

2. Name your file with a `.sol` extension, in this case, `Counter.sol`.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-3.webp)

3. Write your Solidity code in the editor.

    You can use the following code as an example:

    ???- "Counter.sol"
        
        ```solidity
        -// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    int256 private count;

    function increment() public {
        count += 1;
    }

    function decrement() public {
        count -= 1;
    }

    function getCount() public view returns (int256) {
        return count;
    }
}
        ```

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-4.webp)


## Compiling Your Contract

1. To compile your contract, you need to:

    1. Navigate to the **Solidity Compiler** tab (third icon in the left sidebar).
    2. Select **Compile** or use `Ctrl+S`.

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-5.webp)
    
        !!! note
            Compilation errors and warnings appear in the terminal panel at the bottom of the screen.

1. After compiling your contract, you can navigate to the **File Explorer** tab (first icon in the left sidebar) and check that:
    1. The `artifact` folder is present.
    2. The `Counter_metadata.json` and the `Counter.json` files have been generated.

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-6.webp)

## Deploying Contracts

1. To deploy your contract, you need to:

    1. Navigate to the **Deploy & Run Transactions** tab (fourth icon in the left sidebar).
    2. Click the **Environment** dropdown.
    3. Select **Customize this list**.

        ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-7.webp)

2. Enable the **Injected Provider - Talisman** option.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-8.webp)

4. Click again the **Environment** dropdown and select **Injected Provider - Talisman**.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-9.webp)

4. Click the **Deploy** button and then click **Approve** in the Talisman wallet popup.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-10.webp)

5. Once your contract is deployed successfully, you will see the following output in the Remix terminal:

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-11.webp)

## Interacting with Contracts

Once deployed, your contract appears in the **Deployed/Unpinned Contracts** section:

1. Expand the contract to view available methods.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-12.webp)

    !!! tip
        Pin your frequently used contracts to the **Pinned Contracts** section for easy access.

2. To interact with the contract, you can select any of the exposed methods.

    ![](/images/develop/smart-contracts/evm-toolkit/dev-environments/remix/remix-13.webp)

    In this way, you can interact with your deployed contract by reading its state or writing to it. The button color indicates the type of interaction available:

    - **Red**: Modifies state and is payable.
    - **Orange**: Modifies state only.
    - **Blue**: Reads state.

## Where to Go Next

The Polkadot Remix IDE offers an environment for developing, compiling, and deploying smart contracts on Asset Hub. Its intuitive interface allows developers to easily write Solidity code, compile contracts, and interact with them directly in the browser.

Explore more about smart contracts through these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Smart Contracts on Polkadot__

    ---

    Dive into advanced smart contract concepts.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/)

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Test your skills by deploying a simple contracts with prebuilt templates.

    [:octicons-arrow-right-24: Get Started](https://www.openzeppelin.com/solidity-contracts){target=\_blank}

</div>

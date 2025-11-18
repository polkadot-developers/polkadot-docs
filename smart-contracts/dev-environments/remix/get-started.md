---
title: Use the Remix IDE on Polkadot Hub
description: Explore the smart contract development and deployment process on Polkadot Hub using Remix IDE, a visual IDE for blockchain developers.
categories: Smart Contracts, Tooling
---

# Remix IDE

## Introduction

Remix IDE is a robust browser-based development environment for smart contracts. This guide will walk you through the essentials of the [Remix IDE](https://remix.ethereum.org/){target=\_blank} to understand the processes of compiling, developing, and deploying smart contracts on Polkadot Hub.

## Prerequisites

Before getting started, ensure you have:

- A web browser with the [MetaMask](https://metamask.io/){target=\_blank} extension installed.
- Basic understanding of Solidity programming.
- Some test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank}).

## Access Remix IDE

Navigate to [https://remix.ethereum.org/](https://remix.ethereum.org/){target=\_blank}. The interface will load with a default workspace containing sample contracts.

![](/images/smart-contracts/dev-environments/remix/get-started/remix-1.webp)

In this interface, you can access a file explorer, edit your code, interact with various development plugins, and use a terminal.

## Create a New Contract

To create a new contract using the Remix IDE, you can follow these steps:

1. Select the **Create a new file** button in the `contracts` folder.

2. Name your file with a `.sol` extension, in this case, `Counter.sol`.

3. Write your Solidity code in the editor. You can use the following code as an example:

    ??? code "Counter.sol"
        
        ```solidity
        --8<-- 'code/smart-contracts/dev-environments/remix/get-started/Counter.sol'
        ```

    ![](/images/smart-contracts/dev-environments/remix/get-started/remix-2.gif)


## Compile Your Contract

To compile your contract, you need to:

1. Navigate to the **Solidity Compiler** tab.
2. Select **Compile** or use `Ctrl+S`.

    !!! note
        Compilation errors and warnings appear in the terminal panel at the bottom of the screen.

3. After compiling your contract, you can navigate to the **File Explorer** tab and check that:
    1. The **artifacts** folder is present.
    2. The `Counter_metadata.json` and the `Counter.json` files have been generated.

        ![](/images/smart-contracts/dev-environments/remix/get-started/remix-3.gif)

## Where to Go Next

Remix offers an environment for developing, compiling, and deploying smart contracts on Polkadot Hub. Its intuitive interface allows developers to easily write Solidity code, compile contracts, and interact with them directly in the browser.

Explore more about smart contracts through these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy a Contract__

    ---

    Learn how to deploy smart contracts using Remix IDE.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/deploy-a-contract/)

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Test your skills by deploying simple contracts using prebuilt templates.

    [:octicons-arrow-right-24: Get Started](https://www.openzeppelin.com/solidity-contracts){target=\_blank}

</div>

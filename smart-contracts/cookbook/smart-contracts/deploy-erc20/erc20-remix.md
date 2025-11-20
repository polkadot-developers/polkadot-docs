---
title: Deploy ERC-20 Using Remix IDE
description: Deploy an ERC-20 token contract on Polkadot Hub. This guide covers contract creation, compilation, deployment, and interaction via the Remix IDE.
tutorial_badge: Beginner
categories: Basics, Smart Contracts
tools: EVM Wallet, Remix
---

# Deploy an ERC-20 Using Remix IDE

## Introduction

[ERC-20](https://eips.ethereum.org/EIPS/eip-20){target=\_blank} tokens are fungible tokens commonly used for creating cryptocurrencies, governance tokens, and staking mechanisms. Polkadot Hub enables easy token deployment with Ethereum-compatible smart contracts and tools via the EVM backend.

This tutorial covers deploying an ERC-20 contract on the Polkadot Hub TestNet using [Remix IDE](https://remix.ethereum.org/){target=\_blank}, a web-based development tool. The ERC-20 contract can be retrieved from OpenZeppelin's [GitHub repository]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/token/ERC20){target=\_blank} or their [Contract Wizard](https://wizard.openzeppelin.com/){target=\_blank}.

## Prerequisites

Before you begin, ensure you have:

- A basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} programming and [ERC-20](https://ethereum.org/developers/docs/standards/tokens/erc-20/){target=\_blank} fungible tokens.
- An EVM-compatible [wallet](/smart-contracts/integrations/wallets){target=\_blank} connected to Polkadot Hub. This example utilizes [MetaMask](https://metamask.io/){target=\_blank}.
- Test tokens for gas fees, available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet.

## Create Your Contract

Follow the steps below to create the ERC-20 contract:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}.
2. Select the **Create new file** button under the **contracts** folder, and name your contract `MyToken.sol`.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix/erc20-remix-1.webp)

3. Now, paste the following ERC-20 contract code into `MyToken.sol`:

    ```solidity title="MyToken.sol"
    --8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/refs/heads/master/erc20-hardhat/contracts/MyToken.sol'
    ```
    
    !!! tip
        The [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} was used to generate this example ERC-20 contract.
        
## Compile the Contract

Solidity source code compiles into bytecode that can be deployed on the blockchain. During this process, the compiler checks the contract for syntax errors, ensures type safety, and generates the machine-readable instructions needed for blockchain execution.

Ensure your contract is open in the Remix IDE Editor, and use the following steps to compile:

1. Select the **Solidity Compiler** plugin from the left panel.
2. Select the **Compile MyToken.sol** button.
3. The **Solidity Compiler** icon will display a green checkmark once the contract compiles successfully. 

If any issues arise during contract compilation, errors and warnings will appear in the terminal panel at the bottom of the screen.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix/erc20-remix-3.gif)

## Deploy the Contract

Follow these steps to deploy the contract using Remix:

1. Select **Deploy & Run Transactions** from the left panel.
2. Select the **Environment** dropdown and select **Injected Provider - MetaMask** (ensure your MetaMask wallet is connected to Polkadot Hub TestNet).
3. Configure the contract parameters by entering the address that will own the deployed token contract.
4. Click the **Deploy** button to initiate the deployment.
5. Approve the transaction in your MetaMask wallet.
6. You will see the transaction details in the terminal when the deployment succeeds, including the contract address and deployment transaction hash.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix/erc20-remix-4.gif)

## Interact with the Contract

Once deployed, you can interact with your contract through Remix. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods. In this example, you'll mint some tokens to a given address using the following steps:

1. Expand the **mint** function:
    1. Enter the recipient address and the amount (remember to add 18 zeros for one whole token).
    2. Click **transact**.

2. Approve the transaction in the MetaMask popup.

3. If the transaction succeeds, you will see a green check mark in the terminal.

4. You can also call the **balanceOf** function by passing the address of the **mint** call to confirm the new balance.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix/erc20-remix-5.gif)

Feel free to explore and interact with the contract's other functions by selecting the method, providing any required parameters, and confirming the transaction in MetaMask when prompted.

Congratulations! You've successfully deployed an ERC-20 token contract to Polkadot Hub TestNet using Remix IDE. Consider the following resources to build upon your progress. 

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy an NFT with Remix__

    ---

    Walk through deploying an ERC-721 Non-Fungible Token (NFT) using OpenZeppelin's battle-tested NFT implementation and Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/)

</div>
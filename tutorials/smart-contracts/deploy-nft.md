---
title: Deploy a NFT to Asset Hub
description: Deploy an NFT on Asset Hub using PolkaVM and OpenZeppelin. Learn how to compile, deploy, and interact with your contract using Polkadot Remix IDE.
---

# Deploy NFT to Asset Hub

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification. Asset Hub supports EVM-compatible smart contracts through PolkaVM, enabling straightforward NFT deployment. This tutorial guides you through deploying an NFT contract on the Westend TestNet using the [Polkadot Remix IDE](https://polkadot.remix.io){target=\_blank}, a web-based development environment. This tutorial uses [OpenZeppelin's NFT contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.0.0){target=\_blank} implementation to ensure security and standard compliance.

## Prerequisites

Before starting, make sure you have:

- MetaMask installed and connected to Westend Asset Hub
- A funded account with some WND tokens (you can get them from the [Westend Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank})
- Basic understanding of Solidity and NFTs

## Creating the NFT Contract

To create the NFT contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://polkadot.remix.io){target=\_blank}
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyNFT.sol`

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-1.webp)

3. Now, paste the following NFT contract code into the editor

    ```solidity title="MyNFT.sol"
    --8<-- 'code/tutorials/smart-contracts/deploy-nft/MyNFT.sol'
    ```

    The key components of the code above are:

    - Contract Imports

        - [`ERC721.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC721/ERC721.sol){target=\_blank} - the base contract for non-fungible tokens, implementing core NFT functionality like transfers and approvals
        - [`Ownable.sol`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/access/Ownable.sol){target=\_blank} - provides basic authorization control, ensuring only the contract owner can mint new tokens
    
    - Constructor Parameters

        - `initialOwner` - sets the address that will have administrative rights over the contract
        - `"MyToken"` - the full name of your NFT collection
        - `"MTK"`- the symbol representing your token in wallets and marketplaces

    - Key Function

        - [`_safeMint(to, tokenId)`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC721/ERC721.sol#L304){target=\_blank} - an internal function from `ERC721` that safely mints new tokens. It includes checks to ensure the recipient can handle ERC721 tokens (important when minting to smart contracts)

    !!! tip
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} to generate customized smart contracts quickly. Simply configure your contract, copy the generated code, and paste it into Polkadot Remix IDE for deployment.

## Compiling the Contract

1. Select the **Solidity Compiler** plugin from the left panel

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-3.webp)

3. Click in the **Compile MyNFT.sol** button

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-4.webp)

4. If the compilation succeeded, you can see a green checkmark indicating success in the **Solidity Compiler** icon

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-5.webp)

## Deploying the Contract

1. Select the **Deploy & Run Transactions** plugin from the left panel

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-6.webp)

2. Configure the deployment settings
    1. From the **ENVIRONMENT** dropdown, select **Westend Testnet - MetaMask**
    2. From the **ACCOUNT** dropdown, select the account you want to use for the deploy

        ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-7.webp)

3. Configure the contract parameters
    1. Enter the address that will own the deployed NFT.
    2. Click the **Deploy** button to initiate the deployment

        ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-8.webp)

4. MetaMask will pop up - review the transaction details. Click **Confirm** to deploy your contract

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-9.webp){: .browser-extension}

    If the deployment process succeeded, you will see the following output in the terminal:

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-10.webp)

## Interacting with Your NFT Contract

Once deployed, you can interact with your contract through Remix:

1. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods for the contract

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-11.webp)

2. To mint an NFT

    1. Click in the contract to expand its associated methods
    1. Expand the **safeMint** function
    2. Enter the recipient address
    3. Click **Transact**

        ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-12.webp)

3. Click **Confirm** to confirm the transaction in MetaMask

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-13.webp){: .browser-extension}

    If the transaction is successful, the terminal will display the following output, which details the information about the transaction, including the transaction hash, the block number, the logs associated, and so on.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-14.webp)

Feel free to explore and interact with the contract's other functions using the same approach - selecting the method, providing any required parameters, and confirming the transaction through MetaMask when needed.
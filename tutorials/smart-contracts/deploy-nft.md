---
title: Deploy an NFT to Asset Hub
description: Deploy an NFT on Asset Hub using PolkaVM and OpenZeppelin. Learn how to compile, deploy, and interact with your contract using Polkadot Remix IDE.
---

# Deploy an NFT to Asset Hub

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification. Asset Hub supports EVM-compatible smart contracts through PolkaVM, enabling straightforward NFT deployment.

This tutorial guides you through deploying an [ERC-721](https://eips.ethereum.org/EIPS/eip-721){target=\_blank} NFT contract on the Westend TestNet using the [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}, a web-based development environment. It uses [OpenZeppelin's NFT contracts]({{ dependencies.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.open_zeppelin_contracts.version}}){target=\_blank} implementation to ensure security and standard compliance.

## Prerequisites

Before starting, make sure you have:

- MetaMask installed and connected to Westend Asset Hub
- A funded account with some WND tokens (you can get them from the [Westend Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank})
- Basic understanding of Solidity and NFTs

## Create the NFT Contract

To create the NFT contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io/){target=\_blank}
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyNFT.sol`

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-1.webp)

3. Now, paste the following NFT contract code into the editor

    ```solidity title="MyNFT.sol"
    --8<-- 'code/tutorials/smart-contracts/deploy-nft/MyNFT.sol'
    ```

    The key components of the code above are:

    - Contract imports

        - [**`ERC721.sol`**]({{ dependencies.open_zeppelin_contracts.repository_url }}/blob/{{ dependencies.open_zeppelin_contracts.version }}/contracts/token/ERC721/ERC721.sol){target=\_blank} - the base contract for non-fungible tokens, implementing core NFT functionality like transfers and approvals
        - [**`Ownable.sol`**]({{ dependencies.open_zeppelin_contracts.repository_url }}/blob/{{ dependencies.open_zeppelin_contracts.version }}/contracts/access/Ownable.sol){target=\_blank} - provides basic authorization control, ensuring only the contract owner can mint new tokens
    
    - Constructor parameters

        - **`initialOwner`** - sets the address that will have administrative rights over the contract
        - **`"MyToken"`** - the full name of your NFT collection
        - **`"MTK"`** - the symbol representing your token in wallets and marketplaces

    - Key functions

        - [**`_safeMint(to, tokenId)`**]({{ dependencies.open_zeppelin_contracts.repository_url }}/blob/{{ dependencies.open_zeppelin_contracts.version }}/contracts/token/ERC721/ERC721.sol#L304){target=\_blank} - an internal function from `ERC721` that safely mints new tokens. It includes checks to ensure the recipient can handle ERC721 tokens (important when minting smart contracts)
        - Inherited [Standard ERC721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/){target=\_blank} functions:
            - **`transferFrom(address from, address to, uint256 tokenId)`** - transfers a specific NFT from one address to another
            - **`safeTransferFrom(address from, address to, uint256 tokenId)`** - safely transfers an NFT, including additional checks to prevent loss
            - **`approve(address to, uint256 tokenId)`** - grants permission for another address to transfer a specific NFT
            - **`setApprovalForAll(address operator, bool approved)`** - allows an address to manage all of the owner's NFTs
            - **`balanceOf(address owner)`** - returns the number of NFTs owned by a specific address
            - **`ownerOf(uint256 tokenId)`** - returns the current owner of a specific NFT

    !!! tip
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} to generate customized smart contracts quickly. Simply configure your contract, copy the generated code, and paste it into Polkadot Remix IDE for deployment.

## Compile the Contract

Compilation is an stage that converts your Solidity source code into bytecode suitable for deployment on the blockchain. Throughout this process, the compiler  examines your contract for syntax errors, verifies type safety, and produces the machine-readable instructions required for executing on the blockchain.

1. Select the **Solidity Compiler** plugin from the left panel

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-3.webp)

2. Click in the **Compile MyNFT.sol** button

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-4.webp)

3. If the compilation succeeded, you can see a green checkmark indicating success in the **Solidity Compiler** icon

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-5.webp)

## Deploy the Contract

Deployment is the process of uploading your compiled smart contract to the blockchain, allowing for interaction. During deployment, you will instantiate your contract on the blockchain, which involves:

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

## Interact with Your NFT Contract

Once deployed, you can interact with your contract through Remix:

1. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods for the contract

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-11.webp)

2. To mint an NFT

    1. Click on the contract to expand its associated methods
    2. Expand the **safeMint** function
    3. Enter the recipient address
    4. Click **Transact**

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-12.webp)

3. Click **Confirm** to confirm the transaction in MetaMask

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-13.webp){: .browser-extension}

    If the transaction is successful, the terminal will display the following output, which details the information about the transaction, including the transaction hash, the block number, the associated logs, and so on.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-14.webp)

Feel free to explore and interact with the contract's other functions using the same approach - selecting the method, providing any required parameters, and confirming the transaction through MetaMask when needed.
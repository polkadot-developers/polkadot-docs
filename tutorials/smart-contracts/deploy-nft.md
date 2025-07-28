---
title: Deploy an NFT to Polkadot Hub
description: Deploy an NFT on Polkadot Hub using PolkaVM and OpenZeppelin. Learn how to compile, deploy, and interact with your contract using Polkadot Remix IDE.
tutorial_badge: Beginner
---

# Deploy an NFT to Polkadot Hub

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification. Polkadot Hub supports Ethereum-compatible smart contracts through PolkaVM, enabling straightforward NFT deployment.

This tutorial guides you through deploying an [ERC-721](https://eips.ethereum.org/EIPS/eip-721) NFT contract on the Polkadot Hub TestNet using the [Polkadot Remix IDE](https://remix.polkadot.io), a web-based development environment. To ensure security and standard compliance, it uses [OpenZeppelin's NFT contracts]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}) implementation.

## Prerequisites

Before starting, make sure you have:

- [Talisman](https://talisman.xyz/) installed and connected to the Polkadot Hub TestNet. Check the [Connect to Polkadot](/develop/smart-contracts/connect-to-polkadot/) guide for more information
- A funded account with some PAS tokens (you can get them from the [Faucet](https://faucet.polkadot.io/?parachain=1111), noting that the faucet imposes a daily token limit, which may require multiple requests to obtain sufficient funds for testing)
- Basic understanding of Solidity and NFTs, see the [Solidity Basics](https://soliditylang.org/) and the [NFT Overview](https://ethereum.org/en/nft/) guides for more details

## Create the NFT Contract

To create the NFT contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io/)
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyNFT.sol`

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-1.webp)

3. Now, paste the following NFT contract code into the editor

    ```solidity title="MyNFT.sol"
    --8<-- 'https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/erc721-hardhat/contracts/MyNFT.sol'
    ```

    The key components of the code above are:

    - Contract imports

        - [**`ERC721.sol`**]({{ dependencies.repositories.open_zeppelin_contracts.repository_url }}/blob/{{ dependencies.repositories.open_zeppelin_contracts.version }}/contracts/token/ERC721/ERC721.sol) - the base contract for non-fungible tokens, implementing core NFT functionality like transfers and approvals
        - [**`Ownable.sol`**]({{ dependencies.repositories.open_zeppelin_contracts.repository_url }}/blob/{{ dependencies.repositories.open_zeppelin_contracts.version }}/contracts/access/Ownable.sol) - provides basic authorization control, ensuring only the contract owner can mint new tokens
    
    - Constructor parameters

        - **`initialOwner`** - sets the address that will have administrative rights over the contract
        - **`"MyToken"`** - the full name of your NFT collection
        - **`"MTK"`** - the symbol representing your token in wallets and marketplaces

    - Key functions

        - [**`_safeMint(to, tokenId)`**]({{ dependencies.repositories.open_zeppelin_contracts.repository_url }}/blob/{{ dependencies.repositories.open_zeppelin_contracts.version }}/contracts/token/ERC721/ERC721.sol#L304) - an internal function from `ERC721` that safely mints new tokens. It includes checks to ensure the recipient can handle `ERC721` tokens, with the `_nextTokenId` mechanism automatically generating unique sequential token IDs and the `onlyOwner` modifier restricting minting rights to the contract owner
        - Inherited [Standard ERC721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/) functions provide a standardized set of methods that enable interoperability across different platforms, wallets, and marketplaces, ensuring that your NFT can be easily transferred, traded, and managed by any system that supports the `ERC721` standard:
            - **`transferFrom(address from, address to, uint256 tokenId)`** - transfers a specific NFT from one address to another
            - **`safeTransferFrom(address from, address to, uint256 tokenId)`** - safely transfers an NFT, including additional checks to prevent loss
            - **`approve(address to, uint256 tokenId)`** - grants permission for another address to transfer a specific NFT
            - **`setApprovalForAll(address operator, bool approved)`** - allows an address to manage all of the owner's NFTs
            - **`balanceOf(address owner)`** - returns the number of NFTs owned by a specific address
            - **`ownerOf(uint256 tokenId)`** - returns the current owner of a specific NFT

    !!! tip
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/) to generate customized smart contracts quickly. Simply configure your contract, copy the generated code, and paste it into Polkadot Remix IDE for deployment. Below is an example of an ERC-721 token contract created with it:

        ![Screenshot of the OpenZeppelin Contracts Wizard showing an ERC-721 contract configuration.](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-2.webp)


## Compile the Contract

Compilation is a stage that converts your Solidity source code into bytecode suitable for deployment on the blockchain. Throughout this process, the compiler examines your contract for syntax errors, verifies type safety, and produces machine-readable instructions for execution on the blockchain.

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
    1. From the **ENVIRONMENT** dropdown, select **Injected Provider - Talisman** (check the [Deploying Contracts](/develop/smart-contracts/dev-environments/remix/#deploying-contracts) section of the Remix IDE guide for more details)
    2. From the **ACCOUNT** dropdown, select the account you want to use for the deploy

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-7.webp)

3. Configure the contract parameters
    1. Enter the address that will own the deployed NFT.
    2. Click the **Deploy** button to initiate the deployment

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-8.webp)

4. Talisman will pop up - review the transaction details. Click **Approve** to deploy your contract

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-9.webp){: .browser-extension}

    Deploying this contract requires paying gas fees in PAS tokens on the Polkadot Hub TestNet. Ensure your Talisman account is funded with sufficient PAS tokens from the faucet before confirming the transaction, check the [Test Tokens](/develop/smart-contracts/connect-to-polkadot/#test-tokens) section for more information. Gas fees cover the computational resources needed to deploy and execute the smart contract on the blockchain.

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

3. Click **Approve** to confirm the transaction in the Talisman popup

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-13.webp){: .browser-extension}

    If the transaction is successful, the terminal will display the following output, which details the information about the transaction, including the transaction hash, the block number, the associated logs, and so on.

    ![](/images/tutorials/smart-contracts/deploy-nft/deploy-nft-14.webp)

Feel free to explore and interact with the contract's other functions using the same approach - selecting the method, providing any required parameters, and confirming the transaction through Talisman when needed.
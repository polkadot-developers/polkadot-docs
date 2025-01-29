---
title: Deploy a NFT to Asset Hub
description: TODO
---

# Deploy NFT to Asset Hub

## Introduction

Polkadot Remix is a web-based IDE that allows developers to write, compile, and deploy smart contracts to any Substrate-based chain that supports the Ethereum Virtual Machine (EVM). Asset Hub (formerly known as Statemint) is Polkadot's native asset parachain, making it an ideal destination for deploying NFT contracts. This guide will walk you through creating and deploying a simple NFT contract using Polkadot Remix.

## Prerequisites

Before starting, make sure you have:
- A Polkadot account with some DOT tokens
- MetaMask installed and configured for Asset Hub
- Basic understanding of Solidity and NFTs

## Getting Started with Polkadot Remix

1. Navigate to [polkadot.remix.io](https://polkadot.remix.io)
2. You'll see a similar interface to Ethereum's Remix, with the following sections:
   - Plugin panel (left)
   - Side panel
   - Main panel (editor)
   - Terminal

## Creating the NFT Contract

First, let's create a new file for our NFT contract:

1. Click the "File Explorer" icon in the plugin panel
2. Click the "Create New File" button
3. Name your file `MyNFT.sol`

Now, paste the following NFT contract code into the editor:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Event emitted when a new NFT is minted
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit NFTMinted(to, tokenId, uri);
    }
}
```

Let's break down the key components:

### Understanding the Imports
1. `ERC721.sol`: The base contract for non-fungible tokens, implementing core NFT functionality like transfers and approvals.
2. `ERC721URIStorage.sol`: An extension that adds storage and retrieval of token metadata URIs.
3. `Ownable.sol`: Provides basic authorization control, ensuring only the contract owner can mint new tokens.

### Key Functions Explained

- `_safeMint(to, tokenId)`: An internal function from ERC721 that safely mints new tokens. It includes checks to ensure the recipient can handle ERC721 tokens (important when minting to smart contracts).
- `_setTokenURI(tokenId, uri)`: An internal function from ERC721URIStorage that associates metadata URI with a token. The URI typically points to a JSON file containing the NFT's metadata (image, description, attributes).

### Events

The contract emits the `NFTMinted` event whenever a new token is created, making it easier to track minting activity off-chain. This is particularly useful for:
- Updating user interfaces
- Tracking minting history
- Triggering external systems

## Compiling the Contract

1. Select the "Solidity Compiler" plugin from the left panel
2. Ensure the compiler version is set to 0.8.20 or higher
3. Click "Compile MyNFT.sol"
4. Look for the green checkmark indicating successful compilation

## Connecting to Asset Hub

1. Select the "Deploy & Run Transactions" plugin
2. From the "ENVIRONMENT" dropdown, select "Injected Provider - MetaMask"
3. MetaMask will prompt you to connect - select your account and click "Connect"
4. Make sure MetaMask is configured for Asset Hub with the following network settings:
   - Network Name: Asset Hub
   - RPC URL: https://polkadot-asset-hub-rpc.polkadot.io
   - Chain ID: 1338
   - Symbol: DOT
   - Explorer: https://assethub.polkascan.io

## Deploying the Contract

1. Ensure your MyNFT contract is selected in the "CONTRACT" dropdown
2. Click "Deploy"
3. MetaMask will pop up - review the transaction details
4. Click "Confirm" to deploy your contract
5. Wait for the transaction to be confirmed

## Interacting with Your NFT Contract

Once deployed, you can interact with your contract through Remix:

1. Find your contract under "Deployed Contracts"
2. To mint an NFT:
   - Expand the `safeMint` function
   - Enter the recipient address
   - Provide the metadata URI (e.g., IPFS link to your NFT metadata)
   - Click "transact"
   - Confirm the transaction in MetaMask

### Metadata URI Format

Your metadata URI should point to a JSON file with the following structure:
```json
{
    "name": "NFT Name",
    "description": "NFT Description",
    "image": "https://ipfs.io/ipfs/your-image-hash",
    "attributes": [
        {
            "trait_type": "Property",
            "value": "Value"
        }
    ]
}
```

## Verifying Your NFT

After minting, you can verify your NFT:

1. Use the `balanceOf` function to check token balances
2. Use `tokenURI` with a token ID to view metadata links
3. View your NFT on Asset Hub's block explorer by searching for your contract address
4. Monitor the `NFTMinted` events in the transaction logs

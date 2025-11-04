---
title: Foundry
description: Learn how to deploy a basic smart contract to Polkadot Hub using Foundry, excellent for developers who prefer fast, command-line driven development.
categories: Smart Contracts
url: https://docs.polkadot.com/smart-contracts/cookbook/smart-contracts/deploy-basic-contract-evm/deploy-basic-foundry/
---

[Foundry](https://getfoundry.sh/){target=\_blank} offers a fast, modular toolkit written in Rust. It's perfect for developers who prefer command-line interfaces and need high-performance compilation and deployment.

**Prerequisites:**

- Basic understanding of Solidity programming.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}).
- A wallet with a private key for signing transactions.

### Setup

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Initialize your project:

```bash
forge init foundry-deployment
cd foundry-deployment
```

### Configure Foundry

Edit `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]

[rpc_endpoints]
polkadot_hub_testnet = "https://testnet-passet-hub-eth-rpc.polkadot.io"
```

### Create Your Contract

Replace the default contract in `src/Storage.sol`:

```solidity title="src/Storage.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Storage {
    uint256 private storedNumber;

    function store(uint256 num) public {
        storedNumber = num;
    }

    function retrieve() public view returns (uint256) {
        return storedNumber;
    }
}
```

### Compile

```bash
forge build
```

Verify the compilation by inspecting the bytecode:

```bash
forge inspect Storage bytecode
```

### Deploy

Deploy to Polkadot Hub TestNet:

```bash
forge create Storage \
    --rpc-url polkadot_hub_testnet \
    --private-key YOUR_PRIVATE_KEY \
    --broadcast
```

### Next Steps

- Deploy an ERC-20 token on Polkadot Hub, either using the [Deploy an ERC-20](/smart-contracts/cookbook/smart-contracts/deploy-erc20) guide or the [Deploy an ERC-20 to Polkadot Hub](/smart-contracts/cookbook/smart-contracts/deploy-erc20) guide.
- Deploy an NFT on Polkadot Hub, either using the [Deploy an NFT](/smart-contracts/cookbook/smart-contracts/deploy-nft) guide or the [Deploy an NFT to Polkadot Hub](/smart-contracts/cookbook/smart-contracts/deploy-nft) guide.
- Check out in details each [development environment](/smart-contracts/dev-environments/).

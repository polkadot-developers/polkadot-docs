---
title: Contract Deployment
description: Learn how to deploy Solidity smart contracts to Polkadot Hub using familiar Ethereum tooling and workflows.
categories: Smart Contracts, Basics
---

# Contract Deployment

## Introduction

Deploying smart contracts to Polkadot Hub works exactly like deploying to Ethereum. Use your existing Solidity contracts, familiar tools like Hardhat, Foundry, or Remix, and deploy without any modifications.

## Deployment Process

Polkadot Hub uses the REVM backend, which provides full Ethereum compatibility. This means:

- **Single-step deployment**: Contracts deploy in a single transaction, just like Ethereum.
- **Factory patterns work**: Create new contracts at runtime using standard factory patterns.
- **Full Solidity support**: All Solidity features including inline assembly are supported.
- **Familiar tools**: Hardhat, Foundry, Remix, and other Ethereum tools work out of the box.

## Using Your Existing Workflow

### With Hardhat

```bash
npx hardhat ignition deploy ./ignition/modules/MyContract.ts --network polkadotHub
```

### With Foundry

```bash
forge create --rpc-url $POLKADOT_HUB_RPC --private-key $PRIVATE_KEY src/MyContract.sol:MyContract
```

### With Remix

1. Connect MetaMask to Polkadot Hub
2. Select "Injected Provider - MetaMask" in Remix
3. Deploy as you would to any EVM chain

## Gas Estimation

You might notice that gas estimates are higher than actual consumption (often around 30% of the estimate is used). This is normal behavior because:

- Pre-dispatch estimation cannot distinguish between computation weight and storage deposits
- Contract deployments consume significant storage deposits for code storage
- The system uses conservative overestimation to ensure transactions succeed

## Network Configuration

Add Polkadot Hub to your development environment:

| Parameter | Value |
|-----------|-------|
| Network Name | Polkadot Hub TestNet |
| RPC URL | `https://testnet-passet-hub-eth-rpc.polkadot.io` |
| Chain ID | `420420421` |
| Currency Symbol | PAS |
| Block Explorer | [BlockScout](https://blockscout-passet-hub.parity-testnet.parity.io/){target=\_blank} |

## Next Steps

Once deployed, your contracts can:

- Interact with other contracts on Polkadot Hub
- Access Polkadot-native functionality via [precompiles](/smart-contracts/precompiles/)
- Communicate cross-chain using [XCM](/smart-contracts/precompiles/xcm/)

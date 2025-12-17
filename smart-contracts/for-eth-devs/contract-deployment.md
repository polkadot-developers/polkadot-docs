---
title: Contract Deployment
description: Understand how smart contract deployment works on Polkadot Hub compared to Ethereum, including transaction processing, gas estimation, and storage considerations.
categories: Smart Contracts, Basics
---

# Contract Deployment

## Introduction

Smart contract deployment on Polkadot Hub follows the same conceptual model as Ethereum. This page explains the underlying mechanisms and key behavioral differences that Ethereum developers should understand when deploying contracts to Polkadot Hub.

## Deployment Model

Polkadot Hub uses the REVM backend, which implements the Ethereum Virtual Machine specification. This means deployment transactions are processed identically to Ethereum:

- **CREATE opcode**: Deploys contracts to deterministic addresses based on sender and nonce
- **CREATE2 opcode**: Enables counterfactual deployment with salt-based address derivation
- **Constructor execution**: Runs initialization code and returns runtime bytecode
- **Factory patterns**: Contracts can deploy other contracts at runtime without restrictions

The deployment transaction contains the contract's initialization bytecode in the `data` field, and the EVM executes this code to produce the runtime bytecode stored on-chain.

## Transaction Processing

When you submit a deployment transaction, it flows through the following layers:

1. **JSON-RPC Proxy** - Receives the standard Ethereum transaction format
2. **Transaction Repackaging** - Wraps the Ethereum transaction in a Substrate extrinsic
3. **pallet_revive** - Decodes and executes the EVM transaction
4. **REVM Execution** - Processes the deployment using standard EVM semantics
5. **State Commitment** - Stores the contract code and initializes storage

This architecture means your deployment transactions look and behave exactly like Ethereum transactions from the client perspective, while benefiting from Polkadot's consensus and finality guarantees.

## Gas Estimation Behavior

Ethereum developers may notice that gas estimates on Polkadot Hub are higher than actual consumption. This is expected behavior stemming from architectural differences:

### Why Estimates Differ

Polkadot's runtime uses a multi-dimensional resource model:

- **Computation weight** - Processing time consumed by the transaction
- **Proof size** - Data required for light client verification
- **Storage deposits** - Refundable deposits for on-chain storage

When you call `eth_estimateGas`, the system must return a single gas value that covers all three dimensions. Since pre-dispatch estimation cannot perfectly predict the breakdown between computation and storage, the system uses conservative overestimation.

### Practical Impact

- Estimates may show 3x the actual gas consumed
- Transactions still succeed because the estimate provides sufficient headroom
- Actual costs are based on real consumption, not the estimate
- Unused gas is refunded as on Ethereum

This behavior does not affect transaction success or final costs—it only means the estimated values appear higher than what you might expect from Ethereum mainnet.

## Storage Model

Contract deployment consumes storage for:

- **Code storage** - The runtime bytecode is stored on-chain
- **Account creation** - A new account entry is created for the contract
- **Initial state** - Any storage slots set during construction

Polkadot Hub uses a storage deposit system where deployers pay a refundable deposit proportional to the storage consumed. This deposit is returned when the contract is destroyed and storage is freed.

## Address Derivation

Contract addresses are derived using the same algorithms as Ethereum:

| Method | Address Calculation |
|--------|-------------------|
| CREATE | `keccak256(rlp([sender, nonce]))[12:]` |
| CREATE2 | `keccak256(0xff ++ sender ++ salt ++ keccak256(init_code))[12:]` |

This means you can predict deployment addresses using the same tools and techniques as on Ethereum.

## Finality Considerations

Unlike Ethereum's probabilistic finality, Polkadot provides deterministic finality through its GRANDPA consensus mechanism. Once a block containing your deployment is finalized:

- The contract deployment is irreversible
- No chain reorganization can remove the contract
- Finality typically occurs within seconds, not minutes

This faster finality means you can begin interacting with deployed contracts more quickly and with stronger guarantees than on Ethereum.

## Where to Go Next

For step-by-step deployment tutorials using specific tools, see:

- [Deploy with Remix](/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-remix/) - Browser-based deployment walkthrough
- [Hardhat Setup](/smart-contracts/dev-environments/hardhat/) - Local development environment configuration

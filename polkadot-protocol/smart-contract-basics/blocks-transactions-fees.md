---
title: Blocks, Transactions and Fees for Asset Hub Smart Contracts
description: Explore how Asset Hub smart contracts handle blocks, transactions, and fees with EVM compatibility, supporting various Ethereum transaction types.
---

# Blocks, Transactions, and Fees

## Introduction

Asset Hub smart contracts operate within the Polkadot ecosystem using the [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/){target=\_blank} implementation, which provides EVM compatibility. While many aspects of blocks and transactions are inherited from the underlying parachain architecture, there are specific considerations and mechanisms unique to smart contract operations on Asset Hub.

## Smart Contract Blocks

Smart contract blocks in Asset Hub follow the same fundamental structure as parachain blocks, inheriting all standard parachain block components. The `pallet_revive` implementation maintains this consistency while adding necessary [EVM-specific features](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm){target=\_blank}. For detailed implementation specifics, the [`Block`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Block.html){target=\_blank} struct in `pallet_revive` demonstrates how parachain and smart contract block implementations align.

## Smart Contract Transactions

Asset Hub implements a sophisticated transaction system that supports various transaction types and formats, encompassing both traditional parachain operations and EVM-specific interactions.

### EVM Transaction Types

The system provides a fundamental [`eth_transact`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/dispatchables/fn.eth_transact.html){target=\_blank} interface for processing raw EVM transactions dispatched through [Ethereum JSON-RPC APIs](/develop/smart-contracts/json-rpc-apis/){target=\_blank}. This interface acts as a wrapper for Ethereum transactions, requiring an encoded signed transaction payload, though it cannot be dispatched directly. Building upon this foundation, the system supports multiple transaction formats to accommodate different use cases and optimization needs:

- [**Legacy transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.TransactionLegacyUnsigned.html){target=\_blank} - the original Ethereum transaction format, providing basic transfer and contract interaction capabilities. These transactions use a simple pricing mechanism and are supported for backward compatibility

- [**EIP-1559 transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction1559Unsigned.html){target=\_blank} - an improved transaction format that introduces a more predictable fee mechanism with base fee and priority fee components. This format helps optimize gas fee estimation and network congestion management

- [**EIP-2930 transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction2930Unsigned.html){target=\_blank} - introduces access lists to optimize gas costs for contract interactions by pre-declaring accessed addresses and storage slots

- [**EIP-4844 transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction4844Unsigned.html){target=\_blank} - implements blob-carrying transactions, designed to optimize Layer 2 scaling solutions by providing dedicated space for roll-up data

Each transaction type can exist in both signed and unsigned states, with appropriate validation and processing mechanisms for each.

## Fees and Gas

Asset Hub implements a sophisticated resource management system that combines parachain transaction fees with EVM gas mechanics, providing both Ethereum compatibility and enhanced features.

### Gas Model Overview

Gas serves as the fundamental unit for measuring computational costs, with each network operation consuming a specified amount. This implementation maintains compatibility with Ethereum's approach while adding parachain-specific optimizations.

- **Dynamic gas scaling** - Asset Hub implements a dynamic pricing mechanism that reflects actual execution performance. This results in:
    - More efficient pricing for computational instructions relative to I/O operations
    - Better correlation between gas costs and actual resource consumption
    - Need for developers to implement flexible gas calculation rather than hardcoding values

- **Multi-dimensional resource metering** -  Asset Hub extends beyond the traditional single-metric gas model to track three distinct resources:

    - `ref_time` (computation time)

        - Functions as traditional gas equivalent
        - Measures actual computational resource usage
        - Primary metric for basic operation costs


    - `proof_size` (verification overhead)

        - Tracks state proof size required for validator verification
        - Helps manage consensus-related resource consumption
        - Important for cross-chain operations


    - `storage_deposit` (state management)

        - Manages blockchain state growth
        - Implements a deposit-based system for long-term storage
        - Refundable when storage is freed

These resources can be limited at both transaction and contract levels, similar to Ethereum's gas limits. For more information, check the [Gas Model](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm#gas-model){target=\_blank} section in the [EVM vs PolkaVM](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/){target=\_blank} article.

### Fee Components

- **Base fees**

    - Storage deposit for contract deployment
    - Minimum transaction fee for network access
    - Network maintenance costs

- **Execution fees**

    - Computed based on gas consumption
    - Converted to native currency using network-defined rates
    - Reflects actual computational resource usage

- **Storage fees**

    - Deposit for long-term storage usage
    - Refundable when storage is freed
    - Helps prevent state bloat

### Gas Calculation and Conversion

The system maintains precise conversion mechanisms between:

- Substrate weights and EVM gas units
- Native currency and gas costs
- Different resource metrics within the multi-dimensional model

This ensures accurate fee calculation while maintaining compatibility with existing Ethereum tools and workflows.
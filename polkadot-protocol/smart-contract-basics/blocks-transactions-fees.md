---
title: Blocks, Transactions and Fees for Asset Hub Smart Contracts
description: Explore how Asset Hub smart contracts handle blocks, transactions, and fees with EVM compatibility, supporting various Ethereum transaction types.
---

# Blocks, Transactions and Fees

## Introduction

Asset Hub smart contracts operate within the Polkadot ecosystem using the [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/){target=\_blank} implementation, which provides EVM compatibility. While many aspects of blocks and transactions are inherited from the underlying parachain architecture, there are specific considerations and mechanisms unique to smart contract operations on Asset Hub.

## Smart Contract Blocks

Smart contract blocks in Asset Hub follow the same fundamental structure as parachain blocks, inheriting all standard parachain block components. The `pallet_revive` implementation maintains this consistency while adding necessary [EVM-specific features](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm){target=\_blank}. For detailed implementation specifics, the [Block](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Block.html){target=\_blank} struct in `pallet_revive` demonstrates how parachain and smart contract block implementations align.

## Smart Contract Transactions

Asset Hub implements a sophisticated transaction system that supports various transaction types and formats, encompassing both traditional parachain operations and EVM-specific interactions.

### EVM Transaction Types

The system provides a fundamental [`eth_transact`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/dispatchables/fn.eth_transact.html){target=\_blank} interface for processing raw EVM transactions dispatched through Ethereum JSON-RPC servers. This interface acts as a wrapper for Ethereum transactions, requiring an encoded signed transaction payload, though it cannot be dispatched directly. Building upon this foundation, the system supports multiple transaction formats to accommodate different use cases and optimization needs:

- [**Legacy Transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.TransactionLegacyUnsigned.html){target=\_blank} - the original Ethereum transaction format, providing basic transfer and contract interaction capabilities. These transactions use a simple pricing mechanism and are supported for backward compatibility

- [**EIP-1559 Transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction1559Unsigned.html){target=\_blank} - an improved transaction format that introduces a more predictable fee mechanism with base fee and priority fee components. This format helps optimize gas fee estimation and network congestion management

- [**EIP-2930 Transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction2930Unsigned.html){target=\_blank} - introduces access lists to optimize gas costs for contract interactions by pre-declaring accessed addresses and storage slots

- [**EIP-4844 Transactions**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Transaction4844Unsigned.html){target=\_blank} - implements blob-carrying transactions, designed to optimize Layer 2 scaling solutions by providing dedicated space for roll-up data

Each transaction type can exist in both signed and unsigned states, with appropriate validation and processing mechanisms for each.

## Fees and Gas

Asset Hub implements a dual fee system combining parachain transaction fees with EVM gas mechanics.

### Gas Mechanisms

- Gas limit enforced during contract execution
- Gas price fixed at network level
- Gas calculated based on computational complexity
- Conversion between substrate weight and EVM gas units

### Fee Components

1. **Base Fees**

    - Storage deposit for contract deployment
    - Minimum transaction fee

2. **Execution Fees**

    - Computed based on gas consumption
    - Converted to native currency using network-defined rates

3. **Storage Fees**

    - Deposit for long-term storage usage
    - Refundable when storage is freed

## Integration with Parachain Systems

Asset Hub's smart contract system achieves seamless integration with core parachain components while maintaining EVM compatibility. This integration encompasses consensus mechanisms, block production, network message propagation, and state transitions. The system leverages the strengths of both architectures to provide a robust and efficient smart contract platform.

For detailed information about these underlying systems, refer to the [parachain documentation](/polkadot-protocol/parachain-basics/blocks-transactions-fees/).
---
title: Blocks, Transactions and Fees for Asset Hub Smart Contracts
description: TODO
---

# Blocks, Transactions and Fees

## Introduction

Asset Hub smart contracts operate within the Polkadot ecosystem using the pallet-revive implementation, which provides EVM compatibility. While many aspects of blocks and transactions are inherited from the underlying parachain architecture, there are specific considerations and mechanisms unique to smart contract operations on Asset Hub.

## Smart Contract Blocks

Smart contract blocks in Asset Hub follow the same fundamental structure as parachain blocks. All standard parachain block components (refer to [parachain blocks documentation](/polkadot-protocol/parachain-basics/blocks-transactions-fees/blocks/){target=\_blank}).

 For further infromation about smart contract blocks, see the [Blocks](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/evm/struct.Block.html){target=\_blank} struct implementation in `pallet_revive`.

## Smart Contract Transactions

Asset Hub supports several transaction types specifically for smart contract interactions:

### EVM Transactions

1. **eth_transact**

    - Raw EVM transactions dispatched by Ethereum JSON-RPC servers
    - Requires encoded signed transaction payload
    - Cannot be dispatched directly; serves as a wrapper for Ethereum transactions

2. **Contract Calls**

    - Direct calls to smart contract accounts (`call`)
    - Contract instantiation (`instantiate`, `instantiate_with_code`)
    - Code management (`upload_code`, `remove_code`, `set_code`)

### Transaction Types

1. **Standard Contract Calls**

    - Similar to parachain extrinsics but specifically for contract interaction
    - Includes `dest` (contract address), `value` (transfer amount), and `data` (input data)

2. **Contract Deployment**

    - Deploys new contract code
    - Creates contract account
    - Executes constructor function

3. **Account Management**

    - `map_account` - registers account for contract interactions
    - `unmap_account` - unregisters account and releases deposit
    - `dispatch_as_fallback_account` - recovery function for unmapped accounts

## Transaction Processing
Smart contract transactions follow a specialized processing flow:

1. **Validation**

    - Standard parachain validation
    - Additional EVM-specific validation:
        - Gas limit checks
        - Code size limits
        - Input data validation

2. **Execution**

   - EVM state transition
   - Storage updates
   - Event emission
   - Receipt generation

## Fees and Gas

Asset Hub implements a dual fee system combining parachain transaction fees with EVM gas mechanics:

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

### Special Fee Considerations

- Storage deposits for code upload
- Account mapping deposits
- Fallback account operations

## Key Differences from Standard Parachain Operations

1. **Transaction Format**

    - Additional EVM-specific fields
    - Support for Ethereum transaction types (Legacy, EIP-1559, EIP-2930, EIP-4844)

2. **State Management**

    - Dual state roots (Substrate and EVM)
    - Additional storage for contract code and state

3. **Fee Mechanics**

    - Combination of weight-based and gas-based calculations
    - Storage deposits specific to contract operations

## Integration with Parachain Systems

Asset Hub smart contracts seamlessly integrate with:

- Parachain consensus
- Block production and import
- Network message propagation
- State transitions and finality

For detailed information about these underlying systems, refer to the [parachain documentation](/polkadot-protocol/parachain-basics/blocks-transactions-fees/).
---
title: EVM vs PolkaVM
description: Compares EVM and PolkaVM, highlighting key architectural differences, gas models, memory management, and account handling while ensuring Solidity compatibility.
---

# EVM vs PolkaVM

While [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design/){target=\_blank} strives for maximum Ethereum compatibility, several fundamental design decisions create necessary divergences from the [EVM](https://ethereum.org/en/developers/docs/evm/){target=\_blank}. These differences represent trade-offs that enhance performance and resource management while maintaining accessibility for Solidity developers.

## Core Virtual Machine Architecture

The most significant departure from Ethereum comes from PolkaVM's foundation itself. Rather than implementing the EVM, PolkaVM utilizes a RISC-V instruction set. For most Solidity developers, this architectural change remains transparent thanks to the [Revive compiler's](https://github.com/paritytech/revive){target=\_blank} complete Solidity support, including inline assembler functionality.

However, this architectural difference becomes relevant in specific scenarios. Tools that attempt to download and inspect contract bytecode will fail, as they expect EVM bytecode rather than PolkaVM's RISC-V format. This primarily affects contracts using [`EXTCODECOPY`](https://www.evm.codes/?fork=cancun#3c){target=\_blank} to manipulate code at runtime, though such cases are rare. PolkaVM offers an elegant alternative through its [on-chain constructors](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/struct.Pallet.html#method.bare_instantiate){target=\_blank}, enabling contract instantiation without runtime code modification.

## Gas Model

Ethereum's resource model relies on a single metric: [gas](https://ethereum.org/en/developers/docs/gas/#what-is-gas){target=\_blank}, which serves as the universal unit for measuring computational costs. Each operation on the network consumes a specific amount of gas. Most platforms aiming for Ethereum compatibility typically adopt identical gas values to ensure seamless integration. 

The significant changes to Ethereum's gas model will be outlined in the following sections.

### Dynamic Gas Value Scaling

Instead of adhering to Ethereum's fixed gas values, PolkaVM implements benchmark-based pricing that better reflects its improved execution performance. This makes instructions cheaper relative to I/O-bound operations but requires developers to avoid hardcoding gas values, particularly in cross-contract calls.

### Multi-Dimensional Resource Metering

Moving beyond Ethereum's single gas metric, PolkaVM meters three distinct resources:

- **`ref_time`** - equivalent to traditional gas, measuring computation time
- **`proof_size`** - tracks state proof size for validator verification
- **`storage_deposit`** - manages state bloat through a deposit system

These three can be limited at the transaction level, just like gas on Ethereum. The Ethereum RPC proxy maps all three of these into the single dimension gas so that everything behaves as on Ethereum for users. This ensures that the transaction cost displayed in the wallet accurately represents the actual costs, even though it uses these three resources internally.

These resources can also be limited when making a cross-contract call. However, Solidity doesn't allow specifying anything other than `gas_limit` for a cross-contract call. The PolkaVM takes the `gas_limit` the contract supplies and uses that as `ref_time_limit.` The other two resources are just uncapped in this case. Please note that uncapped means the transaction-specified limits still constrain them, so this cannot be used to trick the signer of the transaction.

Resource limiting in cross-contract calls serves a critical security purpose, particularly when interacting with untrusted contracts.

For compatibility, PolkaVM maps traditional gas-related operations to its `ref_time` metric, which is the closest analog to Ethereum's gas system.

## Memory Management

The EVM and the PolkaVM take fundamentally different approaches to memory constraints:

- **EVM's approach** - Ethereum uses gas costs as an indirect memory control mechanism. Beyond a 24KB code size limit, memory usage is constrained through a gas curve that increases costs based on total allocation. While elegant, this approach can lead to overcharging for memory operations, reducing overall system efficiency

- **PolkaVM's approach** - PolkaVM takes a different approach to memory limits than Ethereum. Instead of variable gas costs, it implements fixed-cost operations with hard memory limits. This separation of memory constraints from execution time gas enables more efficient pricing, though it can occasionally result in more restrictive [limits](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/revive/src/limits.rs){target=\_blank}. The system's parameters are continuously adjusted to optimize functionality based on real-world usage patterns and community feedback

    The architecture establishes a constant memory limit per contract, which is the basis for calculating maximum contract nesting depth. This calculation assumes worst-case memory usage for each nested contract, resulting in a straightforward but conservative limit that operates independently of actual memory consumption. Future iterations may introduce dynamic memory metering, allowing deeper nesting depths for contracts with smaller memory footprints. However, such an enhancement would require careful implementation of cross-contract boundary limits before API stabilization, as it would introduce an additional resource metric to the system.

## Account Management - Existential Deposit

Ethereum and Polkadot handle account persistence differently, affecting state management and contract interactions:

- **Ethereum's approach**

    - Accounts persist indefinitely, even with zero balance
    - No minimum balance is required to maintain account data (nonce, storage)
    - Contracts are simply accounts with executable code, following the same persistence rules
 
- **Polkadot's approach**

    - Uses an [existential deposit](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} (ED), requiring a minimum balance for an account to exist
    - Accounts with balances below ED are automatically deleted, reducing state bloat
    - Smart contracts, as specialized accounts, must also maintain the ED

This difference introduces potential compatibility challenges for Ethereum-based contracts and tools, particularly wallets. To mitigate this, PolkaVM implements several transparent adjustments:

- Balance queries via Ethereum RPC automatically deduct the ED, ensuring reported balances match spendable amounts
- Account balance checks through EVM opcodes reflect the ED-adjusted balance
- Transfers to new accounts automatically include the ED (`x + ED`), with the extra cost incorporated into transaction fees
- Contract-to-contract transfers handle ED requirements by:

    - Drawing ED from the transaction signer instead of the sending contract
    - Keeping transfer amounts transparent for contract logic
    - Treating ED like other storage deposit costs

This approach ensures that Ethereum contracts work without modifications while maintaining Polkadot’s optimized state management.
---
title: Polkadot Hub Smart Contract FAQs
description: Find answers to common questions about smart contract development, deployment, and compatibility in the Polkadot Hub ecosystem.
categories: Smart Contracts
---

# Smart Contracts FAQs

--8<-- 'text/smart-contracts/polkaVM-warning.md'

!!! note
    For a list of known incompatibilities, please refer to the [Solidity and Yul IR translation incompatibilities](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/#solidity-and-yul-ir-translation-incompatibilities){target=\_blank} section.

## General Questions

### What are the different types of smart contracts I can build on Polkadot?

Polkadot supports three main smart contract environments:

1. **PolkaVM contracts**: Available on Polkadot Hub, using a RISC-V-based virtual machine with Solidity compatibility.
2. **EVM contracts**: Available on parachains like Moonbeam, Astar, and Acala via the Frontier framework.
3. **Wasm contracts**: Using ink! (Rust-based) or Solidity via Solang compiler.

### Should I build a smart contract or a parachain?

Choose smart contracts if:

- You want to deploy quickly without managing consensus.
- Your application fits within existing chain functionality.
- You prefer familiar development tools (Ethereum ecosystem).
- You need to interact with other contracts easily.

Choose a parachain if:

- You need custom logic that doesn't fit smart contract limitations.
- You want full control over governance and upgrades.
- You require specialized consensus mechanisms.
- You need optimized fee structures.

### What's the difference between Polkadot Hub smart contracts and other EVM chains?

Polkadot Hub contracts run on [PolkaVM](/smart-contracts/for-eth-devs/){target=\_blank} instead of EVM:

- **Performance**: RISC-V register-based architecture vs. stack-based EVM.
- **Resource metering**: Three dimensions (`ref_time`, `proof_size`, `storage_deposit`) vs. single gas metric.
- **Memory management**: Hard memory limits per contract vs. gas-based soft limits.
- **Account system**: Polkadot's 32-byte accounts with automatic 20-byte address conversion.

## Development Environment

### Can I use my existing Ethereum development tools?

Yes, check out the [Wallets](/develop/smart-contracts/wallets){target=\_blank} page, the [Development Environments](/develop/smart-contracts/dev-environments/){target=\_blank}, and the [Libraries](/develop/smart-contracts/libraries/){target=\_blank} sections for more information.

### How do I set up local development?

Check the [Local Development Node](/develop/smart-contracts/local-development-node){target=\_blank} for further instructions.

### What networks are available for testing and deployment?

- **Local Development**: Kitchensink node with Ethereum RPC proxy.
- **TestNets**: Polkadot Hub TestNet.

## Technical Implementation

### How do Ethereum addresses work on Polkadot?

Polkadot uses a [dual-address system](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm#account-management-comparison){target=\_blank}:

- _20-byte Ethereum addresses_ are padded with `0xEE` bytes to create 32-byte Polkadot accounts.
- _32-byte Polkadot accounts_ can register mappings to 20-byte addresses.
- _Automatic conversion_ happens behind the scenes.
- _MetaMask compatibility_ is maintained through the mapping system.

### What are the key differences in the gas model?

PolkaVM uses three resource dimensions:

- **`ref_time`**: Computational time (similar to traditional gas).
- **`proof_size`**: State proof size for validator verification.
- **`storage_deposit`**: Refundable deposit for state storage.

Key implications:

- Gas values are dynamically scaled based on performance benchmarks.
- Cross-contract calls don't respect gas limits (use reentrancy protection).
- Storage costs are separate from execution costs.

### How does contract deployment work?

PolkaVM deployment differs from EVM:

- _Code must be pre-uploaded_ to the chain before instantiation.
- _Factory contracts_ need modification to work with pre-uploaded code hashes.
- _Two-step process_: Upload code, then instantiate contracts.
- _Runtime code generation_ is not supported.

### Which Solidity features are not supported?

Limited support for:

- **`EXTCODECOPY`**: Only works in constructor code.
- **Runtime code modification**: Use on-chain constructors instead.
- **Gas stipends**: `address.send()` and `address.transfer()` don't provide reentrancy protection.

Unsupported operations:

- `pc`, `extcodecopy`, `selfdestruct`
- `blobhash`, `blobbasefee` (blob-related operations)

### How do I handle the existential deposit requirement?

What it means:

- Accounts need a minimum balance, also known as an existential deposit (ED), to remain active.
- Accounts below this threshold are automatically deleted.

How it's handled:

- _Balance queries_ via Ethereum RPC automatically deduct the ED.
- _New account transfers_ automatically include ED with transaction fees.
- _Contract-to-contract transfers_ draw ED from transaction signer, not sending contract.

## Migration and Compatibility

### Can I migrate my existing Ethereum contracts?

Most contracts work without changes:

- Standard ERC-20, ERC-721, ERC-1155 tokens.
- DeFi protocols and DEXs.
- DAOs and governance contracts.

May need modifications:

- Factory contracts that create other contracts at runtime.
- Contracts using `EXTCODECOPY` for runtime code manipulation.
- Contracts relying on gas stipends for reentrancy protection.

## Troubleshooting

### Why are my gas calculations different?

PolkaVM uses dynamic gas scaling:

- Gas values reflect actual performance benchmarks.
- Don't hardcode gas values—use flexible calculations.
- Cross-contract calls ignore gas limits—implement proper access controls.

### I deployed a contract with MetaMask, and got a `code size` error - why?

The latest MetaMask update affects the extension’s ability to deploy large contracts. Check the [Wallets](/develop/smart-contracts/wallets){target=\_blank} page for more details.

### I found a bug, where can I log it?

Please log any bugs in the [`contracts-issues`](https://github.com/paritytech/contract-issues/issues){target=\_blank} repository so developers are aware of them and can address them.

## Known Issues

### Runtime Behavior

- **`creationCode` returns hash instead of bytecode**: The Solidity keyword returns a `keccak256` hash rather than the actual creation bytecode.
    - [Issue #45](https://github.com/paritytech/contract-issues/issues/45){target=\_blank}
- **Non-deterministic gas usage**: Gas consumption varies slightly for identical transactions.
    - [Issue #49](https://github.com/paritytech/contract-issues/issues/49){target=\_blank}
- **Precompiles not recognized**: Precompile addresses return `Contract not found` error.
    - [Issue #111](https://github.com/paritytech/contract-issues/issues/111){target=\_blank}

### Development Tools

- **`hardhat-polkadot` plugin compilation issues**: Plugin interferes with standard `npx hardhat compile` command.
    - [Issue #44](https://github.com/paritytech/contract-issues/issues/44){target=\_blank}

### Contract Patterns

- **Minimal proxy (EIP-1167) deployment fails**: Standard proxy contracts cannot be deployed on PolkaVM.
    - [Issue #86](https://github.com/paritytech/contract-issues/issues/86){target=\_blank}

### Compilation

- **`SDIV` opcode crash**: Compiler crashes with `Unsupported SDIV` assertion failure.
    - [Issue #342](https://github.com/paritytech/revive/issues/342){target=\_blank}
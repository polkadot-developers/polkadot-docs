---
title: Contract Deployment
description: Learn how to deploy smart contracts on the Polkadot Hub with REVM and PolkaVM, covering single-step EVM flows and PolkaVM’s two-step model and tooling.
categories: Smart Contracts, Basics
---

# Contract Deployment

## Introduction

Polkadot's smart contract platform supports two distinct virtual machine backends: REVM (Rust Ethereum Virtual Machine) and PolkaVM (RISC-V based). Each backend has its own deployment characteristics and optimization strategies. REVM provides full Ethereum compatibility with familiar single-step deployment, while PolkaVM uses a more structured two-step approach optimized for its RISC-V architecture. Understanding these differences ensures smooth deployment regardless of which backend you choose for your smart contracts.

## REVM Deployment

The REVM backend provides seamless deployment of Ethereum contracts without any modifications. Contracts deploy exactly as they would on Ethereum, using familiar tools and workflows.

With REVM, deployment mirrors Ethereum exactly: contracts are bundled and deployed in a single transaction, factory contracts can create new contracts at runtime, runtime code generation (including inline assembly) is supported, and existing tooling—Hardhat, Foundry, Remix—works out of the box with no modifications.

## PolkaVM Deployment

PolkaVM implements a fundamentally different deployment model optimized for its RISC-V architecture. While simple contract deployments work seamlessly, advanced patterns like factory contracts require understanding the two-step deployment process.

### Standard Contract Deployment

For most use cases—such as deploying ERC-20 tokens, NFT collections, or standalone contracts—deployment works transparently without requiring special steps. The Revive compiler handles the deployment process automatically when using standard Solidity patterns.

### Two-Step Deployment Model

PolkaVM separates contract deployment into distinct phases:

1. **Code Upload**: Contract bytecode must be uploaded to the chain before instantiation
2. **Contract Instantiation**: Contracts are created by referencing previously uploaded code via its hash

This architecture differs from the EVM's bundled approach and has important implications for certain deployment patterns.

### Factory Pattern Considerations

The common EVM pattern where contracts dynamically create other contracts requires adaptation for PolkaVM:

**EVM Factory Pattern:**
```solidity
// This works on REVM but requires modification for PolkaVM
contract Factory {
    function createToken() public returns (address) {
        // EVM bundles bytecode in the factory
        return address(new Token());
    }
}
```

**PolkaVM Requirements:**

- **Pre-upload dependent contracts**: All contracts that will be instantiated at runtime must be uploaded to the chain before the factory attempts to create them
- **Code hash references**: Factory contracts work with pre-uploaded code hashes rather than embedding bytecode
- **No runtime code generation**: Dynamic bytecode generation is not supported due to PolkaVM's RISC-V format

### Migration Strategy for Factory Contracts

When migrating factory contracts from Ethereum to PolkaVM:

1. **Identify all contracts**: Determine which contracts will be instantiated at runtime
2. **Upload dependencies first**: Deploy all dependent contracts to the chain before deploying the factory
3. **Use on-chain constructors**: Leverage PolkaVM's on-chain constructor feature for flexible instantiation
4. **Avoid assembly creation**: Don't use `create` or `create2` opcodes in assembly blocks for manual deployment

### Architecture-Specific Limitations

PolkaVM's deployment model creates several specific constraints:

- **`EXTCODECOPY` limitations**: Contracts using `EXTCODECOPY` to manipulate code at runtime will encounter issues
- **Runtime code modification**: Patterns that construct and mutate contract code on-the-fly are not supported
- **Assembly-based factories**: Factory contracts written in YUL assembly that generate code at runtime will fail with `CodeNotFound` errors

These patterns are rare in practice and typically require dropping down to assembly, making them non-issues for standard Solidity development.

### On-Chain Constructors

PolkaVM provides on-chain constructors as an elegant alternative to runtime code modification:

- Enable contract instantiation without runtime code generation
- Support flexible initialization patterns
- Maintain separation between code upload and contract creation
- Provide predictable deployment costs

## Deployment Comparison

| Feature | REVM Backend | PolkaVM Backend |
|:-------:|:-------------:|:----------------:|
| **Deployment Model** | Single-step bundled | Two-step upload and instantiate |
| **Factory Patterns** | Direct runtime creation | Requires pre-uploaded code |
| **Code Bundling** | Bytecode in transaction | Code hash references |
| **Runtime Codegen** | Fully supported | Not supported |
| **Simple Contracts** | No modifications needed | No modifications needed |
| **Assembly Creation** | Supported | Discouraged, limited support |

## Conclusion

Both backends support contract deployment effectively, with REVM offering drop-in Ethereum compatibility and PolkaVM providing a more structured two-step approach. For the majority of use cases—deploying standard contracts like tokens or applications—both backends work seamlessly. Advanced patterns like factory contracts may require adjustment for PolkaVM, but these adaptations are straightforward with proper planning.
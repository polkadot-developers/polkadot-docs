---
title: Migration FAQs and Considerations
description: Learn how to migrate your existing Ethereum contracts to the Polkadot Hub using REVM and PolkaVM.
categories: Smart Contracts
---

# Migration FAQs and Considerations

## Introduction

This guide helps Ethereum developers migrate their smart contracts to Polkadot Hub. Most contracts work without modifications on the REVM backend, while the PolkaVM backend offers enhanced performance with minimal adaptation for standard patterns.

## Quick Migration Checklist

Before migrating your contracts, review this checklist:

- Standard ERC-20, ERC-721, ERC-1155 tokens work without changes.
- DeFi protocols, DEXs, and AMMs migrate seamlessly.
- DAOs and governance contracts are fully compatible.
- Most Solidity contracts deploy identically to Ethereum.
- Factory contracts using PVM bytecode need pre-uploaded dependencies.
- Contracts using `EXTCODECOPY` for runtime manipulation require review (for projects that will use PVM bytecode, not EVM bytecode).
- Replace `transfer()` and `send()` with proper reentrancy guards (for projects that will use PVM bytecode, not EVM bytecode).

## Migration FAQs

### Which backend should I choose?

- Choose REVM if you want:

    - Zero-modification deployment of existing Ethereum contracts.
    - Exact EVM behavior for audited code.
    - Compatibility with tools that inspect EVM bytecode.
    - Rapid deployment without optimization.

- Choose PolkaVM if you want:

    - Better performance for computation-heavy applications.
    - Lower execution costs for intensive operations.
    - Access to next-generation smart contract features.

If you are unsure which to choose, start with REVM for immediate compatibility, then consider PolkaVM for performance optimization once deployed.

### Do I need to rewrite my Solidity code?

No, for most contracts. Standard Solidity patterns work on both backends.

### What about factory contracts?

- **REVM**: Factory contracts work identically to Ethereum with no changes needed. 
    
    The original factory pattern is:

    ```solidity
    contract TokenFactory {
        function createToken(string memory name) public returns (address) {
            // Creates new contract at runtime
            Token newToken = new Token(name);
            return address(newToken);
        }
    }
    ```

- **PolkaVM**: Factory contracts require pre-uploading dependent contracts. 

    Here's how to adapt the original factory pattern:

    ```solidity
    contract TokenFactory {
        // Reference pre-uploaded Token contract by hash
        bytes32 public tokenCodeHash;
        
        constructor(bytes32 _tokenCodeHash) {
            tokenCodeHash = _tokenCodeHash;
        }
        
        function createToken(string memory name) public returns (address) {
            // Instantiate from pre-uploaded code
            Token newToken = new Token{salt: keccak256(abi.encode(name))}(name);
            return address(newToken);
        }
    }
    ```

The deployment steps for PolkaVM factories are:

1. Upload the contract code to the chain.
2. Note the returned code hash.
3. Deploy the Factory contract with the contract code hash.
4. Factory can now instantiate contracts using the pre-uploaded code.

### How do gas costs compare?

For more information on gas costs, see the [Gas Model](/smart-contracts/for-eth-devs/gas-model){target=\_blank} page.

### Which Solidity features are not supported?

For REVM, Solidity features are supported. 

For PolkaVM, there are some considerations:

- `EXTCODECOPY`: Only works in constructor code.
- Runtime code modification: Use on-chain constructors instead.
- **Gas stipends**: `address.send()` and `address.transfer()` don't provide reentrancy protection.
- **Unsupported operations**: `pc`, `extcodecopy`, `selfdestruct`, `blobhash`, and `blobbasefee` (blob-related operations).

### How do I handle the existential deposit?

Polkadot requires accounts to maintain a minimum balance (existential deposit or ED) to remain active.

This is handled automatically for you:

- Balance queries via Ethereum RPC automatically deduct the ED.
- New account transfers include ED in transaction fees.
- Contract-to-contract transfers draw ED from the transaction signer.

You typically don't need to do anything special, but be aware:

- Accounts below ED threshold are automatically deleted.
- ED is around 0.01 DOT (varies by network).
- Your contracts don't need to manage this explicitly.

### Can I use my existing development tools?

Yes! Both backends support:

- **Wallets**: [MetaMask](https://metamask.io/){target=\_blank}, [Talisman](https://talisman.xyz/){target=\_blank}, [SubWallet](https://www.subwallet.app/){target=\_blank}
- **Development frameworks**: [Hardhat](/smart-contracts/cookbook/smart-contracts/deploy-basic/hardhat/){target=\_blank}, [Foundry](/smart-contracts/cookbook/smart-contracts/deploy-basic/foundry/){target=\_blank}, [Remix](/smart-contracts/cookbook/smart-contracts/deploy-basic/remix/){target=\_blank} (just consider that for PVM bytecode, you will use the Polkadot version of the tooling)
- **Libraries**: [ethers.js](/smart-contracts/libraries/ethers-js/){target=\_blank}, [web3.js](/smart-contracts/libraries/web3-js/){target=\_blank}, [viem](/smart-contracts/libraries/viem/){target=\_blank}
- **Testing tools**: Your existing test suites work

Connect to Polkadot Hub's Ethereum JSON-RPC endpoint and use your familiar workflow.

## Conclusion

Most Ethereum contracts migrate to Polkadot Hub with minimal or no changes. Use REVM for seamless compatibility or PolkaVM for enhanced performance.

There are a few key points to keep in mind during migration:

- Replace `transfer()` and `send()` with `.call{value}("")` and use reentrancy guards (for projects that will use PVM bytecode, not EVM bytecode).
- PolkaVM factory contracts using PVM bytecode need pre-uploaded dependencies.
- Don't hardcode gas values.
- Test thoroughly on [TestNet](/smart-contracts/connect/#__tabbed_1_1){target=\_blank} before mainnet deployment.

Your existing Solidity knowledge and tooling transfer directly to Polkadot Hub, making migration straightforward for standard smart contract patterns.
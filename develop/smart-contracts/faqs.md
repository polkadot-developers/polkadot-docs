---
title: FAQs for Smart Contracts in the Polkadot Hub
description: Find answers to common questions about smart contract development, deployment, and compatibility in the Polkadot Hub ecosystem.
---

# Smart Contracts FAQs

## General Questions

- What are the different types of smart contracts I can build on Polkadot?

    Polkadot supports three main smart contract environments:

    1. **PolkaVM Contracts** - Available on Polkadot Hub, using a RISC-V-based virtual machine with Solidity compatibility
    2. **EVM Contracts** - Available on parachains like Moonbeam, Astar, and Acala via the Frontier framework
    3. **Wasm Contracts** - Using ink! (Rust-based) or Solidity via Solang compiler

- Should I build a smart contract or a parachain?

    Choose smart contracts if:

    - You want to deploy quickly without managing consensus
    - Your application fits within existing chain functionality
    - You prefer familiar development tools (Ethereum ecosystem)
    - You need to interact with other contracts easily

    Choose a parachain if:

    - You need custom logic that doesn't fit smart contract limitations
    - You want full control over governance and upgrades
    - You require specialized consensus mechanisms
    - You need optimized fee structures

- What's the difference between Polkadot Hub smart contracts and other EVM chains?

    Polkadot Hub uses [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design){target=\_blank} instead of traditional EVM:

    - **Performance**: RISC-V register-based architecture vs. stack-based EVM
    - **Resource Metering**: Three dimensions (`ref_time`, `proof_size`, `storage_deposit`) vs. single gas metric
    - **Memory Management**: Hard memory limits per contract vs. gas-based soft limits
    - **Account System**: Polkadot's 32-byte accounts with automatic 20-byte address conversion

## Development Environment

- Can I use my existing Ethereum development tools?

    Yes, check out the [Wallet](/develop/smart-contracts/wallets){target=\_blank} page, the [Development Environments](/develop/smart-contracts/dev-environments/){target=\_blank}, and the [Libraries](/develop/smart-contracts/libraries/){target=\_blank} sections for more information.

- How do I set up local development?

    Check the [Local Development Node](/develop/smart-contracts/local-development-node){target=\_blank} for further instructions.

- What networks are available for testing and deployment?

    - Local Development:
    
        - Kitchensink node with Ethereum RPC proxy

    - TestNets:

        - Passet Hub (official TestNet)


## Technical Implementation

- How do Ethereum addresses work on Polkadot?

    Polkadot uses a [dual-address system](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm#account-management-comparison){target=\_blank}:

    - **20-byte Ethereum addresses** are padded with `0xEE` bytes to create 32-byte Polkadot accounts
    - **32-byte Polkadot accounts** can register mappings to 20-byte addresses
    - **Automatic conversion** happens behind the scenes
    - **MetaMask compatibility** is maintained through the mapping system

- What are the key differences in the gas model?

    PolkaVM uses three resource dimensions:

    - **`ref_time`** - computational time (similar to traditional gas)
    - **`proof_size`** - state proof size for validator verification  
    - **`storage_deposit`** - refundable deposit for state storage

    Key implications:

    - Gas values are dynamically scaled based on performance benchmarks
    - Cross-contract calls don't respect gas limits (use reentrancy protection)
    - Storage costs are separate from execution costs

- How does contract deployment work?

    PolkaVM deployment differs from EVM:

    - **Code must be pre-uploaded** to the chain before instantiation
    - **Factory contracts** need modification to work with pre-uploaded code hashes
    - **Two-step process**: upload code, then instantiate contracts
    - **Runtime code generation** is not supported

- What Solidity features are not supported?

    Limited support for:
    
    - **`EXTCODECOPY`** - only works in constructor code
    - **Runtime code modification** - use on-chain constructors instead
    - **Gas stipends** - `address.send()` and `address.transfer()` don't provide reentrancy protection

    Unsupported operations:

    - `pc`, `extcodecopy`, `selfdestruct`
    - `blobhash`, `blobbasefee` (blob-related operations)

- How do I handle the existential deposit requirement?

    What it means:

    - Accounts need a minimum balance (existential deposit) to remain active
    - Accounts below this threshold are automatically deleted

    How it's handled:

    - **Balance queries** via Ethereum RPC automatically deduct the ED
    - **New account transfers** automatically include ED with transaction fees
    - **Contract-to-contract transfers** draw ED from transaction signer, not sending contract

## Migration and Compatibility

- Can I migrate my existing Ethereum contracts?

    Most contracts work without changes:

    - Standard ERC-20, ERC-721, ERC-1155 tokens
    - DeFi protocols and DEXs
    - DAOs and governance contracts

    May need modifications:

    - Factory contracts that create other contracts at runtime
    - Contracts using `EXTCODECOPY` for runtime code manipulation
    - Contracts relying on gas stipends for reentrancy protection

## Troubleshooting

- Why are my gas calculations different?

    PolkaVM uses dynamic gas scaling:

    - Gas values reflect actual performance benchmarks
    - Don't hardcode gas values - use flexible calculations
    - Cross-contract calls ignore gas limits - implement proper access controls

- I deployed a contract with metamask, and got a `code size` error - why?

    The latest MetaMask update affects the extension’s ability to deploy large contracts. Check the [Wallets](/develop/smart-contracts/wallets){target=_blank} page for more details.


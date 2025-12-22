---
title: Accounts in Polkadot Hub Smart Contracts
description: Bridges Ethereum's 20-byte addresses with Polkadot's 32-byte accounts, enabling seamless interaction while maintaining compatibility with Ethereum tooling.
categories: Basics, Polkadot Protocol
---

# Accounts Polkadot Hub Smart Contracts

## Introduction

Polkadot Hub natively utilizes Polkadot's 32-byte account system while providing interoperability with Ethereum's 20-byte addresses through an automatic conversion system. When interacting with smart contracts:

- Ethereum-compatible wallets (like MetaMask) can use their familiar 20-byte addresses.
- Polkadot accounts continue using their native 32-byte format.
- The Polkadot Hub chain automatically handles conversion between the two formats behind the scenes:

    - 20-byte Ethereum addresses are padded with `0xEE` bytes to create valid 32-byte Polkadot accounts.
    - 32-byte Polkadot accounts can optionally register a mapping to a 20-byte address for Ethereum compatibility.

This dual-format approach enables Polkadot Hub to maintain compatibility with Ethereum tooling while fully integrating with the Polkadot ecosystem.

## Address Types and Mappings

The platform handles two distinct address formats:

- [Ethereum-style addresses (20 bytes)](https://ethereum.org/developers/docs/accounts/#account-creation){target=\_blank}
- [Polkadot native account IDs (32 bytes)](https://wiki.polkadot.com/learn/learn-account-advanced/#address-format){target=\_blank}

<!-- TODO POST-MVP: Update above link to:
- [Polkadot native account IDs (32 bytes)](/reference/parachains/accounts/){target=\_blank} -->

### Ethereum to Polkadot Mapping

The [`AccountId32Mapper`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/struct.AccountId32Mapper.html){target=\_blank} implementation in [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} handles the core address conversion logic. For converting a 20-byte Ethereum address to a 32-byte Polkadot address, the pallet uses a simple concatenation approach:

- [**Core mechanism**](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_fallback_account_id){target=\_blank}: Takes a 20-byte Ethereum address and extends it to 32 bytes by adding twelve `0xEE` bytes at the end. The key benefits of this approach are:
    - Able to fully revert, allowing a smooth transition back to the Ethereum format.
    - Provides clear identification of Ethereum-controlled accounts through the `0xEE` suffix pattern.
    - Maintains cryptographic security with a `2^96` difficulty for pattern reproduction.

### Polkadot to Ethereum Mapping

The conversion from 32-byte Polkadot accounts to 20-byte Ethereum addresses is more complex than the reverse direction due to the lossy nature of the conversion. The [`AccountId32Mapper`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/struct.AccountId32Mapper.html){target=\_blank} handles this through two distinct approaches:

- **For Ethereum-derived accounts**: The system uses the [`is_eth_derived`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/fn.is_eth_derived.html){target=\_blank} function to detect accounts that were originally Ethereum addresses (identified by the `0xEE` suffix pattern). For these accounts, the conversion strips the last 12 bytes to recover the original 20-byte Ethereum address.

- **For native Polkadot accounts**: Since these accounts utilize the whole 32-byte space and weren't derived from Ethereum addresses, direct truncation would result in lost information. Instead, the system:

    1. Hashes the entire 32-byte account using Keccak-256.
    2. Takes the last 20 bytes of the hash to create the Ethereum address.
    3. This ensures a deterministic mapping while avoiding simple truncation.

The conversion process is implemented through the [`to_address`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_address){target=\_blank} function, which automatically detects the account type and applies the appropriate conversion method.

**Stateful Mapping for Reversibility** : Since the conversion from 32-byte to 20-byte addresses is inherently lossy, the system provides an optional stateful mapping through the [`OriginalAccount`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/storage_types/struct.OriginalAccount.html){target=\_blank} storage. When a Polkadot account registers a mapping (via the [`map`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.map){target=\_blank} function), the system stores the original 32-byte account ID, enabling the [`to_account_id`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_account_id){target=\_blank} function to recover the exact original account rather than falling back to a default conversion.


### Interacting with Unmapped Substrate Accounts

Native Polkadot accounts (32-byte format) that haven't been explicitly mapped have limited interaction capabilities with the Ethereum-compatible smart contract layer. Understanding these limitations and when mapping is required is essential for developers working with Polkadot Hub Smart Contracts.

#### Limitations of Unmapped Accounts

Unmapped Substrate accounts (those created with Ed25519 or Sr25519 keypairs) face the following restrictions:

- Cannot initiate transactions through Ethereum-compatible interfaces (like MetaMask or other EVM-compatible wallets).
- Cannot directly call smart contracts using Ethereum RPC methods.
- Cannot transfer funds to or from 20-byte Ethereum-compatible addresses without proper mapping.
- Limited interoperability with Ethereum tooling and existing EVM infrastructure.

The system can *receive* funds at the hashed 20-byte address derived from the 32-byte account, but the original account owner cannot control or access those funds through Ethereum-compatible methods without first establishing a proper mapping.

#### When Mapping is Required

Account mapping is **required** when:

- You want to interact with smart contracts using Ethereum-compatible tools (MetaMask, Web3.js, Ethers.js).
- You need to transfer funds using 20-byte address format.
- You want your existing Polkadot account to be accessible through EVM-compatible interfaces.
- You need bidirectional compatibility between Polkadot and Ethereum address formats.

Account mapping is **not required** when:

- Using native Polkadot addresses (32-byte) exclusively with Substrate-native interfaces.
- Interacting with parachains that don't use the Ethereum-compatible layer.
- Using accounts that were originally created with secp256k1 keys (Ethereum-compatible from the start).

### Account Mapping for Native Polkadot Accounts

If you have a native Polkadot account (32-byte format) that was created with a Polkadot/Substrate keypair (Ed25519/Sr25519) rather than an Ethereum-compatible keypair (secp256k1), you'll need to map your account to enable Ethereum compatibility.

To map your account, call the [`map_account`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/dispatchables/fn.map_account.html){target=\_blank} extrinsic of the [`pallet_revive`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/index.html){target=\_blank} pallet using your original Substrate account. This creates a stateful mapping that allows your 32-byte account to interact with the Ethereum-compatible smart contract system.

**Mapping Process:**

1. **Call the extrinsic**: Use your Substrate wallet to call `pallet_revive.map_account()`.
2. **Pay the deposit**: A deposit is required and held while the mapping exists (refundable upon unmapping).
3. **Receive confirmation**: Once mapped, your account can be used with both Polkadot and Ethereum interfaces.

Once mapped, you'll be able to:

- Transfer funds between 20-byte format addresses.
- Interact with smart contracts using Ethereum-compatible tools like MetaMask.
- Maintain full reversibility to your original 32-byte account format.
- Access funds at both your 32-byte Polkadot address and the mapped 20-byte Ethereum address.

!!! warning "Mapping Requirement"
    Without this mapping, native Polkadot accounts cannot transfer funds or interact with the Ethereum-compatible layer on the Hub. Attempting to send funds to an unmapped account's hashed Ethereum address may result in funds being inaccessible through standard Ethereum tools.

## Account Registration

The registration process is implemented through the [`map`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.map){target=\_blank} function. This process involves:

- Checking if the account is already mapped.
- Calculating and collecting required deposits based on data size.
- Storing the address suffix for future reference.
- Managing the currency holds for security.

## Fallback Accounts

The fallback mechanism is integrated into the [`to_account_id`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_account_id){target=\_blank} function. It provides a safety net for address conversion by:

- First, attempting to retrieve stored mapping data from [`OriginalAccount`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/storage_types/struct.OriginalAccount.html){target=\_blank} storage.
- Falling back to the default conversion method (Keccak-256 hash) if no explicit mapping exists.
- Maintaining consistency in address representation across the system.

### How Fallback Works with Unmapped Accounts

When an unmapped 32-byte Polkadot account needs to be represented as a 20-byte Ethereum address, the system:

1. **Checks for explicit mapping**: First looks in the `OriginalAccount` storage to see if the account has been explicitly mapped via `map_account`.
2. **Applies fallback conversion**: If no mapping exists, automatically converts the 32-byte account to a 20-byte address by:
   - Hashing the full 32-byte account with Keccak-256.
   - Taking the last 20 bytes of the resulting hash.
3. **Uses the derived address**: This fallback address can receive funds, but the account owner cannot spend those funds through Ethereum-compatible interfaces without explicit mapping.

**Important Considerations:**

- The fallback mechanism is **one-way for unmapped accounts**. While you can derive the 20-byte address from a 32-byte account, you cannot recover the original 32-byte account from the 20-byte hash without the stored mapping.
- Funds sent to a fallback address of an unmapped account are not lost, but require explicit mapping to be accessible through Ethereum tools.
- For security and usability, it's recommended to establish explicit mappings rather than relying on fallback addresses for accounts that need Ethereum compatibility.

## Contract Address Generation

The system supports two methods for generating contract addresses:

- [CREATE1 method](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/fn.create1.html){target=\_blank}:

    - Uses the deployer address and nonce.
    - Generates deterministic addresses for standard contract deployment.

- [CREATE2 method](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/fn.create2.html){target=\_blank}:

    - Uses the deployer address, initialization code, input data, and salt.
    - Enables predictable address generation for advanced use cases.

## Security Considerations

The address mapping system maintains security through several design choices evident in the implementation:

- The stateless mapping requires no privileged operations, as shown in the [`to_fallback_account_id`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/trait.AddressMapper.html#tymethod.to_fallback_account_id){target=\_blank} implementation.
- The stateful mapping requires a deposit managed through the [`Currency`](https://paritytech.github.io/polkadot-sdk/master/pallet_revive/pallet/trait.Config.html#associatedtype.Currency){target=\_blank} trait.
- Mapping operations are protected against common errors through explicit checks.
- The system prevents double-mapping through the [`ensure!(!Self::is_mapped(account_id))`](https://github.com/paritytech/polkadot-sdk/blob/stable2412/substrate/frame/revive/src/address.rs#L125){target=\_blank} check.

All source code references are from the [`address.rs`](https://github.com/paritytech/polkadot-sdk/blob/stable2412/substrate/frame/revive/src/address.rs){target=\_blank} file in the Revive pallet of the Polkadot SDK repository.
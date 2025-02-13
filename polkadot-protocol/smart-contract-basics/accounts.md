---
title: Accounts
description: TODO
---

# Accounts on Asset Hub Smart Contracts

## Overview

Asset Hub's smart contract platform implements an innovative account system that bridges the gap between Ethereum's 20-byte addresses and Polkadot's native 32-byte account identifiers. This system enables seamless interaction between existing Polkadot accounts and smart contracts while maintaining compatibility with Ethereum tooling.

## Address Types and Mappings

The platform handles two distinct address formats:

- Ethereum-style addresses (20 bytes)
- Polkadot native account IDs (32 bytes)

### Ethereum to Polkadot Mapping

The `AccountId32Mapper` implementation in `pallet_revive` handles the core address conversion logic. For converting a 20-byte Ethereum address to a 32-byte Polkadot address, the system uses a simple concatenation approach:

```rust
fn to_fallback_account_id(address: &H160) -> AccountId32 {
    let mut account_id = AccountId32::new([0xEE; 32]);
    let account_bytes: &mut [u8; 32] = account_id.as_mut();
    account_bytes[..20].copy_from_slice(address.as_bytes());
    account_id
}
```

This implementation appends twelve `0xEE` bytes to the original Ethereum address. Unlike other implementations that hash the original address, this design offers two key advantages:

1. **Reversibility**: The mapping can be reversed by truncating the last 12 bytes, as implemented in `to_address`:
```rust
fn to_address(account_id: &AccountId32) -> H160 {
    H160::from_slice(&<AccountId32 as AsRef<[u8; 32]>>::as_ref(&account_id)[..20])
}
```

2. **Account Identification**: The `0xEE` suffix serves as a clear identifier for Ethereum-controlled accounts, as generating a Polkadot key with this specific pattern would require approximately 2^96 attempts.

### Polkadot to Ethereum Mapping

The conversion from 32-byte to 20-byte addresses is handled through a stateful mapping system implemented in the `AddressMapper` trait. The core functionality includes:

```rust
pub trait AddressMapper<T: Config>: private::Sealed {
    fn to_address(account_id: &T::AccountId) -> H160;
    fn to_account_id(address: &H160) -> T::AccountId;
    fn to_fallback_account_id(address: &H160) -> T::AccountId;
    fn map(account_id: &T::AccountId) -> DispatchResult;
    fn unmap(account_id: &T::AccountId) -> DispatchResult;
    fn is_mapped(account_id: &T::AccountId) -> bool;
}
```

## Account Registration

The registration process is implemented through the `map` function:

```rust
fn map(account_id: &T::AccountId) -> DispatchResult {
    ensure!(!Self::is_mapped(account_id), <Error<T>>::AccountAlreadyMapped);

    let account_bytes: &[u8; 32] = account_id.as_ref();
    let deposit = T::DepositPerByte::get()
        .saturating_mul(account_bytes.len().saturated_into())
        .saturating_add(T::DepositPerItem::get());

    let suffix: [u8; 12] = account_bytes[20..]
        .try_into()
        .expect("Skipping 20 byte of a an 32 byte array will fit into 12 bytes; qed");
    T::Currency::hold(&HoldReason::AddressMapping.into(), account_id, deposit)?;
    <AddressSuffix<T>>::insert(Self::to_address(account_id), suffix);
    Ok(())
}
```

## Fallback Accounts

The fallback mechanism is integrated into the `to_account_id` function:

```rust
fn to_account_id(address: &H160) -> AccountId32 {
    if let Some(suffix) = <AddressSuffix<T>>::get(address) {
        let mut account_id = Self::to_fallback_account_id(address);
        let account_bytes: &mut [u8; 32] = account_id.as_mut();
        account_bytes[20..].copy_from_slice(suffix.as_slice());
        account_id
    } else {
        Self::to_fallback_account_id(address)
    }
}
```

## Contract Address Generation

The system supports both CREATE and CREATE2 contract address generation methods:

```rust
pub fn create1(deployer: &H160, nonce: u64) -> H160 {
    let mut list = rlp::RlpStream::new_list(2);
    list.append(&deployer.as_bytes());
    list.append(&nonce);
    let hash = keccak_256(&list.out());
    H160::from_slice(&hash[12..])
}

pub fn create2(deployer: &H160, code: &[u8], input_data: &[u8], salt: &[u8; 32]) -> H160 {
    let init_code_hash = {
        let init_code: Vec<u8> = code.into_iter().chain(input_data).cloned().collect();
        keccak_256(init_code.as_ref())
    };
    let mut bytes = [0; 85];
    bytes[0] = 0xff;
    bytes[1..21].copy_from_slice(deployer.as_bytes());
    bytes[21..53].copy_from_slice(salt);
    bytes[53..85].copy_from_slice(&init_code_hash);
    let hash = keccak_256(&bytes);
    H160::from_slice(&hash[12..])
}
```

## Security Considerations

The address mapping system maintains security through several design choices evident in the implementation:

1. The stateless mapping requires no privileged operations, as shown in the `to_fallback_account_id` implementation
2. The stateful mapping requires a deposit managed through the `Currency` trait
3. Mapping operations are protected against common errors through explicit checks
4. The system prevents double-mapping through the `ensure!(!Self::is_mapped(account_id))` check

All source code references are from `/substrate/frame/revive/src/address.rs` in the Polkadot SDK repository.
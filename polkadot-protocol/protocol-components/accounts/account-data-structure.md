---
title: Account Data Structure
description: An overview of how accounts are managed in the Polkadot SDK, focusing on their data structure and lifecycle management within the runtime.
---

# Account Data Structure

Accounts are a foundational element of any blockchain. This page explains how accounts are managed in the Polkadot SDK and how their data structures are utilized to manage the account lifecycle within the runtime.

## Account

The [`Account` data type](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/type.Account.html) is a generically defined storage map within the [System pallet](https://paritytech.github.io/polkadot-sdk/master/src/frame_system/lib.rs.html){target=\_blank}:

```rs
 --8<-- 'code/polkadot-protocol/protocol-components/accounts/account-data-structure/account-data-structure-1.rs'
```

The preceding code block defines a storage map named `Account`. The `StorageMap` is a type of on-chain storage in Substrate that maps keys to values. Here, `T` represents the generic parameter for the runtime configuration, which is defined by the pallet's configuration trait (`Config`).

The `StorageMap` consists of the following parameters:

- **`_`** - used in macro expansion and acts as a placeholder for the storage prefix type. Since the default storage prefix (derived from the pallet and storage item name) is used here, it is represented as `_` (underscore), which tells the macro to insert the default prefix during expansion
- **`Blake2_128Concat`** - the hashing function used for keys in the storage map
- **`T::AccountId`** - the key type for the storage map, representing the account ID, which is used to access the corresponding `AccountInfo<T::Nonce, T::AccountData>` struct in storage
- `AccountInfo<T::Nonce, T::AccountData>` - the value type stored in the map. For each account ID, the map stores an `AccountInfo` struct containing:
    - **`T::Nonce`** - a nonce for the account, which is incremented with each transaction to ensure transaction uniqueness
    - **`T::AccountData`** - custom account data defined by the runtime configuration, which could include balances, locked funds, or other relevant information
- **`ValueQuery`** - a trait that defines how queries to the storage map behave when no value is found, returning the default value if a query for a key returns no result (instead of `None`)

!!! note
    See the [`StorageMap` rustdocs](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/struct.StorageMap.html){target=\_blank} for more details.

## Account Info

The `AccountInfo` for an account is also defined within the [System pallet](https://paritytech.github.io/polkadot-sdk/master/src/frame_system/lib.rs.html){target=\_blank}:

```rs
--8<-- 'code/polkadot-protocol/protocol-components/accounts/account-data-structure/account-data-structure-2.rs'
```

Each account has an `AccountInfo` structure that includes the following components:

- **`nonce`** - the number of transactions the account has sent
- **`consumers`** - the number of other modules that depend on this account's existence. Account can't be reaped until `consumers` is equal to zero
- **`providers`** - the number of modules that permit this account to exist. Account can't be reaped until `providers` and `sufficients` both equal zero
- **`sufficients`** - the number of modules that allow this account to exist for their own purposes only. Account can't be reaped until `sufficients` and `providers` both equal zero
- **`AccountData`** - a configurable structure that can store various types of data specific to the account

## Account Reference Counters

Account reference counters track dependencies in the runtime and include the `consumers`, `providers`, and `sufficients` counters. For instance, if data is stored in a map associated with an account, you wouldn't want to delete the account until the data under its control has been removed.

The `consumers` and `providers` reference counters are intended to work together. For example, in the [Session pallet](https://docs.rs/pallet-session/latest/pallet_session/){target=\_blank}, the `consumers` counter is incremented when an account sets its session keys before becoming a validator.

The `providers` counter must be greater than zero for the `consumers` counter to be incremented.

### Providers Reference Counters

The `providers` reference counter indicates whether an account is ready to be depended upon. For example, it is incremented when a new account is created with a balance greater than the existential deposit.

The `providers` reference counter prevents Substrate pallets from storing data about an account until the account is active (`providers` greater than 0).

### Consumers Reference Counters

The `consumers` reference counter ensures that other runtime pallets don't remove an account until all associated data across pallets is deleted (that is, when `consumers` equal 0).

It holds users accountable for the data they store on-chain. If users wish to delete their accounts and reclaim their existential deposit, they must first remove all data stored across all on-chain pallets to decrement the `consumers` counter.

### Sufficients Reference Counter

The `sufficients` reference counter indicates whether an account is self-sufficient and can exist independently.

For example, in the [Assets pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=\_blank}, an account may hold a sufficient quantity of specific assets without maintaining a native account balance.

### Account Deactivation

Pallets also include cleanup functions that decrement the `providers` reference counter, marking the account as deactivated within the pallet-managed scope.

Once both the `providers` and `consumers` reference counters reach zero, all on-chain pallets consider the account deactivated.

### Updating Counters

Runtime developers can manage these counters using the following:

- **`inc_consumers()`** - increment the reference counter on an account
- **`dec_consumers()`** - decrement the reference counter on an account
- **`inc_providers()`** - increment the provider reference counter on an account
- **`dec_providers()`** - decrement the provider reference counter on an account
- **`inc_sufficients()`** - increment the self-sufficient reference counter on an account
- **`dec_sufficients()`** - decrement the sufficients reference counter on an account

!!!note
    The [System pallet](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method){target=\_blank} provides all these methods.

For every counter increment during an account's lifecycle, a corresponding decrement should be called to ensure proper management of the account state.

There are also three query functions to ease usage on these counters:

- [**`can_inc_consumer()`**](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.can_inc_consumer){target=\_blank} - to check if an account is ready to be used (`providers` greater than 0)
- [**`can_dec_provider()`**](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.can_dec_provider){target=\_blank} - to check if an account is no longer referenced in the runtime whatsoever (`consumers` equal 0) before decrementing `providers` to 0
- [**`is_provider_required()`**](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.is_provider_required){target=\_blank} to check if an account has outstanding consumer references (`consumers` greater than 0)

!!! note
    See the [System pallet rustdocs](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html){target=\_blank} for more details.

## Account Data Trait and Implementation

The [`AccountInfo`](https://paritytech.github.io/polkadot-sdk/master/frame_system/struct.AccountInfo.html){target=\_blank} structure can vary as long as it satisfies the trait bounds defined by the `AccountData` associated type in the [`frame-system::pallet::Config`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html){target=\_blank} trait.

By default, the Substrate runtime configures the `AccountInfo` structure, as defined in the [Balances pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/struct.AccountData.html){target=\_blank}.

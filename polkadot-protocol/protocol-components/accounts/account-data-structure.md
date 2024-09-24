---
title: Account Data Structure
description: TODO
---

# Account Data Structure

!!! warning "Update Notice"
    Please read Substrate to [Polkadot SDK](https://docs.substrate.io/polkadot-sdk/) page first.

Accounts are a foundational element of any blockchain, and in Substrate, they serve various functions. This article explains how accounts are stored in Substrate and how their data structures are utilized to manage the account lifecycle within the runtime logic.

## Account

The `Account` data type is a generically defined storage map within the [`frame-system`](https://paritytech.github.io/polkadot-sdk/master/src/frame_system/lib.rs.html) pallet:

```rs
/// The full account information for a particular account ID.
#[pallet::storage]
#[pallet::getter(fn account)]
pub type Account<T: Config> = StorageMap<
  _,
  Blake2_128Concat,
  T::AccountId,
  AccountInfo<T::Nonce, T::AccountData>,
  ValueQuery,
>;
```

The StorageMap for an Account consists of the following parameters:

- The first parameter `(_)` is used in macro expansion.
- `Blake2_128Concat` specifies the hashing algorithm to use.
- `T::AccountId` is used as the key for over the `AccountInfo<T::Nonce, T::AccountData>` struct.

!!! note
    See [StorageMap API](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/struct.StorageMap.html) for more details.

## Account Info

The `AccountInfo` for an account is also defined within the [`frame-system`](https://paritytech.github.io/polkadot-sdk/master/src/frame_system/lib.rs.html) pallet:

```rs
#[derive(Clone, Eq, PartialEq, Default, RuntimeDebug, Encode, Decode)]
pub struct AccountInfo<Nonce, AccountData> {
  /// The number of transactions this account has sent.
  pub nonce: Nonce,
  /// The number of other modules that currently depend on this account's existence. The account
  /// cannot be reaped until this is zero.
  pub consumers: RefCount,
  /// The number of other modules that allow this account to exist. The account may not be reaped
  /// until this and `sufficients` are both zero.
  pub providers: RefCount,
  /// The number of modules that allow this account to exist for their own purposes only. The
  /// account may not be reaped until this and `providers` are both zero.
  pub sufficients: RefCount,
  /// The additional data that belongs to this account. Used to store the balance(s) in a lot of
  /// chains.
  pub data: AccountData,
}
```

Each account has an `AccountInfo` structure that includes the following components:

- `nonce`: Tracks the number of transactions the account has sent.
- `consumers`: A reference counter indicating the number of other modules that depend on this account's existence.
- `providers`: A reference counter indicating the number of modules that permit this account to exist.
- `sufficients`: A reference counter indicating the number of modules that allow this account to exist for their own purposes only.
- `AccountData`: A configurable structure that can store various types of data specific to the account.

## Account Reference Counters

Account reference counters track dependencies in the runtime. For instance, if data is stored in a map associated with an account, you wouldn't want to delete the account until the data under its control has been removed.

The `consumers` and `providers` reference counters are intended to work together. For example, in the [`session`](https://docs.rs/pallet-session/latest/pallet_session/) pallet, the consumers counter is incremented when an account sets its session keys before becoming a validator. 

The providers counter must be greater than zero for the consumers counter to be incremented.

### Providers Reference Counters

The `providers` reference counter indicates whether an account is ready to be depended upon. For example, it is incremented when a new account is created with a balance greater than the existential deposit.

The `providers` reference counter prevents Substrate pallets from storing data about an account until the account is active (`providers` > 0)

### Consumers Reference Counters

The `consumers` reference counter ensures that Substrate pallets do not remove an account until all associated data across pallets is deleted (i.e., when `consumers` == 0). 

It holds users accountable for the data they store on-chain. If users wish to delete their accounts and reclaim their existential deposit, they must first remove all data stored across all on-chain pallets to decrement the `consumers` counter.

### Sufficients Reference Counter

The `sufficients` reference counter indicates whether an account is self-sufficient and can exist independently. 

For example, in the [`assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html) pallet, an account may hold a sufficient quantity of specific assets without needing to maintain a native account balance.

### Account Deactivation 

Pallets also include cleanup functions that decrement the `providers` reference counter, marking the account as deactivated within the pallet-managed scope. 

Once both the `providers` and `consumers` reference counters reach zero, the account is considered deactivated by all on-chain pallets.

### Updating Counters

Runtime developers can manage these counters using the `inc_consumers()`, `dec_consumers()`, `inc_providers()`, `dec_providers()`, `inc_sufficients()`, and `dec_sufficients()` methods provided by the `frame-system` pallet. 

For every increment of a counter during an account's lifecycle, a corresponding decrement should be called to ensure proper management of the account state.

There are also three query functions to ease usage on these counters:

- `can_inc_consumer()` to check if an account is ready to be used (`providers` > 0).
- `can_dec_provider()` to check if an account is no longer referenced in runtime whatsoever (`consumers` == 0) before decrementing providers to 0.
- `is_provider_required()` to check if an account has outstanding consumer references (`consumers` > 0).

!!! note
    See [frame-system API](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html) for more details.

## AccountData Trait and Implementation

The `AccountInfo` can be any structure, provided it meets the requirements of the associated type `AccountData` trait bound defined in the [`frame-system::pallet::Config`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/trait.Config.html) trait. 

By default, the Substrate runtime configures `AccountInfo` as defined in the [`pallet-balances`](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/struct.AccountData.html).

## Where to Go Next

For addtional technical details, check the following resources:

- [`frame_system::AccountInfo`](https://paritytech.github.io/polkadot-sdk/master/frame_system/struct.AccountInfo.html) API
- [`pallet_balances::AccountData`](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/struct.AccountData.html) API.
- [`pallet_session::Pallet::set_key`s](https://paritytech.github.io/polkadot-sdk/master/src/pallet_session/lib.rs.html) dispatchable call
- [`frame_system::Provider`](https://paritytech.github.io/polkadot-sdk/master/src/frame_system/lib.rs.html) `HandleLifetime` implementation
- `pallet_assets` [`new_account`](https://paritytech.github.io/polkadot-sdk/master/src/pallet_assets/functions.rs.html) function
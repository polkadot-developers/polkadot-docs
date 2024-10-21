---
title: Storage Migrations
description: TODO
---

# Storage Migrations

## Introduction

Storage migrations are a crucial part of the runtime upgrade process. They allow you to update the storage layout of your blockchain, adapting to changes in the runtime. Whenever you change the encoding or data types used to represent data in storage, you'll need to provide a storage migration to ensure the runtime can properly interpret the existing stored values in the new runtime state.

Without performing storage migrations, runtime upgrades that change the storage layout could lead to undefined behavior, as the runtime would be unable to correctly read the existing storage values.

## When is a Storage Migration Required?

A storage migration is necessary whenever a runtime upgrade changes the storage layout or the encoding of data stored in the runtime. Even if the underlying data type appears to still "fit" the new storage representation, a migration may be required if the interpretation of the stored values has changed.

Here are some common scenarios where a storage migration is needed:

- Changing data types:

    ```rust
    #[pallet::storage]
    pub type FooValue = StorageValue<_, Foo>;
    // old
    pub struct Foo(u32)
    // new
    pub struct Foo(u64)
    ```

    Changing the underlying data type requires a migration to convert the existing values.

- Changing data representation

    ```rust
    #[pallet::storage]
    pub type FooValue = StorageValue<_, Foo>;
    // old
    pub struct Foo(u32)
    // new
    pub struct Foo(i32)
    // or
    pub struct Foo(u16, u16)
    ```

    Modifying the representation of the stored data, even if the size appears unchanged, requires a migration to ensure the runtime can properly interpret the existing values.

- Extending an enum

    ```rust
    #[pallet::storage]
    pub type FooValue = StorageValue<_, Foo>;
    // old
    pub enum Foo { A(u32), B(u32) }
    // new
    pub enum Foo { A(u32), B(u32), C(u128) }
    ```

    Adding new variants to an enum requires a migration to handle the new variant, unless the new variant is added at the end and no existing values are initialized with it.

- Changing the storage key

    ```rust
    #[pallet::storage]
    pub type FooValue = StorageValue<_, u32>;
    // new
    #[pallet::storage]
    pub type BarValue = StorageValue<_, u32>;
    ```

    Modifying the storage key, even if the underlying data type remains the same, requires a migration to ensure the runtime can locate the correct stored values.

!!!warning
    In general, any change to the storage layout or data encoding used in your runtime requires a careful consideration of the need for a storage migration. Overlooking a necessary migration can lead to undefined behavior or data loss during a runtime upgrade.

## Implementing Storage Migrations

Once you upgrade a runtime, the code is expecting the data to be in a new format.
Any on_initialize or transaction might fail decoding data, and potentially panic!

We need a hook that is executed ONCE as a part of the new runtime. But before ANY other code (on_initialize, any transaction) with the new runtime is migrated. This is OnRuntimeUpgrade. This trait provides a single function, on_runtime_upgrade, which allows you to specify the logic to run immediately after a runtime upgrade, but before any on_initialize functions or transactions are executed.

Inside the on_runtime_upgrade function, you can read the existing storage values, perform any necessary transformations, and write the updated values back to storage. 
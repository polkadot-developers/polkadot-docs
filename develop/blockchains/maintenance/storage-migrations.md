---
title: Storage Migrations
description: Ensure smooth runtime upgrades with storage migrations, updating data formats and preventing errors. Learn when and how to implement migrations efficiently.
---

# Storage Migrations

## Introduction

Storage migrations are a crucial part of the runtime upgrade process. They allow you to update the storage layout of your blockchain, adapting to changes in the runtime. Whenever you change the encoding or data types used to represent data in storage, you'll need to provide a storage migration to ensure the runtime can properly interpret the existing stored values in the new runtime state.

Storage migrations must be executed at a precise moment during the runtime upgrade process to ensure data consistency and prevent runtime panics. The migration code needs to run:

- After the new runtime is deployed
- Before any other code from the new runtime executes
- Before any [`on_initialize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_initialize){target=\_blank} hooks run
- Before any transactions are processed

This timing is critical because the new runtime expects data to be in the updated format. Without proper migration, any attempt to decode the old data format could result in runtime panics or undefined behavior.

## When is a Storage Migration Required?

A storage migration is necessary whenever a runtime upgrade changes the storage layout or the encoding/interpretation of existing data. Even if the underlying data type appears to still "fit" the new storage representation, a migration may be required if the interpretation of the stored values has changed.

- Adding or removing an extrinsic introduces no new interpretation of preexisting data, so not migration required

- Reordering or mutating fields of an existing data type do change the encoded/decoded data representation, hence a storage migration is needed

- Removal of a pallet or storage item warrants cleaning up storage via a migration to avoid state bloat

- Adding a new storage item would not require any migration

### Common Cases

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

The [`OnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html){target=\_blank} trait provides the foundation for implementing storage migrations in your runtime. Here's a detailed look at its key functions:

```rust
pub trait OnRuntimeUpgrade {
    fn on_runtime_upgrade() -> Weight { ... }
    fn try_on_runtime_upgrade(checks: bool) -> Result<Weight, TryRuntimeError> { ... }
    fn pre_upgrade() -> Result<Vec<u8>, TryRuntimeError> { ... }
    fn post_upgrade(_state: Vec<u8>) -> Result<(), TryRuntimeError> { ... }
}
```

### Core Migration Function

The **[`on_runtime_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_runtime_upgrade){target=\_blank}** function executes when the FRAME Executive pallet detects a runtime upgrade. Important considerations:

- Runs before any pallet's `on_initialize` hooks
- Critical storage items (like block_number) may not be set
- Execution is mandatory and must complete
- Requires careful weight calculation to prevent bricking the chain

### Migration Testing Hooks

The trait provides three testing-focused functions designed specifically for testing migrations. These functions never execute on-chain but are essential for validating migration behavior in test environments.

- **[`try_on_runtime_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html#method.try_on_runtime_upgrade){target=\_blank}** - this function serves as the primary orchestrator for testing the complete migration process. It coordinates the execution flow from `pre-upgrade` checks through the actual migration to `post-upgrade` verification. By handling the entire migration sequence, it ensures that storage modifications occur correctly and in the proper order. This is particularly valuable when testing multiple dependent migrations, where the execution order matters

- **[`pre_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.pre_upgrade){target=\_blank}** - before a runtime upgrade begins, the `pre_upgrade` function performs preliminary checks and captures the current state. It returns encoded state data that can be used for `post-upgrade` verification. This function must never modify storage - it should only read and verify the existing state. The data it returns typically includes critical state values that should remain consistent or transform predictably during migration

- **[`post_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.post_upgrade){target=\_blank}** - after the migration completes, `post_upgrade` validates its success. It receives the state data captured by `pre_upgrade` and uses this to verify that the migration executed correctly. This function checks for storage consistency and ensures all data transformations occurred as expected. Like `pre_upgrade`, it operates exclusively in testing environments and should not modify storage

### Migration Logic

When implementing the actual migration logic, your code needs to handle several key responsibilities. Your migration implementation should:

- Read existing storage values in their original format
- Transform data to match the new format
- Write updated values back to storage
- Calculate and return consumed weight

<!-- TODO: Add example -->
### Migration Structure

Storage migrations can be implemented using two approaches. The first method involves directly implementing `OnRuntimeUpgrade` on structs. This approach requires manually checking the on-chain storage version against the new [`StorageVersion`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/struct.StorageVersion.html){target=\_blank} and executing the transformation logic only when the check passes. This version verification prevents multiple executions of the migration during subsequent runtime upgrades.

The recommended approach is to implement [`UncheckedOnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.UncheckedOnRuntimeUpgrade.html){target=\_blank} and wrap it with [`VersionedMigration`](https://paritytech.github.io/polkadot-sdk/master/frame_support/migrations/struct.VersionedMigration.html){target=\_blank}. `VersionedMigration` implements `OnRuntimeUpgrade` and handles storage version management automatically, following best practices and reducing potential errors.

`VersionedMigration` requires five type parameters:

- `From` - the source version for the upgrade
- `To` - the target version for the upgrade
- `Inner` - the `UncheckedOnRuntimeUpgrade` implementation
- `Pallet` - the pallet being upgraded
- `Weight` - the runtime's [`RuntimeDbWeight`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.RuntimeDbWeight.html){target=\_blank} implementation

```rust
use frame_support::{
    storage_alias,
    traits::{Get, UncheckedOnRuntimeUpgrade},
};

/// Collection of storage item formats from the previous storage version.
///
/// Required so we can read values in the v0 storage format during the migration.
mod v0 {
    use super::*;

    /// V0 type for [`crate::Value`].
    #[storage_alias]
    pub type Value<T: crate::Config> = StorageValue<crate::Pallet<T>, u32>;
}

/// Implements [`UncheckedOnRuntimeUpgrade`], migrating the state of this pallet from V0 to V1.
///
/// In V0 of the template [`crate::Value`] is just a `u32`. In V1, it has been upgraded to
/// contain the struct [`crate::CurrentAndPreviousValue`].
///
/// In this migration, update the on-chain storage for the pallet to reflect the new storage
/// layout.
pub struct InnerMigrateV0ToV1<T: crate::Config>(core::marker::PhantomData<T>);
impl<T: crate::Config> UncheckedOnRuntimeUpgrade for InnerMigrateV0ToV1<T> {
    /// Migrate the storage from V0 to V1.
    ///
    /// - If the value doesn't exist, there is nothing to do.
    /// - If the value exists, it is read and then written back to storage inside a
    ///   [`crate::CurrentAndPreviousValue`].
    fn on_runtime_upgrade() -> frame_support::weights::Weight {
        // Read the old value from storage
        if let Some(old_value) = v0::Value::<T>::take() {
            // Write the new value to storage
            let new = crate::CurrentAndPreviousValue { current: old_value, previous: None };
            crate::Value::<T>::put(new);
            // One read + write for taking the old value, and one write for setting the new value
            T::DbWeight::get().reads_writes(1, 2)
        } else {
            // No writes since there was no old value, just one read for checking
            T::DbWeight::get().reads(1)
        }
    }
}

/// [`UncheckedOnRuntimeUpgrade`] implementation [`InnerMigrateV0ToV1`] wrapped in a
/// [`VersionedMigration`](frame_support::migrations::VersionedMigration), which ensures that:
/// - The migration only runs once when the on-chain storage version is 0
/// - The on-chain storage version is updated to `1` after the migration executes
/// - Reads/Writes from checking/settings the on-chain storage version are accounted for
pub type MigrateV0ToV1<T> = frame_support::migrations::VersionedMigration
    0, // The migration will only execute when the on-chain storage version is 0
    1, // The on-chain storage version will be set to 1 after the migration is complete
    InnerMigrateV0ToV1<T>,
    crate::pallet::Pallet<T>,
    <T as frame_system::Config>::DbWeight,
>;
```

### Migration Organization

Best practices recommend organizing migrations in a separate module within your pallet. Here's the recommended file structure:

```plain
my-pallet/
├── src/
│   ├── lib.rs       # Main pallet implementation
│   └── migrations/  # All migration-related code
│       ├── mod.rs   # Migrations module definition
│       ├── v1.rs    # V0 -> V1 migration
│       └── v2.rs    # V1 -> V2 migration
└── Cargo.toml
```

This structure provides several benefits:

- Separates migration logic from core pallet functionality
- Makes migrations easier to test and maintain
- Provides clear versioning of storage changes
- Simplifies the addition of future migrations

### Scheduling Migrations

To execute migrations during a runtime upgrade, you need to configure them in your runtime's `Executive` pallet. Add your migrations in `runtime/src/lib.rs`:

```rust
/// Tuple of migrations (structs that implement `OnRuntimeUpgrade`)
type Migrations = (
    pallet_my_pallet::migrations::v1::Migration,
	// More migrations can be added here
);
pub type Executive = frame_executive::Executive<
	Runtime,
	Block,
	frame_system::ChainContext<Runtime>,
	Runtime,
	AllPalletsWithSystem,
	Migrations, // Include migrations here
>;
```

### Single Block Migrations

Single block migrations execute their entire logic within one block immediately following a runtime upgrade. They run as part of the runtime upgrade process through the `OnRuntimeUpgrade` trait implementation and must complete before any other runtime logic executes.
While single block migrations are straightforward to implement and provide immediate data transformation, they carry significant risks. The most critical consideration is that they *must* complete within one block's weight limits. This is especially crucial for parachains, where exceeding block weight limits will brick the chain.
Use single block migrations only when you can guarantee:

- The migration has bounded execution time
- Weight calculations are thoroughly tested
- Total weight will never exceed block limits

For a complete implementation example of a single-block migration, refer to the [single block migration example]( https://paritytech.github.io/polkadot-sdk/master/pallet_example_single_block_migrations/index.html){target=\_blank} in the Polkadot SDK documentation.

### Multi Block Migrations

Multi-block migrations distribute the migration workload across multiple blocks, providing a safer approach for production environments. The migration state is tracked in storage, allowing the process to pause and resume across blocks.
This approach is particularly valuable for production networks and parachains. The risk of exceeding block weight limits is eliminated. Multi-block migrations can safely handle large storage collections, unbounded data structures, and complex nested data types where weight consumption might be unpredictable.

You should use multi-block migrations when dealing with:

- Large-scale storage migrations
- Unbounded storage items or collections
- Complex data structures with uncertain weight costs

The primary trade-off is increased implementation complexity, as you need to manage migration state and handle partial completion scenarios. However, this complexity is usually warranted given the significant safety benefits and operational reliability that multi-block migrations provide.

For a complete implementation example of multi-block migrations, refer to the [official example](https://github.com/paritytech/polkadot-sdk/tree/0d7d2177807ec6b3094f4491a45b0bc0d74d3c8b/substrate/frame/examples/multi-block-migrations){target=\_blank} in the Polkadot SDK.

<!-- TODO: ADD Testing info. Try-runtime, chopsticks, etc -->
---
title: Storage Migrations
description: Ensure smooth runtime upgrades with storage migrations, update data formats, and prevent errors. Learn when and how to implement migrations efficiently.
---

# Storage Migrations

## Introduction

Storage migrations are a crucial part of the runtime upgrade process. They allow you to update the [storage items](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.storage.html){target=\_blank} of your blockchain, adapting to changes in the runtime. Whenever you change the encoding or data types used to represent data in storage, you'll need to provide a storage migration to ensure the runtime can correctly interpret the existing stored values in the new runtime state.

Storage migrations must be executed precisely during the runtime upgrade process to ensure data consistency and prevent [runtime panics](https://doc.rust-lang.org/std/macro.panic.html){target=\_blank}. The migration code needs to run as follows:

- After the new runtime is deployed
- Before any other code from the new runtime executes
- Before any [`on_initialize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_initialize){target=\_blank} hooks run
- Before any transactions are processed

This timing is critical because the new runtime expects data to be in the updated format. Any attempt to decode the old data format without proper migration could result in runtime panics or undefined behavior.

## Storage Migration Scenarios

A storage migration is necessary whenever a runtime upgrade changes the storage layout or the encoding/interpretation of existing data. Even if the underlying data type appears to still "fit" the new storage representation, a migration may be required if the interpretation of the stored values has changed.

Storage migrations ensure data consistency and prevent corruption during runtime upgrades. Below are common scenarios categorized by their impact on storage and migration requirements:

- Migration required:
    - Reordering or mutating fields of an existing data type to change the encoded/decoded data representation
    - Removal of a pallet or storage item warrants cleaning up storage via a migration to avoid state bloat

- Migration not required:
    - Adding a new storage item would not require any migration since no existing data needs transformation
    - Adding or removing an extrinsic introduces no new interpretation of preexisting data, so no migration is required

The following are some common scenarios where a storage migration is needed:

- **Changing data types** - changing the underlying data type requires a migration to convert the existing values

    ```rust
    --8<-- 'code/develop/parachains/maintenance/storage-migrations/example-1.rs'
    ```

- **Changing data representation** - modifying the representation of the stored data, even if the size appears unchanged, requires a migration to ensure the runtime can correctly interpret the existing values

    ```rust
    --8<-- 'code/develop/parachains/maintenance/storage-migrations/example-2.rs'
    ```

- **Extending an enum** - adding new variants to an enum requires a migration if you reorder existing variants, insert new variants between existing ones, or change the data type of existing variants. No migration is required when adding new variants at the end of the enum

    ```rust
    --8<-- 'code/develop/parachains/maintenance/storage-migrations/example-3.rs'
    ```

- **Changing the storage key** - modifying the storage key, even if the underlying data type remains the same, requires a migration to ensure the runtime can locate the correct stored values.

    ```rust
    --8<-- 'code/develop/parachains/maintenance/storage-migrations/example-4.rs'
    ```

!!!warning
    In general, any change to the storage layout or data encoding used in your runtime requires careful consideration of the need for a storage migration. Overlooking a necessary migration can lead to undefined behavior or data loss during a runtime upgrade.

## Implement Storage Migrations

The [`OnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html){target=\_blank} trait provides the foundation for implementing storage migrations in your runtime. Here's a detailed look at its essential functions:

```rust
--8<-- 'code/develop/parachains/maintenance/storage-migrations/on-runtime-upgrade-trait.rs'
```

### Core Migration Function

The [`on_runtime_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_runtime_upgrade){target=\_blank} function executes when the FRAME Executive pallet detects a runtime upgrade. Important considerations when using this function include:

- It runs before any pallet's `on_initialize` hooks
- Critical storage items (like [`block_number`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.block_number){target=\_blank}) may not be set
- Execution is mandatory and must be completed
- Careful weight calculation is required to prevent bricking the chain

When implementing the migration logic, your code must handle several vital responsibilities. A migration implementation must do the following to operate correctly:

- Read existing storage values in their original format
- Transform data to match the new format
- Write updated values back to storage
- Calculate and return consumed weight

### Migration Testing Hooks

The `OnRuntimeUpgrade` trait provides some functions designed specifically for testing migrations. These functions never execute on-chain but are essential for validating migration behavior in test environments. The migration test hooks are as follows:

- **[`try_on_runtime_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html#method.try_on_runtime_upgrade){target=\_blank}** - this function serves as the primary orchestrator for testing the complete migration process. It coordinates the execution flow from `pre-upgrade` checks through the actual migration to `post-upgrade` verification. Handling the entire migration sequence ensures that storage modifications occur correctly and in the proper order. Preserving this sequence is particularly valuable when testing multiple dependent migrations, where the execution order matters

- **[`pre_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.pre_upgrade){target=\_blank}** - before a runtime upgrade begins, the `pre_upgrade` function performs preliminary checks and captures the current state. It returns encoded state data that can be used for `post-upgrade` verification. This function must never modify storage - it should only read and verify the existing state. The data it returns includes critical state values that should remain consistent or transform predictably during migration

- **[`post_upgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.post_upgrade){target=\_blank}** - after the migration completes, `post_upgrade` validates its success. It receives the state data captured by `pre_upgrade` to verify that the migration was executed correctly. This function checks for storage consistency and ensures all data transformations are completed as expected. Like `pre_upgrade`, it operates exclusively in testing environments and should not modify storage

### Migration Structure

There are two approaches to implementing storage migrations. The first method involves directly implementing `OnRuntimeUpgrade` on structs. This approach requires manually checking the on-chain storage version against the new [`StorageVersion`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/struct.StorageVersion.html){target=\_blank} and executing the transformation logic only when the check passes. This version verification prevents multiple executions of the migration during subsequent runtime upgrades.

The recommended approach is to implement [`UncheckedOnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.UncheckedOnRuntimeUpgrade.html){target=\_blank} and wrap it with [`VersionedMigration`](https://paritytech.github.io/polkadot-sdk/master/frame_support/migrations/struct.VersionedMigration.html){target=\_blank}. `VersionedMigration` implements `OnRuntimeUpgrade` and handles storage version management automatically, following best practices and reducing potential errors.

`VersionedMigration` requires five type parameters:

- `From` - the source version for the upgrade
- `To` - the target version for the upgrade
- `Inner` - the `UncheckedOnRuntimeUpgrade` implementation
- `Pallet` - the pallet being upgraded
- `Weight` - the runtime's [`RuntimeDbWeight`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.RuntimeDbWeight.html){target=\_blank} implementation

Examine the following migration example that transforms a simple `StorageValue` storing a `u32` into a more complex structure that tracks both current and previous values using the `CurrentAndPreviousValue` struct:

- Old `StorageValue` format:
```rust
#[pallet::storage]
pub type Value<T: Config> = StorageValue<_, u32>;
```

- New `StorageValue` format:
```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2409-1/substrate/frame/examples/single-block-migrations/src/lib.rs:166:177'

--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2409-1/substrate/frame/examples/single-block-migrations/src/lib.rs:200:201'
```

- Migration:
```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2409-1/substrate/frame/examples/single-block-migrations/src/migrations/v1.rs:18:122'
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
- Provides explicit versioning of storage changes
- Simplifies the addition of future migrations

### Scheduling Migrations

To execute migrations during a runtime upgrade, you must configure them in your runtime's Executive pallet. Add your migrations in `runtime/src/lib.rs`:

```rust
--8<-- 'code/develop/parachains/maintenance/storage-migrations/executive.rs'
```

## Single-Block Migrations

Single-block migrations execute their logic within one block immediately following a runtime upgrade. They run as part of the runtime upgrade process through the `OnRuntimeUpgrade` trait implementation and must be completed before any other runtime logic executes.

While single-block migrations are straightforward to implement and provide immediate data transformation, they carry significant risks. The most critical consideration is that they must complete within one block's weight limits. This is especially crucial for parachains, where exceeding block weight limits will brick the chain.

Use single-block migrations only when you can guarantee:

- The migration has a bounded execution time
- Weight calculations are thoroughly tested
- Total weight will never exceed block limits

For a complete implementation example of a single-block migration, refer to the [single-block migration example]( https://paritytech.github.io/polkadot-sdk/master/pallet_example_single_block_migrations/index.html){target=\_blank} in the Polkadot SDK documentation.

## Multi Block Migrations

Multi-block migrations distribute the migration workload across multiple blocks, providing a safer approach for production environments. The migration state is tracked in storage, allowing the process to pause and resume across blocks.

This approach is essential for production networks and parachains as the risk of exceeding block weight limits is eliminated. Multi-block migrations can safely handle large storage collections, unbounded data structures, and complex nested data types where weight consumption might be unpredictable.

Multi-block migrations are ideal when dealing with:

- Large-scale storage migrations
- Unbounded storage items or collections
- Complex data structures with uncertain weight costs

The primary trade-off is increased implementation complexity, as you must manage the migration state and handle partial completion scenarios. However, multi-block migrations' significant safety benefits and operational reliability are typically worth the increased complexity.

For a complete implementation example of multi-block migrations, refer to the [official example](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame/examples/multi-block-migrations){target=\_blank} in the Polkadot SDK.
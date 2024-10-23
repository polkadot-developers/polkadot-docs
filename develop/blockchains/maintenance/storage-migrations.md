---
title: Storage Migrations
description: TODO
---

# Storage Migrations

## Introduction

Storage migrations are a crucial part of the runtime upgrade process. They allow you to update the storage layout of your blockchain, adapting to changes in the runtime. Whenever you change the encoding or data types used to represent data in storage, you'll need to provide a storage migration to ensure the runtime can properly interpret the existing stored values in the new runtime state.

Storage migrations must be executed at a precise moment during the runtime upgrade process to ensure data consistency and prevent runtime panics. The migration code needs to run:

- After the new runtime is deployed
- Before any other code from the new runtime executes
- Before any `on_initialize` hooks run
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

The [`OnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html){target=\_blank} trait provides the foundation for implementing storage migrations in your runtime:

```rust
pub trait OnRuntimeUpgrade {
    fn on_runtime_upgrade() -> Weight { 
        // Migration logic goes here
    }
    ...
}
```

This function allows you to:

- Read existing storage values using the old format
- Transform the data into the new format
- Write the updated values back to storage
- Return the weight consumed by the migration

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
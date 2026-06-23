/// Tracks the number of interactions per user.
#[pallet::storage]
pub type UserInteractions<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;
```

Your storage section should now look like this:

```rust title="src/lib.rs"
/// The current value of the counter.
#[pallet::storage]
pub type CounterValue<T> = StorageValue<_, u32, ValueQuery>;

/// Tracks the number of interactions per user.
#[pallet::storage]
pub type UserInteractions<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;
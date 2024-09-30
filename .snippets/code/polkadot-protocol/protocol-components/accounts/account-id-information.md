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
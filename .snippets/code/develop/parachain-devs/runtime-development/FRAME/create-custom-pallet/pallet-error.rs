#[pallet::error]
pub enum Error<T> {
    /// The value retrieved was `None` as no value was previously set.
    NoneValue,
    /// There was an attempt to increment the value in storage over `u32::MAX`.
    StorageOverflow,
}
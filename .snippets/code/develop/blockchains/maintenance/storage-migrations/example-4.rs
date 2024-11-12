#[pallet::storage]
pub type FooValue = StorageValue<_, u32>;
// new
#[pallet::storage]
pub type BarValue = StorageValue<_, u32>;
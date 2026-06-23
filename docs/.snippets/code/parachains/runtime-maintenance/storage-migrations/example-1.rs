#[pallet::storage]
pub type FooValue = StorageValue<_, Foo>;
// old
pub struct Foo(u32)
// new
pub struct Foo(u64)
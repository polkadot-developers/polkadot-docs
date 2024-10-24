#[pallet::storage]
pub type FooValue = StorageValue<_, Foo>;
// old
pub enum Foo { A(u32), B(u32) }
// new
pub enum Foo { A(u32), B(u32), C(u128) }
#[pallet::storage]
pub type FooValue = StorageValue<_, Foo>;
// old
pub enum Foo { A(u32), B(u32) }
// new (New variant added at the end. No migration required)
pub enum Foo { A(u32), B(u32), C(u128) }
// new (Reordered variants. Requires migration)
pub enum Foo { A(u32), C(u128), B(u32) }
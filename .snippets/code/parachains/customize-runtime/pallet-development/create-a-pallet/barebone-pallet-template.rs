pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]  // snip
    #[pallet::event]   // snip
    #[pallet::error]   // snip
    #[pallet::storage] // snip
    #[pallet::call]    // snip
}
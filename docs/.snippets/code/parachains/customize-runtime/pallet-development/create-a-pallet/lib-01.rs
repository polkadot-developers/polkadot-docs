#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

pub use pallet::*;

#[frame::pallet]
pub mod pallet {
    use frame::prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        // Configuration will be added here
    }

    #[pallet::storage]
    pub type CounterValue<T> = StorageValue<_, u32, ValueQuery>;

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        // Dispatchable functions will be added here
    }
}
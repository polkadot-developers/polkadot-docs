#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[frame::pallet]
pub mod pallet {
    // ... existing pallet code
}

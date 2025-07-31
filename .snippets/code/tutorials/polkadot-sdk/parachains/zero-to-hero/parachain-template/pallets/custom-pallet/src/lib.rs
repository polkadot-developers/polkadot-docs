#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;
use crate::weights::WeightInfo;

#[frame::pallet]
pub mod pallet {
    use super::*;
    use frame::prelude::*;
    #[pallet::pallet]
    pub struct Pallet<T>(_);

    // Configuration trait for the pallet.
    #[pallet::config]
    pub trait Config: frame_system::Config {
        // Defines the event type for the pallet.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        // Defines the maximum value the counter can hold.
        #[pallet::constant]
        type CounterMaxValue: Get<u32>;

        /// A type representing the weights required by the dispatchables of this pallet.
        type WeightInfo: WeightInfo;
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// The counter value has been set to a new value by Root.
        CounterValueSet {
            /// The new value set.
            counter_value: u32,
        },
        /// A user has successfully incremented the counter.
        CounterIncremented {
            /// The new value set.
            counter_value: u32,
            /// The account who incremented the counter.
            who: T::AccountId,
            /// The amount by which the counter was incremented.
            incremented_amount: u32,
        },
        /// A user has successfully decremented the counter.
        CounterDecremented {
            /// The new value set.
            counter_value: u32,
            /// The account who decremented the counter.
            who: T::AccountId,
            /// The amount by which the counter was decremented.
            decremented_amount: u32,
        },
    }

    /// Storage for the current value of the counter.
    #[pallet::storage]
    pub type CounterValue<T> = StorageValue<_, u32>;

    /// Storage map to track the number of interactions performed by each account.
    #[pallet::storage]
    pub type UserInteractions<T: Config> = StorageMap<_, Twox64Concat, T::AccountId, u32>;

    #[pallet::error]
    pub enum Error<T> {
        /// The counter value exceeds the maximum allowed value.
        CounterValueExceedsMax,
        /// The counter value cannot be decremented below zero.
        CounterValueBelowZero,
        /// Overflow occurred in the counter.
        CounterOverflow,
        /// Overflow occurred in user interactions.
        UserInteractionOverflow,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Set the value of the counter.
        ///
        /// The dispatch origin of this call must be _Root_.
        ///
        /// - `new_value`: The new value to set for the counter.
        ///
        /// Emits `CounterValueSet` event when successful.
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::set_counter_value())]
        pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
            ensure_root(origin)?;

            ensure!(
                new_value <= T::CounterMaxValue::get(),
                Error::<T>::CounterValueExceedsMax
            );

            CounterValue::<T>::put(new_value);

            Self::deposit_event(Event::<T>::CounterValueSet {
                counter_value: new_value,
            });

            Ok(())
        }

        /// Increment the counter by a specified amount.
        ///
        /// This function can be called by any signed account.
        ///
        /// - `amount_to_increment`: The amount by which to increment the counter.
        ///
        /// Emits `CounterIncremented` event when successful.
        #[pallet::call_index(1)]
        #[pallet::weight(0)]
        pub fn increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let current_value = CounterValue::<T>::get().unwrap_or(0);

            let new_value = current_value
                .checked_add(amount_to_increment)
                .ok_or(Error::<T>::CounterOverflow)?;

            ensure!(
                new_value <= T::CounterMaxValue::get(),
                Error::<T>::CounterValueExceedsMax
            );

            CounterValue::<T>::put(new_value);

            UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
                let new_interactions = interactions
                    .unwrap_or(0)
                    .checked_add(1)
                    .ok_or(Error::<T>::UserInteractionOverflow)?;
                *interactions = Some(new_interactions); // Store the new value.

                Ok(())
            })?;

            Self::deposit_event(Event::<T>::CounterIncremented {
                counter_value: new_value,
                who,
                incremented_amount: amount_to_increment,
            });

            Ok(())
        }

        /// Decrement the counter by a specified amount.
        ///
        /// This function can be called by any signed account.
        ///
        /// - `amount_to_decrement`: The amount by which to decrement the counter.
        ///
        /// Emits `CounterDecremented` event when successful.
        #[pallet::call_index(2)]
        #[pallet::weight(0)]
        pub fn decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let current_value = CounterValue::<T>::get().unwrap_or(0);

            let new_value = current_value
                .checked_sub(amount_to_decrement)
                .ok_or(Error::<T>::CounterValueBelowZero)?;

            CounterValue::<T>::put(new_value);

            UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
                let new_interactions = interactions
                    .unwrap_or(0)
                    .checked_add(1)
                    .ok_or(Error::<T>::UserInteractionOverflow)?;
                *interactions = Some(new_interactions); // Store the new value.

                Ok(())
            })?;

            Self::deposit_event(Event::<T>::CounterDecremented {
                counter_value: new_value,
                who,
                decremented_amount: amount_to_decrement,
            });

            Ok(())
        }
    }
}
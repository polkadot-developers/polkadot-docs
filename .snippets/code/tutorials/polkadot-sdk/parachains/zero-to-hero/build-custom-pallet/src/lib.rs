// This file is part of 'cutom-pallet'.

// Copyright (C) 2025 Parity Technologies (UK) Ltd.
// SPDX-License-Identifier: MIT-0

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet(dev_mode)]
pub mod pallet {
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    // Configuration trait for the pallet
    #[pallet::config]
    pub trait Config: frame_system::Config {
        // Defines the event type for the pallet
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        // Defines the maximum value the counter can hold
        #[pallet::constant]
        type CounterMaxValue: Get<u32>;
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
        #[pallet::weight(0)]
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
                *interactions = Some(new_interactions); // Store the new value

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
                *interactions = Some(new_interactions); // Store the new value

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

#[cfg(test)]
mod tests {
    use super::*;
    use crate as custom_pallet;
    use frame_support::{assert_noop, assert_ok, derive_impl, traits::ConstU32};
    use sp_runtime::BuildStorage;

    type Block = frame_system::mocking::MockBlock<Test>;

    // Configure a mock runtime to test the pallet.
    frame_support::construct_runtime!(
        pub enum Test
        {
            System: frame_system,
            CustomPallet: custom_pallet,
        }
    );

    #[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
    impl frame_system::Config for Test {
        type Block = Block;
    }

    impl Config for Test {
        type RuntimeEvent = RuntimeEvent;
        type CounterMaxValue = ConstU32<100>;
    }

    /// Helper function to build genesis storage according to the mock runtime.
    pub fn new_test_ext() -> sp_io::TestExternalities {
        let t = frame_system::GenesisConfig::<Test>::default()
            .build_storage()
            .expect("Failed to create test externalities.");
        let mut ext = sp_io::TestExternalities::new(t);
        ext.execute_with(|| System::set_block_number(1)); // Initialize system pallet
        ext
    }

    #[test]
    fn set_counter_value_works() {
        new_test_ext().execute_with(|| {
            // Set counter value as root
            assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 42));

            // Check storage
            assert_eq!(CounterValue::<Test>::get(), Some(42));

            // Check event
            System::assert_has_event(RuntimeEvent::CustomPallet(Event::CounterValueSet {
                counter_value: 42,
            }));
        });
    }

    #[test]
    fn set_counter_value_fails_if_not_root() {
        new_test_ext().execute_with(|| {
            // Try to set counter value as a regular user (ID: 1)
            assert_noop!(
                CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 42),
                frame_support::error::BadOrigin,
            );
        });
    }

    #[test]
    fn set_counter_value_fails_if_exceeds_max() {
        new_test_ext().execute_with(|| {
            // Try to set counter value above max (100)
            assert_noop!(
                CustomPallet::set_counter_value(RuntimeOrigin::root(), 101),
                Error::<Test>::CounterValueExceedsMax
            );
        });
    }

    #[test]
    fn increment_works() {
        new_test_ext().execute_with(|| {
            // Increment counter by 5 as user 1
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));

            // Check storage
            assert_eq!(CounterValue::<Test>::get(), Some(5));
            assert_eq!(UserInteractions::<Test>::get(1), Some(1));

            // Check event
            System::assert_has_event(RuntimeEvent::CustomPallet(Event::CounterIncremented {
                counter_value: 5,
                who: 1,
                incremented_amount: 5,
            }));
        });
    }

    #[test]
    fn increment_fails_on_overflow() {
        new_test_ext().execute_with(|| {
            // Set initial value close to max
            assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 95));

            // Try to increment by more than available space
            assert_noop!(
                CustomPallet::increment(RuntimeOrigin::signed(1), 10),
                Error::<Test>::CounterValueExceedsMax
            );
        });
    }

    #[test]
    fn decrement_works() {
        new_test_ext().execute_with(|| {
            // Set initial value
            assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 10));

            // Decrement counter by 5 as user 1
            assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 5));

            // Check storage
            assert_eq!(CounterValue::<Test>::get(), Some(5));
            assert_eq!(UserInteractions::<Test>::get(1), Some(1));

            // Check event
            System::assert_has_event(RuntimeEvent::CustomPallet(Event::CounterDecremented {
                counter_value: 5,
                who: 1,
                decremented_amount: 5,
            }));
        });
    }

    #[test]
    fn decrement_fails_if_below_zero() {
        new_test_ext().execute_with(|| {
            // Try to decrement when counter is at 0
            assert_noop!(
                CustomPallet::decrement(RuntimeOrigin::signed(1), 1),
                Error::<Test>::CounterValueBelowZero
            );
        });
    }
}

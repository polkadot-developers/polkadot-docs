#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

pub use pallet::*;

#[frame::pallet]
pub mod pallet {
    use alloc::vec::Vec;
    use frame::prelude::*;

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        #[pallet::constant]
        type CounterMaxValue: Get<u32>;
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        CounterValueSet {
            new_value: u32,
        },
        CounterIncremented {
            new_value: u32,
            who: T::AccountId,
            amount: u32,
        },
        CounterDecremented {
            new_value: u32,
            who: T::AccountId,
            amount: u32,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        NoneValue,
        Overflow,
        Underflow,
        CounterMaxValueExceeded,
    }

    #[pallet::storage]
    pub type CounterValue<T> = StorageValue<_, u32, ValueQuery>;

    #[pallet::storage]
    pub type UserInteractions<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        u32,
        ValueQuery
    >;

    #[pallet::genesis_config]
    #[derive(DefaultNoBound)]
    pub struct GenesisConfig<T: Config> {
        pub initial_counter_value: u32,
        pub initial_user_interactions: Vec<(T::AccountId, u32)>,
    }

    #[pallet::genesis_build]
    impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
        fn build(&self) {
            CounterValue::<T>::put(self.initial_counter_value);
            for (account, count) in &self.initial_user_interactions {
                UserInteractions::<T>::insert(account, count);
            }
        }
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight(0)]
        pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
            ensure_root(origin)?;
            ensure!(new_value <= T::CounterMaxValue::get(), Error::<T>::CounterMaxValueExceeded);
            CounterValue::<T>::put(new_value);
            Self::deposit_event(Event::CounterValueSet { new_value });
            Ok(())
        }

        #[pallet::call_index(1)]
        #[pallet::weight(0)]
        pub fn increment(origin: OriginFor<T>, amount: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let current_value = CounterValue::<T>::get();
            let new_value = current_value.checked_add(amount).ok_or(Error::<T>::Overflow)?;
            ensure!(new_value <= T::CounterMaxValue::get(), Error::<T>::CounterMaxValueExceeded);
            CounterValue::<T>::put(new_value);
            UserInteractions::<T>::mutate(&who, |count| {
                *count = count.saturating_add(1);
            });
            Self::deposit_event(Event::CounterIncremented { new_value, who, amount });
            Ok(())
        }

        #[pallet::call_index(2)]
        #[pallet::weight(0)]
        pub fn decrement(origin: OriginFor<T>, amount: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;
            let current_value = CounterValue::<T>::get();
            let new_value = current_value.checked_sub(amount).ok_or(Error::<T>::Underflow)?;
            CounterValue::<T>::put(new_value);
            UserInteractions::<T>::mutate(&who, |count| {
                *count = count.saturating_add(1);
            });
            Self::deposit_event(Event::CounterDecremented { new_value, who, amount });
            Ok(())
        }
    }
}

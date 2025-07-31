#![cfg(feature = "runtime-benchmarks")]

use super::{Pallet as CustomPallet, *};
use frame::deps::frame_support::assert_ok;
use frame::{deps::frame_benchmarking::v2::*, prelude::*};

#[benchmarks]
mod benchmarks {
    use super::*;
    #[cfg(test)]
    use crate::pallet::Pallet as CustomPallet;
    use frame_system::RawOrigin;

    #[benchmark]
    fn set_counter_value() {
        #[extrinsic_call]
        set_counter_value(RawOrigin::Root, 5);

        assert_eq!(CounterValue::<T>::get(), Some(5u32.into()));
    }

    #[benchmark]
    fn increment() {
        let caller: T::AccountId = whitelisted_caller();

        assert_ok!(CustomPallet::<T>::set_counter_value(
            RawOrigin::Root.into(),
            5u32
        ));

        #[extrinsic_call]
        increment(RawOrigin::Signed(caller.clone()), 1);

        assert_eq!(CounterValue::<T>::get(), Some(6u32.into()));
        assert_eq!(UserInteractions::<T>::get(caller), 1u32.into());
    }

    #[benchmark]
    fn decrement() {
        let caller: T::AccountId = whitelisted_caller();

        assert_ok!(CustomPallet::<T>::set_counter_value(
            RawOrigin::Root.into(),
            5u32
        ));

        #[extrinsic_call]
        decrement(RawOrigin::Signed(caller.clone()), 1);

        assert_eq!(CounterValue::<T>::get(), Some(4u32.into()));
        assert_eq!(UserInteractions::<T>::get(caller), 1u32.into());
    }

    impl_benchmark_test_suite!(CustomPallet, crate::mock::new_test_ext(), crate::mock::Test);
}
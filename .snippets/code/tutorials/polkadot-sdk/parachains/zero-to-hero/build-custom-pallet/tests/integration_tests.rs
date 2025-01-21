// This file is part of 'custom-pallet'.

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

use custom_pallet::{self, *};
use frame_support::{assert_noop, assert_ok, derive_impl, parameter_types, traits::ConstU32};
use frame_system::RawOrigin;
use pallet_balances::AccountData;
use sp_runtime::BuildStorage;

type Block = frame_system::mocking::MockBlock<TestRuntime>;
type Balance = u64;

// Add the balances pallet for more realistic testing
frame_support::construct_runtime!(
    pub enum TestRuntime
    {
        System: frame_system,
        Balances: pallet_balances,
        CustomPallet: custom_pallet,
    }
);

parameter_types! {
    pub const ExistentialDeposit: Balance = 1;
    pub const MaxLocks: u32 = 50;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for TestRuntime {
    type Block = Block;
    type AccountData = AccountData<Balance>;
}

#[derive_impl(pallet_balances::config_preludes::TestDefaultConfig)]
impl pallet_balances::Config for TestRuntime {
    type Balance = Balance;
    type AccountStore = frame_system::Pallet<TestRuntime>;
}

impl custom_pallet::Config for TestRuntime {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<100>;
}

// Helper struct to handle runtime setup
pub struct ExtBuilder {
    balances: Vec<(u64, Balance)>,
}

impl Default for ExtBuilder {
    fn default() -> Self {
        Self {
            balances: vec![(1, 100), (2, 200), (3, 300)],
        }
    }
}

impl ExtBuilder {
    pub fn build(self) -> sp_io::TestExternalities {
        let mut t = frame_system::GenesisConfig::<TestRuntime>::default()
            .build_storage()
            .unwrap();

        pallet_balances::GenesisConfig::<TestRuntime> {
            balances: self.balances,
        }
        .assimilate_storage(&mut t)
        .unwrap();

        let mut ext = sp_io::TestExternalities::new(t);
        ext.execute_with(|| System::set_block_number(1));
        ext
    }
}

#[test]
fn integration_set_counter_and_increment() {
    ExtBuilder::default().build().execute_with(|| {
        // First set counter as root
        assert_ok!(CustomPallet::set_counter_value(RawOrigin::Root.into(), 50));

        // Check initial balance of account 1
        assert_eq!(Balances::free_balance(1), 100);

        // Increment counter as account 1
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 25));

        // Verify counter value
        assert_eq!(CounterValue::<TestRuntime>::get(), Some(75));

        // Verify user interactions
        assert_eq!(UserInteractions::<TestRuntime>::get(1), Some(1));

        // Verify event was emitted
        System::assert_last_event(RuntimeEvent::CustomPallet(Event::CounterIncremented {
            counter_value: 75,
            who: 1,
            incremented_amount: 25,
        }));
    });
}

#[test]
fn integration_multiple_users_interaction() {
    ExtBuilder::default().build().execute_with(|| {
        // Set initial counter value
        assert_ok!(CustomPallet::set_counter_value(RawOrigin::Root.into(), 50));

        // Multiple users interact with the counter
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 10));
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(2), 15));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(3), 25));

        // Verify final counter value
        assert_eq!(CounterValue::<TestRuntime>::get(), Some(50));

        // Verify all user interactions
        assert_eq!(UserInteractions::<TestRuntime>::get(1), Some(1));
        assert_eq!(UserInteractions::<TestRuntime>::get(2), Some(1));
        assert_eq!(UserInteractions::<TestRuntime>::get(3), Some(1));
    });
}

#[test]
fn integration_max_value_constraint() {
    ExtBuilder::default().build().execute_with(|| {
        // Set counter close to max value
        assert_ok!(CustomPallet::set_counter_value(RawOrigin::Root.into(), 90));

        // Try to increment beyond max value
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 20),
            Error::<TestRuntime>::CounterValueExceedsMax
        );

        // Verify counter value didn't change
        assert_eq!(CounterValue::<TestRuntime>::get(), Some(90));
    });
}

#[test]
fn integration_concurrent_operations() {
    ExtBuilder::default().build().execute_with(|| {
        // Set initial value
        assert_ok!(CustomPallet::set_counter_value(RawOrigin::Root.into(), 50));

        // Simulate multiple operations in the same block
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 10));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(2), 20));
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(3), 15));

        // Verify final state
        assert_eq!(CounterValue::<TestRuntime>::get(), Some(55));

        // Verify all interactions were recorded
        assert_eq!(UserInteractions::<TestRuntime>::get(1), Some(1));
        assert_eq!(UserInteractions::<TestRuntime>::get(2), Some(1));
        assert_eq!(UserInteractions::<TestRuntime>::get(3), Some(1));
    });
}

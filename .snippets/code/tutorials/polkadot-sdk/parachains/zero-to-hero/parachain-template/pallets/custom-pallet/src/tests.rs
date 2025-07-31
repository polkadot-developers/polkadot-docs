use crate::{mock::*, Error, Event, UserInteractions};
use frame::deps::sp_runtime;
use frame::testing_prelude::*;

// Verify root can successfully set counter value
#[test]
fn it_works_for_set_counter_value() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value within max allowed (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 5));
        // Ensure that the correct event is emitted when the value is set
        System::assert_last_event(Event::CounterValueSet { counter_value: 5 }.into());
    });
}

// Ensure non-root accounts cannot set counter value
#[test]
fn set_counter_value_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure only root (privileged account) can set counter value
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 5), // non-root account
            sp_runtime::traits::BadOrigin // Expecting a BadOrigin error
        );
    });
}

// Check that setting value above max is prevented
#[test]
fn set_counter_value_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure the counter value cannot be set above the max limit (10)
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::root(), 11),
            Error::<Test>::CounterValueExceedsMax // Expecting CounterValueExceedsMax error
        );
    });
}

// Test successful counter increment
#[test]
fn it_works_for_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize the counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Increment the counter by 5
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        // Check that the event emitted matches the increment operation
        System::assert_last_event(
            Event::CounterIncremented {
                counter_value: 5,
                who: 1,
                incremented_amount: 5,
            }
            .into(),
        );
    });
}

// Verify increment is blocked when it would exceed max value
#[test]
fn increment_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value close to max (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 7));
        // Ensure that incrementing by 4 exceeds max value (10) and fails
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 4),
            Error::<Test>::CounterValueExceedsMax // Expecting CounterValueExceedsMax error
        );
    });
}

// Ensure increment fails on u32 overflow
#[test]
fn increment_handles_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set to max value
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 1));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), u32::MAX),
            Error::<Test>::CounterOverflow
        );
    });
}

// Test successful counter decrement
#[test]
fn it_works_for_decrement() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 8
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 8));

        // Decrement counter by 3
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 3));
        // Ensure the event matches the decrement action
        System::assert_last_event(
            Event::CounterDecremented {
                counter_value: 5,
                who: 1,
                decremented_amount: 3,
            }
            .into(),
        );
    });
}

// Verify decrement is blocked when it would go below zero
#[test]
fn decrement_fails_for_below_zero() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value to 5
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 5));
        // Ensure that decrementing by 6 fails as it would result in a negative value
        assert_noop!(
            CustomPallet::decrement(RuntimeOrigin::signed(1), 6),
            Error::<Test>::CounterValueBelowZero // Expecting CounterValueBelowZero error
        );
    });
}

// Check that user interactions are correctly tracked
#[test]
fn user_interactions_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Increment by 5 and decrement by 2
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 2));

        // Check if the user interactions are correctly tracked
        assert_eq!(UserInteractions::<Test>::get(1).unwrap_or(0), 2); // User should have 2 interactions
    });
}

// Ensure user interactions prevent overflow
#[test]
fn user_interactions_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Set user interactions to max value (u32::MAX)
        UserInteractions::<Test>::insert(1, u32::MAX);
        // Ensure that incrementing by 5 fails due to overflow in user interactions
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 5),
            Error::<Test>::UserInteractionOverflow // Expecting UserInteractionOverflow error
        );
    });
}
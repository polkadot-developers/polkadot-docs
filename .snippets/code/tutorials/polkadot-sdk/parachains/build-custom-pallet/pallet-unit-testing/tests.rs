use crate::{mock::*, Error, Event, UserInteractions};
use frame_support::{assert_noop, assert_ok};

// Verify root can successfully set counter value
#[test]
fn it_works_for_set_counter_value() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set within the max value (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 5));
        System::assert_last_event(Event::CounterValueSet { counter_value: 5 }.into());
    });
}

// Ensure non-root accounts cannot set counter value
#[test]
fn set_counter_value_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 5),
            sp_runtime::traits::BadOrigin
        );
    });
}

// Check that setting value above max is prevented
#[test]
fn set_counter_value_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::root(), 11),
            Error::<Test>::CounterValueExceedsMax
        );
    });
}

// Test successful counter increment
#[test]
fn it_works_for_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure initial value is set
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));
        
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        System::assert_last_event(Event::CounterIncremented { 
            counter_value: 5, 
            who: 1, 
            incremented_amount: 5 
        }.into());
    });
}

// Verify increment is blocked when it would exceed max value
#[test]
fn increment_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set to a value close to max (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 7));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 4),
            Error::<Test>::CounterValueExceedsMax
        );
    });
}

// Ensure increment fails on u32 overflow
#[test]
fn increment_handles_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set to max value
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 10));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 1),
            Error::<Test>::CounterValueExceedsMax
        );
    });
}

// Test successful counter decrement
#[test]
fn it_works_for_decrement() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure initial value is set high enough
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 8));
        
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 3));
        System::assert_last_event(Event::CounterDecremented { 
            counter_value: 5, 
            who: 1, 
            decremented_amount: 3 
        }.into());
    });
}

// Verify decrement is blocked when it would go below zero
#[test]
fn decrement_fails_for_below_zero() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 5));
        assert_noop!(
            CustomPallet::decrement(RuntimeOrigin::signed(1), 6),
            Error::<Test>::CounterValueBelowZero
        );
    });
}

// Check that user interactions are correctly tracked
#[test]
fn user_interactions_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure initial counter value is set
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 2));

        // Check user interactions
        assert_eq!(UserInteractions::<Test>::get(1).unwrap_or(0), 2);
    });
}

// Ensure user interactions prevent overflow
#[test]
fn user_interactions_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure initial counter value is set
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));
        
        UserInteractions::<Test>::insert(1, u32::MAX);
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 5),
            Error::<Test>::UserInteractionOverflow
        );
    });
}
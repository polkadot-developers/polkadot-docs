#[test]
fn testing_runtime_with_pallet_b() {
    new_test_ext().execute_with(|| {
        // Block 0: Check if initialized correctly
        assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 0);

        // Ensure that pallet_a is initialized correctly
        assert_eq!(0, pallet_a::Pallet::<Runtime>::get_dummy_counter()); 

        // Use pallet_b to call a function that interacts with pallet_a
        let dummy_origin = RuntimeOrigin::none();
        pallet_b::Pallet::<Runtime>::dummy_call_against_pallet_a(dummy_origin, 4);

        // Confirm that pallet_a's state was updated by pallet_b
        assert_eq!(4, pallet_a::Pallet::<Runtime>::get_dummy_counter());

        // Transition to block 1.
        frame_system::Pallet::<Runtime>::set_block_number(1);

        // Confirm the block number has advanced
        assert_eq!(frame_system::pallet::<runtime>::block_number(), 1);
    });
}
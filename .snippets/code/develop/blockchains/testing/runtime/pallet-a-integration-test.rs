#[test]
fn testing_runtime_with_pallet_a() {
    new_test_ext().execute_with(|| {
        // Block 0: Verify runtime initialization
        assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 0);

        // Check the initial state of pallet_a
        assert_eq!(0, pallet_a::Pallet::<Runtime>::get_dummy_counter());

        // Simulate calling a function from pallet_a
        let dummy_origin = RuntimeOrigin::none();
        pallet_a::Pallet::<Runtime>::dummy_call(dummy_origin, 2);

        // Verify that pallet_a's state has been updated
        assert_eq!(2, pallet_a::Pallet::<Runtime>::get_dummy_counter());

        // Move to the next block
        frame_system::Pallet::<Runtime>::set_block_number(1);

        // Confirm the block number has advanced
        assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 1);
    });
}
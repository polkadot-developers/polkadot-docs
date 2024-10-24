pub mod integration_testing {
    use crate::*;
    use sp_runtime::BuildStorage;
    use frame_support::assert_ok;

    // Build genesis storage according to the runtime's configuration.
    pub fn new_test_ext() -> sp_io::TestExternalities {
        frame_system::GenesisConfig::<Runtime>::default().build_storage().unwrap().into()
    }

    #[test]
    fn testing_runtime_with_pallet_a() {
        new_test_ext().execute_with(|| {
            // Block 0: Check if initialized correctly
            assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 0);

            assert_eq!(0, pallet_a::Pallet::<Runtime>::get_dummy_counter());
            
            let dummy_origin = RuntimeOrigin::none();
            pallet_a::Pallet::<Runtime>::dummy_call(dummy_origin, 2);

            assert_eq!(2, pallet_a::Pallet::<Runtime>::get_dummy_counter());

            // Transition to block 1.
            frame_system::Pallet::<Runtime>::set_block_number(1);

            // Check if block number is now 1.
            assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 1);
        });
    }

    #[test]
    fn testing_runtime_with_pallet_b() {
        new_test_ext().execute_with(|| {
            // Block 0: Check if initialized correctly
            assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 0);

            assert_eq!(0, pallet_a::Pallet::<Runtime>::get_dummy_counter()); 
            let dummy_origin = RuntimeOrigin::none();
            pallet_b::Pallet::<Runtime>::dummy_call_against_pallet_a(dummy_origin, 4);
            assert_eq!(4, pallet_a::Pallet::<Runtime>::get_dummy_counter());

            // Transition to block 1.
            frame_system::Pallet::<Runtime>::set_block_number(1);

            // Check if block number is now 1.
            assert_eq!(frame_system::Pallet::<Runtime>::block_number(), 1);
        });
    }
}
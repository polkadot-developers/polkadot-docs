// Build genesis storage according to the runtime's configuration
pub fn new_test_ext() -> sp_io::TestExternalities {
    // Define the initial balances for accounts
    let initial_balances: Vec<(AccountId32, u128)> = vec![
        (AccountId32::from([0u8; 32]), 1_000_000_000_000),
        (AccountId32::from([1u8; 32]), 2_000_000_000_000),
    ];

    let mut t = frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap();

    // Adding balances configuration to the genesis config
    pallet_balances::GenesisConfig::<Test> {
        balances: initial_balances,
    }
    .assimilate_storage(&mut t)
    .unwrap();

    t.into()
}
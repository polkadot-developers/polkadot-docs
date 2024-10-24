pub mod integration_testing {
    use crate::*;
    use sp_runtime::BuildStorage;

    pub fn new_test_ext() -> sp_io::TestExternalities {
        frame_system::GenesisConfig::<Runtime>::default()
            .build_storage()
            .unwrap()
            .into()
    }
}
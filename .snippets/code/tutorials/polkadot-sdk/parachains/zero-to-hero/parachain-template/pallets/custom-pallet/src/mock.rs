use crate as custom_pallet;
use frame::{prelude::*, runtime::prelude::*, testing_prelude::*};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
#[frame_construct_runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeTask
    )]
    pub struct Test;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;

    #[runtime::pallet_index(1)]
    pub type CustomPallet = custom_pallet;
}

// System pallet configuration
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

// Custom pallet configuration
parameter_types! {
    pub const CounterMaxValue: u32 = 10;
}

impl custom_pallet::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
    type WeightInfo = custom_pallet::weights::SubstrateWeight<Test>;
}

// Test externalities initialization
pub fn new_test_ext() -> TestExternalities {
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}
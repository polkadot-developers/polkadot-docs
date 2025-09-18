pub mod tests {
    use crate::*;

    #[frame_support::runtime]
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
        pub type System = frame_system::Pallet<Test>;

        // Other pallets...
    }
}
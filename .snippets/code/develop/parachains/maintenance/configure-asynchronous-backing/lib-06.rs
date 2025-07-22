impl pallet_aura::Config for Runtime {
    ...
    type AllowMultipleBlocksPerSlot = ConstBool<false>;
    #[cfg(feature = "experimental")]
    type SlotDuration = ConstU64<SLOT_DURATION>;
    ...
}
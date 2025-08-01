impl cumulus_primitives_aura::AuraUnincludedSegmentApi<Block> for Runtime {
    fn can_build_upon(
        included_hash: <Block as BlockT>::Hash,
        slot: cumulus_primitives_aura::Slot,
    ) -> bool {
        Runtime::impl_can_build_upon(included_hash, slot)
    }
}
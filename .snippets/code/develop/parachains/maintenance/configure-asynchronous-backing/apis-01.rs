fn impl_slot_duration() -> sp_consensus_aura::SlotDuration {
    sp_consensus_aura::SlotDuration::from_millis(SLOT_DURATION)
}
mod async_backing_params {
    /// Maximum number of blocks simultaneously accepted by the Runtime, not yet included
    /// into the relay chain.
    pub(crate) const UNINCLUDED_SEGMENT_CAPACITY: u32 = 3;
    /// How many parachain blocks are processed by the relay chain per parent. Limits the
    /// number of blocks authored per slot.
    pub(crate) const BLOCK_PROCESSING_VELOCITY: u32 = 1;
    /// Relay chain slot duration, in milliseconds.
    pub(crate) const RELAY_CHAIN_SLOT_DURATION_MILLIS: u32 = 6000;
}
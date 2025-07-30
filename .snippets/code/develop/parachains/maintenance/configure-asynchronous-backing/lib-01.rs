// Maximum number of blocks simultaneously accepted by the runtime, not yet included into the
// relay chain.
pub const UNINCLUDED_SEGMENT_CAPACITY: u32 = 1;
// How many parachain blocks are processed by the relay chain per parent. Limits the number of
// blocks authored per slot.
pub const BLOCK_PROCESSING_VELOCITY: u32 = 1;
// Relay chain slot duration, in milliseconds.
pub const RELAY_chain_SLOT_DURATION_MILLIS: u32 = 6000;
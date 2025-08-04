// `SLOT_DURATION` is picked up by `pallet_timestamp` which is in turn picked
// up by `pallet_aura` to implement `fn slot_duration()`.
//
// Change this to adjust the block time.
pub const MILLISECS_PER_BLOCK: u64 = 12000;
pub const SLOT_DURATION: u64 = MILLISECS_PER_BLOCK;
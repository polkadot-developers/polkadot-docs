#[pallet::config]
pub trait Config: frame_system::Config {
    /// Event type used by the pallet.
    type RuntimeEvent: From<Event> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    /// Weight information for controlling extrinsic execution costs.
    type WeightInfo: WeightInfo;
}
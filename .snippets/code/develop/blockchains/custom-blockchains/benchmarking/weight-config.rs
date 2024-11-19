use crate::weights::WeightInfo;

/// Configure the pallet by specifying the parameters and types on which it depends.
#[pallet::config]
pub trait Config: frame_system::Config {
    /// A type representing the weights required by the dispatchables of this pallet.
    type WeightInfo: WeightInfo;
}
use pallet_a::Config as PalletAConfig;

...

#[pallet::config]
pub trait Config: frame_system::Config + PalletAConfig {
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
    type WeightInfo: WeightInfo;
}
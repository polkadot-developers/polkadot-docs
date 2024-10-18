#[pallet::config]
pub trait Config: frame_system::Config {
    /// The overarching event type.
    type RuntimeEvent: From<Event> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    /// The overarching call type.
    type RuntimeCall: Parameter
    + Dispatchable<RuntimeOrigin = Self::RuntimeOrigin, PostInfo = PostDispatchInfo>
    + GetDispatchInfo
    + From<frame_system::Call<Self>>
    + UnfilteredDispatchable<RuntimeOrigin = Self::RuntimeOrigin>
    + IsSubType<Call<Self>>
    + IsType<<Self as frame_system::Config>::RuntimeCall>;

    /// The caller origin, overarching type of all pallets origins.
    type PalletsOrigin: Parameter +
    Into<<Self as frame_system::Config>::RuntimeOrigin> +
    IsType<<<Self as frame_system::Config>::RuntimeOrigin as frame_support::traits::OriginTrait>::PalletsOrigin>;

    /// Weight information for extrinsics in this pallet.
    type WeightInfo: WeightInfo;
}
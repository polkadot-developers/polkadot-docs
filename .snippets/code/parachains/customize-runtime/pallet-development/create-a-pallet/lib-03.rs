#[pallet::config]
pub trait Config: frame_system::Config {
    /// The overarching runtime event type.
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    /// Maximum value the counter can reach.
    #[pallet::constant]
    type CounterMaxValue: Get<u32>;
}

#[pallet::call]
impl<T: Config> Pallet<T> {
    #[pallet::call_index(0)]
    #[pallet::weight(0)]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {}

    #[pallet::call_index(1)]
    #[pallet::weight(0)]
    pub fn increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult {}

    #[pallet::call_index(2)]
    #[pallet::weight(0)]
    pub fn decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult {}
}
#[pallet::call]
impl<T: Config> Pallet<T> {
    #[pallet::call_index(0)]
    #[pallet::weight(<T as pallet_b::Config>::WeightInfo::dummy_weight())]
    pub fn dummy_call_against_pallet_a(_origin: OriginFor<T>, number: u32) -> DispatchResult {
        pallet_a::DummyCounter::<T>::put(number);
        Self::deposit_event(Event::Dummy);
        Ok(())
    }
}
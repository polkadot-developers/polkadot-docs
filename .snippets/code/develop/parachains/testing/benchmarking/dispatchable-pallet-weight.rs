#[pallet::call_index(0)]
#[pallet::weight(T::WeightInfo::do_something())]
pub fn do_something(origin: OriginFor<T>) -> DispatchResultWithPostInfo { Ok(()) }
/// Reset the counter to zero.
///
/// The dispatch origin of this call must be _Root_.
///
/// Emits `CounterValueSet` event when successful.
#[pallet::call_index(3)]
#[pallet::weight(0)]
pub fn reset_counter(origin: OriginFor<T>) -> DispatchResult {
	ensure_root(origin)?;
	<CounterValue<T>>::put(0u32);
	Self::deposit_event(Event::CounterValueSet { counter_value: 0 });
	Ok(())
}

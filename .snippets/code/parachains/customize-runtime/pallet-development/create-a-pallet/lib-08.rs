#[pallet::call]
impl<T: Config> Pallet<T> {
    /// Set the counter to a specific value. Root origin only.
    #[pallet::call_index(0)]
    #[pallet::weight(0)]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
        // Ensure the caller is root
        ensure_root(origin)?;

        // Validate the new value doesn't exceed the maximum
        ensure!(new_value <= T::CounterMaxValue::get(), Error::<T>::CounterMaxValueExceeded);

        // Update storage
        CounterValue::<T>::put(new_value);

        // Emit event
        Self::deposit_event(Event::CounterValueSet { new_value });

        Ok(())
    }

    /// Increment the counter by a specified amount.
    #[pallet::call_index(1)]
    #[pallet::weight(0)]
    pub fn increment(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        // Ensure the caller is signed
        let who = ensure_signed(origin)?;

        // Get current counter value
        let current_value = CounterValue::<T>::get();

        // Check for overflow
        let new_value = current_value.checked_add(amount).ok_or(Error::<T>::Overflow)?;

        // Ensure new value doesn't exceed maximum
        ensure!(new_value <= T::CounterMaxValue::get(), Error::<T>::CounterMaxValueExceeded);

        // Update counter storage
        CounterValue::<T>::put(new_value);

        // Track user interaction
        UserInteractions::<T>::mutate(&who, |count| {
            *count = count.saturating_add(1);
        });

        // Emit event
        Self::deposit_event(Event::CounterIncremented {
            new_value,
            who,
            amount,
        });

        Ok(())
    }

    /// Decrement the counter by a specified amount.
    #[pallet::call_index(2)]
    #[pallet::weight(0)]
    pub fn decrement(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        // Ensure the caller is signed
        let who = ensure_signed(origin)?;

        // Get current counter value
        let current_value = CounterValue::<T>::get();

        // Check for underflow
        let new_value = current_value.checked_sub(amount).ok_or(Error::<T>::Underflow)?;

        // Update counter storage
        CounterValue::<T>::put(new_value);

        // Track user interaction
        UserInteractions::<T>::mutate(&who, |count| {
            *count = count.saturating_add(1);
        });

        // Emit event
        Self::deposit_event(Event::CounterDecremented {
            new_value,
            who,
            amount,
        });

        Ok(())
    }
}

#[pallet::call]
impl<T: Config> Pallet<T> {
    /// Set the value of the counter.
    ///
    /// The dispatch origin of this call must be _Root_.
    ///
    /// - `new_value`: The new value to set for the counter.
    ///
    /// Emits `CounterValueSet` event when successful.
    #[pallet::call_index(0)]
    #[pallet::weight(0)]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
        ensure_root(origin)?;

        ensure!(
            new_value <= T::CounterMaxValue::get(),
            Error::<T>::CounterValueExceedsMax
        );

        CounterValue::<T>::put(new_value);

        Self::deposit_event(Event::<T>::CounterValueSet {
            counter_value: new_value,
        });

        Ok(())
    }

    /// Increment the counter by a specified amount.
    ///
    /// This function can be called by any signed account.
    ///
    /// - `amount_to_increment`: The amount by which to increment the counter.
    ///
    /// Emits `CounterIncremented` event when successful.
    #[pallet::call_index(1)]
    #[pallet::weight(0)]
    pub fn increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult {
        let who = ensure_signed(origin)?;

        let current_value = CounterValue::<T>::get().unwrap_or(0);

        let new_value = current_value
            .checked_add(amount_to_increment)
            .ok_or(Error::<T>::CounterOverflow)?;

        ensure!(
            new_value <= T::CounterMaxValue::get(),
            Error::<T>::CounterValueExceedsMax
        );

        CounterValue::<T>::put(new_value);

        UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
            let new_interactions = interactions
                .unwrap_or(0)
                .checked_add(1)
                .ok_or(Error::<T>::UserInteractionOverflow)?;
            *interactions = Some(new_interactions); // Store the new value

            Ok(())
        })?;

        Self::deposit_event(Event::<T>::CounterIncremented {
            counter_value: new_value,
            who,
            incremented_amount: amount_to_increment,
        });

        Ok(())
    }

    /// Decrement the counter by a specified amount.
    ///
    /// This function can be called by any signed account.
    ///
    /// - `amount_to_decrement`: The amount by which to decrement the counter.
    ///
    /// Emits `CounterDecremented` event when successful.
    #[pallet::call_index(2)]
    #[pallet::weight(0)]
    pub fn decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult {
        let who = ensure_signed(origin)?;

        let current_value = CounterValue::<T>::get().unwrap_or(0);

        let new_value = current_value
            .checked_sub(amount_to_decrement)
            .ok_or(Error::<T>::CounterValueBelowZero)?;

        CounterValue::<T>::put(new_value);

        UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
            let new_interactions = interactions
                .unwrap_or(0)
                .checked_add(1)
                .ok_or(Error::<T>::UserInteractionOverflow)?;
            *interactions = Some(new_interactions); // Store the new value

            Ok(())
        })?;

        Self::deposit_event(Event::<T>::CounterDecremented {
            counter_value: new_value,
            who,
            decremented_amount: amount_to_decrement,
        });

        Ok(())
    }
}
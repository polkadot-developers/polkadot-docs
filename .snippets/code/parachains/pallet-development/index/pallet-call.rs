#[pallet::call]
impl<T: Config> Pallet<T> {
    #[pallet::call_index(0)]
    #[pallet::weight(Weight::default())]
    pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
        // Check that the extrinsic was signed and get the signer.
        let who = ensure_signed(origin)?;

        // Update storage.
        Something::<T>::put(something);

        // Emit an event.
        Self::deposit_event(Event::SomethingStored { something, who });

        // Return a successful `DispatchResult`
        Ok(())
    }

    #[pallet::call_index(1)]
    #[pallet::weight(Weight::default())]
    pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
        let _who = ensure_signed(origin)?;

        // Read a value from storage.
        match Something::<T>::get() {
            // Return an error if the value has not been set.
            None => Err(Error::<T>::NoneValue.into()),
            Some(old) => {
                // Increment the value read from storage. This will cause an error in the event
                // of overflow.
                let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
                // Update the value in storage with the incremented result.
                Something::<T>::put(new);
                Ok(())
            },
        }
    }
}
#[pallet::genesis_config]
#[derive(DefaultNoBound)]
pub struct GenesisConfig<T: Config> {
    /// Initial value for the counter
    pub initial_counter_value: u32,
    /// Pre-populated user interactions
    pub initial_user_interactions: Vec<(T::AccountId, u32)>,
}

#[pallet::genesis_build]
impl<T: Config> BuildGenesisConfig for GenesisConfig<T> {
    fn build(&self) {
        // Set the initial counter value
        CounterValue::<T>::put(self.initial_counter_value);

        // Set initial user interactions
        for (account, count) in &self.initial_user_interactions {
            UserInteractions::<T>::insert(account, count);
        }
    }
}

#[pallet::event]
#[pallet::generate_deposit(pub(super) fn deposit_event)]
pub enum Event<T: Config> {
    /// A user has successfully set a new value.
    SomethingStored {
        /// The new value set.
        something: u32,
        /// The account who set the new value.
        who: T::AccountId,
    },
}
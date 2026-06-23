#[pallet::event]
#[pallet::generate_deposit(pub(super) fn deposit_event)]
pub enum Event<T: Config> {
    /// Counter value was explicitly set. [new_value]
    CounterValueSet {
        new_value: u32,
    },
    /// Counter was incremented. [new_value, who, amount]
    CounterIncremented {
        new_value: u32,
        who: T::AccountId,
        amount: u32,
    },
    /// Counter was decremented. [new_value, who, amount]
    CounterDecremented {
        new_value: u32,
        who: T::AccountId,
        amount: u32,
    },
}

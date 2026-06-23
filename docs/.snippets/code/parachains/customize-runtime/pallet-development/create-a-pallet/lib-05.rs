#[pallet::error]
pub enum Error<T> {
    /// The counter value has not been set yet.
    NoneValue,
    /// Arithmetic operation would cause overflow.
    Overflow,
    /// Arithmetic operation would cause underflow.
    Underflow,
    /// The counter value would exceed the maximum allowed value.
    CounterMaxValueExceeded,
}

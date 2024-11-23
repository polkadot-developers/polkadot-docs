[derive(Debug, PartialEq, Eq)]
#[ink::scale_derive(Encode, Decode, TypeInfo)]
pub enum Error {
    /// Returned if not enough balance to fulfill a request is available.
    InsufficientBalance,
    /// Returned if not enough allowance to fulfill a request is available.
    InsufficientAllowance,
}

impl Erc20 {
    //...
    #[ink(message)]
    pub fn transfer_from(
        &mut self,
        from: AccountId,
        to: AccountId,
        value: Balance,
    ) -> Result<(),Error> {
        let caller = self.env().caller();
        let allowance = self.allowance_impl(&from, &caller);
        if allowance < value {
            return Err(Error::InsufficientAllowance)
        }
        //...
    }
    //...
}
/// Event emitted when a token transfer occurs.
#[ink(event)]
pub struct Transfer {
    #[ink(topic)]
    from: Option<AccountId>,
    #[ink(topic)]
    to: Option<AccountId>,
    value: Balance,
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
        //...
        self.env().emit_event(Transfer {
            from: Some(from),
            to: Some(to),
            value,
        });
        
        Ok(())
    }
}
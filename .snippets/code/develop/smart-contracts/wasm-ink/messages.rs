#[ink(message)]
pub fn my_getter(&self) -> u32 {
    self.my_number
}

#[ink(message)]
pub fn my_setter(&mut self, new_value: u32) -> u32 {
    self.my_number = new_value;
}
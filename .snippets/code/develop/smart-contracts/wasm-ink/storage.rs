#[ink(storage)]
pub struct Data {
    /// A boolean flag to indicate a certain condition
    flag: bool,
    /// A vector to store multiple entries of unsigned 32-bit integers
    entries: Vec<u32>,
    /// An optional value that can store a specific integer or none
    optional_value: Option<i32>,
    /// A map to associate keys (as AccountId) with values (as unsigned 64-bit integers)
    key_value_store: Mapping<AccountId, u64>,
    /// A counter to keep track of some numerical value
    counter: u64,
}
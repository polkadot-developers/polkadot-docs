#[derive(Clone, Eq, PartialEq, Default, RuntimeDebug, Encode, Decode)]
pub struct AccountInfo<Nonce, AccountData> {
  pub nonce: Nonce,
  pub consumers: RefCount,
  pub providers: RefCount,
  pub sufficients: RefCount,
  pub data: AccountData,
}

#[derive(Clone, Eq, PartialEq, Default, RuntimeDebug, Encode, Decode)]
pub struct AccountInfo<Nonce, AccountData> {
  /// The number of transactions this account has sent
  pub nonce: Nonce,
  /// The number of other modules that currently depend on this account's existence. The account
  /// cannot be reaped until this is zero
  pub consumers: RefCount,
  /// The number of other modules that allow this account to exist. The account may not be reaped
  /// until this and `sufficients` are both zero
  pub providers: RefCount,
  /// The number of modules that allow this account to exist for their own purposes only. The
  /// account may not be reaped until this and `providers` are both zero
  pub sufficients: RefCount,
  /// The additional data that belongs to this account. Used to store the balance(s) in a lot of
  /// chains
  pub data: AccountData,
}

public async claimAssets<T extends Format>(
  assetIds: string[],
  amounts: string[],
  beneficiary: string,
  opts: TransferArgsOpts<T>
): Promise<TxResult<T>>;

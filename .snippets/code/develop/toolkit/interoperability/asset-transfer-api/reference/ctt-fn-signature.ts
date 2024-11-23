public async createTransferTransaction<T extends Format>(
  destChainId: string,
  destAddr: string,
  assetIds: string[],
  amounts: string[],
  opts: TransferArgsOpts<T> = {}
): Promise<TxResult<T>>;

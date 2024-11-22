public async fetchFeeInfo<T extends Format>(
  tx: ConstructedFormat<T>,
  format: T
): Promise<RuntimeDispatchInfo | RuntimeDispatchInfoV1 | null>;

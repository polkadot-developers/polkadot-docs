import { MultiAddress } from '@polkadot-api/descriptors';

const tx: Transaction = typedApi.tx.Balances.transfer_keep_alive({
  dest: MultiAddress.Id('INSERT_DESTINATION_ADDRESS'),
  value: BigInt(INSERT_VALUE),
});

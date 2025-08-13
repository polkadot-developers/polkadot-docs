import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';

async function queryAccountBalance(address: string) {
  const client = createClient(getWsProvider('wss://rpc.polkadot.io'));
  const api = client.getTypedApi(dot);

  const accountInfo = await api.query.System.Account.getValue(address);
  const existentialDeposit = await api.constants.Balances.ExistentialDeposit();

  return {
    balance: accountInfo?.data.free ?? 0n,
    hasED: (accountInfo?.data.free ?? 0n) >= existentialDeposit,
  };
}

import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  await api.rpc('dev_timeTravel', '2030-08-15T00:00:00');
}

main();

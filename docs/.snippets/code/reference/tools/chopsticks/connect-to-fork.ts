import { ApiPromise, WsProvider } from '@polkadot/api';

async function connectToFork() {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;

  // Now you can use 'api' to interact with your fork
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
}

connectToFork();

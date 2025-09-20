import { ApiPromise, WsProvider } from '@polkadot/api';

import { Keyring } from '@polkadot/keyring';
async function main() {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  const keyring = new Keyring({ type: 'ed25519' });
  const bob = keyring.addFromUri('//Bob');
  const storage = {
    System: {
      Account: [[[bob.address], { data: { free: 100000 }, nonce: 1 }]],
    },
  };
  await api.rpc('dev_setStorage', storage);
}

main();

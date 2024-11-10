import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  const wsProvider = new WsProvider('ws://127.0.0.1:55308');
  const api = await ApiPromise.create({ provider: wsProvider });

  // Retrieve the chain & node information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  console.log(
    `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
  );
}

main()
  .catch(console.error)
  .finally(() => process.exit());

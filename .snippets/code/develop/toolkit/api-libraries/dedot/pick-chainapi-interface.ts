import { DedotClient, WsProvider } from 'dedot';
import type { PolkadotApi, KusamaApi } from '@dedot/chaintypes';

const polkadotClient = await DedotClient.new<PolkadotApi>(new WsProvider('wss://rpc.polkadot.io'));
const kusamaClient = await DedotClient.new<KusamaApi>(new WsProvider('wss://kusama-rpc.polkadot.io'));
const genericClient = await DedotClient.new(new WsProvider('ws://localhost:9944'));
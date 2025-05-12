import { DedotClient, WsProvider } from 'dedot';
import type { PolkadotApi } from '@dedot/chaintypes';

// Initialize providers & clients
const provider = new WsProvider('wss://rpc.polkadot.io');
const client = await DedotClient.new<PolkadotApi>(provider);

import { createPublicClient, http } from 'viem';

const transport = http('https://services.polkadothub-rpc.com/testnet');

// Configure the Polkadot Hub chain
const polkadotHubTestnet = {
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  network: 'polkadot-hub-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PAS',
    symbol: 'PAS',
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/testnet'],
    },
  },
} as const;

// Create a public client for reading data
export const publicClient = createPublicClient({
  chain: polkadotHubTestnet,
  transport,
});

const main = async () => {
  try {
    const block = await publicClient.getBlock();
    console.log('Last block: ' + block.number.toString());
  } catch (error: unknown) {
    console.error('Error connecting to Polkadot Hub TestNet: ' + error);
  }
};

main();
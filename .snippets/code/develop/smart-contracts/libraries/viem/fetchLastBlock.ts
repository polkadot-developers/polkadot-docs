import { createPublicClient, http } from 'viem';

const transport = http('https://westend-asset-hub-eth-rpc.polkadot.io');

// Configure the Asset Hub chain
const assetHub = {
  id: 420420421,
  name: 'Westend Asset Hub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    decimals: 18,
    name: 'WND',
    symbol: 'WND',
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
} as const;

// Create a public client for reading data
export const publicClient = createPublicClient({
  chain: assetHub,
  transport,
});

const main = async () => {
  try {
    const block = await publicClient.getBlock();
    console.log('Last block: ' + block.number.toString());
  } catch (error: unknown) {
    console.error('Error connecting to Asset Hub: ' + error);
  }
};

main();
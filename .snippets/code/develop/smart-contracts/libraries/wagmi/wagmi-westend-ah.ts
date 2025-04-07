import { http, createConfig } from 'wagmi';

// Configure the Asset Hub chain
const assetHub = {
  id: 420420421,
  name: 'westend-asset-hub',
  network: 'westend',
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

// Create wagmi config
export const config = createConfig({
  chains: [assetHub],
  transports: {
    [assetHub.id]: http(),
  },
});
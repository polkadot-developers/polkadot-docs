import { http, createConfig } from 'wagmi';

// Configure the Polkadot Hub chain
const assetHub = {
  id: 420420417,
  name: 'polkadot-hub-testnet',
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

// Create wagmi config
export const config = createConfig({
  chains: [assetHub],
  transports: {
    [assetHub.id]: http(),
  },
});
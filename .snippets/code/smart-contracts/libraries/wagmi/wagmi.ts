import { http, createConfig } from 'wagmi'

// Configure the Polkadot Hub chain
const assetHub = {
  id: INSERT_CHAIN_ID,
  name: 'INSERT_CHAIN_NAME',
  network: 'INSERT_NETWORK_NAME',
  nativeCurrency: {
    decimals: INSERT_CHAIN_DECIMALS,
    name: 'INSERT_CURRENCY_NAME',
    symbol: 'INSERT_CURRENCY_SYMBOL',
  },
  rpcUrls: {
    default: {
      http: ['INSERT_RPC_URL'],
    },
  },
} as const;

// Create Wagmi config
export const config = createConfig({
  chains: [assetHub],
  transports: {
    [assetHub.id]: http(),
  },
})
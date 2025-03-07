import { JsonRpcProvider } from 'ethers';

export const ASSET_HUB_CONFIG = {
  name: 'Westend Asset Hub',
  rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io', // Westend Asset Hub testnet RPC
  chainId: 420420421, // Westend Asset Hub testnet chainId
  blockExplorer: 'https://westend-asset-hub.subscan.io/',
};

export const getProvider = () => {
  return new JsonRpcProvider(ASSET_HUB_CONFIG.rpc, {
    chainId: ASSET_HUB_CONFIG.chainId,
    name: ASSET_HUB_CONFIG.name,
  });
};

// Helper to get a signer from a provider
export const getSigner = async (provider) => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    return ethersProvider.getSigner();
  }
  throw new Error('No Ethereum browser provider detected');
};

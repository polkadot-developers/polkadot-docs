const { JsonRpcProvider } = require('ethers');

const createProvider = (rpcUrl, chainId, chainName) => {
  const provider = new JsonRpcProvider(rpcUrl, {
    chainId: chainId,
    name: chainName,
  });

  return provider;
};

const PROVIDER_RPC = {
  rpc: 'INSERT_RPC_URL',
  chainId: 'INSERT_CHAIN_ID',
  name: 'INSERT_CHAIN_NAME',
};

createProvider(PROVIDER_RPC.rpc, PROVIDER_RPC.chainId, PROVIDER_RPC.name);

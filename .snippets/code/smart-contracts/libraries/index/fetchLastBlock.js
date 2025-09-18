const { JsonRpcProvider } = require('ethers');

const createProvider = (rpcUrl, chainId, chainName) => {
  const provider = new JsonRpcProvider(rpcUrl, {
    chainId: chainId,
    name: chainName,
  });

  return provider;
};

const PROVIDER_RPC = {
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
};

const main = async () => {
  try {
    const provider = createProvider(
      PROVIDER_RPC.rpc,
      PROVIDER_RPC.chainId,
      PROVIDER_RPC.name,
    );
    const latestBlock = await provider.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);
  } catch (error) {
    console.error('Error connecting to Polkadot Hub TestNet: ' + error.message);
  }
};

main();

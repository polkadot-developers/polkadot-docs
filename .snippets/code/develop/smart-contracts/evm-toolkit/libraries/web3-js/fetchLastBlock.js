const { Web3 } = require('web3');

const createProvider = (rpcUrl) => {
  const web3 = new Web3(rpcUrl);
  return web3;
};

const PROVIDER_RPC = {
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
};

const main = async () => {
  try {
    const web3 = createProvider(PROVIDER_RPC.rpc);
    const latestBlock = await web3.eth.getBlockNumber();
    console.log('Last block: ' + latestBlock);
  } catch (error) {
    console.error('Error connecting to Polkadot Hub TestNet: ' + error.message);
  }
};

main();

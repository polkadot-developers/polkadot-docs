const { Web3 } = require('web3');

const createProvider = (rpcUrl) => {
  const web3 = new Web3(rpcUrl);
  return web3;
};

const PROVIDER_RPC = {
  rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
  chainId: 420420421,
  name: 'westend-asset-hub',
};

const main = async () => {
  try {
    const web3 = createProvider(PROVIDER_RPC.rpc);
    const latestBlock = await web3.eth.getBlockNumber();
    console.log('Last block: ' + latestBlock);
  } catch (error) {
    console.error('Error connecting to Westend Hub: ' + error.message);
  }
};

main();

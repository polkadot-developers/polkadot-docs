// hardhat.config.js
require('@nomicfoundation/hardhat-toolbox');

require('@parity/hardhat-polkadot');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  networks: {
    hardhat: {
      polkadot: {
        target: 'evm'
      },
      nodeConfig: {
        useAnvil: true,
        nodeBinaryPath: 'INSERT_PATH_TO_ANVIL_NODE',
      },
      adapterConfig: {
        adapterBinaryPath: 'INSERT_PATH_TO_ETH_RPC_ADAPTER',
        dev: true,
      },
    },
    localNode: {
      polkadot: {
        target: 'evm'
      },
      url: `http://127.0.0.1:8545`,
    },
    polkadotHubTestnet: {
      polkadot: true,
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      accounts: [vars.get('PRIVATE_KEY')],
    },
  },
};

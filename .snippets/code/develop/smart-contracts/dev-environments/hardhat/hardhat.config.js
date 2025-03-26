// hardhat.config.js
require('@nomicfoundation/hardhat-toolbox');

require('@nomicfoundation/hardhat-network-helpers');
require('@nomicfoundation/hardhat-chai-matchers');
require('@nomicfoundation/hardhat-ethers');
require('hardhat-gas-reporter');
require('@nomicfoundation/hardhat-ignition');

require('hardhat-resolc');
require('hardhat-revive-node');

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  // Remix Compiler
  resolc: {
    version: '1.5.2',
    compilerSource: 'remix',
    settings: {
      optimizer: {
        enabled: false,
        runs: 600,
      },
      evmVersion: 'istanbul',
    },
  },
  // Binary Compiler
  resolc: {
    compilerSource: 'binary',
    settings: {
      optimizer: {
        enabled: true,
        runs: 400,
      },
      evmVersion: 'istanbul',
      compilerPath: 'INSERT_PATH_TO_RESOLC_COMPILER',
      standardJson: true,
    },
  },
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: 'INSERT_PATH_TO_SUBSTRATE_NODE',
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: 'INSERT_PATH_TO_ETH_RPC_ADAPTER',
        dev: true,
      },
    },
    localNode: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
    westendAssetHub: {
      polkavm: true,
      url: 'https://westend-asset-hub-eth-rpc.polkadot.io',
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

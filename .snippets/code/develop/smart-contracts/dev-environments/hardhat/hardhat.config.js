// Hardhat configuration according to polkavm
require('@nomicfoundation/hardhat-toolbox');

require('hardhat-resolc');
require('hardhat-revive-node');

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
      compilerPath: '/Users/nhussein11/Downloads/resolc-universal-apple-darwin',
      standardJson: true,
    },
  },
  // Westend AH
  networks: {
    hardhat: { polkavm: true },
    polkavm: {
      url: 'https://westend-asset-hub-eth-rpc.polkadot.io',
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  // Local node
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: '.../substrate-node',
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: '.../eth-rpc',
        dev: true,
      },
    },
    polkavm: {
      polkavm: true,
      url: `http://127.0.0.1:8545`,
    },
  },
};

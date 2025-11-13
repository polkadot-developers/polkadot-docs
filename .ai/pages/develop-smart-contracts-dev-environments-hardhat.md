---
title: Use Hardhat with Polkadot Hub
description: Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat, a powerful development environment for blockchain developers.
categories: Smart Contracts, Tooling
url: https://docs.polkadot.com/develop/smart-contracts/dev-environments/hardhat/
---

# Hardhat

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.
<div class="grid cards" markdown>
-   :octicons-code-16:{ .lg .middle } __Test and Deploy with Hardhat__

    ---

    Master Solidity smart contract development with Hardhat. Learn testing, deployment, and network interaction in one comprehensive tutorial.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat){target=\_blank}

</div>

!!! note "Contracts Code Blob Size Disclaimer"
    The maximum contract code blob size on Polkadot Hub networks is _100 kilobytes_, significantly larger than Ethereum’s EVM limit of 24 kilobytes.

    For detailed comparisons and migration guidelines, see the [EVM vs. PolkaVM](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/#current-memory-limits){target=\_blank} documentation page.

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Polkadot Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed.
    - Note: Use Node.js 22.5+ and npm version 10.9.0+ to avoid issues with the Polkadot plugin.
- Basic understanding of Solidity programming.
- Some PAS test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot#test-tokens){target=\_blank} section.

## Set Up Hardhat

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir hardhat-example
    cd hardhat-example
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. To interact with Polkadot, Hardhat requires the following plugin to compile contracts and to spawn a local node for testing:

    ```bash
    npm install --save-dev @parity/hardhat-polkadot@latest
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat-polkadot init
    ```

    Follow the project creation wizard. Your project will be created with three main folders:

    - **`contracts`**: Where your Solidity smart contracts live.
    - **`test`**: Contains your test files that validate contract functionality.
    - **`ignition`**: Deployment modules for safely deploying your contracts to various networks.

5. Add the following folder to the `.gitignore` file if it is not already there:

    ```bash
    echo '/ignition/deployments/' >> .gitignore
    ```

6. Finish the setup by installing all the dependencies:

    ```bash
    npm install
    ```

    !!! note
        This last step is needed to set up the `hardhat-polkadot` plugin. It will install the `@parity/hardhat-polkadot` package and all its dependencies. In the future, the plugin will handle this automatically.

## Compile Your Contract

The plugin will compile your Solidity contracts for Solidity versions `0.8.0` and higher. To compile your project, follow these instructions:

1. Make sure your Hardhat configuration file looks like the following. Note that it may differ slightly based on the language choice made during the `init` step of setting up Hardhat:

    ```javascript title="hardhat.config.js" hl_lines="5-7 19-21 25-27"
    module.exports = {
      solidity: '0.8.28',
      networks: {
        hardhat: {
          polkadot: {
            target: 'evm',
          },
          nodeConfig: {
            nodeBinaryPath: './bin/dev-node',
            rpcPort: 8000,
            dev: true,
          },
          adapterConfig: {
            adapterBinaryPath: './bin/eth-rpc',
            dev: true,
          },
        },
        localNode: {
          polkadot: {
            target: 'evm',
          },
          url: `http://127.0.0.1:8545`,
        },
        polkadotHubTestnet: {
          polkadot: {
            target: 'evm',
          },
          url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
          accounts: [vars.get('PRIVATE_KEY')],
        },
      },
    };

    ```

    To obtain the `dev-node` and `eth-rpc` binaries required in `nodeConfig` and `adapterConfig` respectively, check this [release](https://github.com/paritytech/hardhat-polkadot/releases/tag/nodes-19071579107){target=\_blank} and download the binaries as per your development platform and update the paths in your Hardhat config. 

    !!! note
        You might have to give executable permissions to the binaries:
        ```bash
        chmod +x /path/to/your/binary
        ```
        In macOS environments, binaries are sometimes quarantined. To remove this, run:
        ```bash
        xattr -d com.apple.quarantine /path/to/your/binary
        ```

2. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

3. After successful compilation, you'll see the artifacts generated in the `artifacts` directory:

    ```bash
    ls artifacts/contracts/*.sol/
    ```

    You should see JSON files containing the contract ABIs and bytecodes for the contracts you compiled.

## Set Up a Testing Environment

Hardhat lets you spin up a local testing environment to test and validate your smart contract functionality before deploying to live networks. The `hardhat-polkadot` plugin allows you to spin up a local node with an ETH-RPC adapter for running local tests.

Once you have set up the binaries as per the [Compile Your Contract](#compile-your-contract) section, start your local testing node with:

```bash
npx hardhat node
```

This command launches a local node with the ETH-RPC adapter, providing a complete testing environment ready for contract deployment and interaction. By default, the Substrate node runs on `localhost:8000`, and the ETH-RPC adapter on `localhost:8545`.

The output will be something like this:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat node</span>
  <br />
  <span data-ty>Starting server at 127.0.0.1:8000</span>
  <span data-ty>../bin/substrate-node --rpc-port=8000 --dev</span>
  <span data-ty>Starting the Eth RPC Adapter at 127.0.0.1:8545</span>
  <span data-ty>../bin/eth-rpc --node-rpc-url=ws://localhost:8000 --dev</span>
  <span data-ty>2025-05-29 13:00:32 Running in --dev mode, RPC CORS has been disabled.</span>
  <span data-ty>2025-05-29 13:00:32 Running in --dev mode, RPC CORS has been disabled.</span>
  <span data-ty>2025-05-29 13:00:32 🌐 Connecting to node at: ws://localhost:8000 ...</span>
  <span data-ty>2025-05-29 13:00:32 Substrate Node</span>
  <span data-ty>2025-05-29 13:00:32 ✌️ version 3.0.0-dev-f73c228b7a1</span>
  <span data-ty>2025-05-29 13:00:32 ❤️ by Parity Technologies &lt;admin@parity.io&gt;, 2017-2025</span>
  <span data-ty>2025-05-29 13:00:32 📋 Chain specification: Development</span>
  <span data-ty>2025-05-29 13:00:32 🏷 Node name: electric-activity-4221</span>
  <span data-ty>2025-05-29 13:00:32 👤 Role: AUTHORITY</span>
  <span data-ty>2025-05-29 13:00:32 💾 Database: RocksDb at /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/substrateOaoecu/chains/dev/db/full</span>
  <span data-ty>2025-05-29 13:00:36 [0] 💸 generated 1 npos voters, 1 from validators and 0 nominators</span>
  <span data-ty>...</span>
</div>

## Test Your Contract

When testing your contract, be aware that [`@nomicfoundation/hardhat-toolbox/network-helpers`](https://hardhat.org/hardhat-network-helpers/docs/overview){target=\_blank} is not fully compatible with Polkadot Hub's available RPCs. Specifically, Hardhat-only helpers like `time` and `loadFixture` may not work due to missing RPC calls in the node. For more details, refer to the [Compatibility](https://github.com/paritytech/hardhat-polkadot/tree/main/packages/hardhat-polkadot-node#compatibility){target=\_blank} section in the `hardhat-revive` docs. You should avoid using helpers like `time` and `loadFixture` when writing tests.

To run your test:

1. Update the `hardhat.config.js` file as per the [Compile Your Contract](#compile-your-contract) section.

2. Execute the following command to run your tests:

    ```bash
    npx hardhat test
    ```

## Deploy to a Local Node

Before deploying to a live network, you can deploy your contract to a local node using [Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} modules:

1. Make sure that the local network is added as a target in your Hardhat configuration file for local deployment:

    ```javascript title="hardhat.config.js"
        localNode: {
          polkadot: {
            target: 'evm',
          },
          url: `http://127.0.0.1:8545`,
        },
    ```

2. Start a local node:

    ```bash
    npx hardhat node
    ```

    This command will spawn a local Substrate node along with the ETH-RPC adapter.

3. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network localNode
    ```

## Deploying to a Live Network

After testing your contract locally, you can deploy it to a live network. This guide will use the Polkadot Hub TestNet as the target network. Here's how to configure and deploy:

1. Fund your deployment account with enough tokens to cover gas fees. In this case, the needed tokens are PAS (on Polkadot Hub TestNet). You can use the [Polkadot faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank} to obtain testing tokens.

2. Export your private key and save it in your Hardhat environment:

    ```bash
    npx hardhat vars set PRIVATE_KEY "INSERT_PRIVATE_KEY"
    ```

    Replace `INSERT_PRIVATE_KEY` with your actual private key. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Never reveal your private key, otherwise anyone with access to it can control your wallet and steal your funds. Store it securely and never share it publicly or commit it to version control systems.

3. Check that your private key has been set up successfully by running:

    ```bash
    npx hardhat vars get PRIVATE_KEY
    ```

4. Make sure the Polkadot Hub TestNet is added as a target in your Hardhat configuration file:

    ```javascript title="hardhat.config.js"
        polkadotHubTestnet: {
          polkadot: {
            target: 'evm',
          },
          url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
          accounts: [vars.get('PRIVATE_KEY')],
        },
    ```

6. Deploy your contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network polkadotHubTestnet
    ```

## Interacting with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract.

For example, for the default `MyToken.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
const hre = require('hardhat');

async function main() {
  // Get the contract factory
  const MyToken = await hre.ethers.getContractFactory('MyToken');

  // Replace with your deployed contract address
  const contractAddress = 'INSERT_CONTRACT_ADDRESS';

  // Attach to existing contract
  const token = await MyToken.attach(contractAddress);

  // Get signers
  const [deployer] = await hre.ethers.getSigners();

  // Read contract state
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const balance = await token.balanceOf(deployer.address);

  console.log(`Token: ${name} (${symbol})`);
  console.log(
    `Total Supply: ${hre.ethers.formatUnits(totalSupply, 18)} tokens`,
  );
  console.log(
    `Deployer Balance: ${hre.ethers.formatUnits(balance, 18)} tokens`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

```

Run your interaction script:

```bash
npx hardhat run scripts/interact.js --network polkadotHubTestnet
```

## Upgrading the Plugin

If you already have a Hardhat Polkadot project and want to upgrade to a newer version of the plugin, to avoid errors (for example, `Cannot find module 'run-container'`), you can clean your dependencies by running the following commands:

```bash
rm -rf node_modules package-lock.json
```

After that, you can upgrade the plugin to the latest version by running the following commands:

```bash
npm install --save-dev @parity/hardhat-polkadot@latest
npm install
```

Consider using [Node.js](https://nodejs.org/){target=\_blank} 22.18+ and [npm](https://www.npmjs.com/){target=\_blank} version 10.9.0+ to avoid issues with the plugin.

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Polkadot Hub. Its plugin architecture allows seamless integration with PolkaVM through the `hardhat-resolc` and `hardhat-revive-node` plugins.

Explore more about smart contracts through these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Smart Contracts on Polkadot__

    ---

    Dive into advanced smart contract concepts.

    [:octicons-arrow-right-24: Get Started](/develop/smart-contracts/)

-   <span class="badge external">External</span> __Hardhat Documentation__

    ---

    Learn more about Hardhat's advanced features and best practices.

    [:octicons-arrow-right-24: Get Started](https://hardhat.org/docs){target=\_blank}

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Test your skills by deploying contracts with prebuilt templates.

    [:octicons-arrow-right-24: Get Started](https://www.openzeppelin.com/solidity-contracts){target=\_blank}

</div>

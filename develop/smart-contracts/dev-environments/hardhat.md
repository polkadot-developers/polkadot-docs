---
title: Use Hardhat with Asset Hub
description: Learn how to create, compile, test, and deploy smart contracts on Asset Hub using Hardhat, a powerful development environment for blockchain developers.
---

# Hardhat

<div class="grid cards" markdown>
-   :octicons-code-16:{ .lg .middle } __Test and Deploy with Hardhat__

    ---

    Master Solidity smart contract development with Hardhat. Learn testing, deployment, and network interaction in one comprehensive tutorial.

    <br>
    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat){target=\_blank}

</div>

## Overview

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Asset Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some WND test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-asset-hub/#test-tokens){target=\_blank} section
- [MetaMask](https://metamask.io/){target=\_blank} installed and connected to [Westend Asset Hub](https://chainlist.org/chain/420420421){target=\_blank}. For more detailed instructions on connecting your wallet, see the [Connect Your Wallet](/develop/smart-contracts/connect-to-asset-hub/#connect-your-wallet){target=\_blank} section

## Setting Up Hardhat

1. Create a new directory for your project and navigate into it:

    ```bash
    mkdir hardhat-example
    cd hardhat-example
    ```

2. Initialize a new npm project:

    ```bash
    npm init -y
    ```

3. Install Hardhat and the required plugins:

    ```bash
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
    ```

    To interact with Asset Hub, Hardhat requires the [`hardhat-resolc`](https://www.npmjs.com/package/hardhat-resolc){target=\_blank} plugin to compile contracts to PolkaVM bytecode and the [`hardhat-revive-node`](https://www.npmjs.com/package/hardhat-revive-node){target=\_blank} plugin to spawn a local node compatible with PolkaVM.

    ```bash
    npm install --save-dev hardhat-resolc hardhat-revive-node
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat init
    ```

    Select "Create a JavaScript project" when prompted and follow the instructions. After that, your project will be created with three main folders:

    - **`contracts`** - where your Solidity smart contracts live
    - **`test`** - contains your test files that validate contract functionality
    - **`ignition`** - deployment modules for safely deploying your contracts to various networks

5. Update your Hardhat configuration file (`hardhat.config.js`) to include the plugins:

    ```javascript title="hardhat.config.js" hl_lines="9-10"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:16'
      // Additional configuration will be added later
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:66:66'
    ```

## Compiling Your Contract

The `hardhat-resolc` plugin will compile your Solidity contracts for Solidity versions `0.8.0` and higher to be PolkaVM compatible. When compiling your contract using the `hardhat-resolc` plugin, there are two ways to configure your compilation process:

- **Remix compiler** - uses the Remix online compiler backend for simplicity and ease of use
- **Binary compiler** - uses the resolc binary directly for more control and configuration options

To compile your project, follow these instructions:

1. Modify your Hardhat configuration file to specify which compilation process you will be using:

    === "Remix Configuration"

        ```javascript title="hardhat.config.js" hl_lines="15-25"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:17'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:19:29'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:43:45'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:65:66'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="15-26"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:17'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:31:42'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:43:45'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:64:66'
        ```

    For the binary configuration, replace `INSERT_PATH_TO_RESOLC_COMPILER` with the proper path to the binary. For more information about its installation, check the [installation](https://github.com/paritytech/revive?tab=readme-ov-file#installation){target=\_blank} section of the `pallet-revive`.

2. Compile the contract with Hardhat:

    ```bash
    npx hardhat compile
    ```

3. After successful compilation, you'll see the artifacts generated in the `artifacts-pvm` directory:

    ```bash
    ls artifacts-pvm/contracts/*.sol/
    ```

    You should see JSON files containing the contract ABI and bytecode of the contracts you compiled.

## Testing Your Contract

When testing your contract, be aware that [`@nomicfoundation/hardhat-toolbox/network-helpers`](https://hardhat.org/hardhat-network-helpers/docs/overview){target=\_blank} is not fully compatible with Asset Hub's available RPCs. Specifically, Hardhat-only helpers like `time` and `loadFixture` may not work due to missing RPC calls in the node. For more details, refer to the [Compatibility](https://github.com/paritytech/hardhat-revive/tree/main/packages/hardhat-revive-node#compatibility){target=\_blank} section in the `hardhat-revive` docs.

You should avoid using helpers like `time` and `loadFixture` when writing tests. For example, for the `Lock.sol` contract, you can replace the default test file under `tests/Lock.js` with the following logic:

```javascript title="Lock.js"
--8<-- "code/develop/smart-contracts/dev-environments/hardhat/lock-test.js"
```

To run your test, execute the following command:

```bash
npx hardhat test
```

## Deploying with a Local Node

Before deploying to a live network, you can deploy your contract to a local node using the [`hardhat-revive-node`](https://www.npmjs.com/package/hardhat-revive-node){target=\_blank} plugin and Ignition modules:

!!! warning "Contract Size Limitation in Testing Environment"

    When deploying large contracts, you might encounter: `Error: the initcode size of this transaction is too large`.

    This limitation is imposed by Hardhat's client-side checks, not by PolkaVM itself. As a workaround, you can use a direct `JsonRpcProvider`:

    ```javascript
    --8<-- "code/develop/smart-contracts/dev-environments/hardhat/disclaimer-json-rpc-provider-alternative.js"
    ```

    For more details, see [this GitHub issue](https://github.com/paritytech/contract-issues/issues/47#issuecomment-2790181622){target=\_blank}.



1. First, ensure you have compiled a Substrate node and the ETH RPC adapter from the Polkadot SDK. Checkout the [compatible commit](https://github.com/paritytech/polkadot-sdk/commit/c29e72a8628835e34deb6aa7db9a78a2e4eabcee){target=\_blank} from the SDK and build the node and the ETH-RPC from source:

    ```bash
    git clone https://github.com/paritytech/polkadot-sdk.git
    cd polkadot-sdk
    git checkout {{ dependencies.repositories.polkadot_sdk_compatible_hardhat_node }}
    ```

    Now, build the node and the ETH-RPC adapter. Note that this process might take a long time to complete:

    ```bash
    # Build the substrate node
    cargo build --release
    # Build the eth-rpc adapter
    cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release
    ```

2. Update the Hardhat configuration file to add the local node as a target for local deployment:

    === "Remix Configuration"

        ```javascript title="hardhat.config.js" hl_lines="27-44"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:29'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:43:59'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:65:66'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="27-44"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:17'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:31:42'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:43:59'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:65:66'
        ```

    Ensure to replace `INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` with the proper paths to the compiled binaries. Since you compiled these from source using Rust's Cargo build system, you can find them at:

    - Substrate node path - `polkadot-sdk/target/release/substrate-node`
    - ETH-RPC adapter path - `polkadot-sdk/target/release/eth-rpc`

    For example, if you cloned the polkadot-sdk repository to your home directory, the paths might look like:

    ```javascript
    nodeBinaryPath: '/home/username/polkadot-sdk/target/release/substrate-node',
    adapterBinaryPath: '/home/username/polkadot-sdk/target/release/eth-rpc',
    ```

3. Modify the Ignition modules, considering that the value of the pallet revive `block.timestamp` is returned in seconds. Check this [PR](https://github.com/paritytech/polkadot-sdk/pull/7792/files){target=\_blank} for more information. For example, for the default `ignition/modules/Lock.js` file, the needed modification should be:

    ```diff
    - const JAN_1ST_2030 = 1893456000;
    + const JAN_1ST_2030 = 18934560000000;
    ```

    ???--- code "Modified `ignition/modules/Lock.js` file"

        ```js title="Lock.js"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/lock-ignition.js'
        ```

4. Start a local node:

    ```bash
    npx hardhat node-polkavm
    ```

    This command will start a local PolkaVM node powered by the `hardhat-revive-node` plugin.

5. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/INSERT_IGNITION_MODULE_NAME.js --network localNode
    ```

    Replace `INSERT_IGNITION_MODULE_NAME` with the proper name for your contract. You'll see deployment information, including the contract address.

## Deploying to a Live Network

After testing your contract locally, you can deploy it to a live network. This guide will use Westend Asset Hub as the target network. Here's how to configure and deploy:

1. Fund your deployment account with enough tokens to cover gas fees. In this case, the needed tokens are WND (on Westend). You can use the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank} to obtain testing tokens.

2. Export your private key and save it in a `.env` file:

    ```text
    PRIVATE_KEY="INSERT_PRIVATE_KEY"
    ```
    
    Replace `INSERT_PRIVATE_KEY` with your actual private key. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Never reveal your private key. Be sure you add the `.env` file to your .gitignore file. 

3. Install the [`dotenv`](https://www.npmjs.com/package/dotenv){target=\_blank} package to load the private key into your Hardhat configuration:

    ```bash
    npm install dotenv
    ```

4. Update your config to load it:

    ```javascript title="hardhat.config.js" hl_lines="12"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:16'
      // The rest remains the same...
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:66:66'
    ```

5. Update your Hardhat configuration file with network settings for the Asset Hub network you want to target:

    === "Remix Configuration"

        ```javascript title="hardhat.config.js" hl_lines="44-48"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:29'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:43:66'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="44-48"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:0:12'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:15:17'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:31:42'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:43:66'
        ```

4. Deploy your contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/INSERT_IGNITION_MODULE_NAME.js --network westendAssetHub
    ```

    Replace `INSERT_IGNITION_MODULE_NAME` with the proper name for your contract. You'll see deployment information, including the contract address.

## Interacting with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract. 

For example, for the default `Lock.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/interact.js'
```

Run your interaction script:

```bash
npx hardhat run scripts/interact.js --network westendAssetHub
```

## Where to Go Next

Hardhat provides a powerful environment for developing, testing, and deploying smart contracts on Asset Hub. Its plugin architecture allows seamless integration with PolkaVM through the `hardhat-resolc` and `hardhat-revive-node` plugins.

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

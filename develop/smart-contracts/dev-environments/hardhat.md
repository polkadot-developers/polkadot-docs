---
title: Use Hardhat with Polkadot Hub
description: Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat, a powerful development environment for blockchain developers.
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

Hardhat is a robust development environment for Ethereum-compatible chains that makes smart contract development more efficient. This guide walks you through the essentials of using Hardhat to create, compile, test, and deploy smart contracts on Polkadot Hub.

## Prerequisites

Before getting started, ensure you have:

- [Node.js](https://nodejs.org/){target=\_blank} (v16.0.0 or later) and npm installed
- Basic understanding of Solidity programming
- Some WND test tokens to cover transaction fees (easily obtainable from the [Polkadot faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot/#test-tokens){target=\_blank} section

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

3. To interact with Polkadot, Hardhat requires the following plugin to compile contracts to PolkaVM bytecode and to spawn a local node compatible with PolkaVM:

    ```bash
    npm install --save-dev @parity/hardhat-polkadot
    ```

4. Create a Hardhat project:

    ```bash
    npx hardhat-polkadot init
    ```

    Select **Create a JavaScript project** when prompted and follow the instructions. After that, your project will be created with three main folders:

    - **`contracts`** - where your Solidity smart contracts live
    - **`test`** - contains your test files that validate contract functionality
    - **`ignition`** - deployment modules for safely deploying your contracts to various networks

5. Finish the setup by installing all the dependencies:

    ```bash
    npm install
    ```

    !!! note
        This last step is needed to set up the `hardhat-polkadot` plugin. It will install the `@parity/hardhat-polkadot` package and all its dependencies. In the future, the plugin will handle this automatically.

## Compiling Your Contract

The plugin will compile your Solidity contracts for Solidity versions `0.8.0` and higher to be PolkaVM compatible. When compiling your contract, there are two ways to configure your compilation process:

- **npm compiler** - uses library [@parity/resolc](https://www.npmjs.com/package/@parity/resolc){target=\_blank} for simplicity and ease of use
- **Binary compiler** - uses your local `resolc` binary directly for more control and configuration options

To compile your project, follow these instructions:

1. Modify your Hardhat configuration file to specify which compilation process you will be using and activate the `polkavm` flag in the Hardhat network:

    === "npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="9-20"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:21'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:39'
            --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:49:49'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="9-22"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:8'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:36'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:39'
            --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:49:49'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    For the binary configuration, replace `INSERT_PATH_TO_RESOLC_COMPILER` with the proper path to the binary. To obtain the binary, check the [releases](https://github.com/paritytech/revive/releases){target=\_blank} section of the `resolc` compiler, and download the latest version.

    The optimizer settings use the default values in the examples above. You can change them according to your project needs.

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

When testing your contract, be aware that [`@nomicfoundation/hardhat-toolbox/network-helpers`](https://hardhat.org/hardhat-network-helpers/docs/overview){target=\_blank} is not fully compatible with Polkadot Hub's available RPCs. Specifically, Hardhat-only helpers like `time` and `loadFixture` may not work due to missing RPC calls in the node. For more details, refer to the [Compatibility](https://github.com/paritytech/hardhat-revive/tree/main/packages/hardhat-revive-node#compatibility){target=\_blank} section in the `hardhat-revive` docs. You should avoid using helpers like `time` and `loadFixture` when writing tests. 

To run your test:

1. Update the `hardhat.config.js` file to specify the path of the local node and the ETH-RPC adapter:

    === "npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="24-32"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:21'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:49'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="26-34"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:8'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:49'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    Ensure to replace `INSERT_PATH_TO_SUBSTRATE_NODE` and `INSERT_PATH_TO_ETH_RPC_ADAPTER` with the proper paths to the compiled binaries. To obtain these binaries, you can run the following commands:

    ```bash
    git clone https://github.com/paritytech/polkadot-sdk.git && cd polkadot-sdk
    ```

    And then build the binaries:

    ```bash
    cargo build --bin substrate-node --release
    cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release
    ```
    
    Since you compiled these from source using Rust's Cargo build system, you can find them at:

    - Substrate node path - `polkadot-sdk/target/release/substrate-node`
    - ETH-RPC adapter path - `polkadot-sdk/target/release/eth-rpc`

    For example, if you cloned the polkadot-sdk repository to your home directory, the paths might look like:

    ```javascript
    nodeBinaryPath: '/home/username/polkadot-sdk/target/release/substrate-node',
    adapterBinaryPath: '/home/username/polkadot-sdk/target/release/eth-rpc',
    ```

2. Execute the following command:

    ```bash
    npx hardhat test
    ```

## Deploying with a Local Node

Before deploying to a live network, you can deploy your contract to a local node using [Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} modules:

!!! warning "Contract Size Limitation in Testing Environment"

    When deploying large contracts, you might encounter: `Error: the initcode size of this transaction is too large`.

    This limitation is imposed by Hardhat's client-side checks, not by PolkaVM itself. As a workaround, you can use a direct `JsonRpcProvider`:

    ```javascript
    --8<-- "code/develop/smart-contracts/dev-environments/hardhat/disclaimer-json-rpc-provider-alternative.js"
    ```

    For more details, see [this GitHub issue](https://github.com/paritytech/contract-issues/issues/47#issuecomment-2790181622){target=\_blank}.



1. Update the Hardhat configuration file to add the local network as a target for local deployment:

    === "npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="34-37"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:21'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:53'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="36-39"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:8'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:53'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

2. Start a local node:

    ```bash
    npx hardhat node
    ```

    This command will spawn a local substrate node along with the ETH-RPC adapter.

3. In a new terminal window, deploy the contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network localNode
    ```

## Deploying to a Live Network

After testing your contract locally, you can deploy it to a live network. This guide will use Westend Hub as the target network. Here's how to configure and deploy:

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
    npm install --save-dev dotenv
    ```

4. Update your config to load it:

    ```javascript title="hardhat.config.js" hl_lines="5"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

    require('dotenv').config();

    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
      // The rest remains the same...
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:60:60'
    ```

5. Update your Hardhat configuration file with network settings for the Polkadot network you want to target:

    === "npm Configuration"

        ```javascript title="hardhat.config.js" hl_lines="41-45"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

        require('dotenv').config();

        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:21'

          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:37:58'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

    === "Binary Configuration"

        ```javascript title="hardhat.config.js" hl_lines="45-49"
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

        require('dotenv').config();

        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:4:8'
        
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:22:58'
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:59:60'
        ```

6. Deploy your contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network westendHub
    ```

## Interacting with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract. 

For example, for the default `MyToken.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/interact.js'
```

Run your interaction script:

```bash
npx hardhat run scripts/interact.js --network westendHub
```

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

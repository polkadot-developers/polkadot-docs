---
title: Deploy Smart Contracts with Hardhat
description: Learn how to deploy smart contracts to Polkadot Hub using Hardhat, including local deployment and testnet deployment with Ignition modules.
categories: Smart Contracts, Tooling
---

# Deploy a Contract using Hardhat

## Deploy to a Local Node

Before deploying to a live network, you can deploy your contract to a local node using [Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank} modules:

1. Update the Hardhat configuration file to add the local network as a target for local deployment.

    ```javascript title="hardhat.config.js" hl_lines="13-16"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
        ...
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:12:13'
            ...
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:24:28'
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:33:35'
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

2. Export your private key and save it in your Hardhat environment.

    ```bash
    npx hardhat vars set PRIVATE_KEY "INSERT_PRIVATE_KEY"
    ```

    Replace `INSERT_PRIVATE_KEY` with your actual private key. For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

    !!! warning
        Never reveal your private key, otherwise anyone with access to it can control your wallet and steal your funds. Store it securely and never share it publicly or commit it to version control systems.

3. Check that your private key has been set up successfully by running.

    ```bash
    npx hardhat vars get PRIVATE_KEY
    ```

4. Update your Hardhat configuration file with network settings for the Polkadot network you want to target.

    ```javascript title="hardhat.config.js" hl_lines="18-22"
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:1:4'

    const { vars } = require('hardhat/config');

    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:6:7'
        ...
        --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:12:13'
            ...
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:24:24'
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:25:25'
            ...
          --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:28:33'
    --8<-- 'code/develop/smart-contracts/dev-environments/hardhat/hardhat.config.js:33:35'
    ```

5. Deploy your contract using Ignition:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/MyToken.js --network polkadotHubTestnet
    ```

## Interaction with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract.

For example, for the default `MyToken.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
--8<-- 'code/develop/smart-contracts/dev-environments/hardhat/interact.js'
```

Run your interaction script:

```bash
npx hardhat run scripts/interact.js --network polkadotHubTestnet
```
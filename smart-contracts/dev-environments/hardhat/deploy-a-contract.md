---
title: Deploy Smart Contracts with Hardhat
description: Learn how to deploy smart contracts to Polkadot Hub using Hardhat, including local deployment and testnet deployment with Ignition modules.
categories: Smart Contracts, Tooling
---

# Deploy a Contract using Hardhat

## Deploying to a Live Network

This guide will use the Polkadot Hub TestNet as the target network. Here's how to configure and deploy:

1. Run a [Local Development Node](/smart-contracts/dev-environments/local-dev-node.md) to run a local dev node

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

    ```javascript title="hardhat.config.js"
    require("@nomicfoundation/hardhat-toolbox");
    const { vars } = require("hardhat/config");

    const PRIVATE_KEY = vars.get("PRIVATE_KEY");

    module.exports = {
      solidity: "0.8.24",
      networks: {
        polkadotHubTestnet: {
          url: "https://rpc.polkadot-hub.io/testnet",
          chainId: 1111,
          accounts: [PRIVATE_KEY]
        }
      }
    };
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

Run your interaction script.

```bash
npx hardhat run scripts/interact.js --network polkadotHubTestnet
```
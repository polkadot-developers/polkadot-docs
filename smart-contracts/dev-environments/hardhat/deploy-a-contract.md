---
title: Deploy Smart Contracts with Hardhat
description: Learn how to deploy smart contracts to Local Development Node using Hardhat and deployments with Ignition modules.
categories: Smart Contracts, Tooling
---

# Deploy a Contract using Hardhat

<!-- TODO: this should be changed as soon as the REVM backend is deployed with no issues in paseo asset hub -->

## Deploying to a Live Network

This guide will use the Local Development Node as the target network. Here's how to configure and deploy:

1. Ensure you have a local development node running. Check the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/){target=_blank} guide on how to run a local dev node.

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

4. Update your Hardhat configuration file with network settings with your local development node URL.

    ```javascript title="hardhat.config.js"
    require("@nomicfoundation/hardhat-toolbox");
    const { vars } = require("hardhat/config");

    const PRIVATE_KEY = vars.get("PRIVATE_KEY");

    module.exports = {
      solidity: "0.8.28",
      networks: {
        polkadotTestNet: {
          url: "http://localhost:8545",
          chainId: 420420420,
          accounts: [PRIVATE_KEY]
        }
      }
    };
    ```

5. Deploy your contract using Ignition. The `Lock.js` module in the `ignition/modules` directory contains the deployment logic for your contract, including any constructor arguments and deployment configuration.

Hardhat Ignition uses this module to orchestrate the deployment:

    ```bash
    npx hardhat ignition deploy ./ignition/modules/Lock.js --network polkadotTestNet
    ```

## Interaction with Your Contract

Once deployed, you can create a script to interact with your contract. To do so, create a file called `scripts/interact.js` and add some logic to interact with the contract.

For example, for the default `Lock.sol` contract, you can use the following file that connects to the contract at its address and retrieves the `unlockTime`, which represents when funds can be withdrawn. 

The script converts this timestamp into a readable date and logs it. It then checks the contract's balance and displays it. 

Finally, it attempts to call the withdrawal function on the contract, but it catches and logs the error message if the withdrawal is not yet allowed (e.g., before `unlockTime`).

```javascript title="interact.js"
--8<-- 'code/smart-contracts/dev-environments/hardhat/deploy-a-contract/interact.js'
```

Run your interaction script.

```bash
npx hardhat run scripts/interact.js --network polkadotTestNet
```
 <!-- TODO: add a terminal output snippet -->

## Where to Go Next

You've successfully deployed and interacted with your smart contract using Hardhat. You now have a complete workflow for developing, testing, deploying, and interacting with smart contracts on Polkadot Hub.

To continue your smart contract development journey, explore these additional resources and tools that can enhance your development experience and help you build more complex decentralized applications.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Verify a Contract__

    ---

    Learn how to verify your deployed smart contract to make the source code publicly available..

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/verify-a-contract)

</div>
---
title: Deploy an ERC-20 to Polkadot Hub
description: Deploy an ERC-20 token on Polkadot Hub using PolkaVM. This guide covers contract creation, compilation, deployment, and interaction via Hardhat.
categories: Basics, Smart Contracts
url: https://docs.polkadot.com/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-hardhat/
---

# Deploy an ERC-20 to Polkadot Hub

## Introduction

[ERC-20](https://eips.ethereum.org/EIPS/eip-20){target=\_blank} tokens are fungible tokens commonly used for creating cryptocurrencies, governance tokens, and staking mechanisms. Polkadot Hub enables easy token deployment with Ethereum-compatible smart contracts and tools via the EVM backend.

This tutorial covers deploying an ERC-20 contract on the Polkadot Hub TestNet using [Hardhat](https://hardhat.org/){target=\_blank}, an Ethereum development environment. The ERC-20 contract can be retrieved from OpenZeppelin's [GitHub repository](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v5.4.0/contracts/token/ERC20){target=\_blank}  or their [Contract Wizard](https://wizard.openzeppelin.com/){target=\_blank}.

## Prerequisites

Before starting, make sure you have:

- Basic understanding of Solidity programming and fungible tokens.
- Node.js v22.13.1 or later.
- A funded account with tokens for transaction fees. This example will deploy the contract to the Polkadot TestNet, so you'll [need some TestNet tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} from the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}.

## Set Up Your Project

This tutorial uses a [Hardhat ERC-20 template](https://github.com/polkadot-developers/revm-hardhat-examples/tree/master/erc20-hardhat){target=\_blank} that contains all the necessary files. To get started, take the following steps:

1. Clone the GitHub repository locally:

    ```bash
    git clone https://github.com/polkadot-developers/revm-hardhat-examples/
    cd revm-hardhat-examples/erc20-hardhat
    ```

2. Install the dependencies:

    ```bash
    npm i
    ```

This will fetch all the necessary packages to help you deploy an ERC-20 with Hardhat to Polkadot.

## Configure Hardhat

Once you've [setup your project](#set-up-your-project), you can configure the `hardhat.config.ts` to your needs. This tutorial has the file prepared to deploy to the Polkadot TestNet.

To store and use private keys or network URLs, you can use Hardhat's configuration variables. This can be set via tasks in the **vars** scope. For example, to store the private key to deploy to the Polkadot TestNet, run the following command:

```bash
npx hardhat vars set TESTNET_PRIVATE_KEY
```

The command will initiate a wizard in which you'll have to enter the value to be stored:

<div id="termynal" data-termynal markdown>
  <span data-ty="input">npx hardhat vars set TESTNET_PRIVATE_KEY</span>
  <span data-ty>✔ Enter value: · •••••••••</span>
  <span data-ty>The configuration variable has been stored in /Users/albertoviera/Library/Preferences/hardhat-nodejs/vars.json</span>
</div>

??? warning "Key Encryption"
    This solution just prevents variables to be included in the code repository. You should find a solution that encrypts private keys and access them securely.

You can now use the account related to this private key by importing it into the Hardhat configuration file:

```ts title="hardhat.config.ts" hl_lines="1 37"
import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

/**
 * SECURITY NOTE: 
 * This config uses Hardhat's configuration variables for secure private key management.
 * 
 * To securely set your private key:
 * 1. Run: npx hardhat vars set TESTNET_PRIVATE_KEY
 * 2. Enter your private key when prompted
 * 3. The value is stored securely (run 'npx hardhat vars path' to see location)
 * 
 * To set a custom network URL:
 * npx hardhat vars set TESTNET_URL
 * 
 * Other useful commands:
 * - List all variables: npx hardhat vars list
 * - View a variable: npx hardhat vars get TESTNET_PRIVATE_KEY
 * - Delete a variable: npx hardhat vars delete TESTNET_PRIVATE_KEY
 * 
 * NEVER commit private keys or expose them in code/logs.
 */

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    polkadotTestnet: {
      url: vars.get("TESTNET_URL", "http://127.0.0.1:8545"),
      accounts: vars.has("TESTNET_PRIVATE_KEY") ? [vars.get("TESTNET_PRIVATE_KEY")] : [],
    },
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
```

## Compile your Contract

Once you've configured Hardhat, you can compile the contract. 

In this tutorial, a simple ERC-20 is provided. Therefore, to compile the contract you can run the following command:

```bash
npx hardhat compile
```

If everything compiles successfully, you should see the following output:

<div id="termynal" data-termynal markdown>
  <span data-ty="input">npx hardhat compile</span>
  <span data-ty>Generating typings for: 23 artifacts in dir: typechain-types for target: ethers-v6</span>
  <span data-ty>Successfully generated 62 typings!</span>
  <span data-ty>Compiled 21 Solidity files successfully (evm target: paris).</span>
</div>

## Test your Contract

Hardhat has a native feature to test contracts. You can run tests against the local Hardhat development node, but it could have some technical differences to Polkadot. Therefore, in this tutorial, you'll be testing against the Polkadot TestNet

This example has a predefined test file located in [`test/Token.test.js`](https://github.com/polkadot-developers/revm-hardhat-examples/blob/master/erc20-hardhat/test/MyToken.test.ts){target=\_blank}, that runs the following tests:

1. The token was deployed by verifying its **name** and **symbol**.
2. The token has the right owner configured.
3. The token has an initial supply of zero.
4. The owner can mint tokens.
5. The total supply is increased after a mint.
6. Perform multiple mints to different addresses and checks the balance of each address and the new total supply.

To run the test, you can execute the following command:

```bash
npx hardhat test --network polkadotTestnet
```

If tests are successful, you should see the following logs:

<div id="termynal" data-termynal markdown>
  <span data-ty="input">npx hardhat test --network polkadotTestnet</span>
  <span data-ty></span>
  <span data-ty>&nbsp;&nbsp;MyToken</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;Deployment</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔ Should have correct name and symbol</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔ Should set the right owner</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔ Should have zero initial supply</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;Minting</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔ Should allow owner to mint tokens</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔ Should increase total supply on mint</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;Multiple mints</span>
  <span data-ty>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔ Should correctly track balance after multiple mints</span>
  <span data-ty></span>
  <span data-ty>&nbsp;&nbsp;6 passing (369ms)</span>
</div>

## Deploy your Contract

With the Hardhat configuration file ready, the private key stored as a variable under **vars**, and the contract compiled, you can proceed to deploy the contract to a given network. In this tutorial, you are deploying it to the Polkadot TestNet.

To deploy the contract, run the following command:

```bash
npx hardhat ignition deploy ./ignition/modules/MyToken.ts --network polkadotTestnet
```

You'll need to confirm the target network (by chain ID):

<div id="termynal" data-termynal markdown>
  <span data-ty="input">npx hardhat ignition deploy ./ignition/modules/MyToken.ts --network polkadotTestnet</span>
  <span data-ty>✔ Confirm deploy to network polkadotTestnet (420420420)? … yes</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>Hardhat Ignition 🚀</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>Deploying [ TokenModule ]</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>Batch #1</span>
  <span data-ty>  Executed TokenModule#MyToken</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>Batch #2</span>
  <span data-ty>  Executed TokenModule#MyToken.mint</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>[ TokenModule ] successfully deployed 🚀</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>Deployed Addresses</span>
  <span data-ty>&nbsp;</span>
  <span data-ty>TokenModule#MyToken - 0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3</span>
</div>

And that is it! You've successfully deployed an ERC-20 token contract to the Polkadot TestNet using Hardhat.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy an NFT with Remix__

    ---

    Walk through deploying an ERC-721 Non-Fungible Token (NFT) using OpenZeppelin's battle-tested NFT implementation and Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/remix/)

</div>

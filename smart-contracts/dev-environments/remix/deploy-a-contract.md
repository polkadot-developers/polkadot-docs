---
title: Deploy Contracts Using Remix IDE
description: Learn how to deploy smart contracts to the Polkadot Hub network and interact with them using the Remix IDE and wallet providers, covering deployment and state.
categories: Smart Contracts, Tooling
---

# Deploy Smart Contracts Using Remix IDE

## Overview

After compiling your smart contract in Remix IDE, the next step is to deploy it to the Polkadot Hub network. This guide will walk you through the deployment process using a wallet provider and show you how to interact with your deployed contracts directly from the Remix interface.

## Prerequisites

Before deploying your contract, ensure you have:

- Completed the [Remix IDE setup](/smart-contracts/dev-environments/remix/get-started/){target=\_blank} and have a compiled contract ready.
- A compatible wallet extension installed (e.g., [MetaMask](https://metamask.io/){target=\_blank} or [Talisman](https://www.talisman.xyz/){target=\_blank}).
- Your wallet connected to the Polkadot Hub network. Check the [Connect to Polkadot](/smart-contracts/connect/){target=\_blank} guide for more information.
- Test tokens in your wallet to cover deployment and transaction fees (available from the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank}).

## Deploy Contracts

The steps use Remix IDE to deploy a contract to Polkadot Hub are as follows:

1. Navigate to [Remix](https://remix.ethereum.org/){target=\_blank} in your web browser.
2. Locate the **Deploy & Run Transactions** tab.
3. Select the **Environment** dropdown.
4. Select **Browser Extension**.
5. Select the **Injected Provider - MetaMask** option.
6. Click the **Deploy** button and then click **Confirm** in the wallet popup.

Once your contract is deployed successfully, you will see the deployment confirmation in the Remix terminal.

![](/images/smart-contracts/dev-environments/remix/deploy-a-contract/remix-1.gif)

## Interact with Contracts

Deployed contracts appear in the **Deployed/Unpinned Contracts** section. Follow these steps to interact with the deployed contract:

1. Expand the contract to view available methods.

    !!! tip
        Pin your frequently used contracts to the **Pinned Contracts** section for easy access.

2. Select any of the exposed methods to interact with the contract.

    You can use these methods to interact with your deployed contract by reading or writing to its state. Remix IDE uses a color-coding scheme for method buttons to help differentiate between types of available methods as follows:

    - **Blue buttons**: indicate `view` or `pure` functions which read state only. Interactions do not create a new transaction and will not result in gas fees.
    - **Orange buttons**: label `non-payable` functions which change contract state but don't accept any value (ETH or other tokens) being sent with the transaction.
    - **Red buttons**: designate `payable` functions which create a transaction and can accept a value (ETH or other tokens) to send with the transaction.

If you deployed the `Counter.sol` contract from [Remix IDE setup](/smart-contracts/dev-environments/remix/get-started/){target=\_blank}, you can try interacting with the exposed methods as follows:

1. Select the **GetCount** button to read the current count value.

2. Select the **Increment** button to increment the count value.

3. Submit the transaction and click the **Confirm** button in the wallet pop-up.

Once the transaction is confirmed, you will see the updated count value in the Remix terminal.

![](/images/smart-contracts/dev-environments/remix/deploy-a-contract/remix-2.gif)

## Where to Go Next

You've successfully deployed and interacted with your smart contract on Polkadot Hub using Remix IDE. Continue enhancing your development workflow with these resources:

<div class="grid cards" markdown>

<!-- -   <span class="badge guide">Guide</span> __Verify Your Contract__

    ---

    Learn how to verify your deployed smart contracts for transparency and trust.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/verify-a-contract) -->

-   <span class="badge guide">Guide</span> __Troubleshooting and FAQs__

    ---

    Find solutions to common issues when working with Remix IDE.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/troubleshooting-faq/)

</div>
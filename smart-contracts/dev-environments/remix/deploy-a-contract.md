---
title: Deploy and Interact with Smart Contracts Using Remix IDE
description: Learn how to deploy smart contracts to the Polkadot Hub network and interact with them using the Remix IDE and wallet providers, covering deployment and state.
categories: Smart Contracts, Tooling
---

# Deploy Smart Contracts Using Remix IDE

## Overview

After compiling your smart contract in Remix IDE, the next step is to deploy it to the Polkadot Hub network. This guide will walk you through the deployment process using a wallet provider and show you how to interact with your deployed contracts directly from the Remix interface.

## Prerequisites

Before deploying your contract, ensure you have:

- Completed the [Remix IDE setup](/smart-contracts/dev-environments/remix/get-started/){target=\_blank} and have a compiled contract ready
- A compatible wallet extension installed (e.g., [MetaMask](https://metamask.io/){target=\_blank} or [Talisman](https://www.talisman.xyz/){target=\_blank})
- Your wallet connected to the Polkadot Hub network. Check the [Connect to Polkadot](/smart-contracts/connect/){target=\_blank} guide for more information.
- Test tokens in your wallet to cover deployment and transaction fees (available from the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank})

## Deploying Contracts

1. To deploy your contract, you need to:

    1. Navigate to the **Deploy & Run Transactions** tab.
    2. Click the **Environment** dropdown.
    3. Select **Browser Extension**.
    4. Click on the **Injected Provider - MetaMask** option.

2. Click the **Deploy** button and then click **Confirm** in the wallet popup.

3. Once your contract is deployed successfully, you will see the deployment confirmation in the Remix terminal.

    ![](/images/smart-contracts/dev-environments/remix/deploy-a-contract/remix-1.gif)

## Interacting with Contracts

Once deployed, your contract appears in the **Deployed/Unpinned Contracts** section:

1. Expand the contract to view available methods.

    !!! tip
        Pin your frequently used contracts to the **Pinned Contracts** section for easy access.

2. To interact with the contract, you can select any of the exposed methods.

    In this way, you can interact with your deployed contract by reading its state or writing to it. The button color indicates the type of interaction available:

    - **Red**: Modifies state and is payable.
    - **Orange**: Modifies state only.
    - **Blue**: Reads state.

3. Click the **GetCount** button to read the current count value.

4. Click the **Increment** button to increment the count value.

5. Submit the transaction and click the **Confirm** button in the wallet pop-up.

6. Once the transaction is confirmed, you will see the updated count value in the Remix terminal.

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
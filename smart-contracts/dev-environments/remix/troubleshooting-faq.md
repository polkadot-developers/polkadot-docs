---
title: Troubleshooting Remix IDE
description: Common issues related to developing, compiling, and deploying smart contracts using Remix IDE on Polkadot Hub paired with troubleshooting suggestions.
categories: Smart Contracts, Tooling
---

# Remix IDE Troubleshooting

This guide provides solutions to common issues you may encounter when using Remix IDE with Polkadot Hub. If you're experiencing problems with compilation, deployment, or contract interaction, you'll likely find the solution here.

## Contract fails to compile or shows errors in the terminal

- **Check Solidity version compatibility**:
    - Ensure your contract's pragma statement matches the compiler version selected in the **Solidity Compiler** tab.
    - Example: If your contract uses `pragma solidity ^0.8.0;`, select compiler version 0.8.x or higher.

- **Review syntax errors**:
    - Carefully read error messages in the terminal panel at the bottom of the screen.
    - Common issues include missing semicolons, incorrect function visibility, or mismatched brackets.

- **Clear cache and recompile**:
    - Delete the `artifacts` folder in the **File Explorer**.
    - Try compiling again with `Ctrl+S` or click the **Compile** button.

## The `artifacts` folder doesn't appear after compilation

- Ensure compilation completed successfully without errors.
- Refresh the **File Explorer** by clicking away and back to the **File Explorer** tab.
- Check that your `.sol` file is saved before compiling.

## Remix doesn't detect your wallet extension (MetaMask, Talisman, etc.)

- **Verify wallet installation**:
    - Ensure your wallet extension is properly installed and enabled in your browser.
    - Check that the extension icon appears in your browser toolbar.

- **Refresh the page**:
    - Reload the Remix IDE page and try reconnecting.

- **Check browser permissions**:
    - Ensure Remix has permission to interact with the wallet extension.
    - Check your browser's extension settings.

- **Use correct environment**:
    - In the **Deploy & Run Transactions** tab, select **Browser Extension** from the **Environment** dropdown.
    - Choose **Injected Provider - MetaMask** (works with most wallet providers).

## Wallet is connected but to the wrong network

1. Open your wallet extension.
2. Switch to the Polkadot Hub network.
3. Refresh the Remix IDE if the network change isn't detected automatically.
4. Verify the network name and chain ID match Polkadot Hub's configuration.

## Deployment fails with "insufficient funds" or similar error

- **Check your balance**:
    - Verify you have enough test tokens in your connected wallet.
    - Visit the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank} to obtain test tokens.

- **Wait for faucet tokens**:
    - Allow a few minutes for faucet transactions to complete.
    - Refresh your wallet to see the updated balance.

## Deployment transaction is rejected or fails

- **Increase gas limit**:
    - In the **Deploy & Run Transactions** tab, adjust the **Gas Limit** field.
    - Try increasing it by 20-30% from the estimated amount.

- **Check contract constructor parameters**:
    - Ensure any required constructor parameters are provided correctly.
    - Verify parameter types match the contract's constructor signature.

- **Verify contract selection**:
    - Ensure you've selected the correct contract from the **Contract** dropdown.
    - If you have multiple contracts, make sure you're deploying the intended one.

## The "Injected Provider - MetaMask" option doesn't appear in the Environment dropdown

- Select **Browser Extension** from the **Environment** dropdown to populate the **Injected Provider - Metamask** option.
- Ensure your wallet extension is unlocked and active.
- Try disabling and re-enabling the wallet extension.
- Refresh the Remix IDE page.

## Wallet rejects transactions when trying to interact with deployed contracts

- **Check wallet unlock status**:
    - Ensure your wallet is unlocked.
    - Verify you're approving the transaction in the wallet pop-up.

- **Verify sufficient gas**:
    - Ensure you have enough tokens to cover the transaction fee.
    - The wallet pop-up should show the estimated gas cost.

- **Network mismatch**:
    - Confirm your wallet is still connected to Polkadot Hub.
    - Check that Remix is using the same network.

## Deployed contract doesn't show in the **Deployed/Unpinned Contracts** section

- Wait for the transaction to be confirmed on-chain.
- Check the Remix terminal for deployment confirmation.
- Scroll down in the **Deploy & Run Transactions** panel to find the deployed contracts section.
- If the deployment transaction failed, check the terminal for error messages.

## Blue buttons (read functions) don't display return values

- **Check the terminal**:
    - Return values appear in the terminal panel at the bottom.
    - Look for the decoded output section.

- **Verify contract state**:
    - Ensure the contract has been properly initialized.
    - Check if the function requires a specific contract state to return values.

- **Network connection**:
    - Verify you're still connected to the correct network.
    - Try refreshing the connection to your wallet.


## Orange/red buttons (write functions) execute, but the state doesn't change

- **Wait for transaction confirmation**:
    - Transactions need to be mined before state changes are reflected.
    - Check the terminal for transaction status.
    - Wait a few seconds and try rereading the state.

- **Transaction failed**:
    - Check if the transaction was actually successful in the terminal.
    - Look for revert reasons or error messages.
    - Verify you approved the transaction in your wallet.

- **Check transaction parameters**:
    - Ensure you're passing the correct parameters to the function.
    - For payable functions (red buttons), verify you're sending the correct amount.

## Remix takes a long time to load or becomes unresponsive

- **Clear browser cache**:
    - Clear your browser's cache and cookies.
    - Restart your browser.

- **Disable unnecessary plugins**:
    - In Remix, deactivate plugins you're not using via the Plugin Manager.

- **Use a supported browser**:
    - Use Chrome, Firefox, or Brave for the best compatibility.
    - Ensure your browser is up to date.

## Changes to files or folders don't appear in the File Explorer

- Click the refresh icon in the **File Explorer**.
- Switch to a different tab and back to **File Explorer**.
- Save your work and reload the Remix IDE page.

## Where to Go Next

Continue improving your Remix IDE workflow with these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Get Started with Remix IDE__

    ---

    Return to the basics and review the Remix IDE setup process.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/get-started/)

-   <span class="badge guide">Guide</span> __Deploy Smart Contracts__

    ---

    Learn how to deploy and interact with smart contracts using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/deploy-a-contract/)

</div>
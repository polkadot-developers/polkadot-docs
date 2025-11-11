---
title: Troubleshooting and FAQs
description: Solutions to common issues when developing, compiling, and deploying smart contracts using Remix IDE on Polkadot Hub.
categories: Smart Contracts, Tooling
---

# Remix IDE Troubleshooting and FAQs

This guide provides solutions to common issues you may encounter when using Remix IDE with Polkadot Hub. If you're experiencing problems with compilation, deployment, or contract interaction, you'll likely find the solution here.

## Contract fails to compile or shows errors in the terminal.

**Solutions**:

1. **Check Solidity version compatibility**:
    - Ensure your contract's pragma statement matches the compiler version selected in the **Solidity Compiler** tab.
    - Example: If your contract uses `pragma solidity ^0.8.0;`, select compiler version 0.8.x or higher.

2. **Review syntax errors**:
    - Carefully read error messages in the terminal panel at the bottom of the screen.
    - Common issues include missing semicolons, incorrect function visibility, or mismatched brackets.

3. **Clear cache and recompile**:
    - Delete the `artifacts` folder in the File Explorer.
    - Try compiling again with `Ctrl+S` or click the **Compile** button.

## The `artifacts` folder doesn't appear after compilation.

**Solutions**:

1. Ensure compilation completed successfully without errors.
2. Refresh the File Explorer by clicking away and back to the **File Explorer** tab.
3. Check that your `.sol` file is saved before compiling.

## Remix doesn't detect your wallet extension (MetaMask, Talisman, etc.).

**Solutions**:

1. **Verify wallet installation**:
    - Ensure your wallet extension is properly installed and enabled in your browser.
    - Check that the extension icon appears in your browser toolbar.

2. **Refresh the page**:
    - Reload the Remix IDE page and try reconnecting.

3. **Check browser permissions**:
    - Ensure Remix has permission to interact with the wallet extension.
    - Check your browser's extension settings.

4. **Use correct environment**:
    - In the **Deploy & Run Transactions** tab, select **Browser Extension** from the **Environment** dropdown.
    - Choose **Injected Provider - MetaMask** (works with most wallet providers).

## Wallet is connected but to the wrong network.

**Solutions**:

1. Open your wallet extension.
2. Switch to the Polkadot Hub network.
3. Refresh Remix IDE if the network change isn't detected automatically.
4. Verify the network name and chain ID match Polkadot Hub's configuration.

## Deployment fails with "insufficient funds" or similar error.

**Solutions**:

1. **Check your balance**:
    - Verify you have enough test tokens in your connected wallet.
    - Visit the [Polkadot faucet](/smart-contracts/faucet/){target=\_blank} to obtain test tokens.

2. **Wait for faucet tokens**:
    - Allow a few minutes for faucet transactions to complete.
    - Refresh your wallet to see the updated balance.

## Deployment transaction is rejected or fails.

**Solutions**:

1. **Increase gas limit**:
    - In the **Deploy & Run Transactions** tab, adjust the **Gas Limit** field.
    - Try increasing it by 20-30% from the estimated amount.

2. **Check contract constructor parameters**:
    - Ensure any required constructor parameters are provided correctly.
    - Verify parameter types match the contract's constructor signature.

3. **Verify contract selection**:
    - Ensure you've selected the correct contract from the **Contract** dropdown.
    - If you have multiple contracts, make sure you're deploying the intended one.

## The "Injected Provider - MetaMask" option doesn't appear in the Environment dropdown.

**Solutions**:

1. Select **Browser Extension** from the Environment dropdown first.
2. Ensure your wallet extension is unlocked and active.
3. Try disabling and re-enabling the wallet extension.
4. Refresh the Remix IDE page.

## Wallet rejects transactions when trying to interact with deployed contracts.

**Solutions**:

1. **Check wallet unlock status**:
    - Ensure your wallet is unlocked.
    - Verify you're approving the transaction in the wallet popup.

2. **Verify sufficient gas**:
    - Ensure you have enough tokens to cover the transaction fee.
    - The wallet popup should show the estimated gas cost.

3. **Network mismatch**:
    - Confirm your wallet is still connected to Polkadot Hub.
    - Check that Remix is using the same network.

## Deployed contract doesn't show in the **Deployed/Unpinned Contracts** section.

**Solutions**:

1. Wait for the transaction to be confirmed on-chain.
2. Check the Remix terminal for deployment confirmation.
3. Scroll down in the **Deploy & Run Transactions** panel to find the deployed contracts section.
4. If the deployment transaction failed, check the terminal for error messages.

## Blue buttons (read functions) don't display return values.

**Solutions**:

1. **Check the terminal**:
    - Return values appear in the terminal panel at the bottom.
    - Look for the decoded output section.

2. **Verify contract state**:
    - Ensure the contract has been properly initialized.
    - Check if the function requires specific contract state to return values.

3. **Network connection**:
    - Verify you're still connected to the correct network.
    - Try refreshing the connection to your wallet.


## Orange/red buttons (write functions) execute but state doesn't change.

**Solutions**:

1. **Wait for transaction confirmation**:
    - Transactions need to be mined before state changes are reflected.
    - Check the terminal for transaction status.
    - Wait a few seconds and try reading the state again.

2. **Transaction failed**:
    - Check if the transaction was actually successful in the terminal.
    - Look for revert reasons or error messages.
    - Verify you approved the transaction in your wallet.

3. **Check transaction parameters**:
    - Ensure you're passing correct parameters to the function.
    - For payable functions (red buttons), verify you're sending the correct amount.

## Remix takes a long time to load or becomes unresponsive.

**Solutions**:

1. **Clear browser cache**:
    - Clear your browser's cache and cookies.
    - Restart your browser.

2. **Disable unnecessary plugins**:
    - In Remix, deactivate plugins you're not using via the Plugin Manager.

3. **Use a supported browser**:
    - Use Chrome, Firefox, or Brave for the best compatibility.
    - Ensure your browser is up to date.

## Changes to files or folders don't appear in the File Explorer.

**Solutions**:

1. Click the refresh icon in the File Explorer.
2. Switch to a different tab and back to File Explorer.
3. Save your work and reload the Remix IDE page.

## Where to Go Next

Continue improving your Remix IDE workflow with these resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Get Started with Remix IDE__

    ---

    Return to the basics and review the Remix IDE setup process.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/get-started)

-   <span class="badge guide">Guide</span> __Deploy Smart Contracts__

    ---

    Learn how to deploy and interact with smart contracts using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/deploy-a-contract)

</div>
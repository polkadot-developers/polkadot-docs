---
title: Deploy an ERC-20 to Polkadot Hub
description: Deploy an ERC-20 token on Polkadot Hub using PolkaVM. This guide covers contract creation, compilation, deployment, and interaction via the Remix IDE.
tutorial_badge: Beginner
categories: Basics, dApps, Smart Contracts
tools: EVM Wallet, Remix
---

# Deploy an ERC-20 to Polkadot Hub

## Introduction

[ERC-20](https://eips.ethereum.org/EIPS/eip-20){target=\_blank} tokens are fungible tokens commonly used for creating cryptocurrencies, governance tokens, and staking mechanisms. Polkadot Hub enables easy token deployment with Ethereum-compatible smart contracts and tools via the EVM backend.

This tutorial covers deploying an ERC-20 contract on the Polkadot Hub TestNet using [Remix IDE](https://remix.ethereum.org/){target=\_blank}, a web-based development tool. The ERC-20 contract can be retrieved from OpenZeppelin's [GitHub repository]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/token/ERC20){target=\_blank}  or their [Contract Wizard](https://wizard.openzeppelin.com/){target=\_blank}.

## Prerequisites

Before starting, make sure you have:

- An EVM-compatible wallet [connected to Polkadot Hub](/smart-contracts/integrations/wallets){target=\_blank}. This example utilizes [MetaMask](https://metamask.io/){target=\_blank}.
- A funded account with tokens for transaction fees. This example will deploy the contract to the Polkadot TestNet, so you'll [need some TestNet tokens](/smart-contracts/connect/#test-tokens){target=\_blank} from the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}.
- Basic understanding of Solidity and fungible tokens.

## Create the ERC-20 Contract

To create the ERC-20 contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}.
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyToken.sol`.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/deploy-erc20-1.webp)

3. Now, paste the following ERC-20 contract code into the editor:

    ```solidity title="MyToken.sol"
    --8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/refs/heads/master/erc20-hardhat/contracts/MyToken.sol'
    ```

    The key components of the code above are:

    - Contract imports:

        - **[`ERC20.sol`]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/token/ERC20/ERC20.sol){target=\_blank}**: The base contract for fungible tokens, implementing core functionality like transfers, approvals, and balance tracking.
        - **[`ERC20Permit.sol`]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/token/ERC20/extensions/ERC20Permit.sol){target=\_blank}**: [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612){target=\_blank} extension for ERC-20 that adds the permit function, allowing approvals via off-chain signatures (no on-chain tx from the holder). Manages nonces and EIP-712 domain separator and updates allowances when a valid signature is presented.
        - **[`Ownable.sol`]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/access/Ownable.sol){target=\_blank}**: Provides basic authorization control, ensuring only the contract owner can mint new tokens.
    
    - Constructor parameters:

        - **`initialOwner`**: Sets the address that will have administrative rights over the contract.
        - **`"MyToken"`**: The full name of your token.
        - **`"MTK"`**: The symbol representing your token in wallets and exchanges.

    - Key functions:

        - **`mint(address to, uint256 amount)`**: Allows the contract owner to create new tokens for any address. The amount should include 18 decimals (e.g., 1 token = 1000000000000000000).
        - Inherited [Standard ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/){target=\_blank} functions:
            - **`transfer(address recipient, uint256 amount)`**: Sends a specified amount of tokens to another address.
            - **`approve(address spender, uint256 amount)`**: Grants permission for another address to spend a specific number of tokens on behalf of the token owner.
            - **`transferFrom(address sender, address recipient, uint256 amount)`**: Transfers tokens from one address to another, if previously approved.
            - **`balanceOf(address account)`**: Returns the token balance of a specific address.
            - **`allowance(address owner, address spender)`**: Checks how many tokens an address is allowed to spend on behalf of another address.

    !!! tip
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} to generate customized smart contracts quickly. Simply configure your contract, copy the generated code, and paste it into the Remix IDE for deployment. Below is an example of an ERC-20 token contract created with it:

        ![Screenshot of the OpenZeppelin Contracts Wizard showing an ERC-20 contract configuration.](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix-1.webp)
        

## Compile the Contract

The compilation transforms your Solidity source code into bytecode that can be deployed on the blockchain. During this process, the compiler checks your contract for syntax errors, ensures type safety, and generates the machine-readable instructions needed for blockchain execution. 

To compile your contract, ensure you have it opened in the Remix IDE Editor, and follow the instructions below:

1. Select the **Solidity Compiler** plugin from the left panel.
2. Click the **Compile MyToken.sol** button.
3. If the compilation succeeded, you'll see a green checkmark indicating success in the **Solidity Compiler** icon.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix-1.gif)

## Deploy the Contract

Deployment is the process of publishing your compiled smart contract to the blockchain, making it permanently available for interaction. During deployment, you'll create a new instance of your contract on the blockchain, which involves:

1. Select the **Deploy & Run Transactions** plugin from the left panel.
2. Configure the deployment settings.
    1. From the **ENVIRONMENT** dropdown, select **Injected Provider - MetaMask** (check the [Deploying Contracts](TODO){target=\_blank} section of the Remix IDE guide for more details).
    2. (Optional) From the **ACCOUNT** dropdown, select the account you want to use for the deploy.

3. Configure the contract parameters:
    1. Enter the address that will own the deployed token contract.
    2. Click the **Deploy** button to initiate the deployment.

4. **MetaMask will pop up**: Review the transaction details. Click **Confirm** to deploy your contract.
5. If the deployment process succeeded, you will see the transaction details in the terminal, including the contract address and deployment transaction hash.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix-2.gif)

## Interact with Your ERC-20 Contract

Once deployed, you can interact with your contract through Remix. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods. In this example, you'll mint some tokens to a given address:

1. Expand the **mint** function:
    1. Enter the recipient address and the amount (remember to add 18 zeros for 1 whole token).
    2. Click **transact**.

2. Click **Approve** to confirm the transaction in the Talisman popup.

3. If the transaction succeeds, you will see a green check mark in the terminal.

4. You can also call the **balanceOf** function by passing the address of the **mint** call to confirm the new balance.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix-3.gif)


Other standard functions you can use:

- **`transfer(address to, uint256 amount)`**: Send tokens to another address.
- **`approve(address spender, uint256 amount)`**: Allow another address to spend your tokens.

Feel free to explore and interact with the contract's other functions using the same approach: select the method, provide any required parameters, and confirm the transaction in MetaMask when needed.

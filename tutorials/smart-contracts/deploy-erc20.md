---
title: Deploy an ERC-20 to Polkadot Hub
description: Deploy an ERC-20 token on Polkadot Hub using PolkaVM. This guide covers contract creation, compilation, deployment, and interaction via Polkadot Remix IDE.
tutorial_badge: Beginner
---

# Deploy an ERC-20 to Polkadot Hub

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

[ERC-20](https://eips.ethereum.org/EIPS/eip-20){target=\_blank} tokens are fungible tokens commonly used for creating cryptocurrencies, governance tokens, and staking mechanisms. Polkadot Hub enables easy token deployment with Ethereum-compatible smart contracts via PolkaVM.

This tutorial covers deploying an ERC-20 contract on the Polkadot Hub TestNet using [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}, a web-based development tool. [OpenZeppelin's ERC-20 contracts]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/token/ERC20){target=\_blank} are used for security and compliance.

## Prerequisites

Before starting, make sure you have:

- [MetaMask](https://metamask.io/){target=\_blank} installed and connected to Polkadot Hub. For detailed instructions, see the [Connect Your Wallet](/develop/smart-contracts/wallets){target=\_blank} section.
- A funded account with some PAS tokens (you can get them from the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}). To learn how to get test tokens, check out the [Test Tokens](/develop/smart-contracts/connect-to-polkadot#test-tokens){target=\_blank} section.
- Basic understanding of Solidity and fungible tokens.

## Create the ERC-20 Contract

To create the ERC-20 contract, you can follow the steps below:

1. Navigate to the [Polkadot Remix IDE](https://remix.polkadot.io){target=\_blank}.
2. Click in the **Create new file** button under the **contracts** folder, and name your contract as `MyToken.sol`.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-1.webp)

3. Now, paste the following ERC-20 contract code into the editor:

    ```solidity title="MyToken.sol"
    --8<-- 'https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/erc20-hardhat/contracts/MyToken.sol'
    ```

    The key components of the code above are:

    - Contract imports:

        - **[`ERC20.sol`]({{ dependencies.repositories.open_zeppelin_contracts.repository_url}}/tree/{{ dependencies.repositories.open_zeppelin_contracts.version}}/contracts/token/ERC20/ERC20.sol){target=\_blank}**: The base contract for fungible tokens, implementing core functionality like transfers, approvals, and balance tracking.
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
        Use the [OpenZeppelin Contracts Wizard](https://wizard.openzeppelin.com/){target=\_blank} to quickly generate customized smart contracts. Simply configure your contract, copy the generated code, and paste it into Polkadot Remix IDE for deployment. Below is an example of an ERC-20 token contract created with it:

        ![Screenshot of the OpenZeppelin Contracts Wizard showing an ERC-20 contract configuration.](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-2.webp)
        

## Compile the Contract

The compilation transforms your Solidity source code into bytecode that can be deployed on the blockchain. During this process, the compiler checks your contract for syntax errors, ensures type safety, and generates the machine-readable instructions needed for blockchain execution. To compile your contract, follow the instructions below:

1. Select the **Solidity Compiler** plugin from the left panel.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-3.webp)

2. Click the **Compile MyToken.sol** button.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-4.webp)

3. If the compilation succeeded, you'll see a green checkmark indicating success in the **Solidity Compiler** icon.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-5.webp)

## Deploy the Contract

Deployment is the process of publishing your compiled smart contract to the blockchain, making it permanently available for interaction. During deployment, you'll create a new instance of your contract on the blockchain, which involves:

1. Select the **Deploy & Run Transactions** plugin from the left panel.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-6.webp)

2. Configure the deployment settings.
    1. From the **ENVIRONMENT** dropdown, select **Injected Provider - Talisman** (check the [Deploying Contracts](/develop/smart-contracts/dev-environments/remix/#deploying-contracts){target=\_blank} section of the Remix IDE guide for more details).
    2. From the **ACCOUNT** dropdown, select the account you want to use for the deploy.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-7.webp)

3. Configure the contract parameters:

    1. Enter the address that will own the deployed token contract.
    2. Click the **Deploy** button to initiate the deployment.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-8.webp)

4. **Talisman will pop up**: Review the transaction details. Click **Approve** to deploy your contract.

     ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-9.webp){: .browser-extension}

    If the deployment process succeeded, you will see the transaction details in the terminal, including the contract address and deployment transaction hash:

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-10.webp)

## Interact with Your ERC-20 Contract

Once deployed, you can interact with your contract through Remix:

1. Find your contract under **Deployed/Unpinned Contracts**, and click it to expand the available methods.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-11.webp)

2. To mint new tokens:

    1. Click in the contract to expand its associated methods.
    2. Expand the **mint** function.
    3. Enter:
        - The recipient address.
        - The amount (remember to add 18 zeros for 1 whole token).
    4. Click **Transact**.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-12.webp)

3. Click **Approve** to confirm the transaction in the Talisman popup.

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-13.webp){: .browser-extension}

    If the transaction succeeds, you will see the following output in the terminal:

    ![](/images/tutorials/smart-contracts/deploy-erc20/deploy-erc20-14.webp)

Other common functions you can use:

- **`balanceOf(address)`**: Check token balance of any address.
- **`transfer(address to, uint256 amount)`**: Send tokens to another address.
- **`approve(address spender, uint256 amount)`**: Allow another address to spend your tokens.

Feel free to explore and interact with the contract's other functions using the same approach - selecting the method, providing any required parameters, and confirming the transaction through Talisman when needed.

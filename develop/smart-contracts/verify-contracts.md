---
title: Verify Contracts
description: Learn how to verify Solidity smart contracts on Subscan to improve transparency, trust, and usability for dApps on Polkadot Hub.
---

# Verify Contracts

## Introduction

Verifying smart contracts on a block explorer improves the transparency and security of deployed smart contracts on the blockchain. Users can view the source code for verified contracts and, in some cases, interact directly with the contract's public methods through the block explorer's interface.

This guide will outline the steps for verifying Solidity smart contracts on Polkadot Hub, through the [Subscan block explorer](https://assethub-westend.subscan.io/){target=\_blank}, explicitly focusing on the Westend Hub for testing purposes.

## Deploying the Contract

To verify a smart contract on the Subscan explorer, the contract must first be deployed on the target network. For further guidance about this process, you can check the [Deploy a NFT](/tutorials/smart-contracts/deploy-nft){target=\_blank} or [Deploy an ERC-20](/tutorials/smart-contracts/deploy-erc20){target=\_blank} tutorials.

You can deploy your Solidity smart contract using various development tools compatible with the Polkadot Hub, such as Remix, Hardhat, or other preferred tools that connect to the Polkadot network.

This guide uses a simple incrementer contract as an example. The Solidity code is the following:

```solidity title="Incrementer.sol"
--8<-- 'code/develop/smart-contracts/verify-contracts/Incrementer.sol'
```

## Collecting Information for Contract Verification

You will need to collect some information related to the contract's compiler and deployment to verify it successfully:

1. Take note of the name of the contract (in this example, `Incrementer`)
2. Take note of the Solidity compiler version used to compile and deploy the contract (in this example, `v0.8.28+commit.7893614a`)

    ![](/images/develop/smart-contracts/verify-contracts/verify-contracts-01.webp)

3. If optimization is enabled during compilation, take note of the optimization runs parameter
4. After deployment, take note of the deployed contract address. This can be found in the console output of your deployment tool or the interface of tools like Remix

    ![](/images/develop/smart-contracts/verify-contracts/verify-contracts-02.webp)

## Verify the Contract

Follow these steps to verify your contract on [Westend Hub Subscan](https://assethub-westend.subscan.io/){target=\_blank}:

1. Navigate to the [Subscan explorer](https://assethub-westend.subscan.io/){target=\_blank} for the Westend Hub
2. Open the **Tools** dropdown and select **Contract Verification Tool**

    ![](/images/develop/smart-contracts/verify-contracts/verify-contracts-03.webp)

3. Fill in the contract's information in the verification form:
    - Contract address
    - Select the compiler type. For this `Incrementer.sol` example, select **Solidity (Single file)**
    - Fill in the contract name (e.g., `Incrementer`)
    - Select the compiler version used to compile the contract (e.g., `v0.8.28+commit.7893614a`)
    - Add the Solidity source code of the contract
  
    ![](/images/develop/smart-contracts/verify-contracts/verify-contracts-04.webp)

4. Click the **Verify and Publish** button to verify the contract

## Verification Results

After a successful verification, you should be redirected to a new page (for this example, the verified contract page is [here](https://assethub-westend.subscan.io/account/0x6e95330945ca37667c4c70a60287b4b271e1205e?tab=contract){target=\_blank}). The contract page on Subscan will now display:

- Contract information
- Contract ABI
- Contract's source code
- Contract bytecode

    ![](/images/develop/smart-contracts/verify-contracts/verify-contracts-05.webp)

This verified contract status gives users confidence that the contract's source code matches the deployed bytecode on the blockchain.

## Conclusion

Verifying your Solidity smart contracts on Subscan enhances transparency and trust in your decentralized applications on Polkadot Hub. Users can inspect the source code and interact with your contracts directly through the explorer interface, which is crucial for building community trust and facilitating the adoption of your project.

Remember that verification is a one-time process for each deployed contract. Once your contract is verified, its source code will remain accessible on the blockchain explorer for as long as the explorer maintains its database.
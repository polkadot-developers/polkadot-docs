---
title: Register a Local Asset
description: Comprehensive guide to registering a local asset on the Asset Hub system parachain, including step-by-step instructions.
---

# Register a Local Asset on Asset Hub

## Introduction

As detailed in the [Asset Hub Overview](/polkadot-protocol/architecture/system-chains/asset-hub){target=\_blank} page, Asset Hub accommodates two types of assets: local and foreign. Local assets are those that were created in Asset Hub and are identifiable by an integer ID. On the other hand, foreign assets originate from a sibling parachain and are identified by a Multilocation.

This guide will take you through the steps of registering a local asset on the Asset Hub parachain.

## Prerequisites

Before you begin, ensure you have access to the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and a funded wallet with DOT or KSM.

- For Polkadot Asset Hub, you would need a deposit of 10 DOT and around 0.201 DOT for the metadata
- For Kusama Asset Hub, the deposit is 0.1 KSM and around 0.000669 KSM for the metadata

You need to ensure that your Asset Hub account balance is a bit more than the sum of those two deposits, which should seamlessly account for the required deposits and transaction fees.

## Steps to Register a Local Asset

To register a local asset on the Asset Hub parachain, follow these steps:

1. Open the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and connect to the Asset Hub parachain using the network selector in the top left corner 

      - You may prefer to test local asset registration on TestNet before registering the asset on a MainNet hub. If you still need to set up a local testing environment, review the [Environment setup](#test-setup-environment) section for instructions. Once the local environment is set up, connect to the Local Node (Chopsticks) available on `ws://127.0.0.1:8000`
      - For the live network, connect to the **Asset Hub** parachain. Either Polkadot or Kusama Asset Hub can be selected from the dropdown list, choosing the desired RPC provider

2. Click on the **Network** tab on the top navigation bar and select **Assets** from the dropdown list

      ![Access to Asset Hub through Polkadot.JS](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-1.webp)

3. Now, you need to examine all the registered asset IDs. This step is crucial to ensure that the asset ID you are about to register is unique. Asset IDs are displayed in the **assets** column

      ![Asset IDs on Asset Hub](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-2.webp)

4. Once you have confirmed that the asset ID is unique, click on the **Create** button on the top right corner of the page

      ![Create a new asset](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-3.webp)

5. Fill in the required fields in the **Create Asset** form:

    1. **creator account** - the account to be used for creating this asset and setting up the initial metadata
    2. **asset name** - the descriptive name of the asset you are registering
    3. **asset symbol** - the symbol that will be used to represent the asset
    4. **asset decimals** - the number of decimal places for this token, with a maximum of 20 allowed through the user interface
    5. **minimum balance** - the minimum balance for the asset. This is specified in the units and decimals as requested
    6. **asset ID** - the selected id for the asset. This should not match an already-existing asset id
    7. Click on the **Next** button
 
    ![Create Asset Form](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-4.webp)

6. Choose the accounts for the roles listed below:

    1. **admin account** - the account designated for continuous administration of the token      
    2. **issuer account** - the account that will be used for issuing this token
    3. **freezer account** - the account that will be used for performing token freezing operations
    4. Click on the **Create** button

    ![Admin, Issuer, Freezer accounts](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-5.webp)

7. Click on the **Sign and Submit** button to complete the asset registration process

    ![Sign and Submit](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-6.webp)

## Verify Asset Registration

After completing these steps, the asset will be successfully registered. You can now view your asset listed on the [**Assets**](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fasset-hub-polkadot-rpc.dwellir.com#/assets){target=\_blank} section of the Polkadot.js Apps interface.

![Asset listed on Polkadot.js Apps](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-assets/register-a-local-asset-7.webp)

!!! tip
    Take into consideration that the **Assets** section’s link may differ depending on the network you are using. For the local environment, enter `ws://127.0.0.1:8000` into the **Custom Endpoint** field.

In this way, you have successfully registered a local asset on the Asset Hub parachain.

For an in-depth explanation about Asset Hub and its features, see the [Asset Hub](https://wiki.polkadot.network/docs/learn-asset-conversion-assethub){target=\_blank} entry in the Polkadot Wiki.

## Test Setup Environment

You can set up a local parachain environment to test the asset registration process before deploying it on the live network. This guide uses Chopsticks to simulate that process. For further information on chopsticks usage, refer to the [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started){target=\_blank} documentation.

To set up a test environment, execute the following command:

```bash
npx @acala-network/chopsticks \
--config=https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml
```

The above command will spawn a lazy fork of Polkadot Asset Hub with the latest block data from the network. If you need to test Kusama Asset Hub, replace `polkadot-asset-hub.yml` with `kusama-asset-hub.yml` in the command.

An Asset Hub instance is now running locally, and you can proceed with the asset registration process. Note that the local registration process does not differ from the live network process. Once you have a successful TestNet transaction, you can use the same steps to register the asset on MainNet.
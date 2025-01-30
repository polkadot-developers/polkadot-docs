---
title: Register a Foreign Asset on Asset Hub
description: An in-depth guide to registering a foreign asset on the Asset Hub parachain, providing clear, step-by-step instructions.
---

# Register a Foreign Asset on Asset Hub

## Introduction

As outlined in the [Asset Hub Overview](/polkadot-protocol/architecture/system-chains/asset-hub){target=\_blank}, Asset Hub supports two categories of assets: local and foreign. Local assets are created on the Asset Hub system parachain and are identified by integer IDs. On the other hand, foreign assets, which originate outside of Asset Hub, are recognized by [Multilocations](https://wiki.polkadot.network/docs/learn/xcm/fundamentals/multilocation-summary){target=\_blank}.

When registering a foreign asset on Asset Hub, it's essential to notice that the process involves communication between two parachains. The Asset Hub parachain will be the destination of the foreign asset, while the source parachain will be the origin of the asset. The communication between the two parachains is facilitated by the [Cross-Chain Message Passing (XCMP)](https://wiki.polkadot.network/docs/learn-xcm){target=\_blank} protocol.

This guide will take you through the process of registering a foreign asset on the Asset Hub parachain.

## Prerequisites

The Asset Hub parachain is one of the system parachains on a relay chain, such as [Polkadot](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot.api.onfinality.io%2Fpublic-ws#/explorer){target=\_blank} or [Kusama](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.api.onfinality.io%2Fpublic-ws#/explorer){target=\_blank}. To interact with these parachains, you can use the [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} interface for:

- [Polkadot Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fasset-hub-polkadot-rpc.dwellir.com#/explorer){target=\_blank}
- [Kusama Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.ibp.network%2Fstatemine#/explorer){target=\_blank}

For testing purposes, you can also interact with the Asset Hub instance on the following test networks:

- [Paseo Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpas-rpc.stakeworld.io%2Fassethub#/explorer){target=\_blank}

Before you start, ensure that you have: 

- Access to the Polkadot.js Apps interface, and you are connected to the desired chain
- A parachain that supports the XCMP protocol to interact with the Asset Hub parachain
- A funded wallet to pay for the transaction fees and subsequent registration of the foreign asset

This guide will use Polkadot, its local Asset Hub instance, and the [Astar](https://astar.network/){target=\_blank} parachain (`ID` 2006), as stated in the [Test Environment Setup](#test-environment-setup) section. However, the process is the same for other relay chains and their respective Asset Hub parachain, regardless of the network you are using and the parachain owner of the foreign asset.

## Steps to Register a Foreign Asset

### Asset Hub

1. Open the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface and connect to the Asset Hub parachain using the network selector in the top left corner 

      - Testing foreign asset registration is recommended on TestNet before proceeding to MainNet. If you haven't set up a local testing environment yet, consult the [Environment setup](#test-environment-setup) guide. After setting up, connect to the Local Node (Chopsticks) at `ws://127.0.0.1:8000`
      - For live network operations, connect to the Asset Hub parachain. You can choose either Polkadot or Kusama Asset Hub from the dropdown menu, selecting your preferred RPC provider

2. Navigate to the **Extrinsics** page
      1. Click on the **Developer** tab from the top navigation bar
      2. Select **Extrinsics** from the dropdown

    ![Access to Developer Extrinsics section](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-assets/register-a-foreign-asset-1.webp)

3. Select the Foreign Assets pallet
      3. Select the **`foreignAssets`** pallet from the dropdown list
      4. Choose the **`create`** extrinsic

    ![Select the Foreign Asset pallet](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-assets/register-a-foreign-asset-2.webp)

3. Fill out the required fields and click on the copy icon to copy the **encoded call data** to your clipboard. The fields to be filled are:

    - **id** - as this is a foreign asset, the ID will be represented by a Multilocation that reflects its origin. For this case, the Multilocation of the asset will be from the source parachain perspective:
  
        ```javascript
        { parents: 1, interior: { X1: [{ Parachain: 2006 }] } }
        ```

    - **admin** - refers to the account that will be the admin of this asset. This account will be able to manage the asset, including updating its metadata. As the registered asset corresponds to a native asset of the source parachain, the admin account should be the sovereign account of the source parachain
      
        The sovereign account can be obtained through [Substrate Utilities](https://www.shawntabrizi.com/substrate-js-utilities/){target=\_blank}.

        Ensure that **Sibling** is selected and that the **Para ID** corresponds to the source parachain. In this case, since the guide follows the test setup stated in the [Test Environment Setup](#test-environment-setup) section, the **Para ID** is `2006`.

        ![Get parachain sovereign account](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-assets/register-a-foreign-asset-3.webp)


    - **`minBalance`** - the minimum balance required to hold this asset

    ![Fill out the required fields](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-assets/register-a-foreign-asset-4.webp)

    !!! tip 
        If you need an example of the encoded call data, you can copy the following:
        ```
        0x3500010100591f007369626cd6070000000000000000000000000000000000000000000000000000a0860100000000000000000000000000
        ```


### Source Parachain

1. Navigate to the **Developer > Extrinsics** section
2. Create the extrinsic to register the foreign asset through XCM
      1. Paste the **encoded call data** copied in the previous step
      2. Click the **Submit Transaction** button

    ![Register foreign asset through XCM](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-assets/register-a-foreign-asset-5.webp)

    This XCM call involves withdrawing DOT from the sibling account of the parachain, using it to initiate an execution. The transaction will be carried out with XCM as the origin kind, and will be a hex-encoded call to create a foreign asset on Asset Hub for the specified parachain asset multilocation. Any surplus will be refunded, and the asset will be deposited into the sibling account.

    !!! warning
        Note that the sovereign account on the Asset Hub parachain must have a sufficient balance to cover the XCM `BuyExecution` instruction. If the account does not have enough balance, the transaction will fail.

    If you want to have the whole XCM call ready to be copied, go to the **Developer > Extrinsics > Decode** section and paste the following hex-encoded call data:
    ```
    0x6300330003010100a10f030c000400010000070010a5d4e81300010000070010a5d4e80006030700b4f13501419ce03500010100591f007369626cd607000000000000000000000000000000000000000000000000000000000000000000000000000000000000
    ```

    Be sure to replace the encoded call data with the one you copied in the previous step.

After the transaction is successfully executed, the foreign asset will be registered on the Asset Hub parachain. 

## Asset Registration Verification

To confirm that a foreign asset has been successfully accepted and registered on the Asset Hub parachain, you can navigate to the `Network > Explorer` section of the Polkadot.js Apps interface for Asset Hub. You should be able to see an event that includes the following details:

![Asset registration event](/images/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-assets/register-a-foreign-asset-6.webp)

In the image above, the **success** field indicates whether the asset registration was successful.

## Test Environment Setup

To test the foreign asset registration process before deploying it on a live network, you can set up a local parachain environment. This guide uses Chopsticks to simulate that process. For more information on using Chopsticks, please refer to the [Chopsticks documentation](/develop/toolkit/parachains/fork-chains/chopsticks/get-started){target=\_blank}.

To set up a test environment, run the following command:

```bash
npx @acala-network/chopsticks xcm \
--r polkadot \
--p polkadot-asset-hub \
--p astar
```

The preceding command will create a lazy fork of Polkadot as the relay chain, its Asset Hub instance, and the Astar parachain. The `xcm` parameter enables communication through the XCMP protocol between the relay chain and the parachains, allowing the registration of foreign assets on Asset Hub. For further information on the chopsticks usage of the XCMP protocol, refer to the [XCM Testing](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} section of the Chopsticks documentation.

After executing the command, the terminal will display output indicating the Polkadot relay chain, the Polkadot Asset Hub, and the Astar parachain are running locally and connected through XCM. You can access them individually via the Polkadot.js Apps interface.

- [Polkadot Relay Chain](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Flocalhost%3A8002#/explorer){target=\_blank}
- [Polkadot Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Flocalhost%3A8000#/explorer){target=\_blank}
- [Astar Parachain](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Flocalhost%3A8001#/explorer){target=\_blank}
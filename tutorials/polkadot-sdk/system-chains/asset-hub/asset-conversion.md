---
title: Convert Assets on Asset Hub
description: A guide detailing the step-by-step process of converting assets on Asset Hub, helping users efficiently navigate asset management on the platform.
---

# Convert Assets on Asset Hub

## Introduction

Asset Conversion is an Automated Market Maker (AMM) utilizing [Uniswap V2](https://github.com/Uniswap/v2-core){target=\_blank} logic and implemented as a pallet on Polkadot's Asset Hub. For more details about this feature, please visit the [Asset Conversion on Asset Hub](https://wiki.polkadot.network/docs/learn-asset-conversion-assethub){target=\_blank} wiki page.

This guide will provide detailed information about the key functionalities offered by the [Asset Conversion](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame/asset-conversion){target=\_blank} pallet on Asset Hub, including:

- Creating a liquidity pool
- Adding liquidity to a pool
- Swapping assets
- Withdrawing liquidity from a pool

## Prerequisites

Before converting assets on Asset Hub, you must ensure you have:

- Access to the [Polkadot.js Apps](https://polkadot.js.org/apps){target=\_blank} interface and a connection with the intended blockchain
- A funded wallet containing the assets you wish to convert and enough available funds to cover the transaction fees
- An asset registered on Asset Hub that you want to convert. If you haven't created an asset on Asset Hub yet, refer to the [Register a Local Asset](/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-asset/){target=\_blank} or [Register a Foreign Asset](/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-asset/){target=\_blank} documentation to create an asset.

## Create a Liquidity Pool

If an asset on Asset Hub does not have an existing liquidity pool, the first step is to create one.

The asset conversion pallet provides the `createPool` extrinsic to create a new liquidity pool, creating an empty liquidity pool and a new `LP token` asset.

!!! tip
    A testing token with the asset ID `1112` and the name `PPM` was created for this example.

As stated in the [Test Environment Setup](#test-environment-setup) section, this tutorial is based on the assumption that you have an instance of Polkadot Asset Hub running locally. Therefore, the demo liquidity pool will be created between DOT and PPM tokens. However, the same steps can be applied to any other asset on Asset Hub.

From the Asset Hub perspective, the Multilocation that identifies the PPM token is the following:

```javascript
{
  parents: 0,
  interior: {
    X2: [{ PalletInstance: 50 }, { GeneralIndex: 1112 }]
  }
}
```

The `PalletInstance` value of `50` represents the Assets pallet on Asset Hub. The `GeneralIndex` value of `1112` is the PPM asset's asset ID.

To create the liquidity pool, you can follow these steps:

1. Navigate to the **Extrinsics** section on the Polkadot.js Apps interface
    1. Select **Developer** from the top menu
    2. Click on **Extrinsics** from the dropdown menu

    ![Extrinsics Section](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-1.webp)

2. Choose the **`AssetConversion`** pallet and click on the **`createPool`** extrinsic
    1. Select the **`AssetConversion`** pallet
    2. Choose the **`createPool`** extrinsic from the list of available extrinsics

    ![Create Pool Extrinsic](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-2.webp)

3. Fill in the required fields:
    1. **`asset1`** - the Multilocation of the first asset in the pool. In this case, it is the DOT token, which the following Multilocation represents:

        ```javascript
        {
          parents: 0,
          interior: 'Here'
        }
        ```

    2. **`asset2`** - the second asset's Multilocation within the pool. This refers to the PPM token, which the following Multilocation identifies:  

        ```javascript
        {
          parents: 0,
          interior: {
            X2: [{ PalletInstance: 50 }, { GeneralIndex: 1112 }]
          }
        }
        ```

    3. Click on **Submit Transaction** to create the liquidity pool

    ![Create Pool Fields](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-3.webp)

Signing and submitting the transaction triggers the creation of the liquidity pool. To verify the new pool's creation, check the **Explorer** section on the Polkadot.js Apps interface and ensure that the **`PoolCreated`** event was emitted.

![Pool Created Event](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-4.webp)

As the preceding image shows, the **`lpToken`** ID created for this pool is 19. This ID is essential to identify the liquidity pool and associated LP tokens.

## Add Liquidity to a Pool

The `addLiquidity` extrinsic allows users to provide liquidity to a pool of two assets. Users specify their preferred amounts for both assets and minimum acceptable quantities. The function determines the best asset contribution, which may vary from the amounts desired but won't fall below the specified minimums. Providers receive liquidity tokens representing their pool portion in return for their contribution.

To add liquidity to a pool, follow these steps:

1. Navigate to the **Extrinsics** section on the Polkadot.js Apps interface
    1. Select **Developer** from the top menu
    2. Click on **Extrinsics** from the dropdown menu

    ![Extrinsics Section](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-1.webp)

2. Choose the **`assetConversion`** pallet and click on the **`addLiquidity`** extrinsic
    1. Select the **`assetConversion`** pallet
    2. Choose the **`addLiquidity`** extrinsic from the list of available extrinsics

    ![Add Liquidity Extrinsic](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-5.webp)

3. Fill in the required fields:
    1. **`asset1`** - the Multilocation of the first asset in the pool. In this case, it is the DOT token, which the following Multilocation represents:

        ```javascript
        {
          parents: 0,
          interior: 'Here'
        }
        ```

    2. **`asset2`** - the second asset's Multilocation within the pool. This refers to the PPM token, which the following Multilocation identifies:

        ```javascript
        {
          parents: 0,
          interior: {
            X2: [{ PalletInstance: 50 }, { GeneralIndex: 1112 }]
          }
        }
        ```

    3. **`amount1Desired`** - the amount of the first asset that will be contributed to the pool
    4. **`amount2Desired`** - the quantity of the second asset intended for pool contribution
    5. **`amount1Min`** - the minimum amount of the first asset that will be contributed
    6. **`amount2Min`** - the lowest acceptable quantity of the second asset for contribution
    7. **`mintTo`** - the account to which the liquidity tokens will be minted
    8. Click on **Submit Transaction** to add liquidity to the pool

    ![Add Liquidity Fields](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-6.webp)

    !!! warning
        Ensure that the appropriate amount of tokens provided has been minted previously and is available in your account before adding liquidity to the pool.

    In this case, the liquidity provided to the pool is between DOT tokens and PPM tokens with the asset ID 1112 on Polkadot Asset Hub. The intention is to provide liquidity for 1 DOT token (`u128` value of 1000000000000 as it has 10 decimals) and 1 PPM token (`u128` value of 1000000000000 as it also has 10 decimals).

Signing and submitting the transaction adds liquidity to the pool. To verify the liquidity addition, check the **Explorer** section on the Polkadot.js Apps interface and ensure that the **`LiquidityAdded`** event was emitted.

![Liquidity Added Event](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-7.webp)

## Swap Assets

### Swap from an Exact Amount of Tokens

The asset conversion pallet enables users to exchange a specific quantity of one asset for another in a designated liquidity pool by swapping them for an exact amount of tokens. It guarantees the user will receive at least a predetermined minimum amount of the second asset. This function increases trading predictability and allows users to conduct asset exchanges with confidence that they are assured a minimum return.

To swap assets for an exact amount of tokens, follow these steps:

1. Navigate to the **Extrinsics** section on the Polkadot.js Apps interface
    1. Select **Developer** from the top menu
    2. Click on **Extrinsics** from the dropdown menu

    ![Extrinsics Section](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-1.webp)

2. Choose the **`AssetConversion`** pallet and click on the **`swapExactTokensForTokens`** extrinsic
    1. Select the **`AssetConversion`** pallet
    2. Choose the **`swapExactTokensForTokens`** extrinsic from the list of available extrinsics

    ![Swap From Exact Tokens Extrinsic](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-8.webp)

3. Fill in the required fields:
    1. **`path:Vec<StagingXcmV3MultiLocation>`** - an array of Multilocations representing the path of the swap. The first and last elements of the array are the input and output assets, respectively. In this case, the path consists of two elements:

        - **`0: StagingXcmV3MultiLocation`** - the Multilocation of the first asset in the pool. In this case, it is the DOT token, which the following Multilocation represents:

            ```javascript
            {
              parents: 0,
              interior: 'Here'
            }
            ```

        - **`1: StagingXcmV3MultiLocation`** - the second asset's Multilocation within the pool. This refers to the PPM token, which the following Multilocation identifies:

            ```javascript
            {
              parents: 0,
              interior: {
                X2: [{ PalletInstance: 50 }, { GeneralIndex: 1112 }]
              }
            }
            ```

    2. **`amountOut`** - the exact amount of the second asset that the user wants to receive
    3. **`amountInMax`** - the maximum amount of the first asset that the user is willing to swap
    4. **`sendTo`** - the account to which the swapped assets will be sent
    5. **`keepAlive`** - a boolean value that determines whether the pool should be kept alive after the swap
    6. Click on **Submit Transaction** to swap assets for an exact amount of tokens

    ![Swap For Exact Tokens Fields](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-9.webp)

    !!! warning
        Ensure that the appropriate amount of tokens provided has been minted previously and is available in your account before adding liquidity to the pool.

    In this case, the intention is to swap 0.01 DOT token (u128 value of 100000000000 as it has 10 decimals) for 0.04 PPM token (u128 value of 400000000000 as it also has 10 decimals).

Signing and submitting the transaction will execute the swap. To verify execution, check the **Explorer** section on the Polkadot.js Apps interface and make sure that the **`SwapExecuted`** event was emitted.

![Swap From Exact Tokens Event](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-10.webp)

### Swap to an Exact Amount of Tokens

Conversely, the Asset Conversion pallet comes with a function that allows users to trade a variable amount of one asset to acquire a precise quantity of another. It ensures that users stay within a set maximum of the initial asset to obtain the desired amount of the second asset. This provides a method to control transaction costs while achieving the intended result.

To swap assets for an exact amount of tokens, follow these steps:

1. Navigate to the **Extrinsics** section on the Polkadot.js Apps interface
    1. Select **Developer** from the top menu
    2. Click on **Extrinsics** from the dropdown menu

    ![Extrinsics Section](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-1.webp)

2. Choose the **`AssetConversion`** pallet and click on the **`swapTokensForExactTokens`** extrinsic:
    1. Select the **`AssetConversion`** pallet
    2. Choose the **`swapTokensForExactTokens`** extrinsic from the list of available extrinsics

    ![Swap Tokens For Exact Tokens Extrinsic](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-11.webp)

3. Fill in the required fields:
    1. **`path:Vec<StagingXcmV3MultiLocation\>`** - an array of Multilocations representing the path of the swap. The first and last elements of the array are the input and output assets, respectively. In this case, the path consists of two elements:
        - **`0: StagingXcmV3MultiLocation`** - the Multilocation of the first asset in the pool. In this case, it is the PPM token, which the following Multilocation represents:

            ```javascript
            {
              parents: 0,
              interior: {
                X2: [{ PalletInstance: 50 }, { GeneralIndex: 1112 }]
              }
            }
            ```

        - **`1: StagingXcmV3MultiLocation`** - the second asset's Multilocation within the pool. This refers to the DOT token, which the following Multilocation identifies:

            ```javascript
            {
              parents: 0,
              interior: 'Here'
            }
            ```

    2. **`amountOut`** - the exact amount of the second asset that the user wants to receive
    3. **`amountInMax`** - the maximum amount of the first asset that the user is willing to swap
    4. **`sendTo`** - the account to which the swapped assets will be sent
    5. **`keepAlive`** - a boolean value that determines whether the pool should be kept alive after the swap
    6. Click on **Submit Transaction** to swap assets for an exact amount of tokens

    ![Swap Tokens For Exact Tokens Fields](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-12.webp)

    !!! warning
        Before swapping assets, ensure that the tokens provided have been minted previously and are available in your account.

    In this case, the intention is to swap 0.01 DOT token (`u128` value of 100000000000 as it has ten decimals) for 0.04 PPM token (`u128` value of 400000000000 as it also has ten decimals).

Signing and submitting the transaction will execute the swap. To verify execution, check the **Explorer** section on the Polkadot.js Apps interface and make sure that the **`SwapExecuted`** event was emitted.

![Swap Tokens For Exact Tokens Event](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-13.webp)

## Withdraw Liquidity from a Pool

The Asset Conversion pallet provides the `removeLiquidity` extrinsic to remove liquidity from a pool. This function allows users to withdraw the liquidity they offered from a pool, returning the original assets. When calling this function, users specify the number of liquidity tokens (representing their share in the pool) they wish to burn. They also set minimum acceptable amounts for the assets they expect to receive back. This mechanism ensures that users can control the minimum value they receive, protecting against unfavorable price movements during the withdrawal process.

To withdraw liquidity from a pool, follow these steps:

1. Navigate to the **Extrinsics** section on the Polkadot.js Apps interface
    1. Select **Developer** from the top menu
    2. Click on **Extrinsics** from the dropdown menu

    ![Extrinsics Section](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-1.webp)

2. Choose the **`AssetConversion`** pallet and click on the **`remove_liquidity`** extrinsic
    1. Select the **`AssetConversion`** pallet
    2. Choose the **`removeLiquidity`** extrinsic from the list of available extrinsics

    ![Remove Liquidity Extrinsic](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-14.webp)

3. Fill in the required fields:
    1. **`asset1`** - the Multilocation of the first asset in the pool. In this case, it is the DOT token, which the following Multilocation represents:

        ```javascript
        {
          parents: 0,
          interior: 'Here'
        }
        ```

    2. **`asset2`** - the second asset's Multilocation within the pool. This refers to the PPM token, which the following Multilocation identifies:

        ```javascript
        {
          parents: 0,
          interior: {
            X2: [{ PalletInstance: 50 }, { GeneralIndex: 1112 }]
          }
        }
        ```

    3. **`lpTokenBurn`** - the number of liquidity tokens to burn
    4. **`amount1MinReceived`** - the minimum amount of the first asset that the user expects to receive
    5. **`amount2MinReceived`** - the minimum quantity of the second asset the user expects to receive
    6. **`withdrawTo`** - the account to which the withdrawn assets will be sent
    7. Click on **Submit Transaction** to withdraw liquidity from the pool

    ![Remove Liquidity Fields](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-15.webp)

    !!! warning
        Ensure that the tokens provided have been minted previously and are available in your account before withdrawing liquidity from the pool.

    In this case, the intention is to withdraw 0.05 liquidity tokens from the pool, expecting to receive 0.004 DOT token (`u128` value of 40000000000 as it has 10 decimals) and 0.04 PPM token (`u128` value of 400000000000 as it also has 10 decimals).

Signing and submitting the transaction will initiate the withdrawal of liquidity from the pool. To verify the withdrawal, check the **Explorer** section on the Polkadot.js Apps interface and ensure that the **`LiquidityRemoved`** event was emitted.

![Remove Liquidity Event](/images/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/asset-conversion-16.webp)

## Test Environment Setup

To test the Asset Conversion pallet, you can set up a local test environment to simulate different scenarios. This guide uses Chopsticks to spin up an instance of Polkadot Asset Hub. For further details on using Chopsticks, please refer to the [Chopsticks documentation](/develop/toolkit/parachains/fork-chains/chopsticks/get-started){target=\_blank}.

To set up a local test environment, execute the following command:

```bash
npx @acala-network/chopsticks \
--config=https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml
```

This command initiates a lazy fork of Polkadot Asset Hub, including the most recent block information from the network. For Kusama Asset Hub testing, simply switch out `polkadot-asset-hub.yml` with `kusama-asset-hub.yml` in the command.

You now have a local Asset Hub instance up and running, ready for you to test various asset conversion procedures. The process here mirrors what you'd do on MainNet. After completing a transaction on TestNet, you can apply the same steps to convert assets on MainNet.

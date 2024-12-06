---
title: XCM Transfers from Relay Chain to Parachain
description: Learn how to perform a reserve-backed asset transfer between a relay chain and a parachain using XCM for cross-chain interoperability.
---

# From Relay Chain to Parachain

## Introduction

[Cross-Consensus Messaging (XCM)](/develop/interoperability/intro-to-xcm/){target=\_blank} facilitates asset transfers both within the same consensus system and between different ones, such as between a relay chain and its parachains. For cross-system transfers, two main methods are available:

- [**Asset teleportation**](https://paritytech.github.io/xcm-docs/journey/transfers/teleports.html){target=\_blank} - a simple and efficient method involving only the source and destination chains, ideal for systems with a high level of trust
- [**Reserve-backed transfers**](https://paritytech.github.io/xcm-docs/journey/transfers/reserve.html){target=\_blank} - involves a trusted reserve holding real assets and mints derivative tokens to track ownership. This method is suited for systems with lower trust levels

In this tutorial, you will learn how to perform a reserve-backed transfer of DOT between a relay chain (Polkadot) and a parachain (Astar).

## Prerequisites

To send messages between different consensus systems, you must first open HRMP channels. For detailed guidance, refer to the [XCM Channels](/develop/interoperability/xcm-channels/#xcm-channels){target=\_blank} article before for further information about.

This tutorial uses Chopsticks to fork a relay chain and a parachain connected via HRMP channels. For more details on this setup, see the [XCM Testing](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} section on the Chopsticks page.

## Setup

To simulate XCM operations between different consensus systems, start by forking the network with the following command:

```bash
chopsticks xcm -r polkadot -p astar
```
After executing this command, the relay chain and parachain will expose the following WebSocket endpoints:

| Chain                  | WebSocket Endpoint                   |
|------------------------|--------------------------------------|
| Polkadot (relay chain) | <pre>```ws://localhost:8001```</pre> |
| Astar (parachain)      | <pre>```ws://localhost:8000```</pre> |

You can perform the reserve-backed transfer using either the [Polkadot.js Apps interface](#using-polkadotjs-apps) or the [Polkadot API](#using-papi), depending on your preference. Both methods provide the same functionality to facilitate asset transfers between the relay chain and parachain.

## Using Polkadot.js Apps

Open two browser tabs and can connect these endpoints using the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} interface:

a. Add the custom endpoint for each chain

b. Click **Switch** to connect to the respective network

![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-01.webp)


This reserve-backed transfer method facilitates asset transfers from a local chain to a destination chain by trusting a third party called a reserve to store the real assets. Fees on the destination chain are deducted from the asset specified in the assets vector at the `fee_asset_item` index, covering up to the specified `weight_limit.` The operation fails if the required weight exceeds this limit, potentially putting the transferred assets at risk.

!!! warning
    The [`reserve_transfer_assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.reserve_transfer_assets.html){target=\_blank} extrinsic is deprecated in favor of the [`limited_reserve_transfer_assets`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/dispatchables/fn.limited_reserve_transfer_assets.html){target=\_blank} extrinsic. 

The following steps outline how to execute a reserve-backed transfer from the Polkadot relay chain to the Astar parachain.

### From the Relay Chain Perspective

1. Navigate to the Extrinsics page
    1. Click on the **Developer** tab from the top navigation bar
    2. Select **Extrinsics** from the dropdown

    ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-02.webp)

2. Select **xcmPallet**

    ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-03.webp)

3. Select the **limitedReservedAssetTransfer** extrinsic from the dropdown list

    ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-04.webp)

4. Fill out the required fields
    1. **dest** - specifies the destination context for the assets. Commonly set to `[Parent, Parachain(..)]` for parachain-to-parachain transfers or `[Parachain(..)]` for relay chain-to-parachain transfers. In this case, since the transfer is from a relay chain to a parachain, the destination context is the following:

        ```bash
        { parents: 0, interior: { X1: [{ Parachain: 2006 }] } }
        ```

    2. **beneficiary** - defines the recipient of the assets within the destination context, typically represented as an `AccountId32` value. This example uses the following account present in the destination chain:

        ```bash
        X2mE9hCGX771c3zzV6tPa8U2cDz4U4zkqUdmBrQn83M3cm7
        ```

    3. **assets** - lists the assets to be withdrawn, including those designated for fee payment on the destination chain
    4. **feeAssetItem** - indicates the index of the asset within the assets list to be used for paying fees
    5. **weightLimit** - specifies the weight limit, if applicable, for the fee payment on the remote chain
    6. Click on the **Submit Transaction** button to send the transaction

        ![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-05.webp)

After submitting the transaction, verify that the `xcmPallet.FeesPaid` and `xcmPallet.Sent` events have been emitted:

![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-06.webp)

### From the Parachain Perspective

After submitting the transaction from the relay chain, confirm its success by checking the parachain's events. Look for the `assets.Issued` event, which verifies that the assets have been issued to the destination as expected:

![](/images/tutorials/interoperability/xcm-transfers/from-relaychain-to-parachain/from-relaychain-to-parachain-07.webp)

## Using PAPI

To programmatically execute the reserve-backed asset transfer between the relay chain and the parachain, you can use [Polkadot API (PAPI)](/develop/toolkit/api-libraries/papi.md){target=\_blank}. PAPI is a robust toolkit that simplifies interactions with Polkadot-based chains. For this project, you'll first need to set up your environment, install necessary dependencies, and create a script to handle the transfer process.

1. Start by creating a folder for your project
   ```bash
   mkdir reserve-backed-asset-transfer
   cd reserve-backed-asset
   ```

2. Initialize a Node.js project and install the required dependencies. Execute the following commands:

    ```bash
    npm init
    npm install polkadot-api @polkadot-labs/hdkd @polkadot-labs/hdkd-helpers
    ```

3. To enable static, type-safe APIs for interacting with the Polkadot and Astar chains, add their metadata to your project using PAPI

    ```bash
    npx papi add dot -n polkadot
    npx papi add astar -w wss://rpc.astar.network
    ```

    !!! note 
        - `dot` and `astar` are arbitrary names you assign to the chains, allowing you to access their metadata information
        - The first command uses the well-known Polkadot chain, while the second connects to the Astar chain using its WebSocket endpoint

4. Create a `index.js` file and insert the following code to configure the clients and handle the asset transfer

    ```js
    // Import necessary modules from Polkadot API and helpers
    import { 
        astar,  // Astar chain metadata
        dot,    // Polkadot chain metadata
        XcmVersionedLocation, 
        XcmVersionedAssets, 
        XcmV3Junction, 
        XcmV3Junctions, 
        XcmV3WeightLimit, 
        XcmV3MultiassetFungibility,
        XcmV3MultiassetAssetId
    } from "@polkadot-api/descriptors"
    import { createClient } from "polkadot-api"
    import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
    import { 
        DEV_PHRASE, 
        entropyToMiniSecret, 
        mnemonicToEntropy, 
        ss58Decode 
    } from "@polkadot-labs/hdkd-helpers"
    import { getPolkadotSigner } from "polkadot-api/signer"
    import { getWsProvider } from "polkadot-api/ws-provider/web";
    import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
    import { Binary } from "polkadot-api"

    // Create Polkadot client using WebSocket provider for Polkadot chain
    const polkadotClient = createClient(
    withPolkadotSdkCompat(getWsProvider("ws://127.0.0.1:8001"))
    );
    const dotApi = polkadotClient.getTypedApi(dot)

    // Create Astar client using WebSocket provider for Astar chain
    const astarClient = createClient(
    withPolkadotSdkCompat(getWsProvider("ws://localhost:8000"))
    );
    const astarApi = astarClient.getTypedApi(astar)

    // Create keypair for Alice using dev phrase to sign transactions
    const miniSecret = entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE))
    const derive = sr25519CreateDerive(miniSecret)
    const aliceKeyPair = derive("//Alice")
    const alice = getPolkadotSigner(
    aliceKeyPair.publicKey,
    "Sr25519",
    aliceKeyPair.sign
    )

    // Define recipient (Dave) address on Astar chain
    const daveAddress = "X2mE9hCGX771c3zzV6tPa8U2cDz4U4zkqUdmBrQn83M3cm7"
    const davePublicKey = ss58Decode(daveAddress)[0]
    const idBenef = Binary.fromBytes(davePublicKey)

    // Define Polkadot Asset ID on Astar chain (example)
    const polkadotAssetId = 340282366920938463463374607431768211455n;

    // Fetch asset balance of recipient (Dave) before transaction
    let assetMetadata = await astarApi.query.Assets.Account.getValue(polkadotAssetId, daveAddress);
    console.log("Asset balance before tx:", assetMetadata?.balance ?? 0);

    // Prepare and submit transaction to transfer assets from Polkadot to Astar
    const tx = dotApi.tx.XcmPallet.limited_reserve_transfer_assets({
        dest: XcmVersionedLocation.V3({
            parents: 0,
            interior: XcmV3Junctions.X1(
                XcmV3Junction.Parachain(2006)  // Destination is the Astar parachain
            )
        }),
        beneficiary: XcmVersionedLocation.V3({
            parents: 0,
            interior: XcmV3Junctions.X1(
                XcmV3Junction.AccountId32({  // Beneficiary address on Astar
                    network: undefined,
                    id: idBenef
                })
            )
        }),
        assets: XcmVersionedAssets.V3([
            {
                id: XcmV3MultiassetAssetId.Concrete({
                    parents: 0,
                    interior: XcmV3Junctions.Here()  // Asset from the sender's location
                }),
                fun: XcmV3MultiassetFungibility.Fungible(120000000000)  // Asset amount to transfer
            },
        ]),
        fee_asset_item: 0,  // Asset used to pay transaction fees
        weight_limit: XcmV3WeightLimit.Unlimited(),  // No weight limit on transaction
    });

    // Sign and submit the transaction
    tx.signSubmitAndWatch(alice).subscribe({
        next: async (event) => {
            if (event.type === "finalized") {
                console.log("Transaction completed successfully");
            }
        },
        error: console.error,
        complete() {
            polkadotClient.destroy();  // Clean up after transaction
        },
    });

    // Wait for transaction to complete
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Fetch asset balance of recipient (Dave) after transaction
    assetMetadata = await astarApi.query.Assets.Account.getValue(polkadotAssetId, daveAddress);
    console.log("Asset balance after tx:", assetMetadata?.balance ?? 0);

    // Exit the process
    process.exit(0);
    ```

4. Execute the script 

    ```bash 
    node index.js
    ```

5. Check the terminal output. If the operation is successful, you should see the following message:

    <div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>node index.js</span>
    <span data-ty> Asset balance before tx: 0</span>
    <span data-ty> Transaction completed successfully</span>
    <span data-ty> Asset balance after tx: 119999114907n</span>
    </div>

## Additional Resources

You can perform these operations using the Asset Transfer API for an alternative approach. Refer to the [Asset Transfer API](/develop/toolkit/interoperability/asset-transfer-api/){target=\_blank} guide in the documentation for more details.
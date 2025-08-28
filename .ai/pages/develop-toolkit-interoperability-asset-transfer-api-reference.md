---
title: Asset Transfer API Reference
...
description: Explore the Asset Transfer API Reference for comprehensive details on methods, data
  types, and functionalities. Essential for cross-chain asset transfers.
...
categories: Reference, Dapps
...
url: https://docs.polkadot.com/develop/toolkit/interoperability/asset-transfer-api/reference/
...
---

# Asset Transfer API Reference

<br>
<div class="grid cards" markdown>
-   :octicons-download-16:{ .lg .middle } __Install the Asset Transfer API__

    ---

    Learn how to install [`asset-transfer-api`](https://github.com/paritytech/asset-transfer-api){target=\_blank} into a new or existing project.

    <br>
    [:octicons-arrow-right-24: Get started](/develop/toolkit/interoperability/asset-transfer-api/overview/#install-asset-transfer-api){target=\_blank}

-   :octicons-code-16:{ .lg .middle } __Dive in with a tutorial__

    ---

    Ready to start coding? Follow along with a step-by-step tutorial.

    <br>
    [:octicons-arrow-right-24: How to use the Asset Transfer API](/develop/toolkit/interoperability/asset-transfer-api/overview/#examples)
</div>
<br>


## Asset Transfer API Class

Holds open an API connection to a specified chain within the `ApiPromise` to help construct transactions for assets and estimate fees.

For a more in-depth explanation of the Asset Transfer API class structure, check the [source code](https://github.com/paritytech/asset-transfer-api/blob/v1.0.0/src/AssetTransferApi.ts#L128){target=\_blank}.

### Methods

#### Create Transfer Transaction

Generates an XCM transaction for transferring assets between chains. It simplifies the process by inferring what type of transaction is required given the inputs, ensuring that the assets are valid, and that the transaction details are correctly formatted.

After obtaining the transaction, you must handle the signing and submission process separately.

```ts
-public async createTransferTransaction<T extends Format>(
		destChainId: string,
		destAddr: string,
		assetIds: string[],
		amounts: string[],
		opts: TransferArgsOpts<T> = {},
	): Promise<TxResult<T>> {
```

??? interface "Request parameters"

    `destChainId` ++"string"++ <span class="required" markdown>++"required"++</span>
    
    ID of the destination chain (`'0'` for relay chain, other values for parachains).

    ---

    `destAddr` ++"string"++ <span class="required" markdown>++"required"++</span>

    Address of the recipient account on the destination chain.

    ---

    `assetIds` ++"string[]"++ <span class="required" markdown>++"required"++</span>

    Array of asset IDs to be transferred.

    When asset IDs are provided, the API dynamically selects the appropriate pallet for the current chain to handle these specific assets. If the array is empty, the API defaults to using the `balances` pallet.

    ---

    `amounts` ++"string[]"++ <span class="required" markdown>++"required"++</span>

    Array of amounts corresponding to each asset in `assetIds`.

    ---

    `opts` ++"TransferArgsOpts<T>"++

    -Options for customizing the claim assets transaction. These options allow you to specify the transaction format, fee payment details, weight limits, XCM versions, and more.

??? child "Show more"

    `format` ++"T extends Format"++ 
        
    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        -export type Format = 'payload' | 'call' | 'submittable';
        ```

    ---

    `paysWithFeeOrigin` ++"string"++
    
    The Asset ID to pay fees on the current common good parachain. The defaults are as follows:

    - **Polkadot Asset Hub**: `'DOT'`
    - **Kusama Asset Hub**: `'KSM'`

    ---

    `paysWithFeeDest` ++"string"++
    
    Asset ID to pay fees on the destination parachain.

    ---

    `weightLimit` ++"{ refTime?: string, proofSize?: string }"++
    
    Custom weight limit option. If not provided, it will default to unlimited.

    ---

    `xcmVersion` ++"number"++
    
    Sets the XCM version for message construction. If this is not present a supported version will be queried, and if there is no supported version a safe version will be queried.

    ---

    `keepAlive` ++"boolean"++
    
    Enables `transferKeepAlive` for local asset transfers. For creating local asset transfers, if `true` this will allow for a `transferKeepAlive` as opposed to a `transfer`.

    ---

    `transferLiquidToken` ++"boolean"++
    
    Declares if this will transfer liquidity tokens. Default is `false`.

    ---

    `assetTransferType` ++"string"++
    
    The XCM transfer type used to transfer assets. The `AssetTransferType` type defines the possible values for this parameter.

    ??? child "Type `AssetTransferType`"

        ```ts
        -export type AssetTransferType = LocalReserve | DestinationReserve | Teleport | RemoteReserve;
        ```
        
        !!! note
            To use the `assetTransferType` parameter, which is a string, you should use the `AssetTransferType` type as if each of its variants are strings. For example: `assetTransferType = 'LocalReserve'`.


    ---

    `remoteReserveAssetTransferTypeLocation` ++"string"++
    
    The remove reserve location for the XCM transfer. Should be provided when specifying an `assetTransferType` of `RemoteReserve`.

    ---

    `feesTransferType` ++"string"++
    
    XCM TransferType used to pay fees for XCM transfer. The `AssetTransferType` type defines the possible values for this parameter.

    ??? child "Type `AssetTransferType`"

        ```ts
        -export type AssetTransferType = LocalReserve | DestinationReserve | Teleport | RemoteReserve;
        ```
        
        !!! note
            To use the `feesTransferType` parameter, which is a string, you should use the `AssetTransferType` type as if each of its variants are strings. For example: `feesTransferType = 'LocalReserve'`.

    ---

    `remoteReserveFeesTransferTypeLocation` ++"string"++
    
    The remote reserve location for the XCM transfer fees. Should be provided when specifying a `feesTransferType` of `RemoteReserve`.

    ---

    `customXcmOnDest` ++"string"++
    
    A custom XCM message to be executed on the destination chain. Should be provided if a custom XCM message is needed after transferring assets. Defaults to:

    ```bash
    Xcm(vec![DepositAsset { assets: Wild(AllCounted(assets.len())), beneficiary }])
    ```


??? interface "Response parameters"

    ++"Promise<TxResult<T>"++

    -A promise containing the result of constructing the transaction.

??? child "Show more"

    `dest` ++"string"++

    The destination `specName` of the transaction.

    ---

    `origin` ++"string"++

    The origin `specName` of the transaction.

    ---

    `format` ++"Format | 'local'"++

    The format type the transaction is outputted in.

    ??? child "Type `Format`"

        ```ts
        -export type Format = 'payload' | 'call' | 'submittable';
        ```

    ---

    `xcmVersion` ++"number | null"++

    The XCM version that was used to construct the transaction.

    ---

    `direction` ++"Direction | 'local'"++

    The direction of the cross-chain transfer.

    ??? child "Enum `Direction` values"

        `Local`

        Local transaction.

        ---

        `SystemToPara`

        System parachain to parachain.

        ---

        `SystemToRelay`

        System paracahin to system relay chain.

        ---

        `SystemToSystem`

        System parachain to System parachain chain.

        ---

        `SystemToBridge`

        System parachain to an external `GlobalConsensus` chain.
        
        ---

        `ParaToPara`

        Parachain to Parachain.

        ---

        `ParaToRelay`

        Parachain to Relay chain.

        ---
        
        `ParaToSystem`

        Parachain to System parachain.

        ---

        `RelayToSystem`

        Relay to System Parachain.

        ---

        `RelayToPara`

        Relay chain to Parachain.

        ---

        `RelayToBridge`

        Relay chain to an external `GlobalConsensus` chain.

    `method` ++"Methods"++

    The method used in the transaction.

    ??? child "Type `Methods`"

        ```ts
        -export type Methods =
	| LocalTransferTypes
	| 'transferAssets'
	| 'transferAssetsUsingTypeAndThen'
	| 'limitedReserveTransferAssets'
	| 'limitedTeleportAssets'
	| 'transferMultiasset'
	| 'transferMultiassets'
	| 'transferMultiassetWithFee'
	| 'claimAssets';
        ```

        ??? child "Type `LocalTransferTypes`"


            ```ts
            -export type LocalTransferTypes =
	| 'assets::transfer'
	| 'assets::transferKeepAlive'
	| 'assets::transferAll'
	| 'foreignAssets::transfer'
	| 'foreignAssets::transferKeepAlive'
	| 'foreignAssets::transferAll'
	| 'balances::transfer'
	| 'balances::transferKeepAlive'
	| 'balances::transferAll'
	| 'poolAssets::transfer'
	| 'poolAssets::transferKeepAlive'
	| 'poolAssets::transferAll'
	| 'tokens::transfer'
	| 'tokens::transferKeepAlive'
	| 'tokens::transferAll';
            ```

    ---

    `tx` ++"ConstructedFormat<T>"++

    The constructed transaction.

    ??? child "Type `ConstructedFormat<T>`"

        ```ts
        -export type ConstructedFormat<T> = T extends 'payload'
	? GenericExtrinsicPayload
	: T extends 'call'
		? `0x${string}`
		: T extends 'submittable'
			? SubmittableExtrinsic<'promise', ISubmittableResult>
			: never;
        ```

        The `ConstructedFormat` type is a conditional type that returns a specific type based on the value of the TxResult `format` field.

        - **Payload format**: If the format field is set to `'payload'`, the `ConstructedFormat` type will return a [`GenericExtrinsicPayload`](https://github.com/polkadot-js/api/blob/v15.8.1/packages/types/src/extrinsic/ExtrinsicPayload.ts#L87){target=\_blank}.
        - **Call format**: If the format field is set to `'call'`, the `ConstructedFormat` type will return a hexadecimal string (`0x${string}`). This is the encoded representation of the extrinsic call.
        - **Submittable format**: If the format field is set to `'submittable'`, the `ConstructedFormat` type will return a [`SubmittableExtrinsic`](https://github.com/polkadot-js/api/blob/v15.8.1/packages/api-base/src/types/submittable.ts#L56){target=\_blank}. This is a Polkadot.js type that represents a transaction that can be submitted to the blockchain.


??? interface "Example"

    ***Request***

    ```ts
    -import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://wss.api.moonbeam.network',
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  let callInfo;
  try {
    callInfo = await assetsApi.createTransferTransaction(
      '2004',
      '0xF977814e90dA44bFA03b6295A0616a897441aceC',
      [],
      ['1000000000000000000'],
      {
        format: 'call',
        keepAlive: true,
      },
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

    ```

    ***Response***

    -<div id="termynal" data-termynal>
    <span data-ty>Call data:</span>
    <span data-ty>{</span>
    <span data-ty>    "origin": "moonbeam",</span>
    <span data-ty>    "dest": "moonbeam",</span>
    <span data-ty>    "direction": "local",</span>
    <span data-ty>    "xcmVersion": null,</span>
    <span data-ty>    "method": "balances::transferKeepAlive",</span>
    <span data-ty>    "format": "call",</span>
    <span data-ty>    "tx": "0x0a03f977814e90da44bfa03b6295a0616a897441acec821a0600"</span>
    <span data-ty>}</span>
<div>

#### Claim Assets

Creates a local XCM transaction to retrieve trapped assets. This function can be used to claim assets either locally on a system parachain, on the relay chain, or on any chain that supports the `claimAssets` runtime call.


```ts
-public async claimAssets<T extends Format>(
		assetIds: string[],
		amounts: string[],
		beneficiary: string,
		opts: TransferArgsOpts<T>,
	): Promise<TxResult<T>> {
```

??? interface "Request parameters"

    `assetIds` ++"string[]"++ <span class="required" markdown>++"required"++</span>

    Array of asset IDs to be claimed from the `AssetTrap`.

    ---

    `amounts` ++"string[]"++ <span class="required" markdown>++"required"++</span>

    Array of amounts corresponding to each asset in `assetIds`.

    ---

    `beneficiary` ++"string"++ <span class="required" markdown>++"required"++</span>

    Address of the account to receive the trapped assets.

    ---

    `opts` ++"TransferArgsOpts<T>"++

    -Options for customizing the claim assets transaction. These options allow you to specify the transaction format, fee payment details, weight limits, XCM versions, and more.

??? child "Show more"

    `format` ++"T extends Format"++ 
        
    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        -export type Format = 'payload' | 'call' | 'submittable';
        ```

    ---

    `paysWithFeeOrigin` ++"string"++
    
    The Asset ID to pay fees on the current common good parachain. The defaults are as follows:

    - **Polkadot Asset Hub**: `'DOT'`
    - **Kusama Asset Hub**: `'KSM'`

    ---

    `paysWithFeeDest` ++"string"++
    
    Asset ID to pay fees on the destination parachain.

    ---

    `weightLimit` ++"{ refTime?: string, proofSize?: string }"++
    
    Custom weight limit option. If not provided, it will default to unlimited.

    ---

    `xcmVersion` ++"number"++
    
    Sets the XCM version for message construction. If this is not present a supported version will be queried, and if there is no supported version a safe version will be queried.

    ---

    `keepAlive` ++"boolean"++
    
    Enables `transferKeepAlive` for local asset transfers. For creating local asset transfers, if `true` this will allow for a `transferKeepAlive` as opposed to a `transfer`.

    ---

    `transferLiquidToken` ++"boolean"++
    
    Declares if this will transfer liquidity tokens. Default is `false`.

    ---

    `assetTransferType` ++"string"++
    
    The XCM transfer type used to transfer assets. The `AssetTransferType` type defines the possible values for this parameter.

    ??? child "Type `AssetTransferType`"

        ```ts
        -export type AssetTransferType = LocalReserve | DestinationReserve | Teleport | RemoteReserve;
        ```
        
        !!! note
            To use the `assetTransferType` parameter, which is a string, you should use the `AssetTransferType` type as if each of its variants are strings. For example: `assetTransferType = 'LocalReserve'`.


    ---

    `remoteReserveAssetTransferTypeLocation` ++"string"++
    
    The remove reserve location for the XCM transfer. Should be provided when specifying an `assetTransferType` of `RemoteReserve`.

    ---

    `feesTransferType` ++"string"++
    
    XCM TransferType used to pay fees for XCM transfer. The `AssetTransferType` type defines the possible values for this parameter.

    ??? child "Type `AssetTransferType`"

        ```ts
        -export type AssetTransferType = LocalReserve | DestinationReserve | Teleport | RemoteReserve;
        ```
        
        !!! note
            To use the `feesTransferType` parameter, which is a string, you should use the `AssetTransferType` type as if each of its variants are strings. For example: `feesTransferType = 'LocalReserve'`.

    ---

    `remoteReserveFeesTransferTypeLocation` ++"string"++
    
    The remote reserve location for the XCM transfer fees. Should be provided when specifying a `feesTransferType` of `RemoteReserve`.

    ---

    `customXcmOnDest` ++"string"++
    
    A custom XCM message to be executed on the destination chain. Should be provided if a custom XCM message is needed after transferring assets. Defaults to:

    ```bash
    Xcm(vec![DepositAsset { assets: Wild(AllCounted(assets.len())), beneficiary }])
    ```


??? interface "Response parameters"

    ++"Promise<TxResult<T>>"++

    -A promise containing the result of constructing the transaction.

??? child "Show more"

    `dest` ++"string"++

    The destination `specName` of the transaction.

    ---

    `origin` ++"string"++

    The origin `specName` of the transaction.

    ---

    `format` ++"Format | 'local'"++

    The format type the transaction is outputted in.

    ??? child "Type `Format`"

        ```ts
        -export type Format = 'payload' | 'call' | 'submittable';
        ```

    ---

    `xcmVersion` ++"number | null"++

    The XCM version that was used to construct the transaction.

    ---

    `direction` ++"Direction | 'local'"++

    The direction of the cross-chain transfer.

    ??? child "Enum `Direction` values"

        `Local`

        Local transaction.

        ---

        `SystemToPara`

        System parachain to parachain.

        ---

        `SystemToRelay`

        System paracahin to system relay chain.

        ---

        `SystemToSystem`

        System parachain to System parachain chain.

        ---

        `SystemToBridge`

        System parachain to an external `GlobalConsensus` chain.
        
        ---

        `ParaToPara`

        Parachain to Parachain.

        ---

        `ParaToRelay`

        Parachain to Relay chain.

        ---
        
        `ParaToSystem`

        Parachain to System parachain.

        ---

        `RelayToSystem`

        Relay to System Parachain.

        ---

        `RelayToPara`

        Relay chain to Parachain.

        ---

        `RelayToBridge`

        Relay chain to an external `GlobalConsensus` chain.

    `method` ++"Methods"++

    The method used in the transaction.

    ??? child "Type `Methods`"

        ```ts
        -export type Methods =
	| LocalTransferTypes
	| 'transferAssets'
	| 'transferAssetsUsingTypeAndThen'
	| 'limitedReserveTransferAssets'
	| 'limitedTeleportAssets'
	| 'transferMultiasset'
	| 'transferMultiassets'
	| 'transferMultiassetWithFee'
	| 'claimAssets';
        ```

        ??? child "Type `LocalTransferTypes`"


            ```ts
            -export type LocalTransferTypes =
	| 'assets::transfer'
	| 'assets::transferKeepAlive'
	| 'assets::transferAll'
	| 'foreignAssets::transfer'
	| 'foreignAssets::transferKeepAlive'
	| 'foreignAssets::transferAll'
	| 'balances::transfer'
	| 'balances::transferKeepAlive'
	| 'balances::transferAll'
	| 'poolAssets::transfer'
	| 'poolAssets::transferKeepAlive'
	| 'poolAssets::transferAll'
	| 'tokens::transfer'
	| 'tokens::transferKeepAlive'
	| 'tokens::transferAll';
            ```

    ---

    `tx` ++"ConstructedFormat<T>"++

    The constructed transaction.

    ??? child "Type `ConstructedFormat<T>`"

        ```ts
        -export type ConstructedFormat<T> = T extends 'payload'
	? GenericExtrinsicPayload
	: T extends 'call'
		? `0x${string}`
		: T extends 'submittable'
			? SubmittableExtrinsic<'promise', ISubmittableResult>
			: never;
        ```

        The `ConstructedFormat` type is a conditional type that returns a specific type based on the value of the TxResult `format` field.

        - **Payload format**: If the format field is set to `'payload'`, the `ConstructedFormat` type will return a [`GenericExtrinsicPayload`](https://github.com/polkadot-js/api/blob/v15.8.1/packages/types/src/extrinsic/ExtrinsicPayload.ts#L87){target=\_blank}.
        - **Call format**: If the format field is set to `'call'`, the `ConstructedFormat` type will return a hexadecimal string (`0x${string}`). This is the encoded representation of the extrinsic call.
        - **Submittable format**: If the format field is set to `'submittable'`, the `ConstructedFormat` type will return a [`SubmittableExtrinsic`](https://github.com/polkadot-js/api/blob/v15.8.1/packages/api-base/src/types/submittable.ts#L56){target=\_blank}. This is a Polkadot.js type that represents a transaction that can be submitted to the blockchain.


??? interface "Example"

    ***Request***

    ```ts
    -import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://westend-rpc.polkadot.io',
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  let callInfo;
  try {
    callInfo = await assetsApi.claimAssets(
      [
        `{"parents":"0","interior":{"X2":[{"PalletInstance":"50"},{"GeneralIndex":"1984"}]}}`,
      ],
      ['1000000000000'],
      '0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b',
      {
        format: 'call',
        xcmVersion: 2,
      },
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

    ```

    ***Response***

    -<div id="termynal" data-termynal>
    <span data-ty>Call data:</span>
    <span data-ty>{</span>
    <span data-ty>    "origin": "0",</span>
    <span data-ty>    "dest": "westend",</span>
    <span data-ty>    "direction": "local",</span>
    <span data-ty>    "xcmVersion": 2,</span>
    <span data-ty>    "method": "claimAssets",</span>
    <span data-ty>    "format": "call",</span>
    <span data-ty>    "tx": "0x630c0104000002043205011f00070010a5d4e80100010100f5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b"</span>
    <span data-ty>}</span>
<div>


#### Decode Extrinsic

Decodes the hex of an extrinsic into a string readable format.

```ts
-public decodeExtrinsic<T extends Format>(encodedTransaction: string, format: T): string {
```

??? interface "Request parameters"

    `encodedTransaction` ++"string"++ <span class="required" markdown>++"required"++</span>

    A hex encoded extrinsic.

    ---

    `format` ++"T extends Format"++ <span class="required" markdown>++"required"++</span>
    
    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        -export type Format = 'payload' | 'call' | 'submittable';
        ```

??? interface "Response parameters"

    ++"string"++

    Decoded extrinsic in string readable format.

??? interface "Example"

    ***Request***

    ```ts
    -import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://wss.api.moonbeam.network',
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  const encodedExt = '0x0a03f977814e90da44bfa03b6295a0616a897441acec821a0600';

  try {
    const decodedExt = assetsApi.decodeExtrinsic(encodedExt, 'call');
    console.log(
      `Decoded tx:\n ${JSON.stringify(JSON.parse(decodedExt), null, 4)}`,
    );
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

    ```

    ***Response***

    -<div id='termynal' data-termynal>
	<span data-ty>Decoded tx:</span>
	<span data-ty> {</span>
	<span data-ty>    "args": {</span>
	<span data-ty>        "dest": "0xF977814e90dA44bFA03b6295A0616a897441aceC",</span>
	<span data-ty>        "value": "100,000"</span>
	<span data-ty>    },</span>
	<span data-ty>    "method": "transferKeepAlive",</span>
	<span data-ty>    "section": "balances"</span>
	<span data-ty>}</span>
</div>

#### Fetch Fee Info

Fetch estimated fee information for an extrinsic.

```ts
-public async fetchFeeInfo<T extends Format>(
		tx: ConstructedFormat<T>,
		format: T,
	): Promise<RuntimeDispatchInfo | RuntimeDispatchInfoV1 | null> {
```

??? interface "Request parameters"

    `tx` ++"ConstructedFormat<T>"++ <span class="required" markdown>++"required"++</span>

    The constructed transaction.

    ??? child "Type `ConstructedFormat<T>`"

        ```ts
        -export type ConstructedFormat<T> = T extends 'payload'
	? GenericExtrinsicPayload
	: T extends 'call'
		? `0x${string}`
		: T extends 'submittable'
			? SubmittableExtrinsic<'promise', ISubmittableResult>
			: never;
        ```

        The `ConstructedFormat` type is a conditional type that returns a specific type based on the value of the TxResult `format` field.

        - **Payload format**: If the format field is set to `'payload'`, the `ConstructedFormat` type will return a [`GenericExtrinsicPayload`](https://github.com/polkadot-js/api/blob/v16.2.2/packages/types/src/extrinsic/ExtrinsicPayload.ts#L87){target=\_blank}.
        - **Call format**: If the format field is set to `'call'`, the `ConstructedFormat` type will return a hexadecimal string (`0x${string}`). This is the encoded representation of the extrinsic call.
        - **Submittable format**: If the format field is set to `'submittable'`, the `ConstructedFormat` type will return a [`SubmittableExtrinsic`](https://github.com/polkadot-js/api/blob/v16.2.2/packages/api-base/src/types/submittable.ts#L56){target=\_blank}. This is a Polkadot.js type that represents a transaction that can be submitted to the blockchain.

    ---

    `format` ++"T extends Format"++ <span class="required" markdown>++"required"++</span>

    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        -export type Format = 'payload' | 'call' | 'submittable';
        ```

??? interface "Response parameters"

    ++"Promise<RuntimeDispatchInfo | RuntimeDispatchInfoV1 | null>"++

    A promise containing the estimated fee information for the provided extrinsic.

    ??? child "Type `RuntimeDispatchInfo`"

        ```ts
        export interface RuntimeDispatchInfo extends Struct {
          readonly weight: Weight;
          readonly class: DispatchClass;
          readonly partialFee: Balance;
        }
        ```

        For more information on the underlying types and fields of `RuntimeDispatchInfo`, check the [`RuntimeDispatchInfo`](https://github.com/polkadot-js/api/blob/v16.2.2/packages/types/src/interfaces/payment/types.ts#L21){target=\_blank} source code.

    ??? child "Type `RuntimeDispatchInfoV1`"

        ```ts
        export interface RuntimeDispatchInfoV1 extends Struct {
          readonly weight: WeightV1;
          readonly class: DispatchClass;
          readonly partialFee: Balance;
        }
        ```

        For more information on the underlying types and fields of `RuntimeDispatchInfoV1`, check the [`RuntimeDispatchInfoV1`](https://github.com/polkadot-js/api/blob/v16.2.2/packages/types/src/interfaces/payment/types.ts#L28){target=\_blank} source code.

??? interface "Example"

    ***Request***

    ```ts
    -import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://wss.api.moonbeam.network',
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  const encodedExt = '0x0a03f977814e90da44bfa03b6295a0616a897441acec821a0600';

  try {
    const decodedExt = await assetsApi.fetchFeeInfo(encodedExt, 'call');
    console.log(`Fee info:\n${JSON.stringify(decodedExt, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

    ```

    ***Response***

    -<div id='termynal' data-termynal>
    <span data-ty>Fee info:</span>
    <span data-ty>{</span>
    <span data-ty>    "weight": {</span>
    <span data-ty>        "refTime": 163777000,</span>
    <span data-ty>        "proofSize": 3581</span>
    <span data-ty>    },</span>
    <span data-ty>    "class": "Normal",</span>
    <span data-ty>    "partialFee": 0</span>
    <span data-ty>}</span>
</div>

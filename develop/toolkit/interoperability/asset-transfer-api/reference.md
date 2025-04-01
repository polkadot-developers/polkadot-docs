---
title: Asset Transfer API Reference
description: Explore the Asset Transfer API Reference for comprehensive details on methods, data types, and functionalities. Essential for cross-chain asset transfers.
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

For a more in-depth explanation of the Asset Transfer API class structure, check the [source code](https://github.com/paritytech/asset-transfer-api/blob/{{dependencies.repositories.asset_transfer_api.version}}/src/AssetTransferApi.ts#L121){target=\_blank}.

### Methods

#### Create Transfer Transaction

Generates an XCM transaction for transferring assets between chains. It simplifies the process by inferring what type of transaction is required given the inputs, ensuring that the assets are valid, and that the transaction details are correctly formatted.

After obtaining the transaction, you must handle the signing and submission process separately.

```ts
--8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/AssetTransferApi.ts:184:190'
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

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/transfer-arg-opts.md'

??? interface "Response parameters"

    ++"Promise<TxResult<T>"++

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/tx-result.md'

??? interface "Example"

    ***Request***

    ```ts
    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/ctt-example-request.ts'
    ```

    ***Response***

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/ctt-example-response.md'

#### Claim Assets

Creates a local XCM transaction to retrieve trapped assets. This function can be used to claim assets either locally on a system parachain, on the relay chain, or on any chain that supports the `claimAssets` runtime call.


```ts
--8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/AssetTransferApi.ts:368:373'
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

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/transfer-arg-opts.md'

??? interface "Response parameters"

    ++"Promise<TxResult<T>>"++

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/tx-result.md'

??? interface "Example"

    ***Request***

    ```ts
    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/ca-example-request.ts'
    ```

    ***Response***

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/ca-example-response.md'


#### Decode Extrinsic

Decodes the hex of an extrinsic into a string readable format.

```ts
--8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/AssetTransferApi.ts:529:529'
```

??? interface "Request parameters"

    `encodedTransaction` ++"string"++ <span class="required" markdown>++"required"++</span>

    A hex encoded extrinsic.

    ---

    `format` ++"T extends Format"++ <span class="required" markdown>++"required"++</span>
    
    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/types.ts:132:132'
        ```

??? interface "Response parameters"

    ++"string"++

    Decoded extrinsic in string readable format.

??? interface "Example"

    ***Request***

    ```ts
    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/de-example-request.ts'
    ```

    ***Response***

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/de-example-response.md'

#### Fetch Fee Info

Fetch estimated fee information for an extrinsic.

```ts
--8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/AssetTransferApi.ts:444:447'
```

??? interface "Request parameters"

    `tx` ++"ConstructedFormat<T>"++ <span class="required" markdown>++"required"++</span>

    The constructed transaction.

    ??? child "Type `ConstructedFormat<T>`"

        ```ts
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/types.ts:137:143'
        ```

        The `ConstructedFormat` type is a conditional type that returns a specific type based on the value of the TxResult `format` field.

        - **Payload format** - if the format field is set to `'payload'`, the `ConstructedFormat` type will return a [`GenericExtrinsicPayload`](https://github.com/polkadot-js/api/blob/{{ dependencies.repositories.polkadot_js_api.version}}/packages/types/src/extrinsic/ExtrinsicPayload.ts#L83){target=\_blank}
        - Call format - if the format field is set to `'call'`, the `ConstructedFormat` type will return a hexadecimal string (`0x${string}`). This is the encoded representation of the extrinsic call
        - **Submittable format** - if the format field is set to `'submittable'`, the `ConstructedFormat` type will return a [`SubmittableExtrinsic`](https://github.com/polkadot-js/api/blob/{{ dependencies.repositories.polkadot_js_api.version}}/packages/api-base/src/types/submittable.ts#L56){target=\_blank}. This is a Polkadot.js type that represents a transaction that can be submitted to the blockchain

    ---

    `format` ++"T extends Format"++ <span class="required" markdown>++"required"++</span>

    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.repositories.asset_transfer_api.version}}/src/types.ts:132:132'
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

        For more information on the underlying types and fields of `RuntimeDispatchInfo`, check the [`RuntimeDispatchInfo`](https://github.com/polkadot-js/api/blob/{{ dependencies.repositories.polkadot_js_api.version}}/packages/types/src/interfaces/payment/types.ts#L21){target=\_blank} source code.


    ??? child "Type `RuntimeDispatchInfoV1`"

        ```ts
        export interface RuntimeDispatchInfoV1 extends Struct {
          readonly weight: WeightV1;
          readonly class: DispatchClass;
          readonly partialFee: Balance;
        }
        ```

        For more information on the underlying types and fields of `RuntimeDispatchInfoV1`, check the [`RuntimeDispatchInfoV1`](https://github.com/polkadot-js/api/blob/{{ dependencies.repositories.polkadot_js_api.version}}/packages/types/src/interfaces/payment/types.ts#L28){target=\_blank} source code.

??? interface "Example"

    ***Request***

    ```ts
    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/ffi-example-request.ts'
    ```

    ***Response***

    --8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/reference/ffi-example-response.md'

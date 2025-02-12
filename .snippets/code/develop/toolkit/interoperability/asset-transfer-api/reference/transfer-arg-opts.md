Options for customizing the claim assets transaction. These options allow you to specify the transaction format, fee payment details, weight limits, XCM versions, and more.

??? child "Show more"

    `format` ++"T extends Format"++ 
        
    Specifies the format for returning a transaction.

    ??? child "Type `Format`"

        ```ts
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.asset_transfer_api.version}}/src/types.ts:132:132'
        ```

    ---

    `paysWithFeeOrigin` ++"string"++
    
    The Asset ID to pay fees on the current common good parachain. The defaults are as follows:

    - Polkadot Asset Hub - `'DOT'`
    - Kusama Asset Hub - `'KSM'`

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
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.asset_transfer_api.version}}/src/types.ts:540:540'
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
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/{{dependencies.asset_transfer_api.version}}/src/types.ts:540:540'
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

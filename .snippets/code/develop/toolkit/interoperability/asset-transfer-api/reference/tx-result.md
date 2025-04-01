A promise containing the result of constructing the transaction.

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
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/v0.5.0/src/types.ts:132:132'
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
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/v0.5.0/src/types.ts:170:179'
        ```

        ??? child "Type `LocalTransferTypes`"


            ```ts
            --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/v0.5.0/src/types.ts:148:163'
            ```

    ---

    `tx` ++"ConstructedFormat<T>"++

    The constructed transaction.

    ??? child "Type `ConstructedFormat<T>`"

        ```ts
        --8<-- 'https://raw.githubusercontent.com/paritytech/asset-transfer-api/refs/tags/v0.5.0/src/types.ts:137:143'
        ```

        The `ConstructedFormat` type is a conditional type that returns a specific type based on the value of the TxResult `format` field.

        - **Payload format** - if the format field is set to `'payload'`, the `ConstructedFormat` type will return a [`GenericExtrinsicPayload`](https://github.com/polkadot-js/api/blob/{{ dependencies.repositories.polkadot_js_api.version}}/packages/types/src/extrinsic/ExtrinsicPayload.ts#L83){target=\_blank}
        - **Call format** - if the format field is set to `'call'`, the `ConstructedFormat` type will return a hexadecimal string (`0x${string}`). This is the encoded representation of the extrinsic call
        - **Submittable format** - if the format field is set to `'submittable'`, the `ConstructedFormat` type will return a [`SubmittableExtrinsic`](https://github.com/polkadot-js/api/blob/{{ dependencies.repositories.polkadot_js_api.version}}/packages/api-base/src/types/submittable.ts#L56){target=\_blank}. This is a Polkadot.js type that represents a transaction that can be submitted to the blockchain

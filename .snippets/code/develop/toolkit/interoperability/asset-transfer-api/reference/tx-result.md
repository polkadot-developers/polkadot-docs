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
        --8<-- 'code/build-on-polkadot/xcm/asset-transfer-api/reference/format.ts'
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
        type Methods =
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
            type LocalTransferTypes =
              | 'assets::transfer'
              | 'assets::transferKeepAlive'
              | 'foreignAssets::transfer'
              | 'foreignAssets::transferKeepAlive'
              | 'balances::transfer'
              | 'balances::transferKeepAlive'
              | 'poolAssets::transfer'
              | 'poolAssets::transferKeepAlive'
              | 'tokens::transfer'
              | 'tokens::transferKeepAlive';
            ```

    ---

    `tx` ++"ConstructedFormat<T>"++

    The constructed transaction.

    ??? child "Type `ConstructedFormat<T>`"

        --8<-- 'code/build-on-polkadot/xcm/asset-transfer-api/reference/constructed-format.md'

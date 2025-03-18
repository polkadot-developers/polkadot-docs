---
title: XCM Runtime APIs
description: Learn about XCM Runtime APIs in Polkadot for cross-chain communication. Explore the APIs to simulate and test XCM messages before execution on the network.
---

# XCM Runtime APIs

## Introduction

Runtime APIs allow node-side code to extract information from the runtime state. While simple storage access retrieves stored values directly, runtime APIs enable arbitrary computation, making them a powerful tool for interacting with the chain's state.

Unlike direct storage access, runtime APIs can derive values from storage based on arguments or perform computations that don't require storage access. For example, a runtime API might expose a formula for fee calculation, using only the provided arguments as inputs rather than fetching data from storage.

In general, runtime APIs are used for:

- Accessing a storage item
- Retrieving a bundle of related storage items
- Deriving a value from storage based on arguments
- Exposing formulas for complex computational calculations

This section will teach you about specific runtime APIs that support XCM processing and manipulation.

## Dry Run API

The [Dry-run API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/dry_run/trait.DryRunApi.html){target=\_blank}, given an extrinsic, or an XCM program, returns its effects:

- Execution result
- Local XCM (in the case of an extrinsic)
- Forwarded XCMs
- List of events

This API can be used independently for dry-running, double-checking, or testing. However, it mainly shines when used with the [Xcm Payment API](#xcm-payment-api), given that it only estimates fees if you know the specific XCM you want to execute or send.

### Dry Run Call

This API allows a dry-run of any extrinsic and obtaining the outcome if it fails or succeeds, as well as the local xcm and remote xcm messages sent to other chains.

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/{{dependencies.repositories.polkadot_sdk.version}}/polkadot/xcm/xcm-runtime-apis/src/dry_run.rs:67:67'
```

??? interface "Input parameters"

    `origin` ++"OriginCaller"++ <span class="required" markdown>++"required"++</span>
    
    The origin used for executing the transaction.

    ---

    `call` ++"Call"++ <span class="required" markdown>++"required"++</span>

    The extrinsic to be executed.

    ---

??? interface "Output parameters"

    ++"Result<CallDryRunEffects<Event>, Error>"++

    Effects of dry-running an extrinsic. If an error occurs, it is returned instead of the effects.

    ??? child "Type `CallDryRunEffects<Event>`"

        `execution_result` ++"DispatchResultWithPostInfo"++

        The result of executing the extrinsic.

        ---

        `emitted_events` ++"Vec<Event>"++

        The list of events fired by the extrinsic.

        ---

        `local_xcm` ++"Option<VersionedXcm<()>>"++

        The local XCM that was attempted to be executed, if any.

        ---

        `forwarded_xcms` ++"Vec<(VersionedLocation, Vec<VersionedXcm<()>>)>"++

        The list of XCMs that were queued for sending.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`** - an API part is unsupported
        - **`VersionedConversionFailed`** - converting a versioned data structure from one version to another failed

    ---

??? interface "Example"

    This example demonstrates how to simulate a cross-chain asset transfer from the Paseo network to the Pop Network using a [reserve transfer](https://wiki.polkadot.network/docs/learn/xcm/journey/transfers-reserve){target=\_blank} mechanism. Instead of executing the actual transfer, the code shows how to test and verify the transaction's behavior through a dry run before performing it on the live network.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/call-example.js'
    ```

    ***Output***

    --8<-- 'code/develop/interoperability/xcm-runtime-apis/call-example-output.html::11'
                ...
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/call-example-output.html:189'

    ---

### Dry Run XCM

This API allows the direct dry-run of an xcm message instead of an extrinsic one, checks if it will execute successfully, and determines what other xcm messages will be forwarded to other chains.

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/{{dependencies.repositories.polkadot_sdk.version}}/polkadot/xcm/xcm-runtime-apis/src/dry_run.rs:70:70'
```

??? interface "Input parameters"

    `origin_location` ++"VersionedLocation"++ <span class="required" markdown>++"required"++</span>

    The location of the origin that will execute the xcm message.

    ---

    `xcm` ++"VersionedXcm<Call>"++ <span class="required" markdown>++"required"++</span>

    A versioned XCM message.

    ---

??? interface "Output parameters"

    ++"Result<XcmDryRunEffects<Event>, Error>"++

    Effects of dry-running an extrinsic. If an error occurs, it is returned instead of the effects.

    ??? child "Type `XcmDryRunEffects<Event>`"

        `execution_result` ++"DispatchResultWithPostInfo"++

        The result of executing the extrinsic.

        ---

        `emitted_events` ++"Vec<Event>"++

        The list of events fired by the extrinsic.

        ---

        `forwarded_xcms` ++"Vec<(VersionedLocation, Vec<VersionedXcm<()>>)>"++

        The list of XCMs that were queued for sending.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`** - an API part is unsupported
        - **`VersionedConversionFailed`** - converting a versioned data structure from one version to another failed

    ---

??? interface "Example"

    This example demonstrates how to simulate a [teleport asset transfer](https://wiki.polkadot.network/docs/learn/xcm/journey/transfers-teleport){target=\_blank} from the Paseo network to the Paseo Asset Hub parachain. The code shows how to test and verify the received XCM message's behavior in the destination chain through a dry run on the live network.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

     ***Usage with PAPI***

    ```js
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/xcm-example.js'
    ```

    ***Output***

    --8<-- 'code/develop/interoperability/xcm-runtime-apis/xcm-example-output.html'

    ---

## XCM Payment API

The [XCM Payment API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/fees/trait.XcmPaymentApi.html){target=\_blank} provides a standardized way to determine the costs and payment options for executing XCM messages. Specifically, it enables clients to:

- Retrieve the [weight](/polkadot-protocol/glossary/#weight) required to execute an XCM message
- Obtain a list of acceptable `AssetIds` for paying execution fees
- Calculate the cost of the weight in a specified `AssetId`
- Estimate the fees for XCM message delivery

This API eliminates the need for clients to guess execution fees or identify acceptable assets manually. Instead, clients can query the list of supported asset IDs formatted according to the XCM version they understand. With this information, they can weigh the XCM program they intend to execute and convert the computed weight into its cost using one of the acceptable assets.

To use the API effectively, the client must already know the XCM program to be executed and the chains involved in the program's execution.

### Query Acceptable Payment Assets

Retrieves the list of assets that are acceptable for paying fees when using a specific XCM version

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/{{dependencies.repositories.polkadot_sdk.version}}/polkadot/xcm/xcm-runtime-apis/src/fees.rs:43:43'
```

??? interface "Input parameters"

    `xcm_version` ++"Version"++ <span class="required" markdown>++"required"++</span>

    Specifies the XCM version that will be used to send the XCM message.

    ---

??? interface "Output parameters"

    ++"Result<Vec<VersionedAssetId>, Error>"++

    A list of acceptable payment assets. Each asset is provided in a versioned format (`VersionedAssetId`) that matches the specified XCM version. If an error occurs, it is returned instead of the asset list.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`** - an API part is unsupported
        - **`VersionedConversionFailed`** - converting a versioned data structure from one version to another failed
        - **`WeightNotComputable`** - XCM message weight calculation failed
        - **`UnhandledXcmVersion`** - XCM version not able to be handled
        - **`AssetNotFound`** - the given asset is not handled as a fee asset
        - **`Unroutable`** - destination is known to be unroutable

    ---

??? interface "Example"

    This example demonstrates how to query the acceptable payment assets for executing XCM messages on the Paseo Asset Hub network using XCM version 3.

    ***Usage with PAPI***

    ```js
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-assets.js'
    ```

    ***Output***

    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-assets-output.html'

    ---

### Query XCM Weight

Calculates the weight required to execute a given XCM message. It is useful for estimating the execution cost of a cross-chain message in the destination chain before sending it.

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/{{dependencies.repositories.polkadot_sdk.version}}/polkadot/xcm/xcm-runtime-apis/src/fees.rs:50:50'
```

??? interface "Input parameters"

    `message` ++"VersionedXcm<()>"++ <span class="required" markdown>++"required"++</span>
    
    A versioned XCM message whose execution weight is being queried.

    ---

??? interface "Output parameters"

    ++"Result<Weight, Error>"++
    
    The calculated weight required to execute the provided XCM message. If the calculation fails, an error is returned instead.

    ??? child "Type `Weight`"

        `ref_time` ++"u64"++

        The weight of computational time used based on some reference hardware.

        ---

        `proof_size` ++"u64"++

        The weight of storage space used by proof of validity.

        ---

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`** - an API part is unsupported
        - **`VersionedConversionFailed`** - converting a versioned data structure from one version to another failed
        - **`WeightNotComputable`** - XCM message weight calculation failed
        - **`UnhandledXcmVersion`** - XCM version not able to be handled
        - **`AssetNotFound`** - the given asset is not handled as a fee asset
        - **`Unroutable`** - destination is known to be unroutable

    ---

??? interface "Example"

    This example demonstrates how to calculate the weight needed to execute a [teleport transfer](https://wiki.polkadot.network/docs/learn/xcm/journey/transfers-teleport){target=\_blank} from the Paseo network to the Paseo Asset Hub parachain using the XCM Payment API. The result shows the required weight in terms of reference time and proof size needed in the destination chain.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-xcm-weight.js'
    ```

    ***Output***

    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-xcm-weight-output.html'

    ---

### Query Weight to Asset Fee

Converts a given weight into the corresponding fee for a specified `AssetId`. It allows clients to determine the cost of execution in terms of the desired asset.

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/{{dependencies.repositories.polkadot_sdk.version}}/polkadot/xcm/xcm-runtime-apis/src/fees.rs:58:58'
```

??? interface "Input parameters"

    `weight` ++"Weight"++ <span class="required" markdown>++"required"++</span>
    
    The execution weight to be converted into a fee.

    ??? child "Type `Weight`"

        `ref_time` ++"u64"++

        The weight of computational time used based on some reference hardware.

        ---

        `proof_size` ++"u64"++

        The weight of storage space used by proof of validity.

        ---

    ---

    `asset` ++"VersionedAssetId"++ <span class="required" markdown>++"required"++</span>
    
    The asset in which the fee will be calculated. This must be a versioned asset ID compatible with the runtime.

    ---

??? interface "Output parameters"

    ++"Result<u128, Error>"++
    
    The fee needed to pay for the execution for the given `AssetId.`

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`** - an API part is unsupported
        - **`VersionedConversionFailed`** - converting a versioned data structure from one version to another failed
        - **`WeightNotComputable`** - XCM message weight calculation failed
        - **`UnhandledXcmVersion`** - XCM version not able to be handled
        - **`AssetNotFound`** - the given asset is not handled as a fee asset
        - **`Unroutable`** - destination is known to be unroutable

    ---

??? interface "Example"

    This example demonstrates how to calculate the fee for a given execution weight using a specific versioned asset ID (PAS token) on Paseo Asset Hub.

    ***Usage with PAPI***

    ```js
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-weight-to-fee.js'
    ```

    ***Output***

    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-weight-to-fee-output.html'
    ---

### Query Delivery Fees

Retrieves the delivery fees for sending a specific XCM message to a designated destination. The fees are always returned in a specific asset defined by the destination chain.

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/{{dependencies.repositories.polkadot_sdk.version}}/polkadot/xcm/xcm-runtime-apis/src/fees.rs:68:68'
```

??? interface "Input parameters"

    `destination` ++"VersionedLocation"++ <span class="required" markdown>++"required"++</span>
    
    The target location where the message will be sent. Fees may vary depending on the destination, as different destinations often have unique fee structures and sender mechanisms.

    ---

    `message` ++"VersionedXcm<()>"++ <span class="required" markdown>++"required"++</span>
    
    The XCM message to be sent. The delivery fees are calculated based on the message's content and size, which can influence the cost.

    ---

??? interface "Output parameters"

    ++"Result<VersionedAssets, Error>"++
    
    The calculated delivery fees expressed in a specific asset supported by the destination chain. If an error occurs during the query, it returns an error instead.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`** - an API part is unsupported
        - **`VersionedConversionFailed`** - converting a versioned data structure from one version to another failed
        - **`WeightNotComputable`** - XCM message weight calculation failed
        - **`UnhandledXcmVersion`** - XCM version not able to be handled
        - **`AssetNotFound`** - the given asset is not handled as a fee asset
        - **`Unroutable`** - destination is known to be unroutable

    ---

??? interface "Example"

    This example demonstrates how to query the delivery fees for sending an XCM message from Paseo to Paseo Asset Hub.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-delivery-fees.js'
    ```

    ***Output***

    --8<-- 'code/develop/interoperability/xcm-runtime-apis/query-delivery-fees-output.html'
    ---
---
title: Polkadot-API
description: Polkadot-API (PAPI) is a set of libraries built to be modular, composable, and grounded in a “light-client first” approach.
---

# Polkadot-API

## Introduction

[Polkadot-API](https://papi.how/){target=\_blank}(PAPI) is a set of libraries built to be modular, composable, and grounded in a “light-client first” approach. Its primary aim is to equip dApp developers with an extensive toolkit for building fully decentralized applications.

PAPI is optimized for light-client functionality, using the new JSON-RPC spec to support decentralized interactions fully. It provides strong TypeScript support with types and documentation generated directly from on-chain metadata, and it offers seamless access to storage reads, constants, transactions, events, and runtime calls. Developers can connect to multiple chains simultaneously and prepare for runtime updates through multi-descriptor generation and compatibility checks. Polkadot-API is lightweight and performant, leveraging native BigInt, dynamic imports, and modular subpaths to avoid bundling unnecessary assets. It supports promise-based and observable-based APIs, integrates easily with Polkadot-JS extensions, and offers signing options through browser extensions or private keys.

## Get Started

### API Instantiation

To instantiate the API, you can install the package by using the following command:

=== "npm"
    ```bash
    npm i polkadot-api
    ```

=== "pnpm"
    ```bash
    pnpm add polkadot-api
    ```

=== "yarn"
    ```bash
    yarn add polkadot-api
    ```

Then, obtain the latest metadata from the target chain and generate the necessary types:

```bash
# Add the target chain
npx papi add dot -n polkadot
```

The `papi add` command initializes papi add, assigns the chain a custom name and specifies downloading metadata from the Polkadot chain. You can replace `dot` with the chain name if you want to add a different chain. Once the latest metadata is downloaded, generate the required types:

```bash
# Generate the necessary types
npx papi
```

You can now set up a [`PolkadotClient`](https://github.com/polkadot-api/polkadot-api/blob/main/packages/client/src/types.ts#L153){target=\_blank} with your chosen provider to begin interacting with the API. Choose from Smoldot via WebWorker, Node.js, or direct usage, or connect through the WSS provider. The examples below show how to configure each option for your setup.

=== "Smoldot(WebWorker)"

    ```typescript
    // `dot` is the identifier assigned during `npx papi add`
    import { dot } from "@polkadot-api/descriptors";
    import { createClient } from "polkadot-api";
    import { getSmProvider } from "polkadot-api/sm-provider";
    import { chainSpec } from "polkadot-api/chains/polkadot";
    import { startFromWorker } from "polkadot-api/smoldot/from-worker";
    import SmWorker from "polkadot-api/smoldot/worker?worker";

    const worker = new SmWorker();
    const smoldot = startFromWorker(worker);
    const chain = await smoldot.addChain({ chainSpec });

    // Establish connection to the Polkadot relay chain.
    const client = createClient(
        getSmProvider(chain)
    );

    // To interact with the chain, obtain the `TypedApi`, which provides
    // the necessary types for every API call on this chain
    const dotApi = client.getTypedApi(dot);
    ```

=== "Smoldot(Node.js)"

    ```typescript
    // `dot` is the alias assigned during `npx papi add`
    import { dot } from "@polkadot-api/descriptors";
    import { createClient } from "polkadot-api";
    import { getSmProvider } from "polkadot-api/sm-provider";
    import { chainSpec } from "polkadot-api/chains/polkadot";
    import { startFromWorker } from "polkadot-api/smoldot/from-node-worker";
    import { fileURLToPath } from "url";
    import { Worker } from "worker_threads";

    // Get the path for the worker file in ESM
    const workerPath = fileURLToPath(
    import.meta.resolve("polkadot-api/smoldot/node-worker")
    );

    const worker = new Worker(workerPath);
    const smoldot = startFromWorker(worker);
    const chain = await smoldot.addChain({ chainSpec });

    // Set up a client to connect to the Polkadot relay chain.
    const client = createClient(
        getSmProvider(chain)
    );

    // To interact with the chain's API, use `TypedApi` for access to
    // all the necessary types and calls associated with this chain
    const dotApi = client.getTypedApi(dot);
    ```

=== "Smoldot"

    ```typescript
    // `dot` is the alias assigned when running `npx papi add`
    import { dot } from "@polkadot-api/descriptors";
    import { createClient } from "polkadot-api";
    import { getSmProvider } from "polkadot-api/sm-provider";
    import { chainSpec } from "polkadot-api/chains/polkadot";
    import { start } from "polkadot-api/smoldot";

    // Initialize Smoldot client
    const smoldot = start();
    const chain = await smoldot.addChain({ chainSpec });

    // Set up a client to connect to the Polkadot relay chain
    const client = createClient(
        getSmProvider(chain)
    );

    // Access the `TypedApi` to interact with all available chain calls and types
    const dotApi = client.getTypedApi(dot);
    ```

=== "WSS"

    ```typescript
    // `dot` is the identifier assigned when executing `npx papi add`
    import { dot } from "@polkadot-api/descriptors";
    import { createClient } from "polkadot-api";
    // Use this import for Node.js environments
    import { getWsProvider } from "polkadot-api/ws-provider/web";
    import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

    // Establish a connection to the Polkadot relay chain.
    const client = createClient(
        // The Polkadot SDK nodes may have compatibility issues; using this enhancer is recommended.
        // Refer to the Requirements page for additional details.
        withPolkadotSdkCompat(
            getWsProvider("wss://dot-rpc.stakeworld.io")
        )
    );

    // To interact with the chain, obtain the `TypedApi`, which provides
    // the types for all available calls in that chain
    const dotApi = client.getTypedApi(dot);
    ```

Now that you have set up the client, you can interact with the chain by reading and sending transactions.

### Reading Chain Data

With the `TypedApi`, you can read data from the blockchain using the following patterns:

- To read a **constant** of the blockchain, you can use the `constants` property and access the constant you need:

    ```typescript
    const version = await typedApi.constants.System.Version()
    ```

- To read a value from the **storage**, you can use the following pattern:

    ```typescript
    const result = await typedApi.query.Pallet.Query.getValue(
        arg1,
        arg2,
        arg3,
        { at: "best" }
    )
    ```

- To directly query a **Runtime API**, you can use the `query` property and access the API you need, for example:

    ```typescript
    const metadata = await typedApi.apis.Metadata.metadata()
    ```

To learn more about the different actions you can perform with the `TypedApi`, refer to the [Typed API Reference](https://papi.how/typed){target=\_blank}.

### Sending Transactions

In PAPI, the `TypedApi` provides the `tx` and `txFromCallData` methods to send transactions. 

- The `tx` method allows you to directly send a transaction with the specified parameters by using the `typedApi.tx.Pallet.Call` pattern:

    ```typescript
    const tx: Transaction = typedApi.tx.Pallet.Call({arg1, arg2, arg3})
    ``` 

    For instance, to execute the `balances.transferKeepAlive` call, you can use the following snippet:

    ```typescript
    import { MultiAddress } from "@polkadot-api/descriptors"
    
    const tx: Transaction = typedApi.tx.Balances.transfer_keep_alive({
        dest: MultiAddress.Id("INSERT_DESTINATION_ADDRESS"),
        value: BigInt(INSERT_VALUE)
    })
    ```

    Ensure you replace `INSERT_DESTINATION_ADDRESS` and `INSERT_VALUE` with the actual destination address and value, respectively.

- The `txFromCallData` method allows you to send a transaction using the call data. This option accepts binary call data and constructs the transaction from it. It validates the input upon creation and will throw an error if invalid data is provided. The pattern is as follows:

    ```typescript
    const callData = Binary.fromHex("0x...")
    const tx: Transaction = typedApi.txFromCallData(callData)
    ``` 

    For instance, to execute a transaction using the call data, you can use the following snippet:

    ```typescript
    const callData = Binary.fromHex("0x00002470617065726d6f6f6e")
    const tx: Transaction = typedApi.txFromCallData(callData)
    ```

    Ensure you replace `INSERT_CALL_DATA` with the actual call data, a hex string.

For more information about sending transactions, refer to the [Transactions](https://papi.how/typed/tx#transactions){target=\_blank} page.

## Next Steps

For an in-depth guide on how to use PAPI, refer to the official [PAPI](https://papi.how/typed){target=\_blank} documentation.

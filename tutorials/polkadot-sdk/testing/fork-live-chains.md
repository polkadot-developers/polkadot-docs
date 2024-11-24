---
title: Fork a Chain with Chopsticks
description: Learn how to fork live Polkadot SDK chains with Chopsticks. Configure forks, replay blocks, test XCM, and interact programmatically or via UI.
---

# Fork a Chain with Chopsticks

## Introduction

Chopsticks is an innovative tool that simplifies the process of forking live Polkadot SDK chains. This guide provides step-by-step instructions to configure and fork chains, enabling developers to:

- Replay blocks for state analysis
- Test cross-chain messaging (XCM)
- Simulate blockchain environments for debugging and experimentation

With support for both configuration files and CLI commands, Chopsticks offers flexibility for diverse development workflows. Whether you're testing locally or exploring complex blockchain scenarios, Chopsticks empowers developers to gain deeper insights and accelerate application development.

For additional support and information, please reach out through [GitHub Issues](https://github.com/AcalaNetwork/chopsticks/issues){target=\_blank}.

!!! note
    Chopsticks uses [Smoldot](https://github.com/smol-dot/smoldot){target=\_blank} light client, which only supports the native Polkadot SDK API. As a result, Ethereum JSON-RPC calls are not supported, and tools like Metamask cannot connect to Chopsticks-based forks.

## Prerequisites

To follow this tutorial, ensure you have completed the following:

- **Installed Chopsticks** - if you still need to do so, see the [Install Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#install-chopsticks){target=\_blank} guide for assistance
- **Reviewed** [**Configure Chopsticks**](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#configure-chopsticks){target=\_blank} - and understand how forked chains are configured

## Configuration File 

To run Chopsticks using a configuration file, utilize the `--config` flag. You can use a raw GitHub URL, a path to a local file, or simply the chain's name. The following commands all look different but they use the `polkadot` configuration in the same way:

=== "GitHub URL"

    ```bash
    npx @acala-network/chopsticks \
    --config=https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml
    ```

=== "Local File Path"

    ```bash
    npx @acala-network/chopsticks --config=configs/polkadot.yml
    ```

=== "Chain Name"

    ```bash
    npx @acala-network/chopsticks --config=polkadot
    ```

Regardless of which method you choose from the preceding examples, you'll see an output similar to the following:

--8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//run-chopsticks-01.html'

!!! note
    If using a file path, make sure you've downloaded the [Polkadot configuration file](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot.yml){target=\_blank}, or have created your own.


## Create a Fork

Once you've configured Chopsticks, use the following command to fork Polkadot at block 100:

```bash
npx @acala-network/chopsticks \
--endpoint wss://polkadot-rpc.dwellir.com \
--block 100
```

If the fork is successful, you will see output similar to the following:

-8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//polkadot-fork-01.html'

Access the running Chopsticks fork using the default address.

```bash
ws://localhost:8000
```

## Interact with a Fork

You can interact with the forked chain using various [libraries](https://wiki.polkadot.network/docs/build-tools-index#libraries){target=\_blank} such as [Polkadot.js](https://polkadot.js.org/docs/){target=\_blank} and its user interface, [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

### Use Polkadot.js Apps

To interact with Chopsticks via the hosted user interface, visit [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} and follow these steps:

1. Select the network icon in the top left corner

    ![](/images/tutorials/polkadot-sdk/testing/fork-live-chains//chopsticks-1.webp)

2. Scroll to the bottom and select **Development**
3. Choose **Custom**
4. Enter `ws://localhost:8000` in the input field
5. Select the **Switch** button

    ![](/images/tutorials/polkadot-sdk/testing/fork-live-chains//chopsticks-2.webp)

You should now be connected to your local fork and can interact with it as you would with a real chain.

### Use Polkadot.js Library

For programmatic interaction, you can use the Polkadot.js library. The following is a basic example:

```js
--8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//basic-example.js'
```

## Replay Blocks

Chopsticks allows you to replay specific blocks from a chain, which is useful for debugging and analyzing state changes. You can use the parameters in the [Configuration](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#configure-chopsticks){target=\_blank} section to set up the chain configuration, and then use the run-block subcommand with the following additional options:

- `output-path` - path to print output
- `html` - generate HTML with storage diff
- `open` - open generated HTML

For example, the command to replay block 1000 from Polkadot and save the output to a JSON file would be as follows:

```bash
npx @acala-network/chopsticks run-block  \
--endpoint wss://polkadot-rpc.dwellir.com  \
--output-path ./polkadot-output.json  \
--block 1000
```

??? code "Output file content"

    ```json
    --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//replay-block.json'
    ```

## XCM Testing

To test XCM (Cross-Consensus Messaging) messages between networks, you can fork multiple parachains and a relay chain locally using Chopsticks.

- `relaychain` - relay chain config file
- `parachain` - parachain config file  

For example, to fork Moonbeam, Astar, and Polkadot enabling XCM between them, you can use the following command:

```bash
npx @acala-network/chopsticks xcm \
--r polkadot \
--p moonbeam \
--p astar
```

After running it, you should see output similar to the following:

--8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//fork-output.html'

Now you can interact with your forked chains using the ports specified in the output.

## WebSocket Commands

Chopstick's internal WebSocket server has special endpoints that allow the manipulation of the local Polkadot SDK chain.

These are the methods that can be invoked and their parameters:

- **dev_newBlock** (newBlockParams) — generates one or more new blocks

    === "Parameters"

        - `newBlockParams` ++"NewBlockParams"++  - the parameters to build the new block with. Where the `NewBlockParams` interface includes the following properties:
            - `count` ++"number"++ - the number of blocks to build
            - `dmp` ++"{ msg: string, sentAt: number }[]"++ - the downward messages to include in the block
            - `hrmp` ++"Record<string | number, { data: string, sentAt: number }[]>"++ - the horizontal messages to include in the block
            - `to` ++"number"++ - the block number to build to
            - `transactions` ++"string[]"++ - the transactions to include in the block
            - `ump` ++"Record<number, string[]>"++ - the upward messages to include in the block
            - `unsafeBlockHeight` ++"number"++ - build block using a specific block height (unsafe)

    === "Example"

        ```js
        --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//dev-newblock-example.js'
        ```

- **dev_setBlockBuildMode** (buildBlockMode) — sets block build mode

    === "Parameter"
    
        - `buildBlockMode` ++"BuildBlockMode"++ - the build mode. Can be any of the following modes:
            ```ts
            export enum BuildBlockMode {
              Batch = 'Batch', /** One block per batch (default) */
              Instant = 'Instant', /** One block per transaction */
              Manual = 'Manual', /** Only build when triggered */
            }
            ```
            
    === "Example"

        ```js
        --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//dev-setBlockBuildMode-example.js'
        ```

- **dev_setHead** (hashOrNumber) — sets the head of the blockchain to a specific hash or number

    === "Parameter"

        - `hashOrNumber` ++"string | number"++ - the block hash or number to set as head

    === "Example"

        ```js
        --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//dev-setHead-example.js'
        ```

- **dev_setRuntimeLogLevel** (runtimeLogLevel) — sets the runtime log level

    === "Parameter"

        - `runtimeLogLevel` ++"number"++ - the runtime log level to set

    === "Example"

        ```js
        --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//dev-setRuntimeLogLevel-example.js'
        ```

- **dev_setStorage** (values, blockHash) — creates or overwrites the value of any storage

    === "Parameters"

        - `values` ++"object"++ - JSON object resembling the path to a storage value
        - `blockHash` ++"string"++ - the block hash to set the storage value

    === "Example"

        ```js
        --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//dev-setStorage-example.js'
        ```

- **dev_timeTravel** (date) — sets the timestamp of the block to a specific date"

    === "Parameter"

        - `date` ++"string"++ - timestamp or date string to set. All future blocks will be sequentially created after this point in time

    === "Example"

        ```js
        --8<-- 'code/tutorials/polkadot-sdk/testing/fork-live-chains//dev-timeTravel-example.js'
        ```

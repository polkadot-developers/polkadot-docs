---
title: Using Chopsticks for Substrate-based Chains
description: Configure and fork Substrate-based blockchains locally with Chopsticks. Learn installation, configuration, and usage for streamlined blockchain development.
---

# Chopsticks

## Introduction

[Chopsticks](https://github.com/AcalaNetwork/chopsticks/){target=\_blank}, created and maintained by the [Acala Foundation](https://github.com/AcalaNetwork){target=\_blank}, is a powerful tool designed to enhance the development process for Substrate-based blockchains. It offers developers a user-friendly method to locally fork existing chains, enabling them to:

- Experiment with custom blockchain configurations in a local environment
- Replay blocks and analyze how extrinsics affect state
- Fork multiple blocks for comprehensive XCM testing

With Chopsticks, developers can simulate and test complex blockchain scenarios without deploying to a live network. This tool significantly reduces the complexity of building blockchain applications on Substrate, making it more accessible to developers of varying experience levels. Ultimately, Chopsticks aims to accelerate innovation in the Substrate ecosystem by providing a robust, flexible testing framework.

For additional support and information, please reach out through [GitHub Issues](https://github.com/AcalaNetwork/chopsticks/issues){target=_blank}.

!!! note
    Chopsticks uses [Smoldot](https://github.com/smol-dot/smoldot){target=_blank} light client, which only supports the native Polkadot SDK API. Consequently, a Chopsticks-based fork doesn't support Ethereum JSON-RPC calls, so you cannot use it to fork your chain and connect Metamask.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/){target=\_blank}
- A package manager such as [npm](https://www.npmjs.com/){target=\_blank}, which should be installed with Node.js by default, or [Yarn](https://yarnpkg.com/){target=\_blank}

## Install Chopsticks

You can install Chopsticks either globally or locally in your project. Choose the option that best fits your development workflow.

!!! note
    This documentation explains the features of Chopsticks version `{{ dependencies.chopsticks.version }}`. Make sure you're using the correct version to match these instructions.

### Global Installation

To install Chopsticks globally, allowing you to use it across multiple projects, run:

```bash
npm i -g @acala-network/chopsticks@{{ dependencies.chopsticks.version }}
```

Now, you should be able to run the `chopsticks` command from your terminal.

### Local Installation

To use Chopsticks in a specific project, first create a new directory and initialize a Node.js project:

```bash
mkdir my-chopsticks-project
cd my-chopsticks-project
npm init -y
```

Then, install Chopsticks as a local dependency:

```bash
npm i @acala-network/chopsticks@{{ dependencies.chopsticks.version }}
```

Finally, you can run Chopsticks using the `npx` command:

```bash
npx @acala-network/chopsticks
```

## Configuration

To run Chopsticks, you need to configure some parameters. This can be set either through using a configuration file or the command line interface (CLI). The parameters that can be configured are as follows:

- `genesis` - the link to a parachain's raw genesis file to build the fork from, instead of an endpoint
- `timestamp` - timestamp of the block to fork from
- `endpoint` - the endpoint of the parachain to fork
- `block` - use to specify at which block hash or number to replay the fork
- `wasm-override` - path of the Wasm to use as the parachain runtime, instead of an endpoint's runtime
- `db` - path to the name of the file that stores or will store the parachain's database
- `config` - path or URL of the config file
- `port` - the port to expose an endpoint on
- `build-block-mode` - how blocks should be built in the fork: batch, manual, instant
- `import-storage` - a pre-defined JSON/YAML storage path to override in the parachain's storage
- `allow-unresolved-imports` - whether to allow Wasm unresolved imports when using a Wasm to build the parachain
- `html` - include to generate storage diff preview between blocks
- `mock-signature-host` - mock signature host so that any signature starts with `0xdeadbeef` and filled by `0xcd` is considered valid

### Using a Configuration File

The Chopsticks source repository includes a collection of [YAML](https://yaml.org/){target=\_blank} files that can be used to set up various Substrate chains locally. You can download these configuration files from the [repository's `configs` folder](https://github.com/AcalaNetwork/chopsticks/tree/master/configs){target=\_blank}.

An example of a configuration file for Polkadot is as follows:

```yaml
--8<-- 'code/developer-tools/chopsticks/overview/example-config.yml'
```

To run Chopsticks using a configuration file, utilize the `--config` flag. You can use a raw GitHub URL, a path to a local file, or simply the chain's name. For example, the following commands all use Polkadot's configuration in the same way:

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

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>npx @acala-network/chopsticks --config=polkadot</span>
    <br>
    <span data-ty>[18:38:26.155] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml</span>
    <span data-ty>    app: "chopsticks"</span>
    <span data-ty>        chopsticks::executor  TRACE: Calling Metadata_metadata</span>
    <span data-ty>        chopsticks::executor  TRACE: Completed Metadata_metadata</span>
    <span data-ty>[18:38:28.186] INFO: Polkadot RPC listening on port 8000</span>
    <span data-ty>    app: "chopsticks"</span>
</div>

!!! note
    If using a file path, make sure you've downloaded the [Polkadot configuration file](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot.yml){target=\_blank}, or have created your own.

### Using Command Line Interface (CLI)

Alternatively, all settings (except for genesis and timestamp) can be configured via command-line flags, providing a comprehensive method to set up the environment. For example, the following command forks Polkadot at block 100.

```bash
npx @acala-network/chopsticks \
--endpoint wss://polkadot-rpc.dwellir.com \
--block 100
```

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>npx @acala-network/chopsticks \
--endpoint wss://polkadot-rpc.dwellir.com \
--block 100</span>
    <br>
    <span data-ty>[19:12:21.023] INFO: Polkadot RPC listening on port 8000</span>
    <span data-ty>    app: "chopsticks"</span>
</div>

## Interacting with a Fork

When running a fork, it's accessible by default at:

```bash
ws://localhost:8000
```

You can interact with the forked chain using various [libraries](https://wiki.polkadot.network/docs/build-tools-index#libraries){target=\_blank} such as [Polkadot.js](https://polkadot.js.org/docs/){target=\_blank} and its user interface, [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

### Using Polkadot.js Apps

To interact with Chopsticks via the hosted user interface, visit [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} and follow these steps:

1. Click the network icon in the top left corner

    ![](/images/dev-tools/chopsticks/chopsticks-1.webp)

2. Scroll to the bottom and select **Development**
3. Choose **Custom**
4. Enter `ws://localhost:8000` in the input field
5. Click the **Switch** button

![](/images/dev-tools/chopsticks/chopsticks-2.webp)

You should now be connected to your local fork and can interact with it as you would with a real chain.

### Using Polkadot.js Library

For programmatic interaction, you can use the Polkadot.js library. Here's a basic example:

```js
--8<-- 'code/developer-tools/chopsticks/overview/basic-example.js'
```

## Replaying Blocks

Chopsticks allows you to replay specific blocks from a chain, which is useful for debugging and analyzing state changes. You can use the parameters in the [Configuration](#configuration) section to set up the chain configuration, and then use the run-block subcommand with additional options:

- `output-path` - path to print output
- `html` - generate HTML with storage diff
- `open` - open generated HTML

For example, to replay block 1000 from Polkadot and save the output to a JSON file:

```bash
npx @acala-network/chopsticks run-block  \
--endpoint wss://polkadot-rpc.dwellir.com  \
--output-path ./polkadot-output.json  \
--block 1000
```

??? code "Output file content"

    ```json
    --8<-- 'code/developer-tools/chopsticks/overview/replay-block.json'
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

--8<-- 'code/developer-tools/chopsticks/overview/terminal/fork-output.md'

Now you can interact with your forked chains using the ports specified in the output.

## WebSocket Commands

Chopstick's internal WebSocket server has special endpoints that allow the manipulation of the local Substrate chain.

These are the methods that can be invoked and their parameters:

??? function "**dev_newBlock** (newBlockParams) — Generates one or more new blocks"

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
        --8<-- 'code/developer-tools/chopsticks/overview/dev-newblock-example.js'
        ```

??? function "**dev_setBlockBuildMode** (buildBlockMode) — Sets block build mode"

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
        --8<-- 'code/developer-tools/chopsticks/overview/dev-setBlockBuildMode-example.js'
        ```

??? function "**dev_setHead** (hashOrNumber) — Sets the head of the blockchain to a specific hash or number"

    === "Parameter"

        - `hashOrNumber` ++"string | number"++ - the block hash or number to set as head

    === "Example"

        ```js
        --8<-- 'code/developer-tools/chopsticks/overview/dev-setHead-example.js'
        ```

??? function "**dev_setRuntimeLogLevel** (runtimeLogLevel) — Sets the runtime log level"

    === "Parameter"

        - `runtimeLogLevel` ++"number"++ - the runtime log level to set

    === "Example"

        ```js
        --8<-- 'code/developer-tools/chopsticks/overview/dev-setRuntimeLogLevel-example.js'
        ```

??? function "**dev_setStorage** (values, blockHash) — Creates or overwrites the value of any storage"

    === "Parameters"

        - `values` ++"object"++ - JSON object resembling the path to a storage value
        - `blockHash` ++"string"++ - the block hash to set the storage value

    === "Example"

        ```js
        --8<-- 'code/developer-tools/chopsticks/overview/dev-setStorage-example.js'
        ```

??? function "**dev_timeTravel** (date) — Sets the timestamp of the block to a specific date"

    === "Parameter"

        - `date` ++"string"++ - timestamp or date string to set. All future blocks will be sequentially created after this point in time

    === "Example"

        ```js
        --8<-- 'code/developer-tools/chopsticks/overview/dev-timeTravel-example.js'
        ```

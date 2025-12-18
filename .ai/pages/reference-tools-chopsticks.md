---
title: Chopsticks
description: Chopsticks is a versatile tool for forking live Polkadot SDK chains, enabling local testing, block replay, and XCM simulation without deploying to live networks.
categories: Parachains, Tooling
url: https://docs.polkadot.com/reference/tools/chopsticks/
---

# Chopsticks

## Introduction

[Chopsticks](https://github.com/AcalaNetwork/chopsticks/){target=\_blank}, developed by the [Acala Foundation](https://github.com/AcalaNetwork){target=\_blank}, is a versatile tool tailored for developers working on Polkadot SDK-based blockchains. With Chopsticks, you can fork live chains locally, replay blocks to analyze extrinsics, and simulate complex scenarios like XCM interactions, all without deploying to a live network.

By streamlining testing and experimentation, Chopsticks empowers developers to innovate and accelerate their blockchain projects within the Polkadot ecosystem.

### Key Features

- **Local chain forking**: Fork live Polkadot SDK chains locally for testing and development.
- **Block replay**: Replay specific blocks to analyze state changes and debug extrinsics.
- **XCM testing**: Simulate cross-chain messaging between multiple parachains and relay chains.
- **Storage manipulation**: Override storage values to test specific scenarios.
- **WebSocket commands**: Control the forked environment with specialized RPC methods.
- **Time travel**: Manipulate block timestamps for testing time-dependent logic.
- **Build block modes**: Choose between batch, instant, or manual block production.

!!! warning
    Chopsticks uses [Smoldot](https://github.com/smol-dot/smoldot){target=\_blank} light client, which only supports the native Polkadot SDK API. Consequently, a Chopsticks-based fork doesn't support Ethereum JSON-RPC calls, meaning you cannot use it to fork your chain and connect Metamask.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/){target=\_blank}
- A package manager such as [npm](https://www.npmjs.com/){target=\_blank}, which should be installed with Node.js by default, or [yarn](https://yarnpkg.com/){target=\_blank}

## Installation

You can install Chopsticks globally or locally in your project. Choose the option that best fits your development workflow. 

!!! tip
    This documentation explains the features of Chopsticks version `1.2.2`. Make sure you're using the correct version to match these instructions.

### Global Installation

To install Chopsticks globally, allowing you to use it across multiple projects, run:

=== "npm"

    ```bash
    npm i -g @acala-network/chopsticks@1.2.2
    ```

=== "pnpm"

    ```bash
    pnpm add -g @acala-network/chopsticks@1.2.2
    ```

=== "yarn"

    ```bash
    yarn global add @acala-network/chopsticks@1.2.2
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

=== "npm"

    ```bash
    npm i @acala-network/chopsticks@1.2.2
    ```

=== "pnpm"

    ```bash
    pnpm add @acala-network/chopsticks@1.2.2
    ```

=== "yarn"

    ```bash
    yarn add @acala-network/chopsticks@1.2.2
    ```

Finally, you can run Chopsticks using the `npx` command. To see all available options and commands, run it with the `--help` flag:

```bash
npx @acala-network/chopsticks --help
```

## Get Started

### Configuration Options

To run Chopsticks, you need to configure some parameters. This can be set either via a configuration file or the command-line interface (CLI). The parameters that can be configured are as follows:

- **`genesis`**: The link to a parachain's raw genesis file to build the fork from, instead of an endpoint.
- **`timestamp`**: Timestamp of the block to fork from.
- **`endpoint`**: The endpoint of the parachain to fork.
- **`block`**: Use to specify at which block hash or number to replay the fork.
- **`wasm-override`**: Path of the Wasm to use as the parachain runtime, instead of an endpoint's runtime.
- **`db`**: Path to the name of the file that stores or will store the parachain's database.
- **`config`**: Path or URL of the config file.
- **`port`**: The port to expose an endpoint on.
- **`build-block-mode`**: How blocks should be built in the fork: batch, manual, instant.
- **`import-storage`**: A pre-defined JSON/YAML storage path to override in the parachain's storage.
- **`allow-unresolved-imports`**: Whether to allow Wasm unresolved imports when using a Wasm to build the parachain.
- **`html`**: Include to generate storage diff preview between blocks.
- **`mock-signature-host`**: Mock signature host so that any signature starts with `0xdeadbeef` and filled by `0xcd` is considered valid.

### Configuration File

The Chopsticks source repository includes a collection of [YAML](https://yaml.org/){target=\_blank} files that can be used to set up various Polkadot SDK chains locally. You can download these configuration files from the [repository's `configs` folder](https://github.com/AcalaNetwork/chopsticks/tree/master/configs){target=\_blank}.

An example of a configuration file for Polkadot is as follows:

{% raw %}
```yaml title="polkadot.yml"
endpoint:
  - wss://rpc.ibp.network/polkadot
  - wss://polkadot-rpc.dwellir.com
mock-signature-host: true
block: ${env.POLKADOT_BLOCK_NUMBER}
db: ./db.sqlite
runtime-log-level: 5

import-storage:
  System:
    Account:
      - - - 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
        - providers: 1
          data:
            free: '10000000000000000000'
  ParasDisputes:
    $removePrefix: ['disputes'] # those can makes block building super slow
```
{% endraw %}

The configuration file allows you to modify the storage of the forked network by rewriting the pallet, state component, and value that you want to change. For example, Polkadot's file rewrites Alice's `system.Account` storage so that the free balance is set to `10000000000000000000`.

### Create a Fork

To run Chopsticks using a configuration file, utilize the `--config` flag. You can use a raw GitHub URL, a path to a local file, or simply the chain's name:

=== "Chain Name"

    ```bash
    npx @acala-network/chopsticks --config=polkadot
    ```

=== "GitHub URL"

    ```bash
    npx @acala-network/chopsticks \
    --config=https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml
    ```

=== "Local File Path"

    ```bash
    npx @acala-network/chopsticks --config=configs/polkadot.yml
    ```

Alternatively, you can create a fork using CLI flags. For example, to fork Polkadot at block 100:

```bash
npx @acala-network/chopsticks \
--endpoint wss://polkadot-rpc.dwellir.com \
--block 100
```

If the fork is successful, you will see output indicating the RPC is listening:

<div class="termynal" data-termynal>
    <span data-ty="input">npx @acala-network/chopsticks --endpoint wss://polkadot-rpc.dwellir.com --block 100</span>
    <span data-ty="output">[19:12:21.023] INFO: Polkadot RPC listening on port 8000</span>
</div>
You can now access the running Chopsticks fork using the default address: `ws://localhost:8000`.

### Interact with a Fork

You can interact with the forked chain using various libraries such as [Polkadot.js](https://polkadot.js.org/docs/){target=\_blank}.

=== "Via Polkadot.js Apps"

    To interact with Chopsticks via the hosted user interface, visit [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} and follow these steps:

    1. Select the network icon in the top left corner.

        ![](/images/reference/tools/chopsticks/chopsticks-1.webp)

    2. Scroll to the bottom and select **Development**.
    3. Choose **Custom**.
    4. Enter `ws://localhost:8000` in the input field.
    5. Select the **Switch** button.

        ![](/images/reference/tools/chopsticks/chopsticks-2.webp)

    You should now be connected to your local fork and can interact with it as you would with a real chain.

=== "Via Polkadot.js API"

    For programmatic interaction, you can use the [Polkadot.js](/reference/tools/polkadot-js-api/){target=\_blank} library:

    ```typescript title="connect-to-fork.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    async function connectToFork() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;

      // Now you can use 'api' to interact with your fork
      console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
    }

    connectToFork();

    ```

### Replay Blocks

Chopsticks lets you replay specific blocks in a chain, which is useful for debugging and analyzing state changes. Use the `run-block` subcommand with the following options:

- **`output-path`**: Path to print output.
- **`html`**: Generate HTML with storage diff.
- **`open`**: Open generated HTML.

For example, to replay block 1000 from Polkadot and save the output to a JSON file:

```bash
npx @acala-network/chopsticks run-block \
--endpoint wss://polkadot-rpc.dwellir.com \
--output-path ./polkadot-output.json \
--block 1000
```

The output will include detailed information about the block execution, storage changes, and runtime logs.

### Test XCM

To test XCM (Cross-Consensus Messaging) messages between networks, you can fork multiple parachains and a relay chain locally using Chopsticks.

Use the `xcm` subcommand with:

- **`-r` / `--relaychain`**: Relay chain config file
- **`-p` / `--parachain`**: Parachain config file (can be specified multiple times)

For example, to fork Moonbeam, Astar, and Polkadot, enabling XCM between them:

```bash
npx @acala-network/chopsticks xcm \
--r polkadot \
--p moonbeam \
--p astar
```

After running it, you should see output indicating connections between the chains:

<div class="termynal" data-termynal>
    <span data-ty="input">npx @acala-network/chopsticks xcm --r polkadot --p moonbeam --p astar</span>
    <span data-ty="output">[13:46:12.631] INFO: Moonbeam RPC listening on port 8000</span>
    <span data-ty="output">[13:46:23.669] INFO: Astar RPC listening on port 8001</span>
    <span data-ty="output">[13:46:53.320] INFO: Polkadot RPC listening on port 8002</span>
    <span data-ty="output">[13:46:54.038] INFO (xcm): Connected relaychain 'Polkadot' with parachain 'Moonbeam'</span>
    <span data-ty="output">[13:46:55.028] INFO (xcm): Connected relaychain 'Polkadot' with parachain 'Astar'</span>
</div>
Now you can interact with your forked chains using the ports specified in the output and test XCM messages between them.

## WebSocket Commands

Chopstick's internal WebSocket server has special endpoints that allow manipulating the local Polkadot SDK chain.

???+ interface "dev_newBlock"

    Generates one or more new blocks.

    **Parameters:**

    - **`newBlockParams` (NewBlockParams)**: The parameters to build the new block with, including:
        - **`count` (number)**: The number of blocks to build
        - **`dmp` ({ msg: string, sentAt: number }[])**: The downward messages to include in the block
        - **`hrmp` (Record<string | number, { data: string, sentAt: number }[]>)**: The horizontal messages to include in the block
        - **`to` (number)**: The block number to build to
        - **`transactions` (string[])**: The transactions to include in the block
        - **`ump` (Record<number, string[]>)**: The upward messages to include in the block
        - **`unsafeBlockHeight` (number)**: Build block using a specific block height (unsafe)

    **Example:**

    ```typescript title="dev-newblock-example.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    async function main() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      await api.rpc('dev_newBlock', { count: 1 });
    }

    main();

    ```

??? interface "dev_setBlockBuildMode"

    Sets block build mode.

    **Parameters:**

    - **`buildBlockMode` (BuildBlockMode)**: The build mode. Can be:
        - `Batch`: One block per batch (default)
        - `Instant`: One block per transaction
        - `Manual`: Only build when triggered

    **Example:**

    ```typescript title="dev-setBlockBuildMode-example.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    async function main() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      await api.rpc('dev_setBlockBuildMode', 'Instant');
    }

    main();

    ```

??? interface "dev_setHead"

    Sets the head of the blockchain to a specific hash or number.

    **Parameters:**

    - **`hashOrNumber` (string | number)**: The block hash or number to set as head

    **Example:**

    ```typescript title="dev-setHead-example.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    async function main() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      await api.rpc('dev_setHead', 500);
    }

    main();

    ```

??? interface "dev_setRuntimeLogLevel"

    Sets the runtime log level.

    **Parameters:**

    - **`runtimeLogLevel` (number)**: The runtime log level to set

    **Example:**

    ```typescript title="dev-setRuntimeLogLevel-example.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    async function main() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      await api.rpc('dev_setRuntimeLogLevel', 1);
    }

    main();

    ```

??? interface "dev_setStorage"

    Creates or overwrites the value of any storage.

    **Parameters:**

    - **`values` (object)**: JSON object resembling the path to a storage value
    - **`blockHash` (string)**: The block hash to set the storage value

    **Example:**

    ```typescript title="dev-setStorage-example.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';
    import { Keyring } from '@polkadot/keyring';

    async function main() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      const keyring = new Keyring({ type: 'ed25519' });
      const bob = keyring.addFromUri('//Bob');
      const storage = {
        System: {
          Account: [[[bob.address], { data: { free: 100000 }, nonce: 1 }]],
        },
      };
      await api.rpc('dev_setStorage', storage);
    }

    main();

    ```

??? interface "dev_timeTravel"

    Sets the block's timestamp to a specific date. All future blocks will be sequentially created after this point in time.

    **Parameters:**

    - **`date` (string)**: Timestamp or date string to set

    **Example:**

    ```typescript title="dev-timeTravel-example.ts"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    async function main() {
      const wsProvider = new WsProvider('ws://localhost:8000');
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReady;
      await api.rpc('dev_timeTravel', '2030-08-15T00:00:00');
    }

    main();

    ```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Chopsticks Support__

    ---

    For further support and information, refer to the official resources.

    [:octicons-arrow-right-24: GitHub Repository](https://github.com/AcalaNetwork/chopsticks){target=\_blank}

    [:octicons-arrow-right-24: Create a GitHub Issue for Support](https://github.com/AcalaNetwork/chopsticks/issues){target=\_blank}

</div>

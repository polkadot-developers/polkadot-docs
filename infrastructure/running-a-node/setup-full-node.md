---
title: Set Up a Node
description: Instructions on how to set up a node in accordance to your platform and the differences between different node types.
---

## Introduction {: #introduction}

Running your own Polkadot full node is straightforward and beneficial - you can use it to make RPC requests, submit transactions, or help decentralize the network. While this guide focuses on [Polkadot](https://polkadot.network/){target=\_blank}, the same process applies to any other [Polkadot SDK](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html){target=\_blank}-based chain.

Polkadot has a variety of different node types that you can run including full, archive, and light nodes. When spinning up your Polkadot node you can indicate which type of these nodes to run with specific flags. See the [Types of Nodes](#types-of-nodes) section for more information on each of these node types. 

!!! note

	This guide to running a full node is intended for developers and enthusiasts and lacks security hardening steps for Polkadot Validators. If you're setting up a validator node, see the [Running a Validator](/infrastructure/running-a-validator/){target=\_blank} instructions. 


## Setup Instructions {: #setup-instructions}

Ensure Rust is installed for your operating system before continuing: [Install Dependencies for the Polkadot SDK](../../develop/parachain-devs/get-started/polkadot-sdk/install-deps.md). This isn't recommended if you're a validator. Please see the [secure validator setup](maintain-guides-secure-validator.md) if you are running a validator.

=== "macOS"

    - Install Homebrew within the terminal by running:

		```bash
		/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
		```

	- Then, run the following command:

		```bash
		brew install openssl cmake llvm protobuf
		```

	- Install Rust by running:

		```bash
		curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
		```

	- After Rust is installed, run the following commands to update and configure the Rust toolchain:

		```bash
		source ~/.cargo/env

		rustup default stable
		rustup update

		rustup update nightly
		rustup target add wasm32-unknown-unknown --toolchain nightly
		rustup component add rust-src --toolchain stable-aarch64-apple-darwin

		```

	- Verify your installation by running the following:
	```bash
	rustup show
	```
	You should see output similar to the following:
	```bash
	active toolchain
	----------------

	stable-aarch64-apple-darwin (default)
	rustc 1.82.0 (f6e511eec 2024-10-15)
	```
	- Run one more verification command:
	```bash
	rustup +nightly show
	```
	You should see output that ends with content similar to the following:
	```bash
	active toolchain
	----------------

	nightly-aarch64-apple-darwin (overridden by +toolchain on the command line)
	rustc 1.84.0-nightly (03ee48451 2024-11-18)
	```


    - Once Rust is installed, run the following commands to clone and build the Polkadot:
  
	    ```bash

	    git clone https://github.com/paritytech/polkadot-sdk polkadot-sdk
	    cd polkadot-sdk
	    cargo build --release
	    ```

    - Start your node with your public name of choice:
    ```bash
    ./target/release/polkadot --name "Your Node's Name"
    ```

    - Find your node on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3){target=\_blank}. You can view the latest synced block of your full node. Once fully synced, your node will appear in white text rather than gray.  


=== "Windows"
    - Install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10){target=\_blank}
    - Install [Ubuntu](https://docs.microsoft.com/en-us/windows/wsl/install-win10){target=\_blank} (same webpage)
    - Determine the latest version of the
    [Polkadot binary](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}. The latest release version should have a full set of assets to download, such as in [v1.14.1](https://github.com/paritytech/polkadot-sdk/releases/tag/polkadot-v1.14.1){target=\_blank}
	- Download the correct Polkadot binary running the following command. Replace `*VERSION*` with the tag of the latest version from the last step (e.g. `v1.14.1`):
    ```bash
    wget https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-INSERT-VERSION/polkadot
    ```

    - Run the following command to make the Polkadot release binary executable: 
    ```bash
    sudo chmod +x polkadot
    ```

    - Decide on a name for your node and run the following command to start it:
    ```bash
    ./polkadot --name "Your Node's Name"
    ```

	- Find your node on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3){target=\_blank}. You can view the latest synced block of your full node. Once fully synced, your node will appear in white text rather than gray. 

	If Rust is installed, then `cargo` can be used similar to macOS. Likewise, the below instructions for Linux may also be used.

=== "Linux (Pre-Built Binary)"
    !!!info
        The nature of pre-built binaries means that they may not work on your particular architecture or Linux distribution. If you see an error like `cannot execute binary file: Exec format error` it likely means the binary is not compatible with your system. You will either need to compile the binary or use [**Docker**](#using-docker).

    - Determine the latest version of the
    [Polkadot binary](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}. The latest release version should have a full set of assets to download, such as in [v1.14.1](https://github.com/paritytech/polkadot-sdk/releases/tag/polkadot-v1.14.1){target=\_blank}

    - Download the correct Polkadot binary within Ubuntu by running the following command. Replace `*VERSION*` with the tag of the latest version from the last step (e.g. `v1.14.1`):
    ```bash
    wget https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-v1.14.1/polkadot
    ```

    - Run the following command to make the Polkadot release binary executable: 
    ```bash
    sudo chmod +x polkadot
    ```

    - Decide on a name for your node and run the following command to start it:
    ```bash
    ./polkadot --name "Your Node's Name"
    ```

	- Find your node on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3){target=\_blank}. You can view the latest synced block of your full node. Once fully synced, your node will appear in white text rather than gray. 

=== "Linux (Compile Binary)"

    The most reliable (although perhaps not the fastest) way of launching a full node is compiling the binary yourself. Depending upon the specs of your machine, compiling the binary may take an hour or more. 

    - Run the following commands to configure the rust toolchain:
    ```bash
    rustup default stable
	rustup update
	rustup update nightly
	rustup target add wasm32-unknown-unknown --toolchain nightly
	rustup target add wasm32-unknown-unknown --toolchain stable-x86_64-unknown-linux-gnu
	rustup component add rust-src --toolchain stable-x86_64-unknown-linux-gnu
	```

	- Verify your installation by running the following:
	```bash
	rustup show
	```
	You should see output ending in contents similar to the following:
	```bash
	active toolchain
	----------------

	stable-x86_64-unknown-linux-gnu (default)
	rustc 1.82.0 (f6e511eec 2024-10-15)
	```

    - Once Rust is configured, run the following commands to clone and build Polkadot:
  
	 	```bash
	    git clone https://github.com/paritytech/polkadot-sdk polkadot-sdk
	    cd polkadot-sdk
	    cargo build --release
	    ```

    - Start your node with your public name of choice:
    ```bash
    ./target/release/polkadot --name "Your Node's Name"
    ```

    - Find your node on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3){target=\_blank}. You can view the latest synced block of your full node. Once fully synced, your node will appear in white text rather than gray.  

=== "Linux (Snap package)"

    It's easy to install Polkadot as a [snap package](https://snapcraft.io/polkadot).

    - If you don't already have Snap installed, take the following steps to install it:
    ```bash
    sudo apt update
	sudo apt install snapd
	```

	- Then run the following command to install the Polkadot snap package: 
    ```bash
    sudo snap install polkadot
	```

	- Configure your Polkadot node with your desired node name, arguments and chain (e.g. Kusama) 
    ```bash
    sudo snap set polkadot service-args="--name=MyName --chain=polkadot"
	```

	- Start the node service with the following command: 
    ```bash
    sudo snap start polkadot
	```

	- Review logs to check on the status of the node: 
    ```bash
    snap logs polkadot -f
	```

	- You can stop the node service with the following command: 
    ```bash
    sudo snap stop polkadot
	```

	- You can optionally prevent the service from stopping when snap is updated with the following command:
    ```bash
    sudo snap set polkadot endure=true
	```

	- Find your node on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3){target=\_blank}. You can view the latest synced block of your full node. Once fully synced, your node will appear in white text rather than gray. 

As a reminder, this guide to running a full node is intended for developers and enthusiasts and lacks security hardening steps for Polkadot Validators. If you're setting up a validator node, see the [Running a Validator](/infrastructure/running-a-validator/){target=\_blank} instructions. 

## Running Nodes {: #running-nodes}

There are two methods to run an RPC node: an archive node which holds all state and history, and a pruned node which retains only recent data. For a list of important flags when running RPC nodes, refer to the Parity DevOps documentation: [Important Flags for Running an RPC Node](https://paritytech.github.io/devops-guide/guides/rpc_index.html?#important-flags-for-running-an-rpc-node){target=\_blank}.

=== "Running a Full Node"
    !!!note 
        The bash commands that are provided to run against your node use `Polkadot` as the default chain

        Use the `--chain` flag if you follow the setup instructions to setup a `Kusama` node. For example:

        ```bash
        polkadot --name "Your Node's Name" --chain kusama
        ```

    Depending on where your binary is located (in some cases, it may be located within the `target/release` folder), you would use the same binary for Polkadot as you would for Kusama, or any other relay chain:

    ```bash
    polkadot --name "Your Node's Name"
    ```

    Use the `--help` flag to determine which flags you can use when running the node. For example, if connecting to your node remotely, you'll probably want to use `--rpc-external` and `--rpc-cors all`.

    The syncing process will take a while, depending on your capacity, processing power, disk speed and RAM. On a $10 DigitalOcean droplet, the process may complete in about ~36 hours. While syncing, your node name should be visible on Polkadot Telemetry in gray, and once it is fully synced, your node name will appear in white on [Polkadot Telemetry](https://telemetry.polkadot.io/#list/Polkadot){target=_blank}.

    A healthy full node syncing block will output logs like the following:

	???+ code "A full node syncing Polkadot"
	    ```bash
	    --8<-- 'code/infrastructure/running-a-node/setup-full-node/run-node.md'
	    ```

    Congratulations, you're now syncing a Polkadot full node! Keep in mind that the process is itself is identical when using any other Polkadot SDK-based chain, although individual chains may have chain-specific flag requirements.

=== "Running an Archive Node"
    To support the full state, use the appropriate pruning-related flags to enable archive mode:

    ```bash
    polkadot --chain polkadot \
    --name INSERT_YOUR_NODE_NAME \
    --state-pruning archive \
    --blocks-pruning archive \
    --rpc-cors all \
    --rpc-methods safe 
    ```

=== "Running a Pruned Node"
    For a pruned node, which offers limited historical access (the last 1000 finalized blocks):

    ```bash
    polkadot --chain polkadot \
    --name INSERT_YOUR_NODE_NAME \
    --state-pruning 1000 \
    --blocks-pruning archive \
    --rpc-cors all \
    --rpc-methods safe
    ```

### Securing your RPC {: #securing-your-rpc}

The node startup settings allow you to choose what to expose, how many connections to expose and which systems should be granted access through the RPC server.

- You can limit the methods to use with `--rpc-methods`; an easy way to set this to a safe mode is `--rpc-methods safe`
- You can set your maximum connections through `--rpc-max-connections`, for example, `--rpc-max-connections 200`
- By default, localhost and Polkadot.js can access the RPC server. You can change this by setting `--rpc-cors`. To allow access from everywhere, you can use `--rpc-cors all`

### Secure the WebSocket Port {: #secure-the-websocket-port}

To securely access your WebSocket (WS) connection over an SSL-enabled connection (necessary for SSL-enabled developer consoles), you'll need to convert the WS connection to a secure WSS connection. You can complete this conversion using a proxy and an SSL certificate. For detailed steps on setting this up, refer to the [Setup Secure WebSockets](TODO: add path){target=_blank} guide.

### Connect to your Full Node {: #connect-to-your-full-node}

Open [Polkadot.js](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/explorer){target=\_blank} and click the logo in the top left to switch the node. Activate the **Development** toggle and input your node's domain or IP address. The default WSS endpoint for a local node is:

```bash
ws://127.0.0.1:9944
```

## Using Docker {: #using-docker}

Finally, you can use Docker to run your node in a container. Doing this is more advanced, so it's best left up to those already familiar with Docker or who have completed the other set-up instructions in this guide. Be aware that when you run Polkadot in Docker, the process only listens on `localhost` by default. If you would like to connect to your node's services (RPC, and Prometheus) you need to ensure that you run the node with the `--rpc-external`, and `--prometheus-external` commands.

```bash
docker run -p 9944:9944 -p 9615:9615 parity/polkadot:v1.16.2 --name "my-polkadot-node-calling-home" --rpc-external --prometheus-external
```

If you're running Docker on an Apple Silicon machine (e.g. M4), you'll need to adapt the command slightly:

```bash
docker run --platform linux/amd64 -p 9944:9944 -p 9615:9615 parity/polkadot:v1.16.2 --name "kearsarge-calling-home" --rpc-external --prometheus-external
```

## Types of Nodes {: #types-of-nodes}

Like many protocols, a Polkadot SDK-based blockchain starts with the genesis block, and grows with subsequent blocks that contain extrinsics and events. When a validator seals the first block after the genesis block, it takes the blockchain's state at block zero. It then applies all pending changes on top of it and emits the events resulting from these changes. Later, the chain’s state at block one is used the same way to build the chain’s state at block two, and so on. Once two-thirds of the validators agree on a specific block being valid, it is finalized.

### Full Node {: #full-node}

A full node automatically prunes (removes) historical state data, retaining only the genesis block's state and states from the most recent 256 finalized blocks (though this number is configurable). This pruning significantly reduces storage requirements compared to archive nodes. While a full node theoretically could reconstruct all historical states to become an archive node, this feature is not yet implemented. If you need to access historical states beyond your pruning threshold, you have two options: you can either clear your database and resync the node in archive mode, or use a trusted snapshot/backup as your starting point, which only requires syncing blocks after the snapshot date.

### Archive Nodes {: #archive-nodes}

An archive node is a full node with special configuration flags that preserve all historical blocks and their states. This complete historical record allows you to quickly query any past state of the blockchain, such as checking an account's balance at a specific block or identifying which transactions (extrinsics) caused particular state changes.

However, an archive node takes up a lot of disk space. For example, a Polkadot archive node using paritydb currently sits at about 2.5TB.

!!!tip
    On [Stakeworld](https://stakeworld.io/docs/dbsize){target=_blank} you can find a list of the database sizes of Polkadot and Kusama nodes.

Archive nodes are used by utilities that need past information - like block explorers, governance platforms like [Polkassembly](https://polkassembly.io){target=_blank}, and others. They must be able to see historical on-chain data.

Setting up an RPC node is crucial for accessing and interacting with the Polkadot network. An RPC node allows you to query blockchain data, interact with dApps, or manage network tasks remotely.

All Polkadot SDK node implementations include the RPC server, which are accessed over the WebSocket protocol and used to connect to the underlying network or validator node. By default, you can access your node's RPC server from `localhost` (for example, to rotate keys or do other maintenance). You should set up a secure proxy when accessing your RPC server from another server or [Polkadot.js](https://polkadot.js.org/apps){target=\_blank} and only enable access to the RPC node over an encrypted, SSL connection between the end user and the RPC server. Many browsers, such as Google Chrome, will block non-secure WS endpoints if they come from a different origin.

!!!warning
    Enabling remote access to your validator node shouldn't be necessary and isn't suggested, as it can often lead to security problems. Learn more about node security in [Secure Your Validator](todo:link).

### Light Node {: #light-node}

A light node has only the runtime and the current state but doesn't store past blocks and so cannot read historical data without requesting it from a node that has it. Light nodes are useful for resource-restricted devices. An interesting use-case of light nodes is a browser extension, which is a node in its own right, running the runtime in WebAssembly format, as well as a full or light node that is completely encapsulated in WebAssembly and can be integrated into web apps.

[Substrate Connect](https://github.com/paritytech/substrate-connect){target=_blank} provides a way to interact with Polkadot SDK-based blockchains in the browser without using an RPC server. It is a light node that runs entirely in JavaScript. Substrate Connect uses a [Smoldot Wasm light client](https://github.com/paritytech/smoldot){target=_blank} to securely connect to the blockchain network without relying on specific third parties. Substrate Connect is available on Chrome and Firefox as a [browser extension](https://substrate.io/developers/substrate-connect/){target=_blank}. The Polkadot API (PAPI) also can utilize a Smoldot light client instance.
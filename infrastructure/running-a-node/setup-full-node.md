---
title: Set Up a Node
description: Instructions on how to set up a node in accordance to your platform and the differences between different node types.
---

## Introduction

If you're building dApps or products on a Polkadot SDK-based chain like Polkadot, Kusama, or a custom implementation, you want the ability to run a node-as-a-back-end. After all, relying on
your infrastructure is always better than a third-party-hosted one in this brave new decentralized
world.

This guide will show you how to connect to [Polkadot](https://polkadot.network/){target=\_blank}, but the
same process applies to any other [Polkadot SDK](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html){target=\_blank}-based chain.

### Types of Nodes

Like many other protocols, A Polkadot SDK-based blockchain starts with the  _genesis block_, and grows with subsequent blocks that contain _extrinsics_ and _events_.

When a validator [seals](todo:add_link) block 1, it takes the blockchain's state at block zero. It then applies all pending changes on top of it and emits the events resulting from these changes. Later, the chain’s state at block one is used the same way to build the chain’s state at block two, and so on. Once two-thirds of the validators agree on a specific block being valid, it is finalized.

#### Full Node

A *full node* prunes historical states: all finalized blocks' states older than a configurable
number except the genesis block's state. This is 256 blocks from the last finalized one by default.
A pruned node this way requires much less space than an archive node.

A full node could eventually rebuild every block's state without additional information and become
an archive node. This still needs to be implemented at the time of writing. If you need to query
historical blocks' states past what you pruned, you must purge your database and resynchronize your node, starting in archive mode. Alternatively, you can use a backup or snapshot of a trusted source to
avoid needing to sync from genesis with the network and only need the states of blocks past that
snapshot.

#### RPC and Archive Nodes

Setting up an RPC node is crucial for accessing and interacting with the Polkadot network. An RPC node allows you to query blockchain data, interact with dApps, or manage network tasks remotely.

All Polkadot SDK node implementations include the RPC server, which are accessed over the WebSocket protocol and used to connect to the underlying network or validator node. By default, you can access your node's RPC server from `localhost` (for example, to rotate keys or do other maintenance). You should set up a secure proxy when accessing your RPC server from another server or [Polkadot.js](https://polkadot.js.org/apps){target=\_blank} and only enable access to the RPC node over an encrypted, SSL connection between the end user and the RPC server. Many browsers, such as Google Chrome, will block non-secure WS endpoints if they come from a different origin.

!!!warning
    Enabling remote access to your validator node shouldn't be necessary and isn't suggested, as it can often lead to security problems. Learn more about node security in [Secure Your Validator](todo:link).

An _archive node_ (an RPC node which explicitly has flags for keeping an archive for on-chain state) keeps all the past blocks and their states. An archive node makes it convenient to query the past state of the chain at any point in time. Finding out what an account's balance at a particular block was or which extrinsics resulted in a specific state change are fast operations when using an archive node. 

However, an archive node takes up a lot of disk space. For example, around Kusama's 12 millionth block, would be around 660 GB.

!!!tip

    On [Stakeworld](https://stakeworld.io/docs/dbsize){target=_blank} you can find a list of the database sizes of Polkadot and Kusama nodes.

Archive nodes are used by utilities that need past information - like block explorers, council
scanners, discussion platforms like [Polkassembly](https://polkassembly.io){target=_blank}, and others. They need to be able to look at past on-chain data.

#### Light Node

A *light node* has only the runtime and the current state but doesn't store past blocks and so cannot read historical data without requesting it from a node that has it. Light nodes are useful for resource-restricted devices. An interesting use-case of light nodes is a browser extension, which is a node in its own right, running the runtime in WebAssembly format, as well as a full or light node that is completely encapsulated in WebAssembly and can be integrated into web apps.

[Substrate Connect](https://github.com/paritytech/substrate-connect){target=_blank} provides a way to interact with Polkadot SDK-based blockchains in the browser without using an RPC server. It is a light node that runs entirely in JavaScript. Substrate Connect uses a [Smoldot Wasm light client](https://github.com/paritytech/smoldot){target=_blank} to securely connect to the blockchain network without relying on specific third parties. Substrate Connect is available on Chrome and Firefox as a [browser extension](https://substrate.io/developers/substrate-connect/){target=_blank}. 

The Polkadot API (PAPI) also can utilize a Smoldot light client instance.

## Setup Instructions

Ensure Rust is installed for your operating system before continuing: [Install Dependencies for the Polkadot SDK](../../develop/parachain-devs/get-started/polkadot-sdk/install-deps.md).

This isn't recommended if you're a validator. Please see the [secure validator setup](maintain-guides-secure-validator.md) if you are running validator.

=== "macOS"
    - Once Rust is installed, run the following command to clone and build the Polkadot in your path:
  
    ```bash
    cargo install --git https://github.com/paritytech/polkadot-sdk --tag <version> polkadot --locked
    ```

=== "Windows"
    - Install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
    - Install [Ubuntu](https://docs.microsoft.com/en-us/windows/wsl/install-win10) (same webpage).
    - Determine the latest version of the
    [Polkadot binary](https://github.com/paritytech/polkadot-sdk/tree/master/polkadot/releases).
    - Download the correct Polkadot binary within Ubuntu by running the following command. Replace
    `*VERSION*` with the tag of the latest version from the last step (for example, `v0.8.22`):
    ```bash
    curl -sL https://github.com/paritytech/polkadot-sdk/releases/download/*VERSION*/polkadot -o polkadot
    ```

    - Then, run the following:
    ```bash
    sudo chmod +x polkadot
    ```

    - Which can be run as follows:
    ```bash
    ./polkadot --name "Your Node's Name"
    ```

    If Rust is installed, then `cargo` can be used similar to macOS. Likewise, the below instructions for Linux may also be used.

=== "Linux (Standalone)"
    !!!info
        The nature of pre-built binaries means that they may not work on your particular architecture or
        Linux distribution. If you see an error like `cannot execute binary file: Exec format error` it
        likely means the binary is not compatible with your system. You will either need to compile the
        [**source code**](#clone-and-build) or use [**Docker**](#using-docker).

    - Determine the latest version of the
    [Polkadot binary](https://github.com/paritytech/polkadot-sdk/releases)

    - Download the correct Polkadot binary within Ubuntu by running the following command. Replace
    `*VERSION*` with the tag of the latest version from the last step (e.g. `v0.8.22`):
    ```bash
    curl -sL https://github.com/paritytech/polkadot-sdk/releases/download/*VERSION*/polkadot -o polkadot
    ```

    - Run the following: `sudo chmod +x polkadot`

    - Run the following:
    ```bash
    polkadot --name "Your Node's Name"
    ```

=== "Linux (package)"

    You can also install Polkadot from one of our package repositories.

    Installation from the Debian or rpm repositories will create a `systemd` service that can be used to
    run a Polkadot node. The service is disabled by default, and can be started by running
    `systemctl start polkadot` on demand (use `systemctl enable polkadot` to make it auto-start after
    reboot). By default, it will run as the `polkadot` user. Command-line flags passed to the binary can
    be customized by editing `/etc/default/polkadot`. This file will not be overwritten on updating
    polkadot.

    ### Debian-based (Debian, Ubuntu)

    Currently supports Debian 10 (Buster) and Ubuntu 20.04 (Focal), and derivatives. Run the following
    commands as the `root` user.

    ```bash
    # Import the security@parity.io GPG key
    gpg --recv-keys --keyserver hkps://keys.mailvelope.com 9D4B2B6EB8F97156D19669A9FF0812D491B96798
    gpg --export 9D4B2B6EB8F97156D19669A9FF0812D491B96798 > /usr/share/keyrings/parity.gpg
    # Add the Parity repository and update the package index
    echo 'deb [signed-by=/usr/share/keyrings/parity.gpg] https://releases.parity.io/deb release main' > /etc/apt/sources.list.d/parity.list
    apt update
    # Install the `parity-keyring` package - This will ensure the GPG key
    # used by APT remains up-to-date
    apt install parity-keyring
    # Install polkadot
    apt install polkadot
    ```

    If you don't want polkadot package to be automatically updated when you update packages on your
    server, you can issue the following command:

    ```bash
    sudo apt-mark hold polkadot
    ```

    ### RPM-based (Fedora, CentOS)

    Currently supports Fedora 32 and CentOS 8, and derivatives.

    ```bash
    # Install dnf-plugins-core (This might already be installed)
    dnf install dnf-plugins-core
    # Add the repository and enable it
    dnf config-manager --add-repo https://releases.parity.io/rpm/polkadot.repo
    dnf config-manager --set-enabled polkadot
    # Install polkadot (You may have to confirm the import of the GPG key, which
    # should have the following fingerprint: 9D4B2B6EB8F97156D19669A9FF0812D491B96798)
    dnf install polkadot
    ```

    !!!note
        If you choose to use a custom folder for the polkadot home by passing `--base-path '/custom-path'`,
        you will need to issue following command:

        ```bash
        sudo mkdir /etc/systemd/system/polkadot.service.d
        ```

        And create a new file inside this folder:

        ```bash
        sudo -e /etc/systemd/system/polkadot.service.d/custom.conf
        ```

        With the following content:

        ```
        [Service]
        ReadWritePaths=/custom-path
        ```

        And finally issue a reload to have your modifications applied by systemd:

        ```bash
        systemctl daemon-reload
        ```

## Running a Full Node

!!!note 
    The bash commands that are provided to run against **your node** use `Polkadot` as the default chain

    Use the `--chain` flag if you follow the setup instructions to setup a `Kusama` node. For example:

    ```bash
    polkadot --name "Your Node's Name" --chain kusama
    ```

Depending on where your binary is located (in some cases, it may be located within the `target/release` folder), you would use the same binary for Polkadot as you would for Kusama, or any other relay chain:

```bash
polkadot --name "Your Node's Name"
```

Use the `--help` flag to determine which flags you can use when running the node. For example, if connecting to your node remotely, you'll probably want to use `--rpc-external` and `--rpc-cors all`.

The syncing process will take a while, depending on your capacity, processing power, disk speed and RAM. On a $10 DigitalOcean droplet, the process can complete in some ~36 hours. Once it is synced, you may find it in [Telemetry](https://telemetry.polkadot.io/#list/Polkadot){target=_blank}.

Congratulations, you're now syncing with Polkadot. Keep in mind that the process is identical when using any other Polkadot SDK-based chain.

### Running an RPC Node

There are two methods to run an RPC node: an *archive* node which holds all state and history, and a *pruned* node which retains only recent data.

For a list of important flags when running RPC nodes, refer to the Parity DevOps documentation: [Important Flags for Running an RPC Node](https://paritytech.github.io/devops-guide/guides/rpc_index.html?#important-flags-for-running-an-rpc-node){target=\_blank}

#### Running an Archive Node

To support the full state, use the appropriate pruning-related flags to enable archive mode:

```bash
polkadot --chain polkadot \
--name INSERT_YOUR_NODE_NAME \
--state-pruning archive \
--blocks-pruning archive \
--rpc-cors all \
--rpc-methods safe 
```

#### Running a Pruned Node

For a pruned node, which offers limited historical access (the last 1000 finalized blocks):

```bash
polkadot --chain polkadot \
--name INSERT_YOUR_NODE_NAME \
--state-pruning 1000 \
--blocks-pruning archive \
--rpc-cors all \
--rpc-methods safe
```

## Using Docker

Finally, you can use Docker to run your node in a container. Doing this is more advanced, so it's best left up to those already familiar with Docker or who have completed the other set-up instructions in this guide. Be aware that when you run Polkadot in Docker, the process only listens on `localhost` by default. If you would like to connect to your node's services (RPC, and Prometheus) you need to ensure that you run the node with the `--rpc-external`, and `--prometheus-external` commands.

```bash
docker run \
-p 9944:9944 \
-p 9615:9615 parity/polkadot:v0.9.13 \
--name "calling_home_from_a_docker_container" \
--rpc-external \
--prometheus-external
```
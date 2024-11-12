---
title: Set Up a Full Node
description: Learn how to set up and secure a full Polkadot node. Follow step-by-step instructions for installation, node types, RPC setup, and WebSocket security.
---

## Introduction

If you're building dApps or products on a Polkadot SDK-based chain, running a node as a back-end provides increased operational control and decentralization. All Polkadot SDK node implementations include the RPC server, crucial for accessing and interacting with the Polkadot network.

This guide demonstrates connecting to [Polkadot](https://polkadot.network/){target=\_blank}, but the same process applies to any other [Polkadot SDK](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html){target=\_blank}-based chain. This tutorial will guide you through configuring, securing, and maintaining a full node. You'll learn about the differences between archive and pruned nodes, how to secure the WebSocket connection, and the steps necessary to safely expose and maintain your node's RPC server for external access.

## Types of Nodes

- **Pruned node** - prunes historical states of all finalized block states older than a specified number except for the genesis block's state
- **Archive node** - keeps all the past blocks and their states, making it convenient to query the past state of the chain at any given time. Archive nodes use a lot of disk space, which means they should be limited to use cases that require easy access to past on-chain data
- **Light node** - has only the runtime and the current state but doesn't store past blocks, making them useful for resource-restricted devices

!!!tip
    On [Stakeworld](https://stakeworld.io/docs/dbsize){target=\_blank}, you can find a list of the database sizes of Polkadot and Kusama nodes.

### State vs. Block Pruning

A pruned node only keeps a limited number of finalized blocks of the network, not its complete history. State and block pruning are two ways of removing old blocks from a system. State pruning removes the states of old blocks while preserving block headers. Block pruning removes the block bodies of old blocks while retaining block headers. You can complete many frequently required actions with a pruned node, such as displaying account balances, making transfers, setting up session keys, and staking. 

## Setup Instructions

Ensure Rust is installed on your operating system before continuing. If you need guidance, see [Install Dependencies for the Polkadot SDK](TODO: update path).

??? warning "Not intended for validators"
    This process isn't recommended if you're a validator. If you are running a validator, please see the [secure validator setup](TODO: update path).

=== "macOS"
    - Once Rust is installed, run the following command to clone and build the Polkadot in your path:
  
    ```bash
    cargo install --git https://github.com/paritytech/polkadot-sdk --tag <version> polkadot --locked
    ```

=== "Windows"
    - Install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
    - Install [Ubuntu](https://docs.microsoft.com/en-us/windows/wsl/install-win10) (same webpage)
    - Determine the latest version of the [Polkadot binary](https://github.com/paritytech/polkadot-sdk/tree/master/polkadot/releases)
    - Download the correct Polkadot binary within Ubuntu by running the following command. Replace `*VERSION*` with the tag of the latest version from the last step (for example, `v0.8.22`):
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

    If Rust is installed, then `cargo` can be used similarly to macOS. The instructions for Linux may also be used.

=== "Linux (Standalone)"
    ??? info "`cannot execute binary file: Exec format error`"
        The nature of pre-built binaries means that they may not work on your particular architecture or Linux distribution. If you see an error like `cannot execute binary file: Exec format error`, it likely means the binary is incompatible with your system. You will either need to compile the source code or use Docker.

    - Determine the latest version of the [Polkadot binary](https://github.com/paritytech/polkadot-sdk/releases)

    - Download the correct Polkadot binary within Ubuntu by running the following command. Replace `*VERSION*` with the tag of the latest version from the last step (e.g. `v0.8.22`):
    ```bash
    curl -sL https://github.com/paritytech/polkadot-sdk/releases/download/*VERSION*/polkadot -o polkadot
    ```

    - Then, run the following command: 
    ```bash
    `sudo chmod +x polkadot`
    ```

    - Which can be run as follows:
    ```bash
    polkadot --name "Your Node's Name"
    ```

=== "Linux (package)"

    You can also install Polkadot from one of our package repositories. Installation from the Debian or rpm repositories will create a `systemd` service that can be used to run a Polkadot node. The service is inactive by default and will run as the `polkadot` user when started. Follow these steps to start the service and set it to auto-start on reboot:
    
    1. To start the service, run the following command:
    ```bash
    systemctl start polkadot
    ```
    2. Run this command to set the service to auto-start on reboot:
    ```bash
    systemctl enable polkadot
    ```
    
    Command-line flags passed to the binary can be customized by editing `/etc/default/polkadot`. This file will not be overwritten on updating `polkadot`.

### Debian-based (Debian, Ubuntu)

Debian 10 (Buster) and Ubuntu 20.04 (Focal) and derivatives are currently supported. Run the following commands as the `root` user to install `polkadot`:

1. Import the security@parity.io GPG key
```bash
gpg --recv-keys --keyserver hkps://keys.mailvelope.com 9D4B2B6EB8F97156D19669A9FF0812D491B96798
gpg --export 9D4B2B6EB8F97156D19669A9FF0812D491B96798 > /usr/share/keyrings/parity.gpg
```
2. Add the Parity repository and update the package index
```bash
echo 'deb [signed-by=/usr/share/keyrings/parity.gpg] https://releases.parity.io/deb release main' > /etc/apt/sources.list.d/parity.list
apt update
```
3. Install the `parity-keyring` package to ensure the GPG key used by APT remains up-to-date
```bash
apt install parity-keyring
```
4. Install polkadot
```bash
apt install polkadot
```

If you don't want to automatically update the `polkadot` package when you update packages on your server, you can issue the following command:
```bash
sudo apt-mark hold polkadot
```

### RPM-based (Fedora, CentOS)

Currently, Fedora 32, CentOS 8, and derivatives are supported. Follow these steps to install `polkadot`:

1. If not already installed, install `dnf-plugins-core`
```bash
dnf install dnf-plugins-core
```
2. Add the repository and enable it
```bash
dnf config-manager --add-repo https://releases.parity.io/rpm/polkadot.repo
dnf config-manager --set-enabled polkadot
```
3. Install `polkadot`. You may have to confirm the import of the GPG key, which
should have the following fingerprint: `9D4B2B6EB8F97156D19669A9FF0812D491B96798`
```bash
dnf install polkadot
```

    ??? note "Custom path"
        If you choose to use a custom folder for the polkadot home by passing `--base-path '/custom-path'`, you will need to issue the following command:

        ```bash
        sudo mkdir /etc/systemd/system/polkadot.service.d
        ```

        Next, create a new file inside this folder:

        ```bash
        sudo -e /etc/systemd/system/polkadot.service.d/custom.conf
        ```

        With the following content:

        ```
        [Service]
        ReadWritePaths=/custom-path
        ```

        Finally, issue a reload to have your modifications applied by systemd:

        ```bash
        systemctl daemon-reload
        ```

### Use Docker

Finally, you can use Docker to run your node in a container. Doing this is more advanced, so it's best left up to those already familiar with Docker or who have completed the other setup instructions in this guide. 

Be aware that when you run Polkadot in Docker, the process only listens on `localhost` by default. If you would like to connect to your node's services (RPC and Prometheus), you need to ensure that you run the node with the `--rpc-external` and `--prometheus-external` commands similar to the following:

```bash
docker run \
-p 9944:9944 \
-p 9615:9615 parity/polkadot:v0.9.13 \
--name "calling_home_from_a_docker_container" \
--rpc-external \
--prometheus-external
```

Use the following commands to make your node externally accessible as an archive or pruned node. The options and flags will be explained in the following sections.

For an externally accessible Polkadot archive node run:

```bash
polkadot --chain polkadot \
--name INSERT_YOUR_NODE_NAME \
--state-pruning archive \
--blocks-pruning archive \
--rpc-cors all \
--rpc-methods safe 
```

For an externally accessible Polkadot pruned node run:

```bash
polkadot --chain polkadot \
--name INSERT_YOUR_NODE_NAME \
--state-pruning 1000 \
--blocks-pruning archive \
--rpc-cors all \
--rpc-methods safe
```

## Secure the RPC Server

The node startup settings allow you to choose what to expose, how many connections to expose, and which systems should be granted access through the RPC server. Some settings you can configure to increase node security include:

- **Limit usable methods** - with  the `--rpc-methods` flag. An easy way to set this to a safe mode is: 
```bash
--rpc-methods safe
```
- **Set maximum number of connections** - with the `--rpc-max-connections` flag. For example, to limit maximum connections to 200 use:
```bash
--rpc-max-connections 200
```
- **Set server access permissions** - with the `--rpc-cors` flag. By default, localhost and Polkadot.js can access the RPC server. To allow access from everywhere, you can use: 
```bash
--rpc-cors all
```

For a list of important flags when running RPC nodes, refer to the Parity DevOps documentation: [Important Flags for Running an RPC Node](https://paritytech.github.io/devops-guide/guides/rpc_index.html?#important-flags-for-running-an-rpc-node){target=\_blank}

## Secure the WebSocket Port

To securely access your WebSocket (WS) connection over an SSL-enabled connection (necessary for SSL-enabled developer consoles), you'll need to convert the WS connection to a secure WSS connection. You can complete this conversion using a proxy and an SSL certificate. For detailed steps on setting this up, refer to the [Set Up Secure WebSockets](TODO: add path){target=\_blank} guide.

## Connect to the Node

Open [Polkadot.js](https://polkadot.js.org/apps){target=\_blank} and click the logo in the top left to switch the node. Activate the **Development** toggle and input your node's domain or IP address. Remember to prefix with `wss://`, and if you're using the 443 port, append `:443` as follows:

```bash
wss://example.com:443
```

??? info "Adjustments for Kusama" 
    The bash commands that are provided to run against your node use `polkadot` as the default chain. 

    Use the `--chain` flag to set up a Kusama node. For example:

    ```bash
    polkadot --name "Your Node's Name" --chain kusama
    ```

    Depending on where your binary is located (in some cases, it may be located within the `target/release` folder), you would use the same binary for Polkadot as you would for Kusama or any other relay chain:

    ```bash
    polkadot --name "Your Node's Name"
    ```

Use the `--help` flag to determine which flags you can use when running the node. For example, if you want to connect to your node remotely, you'll probably want to use `--rpc-external` and `--rpc-cors all`.

The syncing process will take a while, depending on your capacity, processing power, disk speed, and RAM. For example, the process can be completed on a $10 DigitalOcean droplet in ~36 hours. Once it is synced, you may find it in [Telemetry](https://telemetry.polkadot.io/#list/Polkadot){target=_blank}.

Congratulations, you're now syncing with Polkadot. The process is identical when using any other Polkadot SDK-based chain.
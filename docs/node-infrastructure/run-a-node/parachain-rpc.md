---
title: Run a Parachain RPC Node
description: Follow this guide to understand hardware and software requirements and how to set up and run an RPC node for any parachain, including system parachains.
categories: Infrastructure
---

# Run a Parachain RPC Node

## Introduction

A parachain RPC node provides direct access to a specific parachain on the Polkadot network, enabling developers and applications to interact with its assets, governance, cross-chain messages, and more. Running your own node also supports essential infrastructure tasks, such as block indexing and compatibility with Polkadot SDK tools.

Through the parachain RPC (WebSocket port 9944, HTTP port 9933), your node acts as the bridge between the parachain and applications. This page walks through setting up a node from scratch, covering hardware requirements and deployment options using Docker or systemd.

## Prerequisites

### Hardware Requirements

RPC nodes serving production traffic require robust hardware:

- **CPU**: 8+ cores; 16+ cores for high traffic
- **Memory**: 64 GB RAM minimum; 128 GB recommended for high traffic
- **Storage**: Total required storage is the size of the pruned relay chain state plus the size of the parachain state. [Snapshots](https://snapshots.polkadot.io/){target=\_blank} _may_ be available. Fast NVMe I/O is critical for RPC query performance
    - **Pruned Polkadot Relay Chain**: ~1.2 TB using snapshot
    - **System parachains**:
        - **Archive node (complete history)**: Using snapshots, expected storage requirements are:
            - **Asset Hub**: ~1.2 TB
            - **People Chain**: ~400 GB
            - **Bridge Hub**: ~400 GB
            - **Coretime**: ~200 GB
        - **Pruned node (recent state)**: Snapshots are not available, but a pruned node requires less disk space than an archive node.
    - **Non-system parachains**: Consult the parachain team or documentation
- **Network**:
    - Public IP address
    - Stable internet connection with sufficient bandwidth
    - 1 Gbps connection for high traffic scenarios
    - Consider DDoS protection and rate limiting for production deployments
    - Open ports:
        - **30333**: Parachain P2P
        - **30334**: Relay chain P2P
        - **9944**: Polkadot SDK WebSocket RPC
        - **9933**: Polkadot SDK HTTP RPC
        - **8545**: Ethereum JSON-RPC (if running `eth-rpc` adapter)

!!! note
    For development or low-traffic scenarios, you can reduce these requirements proportionally. Consider using a reverse proxy ([nginx](https://nginx.org/){target=\_blank}, [Caddy](https://caddyserver.com/){target=\_blank}) for production deployments.

### Software Requirements

Required software:

- **Operating system**: Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- **[Docker](https://www.docker.com/get-started/){target=\_blank}**: Required for obtaining binaries and running containers
- **[rclone](https://rclone.org/downloads/){target=\_blank}**: (Optional but recommended) Command-line program for managing files on cloud storage

## Obtain the Chain Specification

To run an RPC node for a parachain, you need its chain specification file. This JSON file defines the network parameters, genesis state, and bootnodes. The process for obtaining the chain spec may differ depending on whether you’re running a system parachain or a regular parachain.

--8<-- 'text/node-infrastructure/chain-spec.md'

## Spin Up a Node

Choose the deployment option that fits your project, and follow the steps in the appropriate tab to complete setup:

- **Docker**: Best for simpler set up and maintenance
- **systemd**: Best for production environments requiring more control

This guide uses **Polkadot Asset Hub** as an example. To set up a different parachain, replace the chain spec file, snapshot path, and chain name with the corresponding values for your target parachain.

System parachain details:

| System Parachain   | Para ID | Chain Spec File            | Snapshot Path                          |
|--------------------|---------|----------------------------|----------------------------------------|
| **Asset Hub**      | 1000    | `asset-hub-polkadot.json`  | `polkadot-asset-hub-rocksdb-archive`   |
| **People Chain**   | 1004    | `people-polkadot.json`     | `polkadot-people-rocksdb-archive`      |
| **Bridge Hub**     | 1002    | `bridge-hub-polkadot.json` | `polkadot-bridge-hub-paritydb-archive` |
| **Coretime Chain** | 1005    | `coretime-polkadot.json`   | `polkadot-coretime-rocksdb-archive`    |

=== "Docker"

    1. Download your parachain's chain specification as described in [Obtain the Chain Specification](#obtain-the-chain-specification).

    2. (Optional but recommended) Download pre-synced [snapshots](https://snapshots.polkadot.io/){target=\_blank} to cut initial sync time from days to hours:

        !!! note
            Snapshots are available for system parachains and the Polkadot relay chain. For other parachains, check with the parachain team for snapshot availability or sync from genesis.

        1. Create new directories:

            ```bash
            mkdir -p my-node-data/chains/asset-hub-polkadot/db
            mkdir -p my-node-data/chains/polkadot/db
            ```

        2. Download and save the archive parachain snapshot:

            ```bash
            # Check https://snapshots.polkadot.io/ for the latest snapshot URL
            export SNAPSHOT_URL_PARACHAIN="https://snapshots.polkadot.io/polkadot-asset-hub-rocksdb-archive/INSERT_LATEST"

            rclone copyurl $SNAPSHOT_URL_PARACHAIN/files.txt files.txt
            rclone copy --progress --transfers 20 \
              --http-url $SNAPSHOT_URL_PARACHAIN \
              --no-traverse --http-no-head --disable-http2 \
              --inplace --no-gzip-encoding --size-only \
              --retries 6 --retries-sleep 10s \
              --files-from files.txt :http: my-node-data/chains/asset-hub-polkadot/db/

            rm files.txt
            ```

            ??? interface "rclone parameters"

                - **`--transfers 20`**: Uses 20 parallel transfers for faster download
                - **`--retries 6`**: Automatically retries failed transfers up to 6 times
                - **`--retries-sleep 10s`**: Waits 10 seconds between retry attempts
                - **`--size-only`**: Only transfers if sizes differ (prevents unnecessary re-downloads)

        3. Repeat the process for the pruned relay chain snapshot:

            ```bash
            # Check https://snapshots.polkadot.io/ for the latest snapshot URL
            export SNAPSHOT_URL_RELAY="https://snapshots.polkadot.io/polkadot-rocksdb-prune/INSERT_LATEST"

            rclone copyurl $SNAPSHOT_URL_RELAY/files.txt files.txt
            rclone copy --progress --transfers 20 \
              --http-url $SNAPSHOT_URL_RELAY \
              --no-traverse --http-no-head --disable-http2 \
              --inplace --no-gzip-encoding --size-only \
              --retries 6 --retries-sleep 10s \
              --files-from files.txt :http: my-node-data/chains/polkadot/db/

            rm files.txt
            ```

    3. Launch the parachain node using the official [Parity Docker image](https://hub.docker.com/r/parity/polkadot-parachain){target=\_blank}:

        === "Archive"

            ```bash
            docker run -d --name polkadot-hub-rpc --restart unless-stopped \
              -p 9944:9944 \
              -p 9933:9933 \
              -p 9615:9615 \
              -p 30334:30334 \
              -p 30333:30333 \
              -v $(pwd)/chain-spec.json:/chain-spec.json \
              -v $(pwd)/my-node-data:/data \
              parity/polkadot-parachain:{{dependencies.repositories.polkadot_sdk.docker_image_version}} \
              --name=PolkadotHubRPC \
              --base-path=/data \
              --chain=/chain-spec.json \
              --prometheus-external \
              --prometheus-port 9615 \
              --unsafe-rpc-external \
              --rpc-port=9944 \
              --rpc-cors=all \
              --rpc-methods=safe \
              --rpc-max-connections=1000 \
              --state-pruning=archive \
              --blocks-pruning=archive \
              -- \
              --base-path=/data \
              --chain=polkadot \
              --state-pruning=256 \
              --blocks-pruning=256 \
              --rpc-port=0
            ```

        === "Pruned"

            ```bash
            docker run -d --name polkadot-hub-rpc --restart unless-stopped \
              -p 9944:9944 \
              -p 9933:9933 \
              -p 9615:9615 \
              -p 30334:30334 \
              -p 30333:30333 \
              -v $(pwd)/chain-spec.json:/chain-spec.json \
              -v $(pwd)/my-node-data:/data \
              parity/polkadot-parachain:{{dependencies.repositories.polkadot_sdk.docker_image_version}} \
              --name=PolkadotHubRPC \
              --base-path=/data \
              --chain=/chain-spec.json \
              --prometheus-external \
              --prometheus-port 9615 \
              --unsafe-rpc-external \
              --rpc-port=9944 \
              --rpc-cors=all \
              --rpc-methods=safe \
              --rpc-max-connections=1000 \
              --state-pruning=1000 \
              --blocks-pruning=256 \
              -- \
              --base-path=/data \
              --chain=polkadot \
              --state-pruning=256 \
              --blocks-pruning=256 \
              --rpc-port=0
            ```

        !!! note
            The `parity/polkadot-parachain` image works for system parachains and parachains built with standard Cumulus templates. For parachains with custom runtimes, check the parachain's documentation for their specific Docker image or binary.

        Refer to the [Port Mappings](#port-mappings) and [Node Configuration Parameters](#node-configuration-parameters) sections for details on the command's configurations.

=== "systemd"

    1. Download the `polkadot-parachain` binary from the latest stable [Polkadot SDK release](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}:

        ```bash
        # Download the latest stable release (check releases page for current version)
        wget https://github.com/paritytech/polkadot-sdk/releases/download/{{dependencies.repositories.polkadot_sdk.version}}/polkadot-parachain

        # Make it executable and move to system path
        chmod +x polkadot-parachain
        sudo mv polkadot-parachain /usr/local/bin/

        # Verify installation
        polkadot-parachain --version
        ```

    2. Download your parachain's chain specification as described in [Obtain the Chain Specification](#obtain-the-chain-specification).

    3. Create user and directory structures:

        ```bash
        # Create a dedicated user
        sudo useradd -r -s /bin/bash polkadot
        
        # Create data directory
        sudo mkdir -p /var/lib/polkadot-hub-rpc

        # Copy the chain spec to the directory
        sudo cp chain-spec.json /var/lib/polkadot-hub-rpc/

        # Set permissions
        sudo chown -R polkadot:polkadot /var/lib/polkadot-hub-rpc
        ```

    4. Create a systemd service file for the Polkadot SDK RPC node:

        ```bash
        sudo nano /etc/systemd/system/polkadot-hub-rpc.service
        ```

    5. Open the new service file and add the configuration for either an archive (complete history) or pruned (recent state) node:

        === "Archive"

            ```ini
            [Unit]
            Description=Polkadot Hub RPC Node
            After=network.target

            [Service]
            Type=simple
            User=polkadot
            Group=polkadot
            WorkingDirectory=/var/lib/polkadot-hub-rpc

            ExecStart=/usr/local/bin/polkadot-parachain \
              --name=PolkadotHubRPC \
              --chain=/var/lib/polkadot-hub-rpc/chain-spec.json \
              --base-path=/var/lib/polkadot-hub-rpc \
              --port=30333 \
              --rpc-port=9944 \
              --rpc-external \
              --rpc-cors=all \
              --rpc-methods=safe \
              --rpc-max-connections=1000 \
              --prometheus-port=9615 \
              --prometheus-external \
              --state-pruning=archive \
              --blocks-pruning=archive \
              -- \
              --chain=polkadot \
              --base-path=/var/lib/polkadot-hub-rpc \
              --port=30334 \
              --state-pruning=256 \
              --blocks-pruning=256 \
              --rpc-port=0

            Restart=always
            RestartSec=10
            LimitNOFILE=65536

            [Install]
            WantedBy=multi-user.target
            ```

        === "Pruned"

            ```ini
            [Unit]
            Description=Polkadot Hub RPC Node
            After=network.target

            [Service]
            Type=simple
            User=polkadot
            Group=polkadot
            WorkingDirectory=/var/lib/polkadot-hub-rpc

            ExecStart=/usr/local/bin/polkadot-parachain \
              --name=PolkadotHubRPC \
              --chain=/var/lib/polkadot-hub-rpc/chain-spec.json \
              --base-path=/var/lib/polkadot-hub-rpc \
              --port=30333 \
              --rpc-port=9944 \
              --rpc-external \
              --rpc-cors=all \
              --rpc-methods=safe \
              --rpc-max-connections=1000 \
              --prometheus-port=9615 \
              --prometheus-external \
              --state-pruning=1000 \
              --blocks-pruning=256 \
              -- \
              --chain=polkadot \
              --base-path=/var/lib/polkadot-hub-rpc \
              --port=30334 \
              --state-pruning=256 \
              --blocks-pruning=256 \
              --rpc-port=0

            Restart=always
            RestartSec=10
            LimitNOFILE=65536

            [Install]
            WantedBy=multi-user.target
            ```

        Refer to the [Port Mappings](#port-mappings) and [Node Configuration Parameters](#node-configuration-parameters) sections for details on the command's configurations.

    6. Start the service:

        ```bash
        # Reload systemd
        sudo systemctl daemon-reload

        # Enable service to start on boot
        sudo systemctl enable polkadot-hub-rpc
        
        # Start the Polkadot SDK node:
        sudo systemctl start polkadot-hub-rpc
        ```

### Port Mappings

- **`9944`**: Polkadot SDK RPC endpoint (WebSocket/HTTP)
- **`9933`**: Polkadot SDK HTTP RPC endpoint
- **`9615`**: Prometheus metrics endpoint
- **`30333/30334`**: P2P networking ports

### Node Configuration Parameters

- **`--unsafe-rpc-external`**: Enables external RPC access. **This command should only be used in development or properly secured environments**. For production, use a reverse proxy with authentication.
- **`--rpc-cors=all`**: Allows all origins for CORS.
- **`--rpc-methods=safe`**: Only allows safe RPC methods.
- **`--state-pruning`**: `archive` keeps complete state history, `[NUMBER]` keeps last specified number of finalized blocks.
- **`--blocks-pruning`**: `archive` keeps all blocks, `[NUMBER]` keeps last specified number of finalized blocks.
- **`--prometheus-external`**: Exposes metrics externally.

## Monitor Node Synchronization

Monitor the node synchronization status:

```bash
curl -H "Content-Type: application/json" \
-d '{"id":1, "jsonrpc":"2.0", "method": "system_syncState", "params":[]}' \
http://localhost:9944
```

When synchronization is complete, `currentBlock` will be equal to `highestBlock`:

<div class="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_syncState", "params":[]}' \
  http://localhost:9944</span>
  <span data-ty><pre>{
  "jsonrpc":"2.0",
  "id":1,
  "result":{
    "startingBlock":0,
    "currentBlock":3394816,
    "highestBlock":3394816
  }
}
  </pre></span>
</div>

!!! tip
    You can use the `system_health` command to verify your node is running properly.

    ```bash
    curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
    http://localhost:9944
    ```

## Commands for Managing Your Node

Use the following commands to manage your node:

=== "Docker"

    - **View node logs**:

        ```bash
        docker logs -f polkadot-hub-rpc
        ```

    - **Stop container**:

        ```bash
        docker stop polkadot-hub-rpc
        ```

    - **Start container**:

        ```bash
        docker start polkadot-hub-rpc
        ```

    - **Remove container**:

        ```bash
        docker rm polkadot-hub-rpc
        ```

=== "systemd"

    - **Check status**:

        ```bash
        sudo systemctl status polkadot-hub-rpc
        ```

    - **View node logs**:

        ```bash
        sudo journalctl -u polkadot-hub-rpc -f
        ```

    - **Stop service**:

        ```bash
        sudo systemctl stop polkadot-hub-rpc
        ```

    - **Enable service**:

        ```bash
        sudo systemctl enable polkadot-hub-rpc
        ```

    - **Start service**:

        ```bash
        sudo systemctl start polkadot-hub-rpc
        ```

## Ethereum RPC Compatibility

!!! note
    Ethereum RPC compatibility is supported only on some chains, such as Polkadot Hub.

Ethereum RPC compatibility is provided through the `eth-rpc` adapter, which is part of [pallet-revive](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/index.html){target=\_blank}. This adapter translates Ethereum JSON-RPC calls into Polkadot SDK-compatible requests, enabling integration with Ethereum tools like [MetaMask](https://metamask.io/){target=\_blank}, [Hardhat](https://hardhat.org/){target=\_blank}, and [Ethers.js](https://docs.ethers.org/v6/){target=\_blank}.

### Prerequisites

Before starting the Ethereum RPC adapter:

- **Node synchronization**: Your Polkadot Hub node must be fully synchronized. The `eth-rpc` adapter requires access to current chain state and fails to start if the node is still syncing.
- **Archive node recommended**: For full Ethereum RPC compatibility, run an archive node (`--state-pruning=archive`). The `eth-rpc` adapter may fail to query historical state on pruned nodes.
- **RPC accessibility**: The Polkadot SDK-based RPC endpoint must be accessible (default: `ws://127.0.0.1:9944`).

### Run the Ethereum RPC Adapter

You can run the Ethereum RPC adapter using Docker or as a systemd service.

=== "Docker"

    Start the adapter using the official [Parity eth-rpc Docker image](https://hub.docker.com/r/paritypr/eth-rpc/tags){target=\_blank}:

    ```bash
    docker run -d --name eth-rpc --restart unless-stopped \
      --network=host \
      -v /var/lib/eth-rpc:/data \
      paritypr/eth-rpc:master-1ea05e17 \
      --node-rpc-url=ws://127.0.0.1:9944 \
      --rpc-port=8545 \
      --base-path=/data \
      --unsafe-rpc-external \
      --rpc-cors=all
    ```

    !!! note
        The `-v` flag maps the host directory `/var/lib/eth-rpc` to `/data` inside the container. The `--base-path` flag references this container path to persist the `eth-rpc.db` database across restarts.

    !!! note
        Check the [Docker Hub tags page](https://hub.docker.com/r/paritypr/eth-rpc/tags){target=\_blank} for the latest image version. Tags follow the format `master-<commit-hash>`.

=== "systemd"

    1. Build the `eth-rpc` binary from the Polkadot SDK source:

        ```bash
        git clone https://github.com/paritytech/polkadot-sdk.git
        cd polkadot-sdk
        cargo build -p pallet-revive-eth-rpc --bin eth-rpc --release

        # Move to system path
        sudo mv target/release/eth-rpc /usr/local/bin/
        ```

        !!! note
            Pre-built binaries may not be available for all platforms. Building from source ensures compatibility with your system.

    2. Create a systemd service file:

        ```bash
        sudo nano /etc/systemd/system/eth-rpc.service
        ```

    3. Add the following configuration:

        ```ini
        [Unit]
        Description=Ethereum RPC Adapter for Polkadot Hub
        After=network.target polkadot-hub-rpc.service

        [Service]
        Type=simple
        User=polkadot
        Group=polkadot

        ExecStart=/usr/local/bin/eth-rpc \
          --node-rpc-url=ws://127.0.0.1:9944 \
          --rpc-port=8545 \
          --base-path=/var/lib/eth-rpc \
          --unsafe-rpc-external \
          --rpc-cors=all

        Restart=always
        RestartSec=10

        [Install]
        WantedBy=multi-user.target
        ```

        !!! warning
            The `--unsafe-rpc-external` flag exposes your RPC endpoint publicly. For production deployments, consider using a reverse proxy with authentication and rate limiting, or bind to a specific interface.

    4. Start the service:

        ```bash
        sudo systemctl daemon-reload
        sudo systemctl enable eth-rpc
        sudo systemctl start eth-rpc
        ```

### Ethereum RPC Configuration

The adapter accepts the following key parameters:

| Parameter | Description | Default |
|:---------:|:-----------:|:-------:|
| `--node-rpc-url` | Polkadot SDK-based node WebSocket URL | `ws://127.0.0.1:9944` |
| `--rpc-port` | Ethereum RPC server port | `8545` |
| `--unsafe-rpc-external` | Enable external RPC access | Disabled |
| `--rpc-cors` | CORS allowed origins | None |
| `--eth-pruning` | Block storage strategy: `archive` for persistent on-disk DB with full historical sync, or `<N>` for in-memory DB keeping latest N blocks | `archive` |
| `--base-path` | Directory for persistent database storage (`eth-rpc.db` is created inside this directory) | OS default data directory |
| `--dev` | Use temporary on-disk directory, deleted on exit | Disabled |

!!! warning
    The `--unsafe-rpc-external` flag exposes your RPC endpoint publicly. For production deployments, use a reverse proxy with proper authentication and rate limiting.

??? note "Migrating from previous CLI flags"
    As of [PR #11153](https://github.com/paritytech/polkadot-sdk/pull/11153){target=\_blank}, the following flags have been removed and replaced:

    | Previous Flag | Replacement |
    |:-------------:|:-----------:|
    | `--cache-size N` | `--eth-pruning=<N>` |
    | `--database-url sqlite::memory:` | `--eth-pruning=<N>` |
    | `--database-url /path/to/db` | `--base-path=/path/to/dir` |
    | `--index-last-n-blocks N` | `--eth-pruning=archive` |
    | `--earliest-receipt-block N` | Removed — the adapter now auto-discovers the first EVM block |

### API Endpoints

Your node setup provides two distinct API interfaces:

| Interface | Port | Protocol | Use Cases |
|:---------:|:----:|:--------:|:---------:|
| **Polkadot SDK RPC** | 9944 | WebSocket/HTTP | Polkadot SDK-native applications, parachain-specific operations, governance |
| **Ethereum RPC** | 8545 | HTTP | EVM libraries, Ethereum tools, EVM-compatible dApps |

### Verify the Ethereum RPC Adapter

To verify the Ethereum RPC adapter is working correctly, you can test standard Ethereum JSON-RPC methods like `eth_chainId`, `eth_blockNumber`, and `eth_getBlockByNumber`. For a complete list of supported methods and example queries, see the [JSON-RPC APIs](/smart-contracts/for-eth-devs/json-rpc-apis/){target=\_blank} reference.

### Manage the Ethereum RPC Adapter

=== "Docker"

    - **View logs**:

        ```bash
        docker logs -f eth-rpc
        ```

    - **Stop container**:

        ```bash
        docker stop eth-rpc
        ```

    - **Start container**:

        ```bash
        docker start eth-rpc
        ```

=== "systemd"

    - **Check status**:

        ```bash
        sudo systemctl status eth-rpc
        ```

    - **View logs**:

        ```bash
        sudo journalctl -u eth-rpc -f
        ```

    - **Stop service**:

        ```bash
        sudo systemctl stop eth-rpc
        ```

## Conclusion

Running a parachain RPC node provides critical infrastructure for accessing Polkadot network services. By following this guide, you have set up a production-ready RPC node that:

- Provides reliable access to parachain functionality for applications and users.
- Supports flexible deployment with both Docker and systemd options.
- Implements comprehensive monitoring, security, and maintenance practices.
- Can be adapted for any parachain by substituting the appropriate chain specification.
- Optionally enables Ethereum RPC compatibility for integration with EVM tools and wallets.

Whether you're running a node for system parachains (Asset Hub, People Chain, Bridge Hub, Coretime Chain) or other parachains in the ecosystem, regular maintenance and monitoring will ensure your RPC node continues to provide reliable service. Stay updated with the latest releases and best practices to keep your infrastructure secure and performant.

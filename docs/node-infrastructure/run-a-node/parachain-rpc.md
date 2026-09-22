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
- **Storage**: Storage requirements vary by parachain. Fast NVMe I/O is critical for RPC query performance
    - **System parachains**: [Snapshots](https://snapshots.polkadot.io/){target=\_blank} _may_ be available
        - **Archive node (complete history)**: Using snapshots, expected storage requirements (including ~1.2 TB for the pruned relay chain) are:
            - **Asset Hub**: ~2.4 TB
            - **People Chain**: ~1.6 TB
            - **Bridge Hub**: ~1.6 TB
            - **Coretime**: ~1.4 TB
        - **Pruned node (recent state)**: ~200 GB total for both parachain and relay chain
    - **Non-system parachains**: Consult the parachain team or documentation, then add ~822 GB for the pruned relay chain
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
              -v $(pwd)/asset-hub-polkadot.json:/asset-hub-polkadot.json \
              -v $(pwd)/my-node-data:/data \
              parity/polkadot-parachain:{{dependencies.repositories.polkadot_sdk.docker_image_version}} \
              --name=PolkadotHubRPC \
              --base-path=/data \
              --chain=/asset-hub-polkadot.json \
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
              -v $(pwd)/asset-hub-polkadot.json:/asset-hub-polkadot.json \
              -v $(pwd)/my-node-data:/data \
              parity/polkadot-parachain:{{dependencies.repositories.polkadot_sdk.docker_image_version}} \
              --name=PolkadotHubRPC \
              --base-path=/data \
              --chain=/asset-hub-polkadot.json \
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
        sudo cp asset-hub-polkadot.json /var/lib/polkadot-hub-rpc/

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
              --chain=/var/lib/polkadot-hub-rpc/asset-hub-polkadot.json \
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
              --chain=/var/lib/polkadot-hub-rpc/asset-hub-polkadot.json \
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
- **`--state-pruning`**: `archive` keeps complete state history, `[NUMBER]` keeps last specified number of blocks.
- **`--blocks-pruning`**: `archive` keeps complete state history, `[NUMBER]` keeps last specified number of finalized blocks.
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

## Conclusion

Running a parachain RPC node provides critical infrastructure for accessing Polkadot network services. By following this guide, you have set up a production-ready RPC node that:

- Provides reliable access to parachain functionality for applications and users.
- Supports flexible deployment with both Docker and systemd options.
- Implements comprehensive monitoring, security, and maintenance practices.
- Can be adapted for any parachain by substituting the appropriate chain specification.

Whether you're running a node for system parachains (Asset Hub, People Chain, Bridge Hub, Coretime Chain) or other parachains in the ecosystem, regular maintenance and monitoring will ensure your RPC node continues to provide reliable service. Stay updated with the latest releases and best practices to keep your infrastructure secure and performant.

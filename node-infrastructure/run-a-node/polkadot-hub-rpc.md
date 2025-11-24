---
title: Run an RPC Node for Polkadot Hub
description: Follow this guide to understand hardware and software requirements and how to set up and run an RPC node for Polkadot Hub with Polkadot SDK RPC endpoints.
categories: Infrastructure
---

# Run an RPC Node for Polkadot Hub

## Overview

[Polkadot Hub](/reference/polkadot-hub/){target=\_blank} is the entry point to Polkadot for all users and application developers. It provides access to essential Web3 services, including:

- **Asset Management**: Native support for fungible and non-fungible assets
- **Governance, Staking, and Treasury**: Core protocol operations
- **Cross-chain Communication**: XCM message handling

Running an RPC node for Polkadot Hub enables applications, wallets, and users to interact with the parachain through:
- **Polkadot SDK Node RPC** (Port 9944): Native Polkadot API (WebSocket and HTTP)

This setup enables block explorer indexing and provides full compatibility with Polkadot SDK development tools.

!!! note 
    
    The parameters and configurations in this guide are provided as illustrative examples. You may need to modify them according to your specific environment, hardware capabilities, and network conditions.

## Prerequisites

### Hardware Requirements

RPC nodes serving production traffic require robust hardware. The following should be considered the minimum standard to effectively operate an RPC node:

- **CPU**: 8+ cores (16+ cores for high traffic)
- **Memory**: 64 GB RAM minimum (128 GB recommended for high traffic)
- **Storage**:
    - 500 GB+ NVMe SSD for parachain state (archive nodes require 2-4 TB+)
    - Additional 200+ GB for relay chain pruned database
    - Fast disk I/O is critical for query performance
- **Network**:
    - Public IP address
    - 1 Gbps connection (for high traffic scenarios)
    - Stable internet connection with sufficient bandwidth
    - Open ports:
        - 30333 (parachain P2P)
        - 30334 (relay chain P2P)
        - 9944 (Polkadot SDK WebSocket RPC)
        - 9933 (Polkadot SDK HTTP RPC)
        - 9615 (Prometheus metrics - optional)
    - Consider DDoS protection and rate limiting for production deployments

**Note**: For development or low-traffic scenarios, you can reduce these requirements proportionally. Consider using a reverse proxy (nginx, Caddy) for production deployments.

### Software Requirements

Required software:

- **Operating System**: Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- **Docker**: Required for obtaining binaries and running containers
- **rclone**: (Optional but recommended) Command-line program for managing files on cloud storage (https://rclone.org/downloads/)

## Setup Options

This guide provides two options for deployment:

- **Docker-based Setup**: Best for simpler set up and maintenance
- **Manual/systemd Setup**: Best for production environments requiring more control

Select the best option for your project, then use the steps in the following tabs to complete set up.

=== "Docker-Based Setup"

    This option uses Docker containers for the Polkadot SDK node, making it easy to set up and manage. Follow these steps to set your RPC node using Docker:

    1. Download the official Polkadot Hub (formerly known as Asset Hub) chain specification:
        ```bash
        curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/asset-hub-polkadot.json -o asset-hub-polkadot.json
        ```

        !!! note

            This chain specification is the official configuration file that defines the network parameters for Polkadot Hub.

    2. (Optional but recommended) Download database snapshots
        - Using pre-synchronized snapshots significantly reduces initial sync time from several days to just a few hours. You need to download both parachain and relay chain data.
        - You can obtain the latest snapshot from the [Snapshot Provider](https://snapshots.polkadot.io/){target=\_blank}. Follow these steps to download and use snapshots:
            1. Create new directories with the following commands:
                ```bash
                mkdir -p my-node-data/chains/asset-hub-polkadot/db
                mkdir -p my-node-data/chains/polkadot/db
                ```
            2. Download the appropriate snapshot using the following commands:

                === "Archive snapshot"

                    Contains complete history, recommended for RPC with historical data.
                    ```bash
                    # Check https://snapshots.polkadot.io/ for the latest snapshot URL
                    export SNAPSHOT_URL_ASSET_HUB="https://snapshots.polkadot.io/polkadot-asset-hub-rocksdb-archive/LATEST"

                    rclone copyurl $SNAPSHOT_URL_ASSET_HUB/files.txt files.txt
                    rclone copy --progress --transfers 20 \
                    --http-url $SNAPSHOT_URL_ASSET_HUB \
                    --no-traverse --http-no-head --disable-http2 \
                    --inplace --no-gzip-encoding --size-only \
                    --retries 6 --retries-sleep 10s \
                    --files-from files.txt :http: my-node-data/chains/asset-hub-polkadot/db/

                    rm files.txt
                    ```

                    - `--transfers 20`: Uses 20 parallel transfers for faster download.
                    - `--retries 6`: Automatically retries failed transfers up to 6 times.
                    - `--retries-sleep 10s`: Waits 10 seconds between retry attempts.
                    - `--size-only`: Only transfers if sizes differ (prevents unnecessary re-downloads).

                === "Pruned snapshot"

                    Contains recent state for a smaller package size, recommended for RPC nodes.
                    ```bash
                    # Check https://snapshots.polkadot.io/ for the latest snapshot URL
                    export SNAPSHOT_URL_RELAY="https://snapshots.polkadot.io/polkadot-rocksdb-prune/LATEST"

                    rclone copyurl $SNAPSHOT_URL_RELAY/files.txt files.txt
                    rclone copy --progress --transfers 20 \
                      --http-url $SNAPSHOT_URL_RELAY \
                      --no-traverse --http-no-head --disable-http2 \
                      --inplace --no-gzip-encoding --size-only \
                      --retries 6 --retries-sleep 10s \
                      --files-from files.txt :http: my-node-data/chains/polkadot/db/

                      rm files.txt
                    ```
    3. Launch Polkadot Hub Node using the official [Parity Docker image](https://hub.docker.com/r/parity/polkadot-omni-node){target=\_blank} with the following command:
        ```bash
        docker run -d --name polkadot-hub-rpc --restart unless-stopped \
          -p 9944:9944 \
          -p 9933:9933 \
          -p 9615:9615 \
          -p 30334:30334 \
          -p 30333:30333 \
          -v $(pwd)/asset-hub-polkadot.json:/asset-hub-polkadot.json \
          -v $(pwd)/my-node-data:/data \
          parity/polkadot-omni-node:v1.20.2 \
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
          --blocks-pruning=archive-canonical
        ```

        Critical configuration parameters include port mappings and node parameters:

        === "Port mappings"

            - `9944`: Polkadot SDK RPC endpoint (WebSocket/HTTP)
            - `9933`: Polkadot SDK HTTP RPC endpoint
            - `9615`: Prometheus metrics endpoint
            - `30333/30334`: P2P networking ports

        === "Node parameters"

            - `--unsafe-rpc-external`: Enables external RPC access
            - `--rpc-cors=all`: Allows all origins for CORS
            - `--rpc-methods=safe`: Only allows safe RPC methods
            - `--state-pruning=archive`: Keeps complete state history
            - `--blocks-pruning=archive`: Keeps all block data
            - `--prometheus-external`: Exposes metrics externally

        !!! warning

            The `--unsafe-rpc-external` flag should only be used in development or properly secured environments. For production, use a reverse proxy with authentication.

    4. Monitor the node synchronization status using the following command:
          ```bash
          curl -H "Content-Type: application/json" \
          -d '{"id":1, "jsonrpc":"2.0", "method": "system_syncState", "params":[]}' \
          http://localhost:9944
          ```

        You should see a response similar to the following:

        ```json
        {
          "jsonrpc":"2.0",
          "id":1,
          "result":{
            "startingBlock":0,
            "currentBlock":3394816,
            "highestBlock":3394816
          }
        }
        ```

        When synchronization is complete, `currentBlock` will be equal to `highestBlock`.

    5. You can use a few different commands to verify your node is running properly:

        - Get chain information:
            ```bash
            curl -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
            http://localhost:9944
            ```
        - Get the latest block:
            ```bash
            curl -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getHeader", "params":[]}' \
            http://localhost:9944
            ```
        - Query node health:
            ```bash
            curl -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
            http://localhost:9944
            ```

    6. Use the following commands to manage your Docker containers:

        - View node logs:
            ```bash
            docker logs -f polkadot-hub-rpc
            ```
        - Stop container:
            ```bash
            docker stop polkadot-hub-rpc
            ```
        - Start container:
            ```bash
            docker start polkadot-hub-rpc
            ```
        - Remove container:
            ```bash
            docker rm polkadot-hub-rpc
            ```

=== "Manual systemd Setup"

    This option uses systemd to provide more control and is recommended for production environments requiring custom configurations.

    1. Install Rust and required toolchain using the following command:
        ```bash
        # Install Rust
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
        source $HOME/.cargo/env

        # Install specific Rust version
        rustup install 1.91.1
        rustup default 1.91.1
        rustup target add wasm32-unknown-unknown --toolchain 1.91.1
        rustup component add rust-src --toolchain 1.91.1
        ```

    2. Install required dependencies using the following commands:
        - System dependencies:
            ```bash
            sudo apt update
            sudo apt install -y build-essential git clang curl libssl-dev llvm libudev-dev make protobuf-compiler
            ```
        - Polkadot Omni node:
            ```bash
            cargo install --locked polkadot-omni-node@0.11.0
            ```
            You can verify successful installation of Polkadot Omni node using the version command:
            ```bash
            polkadot-omni-node --version
            ```

            !!! tip

                Compiling polkadot-omni-node from source requires significant RAM (minimum 24GB recommended). The compilation may take 10-15 minutes on systems with adequate resources.

    3. Download the Polkadot Hub chain specification:
        ```bash
        curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/asset-hub-polkadot.json -o asset-hub-polkadot.json
        ```

    4. Create user and directory structures using the following commands:
        - Create a dedicated user:
            ```bash
            sudo useradd -r -s /bin/bash polkadot
            ```
        - Create data directory:
            ```bash
            sudo mkdir -p /var/lib/polkadot-hub-rpc
            ```
        - Copy the chain spec to the directory:
            ```bash
            sudo cp asset-hub-polkadot.json /var/lib/polkadot-hub-rpc/
            ```
        - Set permissions:
            ```bash
            sudo chown -R polkadot:polkadot /var/lib/polkadot-hub-rpc
            ```

    5. Create a systemd service file for the Polkadot SDK RPC node:
        ```bash
        sudo nano /etc/systemd/system/polkadot-hub-rpc.service
        ```

    6. Open the new service file and add the following configuration:
        ```ini
        [Unit]
        Description=Polkadot Hub RPC Node
        After=network.target

        [Service]
        Type=simple
        User=polkadot
        Group=polkadot
        WorkingDirectory=/var/lib/polkadot-hub-rpc

        ExecStart=/usr/local/bin/polkadot-omni-node \
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
          --blocks-pruning=archive-canonical

        Restart=always
        RestartSec=10
        LimitNOFILE=65536

        [Install]
        WantedBy=multi-user.target
        ```

    7. Start the service using the following commands:
        - Reload systemd:
            ```bash
            sudo systemctl daemon-reload
            ```
        - Enable service to start on boot:
            ```bash
            sudo systemctl enable polkadot-hub-rpc
            ```
        - Start the Polkadot SDK node:
            ```bash
            sudo systemctl start polkadot-hub-rpc
            ```
        - Check status and wait for sync:
            ```bash
            sudo systemctl status polkadot-hub-rpc
            sudo journalctl -u polkadot-hub-rpc -f
            ```

    8. You can use a few different commands to verify your node is running properly:
        - Get chain information:
            ```bash
            curl -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
            http://localhost:9944
            ```
        - Get the latest block:
            ```bash
            curl -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getHeader", "params":[]}' \
            http://localhost:9944
            ```
        - Query node health:
            ```bash
            curl -H "Content-Type: application/json" \
            -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
            http://localhost:9944
            ```

## Monitor and Maintain RPC Node

There are a few key monitoring and maintenance commands that can help you ensure RPC node uptime and performance including log monitoring and metrics.

To view node logs, use the appropriate command for your setup:

=== "Docker Setup"

    ```bash
    docker logs -f polkadot-hub-rpc
    ```

=== "systemd Setup"

    - View node logs:
        ```bash
        sudo journalctl -u polkadot-hub-rpc -f
        ```
    - View recent logs:
        ```bash
        sudo journalctl -u polkadot-hub-rpc -n 100
        ```
    - Filter for errors:
        ```bash
        sudo journalctl -u polkadot-hub-rpc | grep -i error
        ```

Monitoring key metrics like the following items can help you stay up to date on the performance and health of your node and allow you to intervene at the first sign of issues:

- **Sync status**: Ensure node stays fully synced.
- **Peer connections**: Maintain 30+ peers for good connectivity.
- **Resource usage**: Monitor CPU, RAM, and disk I/O.
- **RPC request latency**: Track response times for the Polkadot SDK API.
- **Connection count**: Monitor active RPC connections.

You can use the following information to configure [Prometheus](https://prometheus.io/docs/introduction/first_steps/){target=\_blank} to monitor, collect, and store your RPC node metrics:

- **URL**: Metrics are available to view at `http://localhost:9615/metrics`
- **Example Prometheus configuration**: Update your `prometheus.yml` to add the following code:
    ```yaml
    scrape_configs:
      - job_name: 'polkadot-hub-rpc'
        static_configs:
          - targets: ['localhost:9615']
    ```

Key metrics to monitor via Prometheus include:

- `substrate_block_height`: Current block height
- `substrate_finalized_height`: Finalized block height
- `substrate_peers_count`: Number of connected peers
- `substrate_ready_transactions_number`: Transaction queue size

### Database Maintenance

Check database size periodically using the commands for your selected setup:

=== "Docker Setup"

    ```bash
    du -sh my-node-data
    ```

=== "systemd Setup"

    ```bash
    du -sh /var/lib/polkadot-hub-rpc
    ```

The node handles pruning automatically based on configuration unless running in archive mode.

### Updates and Upgrades

Use the following commands for updating or upgrading your RPC node according to your setup:

=== "Docker Setup"

    1. Stop and remove the existing container:
        ```bash
        docker stop polkadot-hub-rpc
        docker rm polkadot-hub-rpc
        ```
    2. Pull the latest image:
        ```bash
        docker pull parity/polkadot-omni-node:<NEW_TAG>
        ```
    3. Start the new container using the same command from the setup section with the updated image tag.

=== "systemd Setup"

    1. Stop the service:
        ```bash
        sudo systemctl stop polkadot-hub-rpc
        ```
    2. Backup data:
        ```bash
        sudo cp -r /var/lib/polkadot-hub-rpc /var/lib/polkadot-hub-rpc.backup
        ```
    3. Update the binary:
        ```bash
        cargo install --locked --force polkadot-omni-node@<NEW_VERSION>
        ```
    4. Restart the service:
        ```bash
        sudo systemctl start polkadot-hub-rpc
        ```

## Conclusion

Running an RPC node for Polkadot Hub provides essential infrastructure for applications and users to interact with the network. By following this guide, you have set up a production-ready RPC node that:

- Provides reliable access to Polkadot Hub's asset management, governance, and cross-chain communication features.
- Supports both Docker and systemd deployment options for flexibility.
- Implements proper monitoring, security, and maintenance practices.
- Serves as a foundation for building and operating Polkadot SDK applications.

Regular maintenance, security updates, and monitoring will ensure your RPC node continues to serve your users reliably. As the Polkadot network evolves, stay informed about updates and best practices through the official channels and community resources listed in this guide.

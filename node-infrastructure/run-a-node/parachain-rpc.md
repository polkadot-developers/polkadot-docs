---
title: Run a Parachain RPC Node
description: Complete guide to set up and run an RPC node for any Polkadot parachain, with system parachains as examples.
categories: Infrastructure
---

# Run a Parachain RPC Node

## Overview

Running an RPC node for a parachain enables applications, wallets, and users to interact with the parachain's functionality.

Each parachain RPC node provides access through the Polkadot SDK Node RPC (Port 9944), offering native Polkadot API access via WebSocket and HTTP. This setup enables block explorer indexing and provides full compatibility with Polkadot SDK development tools.

!!! note

    The parameters and configurations in this guide are provided as illustrative examples. You may need to modify them according to your specific environment, hardware capabilities, and network conditions.

## Obtaining a Chain Specification

To run an RPC node for any parachain, you need its **chain specification file**. This JSON file defines the network parameters, genesis state, and bootnodes.

### System Parachains

System parachain chain specs are available from multiple sources:

**Option 1: Chainspec Collection (Recommended)**

Visit the [Chainspec Collection](https://paritytech.github.io/chainspecs/) to download official chain specifications.

**Option 2: Polkadot SDK Repository**

Download directly from the Polkadot SDK repository:

```bash
# Example for People Chain
curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/people-polkadot.json -o chain-spec.json
```

| System Parachain | Para ID | Chain Spec File | Snapshot Path |
|------------------|---------|-----------------|---------------|
| **Bridge Hub** | 1002 | `bridge-hub-polkadot.json` | `polkadot-bridge-hub-rocksdb-archive` |
| **People Chain** | 1004 | `people-polkadot.json` | `polkadot-people-rocksdb-archive` |
| **Coretime Chain** | 1005 | `coretime-polkadot.json` | `polkadot-coretime-rocksdb-archive` |

### Other Parachains

For non-system parachains, check the parachain's documentation for official chain specification files.

!!! note

    Throughout this guide, we use **People Chain** as the example. To set up a different parachain, substitute the chain spec file, snapshot path, and chain name with values for your target parachain.

## Prerequisites

### Hardware Requirements

RPC nodes serving production traffic require robust hardware:

- **CPU**: 8+ cores (16+ cores for high traffic)
- **Memory**: 64 GB RAM minimum (128 GB recommended for high traffic)
- **Storage**:
    - Storage requirements vary by parachain. System parachains: Asset Hub (~600-800 GB), Bridge Hub (~500-600 GB), Collectives (~400-500 GB), People Chain (~300-400 GB), Coretime (~300-400 GB). For non-system parachains, check the [snapshot sizes](https://snapshots.polkadot.io/){target=\_blank} if available.
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
    - Consider DDoS protection and rate limiting for production deployments

!!! note

    For development or low-traffic scenarios, you can reduce these requirements proportionally. Consider using a reverse proxy (nginx, Caddy) for production deployments.

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

    1. Download your parachain's chain specification as described in [Obtaining a Chain Specification](#obtaining-a-chain-specification).

    2. (Optional but recommended) Download database snapshots:
        - Using pre-synchronized snapshots significantly reduces initial sync time from several days to just a few hours. You need to download both parachain and relay chain data.
        - You can obtain the latest snapshot from the [Snapshot Provider](https://snapshots.polkadot.io/){target=\_blank}. Follow these steps to download and use snapshots:

            !!! note

                Snapshots are available for system parachains and the Polkadot relay chain. For other parachains, check with the parachain team for snapshot availability or sync from genesis.

            1. Create new directories with the following commands:
                ```bash
                mkdir -p my-node-data/chains/people-polkadot/db
                mkdir -p my-node-data/chains/polkadot/db
                ```
            2. Download the appropriate snapshots using the following commands:

                === "Archive Node"

                    Archive node setup maintains complete parachain history. Download both parachain archive and relay chain pruned snapshots:

                    **Parachain archive snapshot** (People Chain example):
                    ```bash
                    # Check https://snapshots.polkadot.io/ for the latest snapshot URL
                    export SNAPSHOT_URL_PARACHAIN="https://snapshots.polkadot.io/polkadot-people-rocksdb-archive/LATEST"

                    rclone copyurl $SNAPSHOT_URL_PARACHAIN/files.txt files.txt
                    rclone copy --progress --transfers 20 \
                      --http-url $SNAPSHOT_URL_PARACHAIN \
                      --no-traverse --http-no-head --disable-http2 \
                      --inplace --no-gzip-encoding --size-only \
                      --retries 6 --retries-sleep 10s \
                      --files-from files.txt :http: my-node-data/chains/people-polkadot/db/

                    rm files.txt
                    ```

                    **Relay chain pruned snapshot** (~200 GB):
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

                    **rclone parameters:**

                    - `--transfers 20`: Uses 20 parallel transfers for faster download
                    - `--retries 6`: Automatically retries failed transfers up to 6 times
                    - `--retries-sleep 10s`: Waits 10 seconds between retry attempts
                    - `--size-only`: Only transfers if sizes differ (prevents unnecessary re-downloads)

                === "Pruned Node"

                    Pruned node setup keeps recent state for smaller storage. Download both parachain pruned and relay chain pruned snapshots:

                    **Parachain pruned snapshot** (People Chain example):
                    ```bash
                    # Check https://snapshots.polkadot.io/ for the latest snapshot URL
                    export SNAPSHOT_URL_PARACHAIN="https://snapshots.polkadot.io/polkadot-people-rocksdb-prune/LATEST"

                    rclone copyurl $SNAPSHOT_URL_PARACHAIN/files.txt files.txt
                    rclone copy --progress --transfers 20 \
                      --http-url $SNAPSHOT_URL_PARACHAIN \
                      --no-traverse --http-no-head --disable-http2 \
                      --inplace --no-gzip-encoding --size-only \
                      --retries 6 --retries-sleep 10s \
                      --files-from files.txt :http: my-node-data/chains/people-polkadot/db/

                    rm files.txt
                    ```

                    **Relay chain pruned snapshot** (~200 GB):
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

                    **rclone parameters:**

                    - `--transfers 20`: Uses 20 parallel transfers for faster download
                    - `--retries 6`: Automatically retries failed transfers up to 6 times
                    - `--retries-sleep 10s`: Waits 10 seconds between retry attempts
                    - `--size-only`: Only transfers if sizes differ (prevents unnecessary re-downloads)

    3. Launch the parachain node using the official [Parity Docker image](https://hub.docker.com/r/parity/polkadot-parachain){target=\_blank}:

        === "Archive Node"

            Archive node configuration maintains complete parachain history for historical queries:

            ```bash
            docker run -d --name people-chain-rpc --restart unless-stopped \
              -p 9944:9944 \
              -p 9933:9933 \
              -p 9615:9615 \
              -p 30334:30334 \
              -p 30333:30333 \
              -v $(pwd)/people-polkadot.json:/people-polkadot.json \
              -v $(pwd)/my-node-data:/data \
              parity/polkadot-parachain:stable2509-2 \
              --name=PeopleChainRPC \
              --base-path=/data \
              --chain=/people-polkadot.json \
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

        === "Pruned Node"

            Pruned node configuration keeps recent state for smaller storage requirements:

            ```bash
            docker run -d --name people-chain-rpc --restart unless-stopped \
              -p 9944:9944 \
              -p 9933:9933 \
              -p 9615:9615 \
              -p 30334:30334 \
              -p 30333:30333 \
              -v $(pwd)/people-polkadot.json:/people-polkadot.json \
              -v $(pwd)/my-node-data:/data \
              parity/polkadot-parachain:stable2509-2 \
              --name=PeopleChainRPC \
              --base-path=/data \
              --chain=/people-polkadot.json \
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
            - `--state-pruning=archive` or `--state-pruning=1000`: Archive keeps complete state history, pruned keeps last 1000 blocks
            - `--blocks-pruning=archive` or `--blocks-pruning=256`: Archive keeps all blocks, pruned keeps last 256 finalized blocks
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
            docker logs -f people-chain-rpc
            ```
        - Stop container:
            ```bash
            docker stop people-chain-rpc
            ```
        - Start container:
            ```bash
            docker start people-chain-rpc
            ```
        - Remove container:
            ```bash
            docker rm people-chain-rpc
            ```

=== "Manual systemd Setup"

    This option provides more control and is recommended for production environments requiring custom configurations.

    1. Download the `polkadot-parachain` binary from the latest stable [Polkadot SDK release](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}:
        ```bash
        # Download the latest stable release (check releases page for current version)
        wget https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2509-2/polkadot-parachain

        # Make it executable and move to system path
        chmod +x polkadot-parachain
        sudo mv polkadot-parachain /usr/local/bin/

        # Verify installation
        polkadot-parachain --version
        ```

        Check the [Polkadot SDK releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} page for the latest stable version.

    2. Download your parachain's chain specification as described in [Obtaining a Chain Specification](#obtaining-a-chain-specification).

    3. Create user and directory structures using the following commands:
        - Create a dedicated user:
            ```bash
            sudo useradd -r -s /bin/bash polkadot
            ```
        - Create data directory:
            ```bash
            sudo mkdir -p /var/lib/people-chain-rpc
            ```
        - Copy the chain spec to the directory:
            ```bash
            sudo cp people-polkadot.json /var/lib/people-chain-rpc/
            ```
        - Set permissions:
            ```bash
            sudo chown -R polkadot:polkadot /var/lib/people-chain-rpc
            ```

    4. Create a systemd service file for the Polkadot SDK RPC node:
        ```bash
        sudo nano /etc/systemd/system/people-chain-rpc.service
        ```

    5. Open the new service file and add the configuration for your chosen node type:

        === "Archive Node"

            Archive node configuration maintains complete parachain history for historical queries:

            ```ini
            [Unit]
            Description=People Chain RPC Node
            After=network.target

            [Service]
            Type=simple
            User=polkadot
            Group=polkadot
            WorkingDirectory=/var/lib/people-chain-rpc

            ExecStart=/usr/local/bin/polkadot-parachain \
              --name=PeopleChainRPC \
              --chain=/var/lib/people-chain-rpc/people-polkadot.json \
              --base-path=/var/lib/people-chain-rpc \
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
              --base-path=/var/lib/people-chain-rpc \
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

        === "Pruned Node"

            Pruned node configuration keeps recent state for smaller storage requirements:

            ```ini
            [Unit]
            Description=People Chain RPC Node
            After=network.target

            [Service]
            Type=simple
            User=polkadot
            Group=polkadot
            WorkingDirectory=/var/lib/people-chain-rpc

            ExecStart=/usr/local/bin/polkadot-parachain \
              --name=PeopleChainRPC \
              --chain=/var/lib/people-chain-rpc/people-polkadot.json \
              --base-path=/var/lib/people-chain-rpc \
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
              --base-path=/var/lib/people-chain-rpc \
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

    6. Start the service using the following commands:
        - Reload systemd:
            ```bash
            sudo systemctl daemon-reload
            ```
        - Enable service to start on boot:
            ```bash
            sudo systemctl enable people-chain-rpc
            ```
        - Start the Polkadot SDK node:
            ```bash
            sudo systemctl start people-chain-rpc
            ```
        - Check status and wait for sync:
            ```bash
            sudo systemctl status people-chain-rpc
            sudo journalctl -u people-chain-rpc -f
            ```

    7. You can use a few different commands to verify your node is running properly:
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

## Conclusion

Running a parachain RPC node provides critical infrastructure for accessing Polkadot network services. By following this guide, you have set up a production-ready RPC node that:

- Provides reliable access to parachain functionality for applications and users.
- Supports flexible deployment with both Docker and systemd options.
- Implements comprehensive monitoring, security, and maintenance practices.
- Can be adapted for any parachain by substituting the appropriate chain specification.

Whether you're running a node for system parachains (People Chain, Bridge Hub, Coretime Chain) or other parachains in the ecosystem, regular maintenance and monitoring will ensure your RPC node continues to provide reliable service. Stay updated with the latest releases and best practices to keep your infrastructure secure and performant.

---
title: Run an RPC Node for Polkadot Hub
description: Follow this guide to understand hardware and software requirements and how to set up and run an RPC node for Polkadot Hub with Polkadot SDK RPC endpoints.
categories: Infrastructure
---

# Run an RPC Node for Polkadot Hub

## Introduction

Polkadot Hub is the gateway to the Polkadot network, providing access to core services such as asset management, governance, and cross-chain messaging. Running your own RPC node gives developers and applications direct access to these services while also supporting infrastructure tasks like block indexing and SDK tool compatibility.

<!-- TODO POST-MVP: Update above link
[Polkadot Hub](/reference/polkadot-hub/){target=\_blank} -->

Through the Polkadot SDK node RPC (WebSocket port 9944, HTTP port 9933), your node serves as the bridge between the network and applications. This page guides you through setting up a node from scratch, including hardware requirements and deployment options using Docker or systemd.

## Prerequisites

### Hardware Requirements

RPC nodes serving production traffic require robust hardware. The following should be considered the minimum standard to effectively operate an RPC node:

- **CPU**: 8+ cores; 16+ cores for high traffic
- **Memory**: 64 GB RAM minimum; 128 GB recommended for high traffic
- **Storage**:
    - **Archive node (complete history)**: ~1.2 TB NVMe SSD total (~392 GB for Asset Hub archive + ~822 GB for relay chain pruned snapshot)
    - **Pruned node (recent state)**: ~200 GB NVMe SSD total (with pruning enabled for both parachain and relay chain)
    - Fast disk I/O is critical for query performance
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

## Spin Up a Node

This guide provides two options for deployment:

- **Docker**: Best for simpler set up and maintenance
- **systemd**: Best for production environments requiring more control

Select the best option for your project, then use the steps in the following tabs to complete set up.

=== "Docker"

    1. Download the official Polkadot Hub (formerly known as Asset Hub) chain specification file:

        ```bash
        curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/asset-hub-polkadot.json -o asset-hub-polkadot.json
        ```

    2. (Optional but recommended) Download pre-synced snapshots from the [Snapshot Provider](https://snapshots.polkadot.io/){target=\_blank} to cut initial sync time from days to hours:

        1. Create new directories:

            ```bash
            mkdir -p my-node-data/chains/asset-hub-polkadot/db
            mkdir -p my-node-data/chains/polkadot/db
            ```

        2. Download and save the archive Asset Hub snapshot:

            ```bash
            # Check https://snapshots.polkadot.io/ for the latest snapshot URL
            export SNAPSHOT_URL_ASSET_HUB="https://snapshots.polkadot.io/polkadot-asset-hub-rocksdb-archive/INSERT_LATEST"

            rclone copyurl $SNAPSHOT_URL_ASSET_HUB/files.txt files.txt
            rclone copy --progress --transfers 20 \
              --http-url $SNAPSHOT_URL_ASSET_HUB \
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

        3. Repeat the process with the pruned relay chain snapshot:

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

    3. Launch your Polkadot Hub node using the official [Parity Docker image](https://hub.docker.com/r/parity/polkadot-parachain){target=\_blank}:

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
              parity/polkadot-parachain:stable2509-2 \
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
              parity/polkadot-parachain:stable2509-2 \
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

        Refer to the [Port Mappings](#port-mappings) and [Node Configuration Arguments](#node-configuration-arguments) sections for details on the command's configurations.
    
=== "systemd"

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

    2. Download the Polkadot Hub chain specification:

        ```bash
        curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/asset-hub-polkadot.json -o asset-hub-polkadot.json
        ```

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

        === "Pruned Node"

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

        Refer to the [Port Mappings](#port-mappings) and [Node Configuration Arguments](#node-configuration-arguments) sections for details on the command's configurations.

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

### Node Configuration Arguments

- **`--unsafe-rpc-external`**: Enables external RPC access. **This command should only be used in development or properly secured environments**. For production, use a reverse proxy with authentication.
- **`--rpc-cors=all`**: Allows all origins for CORS.
- **`--rpc-methods=safe`**: Only allows safe RPC methods.
- **`--state-pruning`**: Archive keeps complete state history, pruned keeps last specified number of blocks.
- **`--blocks-pruning`**: Archive keeps all blocks, pruned keeps last specified number of finalized blocks.
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

Running an RPC node for Polkadot Hub provides essential infrastructure for applications and users to interact with the network. By following this guide, you have set up a production-ready RPC node that:

- Provides reliable access to Polkadot Hub's asset management, governance, and cross-chain communication features.
- Supports both Docker and systemd deployment options for flexibility.
- Implements proper monitoring, security, and maintenance practices.
- Serves as a foundation for building and operating Polkadot SDK applications.

Regular maintenance, security updates, and monitoring will ensure your RPC node continues to serve your users reliably. As the Polkadot network evolves, stay informed about updates and best practices through the official channels and community resources listed in this guide.

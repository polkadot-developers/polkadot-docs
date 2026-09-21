---
title: Run an RPC Node for Polkadot Hub
description: Learn how to set up and run an RPC node for Polkadot Hub with Polkadot SDK RPC endpoints and optional Ethereum JSON-RPC compatibility.
categories: Infrastructure
---

# Run an RPC Node for Polkadot Hub

[Polkadot Hub](/reference/polkadot-hub/){target=\_blank} is the gateway to the Polkadot network, providing access to core services such as asset management, governance, and cross-chain messaging. Running your own RPC node gives developers and applications direct access to these services while also supporting infrastructure tasks like block indexing and SDK tool compatibility.

Follow the [Parachain RPC Node](./parachain-rpc.md) guide in order to spin up a Polkadot Hub RPC node.

## Ethereum RPC Compatibility

Polkadot Hub supports Ethereum RPC compatibility through the `eth-rpc` adapter, which is part of [pallet-revive](https://paritytech.github.io/polkadot-sdk/master/pallet_revive_eth_rpc/index.html){target=\_blank}. This adapter translates Ethereum JSON-RPC calls into Polkadot SDK-compatible requests, enabling seamless integration with Ethereum tools like [MetaMask](https://metamask.io/){target=\_blank}, [Hardhat](https://hardhat.org/){target=\_blank}, and [Ethers.js](https://docs.ethers.org/v6/){target=\_blank}.

### Prerequisites

Before starting the Ethereum RPC adapter:

- **Node synchronization** - your Polkadot Hub node must be **fully synchronized**. The eth-rpc adapter requires access to current chain state and will fail to start if the node is still syncing
- **Archive node recommended** - for full Ethereum RPC compatibility, running an **archive node** (`--state-pruning=archive`) is recommended. The eth-rpc adapter may fail to query historical state on pruned nodes
- **RPC accessibility** - the Polkadot SDK-based RPC endpoint must be accessible (default: `ws://127.0.0.1:9944`)

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

---
title: Run an RPC Node for System Parachains
description: Complete guide to set up and run an RPC node for Polkadot system parachains including Bridge Hub, People Chain, and Coretime Chain.
categories: Infrastructure
---

# Run an RPC Node for System Parachains

## Overview

System parachains are core infrastructure parachains that provide essential services to the Polkadot network. Running an RPC node for these parachains enables applications, wallets, and users to interact with their specialized functionality:

- **Bridge Hub**: Cross-chain asset transfers via trustless bridges
- **People Chain**: Identity and social credential management
- **Coretime Chain**: Blockspace allocation and core time management

Each system parachain RPC node provides access through:
- **Polkadot SDK Node RPC** (Port 9944): Native Polkadot API (WebSocket and HTTP)

This setup enables block explorer indexing and provides full compatibility with Polkadot SDK development tools.

**Important Note**: The parameters and configurations in this guide are provided as illustrative examples. You may need to modify them according to your specific environment, hardware capabilities, and network conditions.

## Choosing a System Parachain

This guide uses **People Chain** as the example, but the same principles and setup procedures apply to all system parachains. Simply substitute the appropriate values from the table below for your chosen parachain:

| Parachain | Para ID | Chain Spec File | Snapshot Path | Chain Name |
|-----------|---------|-----------------|---------------|------------|
| **Bridge Hub** | 1002 | `bridge-hub-polkadot.json` | `polkadot-bridge-hub-rocksdb-archive` | `bridge-hub-polkadot` |
| **People Chain** | 1004 | `people-polkadot.json` | `polkadot-people-rocksdb-archive` | `people-polkadot` |
| **Coretime Chain** | 1005 | `coretime-polkadot.json` | `polkadot-coretime-rocksdb-archive` | `coretime-polkadot` |

**Note**: Throughout this guide, we use People Chain values. To set up a different system parachain, replace the chain spec file, snapshot path, and chain name with the corresponding values from the table above.

## Prerequisites

### Hardware Requirements

RPC nodes serving production traffic require robust hardware:

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
- **Docker**: Latest version installed and running (for Docker-based setup)
- **rclone**: (Optional but recommended) Command-line program for managing files on cloud storage (https://rclone.org/downloads/)
- **Rust Toolchain**: Version 1.86 or as specified by runtime (for manual build)

## Setup Options

This guide provides two deployment options:

1. **Docker-based Setup**: Simpler to set up and maintain
2. **Manual/Systemd Setup**: For production environments requiring more control

Choose the option that best fits your needs.

---

## Option 1: Docker-Based Setup

This option uses Docker containers for the Polkadot SDK node, making it easy to set up and manage.

### Step 1: Download Chain Specification

Download the official chain specification for People Chain:

```bash
curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/people-polkadot.json -o people-polkadot.json
```

**Note**: This chain specification is the official configuration file that defines the network parameters for People Chain.

### Step 2: Download Database Snapshots (Optional but Recommended)

Using pre-synchronized snapshots significantly reduces initial sync time from several days to just a few hours. You need to download both parachain and relay chain data.

**Snapshot Provider**: https://snapshots.polkadot.io/

#### Create Directories

```bash
mkdir -p my-node-data/chains/people-polkadot/db
mkdir -p my-node-data/chains/polkadot/db
```

#### Download People Chain Snapshot

Choose between archive (complete history) or pruned (recent state) snapshots.

**Archive Snapshot** (recommended for RPC with historical data):

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

**Parameter Explanation**:
- `--transfers 20`: Uses 20 parallel transfers for faster download
- `--retries 6`: Automatically retries failed transfers up to 6 times
- `--retries-sleep 10s`: Waits 10 seconds between retry attempts
- `--size-only`: Only transfers if sizes differ (prevents unnecessary re-downloads)

**Note**: If a snapshot is not available, you can sync from scratch (which will take longer) or check https://snapshots.polkadot.io/ for alternative snapshot providers.

#### Download Polkadot Relay Chain Snapshot

**Pruned Snapshot** (recommended for RPC nodes):

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

**Alternative Options**:
- Pruned snapshot: `polkadot-rocksdb-prune` (smaller size, recent state)
- Archive snapshot: `polkadot-rocksdb-archive` (complete history, larger size)

### Step 3: Start People Chain Node

Launch the node using the official Parity Docker image.

**Docker Image**: https://hub.docker.com/r/parity/polkadot-omni-node

```bash
docker run -d --name people-chain-rpc --restart unless-stopped \
  -p 9944:9944 \
  -p 9933:9933 \
  -p 9615:9615 \
  -p 30334:30334 \
  -p 30333:30333 \
  -v $(pwd)/people-polkadot.json:/people-polkadot.json \
  -v $(pwd)/my-node-data:/data \
  parity/polkadot-omni-node:stable2506-4 \
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
  --blocks-pruning=archive-canonical
```

**Critical Configuration Parameters**:

**Port Mappings**:
- `9944`: Polkadot SDK RPC endpoint (WebSocket/HTTP)
- `9933`: Polkadot SDK HTTP RPC endpoint
- `9615`: Prometheus metrics endpoint
- `30333/30334`: P2P networking ports

**Node Parameters**:
- `--unsafe-rpc-external`: Enables external RPC access
- `--rpc-cors=all`: Allows all origins for CORS
- `--rpc-methods=safe`: Only allows safe RPC methods
- `--state-pruning=archive`: Keeps complete state history
- `--blocks-pruning=archive`: Keeps all block data
- `--prometheus-external`: Exposes metrics externally

**Security Warning**: The `--unsafe-rpc-external` flag should only be used in development or properly secured environments. For production, use a reverse proxy with authentication.

### Step 4: Monitor Synchronization

Monitor the node synchronization status:

```bash
# Check sync status
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_syncState", "params":[]}' \
  http://localhost:9944
```

**Expected Response Format**:

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

**Synchronization Status**:
- **In Progress**: `currentBlock` < `highestBlock`
- **Complete**: `currentBlock` = `highestBlock`

**Monitor logs**:

```bash
# View node logs
docker logs -f people-chain-rpc

# Filter for sync messages
docker logs people-chain-rpc 2>&1 | grep -i "syncing"
```

### Step 5: Verify Setup

Let's verify the Polkadot SDK RPC endpoint is working correctly.

#### API Endpoint

**Polkadot SDK RPC (Port 9944)**:
- WebSocket: `ws://your-server:9944`
- HTTP: `http://your-server:9944`
- Purpose: Full Polkadot SDK API access for parachain data
- Use Cases: Polkadot SDK applications, parachain-specific operations

#### Polkadot SDK RPC Tests

**Get Chain Information**:

```bash
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_chain", "params":[]}' \
  http://localhost:9944
```

**Expected Response**:
```json
{
  "jsonrpc":"2.0",
  "id":1,
  "result":"Polkadot People"
}
```

**Get Latest Block**:

```bash
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "chain_getHeader", "params":[]}' \
  http://localhost:9944
```

**Get Node Health**:

```bash
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_health", "params":[]}' \
  http://localhost:9944
```

**Get Peer Count**:

```bash
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "system_peers", "params":[]}' \
  http://localhost:9944
```

### Managing Docker Containers

**View logs**:

```bash
docker logs -f people-chain-rpc
```

**Stop container**:

```bash
docker stop people-chain-rpc
```

**Start container**:

```bash
docker start people-chain-rpc
```

**Remove container**:

```bash
docker rm people-chain-rpc
```

**Update container**:

```bash
# Pull latest image
docker pull parity/polkadot-omni-node:stable2506-4

# Stop and remove old container
docker stop people-chain-rpc
docker rm people-chain-rpc

# Start new container with same command as above
```

---

## Option 2: Manual/Systemd Setup

This option provides more control and is recommended for production environments requiring custom configurations.

### Step 1: Install Rust and Required Toolchain

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install specific Rust version
rustup install 1.86
rustup default 1.86
rustup target add wasm32-unknown-unknown --toolchain 1.86
rustup component add rust-src --toolchain 1.86
```

### Step 2: Install the Polkadot Omni Node

```bash
# Install polkadot-omni-node
cargo install --locked polkadot-omni-node@0.7.0

# Verify installation
polkadot-omni-node --version
```

### Step 3: Obtain Chain Specification

Download the People Chain specification:

```bash
curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/master/cumulus/parachains/chain-specs/people-polkadot.json -o people-polkadot.json
```

### Step 4: Create User and Directory Structure

```bash
# Create dedicated user (skip if already exists)
sudo useradd -r -s /bin/bash polkadot

# Create data directory
sudo mkdir -p /var/lib/people-chain-rpc

# Copy chain spec to the directory
sudo cp people-polkadot.json /var/lib/people-chain-rpc/

# Set permissions
sudo chown -R polkadot:polkadot /var/lib/people-chain-rpc
```

### Step 5: Create Systemd Service

Create a service file for the People Chain RPC node:

```bash
sudo nano /etc/systemd/system/people-chain-rpc.service
```

Add the following configuration:

```ini
[Unit]
Description=People Chain RPC Node
After=network.target

[Service]
Type=simple
User=polkadot
Group=polkadot
WorkingDirectory=/var/lib/people-chain-rpc

ExecStart=/usr/local/bin/polkadot-omni-node \
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
  --blocks-pruning=archive-canonical

Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

### Step 6: Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable people-chain-rpc

# Start the node
sudo systemctl start people-chain-rpc

# Check status and wait for sync
sudo systemctl status people-chain-rpc
sudo journalctl -u people-chain-rpc -f
```

### Step 7: Verify Setup

Use the same verification tests as in the Docker setup (see Step 5 above).

---

## Monitoring and Maintenance

### Log Management

**Docker Setup**:

```bash
# View node logs
docker logs -f people-chain-rpc
```

**Systemd Setup**:

```bash
# View node logs
sudo journalctl -u people-chain-rpc -f

# View recent logs
sudo journalctl -u people-chain-rpc -n 100

# Filter for errors
sudo journalctl -u people-chain-rpc | grep -i error
```

### Performance Monitoring

Monitor key metrics:
- **Sync status**: Ensure node stays fully synced
- **Peer connections**: Maintain 30+ peers for good connectivity
- **Resource usage**: Monitor CPU, RAM, and disk I/O
- **RPC request latency**: Track response times for the Polkadot SDK API
- **Connection count**: Monitor active RPC connections

**Prometheus Metrics**:

Metrics are available at `http://localhost:9615/metrics`

Example Prometheus scrape configuration:

```yaml
scrape_configs:
  - job_name: 'people-chain-rpc'
    static_configs:
      - targets: ['localhost:9615']
```

**Key Metrics to Monitor**:
- `substrate_block_height`: Current block height
- `substrate_finalized_height`: Finalized block height
- `substrate_peers_count`: Number of connected peers
- `substrate_ready_transactions_number`: Transaction queue size

### Database Maintenance

Check database size periodically:

```bash
# Docker setup
du -sh my-node-data

# Systemd setup
du -sh /var/lib/people-chain-rpc
```

The node handles pruning automatically based on configuration unless running in archive mode.

### Updates and Upgrades

**Docker Setup**:

```bash
# Pull latest image
docker pull parity/polkadot-omni-node:stable2506-4

# Restart container
docker stop people-chain-rpc
docker rm people-chain-rpc

# Start new container (use same command from setup)
```

**Systemd Setup**:

```bash
# Stop service
sudo systemctl stop people-chain-rpc

# Backup data
sudo cp -r /var/lib/people-chain-rpc /var/lib/people-chain-rpc.backup

# Update binary
cargo install --locked --force polkadot-omni-node@<NEW_VERSION>

# Restart service
sudo systemctl start people-chain-rpc
```

## Security Best Practices

### Network Security

1. **Firewall Configuration**:
   - Only expose necessary ports
   - Use UFW or iptables to restrict access
   - Consider IP whitelisting for RPC endpoints

2. **Reverse Proxy** (Recommended for Production):
   - Use nginx or Caddy as reverse proxy
   - Enable SSL/TLS (HTTPS/WSS)
   - Implement authentication
   - Add rate limiting

Example nginx configuration:

```nginx
upstream polkadot_sdk_rpc {
    server 127.0.0.1:9944;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Polkadot SDK RPC
    location /polkadot {
        proxy_pass http://polkadot_sdk_rpc;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Rate limiting
        limit_req zone=rpc_limit burst=10;
    }
}
```

### RPC Security

- **Always use `--rpc-methods=safe`**: Prevents dangerous RPC calls
- **Restrict CORS**: Use specific domains instead of `all` in production
- **Set connection limits**: Prevent resource exhaustion
- **Monitor for abuse**: Track unusual patterns
- **Authentication**: Implement API keys or OAuth for production

### System Security

- Keep operating system updated
- Use dedicated user accounts (never root)
- Enable fail2ban for SSH protection
- Regular security audits
- Disable unnecessary services
- Use AppArmor or SELinux for additional isolation

### Monitoring and Alerting

Set up alerts for:
- Service failures
- Sync issues
- Low peer count (< 10 peers)
- High resource usage
- Unusual RPC traffic patterns
- Database errors

## Conclusion

Running an RPC node for system parachains provides critical infrastructure for accessing specialized Polkadot network services. By following this guide, you have set up a production-ready RPC node that:

- Enables applications and users to interact with essential system parachain features (identity management, cross-chain bridges, or coretime allocation)
- Supports flexible deployment with both Docker and systemd options
- Implements comprehensive monitoring, security, and maintenance practices
- Can be easily adapted for any system parachain by substituting the appropriate chain specification

Whether you're running a node for People Chain, Bridge Hub, or Coretime Chain, regular maintenance and monitoring will ensure your RPC node continues to provide reliable service. Stay updated with the latest releases and best practices to keep your infrastructure secure and performant.

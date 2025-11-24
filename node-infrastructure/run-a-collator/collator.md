---
title: Run a Block-Producing Collator
description: Learn how to set up and run a block-producing collator for Polkadot system parachains, including registration and session key management.
categories: Infrastructure
---

# Run a Block-Producing Collator

## Overview

Block-producing collators are the backbone of system parachain operations. Unlike RPC nodes or archive nodes that simply maintain state, collators actively produce blocks and submit them to relay chain validators for inclusion.

This guide covers setting up a **block-producing collator** for Polkadot system parachains. Running a collator requires:

- Meeting hardware requirements for reliable block production
- Setting up and registering session keys
- Obtaining governance approval or meeting selection criteria
- Maintaining high uptime and performance

**Important**: System parachain collators typically require governance approval or being added to the invulnerables list. This is different from non-system parachains where collator selection may be more permissionless.

## Collator Responsibilities

Block-producing collators perform critical functions:

- **Maintain full nodes**: Both relay chain and parachain
- **Collect transactions**: Aggregate user transactions into blocks
- **Produce blocks**: Create parachain block candidates
- **Generate proofs**: Produce state transition proofs (Proof-of-Validity)
- **Submit to validators**: Send block candidates to relay chain validators
- **Facilitate XCM**: Enable cross-chain message passing

Unlike relay chain validators, collators do not provide security guarantees—that responsibility lies with relay chain validators through the ELVES protocol. However, collators are essential for network liveness and censorship resistance.

## Prerequisites

### Hardware Requirements

Block-producing collators require robust hardware for reliable operation:

- **CPU**: 4+ cores (8+ cores recommended for optimal performance)
- **Memory**: 32 GB RAM minimum (64 GB recommended)
- **Storage**:
    - 500 GB+ NVMe SSD for parachain data
    - Additional 200+ GB for relay chain pruned database
    - Fast disk I/O is critical for block production performance
- **Network**:
    - Public IP address (required)
    - 100+ Mbps connection (stable connection critical)
    - Open ports:
        - 30333 (parachain P2P)
        - 30334 (relay chain P2P)
        - 9944 (WebSocket RPC - for management)

**Note**: Uptime is critical. Consider redundancy and monitoring to maintain block production reliability.

### Software Requirements

Collators use the **Polkadot Parachain** binary, the standard client for running Polkadot system parachains.

Required software:

- **Operating System**: Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- **Docker**: Required for obtaining binaries and running containers

### Account Requirements

You'll need:

- **Funded account**: For on-chain transactions and potential bonding
- **Session keys**: For collator identification (generated after node setup)
- **Node key**: For stable P2P peer ID (recommended)

## Installation

### Step 1: Install the Polkadot Parachain Binary

**For Docker deployment:**

```bash
# Pull the polkadot-parachain image
docker pull parity/polkadot-parachain:stable2509-2

# Verify installation
docker run --rm parity/polkadot-parachain:stable2509-2 --version
```

**For bare-metal deployment:**

Extract the binary from the Docker image:

```bash
# Create a temporary container and copy the binary
docker create --name temp-parachain parity/polkadot-parachain:stable2509-2
sudo docker cp temp-parachain:/usr/local/bin/polkadot-parachain /usr/local/bin/
docker rm temp-parachain

# Verify installation
polkadot-parachain --version
```

Check [Docker Hub](https://hub.docker.com/r/parity/polkadot-parachain/tags) for the latest stable tags.

### Step 2: Generate Node Key

Generate a stable node key for consistent peer ID:

```bash
# Create directory for node data
sudo mkdir -p /var/lib/polkadot-collator
```

**Using Docker:**

```bash
# Generate node key (outputs peer ID to console, saves key to file)
docker run --rm -v /var/lib/polkadot-collator:/data \
  parity/polkadot-parachain:stable2509-2 \
  key generate-node-key --file /data/node.key

# Example output: 12D3KooWExcVYu7Mvjd4kxPVLwN2ZPnZ5NyLZ5ft477wqzfP2q6E
```

**Using native binary:**

```bash
# Generate node key
polkadot-parachain key generate-node-key --file /var/lib/polkadot-collator/node.key

# Example output: 12D3KooWExcVYu7Mvjd4kxPVLwN2ZPnZ5NyLZ5ft477wqzfP2q6E
```

Save the peer ID for future reference.

### Step 3: Generate Account Key

Generate an account for on-chain transactions:

**Using Docker:**

```bash
# Generate account key with sr25519 scheme
docker run --rm parity/polkadot-parachain:stable2509-2 key generate --scheme sr25519
```

**Using native binary:**

```bash
# Generate account key with sr25519 scheme
polkadot-parachain key generate --scheme sr25519
```

Save the output containing:

- Secret phrase (seed) - Keep this secure!
- Public key (hex)
- Account ID
- SS58 Address

**Security**: Store the secret phrase securely. Never share it. Consider using a hardware wallet for production collators.

### Step 4: Obtain Chain Specification

Download the chain specification for your target system parachain:

**Option 1: Download from Chainspec Collection (Recommended)**

1. Visit the [Chainspec Collection website](https://paritytech.github.io/chainspecs/)
2. Find your target system parachain
3. Download the chain specification JSON file
4. Save it as `chain-spec.json`

**Option 2: Build from Runtime**

```bash
# Clone the runtimes repository
git clone https://github.com/polkadot-fellows/runtimes.git
cd runtimes

# Build the desired runtime (example for Polkadot Hub)
cargo build --release -p asset-hub-polkadot-runtime

# Install chain-spec-builder
cargo install --locked staging-chain-spec-builder@14.0.0

# Generate chain spec
chain-spec-builder create \
  --relay-chain polkadot \
  --para-id 1000 \
  --runtime target/release/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.compact.compressed.wasm \
  named-preset production > chain-spec.json
```

**System Parachain Para IDs:**

- Polkadot Hub: 1000
- Bridge Hub: 1002
- People Chain: 1004
- Coretime Chain: 1005

### Step 5: Create User and Directory Structure

```bash
# Create dedicated user
sudo useradd -r -s /bin/bash polkadot

# Copy chain spec to directory
sudo cp chain-spec.json /var/lib/polkadot-collator/

# Set permissions
sudo chown -R polkadot:polkadot /var/lib/polkadot-collator
```

## Configuration

### Native Binary Systemd Service

Create a service file for your collator:

```bash
sudo nano /etc/systemd/system/polkadot-collator.service
```

Add the following configuration:

```ini
[Unit]
Description=Polkadot System Parachain Collator
After=network.target

[Service]
Type=simple
User=polkadot
Group=polkadot
WorkingDirectory=/var/lib/polkadot-collator

# Block-Producing Collator Configuration
ExecStart=/usr/local/bin/polkadot-parachain \
  --collator \
  --chain=/var/lib/polkadot-collator/chain-spec.json \
  --base-path=/var/lib/polkadot-collator \
  --port=30333 \
  --rpc-port=9944 \
  --prometheus-port=9615 \
  --node-key-file=/var/lib/polkadot-collator/node.key \
  --name="YourCollatorName" \
  -- \
  --execution=wasm \
  --chain=polkadot \
  --port=30334 \
  --sync=warp

Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

**Configuration Notes**:

- `--collator`: Enables block production mode
- `--node-key-file`: Uses the generated node key for stable peer ID
- `--name`: Your collator name (visible in telemetry)
- Relay chain uses `--sync=warp` for faster initial sync

### Docker Systemd Service

If using Docker, create a service file with Docker configuration:

```bash
sudo nano /etc/systemd/system/polkadot-collator.service
```

Add the following configuration:

```ini
[Unit]
Description=Polkadot System Parachain Collator (Docker)
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
TimeoutStartSec=0

ExecStartPre=-/usr/bin/docker stop polkadot-collator
ExecStartPre=-/usr/bin/docker rm polkadot-collator

ExecStart=/usr/bin/docker run --rm \
  --name polkadot-collator \
  --network host \
  -v /var/lib/polkadot-collator:/data \
  parity/polkadot-parachain:stable2509-2 \
  --collator \
  --chain=/data/chain-spec.json \
  --base-path=/data \
  --port=30333 \
  --rpc-port=9944 \
  --prometheus-port=9615 \
  --node-key-file=/data/node.key \
  --name="YourCollatorName" \
  -- \
  --chain=polkadot \
  --port=30334 \
  --sync=warp

ExecStop=/usr/bin/docker stop polkadot-collator

[Install]
WantedBy=multi-user.target
```

## Running the Collator

### Step 1: Start the Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable polkadot-collator

# Start the service
sudo systemctl start polkadot-collator

# Check status
sudo systemctl status polkadot-collator

# View logs
sudo journalctl -u polkadot-collator -f
```

### Step 2: Initial Sync

Your collator must sync both the relay chain and parachain before producing blocks.

Sync time depends on:

- Network bandwidth
- Disk I/O speed
- Current chain size

The relay chain uses warp sync for faster synchronization.

**Important**: Do not proceed with registration until both chains are fully synced. Monitor sync progress using the log viewing commands in the [Log Management](#log-management) section.

### Step 3: Generate Session Keys

Once your node is fully synced, generate session keys:

```bash
# Generate session keys via RPC
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
  http://localhost:9944

# Returns session keys as a hex string
# Example: "0x1234567890abcdef..."
```

**Save the session keys** - you'll need them for on-chain registration.

**Note**: Session keys are stored in the node's database. If you wipe the database, you'll need to generate new keys.

## Registration and Governance

### Understanding Collator Selection

System parachains use different collator selection mechanisms:

**Invulnerables List**:

- Fixed list of collators approved through governance
- Most common for system parachains
- Requires governance proposal and approval

**On-chain Selection**:

- Some parachains use pallet-collator-selection
- May require bonding tokens
- Automatic selection based on criteria

**Fellowship Decisions**:

- Technical Fellowship may manage some system parachain collators
- Requires Fellowship membership or approval

### Registration Process

The registration process varies by system parachain. General steps:

#### 1. Check Current Collators

Check the existing collators for your target parachain:

```bash
# Using Polkadot.js Apps
# Connect to your target system parachain
# Go to Developer > Chain State
# Query: collatorSelection.invulnerables() or similar
```

#### 2. Prepare Governance Proposal

For invulnerables-based selection:

1. **Draft proposal**: Explain why you should be added as a collator
2. **Technical details**: Provide your session keys and account ID
3. **Infrastructure**: Describe your hardware and monitoring setup
4. **Experience**: Detail your relevant experience

Submit to:
- Polkadot Forum: https://forum.polkadot.network
- Relevant governance channels

#### 3. Set Session Keys On-Chain

Once approved (or if using on-chain selection), set your session keys:

**Using Polkadot.js Apps:**

1. Navigate to Polkadot.js Apps and connect to your system parachain
2. Go to **Developer > Extrinsics**
3. Select your account
4. Choose `session.setKeys` extrinsic
5. Enter:
    - `keys`: Your session keys (from `author_rotateKeys`)
    - `proof`: 0x00 (typically)
6. Submit and sign the transaction

**Using CLI (alternative):**

```bash
# This varies by parachain - consult specific documentation
```

#### 4. Bond Tokens (if required)

Some parachains require bonding tokens:

1. Go to **Developer > Extrinsics**
2. Select `collatorSelection.registerAsCandidate` (if available)
3. Submit with required bond amount
4. Sign transaction

#### 5. Await Governance Approval

If using invulnerables:

- Wait for governance vote
- Monitor forum and announcements
- Once approved, you'll be added to the invulnerables list
- Your collator will begin producing blocks in the next session/era

### Verify Collator Status

Check if your collator is active by monitoring logs for block production messages like "Prepared block for proposing" and "Imported #123". See the [Log Management](#log-management) section for log viewing commands.

## Monitoring and Maintenance

### Essential Monitoring

**Block Production**:
```bash
# Monitor block production
sudo journalctl -u polkadot-collator | grep -i "prepared block"
```

**Peer Connections**:

- Maintain a sufficient amount of peers for good connectivity
- Check peer count in logs

**Resource Usage**:

- Monitor CPU, RAM, and disk I/O
- Set up alerts for high usage

**Sync Status**:

- Ensure both chains stay synced
- Alert on sync issues

### Prometheus Metrics

Metrics available at `http://localhost:9615/metrics`

Example Prometheus configuration:
```yaml
scrape_configs:
  - job_name: 'polkadot-collator'
    static_configs:
      - targets: ['localhost:9615']
```

Key metrics to monitor:

- `substrate_block_height`: Current block height
- `substrate_finalized_height`: Finalized block height
- `substrate_peers_count`: Peer connections
- `substrate_ready_transactions_number`: Transaction queue

### Setting Up Alerts

Configure alerts for:

- Service failures
- Sync issues
- Low peer count (< 10 peers)
- Block production gaps
- High resource usage
- Disk space low

### Log Management

```bash
# View recent logs
sudo journalctl -u polkadot-collator -n 100

# Follow logs in real-time
sudo journalctl -u polkadot-collator -f

# Filter for errors
sudo journalctl -u polkadot-collator | grep -i error

# Filter for block production
sudo journalctl -u polkadot-collator | grep -i "imported"
```

### Database Maintenance

Check database size:
```bash
# Check database size
du -sh /var/lib/polkadot-collator
```

The node handles pruning automatically.

### Updates and Upgrades

**Runtime Upgrades**:

- Automatic via on-chain governance
- No manual action required
- Monitor announcements for breaking changes

**Client Upgrades**:

- Require manual binary update
- Subscribe to announcements:
    - Polkadot Forum
    - Fellowship GitHub
    - Matrix channels

**Upgrade Procedure (Bare-Metal)**:

```bash
# Stop the service
sudo systemctl stop polkadot-collator

# Backup data (recommended)
sudo cp -r /var/lib/polkadot-collator /var/lib/polkadot-collator.backup

# Pull new image and extract binary
docker pull parity/polkadot-parachain:<NEW_TAG>
docker create --name temp-parachain parity/polkadot-parachain:<NEW_TAG>
sudo docker cp temp-parachain:/usr/local/bin/polkadot-parachain /usr/local/bin/
docker rm temp-parachain

# Verify version
polkadot-parachain --version

# Restart service
sudo systemctl start polkadot-collator

# Verify service is running
sudo systemctl status polkadot-collator
```

**Upgrade Procedure (Docker)**:

```bash
# Stop the service
sudo systemctl stop polkadot-collator

# Backup data (recommended)
sudo cp -r /var/lib/polkadot-collator /var/lib/polkadot-collator.backup

# Pull new image
docker pull parity/polkadot-parachain:<NEW_TAG>

# Update the image tag in /etc/systemd/system/polkadot-collator.service

# Reload systemd and restart
sudo systemctl daemon-reload
sudo systemctl start polkadot-collator

# Verify service is running
sudo systemctl status polkadot-collator
```

**Note**: For log monitoring, see the [Log Management](#log-management) section.

## Conclusion

Running a collator node is essential for parachain operation and network security. By following this guide, you have set up a production-ready collator that:

- Produces blocks for your parachain and maintains network consensus
- Implements comprehensive security measures to protect keys and operations
- Supports robust monitoring and alerting for reliable performance
- Follows best practices for both Docker and systemd deployments

As a collator operator, you play a vital role in your parachain's infrastructure. Regular maintenance, security updates, and monitoring will ensure your collator continues to perform reliably. Stay engaged with your parachain community and keep up with updates to maintain optimal performance and security.

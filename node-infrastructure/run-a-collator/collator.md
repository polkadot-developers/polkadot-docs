---
title: Run a Block-Producing Collator
description: Learn how to set up and run a block-producing collator for Polkadot system parachains, including registration and session key management.
categories: Infrastructure
---

# Run a Block-Producing Collator

## Overview

Block-producing collators are the backbone of system parachain operations. Unlike RPC or archive nodes, which maintain state, collators actively produce blocks and submit them to relay chain validators for inclusion.

This guide covers setting up a block-producing collator for Polkadot system parachains. Running a collator requires:

- Meeting hardware requirements for reliable block production
- Setting up and registering session keys
- Obtaining governance approval or meeting selection criteria
- Maintaining high uptime and performance

System parachain collators typically require governance approval or being added to the invulnerables list. This is different from non-system parachains where collator selection may be more permissionless.

## Collator Responsibilities

Block-producing collators perform critical functions:

- Maintain full nodes for relay chain and parachain.
- Aggregate user transactions into blocks.
- Create parachain block candidates.
- Produce state transition proofs (Proof-of-Validity).
- Send block candidates to relay chain validators.
- Enable cross-chain message passing using XCM

Unlike relay chain validators, collators do not provide security guarantees—that responsibility lies with relay chain validators through the ELVES protocol. Rather, collators are essential for network liveness and censorship resistance.

## Prerequisites

### Hardware Requirements

Block-producing collators require robust hardware for reliable operation including the following:

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

Uptime is critical. Consider redundancy and monitoring to maintain block production reliability.

### Software Requirements

Collators use the **Polkadot Omni Node**, a universal binary that runs any parachain using a chain specification file.

Required software includes the following:

- **Operating System**: Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- **Docker**: For running subkey utility
- **Rust Toolchain**: Version 1.91.1 or as specified by the runtime
- **Dependencies**:
  ```bash
  sudo apt update
  sudo apt install -y build-essential git clang curl libssl-dev llvm libudev-dev make protobuf-compiler
  ```

### Account Requirements

Your account must meet the following requirements:

- **Funded account**: For on-chain transactions and potential bonding
- **Session keys**: For collator identification (generated after node setup)
- **Node key**: For stable P2P peer ID (recommended)

## Install Dependencies

1. Install Rust using the following commands:
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

2. Install the Polkadot Omni Node using the following command:
  ```bash
  cargo install --locked polkadot-omni-node@0.11.0
  ```

3. Verify a successful installation using the `--version` flag:
  ```bash
  polkadot-omni-node --version
  ```

## Generate Node Key

Generating a stable node key enables a consistent peer ID across the network. Follow these steps to generate a node key:

1. Create a directory for node data using the following command:
  ```bash
  sudo mkdir -p /var/lib/polkadot-collator
  ```

2. Generate your node key using Docker with the following command:
  ```bash
  docker run -it parity/subkey:latest generate-node-key > /var/lib/polkadot-collator/node.key
  ```

3. Locate your peer ID in the displayed output. It will be similar to the following example:
  ```bash
  12D3KooWExcVYu7Mvjd4kxPVLwN2ZPnZ5NyLZ5ft477wqzfP2q6E
  ```

Be sure to save the peer ID for future reference.

## Generate Account Key

Generate an account for on-chain transactions as follows:

1. Generate an account key with `sr25519` scheme using the following command:
  ```bash
  docker run -it parity/subkey:latest generate --scheme sr25519
  ```

2. Save the following items displayed in the output:
  - Secret phrase (seed) - Keep this secure!
  - Public key (hex)
  - Account ID
  - SS58 Address

  !!! warning
      Store the secret phrase securely. Never share it. Consider using a hardware wallet for production collators.

## Obtain Chain Specification

Download the chain specification for your target system parachain using one of the following options:

### Download from Chainspec Collection (Recommended)

Follow these steps to download your specification from the Chainspec Collection:

1. Visit the [Chainspec Collection website](https://paritytech.github.io/chainspecs/)
2. Find your target system parachain
3. Download the chain specification JSON file
4. Save it as `chain-spec.json`

### Build Chainspec from Runtime

Follow these steps to build a chainspec from the runtime:

1. Clone the runtimes repository and navigate into it using the following commands:
  ```bash
  git clone https://github.com/polkadot-fellows/runtimes.git
  cd runtimes
  ```

2. Build the desired runtime. Use the following command for Polkadot Hub:
  ```bash
  cargo build --release -p asset-hub-polkadot-runtime
  ```

3. Install the `chain-spec-builder` dependency using the following command:
  ```bash
  cargo install --locked staging-chain-spec-builder@14.0.0
  ```

4. Finally, generate the chain spec using the following commands:
  ```bash
  chain-spec-builder create \
    --relay-chain polkadot \
    --para-id 1000 \
    --runtime target/release/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.compact.compressed.wasm \
    named-preset production > chain-spec.json
  ```

??? tip "System Parachain Para IDs"

    - Polkadot Hub: 1000
    - Bridge Hub: 1002
    - People Chain: 1004
    - Coretime Chain: 1005

## Create User and Directory Structure

1. Create a dedicated user with the following command:
  ```bash
  sudo useradd -r -s /bin/bash polkadot
  ```

2. Use the following command to copy your chain spec to the directory:
  ```bash
  sudo cp chain-spec.json /var/lib/polkadot-collator/
  ```

3. Set permissions using the following command:
  ```bash
  sudo chown -R polkadot:polkadot /var/lib/polkadot-collator
  ```

## Create Systemd Service File

1. Create a service file to hold the configuration for your collator:
  ```bash
  sudo nano /etc/systemd/system/polkadot-collator.service
  ```

2. Open the new file and add the following configuration code:
  ```ini title="systemd/system/polkadot-collator.service"
  [Unit]
  Description=Polkadot System Parachain Collator
  After=network.target

  [Service]
  Type=simple
  User=polkadot
  Group=polkadot
  WorkingDirectory=/var/lib/polkadot-collator

  # Block-Producing Collator Configuration
  ExecStart=/usr/local/bin/polkadot-omni-node \
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

??? note "Configuration notes"

    - `--collator`: Enables block production mode
    - `--node-key-file`: Uses the generated node key for stable peer ID
    - `--name`: Your collator name (visible in telemetry)
    - Relay chain uses `--sync=warp` for faster initial sync

## Run the Collator

Follow these steps to run your collator node:

1. Reload systemd using the following command:
  ```bash
  sudo systemctl daemon-reload
  ```

2. Next, enable the service to start on boot using the command:
  ```bash
  sudo systemctl enable polkadot-collator
  ```
3. Now, start the service with the following command:
  ```bash
  sudo systemctl start polkadot-collator
  ```

4. Finally, you can check the status of the service using the command:
  ```bash
  sudo systemctl status polkadot-collator
  ```

To view collator service logs, use the command:
```bash
sudo journalctl -u polkadot-collator -f
```

## Complete Initial Sync

Your collator must sync both the relay chain and parachain before producing blocks.

Sync time depends on:

- Network bandwidth
- Disk I/O speed
- Current chain size

The relay chain uses warp sync for faster synchronization.

**Important**: Do not proceed with registration until both chains are fully synced. Monitor sync progress using the log viewing commands in the [Log Management](#log-management) section.

### Generate Session Keys

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

**Upgrade Procedure**:

```bash
# Stop the service
sudo systemctl stop polkadot-collator

# Backup data (recommended)
sudo cp -r /var/lib/polkadot-collator /var/lib/polkadot-collator.backup

# Update polkadot-omni-node
cargo install --locked --force polkadot-omni-node@<NEW_VERSION>

# Verify version
polkadot-omni-node --version

# Restart service
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

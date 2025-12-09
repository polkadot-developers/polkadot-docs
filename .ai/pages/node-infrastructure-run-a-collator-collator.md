---
title: Run a Block-Producing Collator
description: Learn how to set up and run a block-producing collator for Polkadot system parachains, including registration and session key management.
categories: Infrastructure
url: https://docs.polkadot.com/node-infrastructure/run-a-collator/collator/
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

Unlike relay chain validators, collators do not provide security guarantees—that responsibility lies with relay chain validators through the [ELVES protocol](https://wiki.polkadot.com/learn/learn-parachains-protocol/){target=\_blank}. Rather, collators are essential for network liveness and censorship resistance.

## Prerequisites

### Hardware Requirements

Block-producing collators require robust hardware for reliable operation including the following:

- **CPU**: 4+ cores (8+ cores recommended for optimal performance)
- **Memory**: 32 GB RAM minimum (64 GB recommended)
- **Storage**:
    - 200+ GB NVMe SSD (with pruning enabled for both parachain and relay chain)
    - Fast disk I/O is critical for block production performance
- **Network**:
    - Public IP address (required)
    - 100+ Mbps connection (stable connection critical)
    - Open ports:
        - 30333 (parachain P2P)
        - 30334 (relay chain P2P)

Uptime is critical. Consider redundancy and monitoring to maintain block production reliability.

### Software Requirements

Collators use the Polkadot Parachain binary, the standard client for running Polkadot system parachains.

Required software includes the following:

- **Operating System**: Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- **Docker**: Required for obtaining binaries and running containers

### Account Requirements

Your account must meet the following requirements:

- **Funded account**: For on-chain transactions and potential bonding
- **Session keys**: For collator identification (generated after node setup)
- **Node key**: For stable P2P peer ID (recommended)

## Install Dependencies

This guide provides two deployment options. Select the option that best fits your needs:

- **Docker-based Setup**: Best for simpler setup and maintenance
- **Manual/systemd Setup**: Best for production environments requiring more control

=== "Docker Setup"

    Pull the Polkadot Parachain Docker image:

    ```bash
    docker pull parity/polkadot-parachain:stable2509-2
    ```

    Verify the installation:

    ```bash
    docker run --rm parity/polkadot-parachain:stable2509-2 --version
    ```

    Check [Docker Hub](https://hub.docker.com/r/parity/polkadot-parachain/tags){target=\_blank} for the latest stable tags.

=== "Manual Setup"

    Download the `polkadot-parachain` binary from the latest stable [Polkadot SDK release](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}:

    ```bash
    # Download the latest stable release (check releases page for current version)
    wget https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-stable2509-2/polkadot-parachain

    # Make it executable and move to system path
    chmod +x polkadot-parachain
    sudo mv polkadot-parachain /usr/local/bin/
    sudo chown root:root /usr/local/bin/polkadot-parachain

    # Verify installation
    polkadot-parachain --version
    ```

    Check the [Polkadot SDK releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} page for the latest stable version.

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

  The output will be similar to the following:
  ```bash
  Secret phrase:       embody rail hour peanut .... badge syrup luggage canvas
    Network ID:        substrate
    Secret seed:       0x6498dd3416c491406e2c8283c76760ce4ca018478888b42315e7718778f2c2e1
    Public key (hex):  0x2202210357e49390d4f8d868da983940fe220a0a0e00bc6feaeda462aa031810
    Account ID:        0x2202210357e49390d4f8d868da983940fe220a0a0e00bc6feaeda462aa031810
    Public key (SS58): 5CqJ7n72GvvF5ZzUT2HMj83KyDje4n8sXR8kuiK8HWtfDktF
    SS58 Address:      5CqJ7n72GvvF5ZzUT2HMj83KyDje4n8sXR8kuiK8HWtfDktF
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

1. Visit the [Chainspec Collection](https://paritytech.github.io/chainspecs/){target=\_blank} website.
2. Find your target system parachain.
3. Download the chain specification JSON file.
4. Save it as `chain-spec.json`.

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

## Run the Collator

Select your preferred deployment method:

=== "Docker Setup"

    1. Create a directory for collator data and copy the chain spec:
        ```bash
        mkdir -p collator-data
        cp chain-spec.json collator-data/
        cp /var/lib/polkadot-collator/node.key collator-data/
        ```

    2. Launch the collator using Docker:
        ```bash
        docker run -d --name polkadot-collator --restart unless-stopped \
          -p 30333:30333 \
          -p 30334:30334 \
          -p 9944:9944 \
          -p 9615:9615 \
          -v $(pwd)/collator-data:/data \
          -v $(pwd)/chain-spec.json:/chain-spec.json \
          parity/polkadot-parachain:stable2509-2 \
          --collator \
          --chain=/chain-spec.json \
          --base-path=/data \
          --port=30333 \
          --rpc-port=9944 \
          --prometheus-port=9615 \
          --prometheus-external \
          --node-key-file=/data/node.key \
          --name="YourCollatorName" \
          --blocks-pruning=256 \
          --state-pruning=256 \
          --database=paritydb \
          -- \
          --chain=polkadot \
          --port=30334 \
          --sync=fast \
          --blocks-pruning=256 \
          --state-pruning=256 \
          --database=paritydb \
          --pool-limit=0 \
          --rpc-port=0
        ```

    3. View logs to monitor sync progress:
        ```bash
        docker logs -f polkadot-collator
        ```

    4. Use the following commands to manage your Docker container:
        - Stop container:
            ```bash
            docker stop polkadot-collator
            ```
        - Start container:
            ```bash
            docker start polkadot-collator
            ```
        - Remove container:
            ```bash
            docker rm polkadot-collator
            ```

=== "systemd Setup"

    1. Create a dedicated user:
        ```bash
        sudo useradd -r -s /bin/bash polkadot
        ```

    2. Copy your chain spec to the directory:
        ```bash
        sudo cp chain-spec.json /var/lib/polkadot-collator/
        ```

    3. Set permissions:
        ```bash
        sudo chown -R polkadot:polkadot /var/lib/polkadot-collator
        ```

    4. Create a systemd service file:
        ```bash
        sudo nano /etc/systemd/system/polkadot-collator.service
        ```

    5. Add the following configuration:
        ```ini title="systemd/system/polkadot-collator.service"
        [Unit]
        Description=Polkadot System Parachain Collator
        After=network.target

        [Service]
        Type=simple
        User=polkadot
        Group=polkadot
        WorkingDirectory=/var/lib/polkadot-collator

        ExecStart=/usr/local/bin/polkadot-parachain \
          --collator \
          --chain=/var/lib/polkadot-collator/chain-spec.json \
          --base-path=/var/lib/polkadot-collator \
          --port=30333 \
          --rpc-port=9944 \
          --prometheus-port=9615 \
          --node-key-file=/var/lib/polkadot-collator/node.key \
          --name="YourCollatorName" \
          --blocks-pruning=256 \
          --state-pruning=256 \
          --database=paritydb \
          -- \
          --chain=polkadot \
          --port=30334 \
          --sync=fast \
          --blocks-pruning=256 \
          --state-pruning=256 \
          --database=paritydb \
          --pool-limit=0 \
          --rpc-port=0

        Restart=always
        RestartSec=10
        LimitNOFILE=65536

        [Install]
        WantedBy=multi-user.target
        ```

    6. Start the service:
        ```bash
        sudo systemctl daemon-reload
        sudo systemctl enable polkadot-collator
        sudo systemctl start polkadot-collator
        ```

    7. Check the status:
        ```bash
        sudo systemctl status polkadot-collator
        ```

    8. View logs:
        ```bash
        sudo journalctl -u polkadot-collator -f
        ```

??? note "Configuration notes"

    - `--collator`: Enables block production mode
    - `--node-key-file`: Uses the generated node key for stable peer ID
    - `--name`: Your collator name (visible in telemetry)
    - `--blocks-pruning=256` and `--state-pruning=256`: Keeps only recent blocks and state, reducing disk usage (collators don't need archive data)
    - `--database=paritydb`: Uses ParityDB for better performance
    - `--sync=fast`: Fast sync mode for the relay chain
    - `--pool-limit=0`: Disables transaction pool on relay chain (collators don't need it)
    - `--rpc-port=0` (relay chain): Disables RPC on the embedded relay chain node (not needed for collators)

## Complete Initial Sync

Your collator must sync both the relay chain and parachain before producing blocks.

Sync time depends on:

- Network bandwidth
- Disk I/O speed
- Current chain size

The relay chain uses fast sync for faster synchronization.

!!! warning

    Do not proceed with registration until both chains are fully synced. Monitor sync progress using the log viewing commands in the [Log Management](#log-management) section.

## Generate Session Keys

Session keys are cryptographic keys used by your collator node to sign authorship information when producing blocks. They uniquely identify your collator on the network and must be registered on-chain before your collator can participate in block production.

Once your node is fully synced, use the following command to generate session keys via RPC:

```bash
curl -H "Content-Type: application/json" \
  -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
  http://localhost:9944
```

This command returns session keys as a hexstring in the terminal. You must save these session keys as you'll need them for on-chain registration. As session keys are stored in the node's database, if you wipe the database, you'll also need to generate new keys.

## Register Collator for Selection

System parachains use different collator selection mechanisms. Explore the following tabs to see how mechanisms compare and determine the most suitable mechanism for registering your collator.

=== "Invulnerables List"

    - Fixed list of collators approved through governance.
    - Most common for system parachains.
    - Requires governance proposal and approval.


=== "On-chain Selection"

    - Some parachains use [pallet-collator-selection](https://paritytech.github.io/polkadot-sdk/master/pallet_collator_selection/index.html){target=\_blank}.
    - May require bonding tokens.
    - Automatic selection based on criteria.

=== "Fellowship Decisions"

    - Technical Fellowship may manage some system parachain collators.
    - Requires Fellowship membership or approval.

### Registration Process

Collator registration authorizes your node to produce blocks on the network. The parachain's collator selection mechanism uses this on-chain registration to determine which nodes are eligible to author blocks.

The registration process varies by system parachain. General steps include the following:

1. Check the existing collators for your target parachain:
    
    1. Navigate to Polkadot.js Apps and connect to your system parachain.
    2. Locate **Developer > Chain State**.
    3. Query `collatorSelection.invulnerables()`

2. Prepare a governance proposal for invulnerables-based selection including the following information:
    - **Draft proposal**: Explain why you should be added as a collator
    - **Technical details**: Provide your session keys and account ID
    - **Infrastructure**: Describe your hardware and monitoring setup
    - **Experience**: Detail your relevant experience

    Submit the proposal to the relevant governance channels on the [Polkadot Forum](https://forum.polkadot.network){target=\_blank}.

3. Once approved (or if using on-chain selection), follow these steps to register session keys using Polkadot.js Apps:
    1. Navigate to Polkadot.js Apps and connect to your system parachain.
    2. Locate **Developer > Extrinsics**.
    3. Select your account.
    4. Choose the `session.setKeys` extrinsic.
    5. Enter the following information:
        - `keys`: Your session keys (from `author_rotateKeys`)
        - `proof`: 0x00 (typically)
    6. Submit and sign the transaction.
    
4. (Optional - primarily for non-system parachains) If the parachain uses on-chain bonding for collator selection, register as a candidate using Polkadot.js Apps:

    !!! note
        Most system parachains use invulnerables lists exclusively and do not require this step. Skip to step 5 if you're running a collator for a system parachain.

    1. Locate **Developer > Extrinsics**.
    2. Select `collatorSelection.registerAsCandidate`.
    3. Submit and sign the transaction. The required bond amount will be automatically reserved from your account based on the pallet's configured `CandidacyBond`.

5. For system parachains using invulnerables lists, await governance approval for your proposal. Monitor the [Polkadot Forum](https://forum.polkadot.network){target=\_blank} governance channels and announcements. Once approved, your collator is added to the invulnerables list and will begin producing blocks in the next session or era. 

6. Verify your collator is active by monitoring logs for block production messages like "Prepared block for proposing" and "Imported #123". See the [Log Management](#log-management) section for log viewing commands.

## Log Management

Efficient log management is essential to ensure collator performance and uptime. Use the following commands to help you manage logs to monitor and maintain your collator:

=== "Docker Setup"

    - View logs:
        ```bash
        docker logs -f polkadot-collator
        ```
    - View recent logs (last 100 lines):
        ```bash
        docker logs --tail 100 polkadot-collator
        ```
    - Filter for errors:
        ```bash
        docker logs polkadot-collator 2>&1 | grep -i error
        ```
    - Filter for block production:
        ```bash
        docker logs polkadot-collator 2>&1 | grep -i "imported"
        ```

=== "systemd Setup"

    - View recent logs:
        ```bash
        sudo journalctl -u polkadot-collator -n 100
        ```
    - Follow logs in real-time:
        ```bash
        sudo journalctl -u polkadot-collator -f
        ```
    - Filter for errors:
        ```bash
        sudo journalctl -u polkadot-collator | grep -i error
        ```
    - Filter for block production:
        ```bash
        sudo journalctl -u polkadot-collator | grep -i "imported"
        ```

## Database Maintenance

Check database size periodically using the commands for your selected setup:

=== "Docker Setup"

    ```bash
    # Replace with your mounted data directory path
    du -sh ./collator-data
    ```

=== "systemd Setup"

    ```bash
    du -sh /var/lib/polkadot-collator
    ```

The collator node handles pruning automatically based on configuration.

## Updates and Upgrades

Updates or upgrades can happen on either the runtime or client. Runtime upgrades happen automatically via on-chain governance and do not require manual action on your part. Client upgrades do require a manual binary update process performed via terminal commands as follows:

=== "Docker Setup"

    1. Stop the service:
        ```bash
        sudo systemctl stop polkadot-collator
        ```

    2. Backup data (recommended):
        ```bash
        sudo cp -r /var/lib/polkadot-collator /var/lib/polkadot-collator.backup
        ```

    3. Pull the new Docker image:
        ```bash
        docker pull parity/polkadot-parachain:<NEW_TAG>
        ```

    4. Update the image tag in your systemd service file:
        ```bash
        sudo nano /etc/systemd/system/polkadot-collator.service
        ```

    5. Reload systemd and restart the service:
        ```bash
        sudo systemctl daemon-reload
        sudo systemctl start polkadot-collator
        ```

    6. Verify the service is running:
        ```bash
        sudo systemctl status polkadot-collator
        ```

=== "Manual Setup"

    1. Stop the service:
        ```bash
        sudo systemctl stop polkadot-collator
        ```

    2. Backup data (recommended):
        ```bash
        sudo cp -r /var/lib/polkadot-collator /var/lib/polkadot-collator.backup
        ```

    3. Download the new binary from [GitHub releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank}:
        ```bash
        wget https://github.com/paritytech/polkadot-sdk/releases/download/<NEW_VERSION>/polkadot-parachain
        chmod +x polkadot-parachain
        sudo mv polkadot-parachain /usr/local/bin/
        ```

    4. Verify `polkadot-parachain` version to confirm successful update:
        ```bash
        polkadot-parachain --version
        ```

    5. Restart the service:
        ```bash
        sudo systemctl start polkadot-collator
        ```

    6. Verify the service is running:
        ```bash
        sudo systemctl status polkadot-collator
        ```

## Conclusion

Running a collator node is essential for parachain operation and network security. By following this guide, you have set up a production-ready collator that:

- Produces blocks for your parachain and maintains network consensus.
- Implements comprehensive security measures to protect keys and operations.
- Supports robust monitoring and alerting for reliable performance.
- Follows best practices for both Docker and systemd deployments.

As a collator operator, you play a vital role in your parachain's infrastructure. Regular maintenance, security updates, and monitoring will ensure your collator continues to perform reliably. Stay engaged with your parachain community and keep up with updates to maintain optimal performance and security.

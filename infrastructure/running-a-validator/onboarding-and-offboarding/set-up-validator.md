---
title: Set Up a Validator
description: Learn how to set up a Polkadot validator node, covering installation steps, security best practices, and staking management.
---

# Set Up a Validator

## Introduction

Setting up a Polkadot validator node is essential for securing the network and earning staking rewards. This guide walks you through the technical steps to set up a validator, from installing the necessary software to managing keys and synchronizing your node with the chain.

Running a validator requires a commitment to maintaining a stable, secure infrastructure. Validators are responsible for their own stakes and those of nominators who trust them with their tokens. Proper setup and ongoing management are critical to ensuring smooth operation and avoiding potential penalties such as slashing.

## Prerequisites

To get the most from this guide, ensure you've done the following before going forward:

- Read [Validator Requirements](/infrastructure/running-a-validator/requirements/){target=\_blank} and understand the recommended minimum skill level and hardware needs
- Read [General Management](/infrastructure/running-a-validator/operational-tasks/general-management){target=\_blank}, [Upgrade Your Node](/infrastructure/running-a-validator/operational-tasks/upgrade-your-node/){target=\_blank}, and [Pause Validating](/infrastructure/running-a-validator/onboarding-and-offboarding/stop-validating/){target=\_blank} and understand the tasks required to keep your validator operational
- Read [Rewards Payout](/infrastructure/staking-mechanics/rewards-payout/){target=\_blank} and understand how validator rewards are determined and paid out
- Read [Offenses and Slashes](/infrastructure/staking-mechanics/offenses-and-slashes/){target=\_blank} and understand how validator performance and security can affect tokens staked by you or your nominators

## Initial Setup

Before running your validator, you must configure your server environment to meet the operational and security standards required for validating.

You must use a Linux-based operating system with Kernel 5.16 or later. Configuration includes setting up time synchronization, ensuring critical security features are active, and installing the necessary binaries. Proper setup at this stage is essential to prevent issues like block production errors or being penalized for downtime. Below are the essential steps to get your system ready.

### Install Network Time Protocol Client

Accurate timekeeping is critical to ensure your validator is synchronized with the network. Validators need local clocks in sync with the blockchain to avoid missing block authorship opportunities. Using [Network Time Protocol (NTP)](https://en.wikipedia.org/wiki/Network_Time_Protocol){target=\_blank} is the standard solution to keep your system's clock accurate.

If you are using Ubuntu version 18.04 or newer, the NTP Client should be installed by default. You can check whether you have the NTP client by running:

```sh
timedatectl
```

If NTP is running, you should see a message like the following:

``` sh
System clock synchronized: yes
```

If NTP is not installed or running, you can install it using:

```sh
sudo apt-get install ntp
```

After installation, NTP will automatically start. To check its status:

```sh
sudo ntpq -p
```

This command will return a message with the status of the NTP synchronization. Skipping this step could result in your validator node missing blocks due to minor clock drift, potentially affecting its network performance.

### Verify Landlock is Activated

[Landlock](https://docs.kernel.org/userspace-api/landlock.html){target=\_blank} is an important security feature integrated into Linux kernels starting with version 5.13. It allows processes, even those without special privileges, to limit their access to the system to reduce the machine's attack surface. This feature is crucial for validators, as it helps ensure the security and stability of the node by preventing unauthorized access or malicious behavior.

To use Landlock, ensure you use the reference kernel or newer versions. Most Linux distributions should already have Landlock activated. You can check if Landlock is activated on your machine by running the following command as root:

```sh
dmesg | grep landlock || journalctl -kg landlock
```

If Landlock is not activated, your system logs won't show any related output. In this case, you will need to activate it manually or ensure that your Linux distribution supports it. Most modern distributions with the required kernel version should have Landlock activated by default. However, if your system lacks support, you may need to build the kernel with Landlock activated. For more information on doing so, refer to the [official kernel documentation](https://docs.kernel.org/userspace-api/landlock.html#kernel-support){target=\_blank}.

Implementing Landlock ensures your node operates in a restricted, self-imposed sandbox, limiting potential damage from security breaches or bugs. While not a mandatory requirement, enabling this feature greatly improves the security of your validator setup.

## Install the Polkadot Binaries

You must install the Polkadot binaries required to run your validator node. These binaries include the main `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries. All three are needed to run a fully functioning validator node.

Depending on your preference and operating system setup, there are multiple methods to install these binaries. Below are the main options:

### Install from Official Releases

The preferred, most straightforward method to install the required binaries is downloading the latest versions from the official releases. You can visit the [Github Releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} page for the most current versions of the `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries.

You can also download the binaries by using the following direct links:

=== "`polkadot`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.polkadot_sdk.version }}/polkadot

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.polkadot_sdk.version }}/polkadot.asc
    
    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot.asc
    ```

=== "`polkadot-prepare-worker`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.polkadot_sdk.version }}/polkadot-prepare-worker

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.polkadot_sdk.version }}/polkadot-prepare-worker.asc

    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot-prepare-worker.asc
    ```

=== "`polkadot-execute-worker`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.polkadot_sdk.version }}/polkadot-execute-worker

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.polkadot_sdk.version }}/polkadot-execute-worker.asc

    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot-execute-worker.asc
    ```

!!!warning
    Signature verification cryptographically ensures the downloaded binaries are authentic and have not been tampered with by using GPG signing keys. Polkadot releases use two different signing keys:

    - ParityReleases (release-team@parity.io) with key [`90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE`](https://keyserver.ubuntu.com/pks/lookup?search=9D4B2B6EB8F97156D19669A9FF0812D491B96798&fingerprint=on&op=index){target=\_blank} for current and new releases
    - Parity Security Team (security@parity.io) with key [`9D4B2B6EB8F97156D19669A9FF0812D491B96798`](https://keyserver.ubuntu.com/pks/lookup?search=90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE&fingerprint=on&op=index){target=\_blank} for old releases

    When verifying a signature, a "Good signature" message indicates successful verification, while any other output signals a potential security risk.

### Install with Package Managers

Users running Debian-based distributions like Ubuntu, or RPM-based distributions such as Fedora or CentOS can install the binaries via package managers.

??? interface "Debian-based (Debian, Ubuntu)"

    Run the following commands as the root user to add the necessary repository and install the binaries:

    ```ssh
    # Import the security@parity.io GPG key
    gpg --recv-keys --keyserver hkps://keys.mailvelope.com 9D4B2B6EB8F97156D19669A9FF0812D491B96798
    gpg --export 9D4B2B6EB8F97156D19669A9FF0812D491B96798 > /usr/share/keyrings/parity.gpg
    # Add the Parity repository and update the package index
    echo 'deb [signed-by=/usr/share/keyrings/parity.gpg] https://releases.parity.io/deb release main' > /etc/apt/sources.list.d/parity.list
    apt update
    # Install the `parity-keyring` package - This will ensure the GPG key
    # used by APT remains up-to-date
    apt install parity-keyring
    # Install polkadot
    apt install polkadot
    ```
    
    After installation, ensure the binaries are properly installed by [verifying the installation](#verify-installation).

??? interface "RPM-based (Fedora, CentOS)""

    Run the following commands as the root user to install the binaries on an RPM-based system:

    ```bash
    # Install dnf-plugins-core (This might already be installed)
    dnf install dnf-plugins-core
    # Add the repository and activate it
    dnf config-manager --add-repo https://releases.parity.io/rpm/polkadot.repo
    dnf config-manager --set-enabled polkadot
    # Install polkadot (You may have to confirm the import of the GPG key, which
    # should have the following fingerprint: 9D4B2B6EB8F97156D19669A9FF0812D491B96798)
    dnf install polkadot
    ```

    After installation, ensure the binaries are properly installed by [verifying the installation](#verify-installation).

### Install with Ansible

You can also manage Polkadot installations using Ansible. This approach can be beneficial for users managing multiple validator nodes or requiring automated deployment. The [Parity chain operations Ansible collection](https://github.com/paritytech/ansible-galaxy/){target=\_blank} provides a Substrate node role for this purpose.

### Install with Docker

If you prefer using Docker or an OCI-compatible container runtime, the official Polkadot Docker image can be pulled directly from Docker Hub.

To pull the latest stable image, run the following command:

```bash
docker pull parity/polkadot:{{ dependencies.polkadot_sdk.docker_image_version }}
```

### Build from Sources

You may build the binaries from source by following the instructions on the [Polkadot SDK repository](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.polkadot_sdk.stable_version}}/polkadot#building){target=\_blank}.

### Verify Installation

Once the Polkadot binaries are installed, it's essential to verify that everything is set up correctly and that all the necessary components are in place. Follow these steps to ensure the binaries are installed and functioning as expected.

1. **Check the versions** - run the following commands to verify the versions of the installed binaries:

    ```bash
    polkadot --version
    polkadot-execute-worker --version
    polkadot-prepare-worker --version
    ```

    The output should show the version numbers for each of the binaries. Ensure that the versions match and are consistent, similar to the following example (the specific version may vary):

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-a-validator/terminal-output-01.html'

    If the versions do not match or if there is an error, double-check that all the binaries were correctly installed and are accessible within your `$PATH`.

2. **Ensure all binaries are in the same directory** - all the binaries must be in the same directory for the Polkadot validator node to function properly. If the binaries are not in the same location, move them to a unified directory and ensure this directory is added to your system's `$PATH`

    To verify the `$PATH`, run the following command:

    ```bash
    echo $PATH
    ```

    If necessary, you can move the binaries to a shared location, such as `/usr/local/bin/`, and add it to your `$PATH`.

## Run a Validator on a TestNet

Running your validator on a test network like Westend or Kusama is a smart way to familiarize yourself with the process and identify any setup issues in a lower-stakes environment before joining the Polkadot MainNet.

### Choose a Network

- **Westend** - Polkadot's primary TestNet is open to anyone for testing purposes. Validator slots are intentionally limited to keep the network stable for the Polkadot release process, so it may not support as many validators at any given time
- **Kusama** - often called Polkadot's “canary network,” Kusama has real economic value but operates with a faster and more experimental approach. Running a validator here provides an experience closer to MainNet with the benefit of more frequent validation opportunities with an era time of 6 hours vs 24 hours for Polkadot

## Synchronize Chain Data

After successfully installing and verifying the Polkadot binaries, the next step is to sync your node with the blockchain network. Synchronization is necessary to download and validate the blockchain data, ensuring your node is ready to participate as a validator. Follow these steps to sync your node:

1. **Start syncing** - you can run a full or warp sync

    === "Full sync"

        Polkadot defaults to using a full sync, which downloads and validates the entire blockchain history from the genesis block. Start the syncing process by running the following command:

        ```sh
        polkadot
        ```

        This command starts your Polkadot node in non-validator mode, allowing you to synchronize the chain data.

    === "Warp sync"

        You can opt to use warp sync which initially downloads only GRANDPA finality proofs and the latest finalized block's state. Use the following command to start a warp sync:

        ``` bash
        polkadot --sync warp
        ```

        Warp sync ensures that your node quickly updates to the latest finalized state. The historical blocks are downloaded in the background as the node continues to operate.

    ??? info "Adjustments for TestNets"

        If you're planning to run a validator on a TetNet, you can specify the chain using the `--chain` flag. For example, the following will run a validator on Kusama:

        ```sh
        polkadot --chain=kusama
        ```

2. **Monitor sync progress** - once the sync starts, you will see a stream of logs providing information about the node's status and progress. Here's an example of what the output might look like:

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-a-validator/terminal-output-02.html'

    The output logs provide information such as the current block number, node name, and network connections. Monitor the sync progress and any errors that might occur during the process. Look for information about the latest processed block and compare it with the current highest block using tools like [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} or [Polkadot.js Apps Explorer](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

### Database Snapshot Services

If you'd like to speed up the process further, you can use a database snapshot. Snapshots are compressed backups of the blockchain's database directory and can significantly reduce the time required to sync a new node. Here are a few public snapshot providers:

- [Stakeworld](https://stakeworld.io/snapshot){target=\_blank}
- [Polkachu](https://polkachu.com/substrate_snapshots){target=\_blank}
- [Polkashots](https://polkashots.io/){target=\_blank}

!!!warning
    Although snapshots are convenient, syncing from scratch is recommended for security purposes. If snapshots become corrupted and most nodes rely on them, the network could inadvertently run on a non-canonical chain.

??? info "Why am I unable to synchronize the chain with 0 peers?"
    Make sure you have libp2p port `30333` activated. It will take some time to discover other peers over the network.

    ![Terminal logs showing 0 peers](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-a-validator-01.webp)

## Bond DOT

Once your validator node is synced, the next step is bonding DOT. A bonded account, or stash, holds your staked tokens (DOT) that back your validator node. Bonding your DOT means locking it for a period, during which it cannot be transferred or spent but is used to secure your validator's role in the network. Visit the [Minimum Bond Requirement](/infrastructure/running-a-validator/requirements/#minimum-bond-requirement) section for details on how much DOT is required.

The following sections will guide you through bonding DOT for your validator.

### Bonding DOT on Polkadot.js Apps

Once you're ready to bond your DOT, head over to the [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} staking page by clicking the **Network** dropdown at the top of the page and selecting [**Staking**](https://polkadot.js.org/apps/#/staking/actions){target=\_blank}.

To get started with the bond submission, click on the **Accounts** tab, then the **+ Stash** button, and then enter the following information:

1. **Stash account** - select your stash account (which is the account with the DOT/KSM balance)
2. **Value bonded** - enter how much DOT from the stash account you want to bond/stake. You are not required to bond all of the DOT in that account and you may bond more DOT at a later time. Be aware, withdrawing any bonded amount requires waiting for the unbonding period. The unbonding period is seven days for Kusama and 28 days for Polkadot
3. **Payment destination** - add the recipient account for validator rewards. If you'd like to redirect payments to an account that is not the stash account, you can do it by entering the address here. Note that it is extremely unsafe to set an exchange address as the recipient of the staking rewards

Once everything is filled in properly, select **Bond** and sign the transaction with your stash account. If successful, you should see an `ExtrinsicSuccess` message.

Your bonded account will be available under **Stashes**. After refreshing the screen, you should now see a card with all your accounts. The bonded amount on the right corresponds to the funds bonded by the stash account.

## Set Session Keys

Setting up your validator's session keys is essential to associate your node with your stash account on the Polkadot network. Validators use session keys to participate in the consensus process. Your validator can only perform its role in the network by properly setting session keys which consist of several key pairs for different parts of the protocol (e.g., GRANDPA, BABE). These keys must be registered on-chain and associated with your validator node to ensure it can participate in validating blocks.

The following sections will cover generating session keys, submitting key data on-chain, and verifying that session keys are correctly set.

### Generate Session Keys

The Polkadot.js Apps UI and the CLI are the two primary methods used to generate session keys.

=== "Use Polkadot.js Apps UI"

    1. Ensure that you are connected to your validator node through the Polkadot.js Apps interface
    2. In the **Toolbox** tab, navigate to **RPC calls**
    3. Select **`author_rotateKeys`** from the drop-down menu and run the command. This will generate new session keys in your node's keystore and return the result as a hex-encoded string
    4. Copy and save this hex-encoded output for the next step

=== "Use the CLI"

    Generate session keys by running the following command on your validator node:

    ``` bash
    curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
    http://localhost:9944
    ```

    This command will return a hex-encoded string that is the concatenation of your session keys. Save this string for later use.

### Submit Transaction to Set Keys

Now that you have generated your session keys, you must submit them to the chain. Follow these steps:

1. Go to the **Network > Staking > Accounts** section on Polkadot.js Apps
2. Select **Set Session Key** on the bonding account you generated earlier
3. Paste the hex-encoded session key string you generated (from either the UI or CLI) into the input field and submit the transaction

![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-a-validator-02.webp)

Once the transaction is signed and submitted, your session keys will be registered on-chain.

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`** - checks if the node has a specific key by public key and key type
- **`hasSessionKeys`** - verifies if your node has the full session key string associated with the validator

For example, you can [check session keys on the Polkadot.js Apps](https://polkadot.js.org/apps/#/rpc){target=\_blank} interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

## Set the Node Key

Validators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity. This key ensures that your validator can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.

Starting with Polkadot version 1.11, validators without a stable network key may encounter the following error on startup:

--8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-a-validator/node-key-error-01.html'

### Generate the Node Key

Use one of the following methods to generate your node key:

=== "Save to file"

    The recommended solution is to generate a node key and save it to a file using the following command:

    ``` bash
    polkadot key generate-node-key --file INSERT_PATH_TO_NODE_KEY
    ```
    
=== "Use default path"

    You can also generate the node key with the following command, which will automatically save the key to the base path of your node:

    ``` bash
    polkadot key generate-node-key --default-base-path
    ```

Save the file path for reference. You will need it in the next step to configure your node with a static identity.

### Set the Node Key

After generating the node key, configure your node to use it by specifying the path to the key file when launching your node. Add the following flag to your validator node's startup command:

``` bash
polkadot --node-key-file INSERT_PATH_TO_NODE_KEY
```

Following these steps ensures that your node retains its identity, making it discoverable by peers without the risk of conflicting identities across sessions. For further technical background, see Polkadot SDK [Pull Request #3852](https://github.com/paritytech/polkadot-sdk/pull/3852){target=\_blank} for the rationale behind requiring static keys.

## Validate

Once your validator node is fully synced and ready, the next step is to ensure it's visible on the network and performing as expected. Below are steps for monitoring and managing your node on the Polkadot network.

### Verify Sync via Telemetry

To confirm that your validator is live and synchronized with the Polkadot network, visit the [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} page. Telemetry provides real-time information on node performance and can help you check if your validator is connected properly. Search for your node by name. You can search all nodes currently active on the network, which is why you should use a unique name for easy recognition. Now, confirm that your node is fully synced by comparing the block height of your node with the network's latest block. Nodes that are fully synced will appear white in the list, while nodes that are not yet fully synced will appear gray.

In the following example, a node named `techedtest` is successfully located and synchronized, ensuring it's prepared to participate in the network:

![Polkadot telemetry dashboard](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-a-validator-03.webp)

### Activate using Polkadot.js Apps

Follow these steps to use Polkadot.js Apps to activate your validator:

1. Go to the **Validator** tab in the Polkadot.js Apps UI and locate the section where you input the keys generated from `rotateKeys`. Paste the output from `author_rotateKeys`, which is a hex-encoded key that links your validator with its session keys:

    ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-a-validator-04.webp)

2. Set a reward commission percentage if desired. You can set a percentage of the rewards to pay to your validator and the remainder pays to your nominators. A 100% commission rate indicates the validator intends to keep all rewards and is seen as a signal the validator is not seeking nominators
3. Toggle the **allows new nominations** option if your validator is open to more nominations from DOT holders
4. Once everything is configured, select **Bond & Validate** to activate your validator status

    ![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-a-validator-05.webp)

### Monitor Validation Status and Slots

On the [**Staking**](https://polkadot.js.org/apps/#/staking){target=\_blank} tab in Polkadot.js Apps, you can see your validator's status, the number of available validator slots, and the nodes that have signaled their intent to validate. Your node may initially appear in the waiting queue, especially if the validator slots are full. The following is an example view of the **Staking** tab:

![staking queue](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-a-validator-06.webp)

The validator set refreshes each era. If there's an available slot in the next era, your node may be selected to move from the waiting queue to the active validator set, allowing it to start validating blocks. If your validator is not selected, it remains in the waiting queue. Increasing your stake or gaining more nominators may improve your chance of being selected in future eras.

## Run a Validator Using Systemd

Running your Polkadot validator as a [systemd](https://en.wikipedia.org/wiki/Systemd){target=\_blank} service is an effective way to ensure its high uptime and reliability. Using systemd allows your validator to automatically restart after server reboots or unexpected crashes, significantly reducing the risk of slashing due to downtime.

This following sections will walk you through creating and managing a systemd service for your validator, allowing you to seamlessly monitor and control it as part of your Linux system. 

Ensure the following requirements are met before proceeding with the systemd setup:

- Confirm your system meets the [requirements](/infrastructure/running-a-validator/requirements/){target=\_blank} for running a validator
- Ensure you meet the [minimum bond requirements](https://wiki.polkadot.network/docs/chain-state-values#minimum-validator-bond){target=\_blank} for validating
- Verify the Polkadot binary is [installed](#install-the-polkadot-binaries)

### Create the Systemd Service File

First create a new unit file called `polkadot-validator.service` in `/etc/systemd/system/`:

```bash
touch /etc/systemd/system/polkadot-validator.service
```

In this unit file, you will write the commands that you want to run on server boot/restart:

```systemd title="/etc/systemd/system/polkadot-validator.service"
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/heads/master/polkadot/scripts/packaging/polkadot.service'
```

!!! warning "Restart Delay Recommendation"
    It is recommended that a node's restart be delayed with `RestartSec` in the case of a crash. It's possible that when a node crashes, consensus votes in GRANDPA aren't persisted to disk. In this case, there is potential to equivocate when immediately restarting. Delaying the restart will allow the network to progress past potentially conflicting votes.

### Run the Service

Activate the systemd service to start on system boot by running:

```bash
systemctl enable polkadot-validator.service
```

To start the service manually, use:

```bash
systemctl start polkadot-validator.service
```

Check the service's status to confirm it is running:

```bash
systemctl status polkadot-validator.service
```

To view the logs in real-time, use [journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html){target=\_blank} like so:

```bash
journalctl -f -u polkadot-validator
```

With these steps, you can effectively manage and monitor your validator as a systemd service.

Once your validator is active, it's officially part of Polkadot's security infrastructure. For questions or further support, you can reach out to the [Polkadot Validator chat](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io?via=matrix.parity.io&via=matrix.org&via=web3.foundation){target=\_blank} for tips and troubleshooting.

---
title: Set Up a Validator
description: Learn how to set up a Polkadot validator node, covering installation steps, security best practices, and staking management.
---

# Set Up a Validator

## Introduction

Setting up a Polkadot validator node allows you to play an essential role in securing the network and earning staking rewards. This guide walks you through the technical steps required to set up a validator, from installing the necessary software to managing keys and synchronizing your node with the chain.

Running a validator requires a commitment to maintaining a stable, secure infrastructure. Validators are responsible not only for their own stakes but also for those of nominators who trust them with their tokens. This means that proper setup and ongoing management are critical to ensuring smooth operation and avoiding potential penalties such as slashing.

## Prerequisites

To get the most from this guide ensure you've done the following before going forward:

- Read [Validator Requirements](infrastructure/running-a-validator/requirements.md) and understand the recommended minimum skill level and hardware needs
- Read [General Management](infrastructure/running-a-validator/operational-tasks/general-management.md), [Upgrade Your Node](infrastructure/running-a-validator/operational-tasks/upgrade-your-node.md), and [Pause Validating](infrastructure/running-a-validator/onboarding-and-offboarding/stop-validating.md) and understand the tasks required to keep your validator operational
- Read [Rewards Payout](infrastructure/staking-mechanics/rewards-payout.md) and understand how validator rewards and determined and paid out
- Read [Offenses and Slashes](infrastructure/staking-mechanics/offenses-and-slashes.md) and understand how validator performance and security can affect tokens staked by you or your nominators

## Initial Setup

Before you can begin running your validator, you'll need to configure your server environment to meet the operational and security standards required for validating. This includes setting up time synchronization, ensuring critical security features are active, and installing the necessary binaries. Proper setup at this stage is essential to prevent issues like block production errors or being penalized for downtime. Below are the essential steps to get your system ready.

### Install Network Time Protocol Client

To ensure your validator is synchronized with the network, accurate timekeeping is critical. Validators need their local clocks in sync with the blockchain to avoid missing block authorship opportunities. Using [Network Time Protocol (NTP)](https://en.wikipedia.org/wiki/Network_Time_Protocol){target=\_blank} is the standard solution to keep your system's clock accurate.

If you are using Ubuntu version 18.04 or newer, NTP Client should be installed by default. You can check whether you have the NTP client by running:

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

This will show the status of the NTP synchronization. Skipping this step could result in your validator node missing blocks due to minor clock drift, potentially affecting its performance on the network.

### Verify Landlock is Enabled

[Landlock](https://docs.kernel.org/userspace-api/landlock.html){target=\_blank} is an important security feature integrated into Linux kernels starting with version 5.13. It allows processes, even those without special privileges, to limit their access to the system in order to reduce the attack surface of the machine. This feature is crucial for validators, as it helps ensure the security and stability of the node by preventing unauthorized access or malicious behavior.

To use Landlock, make sure you are on the reference kernel version or newer. Most Linux distributions should already have Landlock enabled. You can check if Landlock is enabled on your machine by running the following command as root:

```sh
dmesg | grep landlock || journalctl -kg landlock
```

If Landlock is not enabled, your system logs won’t show any related output. In this case, you will need to enable it manually or ensure that your Linux distribution supports it. Most modern distributions with the required kernel version should have Landlock enabled by default. However, if your system lacks support, you may need to build the kernel with Landlock enabled. For more information on doing so, refer to the [official kernel documentation](https://docs.kernel.org/userspace-api/landlock.html#kernel-support){target=\_blank}.

Implementing Landlock ensures that your node operates in a restricted, self-imposed sandbox, limiting potential damage from security breaches or bugs. While not a mandatory requirement, enabling this feature greatly improves the security of your validator setup.

### Install the Polkadot Binaries

The next step is to install the Polkadot binaries required to run your validator node. These binaries include the main `polkadot`, `polkadot-prepare-worker` and `polkadot-execute-worker` binaries. All three are needed to run a fully functioning validator node. 

There are multiple methods to install these binaries, depending on your preference and operating system setup. Below are the main options:

#### Install from Official Releases

The most straightforward method to install the required binaries is by downloading the latest versions from the official releases. You can visit the [Github Releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} page for the most current versions of the `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries.

You can also download the binaries by using the following direct links and replacing `X.Y.Z` with the version number:

=== "`polkadot`"

    ``` text
    https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-vX.Y.Z/polkadot
    ```

=== "`polkadot-prepare-worker`"

    ``` text
    https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-vX.Y.Z/polkadot-prepare-worker
    ```

=== "`polkadot-execute-worker`"

    ``` text
    https://github.com/paritytech/polkadot-sdk/releases/download/polkadot-vX.Y.Z/polkadot-execute-worker
    ```

#### Optional - Install with Package Managers

For users running Debian-based distributions like Ubuntu, or RPM-based distributions such as Fedora or CentOS, you can install the binaries via package managers.

##### Debian-based (Debian, Ubuntu)

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

##### RPM-based (Fedora, CentOS)

Run the following commands as the root user to install the binaries on an RPM-based system:

```bash
# Install dnf-plugins-core (This might already be installed)
dnf install dnf-plugins-core
# Add the repository and enable it
dnf config-manager --add-repo https://releases.parity.io/rpm/polkadot.repo
dnf config-manager --set-enabled polkadot
# Install polkadot (You may have to confirm the import of the GPG key, which
# should have the following fingerprint: 9D4B2B6EB8F97156D19669A9FF0812D491B96798)
dnf install polkadot
```

After installation, ensure that the binaries are properly installed by [verifying the installation](#verify-installation).

#### Optional - Install with Ansible

You can also manage Polkadot installations using Ansible. This approach can be especially useful for users managing multiple validator nodes or requiring automated deployment. The [Parity chain operations Ansible collection](https://github.com/paritytech/ansible-galaxy/){target=\_blank} provides a Substrate node role for this purpose.

#### Optional - Install with Docker

If you prefer using Docker or an OCI-compatible container runtime, the official Polkadot Docker image can be pulled directly from Docker Hub.

To pull the latest image, run the following command. Make sure to replace `X.Y.Z` with the appropriate version number.

```sh
docker.io/parity/polkadot:vX.Y.Z
```

#### Optional - Build from Sources

You may build the binaries from source by following the instructions on the [Polkadot SDK repository](https://github.com/paritytech/polkadot-sdk/tree/master/polkadot#building){target=\_blank}.

### Verify Installation

Once the Polkadot binaries are installed, it's essential to verify that everything is set up correctly and that all the necessary components are in place. Follow these steps to ensure the binaries are installed and functioning as expected.

1. **Check the versions** - run the following commands to verify the versions of the installed binaries:

    ```bash
    polkadot --version
    polkadot-execute-worker --version
    polkadot-prepare-worker --version
    ```

    The output should show the version numbers for each of the binaries. Ensure that the versions match and are consistent, similar to the following example (the specific version may vary):

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/terminal-output-01.html'

    If the versions do not match or if there is an error, double-check that all the binaries were correctly installed and are accessible within your `$PATH`.

2. **Ensure all binaries are in the same directory** - all the binaries must be in the same directory for the Polkadot validator node to function properly. If the binaries are not in the same location, move them to a unified directory and ensure this directory is added to your system's `$PATH`

    To verify the `$PATH`, run the following command:

    ```bash
    echo $PATH
    ```

    If necessary, you can move the binaries to a shared location, such as `/usr/local/bin/`, and add it to your `$PATH`.

### Synchronize Chain Data

After successfully installing and verifying the Polkadot binaries, the next step is to sync your node with the blockchain network. This is necessary to download and validate the blockchain data, ensuring your node is ready to participate as a validator. Follow these steps to sync your node:

1. **Start syncing** - start the syncing process by running the following command:

    ```sh
    polkadot
    ```

    This command starts your Polkadot node in non-validator mode, allowing you to synchronize the chain data. If you're planning to run a validator on the Kusama network, you can specify the chain using the `--chain` flag, like so:

    ```sh
    polkadot --chain=kusama
    ```

    Once the sync starts, you will see a stream of logs that provides information about the node's status and progress. Here's an example of what the output might look like:

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/terminal-output-02.html'
    
    The output logs provide information such as the current block number, node name, and network connections. Keep an eye on the sync progress and any errors that might occur during the process.

2. **Use warp sync for faster syncing** - Polkadot defaults to using a full sync, which downloads and validates the entire blockchain history from the genesis block. This can be a time-consuming process, depending on the size of the chain and your hardware. To speed up syncing, you can use warp sync, which initially downloads finality proofs from GRANDPA and the latest finalized block's state.

    To start warp sync, use the following command:

    ``` bash
    polkadot --sync warp
    ```

    Warp sync ensures that your node quickly gets up-to-date with the latest finalized state. The historical blocks will be downloaded in the background as the node continues to operate.

3. **Monitor sync progress** - to track how much progress your node has made, check the logs printed by the `polkadot` process. Look for information about the latest block that has been processed and compare it with the current highest block using tools like [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} or [PolkadotJS Block Explorer](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

#### Database Snapshot Services

If you'd like to speed up the process further, you can use a database snapshot. Snapshots are compressed backups of the blockchain's database directory and can significantly reduce the time required to sync a new node. Here are a few public snapshot providers:

- [Stakeworld](https://stakeworld.io/snapshot)
- [Polkachu](https://polkachu.com/snapshots)
- [Polkashots](https://polkashots.io/)

!!!warning
    Although snapshots are convenient, syncing from scratch is recommended for security purposes. If snapshots become corrupted and most nodes rely on them, the network could inadvertently run on a non-canonical chain.

??? tip "FAQ"
    Why am I unable to synchronize the chain with 0 peers?

    ![zero-peer](/images/infrastructure/validators/onboarding/run-validator/polkadot-zero-peer.webp)

    Make sure you have libp2p port `30333` enabled. It will take some time to discover other peers over the network.

## Bond DOT

Once your validator node is synced, the next step is bonding DOT. A bonded account, also called a stash, holds your staked tokens (DOT) that back your validator node. Bonding your DOT means locking it for a period, where it cannot be transferred or spent, but is used to secure your validator’s role in the network. The following sections will guide you through bonding DOT for your validator.

### Minimum Bond Requirement

Before bonding DOT, ensure you meet the minimum bond requirement to start a validator instance. The minimum bond is the least amount of DOT you need to stake to enter the validator set. To become eligible for rewards, your validator node needs to be nominated by enough staked tokens.

For an example, on May 21st, 2024, the minimum stake backing a validator in Polkadot's era 1449 was 2,377,756.492 DOT. You can check the current minimum stake required using these tools:

- [**Subscan**](https://polkadot.subscan.io/validator_list?status=validator){target=\_blank}
- [**Staking Dashboard**](https://staking.polkadot.cloud/#/overview){target=\_blank}

### Bonding DOT on Polkadot.js Apps

<!--TODO: this section needs refactored. I visited the site and could not follow these instructions at all. The referenced images do not exist in our repo, etc.-->

Once you're ready to bond your DOT, follow these steps using the Polkadot.js Apps UI:

1. Go to the Network drop down at the top of the page, select the arrow to expand, and then select [Staking](https://polkadot.js.org/apps/#/staking/actions) section. Click on "Account Actions", and then the "+ Stash" button.

![bonding-JS-UI](../assets/JS-UI-bond.webp)

- **Stash account** - Select your Stash account (which is the account with the DOT/KSM balance)
- **Value bonded** - How much DOT from the Stash account you want to bond/stake. Note that you do
  not need to bond all of the DOT in that account. Also note that you can always bond _more_ DOT
  later. However, _withdrawing_ any bonded amount requires the duration of the unbonding period. On
  Kusama, the unbonding period is 7 days. On Polkadot, the planned unbonding period is 28 days.
- **Payment destination** - The account where the rewards from validating are sent. More info
  [here](../learn/learn-staking.md/#reward-distribution). Starting with runtime version v23 natively
  included in client version [0.9.3](https://github.com/paritytech/polkadot/releases/tag/v0.9.3),
  payouts can go to any custom address. If you'd like to redirect payments to an account that is not
  the stash account, you can do it by entering the address here. Note that it is extremely unsafe to
  set an exchange address as the recipient of the staking rewards.

Once everything is filled in properly, click `Bond` and sign the transaction with your Stash
account.

![sign transaction](../assets/JS-UI-sign-transaction.webp)

After a few seconds, you should see an `ExtrinsicSuccess` message.

Your bonded account will be available under `Stashes`. You should now see a new card with all your
accounts (note: you may need to refresh the screen). The bonded amount on the right corresponds to
the funds bonded by the Stash account.

<!--end of needed refactor by content/tech team-->

## Set Session Keys

Setting up your validator's session keys is an essential step to associate your node with your stash account on the Polkadot network. Session keys are used by validators to participate in the consensus process, and without properly setting them, your validator won’t be able to perform its role in the network. Session keys consist of several key pairs for different parts of the protocol (e.g., GRANDPA, BABE). These keys must be registered on-chain and associated with your validator node to ensure it can participate in validating blocks. 

The following sections will cover generating session keys, submitting key data on-chain, and verifying session keys are correctly set. 

### Generate Session Keys

The Polkadot.js Apps UI and the CLI are the two primary methods used to generate session keys.

=== "Use Polkadot.js Apps UI"

    1. Ensure that you are connected to your validator node through the PolkadotJS-Apps interface
    2. In the **Toolbox** tab, navigate to **RPC calls**
    3. Select **`author_rotateKeys`** from the drop-down menu and run the command. This will generate new session keys in your node’s keystore and return the result as a hex-encoded string
    4. Copy and save this hex-encoded output for the next step

=== "Use the CLI"

    Alternatively, if you are on a remote server or prefer using the command line, you can generate session keys by running the following command on your validator node:

    ``` bash
    curl -H "Content-Type: application/json" \
    -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' \
    http://localhost:9944
    ```

    This command will return a hex-encoded string that is the concatenation of your session keys. Save this string for later use.

### Submit `setKeys` Transaction

Now that you have generated your session keys, you need to submit them to the chain. Follow these steps:

1. Go to the **Staking > Account Actions** section on Polkadot.js Apps
2. Select **Set Session Key** on the bonding account you generated earlier
3. Paste the hex-encoded session key string you generated (from either the UI or CLI) into the input field and submit the transaction

Once the transaction is signed and submitted, your session keys will be registered on-chain. 
![staking-session-result](/images/infrastructure/validators/onboarding/run-validator/set-session-key-2.webp)

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`** - checks if the node has a specific key by public key and key type
- **`hasSessionKeys`** - verifies if your node has the full session key string associated with the validator

For example, you can check session keys on the Polkadot.js Apps interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

![Explorer RPC call](/images/infrastructure/validators/onboarding/run-validator/polkadot-explorer-rotatekeys-rpc.webp)

## Set the Node Key

Validators on Polkadot need a static network key (also known as the node key) to maintain a stable node identity. This key ensures that your validator can maintain a consistent peer ID, even across restarts, which is crucial for maintaining reliable network connections.

Starting with Polkadot version 1.11, validators without a stable network key may encounter the following error on startup:

--8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/node-key-error-01.html'

### Generate the Node Key

Use one of the following methods to generate your node key:

- **Generate and Save to File** - the recommended solution is to generate a node key and save it to a file using the following command:

    ``` bash
    polkadot key generate-node-key --file INSERT_PATH_TO_NODE_KEY
    ```

- **Use Default Path** - you can also generate the node key with the following command, which will automatically save the key to the base path of your node:

    ``` bash
    polkadot key generate-node-key --default-base-path
    ```

    Save the file path for reference, as you will need it in the next step to configure your node with a static identity.

### Set the Node Key

After generating the node key, configure your node to use it by specifying the path to the key file when launching your node. Add the following flag to your validator node’s startup command:

``` bash
polkadot --node-key-file INSERT_PATH_TO_NODE_KEY
```

Following these steps ensures that your node retains its identity, making it discoverable by peers without risk of conflicting identities across sessions. For further technical background, see Polkadot SDK [Pull Request #3852](https://github.com/paritytech/polkadot-sdk/pull/3852){target=\_blank} for the rationale behind requiring static keys.

## Validate

Once your validator node is fully synced and ready, the next step is to ensure it’s visible on the network and performing as expected. Below are steps for monitoring and managing your node on the Polkadot network.

### Verify Sync via Telemetry

To confirm that your validator is live and synchronized with the Polkadot network, visit the [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} page. Telemetry provides real-time information on node performance and can help you check if your validator is properly connected. Search for your node by name. You can search all nodes currently active on the network, which is why you should use a unique name for easy recognition. Now, confirm your node is fully synced by comparing the block height of your node with the network’s latest block.

In the following example, a node named `techedtest` is successfully located and synchronized, ensuring it’s prepared to participate in the network:

![polkadot-dashboard-telemetry](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-telemetry.webp)

### Activate via Validator Tab

Follow these steps to use the Polkadot.js Apps UI to activate your validator:

1. Go to the **Validator** tab in the Polkadot.js Apps UI and locate the section where you input the keys generated from `rotateKeys`. Paste the output from `author_rotateKeys`, which is a hex-encoded key that links your validator with its session keys:

    ![polkadot-dashboard-validate-1](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-validate-1.webp)

2. Set a reward commission percentage if desired. You can set a percentage of the rewards to go to your validator and the rest to your nominators. A 100% commission rate indicates the validator intends to keep all rewards and is seen as a signal the validator is not seeking nominators
3. Toggle the **Allows New Nominations** option if your validator is open to more nominations from DOT holders
4. Once everything is configured, select **Bond & Validate** to activate your validator status

    ![dashboard validate](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-validate-2.webp)

### Monitor Validation Status and Slots

On the **Staking** tab in Polkadot.js Apps, you can see your validator’s status, the number of available validator slots, and the nodes that have signaled their intent to validate. Your node may initially appear in the waiting queue, especially if the validator slots are full. The following is an example view of the **Staking** tab:

![staking queue](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-staking.webp)

The validator set refreshes each era. If there’s an available slot in the next era, your node may be selected to move from the waiting queue to the active validator set, allowing it to start validating blocks. If your validator doesn’t get selected, it remains in the waiting queue. Increasing your stake or gaining more nominators may improve your chance of being selected in future eras.

Once your validator is active, it’s officially part of Polkadot’s security infrastructure. For questions or further support, you can reach out to the [Polkadot Validator chat](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io?via=matrix.parity.io&via=matrix.org&via=web3.foundation) for tips and troubleshooting.

## Run a Validator on a TestNet 

Running your validator on a test network like Westend or Kusama is a smart way to familiarize yourself with the process and identify any setup issues in a lower-stakes environment before joining the Polkadot mainnet.

### Choose a Network

- **Westend** - Polkadot’s primary testnet is open to anyone for testing purposes. Validator slots are intentionally limited to keep the network stable for the Polkadot release process, so it may not support as many validators at any given time
- **Kusama** - often called Polkadot’s “canary network,” Kusama has real economic value but operates with a faster and more experimental approach. Running a validator here provides experience closer to MainNet with the benefit of more frequent validation opportunities with an era time of six hours vs 24 hours for Polkadot

### Run a Kusama Validator

Running a validator on the Kusama network is identical to running a Polkadot validator. To start a validator node on Kusama, specify the chain when running the node as follows:

``` bash
polkadot --chain=kusama
```

This will configure your node to connect to the Kusama network instead of Polkadot. Adjust configurations as needed for your test environment, keeping in mind that the technical requirements for Kusama are generally lighter than those on the Polkadot mainnet. If you need help, please reach out on the [Kusama Validator Lounge](https://matrix.to/#/#KusamaValidatorLounge:polkadot.builders) on Element. The team and other experienced validators are there to help answer questions and provide tips.

<!--TODO: everything from here down feels like it should move to 'polkadot-docs/infrastructure/running-a-validator/operational-tasks/general-management.md' Need to confirm with content/tech team-->
## Configuration Optimization

For those seeking to optimize their validator’s performance, the following configurations can improve responsiveness, reduce latency, and ensure consistent performance during high-demand periods.

### Deactivate Simultaneous Multithreading

Polkadot validators operate primarily in single-threaded mode for critical paths, meaning optimizing for single-core CPU performance can reduce latency and improve stability. Deactivating simultaneous multithreading (SMT) can prevent virtual cores from affecting performance. SMT implementation is called Hyper-Threading on Intel and 2-way SMT on AMD Zen. The following will deactivate every other (vCPU) core:

```bash
for cpunum in $(cat /sys/devices/system/cpu/cpu*/topology/thread_siblings_list | cut -s -d, -f2- | tr ',' '\n' | sort -un)
do
  echo 0 > /sys/devices/system/cpu/cpu$cpunum/online
done
```

To save the changes permanently add `nosmt=force` as kernel parameter. Edit `/etc/default/grub` and add `nosmt=force` to `GRUB_CMDLINE_LINUX_DEFAULT` variable as follows:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/grub-config-01.js:1:7'
```

After updating the variable, be sure to update GRUB to apply changes:

``` bash
sudo update-grub
```

After the reboot you should see half of the cores are offline. To confirm, run:

``` bash
lscpu --extended
```

### Deactivate Automatic NUMA Balancing

For multi-CPU setups, Deactivating NUMA (Non-Uniform Memory Access) balancing helps keep processes on the same CPU node, minimizing latency. Run the following command to deactivate NUMA balancing in runtime:

``` bash
sysctl kernel.numa_balancing=0
```

To deactivate NUMA balancing permanently, add `numa_balancing=disable` to GRUB settings:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/grub-config-01.js:9:15'
```

After updating the variable, be sure to update GRUB to apply changes:

``` bash
sudo update-grub
```

Confirm the deactivation by running the following command:

``` bash
sysctl -a | grep 'kernel.numa_balancing'
```

If you successfully deactivated NUMA balancing, the predecing command should return `0`.

### Spectre and Meltdown Mitigations

Spectre and Meltdown are well-known vulnerabilities in modern CPUs that exploit speculative execution to access sensitive data. These vulnerabilities have been patched in recent Linux kernels, but the mitigations can slightly impact performance, especially in high-throughput or containerized environments.

If your security needs allow it, you may selectively deactivate specific mitigations for performance gains. The Spectre V2 and Speculative Store Bypass Disable (SSBD) for Spectre V4 apply to speculative execution and are particularly impactful in containerized environments. Deactivating them can help regain performance if your environment doesn’t require these security layers.

To selectively deactivate the Spectre mitigations, update the `GRUB_CMDLINE_LINUX_DEFAULT` variable in your /etc/default/grub configuration:

``` bash
sudo nano /etc/default/grub
# Add to GRUB_CMDLINE_LINUX_DEFAULT
```

``` config title="/etc/default/grub"
-8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/grub-config-01.js:17:23'
```

After updating the variable, be sure to update GRUB to apply changes and then reboot:

``` bash
sudo update-grub
sudo reboot
```

This approach selectively disables the Spectre V2 and Spectre V4 mitigations, leaving other protections intact. For full security, keep mitigations enabled unless there’s a significant performance need, as disabling them could expose the system to potential attacks on affected CPUs.

## VPS Provider List

When selecting a VPS provider for your validator node, prioritize reliability, consistent performance, and adherence to the specific hardware requirements set for Polkadot validators. The following server types have been tested and showed acceptable performance in benchmark tests. However, this is not an endorsement, and actual performance may vary depending on your workload and VPS provider.

- [**Google Cloud Platform (GCP)**](https://cloud.google.com/){target=\_blank} - `c2` and `c2d` machine families offer high-performance configurations suitable for validators
- [**Amazon Web Services (AWS)**](https://aws.amazon.com/){target=\_blank} - `c6id` machine family provides strong performance, particularly for I/O-intensive workloads
- [**OVH**](https://www.ovh.com.au/){target=\_blank} - can be a budget-friendly solution if it meets your minimum hardware specifications
- [**Digital Ocean**](https://www.digitalocean.com/){target=\_blank} - popular among developers, Digital Ocean’s premium droplets offer configurations suitable for medium to high-intensity workloads
- [**Vultr**](https://www.vultr.com/){target=\_blank} - offers flexibility with plans that may meet validator requirements, especially for high-bandwidth needs
- [**Linode**](https://www.linode.com/){target=\_blank} - provides detailed documentation, which can be helpful for setup
- [**Scaleway**](https://www.scaleway.com/){target=\_blank} - offers high-performance cloud instances that can be suitable for validator nodes
- [**OnFinality**](https://onfinality.io/){target=\_blank} - specialized in blockchain infrastructure, OnFinality provides validator-specific support and configurations

!!! warning "Acceptable use policies"
    Different VPS providers have varying acceptable use policies, and not all explicitly allow cryptocurrency-related activities. Digital Ocean, for instance, requires explicit permission to use servers for cryptocurrency mining and or else it is categorized as Network Abuse in their Acceptable Use Policy. Review the terms for your VPS provider to avoid account suspension or server shutdown due to policy violations.

## Run a Validator Using Systemd

Running your Polkadot validator as a [systemd](https://en.wikipedia.org/wiki/Systemd){target=\_blank} service is an effective way to ensure its high uptime and reliability. Using systemd allows your validator to automatically restart after server reboots or unexpected crashes, significantly reducing the risk of slashing due to downtime.

This guide will walk you through creating and managing a systemd service for your validator, allowing you to seamlessly monitor and control it as part of your Linux system.

### Prerequisites

Ensure the following requirements are met before proceeding with the systemd setup:

- Confirm your system meets the [requirements](infrastructure/running-a-validator/requirements.md) for running a validator
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
    It is recommended to delay the restart of a node with `RestartSec` in the case of node crashes. It's possible that when a node crashes, consensus votes in GRANDPA aren't persisted to disk. In this case, there is potential to equivocate when immediately restarting. Delaying the restart will allow the network to progress past potentially conflicting votes.

### Run the Service

Enable the systemd service to start on system boot by running:

```bash
systemctl enable polkadot-validator.service
```

To start the service manually, use:

```bash
systemctl start polkadot-validator.service
```

Check the service’s status to confirm it is running:

```bash
systemctl status polkadot-validator.service
```

To view the logs in real-time, use [journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html){target=\_blank} like so:

```bash
journalctl -f -u polkadot-validator
```

With these steps, you can effectively manage and monitor your validator as a systemd service.

## Additional Resources

For additional guidance, connect with other validators and the Polkadot engineering team in the [Polkadot Validator Lounge](https://matrix.to/#/#polkadotvalidatorlounge:web3.foundation) on Element. 



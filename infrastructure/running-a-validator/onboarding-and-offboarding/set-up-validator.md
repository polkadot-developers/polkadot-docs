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

## Set Session Keys

!!!caution Session keys are consensus critical
    If you are not sure if your node has the current session keys that you made the `setKeys`
    transaction then you can use one of the two available RPC methods to query your node:
    [hasKey](https://polkadot.js.org/docs/substrate/rpc/#haskeypublickey-bytes-keytype-text-bool) to
    check for a specific key or
    [hasSessionKeys](https://polkadot.js.org/docs/substrate/rpc/#hassessionkeyssessionkeys-bytes-bool)
    to check the full session key public key string.

Once your node is fully synced, stop the process by pressing Ctrl-C. At your terminal prompt, you
will now start running the node.

```sh
polkadot --validator --name "name on telemetry"
```

Similarly:

```
2021-06-17 03:12:08 Parity Polkadot
2021-06-17 03:12:08 ✌️  version 0.9.5-95f6aa201-x86_64-linux-gnu
2021-06-17 03:12:08 ❤️  by Parity Technologies <admin@parity.io>, 2017-2021
2021-06-17 03:12:08 📋 Chain specification: Polkadot
2021-06-17 03:12:08 🏷 Node name: nateched-test
2021-06-17 03:12:08 👤 Role: AUTHORITY
2021-06-17 03:12:08 💾 Database: RocksDb at /root/.local/share/polkadot/chains/polkadot/db
2021-06-17 03:12:08 ⛓  Native runtime: polkadot-9050 (parity-polkadot-0.tx7.au0)
2021-06-17 03:12:12 🏷 Local node identity is: 12D3KooWLtXFWf1oGrnxMGmPKPW54xWCHAXHbFh4Eap6KXmxoi9u
2021-06-17 03:12:12 📦 Highest known block at #64673
2021-06-17 03:12:12 〽️ Prometheus server started at 127.0.0.1:9615
2021-06-17 03:12:12 Listening for new connections on 127.0.0.1:9944.
2021-06-17 03:12:12 👶 Starting BABE Authorship worker
```

```
2021-06-17 03:12:16 🔍 Discovered new external address for our node: /ip4/10.26.11.1/tcp/30333/p2p/12D3KooWLtXFWf1oGrnxMGmPKPW54xWCHAXHbFh4Eap6KXmxoi9u
2021-06-17 03:12:17 ⚙️  Syncing, target=#5553810 (14 peers), best: #65068 (0x6da5…0662), finalized #65024 (0x4e84…d170), ⬇ 352.2kiB/s ⬆ 75.6kiB/s
```

You can give your validator any name that you like, but note that others will be able to see it, and
it will be included in the list of all servers using the same telemetry server. Since numerous
people are using telemetry, it is recommended that you choose something likely to be unique.

### Generating the Session Keys

You need to tell the chain your Session keys by signing and submitting an extrinsic. This is what
associates your validator node with your stash account on Polkadot.

#### Option 1: PolkadotJS-APPS

You can generate your [Session keys](../learn/learn-cryptography.md) in the client via the apps RPC.
If you are doing this, make sure that you have the PolkadotJS-Apps explorer attached to your
validator node. You can configure the apps dashboard to connect to the endpoint of your validator in
the Settings tab. If you are connected to a default endpoint hosted by Parity of Web3 Foundation,
you will not be able to use this method since making RPC requests to this node would effect the
local keystore hosted on a _public node_ and you want to make sure you are interacting with the
keystore for _your node_.

Once ensuring that you have connected to your node, the easiest way to set session keys for your
node is by calling the `author_rotateKeys` RPC request to create new keys in your validator's
keystore. Navigate to Toolbox tab and select RPC Calls then select the author > rotateKeys() option
and remember to save the output that you get back for a later step.

![Explorer RPC call](/images/infrastructure/validators/onboarding/run-validator/polkadot-explorer-rotatekeys-rpc.webp)

#### Option 2: CLI

If you are on a remote server, it is easier to run this command on the same machine (while the node
is running with the default WS RPC port configured):

```sh
curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "author_rotateKeys", "params":[]}' http://localhost:9944
```

The output will have a hex-encoded "result" field. The result is the concatenation of the four
public keys. Save this result for a later step.

You can restart your node at this point.

### Submitting the `setKeys` Transaction

You need to tell the chain your Session keys by signing and submitting an extrinsic. This is what
associates your validator with your staking proxy.

Go to [Staking > Account Actions](https://polkadot.js.org/apps/#/staking/actions), and click "Set
Session Key" on the bonding account you generated earlier. Enter the output from `author_rotateKeys`
in the field and click "Set Session Key".

![staking-change-session](/images/infrastructure/validators/onboarding/run-validator/set-session-key-1.webp)
![staking-session-result](/images/infrastructure/validators/onboarding/run-validator/set-session-key-2.webp)

Submit this extrinsic and you are now ready to start validating.

### Setting the Node (aka Network) Key

Validators must use a static network key to maintain a stable node identity across restarts.
Starting with Polkadot version 1.11, a check is performed on startup, and the following error will
be printed if a static node key is not set:

```
Error:
0: Starting an authority without network key
This is not a safe operation because other authorities in the network may depend on your node having a stable identity.
Otherwise these other authorities may not being able to reach you.

If it is the first time running your node you could use one of the following methods:
1. [Preferred] Separately generate the key with: <NODE_BINARY> key generate-node-key --base-path <YOUR_BASE_PATH>
2. [Preferred] Separately generate the key with: <NODE_BINARY> key generate-node-key --file <YOUR_PATH_TO_NODE_KEY>
3. [Preferred] Separately generate the key with: <NODE_BINARY> key generate-node-key --default-base-path
4. [Unsafe] Pass --unsafe-force-node-key-generation and make sure you remove it for subsequent node restarts"
```

The recommended solution is to generate a node key and save it to a file using
`polkadot key generate-node-key --file <PATH_TO_NODE_KEY>`, then attach it to your node with
`--node-key-file <PATH_TO_NODE_KEY>`.

Please see [polkadot-sdk#3852](https://github.com/paritytech/polkadot-sdk/pull/3852) for the
rationale behind this change.

## Validate

To verify that your node is live and synchronized, head to
[Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1) and find your node. Note that this
will show all nodes on the Polkadot network, which is why it is important to select a unique name!

In this example, we used the name `techedtest` and have successfully located it upon searching:

![polkadot-dashboard-telemetry](/images/infrastructure/validators/onboarding/run-validator/polkadot-dashboard-telemetry.webp)

### Setup via Validator Tab

![polkadot-dashboard-validate-1](/images/infrastructure/validators/onboarding/run-validator/polkadot-dashboard-validate-1.webp)

Here you will need to input the Keys from `rotateKeys`, which is the Hex output from
`author_rotateKeys`. The keys will show as pending until applied at the start of a new session.

The "reward commission percentage" is the commission percentage that you can declare against your
validator's rewards. This is the rate that your validator will be commissioned with.

- **Payment preferences** - You can specify the percentage of the rewards that will get paid to you.
  The remaining will be split among your nominators.

!!!note "Setting a commission rate of 100% suggests that you do not want your validator to receive nominations"

You can also determine if you would like to receive nominations with the "allows new nominations"
option.

![dashboard validate](/images/infrastructure/validators/onboarding/run-validator/polkadot-dashboard-validate-2.webp)

Click "Bond & Validate".

If you go to the "Staking" tab, you will see a list of active validators currently running on the
network. At the top of the page, it shows the number of validator slots that are available as well
as the number of nodes that have signaled their intention to be a validator. You can go to the
"Waiting" tab to double check to see whether your node is listed there.

![staking queue](/images/infrastructure/validators/onboarding/run-validator/polkadot-dashboard-staking.webp)

The validator set is refreshed every era. In the next era, if there is a slot available and your
node is selected to join the validator set, your node will become an active validator. Until then,
it will remain in the _waiting_ queue. If your validator is not selected to become part of the
validator set, it will remain in the _waiting_ queue until it is. There is no need to re-start if
you are not selected for the validator set in a particular era. However, it may be necessary to
increase the number of DOT staked or seek out nominators for your validator in order to join the
validator set.

**Congratulations!** If you have followed all of these steps, and been selected to be a part of the
validator set, you are now running a Polkadot validator! If you need help, reach out on the
[Polkadot Validator chat](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io?via=matrix.parity.io&via=matrix.org&via=web3.foundation).

## Thousand Validators Programme

The Thousand Validators Programme is a joint initiative by Web3 Foundation and Parity Technologies
to provide support for community validators. If you are interested in applying for the program, you
can find more information [on the wiki page](../general/thousand-validators.md).

## Running a validator on a testnet

To verify your validator setup, it is possible to run it against a PoS test network such as Westend.
However, validator slots are intentionally limited on Westend to ensure stability and availability
of the testnet for the Polkadot release process.

Here is a small comparison of each network characteristics as relevant to validators:

| Network           | Polkadot | Westend    |
| ----------------- | -------- | ---------- |
| epoch             | 4h       | 1h         |
| era               | 1d       | 6h         |
| token             | DOT      | WND (test) |
| active validators | ~300     | ~20        |

## FAQ

### Why am I unable to synchronize the chain with 0 peers?

![zero-peer](/images/infrastructure/validators/onboarding/run-validator/polkadot-zero-peer.webp)

Make sure to enable `30333` libp2p port. Eventually, it will take a little bit of time to discover
other peers over the network.

### How do I clear all my chain data?

```sh
polkadot purge-chain
```

!!!info
    Check out the [Substrate StackExchange](https://substrate.stackexchange.com/) to quickly get the
    answers you need.

## Note about VPS

VPS providers are very popular for running servers of any kind. Extensive benchmarking was conducted
to ensure that VPS servers are able to keep up with the work load in general.

!!!note
    Before you run a live Validator, please verify if the advertised performance is actually delivered
    consistently by the VPS provider.

The following server types showed acceptable performance during the benchmark tests. Please note
that this is not an endorsement in any way:

- GCP's _c2_ and _c2d_ machine families
- AWS's _c6id_ machine family

The following additional configurations were applied to the instances to tune their performance:

### Disable [SMT](https://en.wikipedia.org/wiki/Simultaneous_multithreading)

As critical path of Substrate is single-threaded we need to optimize for single-core CPU
performance. The node still profits from multiple cores when doing networking and other non-runtime
operations. It is therefore still necessary to run it on at least the minimum required number of
cores. Disabling SMT improves the performance as each vCPU becomes mapped to a physical CPU core
rather than being presented to the OS as two logical cores. SMT implementation is called
_Hyper-Threading_ on Intel and _2-way SMT_ on AMD Zen. To disable SMT in runtime:

```bash
for cpunum in $(cat /sys/devices/system/cpu/cpu*/topology/thread_siblings_list | cut -s -d, -f2- | tr ',' '\n' | sort -un)
do
  echo 0 > /sys/devices/system/cpu/cpu$cpunum/online
done
```

It will disable every other (vCPU) core.

To save changes permanently add `nosmt=force` as kernel parameter. Edit `/etc/default/grub` and add
`nosmt=force` to `GRUB_CMDLINE_LINUX_DEFAULT` variable and run `sudo update-grub`. After the reboot
you should see half of the cores are offline. Run `lscpu --extended` to confirm.

### Disable automatic NUMA balancing

If you have multiple physical CPUs (CPU0 and CPU1) in the system each with its own memory bank (MB0
and MB1), then it is usually slower for a CPU0 to access MB1 due to the slower interconnection. To
prevent the OS from automatically moving the running Substrate process from one CPU to another and
thus causing an increased latency, it is recommended to disable automatic NUMA balancing.

With automatic NUMA balancing disabled, an OS will always run a process on the same NUMA node where
it was initially scheduled.

To disable NUMA balancing in runtime:

```bash
sysctl kernel.numa_balancing=0
```

To save changes permanently, update startup options and reconfigure GRUB. Edit `/etc/default/grub`
and add `numa_balancing=disable` to `GRUB_CMDLINE_LINUX_DEFAULT` variable and run
`sudo update-grub`. After reboot you can confirm the change by running
`sysctl -a | grep 'kernel.numa_balancing'` and checking if the parameter is set to 0

### Configure Spectre/Meltdown Mitigations

Spectre and Meltdown are vulnerabilities discovered in modern CPUs a few years ago. Mitigations were
made to the Linux kernel to cope with the multiple variations of these attacks. Check out
https://meltdownattack.com/ for more info.

Initially those mitigations added ~20% penalty to the performance of the workloads. As CPU
manufacturers started to roll-out mitigations implemented in hardware, the performance gap
[narrowed down](https://www.phoronix.com/scan.php?page=article&item=3-years-specmelt&num=1). As the
benchmark demonstrates, the performance penalty got reduced to ~7% on Intel 10th Gen CPUs. This is
true for the workloads running on both bare-metal and VMs. But the penalty remains high for the
containerized workloads in some cases.

As demonstrated in
[Yusuke Endoh's article](http://mamememo.blogspot.com/2020/05/cpu-intensive-rubypython-code-runs.html),
a performance penalty for containerized workloads can be as high as 100%. This is due to SECCOMP
profile being overprotective about applying Spectre/Meltdown mitigations without providing real
security. A longer explanation is available in the
[kernel patch discussion](https://lkml.org/lkml/2020/11/4/1135).

Linux 5.16
[loosened the protections](https://www.phoronix.com/scan.php?page=news_item&px=Linux-Spectre-SECCOMP-Default)
applied to SECCOMP threads by default. Containers running on kernel 5.16 and later now don't suffer
from the performance penalty implied by using a SECCOMP profile in container runtimes.

#### For Linux >= 5.16

You are all set. The performance of containerized workloads is on par with non-containerized ones.
You don't have to do anything.

#### For Linux < 5.16

You'll need to disable mitigations for Spectre V2 for user-space tasks as well as Speculative Store
Bypass Disable (SSBD) for Spectre V4.
[This patch message](https://git.kernel.org/pub/scm/linux/kernel/git/kees/linux.git/commit/?h=for-next/seccomp&id=2f46993d83ff4abb310ef7b4beced56ba96f0d9d)
describes the reasoning for this default change in more detail:

> Ultimately setting SSBD and STIBP by default for all seccomp jails is a bad sweet spot and bad
> default with more cons than pros that end up reducing security in the public cloud (by giving an
> huge incentive to not expose SPEC_CTRL which would be needed to get full security with IBPB after
> setting nosmt in the guest) and by excessively hurting performance to more secure apps using
> seccomp that end up having to opt out with SECCOMP_FILTER_FLAG_SPEC_ALLOW.

To disable the mitigations edit `/etc/default/grub` and add
`spec_store_bypass_disable=prctl spectre_v2_user=prctl` to `GRUB_CMDLINE_LINUX_DEFAULT` variable,
run `sudo update-grub`, then reboot.

Note that mitigations are not disabled completely. You can fully disable all the available kernel
mitigations by setting `mitigations=off`. But we don't recommend doing this unless you run a fully
trusted code on the host.

### VPS List

- [Google Cloud](https://cloud.google.com/)
- [Amazon AWS](https://aws.amazon.com/)
- [OVH](https://www.ovh.com.au/)
- [Digital Ocean](https://www.digitalocean.com/)
- [Vultr](https://www.vultr.com/)
- [Linode](https://www.linode.com/)
- [Scaleway](https://www.scaleway.com/)
- [OnFinality](https://onfinality.io/)

!!!caution "Beware of the Terms and Conditions and Acceptable Use Policies for each VPS provider"
    You may be locked out of your account and your server shut down if you come in violation. For
    instance, Digital Ocean lists "Mining of Cryptocurrencies" under the Network Abuse section of their
    [Acceptable Use Policy](https://www.digitalocean.com/legal/acceptable-use-policy/) and requires
    explicit permission to do so. This may extend to other cryptocurrency activity.

---
title: Kusama
description: The fundamentals for running a Kusama validator.
---

## Preliminaries

Running a validator on a live network is a lot of responsibility! You will be accountable for not
only your own stake, but also the stake of your current nominators. If you make a mistake and get
[slashed](../../learn/learn-offenses.md), your tokens and your reputation will be at risk. However,
running a validator can also be very rewarding, knowing that you contribute to the security of a
decentralized network while growing your stash.

!!!warning
    It is highly recommended that you have significant system administration experience before
    attempting to run your own validator.

    You must be able to handle technical issues and anomalies with your node which you must be able to
    tackle yourself. Being a validator involves more than just executing the binary file.

Since security is so important to running a successful validator, you should take a look at the
[secure validator](../maintain-guides-secure-validator.md) information to make sure you understand
the factors to consider when constructing your infrastructure. As you progress in your journey as a
validator, you will likely want to use this repository as a _starting point_ for your own
modifications and customizations.

If you need help, please reach out on the
[Kusama Validator Lounge](https://matrix.to/#/#KusamaValidatorLounge:polkadot.builders) on Element.
The team and other validators are there to help answer questions and provide tips from experience.

### How many KSM do I need to become an active Validator?

!!!info Controller accounts are deprecated
    Controller accounts are deprecated. For more information, see
    [this discussion](https://forum.polkadot.network/t/staking-controller-deprecation-plan-staking-ui-leads-comms/2748).


You can have a rough estimate on that by using the methods listed
[here](../../general/faq.md/#what-is-the-minimum-stake-necessary-to-be-elected-as-an-active-validator).
To be elected into the set, you need a minimum stake behind your validator. This stake can come from
yourself or from [nominators](../../learn/learn-nominator.md). This means that as a minimum, you
will need enough KSM to set up Stash and staking proxy [accounts](../../learn/learn-cryptography.md)
with the existential deposit, plus a little extra for transaction fees. The rest can come from
nominators. To understand how validators are elected, check the
[NPoS Election algorithms](../../learn/learn-phragmen.md) page.

!!!tip Join the Thousand Validator Programme
    [The Thousand Validator Programme](../../general/thousand-validators.md) is an initiative by Web3
    Foundation and Parity Technologies to use the funds held by both organizations to nominate
    validators in the community.

**Warning:** Any KSM that you stake for your validator is liable to be slashed, meaning that an
insecure or improper setup may result in loss of KSM tokens! If you are not confident in your
ability to run a validator node, it is recommended to nominate your KSM to a trusted validator node
instead.

### Validator Rewards

On Kusama, one day is approximately four eras whereas on Polkadot, one era is approximately a day.
In each era, the validators elected to the active set earn era points which correspond to the actual
rewards earned that are distributed proportionally to the nominators after deducting the validator
commission. The
[minimum validator commission](../../general/chain-state-values.md#minimum-validator-commission) can
be set through on-chain governance. For more information rewards and payouts, check the
[validator payout](../maintain-guides-validator-payout.md) document.

## Run a Kusama Validator

Running a validator on the Kusama network is identical to running a Polkadot validator. Check out
the [Polkadot guide](../maintain-guides-how-to-validate-polkadot.md) on how to setup a validator.

Make sure to adjust the Polkadot guide to run a Kusama network validator (the instructions will also
be available in the Polkadot Validator guide):

- When starting the node pass `--chain=kusama` CLI flag

# Run a Validator Using Systemd

Running your Polkadot validator as a [systemd](https://en.wikipedia.org/wiki/Systemd){target=\_blank} service is an effective way to ensure its reliability and uptime. This method enables your validator to automatically restart after server reboots or unexpected crashes, significantly reducing the risk of [slashing](TODO:update-path){target=\_blank} due to downtime.

This guide will walk you through creating and managing a systemd service for your validator, allowing you to seamlessly monitor and control it as part of your Linux system.

## Prerequisites

The following sections go through the process of using the binary and running a Polkadot validator node as a systemd service. To get started, you'll need to:

- Make sure that your system meets the [requirements](TODO:update-path)
- Make sure that you meet the [minimum bond requirements](https://wiki.polkadot.network/docs/chain-state-values#minimum-validator-bond){target=\_blank} for validating
- Have [installed](TODO:update-path--install-polkadot-binary) or [built from sources](TODO:update-path--compile-the-binary) the Polkadot binary

## Create the Systemd Service File

First create a new unit file called `polkadot-validator.service` in `/etc/systemd/system/`:

```bash
touch /etc/systemd/system/polkadot-validator.service
```

In this unit file, you will write the commands that you want to run on server boot/restart:

```systemd
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/heads/master/polkadot/scripts/packaging/polkadot.service'
```

!!!warning
    It is recommended to delay the restart of a node with `RestartSec` in the case of node crashes. It's possible that when a node crashes, consensus votes in GRANDPA aren't persisted to disk. In this case, there is potential to equivocate when immediately restarting. What can happen is that the node won't recognize votes that didn't make it to disk and will then cast conflicting votes. Delaying the restart will allow the network to progress past potentially conflicting votes, at which point other nodes won't accept them.

## Run the Service

To enable this to start on booting your machine, run:

```bash
systemctl enable polkadot-validator.service
```

Start it manually with:

```bash
systemctl start polkadot-validator.service
```

You can check that it's working with:

```bash
systemctl status polkadot-validator.service
```

You can tail the logs with [`journalctl`](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html){target=\_blank} (a tool to print log entries from the systemd journal) like so:

```bash
journalctl -f -u polkadot-validator
```

Now, you can monitor and manage a Polkadot validator as you would any other service on your Linux host.

## Secure Validator

## Additional Resources

- Visit the [Polkadot Validator Lounge](https://matrix.to/#/#polkadotvalidatorlounge:web3.foundation) on Element to connect with the engineering team and experienced validators



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

- Read [Validator Requirements](infrastructure/running-a-validator/requirements.md) and understand the recommended minimum skill level and hardware needs
- Read [General Management](infrastructure/running-a-validator/operational-tasks/general-management.md), [Upgrade Your Node](infrastructure/running-a-validator/operational-tasks/upgrade-your-node.md), and [Pause Validating](infrastructure/running-a-validator/onboarding-and-offboarding/stop-validating.md) and understand the tasks required to keep your validator operational
- Read [Rewards Payout](infrastructure/staking-mechanics/rewards-payout.md) and understand how validator rewards are determined and paid out
- Read [Offenses and Slashes](infrastructure/staking-mechanics/offenses-and-slashes.md) and understand how validator performance and security can affect tokens staked by you or your nominators

## Initial Setup

Before you can begin running your validator, you'll need to configure your server environment to meet the operational and security standards required for validating. Configuration includes setting up time synchronization, ensuring critical security features are active, and installing the necessary binaries. Proper setup at this stage is essential to prevent issues like block production errors or being penalized for downtime. Below are the essential steps to get your system ready.

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

### Verify Landlock is Activate

[Landlock](https://docs.kernel.org/userspace-api/landlock.html){target=\_blank} is an important security feature integrated into Linux kernels starting with version 5.13. It allows processes, even those without special privileges, to limit their access to the system to reduce the machine's attack surface. This feature is crucial for validators, as it helps ensure the security and stability of the node by preventing unauthorized access or malicious behavior.

To use Landlock, ensure you use the reference kernel or newer versions. Most Linux distributions should already have Landlock activated. You can check if Landlock is activated on your machine by running the following command as root:

```sh
dmesg | grep landlock || journalctl -kg landlock
```

If Landlock is not activated, your system logs won't show any related output. In this case, you will need to activate it manually or ensure that your Linux distribution supports it. Most modern distributions with the required kernel version should have Landlock activated by default. However, if your system lacks support, you may need to build the kernel with Landlock activated. For more information on doing so, refer to the [official kernel documentation](https://docs.kernel.org/userspace-api/landlock.html#kernel-support){target=\_blank}.

Implementing Landlock ensures your node operates in a restricted, self-imposed sandbox, limiting potential damage from security breaches or bugs. While not a mandatory requirement, enabling this feature greatly improves the security of your validator setup.

## Bond DOT

Once your validator node is synced, the next step is bonding DOT. A bonded account, or stash, holds your staked tokens (DOT) that back your validator node. Bonding your DOT means locking it for a period, during which it cannot be transferred or spent but is used to secure your validator's role in the network. The following sections will guide you through bonding DOT for your validator.

### Minimum Bond Requirement

Before bonding DOT, ensure you meet the minimum bond requirement to start a validator instance. The minimum bond is the least DOT you need to stake to enter the validator set. To become eligible for rewards, your validator node needs to be nominated by enough staked tokens.

For example, on May 21st, 2024, the minimum stake backing a validator in Polkadot's era 1449 was 2,377,756.492 DOT. You can check the current minimum stake required using these tools:

- [**Subscan**](https://polkadot.subscan.io/validator_list?status=validator){target=\_blank}
- [**Staking Dashboard**](https://staking.polkadot.cloud/#/overview){target=\_blank}

### Bonding DOT on Polkadot.js Apps

Once you're ready to bond your DOT, follow these steps using the Polkadot.js Apps UI:

1. **Network** dropdown at the top of the page, select the arrow to expand, and then select [**Staking**](https://polkadot.js.org/apps/#/staking/actions){target=\_blank} section. Select **Account Actions**, and then the **+ Stash** button
2. **Stash account** - select your stash account (which is the account with the DOT/KSM balance)
3. **Value bonded** - enter how much DOT from the stash account you want to bond/stake. You are not required to bond all of the DOT in that account and you may bond more DOT at a later time. Be aware, withdrawing any bonded amount requires waiting for the unbonding period. The unbonding period is seven days for Kusama and 28 days for Polkadot
4. **Payment destination** - add the recipient account for validator rewards. If you'd like to redirect payments to an account that is not the stash account, you can do it by entering the address here. Note that it is extremely unsafe to set an exchange address as the recipient of the staking rewards

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

1. Go to the **Staking > Account Actions** section on Polkadot.js Apps
2. Select **Set Session Key** on the bonding account you generated earlier
3. Paste the hex-encoded session key string you generated (from either the UI or CLI) into the input field and submit the transaction

![](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/set-up-validator-1.webp)

Once the transaction is signed and submitted, your session keys will be registered on-chain. 

### Verify Session Key Setup

To verify that your session keys are properly set, you can use one of two RPC calls:

- **`hasKey`** - checks if the node has a specific key by public key and key type
- **`hasSessionKeys`** - verifies if your node has the full session key string associated with the validator

For example, you can [check session keys on the Polkadot.js Apps](https://polkadot.js.org/apps/#/rpc){target=\_blank} interface or by running an RPC query against your node. Once this is done, your validator node is ready for its role.

![Explorer RPC call](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-explorer-rotatekeys-rpc.webp)

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

To confirm that your validator is live and synchronized with the Polkadot network, visit the [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} page. Telemetry provides real-time information on node performance and can help you check if your validator is connected properly. Search for your node by name. You can search all nodes currently active on the network, which is why you should use a unique name for easy recognition. Now, confirm that your node is fully synced by comparing the block height of your node with the network's latest block.

In the following example, a node named `techedtest` is successfully located and synchronized, ensuring it's prepared to participate in the network:

![polkadot-dashboard-telemetry](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-telemetry.webp)

### Activate via Validator Tab

Follow these steps to use the Polkadot.js Apps UI to activate your validator:

1. Go to the **Validator** tab in the Polkadot.js Apps UI and locate the section where you input the keys generated from `rotateKeys`. Paste the output from `author_rotateKeys`, which is a hex-encoded key that links your validator with its session keys:

    ![polkadot-dashboard-validate-1](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-validate-1.webp)

2. Set a reward commission percentage if desired. You can set a percentage of the rewards to pay to your validator and the remainder pays to your nominators. A 100% commission rate indicates the validator intends to keep all rewards and is seen as a signal the validator is not seeking nominators
3. Toggle the **Allows New Nominations** option if your validator is open to more nominations from DOT holders
4. Once everything is configured, select **Bond & Validate** to activate your validator status

    ![dashboard validate](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-validate-2.webp)

### Monitor Validation Status and Slots

On the **Staking** tab in Polkadot.js Apps, you can see your validator's status, the number of available validator slots, and the nodes that have signaled their intent to validate. Your node may initially appear in the waiting queue, especially if the validator slots are full. The following is an example view of the **Staking** tab:

![staking queue](/images/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/polkadot-dashboard-staking.webp)

The validator set refreshes each era. If there's an available slot in the next era, your node may be selected to move from the waiting queue to the active validator set, allowing it to start validating blocks. If your validator is not selected, it remains in the waiting queue. Increasing your stake or gaining more nominators may improve your chance of being selected in future eras.

Once your validator is active, it's officially part of Polkadot's security infrastructure. For questions or further support, you can reach out to the [Polkadot Validator chat](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io?via=matrix.parity.io&via=matrix.org&via=web3.foundation) for tips and troubleshooting.

## Run a Validator on a TestNet 

Running your validator on a test network like Westend or Kusama is a smart way to familiarize yourself with the process and identify any setup issues in a lower-stakes environment before joining the Polkadot MainNet.

### Choose a Network

- **Westend** - Polkadot's primary TestNet is open to anyone for testing purposes. Validator slots are intentionally limited to keep the network stable for the Polkadot release process, so it may not support as many validators at any given time
- **Kusama** - often called Polkadot's “canary network,” Kusama has real economic value but operates with a faster and more experimental approach. Running a validator here provides an experience closer to MainNet with the benefit of more frequent validation opportunities with an era time of six hours vs 24 hours for Polkadot

### Run a Kusama Validator

Running a validator on the Kusama network is identical to running a Polkadot validator. To start a validator node on Kusama, specify the chain when running the node as follows:

``` bash
polkadot --chain=kusama
```

Using this flag will configure your node to connect to the Kusama network instead of Polkadot. Adjust configurations as needed for your test environment, keeping in mind that the technical requirements for Kusama are generally lighter than those on the Polkadot mainnet. If you need help, please reach out on the [Kusama Validator Lounge](https://matrix.to/#/#KusamaValidatorLounge:polkadot.builders) on Element. The team and other experienced validators are there to help answer questions and provide tips.

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
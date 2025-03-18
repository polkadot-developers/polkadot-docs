---
title: Set Up a Validator
description: Set up a Polkadot validator node to secure the network and earn staking rewards. Follow this step-by-step guide to install, configure, and manage your node.
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
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk.version }}/polkadot

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk.version }}/polkadot.asc
    
    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot.asc
    ```

=== "`polkadot-prepare-worker`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk.version }}/polkadot-prepare-worker

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk.version }}/polkadot-prepare-worker.asc

    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot-prepare-worker.asc
    ```

=== "`polkadot-execute-worker`"

    ``` bash
    # Download the binary
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk.version }}/polkadot-execute-worker

    # Verify signature
    curl -LO https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk.version }}/polkadot-execute-worker.asc

    gpg --keyserver hkps://keyserver.ubuntu.com --receive-keys 90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE

    gpg --verify polkadot-execute-worker.asc
    ```


Signature verification cryptographically ensures the downloaded binaries are authentic and have not been tampered with by using GPG signing keys. Polkadot releases use two different signing keys:

- ParityReleases (release-team@parity.io) with key [`90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE`](https://keyserver.ubuntu.com/pks/lookup?search=9D4B2B6EB8F97156D19669A9FF0812D491B96798&fingerprint=on&op=index){target=\_blank} for current and new releases
- Parity Security Team (security@parity.io) with key [`9D4B2B6EB8F97156D19669A9FF0812D491B96798`](https://keyserver.ubuntu.com/pks/lookup?search=90BD75EBBB8E95CB3DA6078F94A4029AB4B35DAE&fingerprint=on&op=index){target=\_blank} for old releases

    !!!warning
        When verifying a signature, a "Good signature" message indicates successful verification, while any other output signals a potential security risk.

### Install with Package Managers

Users running Debian-based distributions like Ubuntu can install the binaries using the [APT](https://wiki.debian.org/Apt){target=\_blank} package manager.

Execute the following commands as root to add the official repository and install the binaries:

```bash
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

Once installation completes, verify the binaries are correctly installed by following the steps in the [verify installation](#verify-installation) section.

### Install with Ansible

You can also manage Polkadot installations using Ansible. This approach can be beneficial for users managing multiple validator nodes or requiring automated deployment. The [Parity chain operations Ansible collection](https://github.com/paritytech/ansible-galaxy/){target=\_blank} provides a Substrate node role for this purpose.

### Install with Docker

If you prefer using Docker or an OCI-compatible container runtime, the official Polkadot Docker image can be pulled directly from Docker Hub.

To pull the latest stable image, run the following command:

```bash
docker pull parity/polkadot:{{ dependencies.repositories.polkadot_sdk.docker_image_version }}
```

### Build from Sources

You may build the binaries from source by following the instructions on the [Polkadot SDK repository](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/polkadot#building){target=\_blank}.

## Verify Installation

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
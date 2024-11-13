---
title: Validator Requirements
description: Explore the technical and system requirements for running a Polkadot validator, including setup, hardware, staking prerequisites, and security best practices.
---
# Validator Requirements

## Introduction

Running a validator in the Polkadot ecosystem is essential for maintaining network security and decentralization. Validators are responsible for validating transactions and adding new blocks to the chain, ensuring the system operates smoothly. In return for their services, validators earn rewards. However, the role comes with inherent risks, such as slashing penalties for misbehavior or technical failures. If you’re new to validation, starting on Kusama provides a lower-stakes environment to gain valuable experience before progressing to Polkadot’s live network.

This guide covers everything you need to know about becoming a validator, including system requirements, staking prerequisites, and infrastructure setup. Whether you’re deploying on a VPS or running your node on custom hardware, you’ll learn how to optimize your validator for performance and security, ensuring compliance with network standards while minimizing risks.

## Prerequisites

Running a validator requires solid system administration skills and a secure, well-maintained infrastructure. Below are the primary requirements you need to be aware of before getting started:

- **System administration expertise** - handling technical anomalies and maintaining node infrastructure is critical. Validators must be able to troubleshoot and optimize their setup
- **Security** - ensure your setup follows best practices for securing your node. Refer to the [Secure Validator](TODO: update path) section to learn about important security measures
- **Network choice** - start with Kusama to gain experience. The [Kusama section](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator.md) outlines how to get started
- **Staking requirements** - a minimum amount of native token (KSM or DOT) is required to be elected into the validator set. The required stake can come from your own holdings or from nominators
- **Risk of slashing** - any DOT you stake is at risk if your setup fails or your validator misbehaves. If you’re unsure of your ability to maintain a reliable validator, consider nominating your DOT to a trusted validator

## Technical Requirements

Running a Polkadot validator node on Linux is the most common approach, especially for beginners. While you can use any VPS provider that meets the technical specifications, this guide uses Ubuntu 22.04. However, the steps should be adaptable to other Linux distributions.

### Reference Hardware

Polkadot validators rely on high-performance hardware to process blocks efficiently. The following specifications are based on benchmarking using two VM instances:

- **Google Cloud Platform (GCP)** - `n2-standard-8` instance
- **Amazon Web Services (AWS)** - `c6i.4xlarge` instance

The recommended minimum hardware requirements to ensure a fully functional and performant validator are as follows:

=== "CPU"

    - x86-64 compatible
    - Eight physical cores @ 3.4 GHz 
        - Per [Referenda #1051](https://polkadot.subsquare.io/referenda/1051){target=\_blank}, this will be a hard requirement as of January 2025
    - Processor:
        - Intel - Ice Lake or newer (Xeon or Core series)
        - AMD - Zen3 or newer (EPYC or Ryzen)
    - Simultaneous multithreading disabled:
        - Intel - Hyper-Threading
        - AMD - SMT
    - [Single-threaded performance]((https://www.cpubenchmark.net/singleThread.html)){traget=\_blank} is prioritized over higher cores count

=== "Storage"

    - NVMe SSD - at least 1 TB for blockchain data (prioritize latency rather than throughput)
    - Storage requirements will increase as the chain grows. For current estimates, see the [current chain snapshot](https://stakeworld.io/docs/dbsize){target=\_blank}

=== "Memory"

    - 32 GB DDR4 ECC

=== "System"

    - Linux Kernel 5.16 or newer

=== "Network"

    - Symmetric networking speed of 500 Mbit/s is required to handle large numbers of parachains and ensure congestion control during peak times


While the hardware specs above are best practice and not strict requirements, subpar hardware may lead to performance issues and increase the risk of slashing.

## VPS Provider List

When selecting a VPS provider for your validator node, prioritize reliability, consistent performance, and adherence to the specific hardware requirements set for Polkadot validators. The following server types have been tested and showed acceptable performance in benchmark tests. However, this is not an endorsement and actual performance may vary depending on your workload and VPS provider.

- [**Google Cloud Platform (GCP)**](https://cloud.google.com/){target=\_blank} - `c2` and `c2d` machine families offer high-performance configurations suitable for validators
- [**Amazon Web Services (AWS)**](https://aws.amazon.com/){target=\_blank} - `c6id` machine family provides strong performance, particularly for I/O-intensive workloads
- [**OVH**](https://www.ovh.com.au/){target=\_blank} - can be a budget-friendly solution if it meets your minimum hardware specifications
- [**Digital Ocean**](https://www.digitalocean.com/){target=\_blank} - popular among developers, Digital Ocean's premium droplets offer configurations suitable for medium to high-intensity workloads
- [**Vultr**](https://www.vultr.com/){target=\_blank} - offers flexibility with plans that may meet validator requirements, especially for high-bandwidth needs
- [**Linode**](https://www.linode.com/){target=\_blank} - provides detailed documentation, which can be helpful for setup
- [**Scaleway**](https://www.scaleway.com/){target=\_blank} - offers high-performance cloud instances that can be suitable for validator nodes
- [**OnFinality**](https://onfinality.io/){target=\_blank} - specialized in blockchain infrastructure, OnFinality provides validator-specific support and configurations

!!! warning "Acceptable use policies"
    Different VPS providers have varying acceptable use policies, and not all allow cryptocurrency-related activities. 
    
    For example, Digital Ocean, requires explicit permission to use servers for cryptocurrency mining and defines unauthorized mining as [network abuse](https://www.digitalocean.com/legal/acceptable-use-policy#network-abuse){target=\_blank} in their acceptable use policy. 
    
    Review the terms for your VPS provider to avoid account suspension or server shutdown due to policy violations.

## Install the Polkadot Binaries

You must install the Polkadot binaries required to run your validator node. These binaries include the main `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries. All three are needed to run a fully functioning validator node. 

Depending on your preference and operating system setup, there are multiple methods to install these binaries. Below are the main options:

### Install from Official Releases

The most straightforward method to install the required binaries is downloading the latest versions from the official releases. You can visit the [Github Releases](https://github.com/paritytech/polkadot-sdk/releases){target=\_blank} page for the most current versions of the `polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker` binaries.

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

### Optional - Install with Package Managers

Users running Debian-based distributions like Ubuntu, or RPM-based distributions such as Fedora or CentOS can install the binaries via package managers.

#### Debian-based (Debian, Ubuntu)

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

#### RPM-based (Fedora, CentOS)

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

### Optional - Install with Ansible

You can also manage Polkadot installations using Ansible. This approach can be beneficial for users managing multiple validator nodes or requiring automated deployment. The [Parity chain operations Ansible collection](https://github.com/paritytech/ansible-galaxy/){target=\_blank} provides a Substrate node role for this purpose.

### Optional - Install with Docker

If you prefer using Docker or an OCI-compatible container runtime, the official Polkadot Docker image can be pulled directly from Docker Hub.

To pull the latest image, run the following command. Make sure to replace `X.Y.Z` with the appropriate version number.

```sh
docker.io/parity/polkadot:vX.Y.Z
```

### Optional - Build from Sources

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

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/requirements/terminal-output-01.html'

    If the versions do not match or if there is an error, double-check that all the binaries were correctly installed and are accessible within your `$PATH`.

2. **Ensure all binaries are in the same directory** - all the binaries must be in the same directory for the Polkadot validator node to function properly. If the binaries are not in the same location, move them to a unified directory and ensure this directory is added to your system's `$PATH`

    To verify the `$PATH`, run the following command:

    ```bash
    echo $PATH
    ```

    If necessary, you can move the binaries to a shared location, such as `/usr/local/bin/`, and add it to your `$PATH`.

## Synchronize Chain Data

After successfully installing and verifying the Polkadot binaries, the next step is to sync your node with the blockchain network. Synchronization is necessary to download and validate the blockchain data, ensuring your node is ready to participate as a validator. Follow these steps to sync your node:

1. **Start syncing** - start the syncing process by running the following command:

    ```sh
    polkadot
    ```

    This command starts your Polkadot node in non-validator mode, allowing you to synchronize the chain data. If you're planning to run a validator on the Kusama network, you can specify the chain using the `--chain` flag:

    ```sh
    polkadot --chain=kusama
    ```

    Once the sync starts, you will see a stream of logs providing information about the node's status and progress. Here's an example of what the output might look like:

    --8<-- 'code/infrastructure/running-a-validator/onboarding-and-offboarding/setup-a-validator/terminal-output-02.html'
    
    The output logs provide information such as the current block number, node name, and network connections. Monitor the sync progress and any errors that might occur during the process.

2. **Use warp sync for faster syncing** - Polkadot defaults to using a full sync, which downloads and validates the entire blockchain history from the genesis block. This can be time-consuming, depending on the size of the chain and your hardware. You can use warp sync to speed up syncing, which initially downloads finality proofs from GRANDPA and the latest finalized block's state.

    To start warp sync, use the following command:

    ``` bash
    polkadot --sync warp
    ```

    Warp sync ensures that your node quickly updates to the latest finalized state. The historical blocks are downloaded in the background as the node continues to operate.

3. **Monitor sync progress** - to track how your node's progress, check the logs printed by the `polkadot` process. Look for information about the latest processed block and compare it with the current highest block using tools like [Telemetry](https://telemetry.polkadot.io/#list/Polkadot%20CC1){target=\_blank} or [Polkadot.js Apps Explorer](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

### Database Snapshot Services

If you'd like to speed up the process further, you can use a database snapshot. Snapshots are compressed backups of the blockchain's database directory and can significantly reduce the time required to sync a new node. Here are a few public snapshot providers:

- [Stakeworld](https://stakeworld.io/snapshot)
- [Polkachu](https://polkachu.com/snapshots)
- [Polkashots](https://polkashots.io/)

!!!warning
    Although snapshots are convenient, syncing from scratch is recommended for security purposes. If snapshots become corrupted and most nodes rely on them, the network could inadvertently run on a non-canonical chain.

??? tip "FAQ"
    Why am I unable to synchronize the chain with 0 peers?

    ![Terminal logs showing 0 peers](/images/infrastructure/requirements/requirements-1.webp)

    Make sure you have libp2p port `30333` activated. It will take some time to discover other peers over the network.
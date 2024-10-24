---
title: Validator Requirements
description: TODO
---
# Validator Requirements

## Introduction

Running a validator in the Polkadot ecosystem is a key role that helps maintain network security and decentralization. As a validator, you’ll be responsible for validating transactions and adding new blocks to the chain, ensuring that the system runs smoothly. Validators earn rewards for their service, but the role also comes with risks. Missteps could potenitally lead to slashing and a loss of staked funds. If you’re new to validation, starting on Kusama can offer valuable experience in a lower-stakes environment before moving to Polkadot’s live network.

## Prerequisites

Running a validator requires solid system administration skills and a secure, well-maintained infrastructure. Below are the primary requirements you need to be aware of before getting started:

- **System Administration expertise** - handling technical anomalies and maintaining node infrastructure is critical. Validators must be able to troubleshoot and optimize their setup
- **Security** - ensure your setup follows best practices for securing your node. Refer to the [Secure Validator](#secure-validator) section to learn about important security measures
- **Network Choice** - start with Kusama to gain experience. The [Kusama section](#run-a-kusama-validator) outlines how to get started
- **Staking Requirements** - a minimum amount of native token (KSM or DOT) is required to be elected into the validator set. The required stake can come from your own holdings or from nominators
- **Risk of Slashing** - any DOT you stake is at risk if your setup fails or your validator misbehaves. If you’re unsure of your ability to maintain a reliable validator, consider nominating your DOT to a trusted validator

## Technical Requirements

Running a Polkadot validator node on Linux is the most common approach, especially for beginners. While you can use any VPS provider that meets the technical specifications, this guide uses Ubuntu 22.04. However, the steps should be adaptable to other Linux distributions.

### Reference Hardware

Polkadot validators rely on high-performance hardware to process blocks efficiently. The following specifications are based on benchmarking using two VM instances:

- **Google Cloud Platform (GCP)** - `n2-standard-8` instance
- **Amazon Web Services (AWS)** - `c6i.4xlarge` instance

The recommended minimum hardware requirements to ensure a fully functional and performant validator are as follows:

=== "**CPU**"

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

=== "**Storage**"

    - NVMe SSD - at least 1 TB for blockchain data (prioritize latency rather than throughput)
    - Storage requirements will increase as the chain grows. For current estimates, see the [current chain snapshot](https://stakeworld.io/docs/dbsize){target=\_blank}

=== "**Memory**"

    - 32 GB DDR4 ECC

=== "**System**"

    - Linux Kernel 5.16 or newer

=== "**Network**"

    - Symmetric networking speed of 500 Mbit/s is required to handle large numbers of parachains and ensure congestion control during peak times


While the hardware specs above are best practice and not strict requirements, subpar hardware may lead to performance issues and increase the risk of slashing.
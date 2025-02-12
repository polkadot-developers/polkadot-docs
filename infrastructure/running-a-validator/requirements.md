---
title: Validator Requirements
description: Explore the technical and system requirements for running a Polkadot validator, including setup, hardware, staking prerequisites, and security best practices.
---
# Validator Requirements

## Introduction

Running a validator in the Polkadot ecosystem is essential for maintaining network security and decentralization. Validators are responsible for validating transactions and adding new blocks to the chain, ensuring the system operates smoothly. In return for their services, validators earn rewards. However, the role comes with inherent risks, such as slashing penalties for misbehavior or technical failures. If you’re new to validation, starting on Kusama provides a lower-stakes environment to gain valuable experience before progressing to the Polkadot network.

This guide covers everything you need to know about becoming a validator, including system requirements, staking prerequisites, and infrastructure setup. Whether you’re deploying on a VPS or running your node on custom hardware, you’ll learn how to optimize your validator for performance and security, ensuring compliance with network standards while minimizing risks.

## Prerequisites

Running a validator requires solid system administration skills and a secure, well-maintained infrastructure. Below are the primary requirements you need to be aware of before getting started:

- **System administration expertise** - handling technical anomalies and maintaining node infrastructure is critical. Validators must be able to troubleshoot and optimize their setup
- **Security** - ensure your setup follows best practices for securing your node. Refer to the [Secure Your Validator](/infrastructure/running-a-validator/operational-tasks/general-management/#secure-your-validator){target=\_blank} section to learn about important security measures
- **Network choice** - start with [Kusama](/infrastructure/running-a-validator/onboarding-and-offboarding/set-up-validator/#run-a-kusama-validator){target=\_blank} to gain experience. Look for "Adjustments for Kusama" throughout these guides for tips on adapting the provided instructions for the Kusama network
- **Staking requirements** - a minimum amount of native token (KSM or DOT) is required to be elected into the validator set. The required stake can come from your own holdings or from nominators
- **Risk of slashing** - any DOT you stake is at risk if your setup fails or your validator misbehaves. If you’re unsure of your ability to maintain a reliable validator, consider nominating your DOT to a trusted validator

## Minimum Hardware Requirements

Polkadot validators rely on high-performance hardware to process blocks efficiently. The recommended minimum hardware requirements to ensure a fully functional and performant validator are as follows:

- **CPU**:

    - x86-64 compatible
    - Eight physical cores @ 3.4 GHz
        - Per [Referenda #1051](https://polkadot.subsquare.io/referenda/1051){target=\_blank}, this will be a hard requirement as of January 2025
    - Processor:
        - Intel - Ice Lake or newer (Xeon or Core series)
        - AMD - Zen3 or newer (EPYC or Ryzen)
    - Simultaneous multithreading disabled:
        - Intel - Hyper-Threading
        - AMD - SMT
    - [Single-threaded performance](https://www.cpubenchmark.net/singleThread.html){target=\_blank} is prioritized over higher cores count

- **Storage**:

    - NVMe SSD - at least 1 TB for blockchain data (prioritize latency rather than throughput)
    - Storage requirements will increase as the chain grows. For current estimates, see the [current chain snapshot](https://stakeworld.io/docs/dbsize){target=\_blank}

- **Memory**:

    - 32 GB DDR4 ECC

- **Network**:

    - Symmetric networking speed of 500 Mbit/s is required to handle large numbers of parachains and ensure congestion control during peak times

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

## Minimum Bond Requirement

Before bonding DOT, ensure you meet the minimum bond requirement to start a validator instance. The minimum bond is the least DOT you need to stake to enter the validator set. To become eligible for rewards, your validator node must be nominated by enough staked tokens.

For example, on November 19, 2024, the minimum stake backing a validator in Polkadot's era 1632 was 1,159,434.248 DOT. You can check the current minimum stake required using these tools:

- [**Chain State Values**](https://wiki.polkadot.network/docs/chain-state-values){target=\_blank}
- [**Subscan**](https://polkadot.subscan.io/validator_list?status=validator){target=\_blank}
- [**Staking Dashboard**](https://staking.polkadot.cloud/#/overview){target=\_blank}

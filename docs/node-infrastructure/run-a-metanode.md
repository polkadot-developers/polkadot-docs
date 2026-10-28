---
title: Run a Metanode
description: Learn what a metanode runs in its first phase and the hardware needed to run a Polkadot validator with Asset Hub and People Chain collators.
categories: Infrastructure
---

# Run a Metanode

!!! warning "Under Construction"
    This page is under construction and its content can change. It covers what a metanode runs in its first phase and the hardware it needs. Setup instructions will be added in a later update.

## Introduction

In the first phase, a metanode operator is a [validator](/node-infrastructure/run-a-validator/requirements/) operator who also provides the minimum services that [Polkadot Products](/apps/) need:

- Producing blocks for Asset Hub and People Chain as [collators](/node-infrastructure/run-a-collator/).
- Serving smoldot [light clients](/reference/tools/light-clients/) over WebRTC for the relay chain, Asset Hub, and People Chain.
- Serving remote procedure call (RPC) requests for the relay chain, Asset Hub, and People Chain.

You can run the validator and the collators on separate machines or together on a single machine. [Hardware Requirements](#hardware-requirements) covers both options.

## Hardware Requirements

The following table lists the recommended minimum requirements for each service on its own machine and for a single machine that runs all three services:

| Resource | Validator                   | Asset Hub Collator                    | People Chain Collator                 | Single Machine                                            |
|:--------:|:---------------------------:|:-------------------------------------:|:-------------------------------------:|:---------------------------------------------------------:|
| CPU      | 8 physical cores at 3.4 GHz | 4+ cores (8+ for optimal performance) | 4+ cores (8+ for optimal performance) | 16 physical cores at 3.4 GHz (24 for optimal performance) |
| Memory   | 32 GB DDR4 ECC              | 32 GB (64 GB for optimal performance) | 32 GB (64 GB for optimal performance) | 64 GB DDR4 ECC (128 GB for optimal performance)           |
| Storage  | 2 TB+ NVMe SSD              | 200+ GB NVMe SSD, pruned              | 200+ GB NVMe SSD, pruned              | 2.4 TB+ NVMe SSD                                          |
| Network  | 500 Mbit/s symmetric        | 500+ Mbit/s, stable connection        | 500+ Mbit/s, stable connection        | 1 Gbit/s symmetric                                        |

Every machine needs a public IP address and must run Linux with kernel 5.16 or later. When you choose hardware, also consider the following details:

- **CPU**: The validator must meet the processor requirements in [Validator Requirements](/node-infrastructure/run-a-validator/requirements/#minimum-hardware-requirements), including disabled simultaneous multithreading. Prioritize single-threaded performance over core count.
- **Storage**: Prioritize latency over throughput. Fast disk I/O is critical for collator block production. Validator and single-machine storage requirements grow with the chains.
- **Network**: The collator figures are higher than the 100+ Mbit/s in [Run a Block-Producing Collator](/node-infrastructure/run-a-collator/#hardware-requirements) because metanode collators also serve RPC requests and light clients.
- **Relay chain data**: To use storage efficiently, point each collator at your validator's RPC endpoint with `--relay-chain-rpc-urls`, as described in [Run a Block-Producing Collator](/node-infrastructure/run-a-collator/#run-the-collator). The collator then reads relay chain data from the validator and runs a lightweight relay chain node instead of keeping a full relay chain database, which reduces the collator's relay chain database storage by about 95%.
- **Single machine**: CPU and storage are the sum of the per-service figures, including 24 cores for optimal performance. Memory and network are lower than the sum because the services do not all reach peak load at the same time: 64 GB of memory instead of 96 GB (128 GB instead of 160 GB for optimal performance), and 1 Gbit/s of network instead of 1.5 Gbit/s.

!!! warning "Validator Hardware Alone Is Not Enough"
    The hardware listed in [Validator Requirements](/node-infrastructure/run-a-validator/requirements/#minimum-hardware-requirements) is not enough to also run the collators. Running the validator and the Asset Hub collator on a machine that meets only the validator requirements leaves too few resources for validation.

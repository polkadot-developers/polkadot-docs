---
title: Testing and Debugging
description: TOOD
---

# Testing and Debugging

## Introduction

Cross-Consensus Messaging (XCM) enables communication between parachains, relay chains, and system chains within the Polkadot ecosystem. Before deploying XCM-powered solutions to production, thorough testing and debugging are crucial to ensure robustness and reliability. This article explores the key tools—xcm-simulator and xcm-emulator—and outlines testing strategies.


## XCM Simulator

The xcm-simulator offers a fast and efficient way to test XCM instructions against the xcm-executor. It serves as an experimental playground for developers, supporting features such as:

Mocking Downward Message Passing (DMP): Retrieve incoming XCMs from the relay chain using the received_dmp getter.
Rapid Iteration: Test XCM messages in isolation without relying on full network simulations.
The simulator is ideal for validating the message and configuration levels, helping parachain developers refine their XCM setup before moving to cross-chain testing.

## XCM Emulator

The xcm-emulator provides an emulated environment for testing cross-chain message passing. It uses pre-configured runtimes, mirroring live networks such as Kusama, Polkadot, and Statemine. Key features include:

- Cross-Chain testing: Validate message flow, execution, weights, and side effects between chains
- Live network fidelity - test runtime configurations resembling production environments
- Limitations:
    - Mocked transport layer - the emulator uses transport pallets but does not replicate live messaging infrastructure
    - Excluded consensus events - disputes and staking events are outside the emulator’s scope and require E2E testing with a production-like environment

For example use cases, refer to the emulator's documentation on testing common good parachains.

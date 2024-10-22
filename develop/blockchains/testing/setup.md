---
title: Testing Setup
description: Learn how to create a mock environment for testing complete runtime functionality in the Polkadot SDK, ensuring integration between pallets and system components.
---

# Introduction

Testing an entire runtime in the Polkadot SDK requires creating an environment miming the real blockchain system. While unit testing for individual pallets focuses on isolated functionality as described in [Pallet Testing](/develop/blockchains/custom-blockchains/pallet-testing/){target=\_blank}, runtime testing ensures that the pallets interact as expected when combined, providing a full system simulation.

This guide will walk you through setting up an environment for runtime testing, focusing on simulating an entire runtime. The aim is to create an environment where you can evaluate the interactions and behavior of multiple pallets together within the blockchain runtime.

## Runtime Testing

Runtime testing in Polkadot SDK-based blockchains requires creating a simulated environment replicating real-world conditions. This approach enables developers to verify that interactions between pallets and system components function correctly. While unit tests focus on individual pallet functionality, runtime integration tests evaluate how multiple components collaborate within the broader system.

While unit tests are great for isolated functionality, runtime tests provide a more holistic view of the system's behavior. The focus is on how different pallets communicate and work together, which is crucial for a well-functioning blockchain. The idea is to test how pallets interact with core system components, ensuring smooth operation of the entire runtime. These tests help to catch issues that might only appear when multiple system parts interact, which is essential for robust blockchain development.

### Mocking the Runtime

To test an entire runtime, a mock environment must be created. This environment simulates blockchain execution, allowing developers to test runtime interactions before deploying to a live network. The mock runtime includes all the necessary pallets and their configurations, which can be simplified for testing purposes.

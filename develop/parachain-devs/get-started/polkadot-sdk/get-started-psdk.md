---
title: Getting Started - Intro to the Polkadot SDK
description: Get started with the Polkadot SDK, a comprehensive repository of libraries used for building on Polkadot and beyond.
---

!!! danger "Not a production ready guide."
    This section is under construction and moving!

    Agile coretime is only for the Kusama and testnet networks at the moment, and is not yet deployed on
    Polkadot. These guides are **not** production ready due to the moving nature of these features.

## Using the Polkadot SDK

The Polkadot SDK is what used to be overarching **three** repositories:

- [**Polkadot**](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html#polkadot) -
  For a time, this included both the client implementation and runtime, until the runtime was moved
  to the [Polkadot Fellows organization](https://github.com/polkadot-fellows/runtimes).
- [**Substrate**](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html#substrate) -
  The underlying, core primitives and libraries for building blockchains (any blockchain, not just
  one for Polkadot). Polkadot itself is built with Substrate.
- [**Cumulus**](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html#cumulus) -
  A set of libraries and tools which pertain specifically with connecting blockchains to Polkadot,
  known as parachains.

For an in-depth dive into the monorepo, it is highly recommended that you look into the [Polkadot SDK Rust documentation](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html)


1. **Reserving** a `ParaId`, where you will upload your runtime and genesis state
2. **Compiling** the runtime (written in Rust) to a WebAssembly blob, thereby defining how your state transitions from one state to the next. This runtime is created using the Polkadot SDK
3. **Ensure** your chain spec is viable and ready to be deployed as a live, working parachain
4. **Generating** your genesis state and wasm
5. **Obtaining** a core through a Coretime marketplace
6. **Assigning** that core to your `ParaId`
7. **Ensuring** you have at least one honest, synced collator for your task

!!!info "What is a task?"
    You might see the term "task" referenced quite a bit, but in most cases, it refers to a process
    utilizing Polkadot's compute. This could be a parachain or any other computational process, provided
    that it adheres to the Polkadot protocol.

    The full definition can be found on the [Polkadot Wiki](https://wiki.polkadot.network/docs/learn-agile-coretime#task).

## Deploying on a Core

Once you have your runtime and pallets developed, you will be able to deploy it on a
[core](../learn/learn-agile-coretime.md#core), which is how one utilizes the shared security of the Polkadot network. One does so by:

```mermaid
flowchart TD
    subgraph GA["Generate Artifacts"]
        direction LR
        A["Creating a runtime"]-->B["Compiling to Wasm"]-->C["Generate Genesis State"]
    end

    subgraph PC["Procure ParaId & Core"]
        direction LR
        PARAID["Reserve ParaId"]
        PARAID-->D["Buy Bulk Coretime"]
        PARAID-->E["Issue On-Demand Coretime Extrinsic"]
    end


    subgraph DEP["Deploying"]
        direction LR
        F["Register artifacts to ParaId"]-->assign["Assign Core"]-->G["Sync collator"]-->H["Begin generating blocks!"]
    end

GA-->PC
PC-->DEP
```

### Install dependencies

Make sure you have everything you need for your target system.

### Deployment Example - Adder Collator

Try out the above by deploying the adder collator, a very simple "counter" parachain implementation.

## OpenZeppelin Templates & Guides

OpenZeppelin offers a [generic parachain template](https://github.com/OpenZeppelin/polkadot-generic-runtime-template), which has support for:

- Proxy Pallet
- Multisig Pallet
- Governance support - a treasury, referenda (OpenGov!), and assets configuration
- Collation/Parachain Support
- XCM (Cross Consensus Messaging) Configuration and Support

For more information, check their
[Substrate parachain runtime guide.](https://docs.openzeppelin.com/substrate-runtimes/1.0.0/)

## Getting Started with Parachains - Polkadot SDK Parachain Template

If you wish to the
[Polkadot SDK's Parachain template](https://github.com/paritytech/polkadot-sdk-parachain-template),
please follow the [Template to Core guide.](./build-guides-template-basic.md)
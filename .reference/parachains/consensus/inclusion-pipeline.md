---
title: Inclusion Pipeline
description: Learn how Polkadot validates parachain blocks through the Inclusion Pipeline, detailing context, generation, backing, and inclusion stages.
categories: Polkadot Protocol
---

# Inclusion Pipeline

## Introduction

The inclusion pipeline is the multi-stage process through which every parachain block (parablock) is validated and secured before being finalized in the Polkadot relay chain. This pipeline ensures that all parachain blocks meet validity requirements through progressive verification by multiple sets of validators.

The pipeline exists to provide Polkadot's security guarantees, rather than relying on a single validator group. Each parablock passes through multiple validation stages with different validator sets, ensuring that invalid blocks cannot be finalized even if some validators are malicious or compromised.

Whether a parachain uses synchronous or [asynchronous backing](/reference/parachains/consensus/async-backing){target=\_blank}, all parablocks follow the same inclusion pipeline. The difference is in the timing: asynchronous backing allows multiple blocks to be at different stages of the pipeline simultaneously (pipelining), while synchronous backing processes one block through the entire pipeline before starting the next.

## Pipeline Stages

The inclusion pipeline consists of three main stages:

```mermaid
%%{init: {"flowchart": {"nodeSpacing": 40, "rankSpacing": 60}}}%%
flowchart LR
  %% Keep the pipeline on one row (container is hidden)
  subgraph Row[" "]
    direction LR
    G["Generation"] --> B["Backing"] --> I["Inclusion"]
  end
  style Row fill:none,stroke:none

  %% Context: plain text (no box) pointing to both G and B
  C["Context"]:::nobox
  C -.-> G
  C -.-> B

  classDef nobox fill:none,stroke:none,color:inherit;
```
### Context

To build a parablock during the generation and backing stages, collators and validators require access to the state context of the parachain. This context is derived from two sources:

  - **Relay Parent**: The relay chain block to which the parablock is anchored. Note that the relay parent of a parablock is always different from the relay chain block that eventually includes it. This context source resides on the relay chain.

  - **Unincluded Segments**: Chains of candidate parablocks that have not yet been included in the relay chain. These segments represent sequences of block ancestors and may contain candidates at any stage pre-inclusion. A key feature enabled by [async backing](/reference/parachains/consensus/async-backing){target=\_blank} is that collators can build new parablocks on top of these unincluded ancestors rather than being limited to ancestors already included in the relay chain state. This context source resides on the collators.

### Generation

Collators execute their blockchain core functionality to generate a new block, producing a [proof-of-validity](https://paritytech.github.io/polkadot-sdk/book/types/availability.html?#proof-of-validity){target=\_blank} (PoV), which is passed to validators selected for backing. The PoV is composed of:

  - A list of state transitions called the **block candidate**
  - The values in the parachain's database that the block modifies
  - The hashes of the unaffected points in the Merkle tree


### Backing 

A subset of active validators verify that the parablock follows the state transition rules of the parachain and sign a [validity statement](https://paritytech.github.io/polkadot-sdk/book/types/backing.html?#validity-attestation){target=\_blank} about the PoV which can have a positive or negative outcome. With enough positive statements (at least 2/3 of assigned validators), the candidate is considered backable. It is then noted in a fork on the relay chain, at which point it is considered backed, ready for the next stage of the pipeline.

### Inclusion

 Validators gossip [erasure code chunks](https://paritytech.github.io/polkadot-sdk/book/types/availability.html#erasure-chunk){target=\_blank} and put the parablock through the final [approval process](https://paritytech.github.io/polkadot-sdk/book/protocol-approval.html){target=\_blank} before it is considered *included* in the relay chain.
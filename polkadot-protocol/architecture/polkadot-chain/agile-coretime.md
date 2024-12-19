---
title: Agile Coretime
description: Explore the efficient scheduling mechanisms to access Polkadot cores to produce blockspace continuously or on-demand.
---

# Agile Coretime

## Introduction

Agile Coretime is the [scheduling](https://en.wikipedia.org/wiki/Scheduling_(computing)){target=\_blank} framework on Polkadot that lets parachains efficiently access cores, which comprise an active validator set tasked with parablock validation. As the first blockchain to enable a flexible scheduling system for blockspace production, Polkadot offers unparalleled adaptability for parachains.

``` mermaid
graph TB
    A[Cores Designation]
    B[Bulk Coretime]
    C[On-Demand Coretime]
    A --continuous--> B
    A --flexible--> C 
```

Cores can be designated to a parachain either continuously through [bulk coretime](#bulk-coretime) or dynamically via [on-demand coretime](#on-demand-coretime). Additionally, Polkadot supports scheduling multiple cores in parallel through [elastic scaling](https://wiki.polkadot.network/docs/learn-elastic-scaling){target=\_blank}, which is a feature under active development on Polkadot. This flexibility empowers parachains to optimize their resource usage and block production according to their unique needs.

In this guide, you'll learn how bulk coretime enables continuous core access with features like interlacing and splitting, and how on-demand coretime provides flexible, pay-per-use scheduling for parachains. For a deep dive on Agile Coretime and its terminology, refer to the [Wiki doc](https://wiki.polkadot.network/docs/learn-agile-coretime#introduction-to-agile-coretime){target=\_blank}.

## Bulk Coretime

Bulk coretime is a fixed duration of continuous coretime represented by an NFT that can be purchased through [coretime sales](#coretime-sales) in DOT and can be split, shared, or resold. Currently, the duration of bulk coretime is set to 28 days. Coretime purchased in bulk and assigned to a single parachain is eligible for a price-capped renewal, providing a form of rent-controlled access, which is important for predicting the running costs in the near future. Suppose the bulk coretime is [interlaced](#coretime-interlacing) or [split](#coretime-splitting) or is kept idle without assigning it to a parachain. In that case, it will be ineligible for the price-capped renewal.

### Coretime Interlacing

It is the action of dividing bulk coretime across multiple parachains that produce blocks spaced uniformly in time. For example, think of multiple parachains taking turns producing blocks, demonstrating a simple form of interlacing. This feature can be used by parachains with a low transaction volume and need not continuously produce blocks.

### Coretime Splitting

It is the action of dividing bulk coretime into multiple contiguous regions. This feature can be used by parachains that need to produce blocks continuously but do not require the whole 28 days of bulk coretime and require only part of it.

## On-Demand Coretime

Polkadot has dedicated cores assigned to provide core time on demand. These cores are excluded from the coretime sales and are reserved for on-demand parachains, which pay in DOT per block.


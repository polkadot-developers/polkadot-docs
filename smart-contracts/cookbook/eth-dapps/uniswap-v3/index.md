---
title: Uniswap V3 on Polkadot
description: Deploy and test Uniswap V3 Core contracts on Polkadot Hub — concentrated liquidity, multiple fee tiers, and TWAP oracles using standard Ethereum tooling.
categories: Smart Contracts, Tooling
---

# Uniswap V3 on Polkadot

[Uniswap V3](https://docs.uniswap.org/contracts/v3/overview){target=\_blank} is the next evolution of the Uniswap protocol. It introduces concentrated liquidity, allowing liquidity providers to allocate capital within custom price ranges instead of across the entire price curve. This results in dramatically improved capital efficiency compared to V2's uniform distribution model.

Key innovations in Uniswap V3 include:

- **Concentrated liquidity** - Liquidity providers choose specific price ranges, enabling up to 4000x capital efficiency over V2.
- **Multiple fee tiers** - Three fee levels (0.05%, 0.30%, 1.00%) let pools match the risk profile of different token pairs.
- **Advanced TWAP oracles** - On-chain time-weighted average price oracles with improved accuracy and lower gas costs.

Polkadot Hub supports deploying these contracts with no modifications. The tutorial below walks you through deploying, testing, and interacting with the V3 Core layer.

## Tutorials

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __V3 Core__

    ---

    Deploy unmodified Uniswap V3 Factory and Pool contracts on Polkadot Hub using Hardhat. Includes concentrated liquidity, fee tiers, and the full math library suite.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/)

</div>

---
title: Uniswap V2 on Polkadot
description: Deploy and test the full Uniswap V2 stack on Polkadot Hub — from core AMM contracts to periphery router interfaces — using standard Ethereum tooling.
---

# Uniswap V2 on Polkadot

[Uniswap V2](https://docs.uniswap.org/contracts/v2/overview){target=\_blank} is one of the most widely deployed decentralized exchange protocols. Its Automated Market Maker (AMM) architecture enables permissionless token swaps, liquidity provision, and price discovery for any ERC-20 token pair.

The Uniswap V2 stack is split into two layers:

- **V2 Core** - the Factory and Pair contracts that implement the fundamental AMM logic, constant product pricing (x * y = k), and liquidity pool management
- **V2 Periphery** - the Router contracts that provide user-facing functions for adding and removing liquidity, executing token swaps with slippage protection, and wrapping native ETH through WETH

Polkadot Hub supports deploying these contracts with no modifications. The tutorials below walk you through deploying, testing, and interacting with each layer.

## Tutorials

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __V2 Core (EVM)__

    ---

    Deploy unmodified Uniswap V2 Factory and Pair contracts on Polkadot Hub using standard Hardhat with the EVM execution path.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core/uniswap-v2-evm/)

-   <span class="badge tutorial">Tutorial</span> __V2 Core (PVM)__

    ---

    Deploy Uniswap V2 using the PVM execution path with the revive compiler for Polkadot-native bytecode.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core/uniswap-v2-pvm/)

-   <span class="badge tutorial">Tutorial</span> __V2 Periphery (EVM)__

    ---

    Deploy Router contracts for user-facing swaps, liquidity management, and WETH wrapping on top of V2 Core.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/periphery/uniswap-v2-periphery-evm/)

</div>

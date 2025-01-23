---
title: Smart Contracts
description: Learn about smart contract development in Polkadot using ink! for Wasm contracts and EVM support for Solidity contracts on Asset Hub and parachains.
template: index-page.html
---

# Smart Contracts

Polkadot offers developers flexibility in building smart contracts, supporting both Wasm-based contracts using ink! (written in Rust) and Solidity contracts executed by the EVM (Ethereum Virtual Machine).

This section guides you through the tools, resources, and guides to help you build and deploy smart contracts using either Wasm/ink! or EVM-based parachains, depending on your language and environment preference.

## Choosing the Right Smart Contract Language and Execution Environment

For developers building smart contracts in the Polkadot ecosystem, the choice between parachains supporting ink! (for Wasm contracts) and EVM-compatible parachains (for Solidity contracts) depend on the preferred development environment and language. By selecting the right parachain, developers can leverage Polkadot's scalability and interoperability while utilizing the framework that best suits their needs.

!!! tip
    Significant advancements in Polkadot's native smart contract functionality are in active development. Frequent changes should be expected. See this [Contracts on AssetHub Roadmap](https://forum.polkadot.network/t/contracts-on-assethub-roadmap/9513/57){target=\_blank} Polkadot Network Forum post for updates.

Here are some key considerations:

- [**Wasm (ink!) contracts**](/develop/smart-contracts/wasm-ink/){target=\_blank} - contracts are written in Rust and compiled to Wasm. The advantage of Wasm is that it allows for more flexibility, speed, and potentially lower execution costs compared to EVM, especially in the context of Polkadot's multi-chain architecture
- [**EVM-compatible contracts**](/develop/smart-contracts/evm/parachain-contracts/){target=\_blank} - contracts are written in languages like Solidity or Vyper and executed by the Ethereum Virtual Machine (EVM). The EVM is widely standardized across blockchains, including Polkadot parachains like Astar, Moonbeam, and Acala. This compatibility allows contracts to be deployed across multiple networks with minimal modifications, benefiting from a well-established, broad development ecosystem

<!-- This content is temporarily hidden and has been commented out to ensure it is preserved. -->
<!-- - [**PolkaVM-compatible contracts**](/develop/smart-contracts/evm/native-evm-contracts/){target=\_blank} - contracts are written in languages like Solidity or Vyper and executed by the PolkaVM. This compatibility provides a seamless transition for developers coming from EVM environments while also enabling interactions with other Polkadot parachains and leveraging Polkadot's interoperability -->

Throughout the pages in this section, you'll find resources and guides to help you get started with developing smart contracts in both environments.

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://use.ink/" target="_blank"> 
      <h2 class="title">View the Official ink! Documentation</h2>
      <p class="description">Learn everything you need to know about developing smart contracts with ink!.</p>
    </a>
  </div>
  <!-- This content is temporarily hidden and has been commented out to ensure it is preserved. -->
  <!-- <div class="card">
    <a href="https://contracts.polkadot.io/" target="_blank"> 
      <h2 class="title">View the Official Asset Hub Contracts Documentation</h2>
      <p class="description">Learn everything you need about developing smart contracts on Asset Hub using the PolkaVM.</p>
    </a>
  </div> -->
</div>

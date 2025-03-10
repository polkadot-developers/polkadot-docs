---
title: Smart Contracts
description: Learn about smart contract development in Polkadot using ink! for Wasm contracts, EVM and PolkaVM support for Solidity contracts on Asset Hub and parachains.
template: index-page.html
---

# Smart Contracts

Polkadot allows scalable execution of smart contracts offering cross-chain compatibility and lower fees compared to legacy L1 platforms. Polkadot offers developers flexibility in building smart contracts, supporting both Solidity contracts executed either by the [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design#polkavm){target=\_blank} or by the EVM (Ethereum Virtual Machine), and Wasm-based contracts using ink! (written in Rust).

This section guides you through the tools, resources, and guides for building and deploying smart contracts on parachains. Parachains are specialized blockchains connected to the relay chain, benefiting from shared security and interoperability, check the [Parachain Overview](/polkadot-protocol/architecture/parachains/overview/){target=\_blank} page for further references. Depending on your language and environment preference, you can develop contracts using Wasm/ink! or EVM-based solutions.

## Choosing the Right Smart Contract Execution Environment

For developers building smart contracts in the Polkadot ecosystem, the choice between EVM-compatible parachains (for Solidity contracts) and parachains supporting ink! (for Wasm contracts) depends on the preferred development environment and language. EVM-compatible parachains provide familiarity for Solidity developers, while Wasm contracts offer efficiency and security through Rust-based development. By selecting the right parachain, developers can leverage Polkadot's scalability and interoperability while utilizing the framework that best suits their needs.

Here are some key considerations:

- [**PolkaVM-compatible contracts**](/develop/smart-contracts/overview#native-smart-contracts){target=\_blank} - contracts are written in languages like Solidity or Vyper and executed by the [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design#polkavm){target=\_blank}. This compatibility provides a seamless transition for developers coming from EVM environments while also enabling interactions with other Polkadot parachains and leveraging Polkadot's interoperability
- [**EVM-compatible contracts**](/develop/smart-contracts/overview#parachain-contracts){target=\_blank} - contracts are written in languages like Solidity or Vyper and executed by the Ethereum Virtual Machine (EVM). The EVM is widely standardized across blockchains, including Polkadot parachains like Astar, Moonbeam, and Acala. This compatibility allows contracts to be deployed across multiple networks with minimal modifications, benefiting from a well-established, broad development ecosystem
- [**Wasm (ink!) contracts**](/develop/smart-contracts/overview#wasm-ink){target=\_blank} - contracts are written in Rust and compiled to Wasm. The advantage of Wasm is that it allows for more flexibility, speed, and potentially lower execution costs compared to EVM, especially in the context of Polkadot's multi-chain architecture

Ready to build? Start your smart contract journey by checking the following articles. Throughout the pages in this section, you'll find resources and guides to help you get started with developing smart contracts in the Polkadot ecosystem.

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
  <div class="card">
    <a href="https://use.ink/" target="_blank"> 
      <h2 class="title">View the Official ink! Documentation</h2>
      <p class="description">Learn everything you need to know about developing smart contracts with ink!.</p>
    </a>
  </div>
</div>
<div class="grid cards" markdown>

-   <span class="badge external">External</span> __View the Official ink! Documentation__

    ---

    Learn everything you need to know about developing smart contracts with ink!.

    [:octicons-arrow-right-24: Reference](https://use.ink/){target=\_blank}

-   <span class="badge guide">Guide</span> __Pallet Testing__

    ---

    Learn how to efficiently test pallets in the Polkadot SDK, ensuring the reliability and security of your pallets operations.

    [:octicons-arrow-right-24: Reference](/develop/parachains/testing)

</div>
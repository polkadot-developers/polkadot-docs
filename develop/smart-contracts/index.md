---
title: Smart Contracts
description: Learn about smart contract development in Polkadot, including ink! for Wasm contracts and Solidity support via EVM and PolkaVM on Polkadot Hub and parachains.
template: index-page.html
---

# Smart Contracts

--8<-- 'text/smart-contracts/polkaVM-warning.md'

Polkadot allows scalable execution of smart contracts, offering cross-chain compatibility and lower fees than legacy L1 platforms. Polkadot provides developers with flexibility in building smart contracts, supporting both Solidity contracts executed by the [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design#polkavm){target=\_blank} (a Polkadot-native virtual machine for programming languages that can be compiled down to RISC-V) and EVM (Ethereum Virtual Machine), as well as Wasm-based contracts using ink! (written in Rust).

This section provides tools, resources, and guides for building and deploying smart contracts on parachains. [Parachains](/polkadot-protocol/architecture/parachains/overview/){target=\_blank} are specialized blockchains connected to the relay chain, benefiting from shared security and interoperability. Depending on your language and environment preference, you can develop contracts using Wasm/ink! or EVM-based solutions.

## Smart Contract Development Process

Follow this step-by-step process to develop and deploy smart contracts in the Polkadot ecosystem:

[timeline(polkadot-docs/.snippets/text/develop/smart-contracts/index/index-timeline.json)]

## Additional Resources
<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Smart Contracts Overview__

    ---

    Check out the Smart Contracts overview in the Polkadot ecosystem.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/overview)

-   <span class="badge external">External</span> __View the Official ink! Documentation__

    ---

    Learn everything you need to know about developing smart contracts with ink!.

    [:octicons-arrow-right-24: Reference](https://use.ink/){target=\_blank}

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://use.ink/" target="_blank"> 
      <h2 class="title">View the Official ink! Documentation</h2>
      <hr>
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

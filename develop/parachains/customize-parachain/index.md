---
title: Customize Your Parachain
description: Learn to build a custom parachain with Polkadot SDK's FRAME framework, which includes pallet development, testing, smart contracts, and runtime customization.
hide: 
    - feedback
template: index-page.html
---

# Customize Your Parachain

Learn how to build a custom parachain with Polkadot SDK's FRAME framework, which includes pallet development, testing, smart contracts, and runtime customization.

These sections take what you learned and built from [Get Started](/develop/parachains/get-started/){target=\_blank} and guide you through using the Polkadot SDK's tools to create a blockchain customized to the needs of your users and applications. Whether it's a custom configuration of existing modular pallets, a pallet of your creation, or through adding smart contract functionality, everything you need for efficient runtime design and development is here. 

## Build Your Runtime

- **[Overview of FRAME](/develop/parachains/customize-parachain/overview/){target=\_blank}** - understand the fundamentals of Polkadot SDK's modular development framework and how it enables customizable blockchain design

- **[Add Existing Pallets](/develop/parachains/customize-parachain/add-existing-pallets/){target=\_blank}** - learn to incorporate pre-built pallets into your runtime to add common blockchain functionality

- **[Make Custom Pallets](/develop/parachains/customize-parachain/make-custom-pallet){target=\_blank}** - create your pallets to implement unique features and business logic for your chain

- **[Pallet Testing](/develop/parachains/customize-parachain/pallet-testing/){target=\_blank}** - ensure reliability by writing comprehensive tests for your pallet implementations

- **[Benchmarking](/develop/parachains/customize-parachain/benchmarking/){target=\_blank}** - measure and optimize the performance of your runtime components

- **[Add Smart Contracts](/develop/parachains/customize-parachain/add-smart-contract-functionality/){target=\_blank}** - enable EVM or Wasm smart contract functionality in your blockchain

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame" target="_blank">
      <h2 class="title">FRAME Repository</h2>
      <p class="description">View the source code of the FRAME development environment that provides pallets you can use, modify, and extend to build the runtime logic to suit the needs of your blockchain.</p>
    </a>
  </div>
    <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/frame_support/index.html" target="_blank">
      <h2 class="title">FRAME Rust docs</h2>
      <p class="description">Check out the Rust docs for the `frame_support` crate to view the support code for the runtime.</p>
    </a>
  </div>
</div>
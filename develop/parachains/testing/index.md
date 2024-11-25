---
title: Testing Your Polkadot SDK-Based Blockchain
description: Explore comprehensive testing strategies for Polkadot SDK-based blockchains, from setting up test environments to verifying runtime and pallet interactions.
hide: 
    - feedback
template: index-page.html
---

# Testing Your Polkadot SDK-Based Blockchain

Explore comprehensive testing strategies for Polkadot SDK-based blockchains, from setting up test environments to verifying runtime and pallet interactions. 

These sections build upon the benchmarking and pallet testing you learned in [Customize your Parachain](/develop/parachains/customize-parachain/){target=\_blank} and teach you how to test complete runtimes to ensure pallets interact correctly and integrate well with Polkadot system components. Learn how to set up a mock environment and perform comprehensive runtime testing so you can feel confident your blockchain is secure, performant, and ready for deployment. 

## Testing Fundamentals

The following sections focus on two primary testing mechanisms:

- [Set up a testing environment](/develop/parachains/testing/setup/) - create mock environments to simulate blockchain conditions and prepare for comprehensive testing of your runtime components

- [Runtime Testing](/develop/parachains/testing/runtime/) - validate how multiple pallets work together in your runtime, ensuring smooth integration and proper functionality across your blockchain system

Through these guides, you'll learn to:

- Create effective test environments
- Validate pallet interactions
- Simulate blockchain conditions
- Verify runtime behavior

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/sp_runtime/" target="_blank">
      <h2 class="title">`sp_runtime` crate Rust docs</h2>
      <p class="description">Learn about Substrate Runtime primitives that enable communication between a Substrate blockchain's runtime and client.</p>
    </a>
  </div>
    <div class="card">
    <a href="https://github.com/Moonsong-Labs/moonwall" target="_blank">
      <h2 class="title">Moonwall Testing Framework</h2>
      <p class="description">Moonwall is a comprehensive blockchain test framework for Substrate-based networks.</p>
    </a>
  </div>
</div>
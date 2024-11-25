---
title: Deployment
description: Learn how to prepare your blockchain for deployment using the Polkadot SDK, including building deterministic Wasm runtimes and generating chain specifications.
hide: 
    - feedback
template: index-page.html
---

# Deployment

Learn how to prepare your blockchain for deployment using the Polkadot SDK, including building deterministic Wasm runtimes and generating chain specifications.

These sections continue to build on your progress by guiding you through the steps to get your tested, custom blockchain deployed for use by your applications and users. You will learn about essential processes like building needed binaries, customizing and distributing chain specifications, and how to secure computational resources for your chain by obtaining coretime.

## Key Deployment Steps

- **[Build a deterministic runtime](/develop/parachains/deployment/build-deterministic-runtime/){target=\_blank}** - use the Substrate Runtime Toolbox (srtool) to ensure consistent deployment across all nodes and enable reliable verification

- **[Generate Chain Spec](/develop/parachains/deployment/generate-chain-specs/){target=\_blank}** - define your network's initial state, boot nodes, and essential parameters needed for a successful network launch

- **[Obtain Coretime](/develop/parachains/deployment/obtain-coretime/){target=\_blank}** - obtain and manage the coretime needed for your parachain to operate on the Polkadot network through bulk or on-demand allocation

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/sc_chain_spec/struct.GenericChainSpec.html" target="_blank">
      <h2 class="title">Generic Chain Spec</h2>
      <p class="description">Learn how to configure a Generic Chain Spec struct.</p>
    </a>
  </div>
    <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/staging_chain_spec_builder/index.html" target="_blank">
      <h2 class="title">Chain Spec Builder Docs</h2>
      <p class="description">Learn about Substrate’s chain spec builder utility.</p>
    </a>
  </div>
</div>
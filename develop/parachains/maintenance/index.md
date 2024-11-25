---
title: Maintenance
description: Learn how to maintain Polkadot SDK-based networks, covering runtime monitoring, upgrades, and storage migrations for optimal blockchain performance.
hide: 
    - feedback
template: index-page.html
---

# Maintenance

Learn how to maintain Polkadot SDK-based networks, covering runtime monitoring, upgrades, and storage migrations for optimal blockchain performance. These sections cover how to monitor your deployed blockchain so you can feel confident your applications and users receive the secure, performant results they need. You will learn how runtime versioning and storage migration work together to allow forkless upgrades. These features ensures you can offer the most current functionality from the Polkadot ecosystem without compromising network uptime or security.   

### Runtime Upgrades 
[Discover how to update your blockchain without disruption](/develop/parachains/maintenance/runtime-upgrades/){target=\_blank} using Polkadot's forkless upgrade system:

- Perform forkless runtime upgrades
- Manage runtime versions
- Execute seamless chain updates

### Storage Migrations
[Master the process of ensuring data consistency](/develop/parachains/maintenance/storage-migrations/){target=\_blank} during runtime upgrades:

- Transform storage data formats
- Implement safe migration strategies
- Validate data transformations

### Runtime Monitoring
[Learn how to track your network's health and performance](/develop/parachains/maintenance/runtime-metrics-monitoring/){target=\_blank} through comprehensive metrics and visualization tools:

- Monitor node performance and network metrics
- Visualize data through Prometheus and Grafana
- Set up alerts for critical events

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/sp_version/struct.RuntimeVersion.html" target="_blank">
      <h2 class="title">`RuntimeVersion` Struct Docs</h2>
      <p class="description">View the Polkadot SDK Docs explainer of the RuntimeVersion struct.</p>
    </a>
  </div>
    <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/pallet_example_single_block_migrations/index.html" target="_blank">
      <h2 class="title">Single Block Migration Example</h2>
      <p class="description">Check out an example pallet demonstrating best-practices for writing single-block migrations in the context of upgrading pallet storage.</p>
    </a>
  </div>
      <div class="card">
    <a href="https://paritytech.github.io/polkadot-sdk/master/pallet_example_single_block_migrations/index.html" target="_blank">
      <h2 class="title">Client Telemetry Crate</h2>
      <p class="description">Check out the docs on Substrate’s client telemetry, a part of substrate that allows ingesting telemetry data with for example Polkadot telemetry.</p>
    </a>
  </div>
</div>
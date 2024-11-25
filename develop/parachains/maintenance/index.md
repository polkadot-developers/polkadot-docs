---
title: Maintenance
description: Learn how to maintain Polkadot SDK-based networks, covering runtime monitoring, upgrades, and storage migrations for optimal blockchain performance.
hide: 
    - feedback
template: index-page.html
---

# Maintenance

Learn how to maintain Polkadot SDK-based networks, covering runtime monitoring, upgrades, and storage migrations for optimal blockchain performance. These sections cover how to monitor your deployed blockchain so you can feel confident your applications and users receive the secure, performant results they need. You will learn how runtime versioning and storage migration work together to allow forkless upgrades. These features ensures you can offer the most current functionality from the Polkadot ecosystem without compromising network uptime or security.   

## Key Maintenance Tasks

The primary maintenance tasks for parachain maintainers include:

- **[Runtime Monitoring](/develop/parachains/maintenance/runtime-metrics-monitoring/){target=\_blank}** - track your network's health through comprehensive metrics, visualize data through Prometheus and Grafana, and set up alerts for critical events

- **[Runtime Upgrades](/develop/parachains/maintenance/runtime-upgrades/){target=\_blank}** - perform forkless runtime upgrades, manage runtime versions, and execute seamless chain updates without network disruption

- **[Storage Migrations](/develop/parachains/maintenance/storage-migrations/){target=\_blank}** - ensure data consistency during upgrades by transforming storage data formats, implementing safe migration strategies, and validating data transformations

These maintenance practices help keep your blockchain secure, efficient, and adaptable to changing requirements. Whether you're operating a solo chain or a parachain, proper maintenance is crucial for long-term success.

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
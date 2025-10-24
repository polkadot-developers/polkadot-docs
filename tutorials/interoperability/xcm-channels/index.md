---
title: Tutorials for Managing XCM Channels
description: Learn step-by-step how to establish unidirectional and bidirectional HRMP channels between parachains and system parachains using XCM.
template: index-page.html
---

# Tutorials for Managing XCM Channels

Establishing [XCM channels](/develop/interoperability/xcm-channels/) is essential to unlocking Polkadot's native interoperability. Before bridging assets or sending cross-chain contract calls, the necessary XCM channels must be established.

These tutorials guide you through the process of setting up [Horizontal Relay-routed Message Passing (HRMP)](/develop/interoperability/xcm-channels/#establishing-hrmp-channels) channels for cross-chain messaging. Learn how to configure unidirectional channels [between parachains](/tutorials/interoperability/xcm-channels/para-to-para/) and the simplified single-message process for bidirectional channels with [system parachains like Asset Hub](/tutorials/interoperability/xcm-channels/para-to-system/).

## Understand the Process of Opening Channels

Each parachain starts with two default unidirectional XCM channels: an upward channel for sending messages to the relay chain, and a downward channel for receiving messages. These channels are implicitly available.

To enable communication between parachains, explicit HRMP channels must be established by registering them on the relay chain. This process requires a deposit to cover the costs associated with storing message queues on the relay chain. The deposit amount depends on the specific relay chain’s parameters.

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="/develop/interoperability/xcm-channels/">
      <h2 class="title">Review HRMP Configurations and Extrinsics</h2>
      <p class="description">Learn about the configurable parameters that govern HRMP channel behavior and the dispatchable extrinsics used to manage them.</p>
    </a>
  </div>
</div>

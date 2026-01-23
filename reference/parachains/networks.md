---
title: Networks
description: Explore Polkadot's testing and production networks, with Paseo as the official Polkadot TestNet for parachain and dApp development, plus Kusama and Westend for specialized use cases.
categories: Basics, Polkadot Protocol, Networks
---

# Networks

## Introduction

The Polkadot ecosystem is built on a robust set of networks designed to enable secure and scalable development. Whether you are testing new features or deploying to live production, Polkadot offers several layers of networks tailored for each stage of the development process. From local environments to the official Polkadot TestNet (Paseo), developers can thoroughly test, iterate, and validate their applications before deploying to Polkadot MainNet. This guide will introduce you to Polkadot's various networks and explain how they fit into the development workflow.

## Network Overview 

Polkadot's development process is structured to ensure new features and upgrades are rigorously tested before being deployed on live production networks. For all parachain and dApp developers, the recommended progression follows a well-defined path: starting from local environments, testing on Paseo (the official Polkadot TestNet), and ultimately deploying to either Kusama or Polkadot MainNet. The diagram below outlines the recommended development flow:

``` mermaid
flowchart LR
    id1[Local] --> id2[Paseo TestNet] --> id3[Kusama]
    id1[Local] --> id2[Paseo TestNet] --> id4[Polkadot MainNet]
```

This flow ensures developers can thoroughly test and iterate without risking real tokens or affecting production networks. **Paseo TestNet is the recommended testing environment for all deployments**, whether targeting Kusama or Polkadot. Testing tools like [Chopsticks](#chopsticks) make it easier to experiment safely before releasing to production.

### Recommended Development Path

For all parachain teams and dApp developers, the recommended journey looks like this:

1. **Local development node**: Development starts in a local environment, where developers can create, test, and iterate on upgrades or new features using a local development node. This stage allows rapid experimentation in an isolated setup without any external dependencies. Parachain developers can leverage local TestNets like [Zombienet](#zombienet) for multi-chain testing scenarios.

2. **Paseo (Polkadot TestNet)**: After testing locally, deploy to [Paseo](#polkadot-testnet-paseo), the official Polkadot TestNet. Paseo is a stable, community-run TestNet that mirrors Polkadot's runtime and is specifically designed for parachain teams and dApp developers to test before deploying to production networks. **This is the recommended TestNet whether you plan to deploy to Kusama or Polkadot MainNet**.

3. **Production deployment**: After thorough testing on Paseo, features are considered ready for deployment to either:
   - **Kusama**: An experimental "canary" network with real economic value, suitable for teams that want to deploy in a faster-moving production environment before Polkadot
   - **Polkadot MainNet**: The primary production network with enterprise-grade security

### Alternative Networks

The Polkadot ecosystem also includes alternative networks, but these are not part of the recommended development flow:

- **Westend**: A protocol-focused TestNet maintained by Parity Technologies, primarily used for testing low-level protocol changes and infrastructure updates. Westend is designed for infrastructure operators and core protocol developers, not for general parachain or dApp development. **The onboarding process for Westend is not clearly documented, and external developers should use Paseo TestNet instead**. See the [Other Networks](#other-networks) section for details.

!!!note
    The Rococo TestNet was deprecated on October 14, 2024. Paseo is now the official Polkadot TestNet for parachain and dApp development. For protocol-level testing, teams may use Westend, but most external developers should use Paseo as the default TestNet.

## Polkadot MainNet

Polkadot is the production network where real value and live applications operate. After thorough testing on Paseo and local development environments, teams deploy their parachains and dApps to Polkadot MainNet. Polkadot provides enterprise-grade security through its shared security model, where all parachains benefit from the collective security of the relay chain's validator set.

The native token for Polkadot is DOT. For more information about DOT, visit the [Native Assets](https://wiki.polkadot.com/learn/learn-DOT/){target=\_blank} page on the Polkadot Wiki.

## Polkadot TestNet (Paseo)

[Paseo](https://github.com/paseo-network){target=\_blank} is the official Polkadot TestNet for parachain teams and dApp developers. As a stable, community-run TestNet that mirrors Polkadot's runtime, Paseo is specifically designed to provide a reliable testing environment for teams preparing to deploy to Polkadot MainNet.

**Paseo is the recommended TestNet for the vast majority of external developers.** It provides a Polkadot-like environment without the risks and costs associated with live networks, making it ideal for testing parachains, smart contracts, cross-chain messaging (XCM), governance mechanisms, and other application features.

Key characteristics of Paseo:

- **Official Polkadot TestNet**: Recognized as the primary TestNet for Polkadot ecosystem development
- **Stable and reliable**: Maintained by the community with a focus on stability and uptime
- **Runtime parity**: Mirrors Polkadot's runtime, ensuring your tests accurately reflect MainNet behavior
- **Community-driven**: Governed and operated by Polkadot community members
- **Purpose-built for developers**: Specifically designed for parachain and dApp testing workflows

The native token for Paseo is PAS. TestNet tokens are available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. Additional information on PAS is available on the [Native Assets](https://wiki.polkadot.com/learn/learn-dot/#__tabbed_2_1){target=\_blank} page.

For more details about Paseo's role as the official Polkadot TestNet, see the [forum announcement](https://forum.polkadot.network/t/testnets-paseo-officially-becomes-the-polkadot-testnet-temporary-passet-hub-chain-for-smart-contracts-testing/13209){target=\_blank}.

## Other Networks

While Paseo serves as the default TestNet for most development workflows, the Polkadot ecosystem includes additional networks for specialized use cases.

### Kusama Network

Kusama is Polkadot's "canary" network—an experimental, production-grade environment with real economic value. Unlike TestNets, Kusama operates as a live network with actual incentives and economic consequences. It moves faster than Polkadot and has lower barriers to entry, making it suitable for teams that want to deploy in a real economic environment before moving to Polkadot.

Kusama is ideal for:

- Teams that want to test with real economic incentives
- Projects seeking a faster-moving governance and upgrade cycle
- Experiments and innovations that may eventually move to Polkadot

The native token for Kusama is KSM. For more information about KSM, visit the [Native Assets](https://wiki.polkadot.com/kusama/kusama-getting-started/){target=\_blank} page.

### Westend

Westend is a protocol-focused TestNet maintained by Parity Technologies, primarily used for testing low-level Polkadot protocol changes, runtime upgrades, and infrastructure updates before they reach Kusama or Polkadot. Unlike Paseo, Westend is intentionally unstable and receives cutting-edge protocol changes first, making it more suitable for core protocol development and infrastructure testing than for parachain or dApp development.

**Important**: Most external developers should **not** use Westend and should use Paseo TestNet instead. Westend's onboarding process is not clearly documented, and it is designed for infrastructure operators rather than general parachain teams. **Even if you plan to deploy to Kusama, you should test on Paseo TestNet, not Westend**.

Westend is primarily relevant for:

- Core Polkadot protocol developers testing runtime changes
- Infrastructure operators and validators testing low-level integrations
- Teams that specifically need to test against upcoming protocol changes before they reach production networks

Unlike temporary test networks, Westend is permanent and is not reset to the genesis block, making it an ongoing environment for long-term protocol testing.

The native token for Westend is WND. TestNet tokens are available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. More details about WND can be found on the [Native Assets](https://wiki.polkadot.com/learn/learn-dot/#__tabbed_2_2){target=\_blank} page.

## Local Test Networks

Local test networks are an essential part of the development cycle for blockchain developers using the Polkadot SDK. They allow for fast, iterative testing in controlled, private environments without connecting to public TestNets. Developers can quickly spin up local instances to experiment, debug, and validate their code before deploying to Paseo TestNet and ultimately to production. Two key tools for local network testing are Zombienet and Chopsticks.

### Zombienet

[Zombienet](https://github.com/paritytech/zombienet){target=\_blank} is a flexible testing framework for Polkadot SDK-based blockchains. It enables developers to create and manage ephemeral, short-lived networks. This feature makes Zombienet particularly useful for quick iterations, as it allows you to run multiple local networks concurrently, mimicking different runtime conditions. Whether you're developing a parachain or testing your custom blockchain logic, Zombienet gives you the tools to automate local testing.

Key features of Zombienet include:

- Creating dynamic, local networks with different configurations.
- Running parachains and relay chains in a simulated environment.
- Efficient testing of network components like cross-chain messaging and governance.

Zombienet is ideal for developers looking to test quickly and thoroughly before moving to more resource-intensive public TestNets.

### Chopsticks

[Chopsticks](https://github.com/AcalaNetwork/chopsticks){target=\_blank} is a tool designed to create forks of Polkadot SDK-based blockchains, allowing developers to interact with network forks as part of their testing process. This capability makes Chopsticks a powerful option for testing upgrades, runtime changes, or cross-chain applications in a forked network environment.

Key features of Chopsticks include:

- Forking live Polkadot SDK-based blockchains for isolated testing.
- Simulating cross-chain messages in a private, controlled setup.
- Debugging network behavior by interacting with the fork in real-time.

Chopsticks provides a controlled environment for developers to safely explore the effects of runtime changes. It ensures that network behavior is tested and verified before upgrades are deployed to live networks.
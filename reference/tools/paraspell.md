---
title: ParaSpell XCM SDK
description: A powerful open-source library that simplifies XCM integration, enabling developers to easily build interoperable dApps on Polkadot.
---

# ParaSpell XCM SDK

## Introduction

[ParaSpell](https://paraspell.github.io/docs/){target=\_blank} is a comprehensive suite of open-source tools designed to simplify cross-chain interactions within the Polkadot ecosystem. At its core, ParaSpell is dedicated to enhancing the functionality of the [XCM (Cross-Consensus Messaging)](/parachains/interoperability/get-started/){target=\_blank} protocol by providing developers with a unified and streamlined experience for building interoperable decentralized applications (dApps).

The primary goal of ParaSpell is to abstract away the complexities of the XCM protocol. While XCM is a powerful feature of the Polkadot network, its implementation can vary significantly between different parachains. ParaSpell addresses this challenge by providing a standardized set of tools that enable developers to easily integrate cross-chain functionality into their applications, saving valuable time and effort. ParaSpell is a "common good" software, meaning it is free, open-source, and dedicated to the growth of the Polkadot ecosystem.

The ParaSpell suite includes:

- **[XCM SDK](https://paraspell.xyz/#xcm-sdk){target=\_blank}**: Provides a unified layer to incorporate XCM into decentralized applications, simplifying complex cross-chain interactions.
- **[XCM API](https://paraspell.xyz/#xcm-api){target=\_blank}**: Offers an efficient, package-free approach to integrating XCM functionality while offloading heavy computing tasks, minimizing costs and improving application performance.
- **[XCM Router](https://paraspell.xyz/#xcm-router){target=\_blank}**: Enables cross-chain asset swaps in a single command, allowing developers to send one asset type (such as DOT on Polkadot) and receive a different asset on another chain (like ASTR on Astar).
- **[XCM Analyser](https://paraspell.xyz/#xcm-analyser){target=\_blank}**: Decodes and translates complex XCM multilocation data into readable information, supporting easier troubleshooting and debugging.
- **[XCM Visualizator](https://paraspell.xyz/#xcm-visualizator){target=\_blank}**: A tool designed to give developers a clear, interactive view of XCM activity across the Polkadot ecosystem, providing insights into cross-chain communication flow.
- **[XCM Playground](https://paraspell.xyz/#try-it){target=\_blank}**: An interactive playground for testing different XCM scenarios.

### ParaSpell XCM SDK

The [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} is a core component of the ParaSpell toolset and a foundational library for developers looking to leverage XCM in their applications. It is the first and only XCM SDK in the ecosystem to support both PolkadotJS and Polkadot API, providing developers with flexibility and choice.

The SDK simplifies the process of creating and sending XCM messages by providing a user-friendly builder pattern. This allows developers to construct complex XCM calls with just a few lines of code, reducing the likelihood of errors and ensuring that messages are constructed correctly.

By using the ParaSpell XCM SDK, developers can significantly accelerate their development workflow and build powerful, interoperable dApps that take full advantage of the Polkadot network's cross-chain capabilities.

## Installation

If you want to use ParaSpell in your npm-based project you can add it as a dependency with the following command:

```bash
npm install --save @paraspell/sdk@11.12.6
```

## Where to Go Next

Explore more about ParaSpell through these resources:

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Transfer Assets Between Parachains__

    ---

    Learn how to transfer assets across chains with ParaSpell.

    [:octicons-arrow-right-24: Transfer Assets Between Parachains](/chain-interactions/send-transactions/interoperability/transfer-assets-parachains/)

</div>

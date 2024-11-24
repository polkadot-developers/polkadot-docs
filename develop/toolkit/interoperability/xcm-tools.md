---
title: XCM Tools
description: Explore essential XCM tools across Polkadot, crafted to enhance cross-chain functionality and integration within the ecosystem.
---

# XCM Tools

## Introduction

As described in the [Interoperability](/develop/interoperability){target=\_blank} section, XCM (Cross-Consensus Messaging) is a protocol used in the Polkadot and Kusama ecosystems to enable communication and interaction between chains. It facilitates cross-chain communication, allowing assets, data, and messages to flow seamlessly across the ecosystem.

As XCM is central to enabling communication between blockchains, developers need robust tools to help interact with, build, and test XCM messages. Several XCM tools simplify working with the protocol by providing libraries, frameworks, and utilities that enhance the development process, ensuring that applications built within the Polkadot ecosystem can efficiently use cross-chain functionalities.

## Popular XCM Tools

### Moonsong Labs XCM Tools

[Moonsong Labs XCM Tools](https://github.com/Moonsong-Labs/xcm-tools){target=\_blank} provides a collection of scripts for managing and testing XCM operations between Polkadot SDK-based runtimes. These tools allow performing tasks like asset registration, channel setup, and XCM initialization. Key features include:

- **Asset registration** - registers assets, setting units per second (up-front fees), and configuring error (revert) codes
- **XCM initializer** - initializes XCM, sets default XCM versions, and configures revert codes for XCM-related precompiles
- **HRMP manipulator** - manages HRMP channel actions, including opening, accepting, or closing channels
- **XCM-Transactor-Info-Setter** - configures transactor information, including extra weight and fee settings
- **Decode XCM** - decodes XCM messages on the relay chain or parachains to help interpret cross-chain communication

To get started, clone the repository and install the required dependencies:

```bash
git clone https://github.com/Moonsong-Labs/xcm-tools && 
cd xcm-tools &&
yarn install
```

For a full overview of each script, visit the [scripts](https://github.com/Moonsong-Labs/xcm-tools/tree/main/scripts){target=\_blank} directory or refer to the [official documentation](https://github.com/Moonsong-Labs/xcm-tools/blob/main/README.md){target=\_blank} on GitHub.

### ParaSpell

[ParaSpell](https://paraspell.xyz/){target=\_blank} is a collection of open-source XCM tools designed to streamline cross-chain asset transfers and interactions within the Polkadot and Kusama ecosystems. It equips developers with an intuitive interface to manage and optimize XCM-based functionalities. Some key points included by ParaSpell are:

- [**XCM SDK**](https://paraspell.xyz/#xcm-sdk){target=\_blank} - provides a unified layer to incorporate XCM into decentralized applications, simplifying complex cross-chain interactions
- [**XCM API**](https://paraspell.xyz/#xcm-api){target=\_blank} - offers an efficient, package-free approach to integrating XCM functionality while offloading heavy computing tasks, minimizing costs and improving application performance
- [**XCM router**](https://paraspell.xyz/#xcm-router){target=\_blank} - enables cross-chain asset swaps in a single command, allowing developers to send one asset type (such as DOT on Polkadot) and receive a different asset on another chain (like ASTR on Astar)
- [**XCM analyser**](https://paraspell.xyz/#xcm-analyser){target=\_blank} - decodes and translates complex XCM multilocation data into readable information, supporting easier troubleshooting and debugging
- [**XCM visualizator**](https://paraspell.xyz/#xcm-visualizator){target=\_blank} - a tool designed to give developers a clear, interactive view of XCM activity across the Polkadot ecosystem, providing insights into cross-chain communication flow

ParaSpell's tools make it simple for developers to build, test, and deploy cross-chain solutions without needing extensive knowledge of the XCM protocol. With features like message composition, decoding, and practical utility functions for parachain interactions, ParaSpell is especially useful for debugging and optimizing cross-chain communications.

### Astar XCM Tools

The [Astar parachain](https://github.com/AstarNetwork/Astar/tree/master){target=\_blank} offers a crate with a set of utilities for interacting with the XCM protocol. The [xcm-tools](https://github.com/AstarNetwork/Astar/tree/master/bin/xcm-tools){target=\_blank} crate provides a straightforward method for users to locate a sovereign account or calculate an XC20 asset ID. Some commands included by the xcm-tools crate allow users to perform the following tasks:

- **Sovereign accounts** - obtain the sovereign account address for any parachain, either on the Relay Chain or for sibling parachains, using a simple command
- **XC20 EVM addresses** - generate XC20-compatible EVM addresses for assets by entering the asset ID, making it easy to integrate assets across EVM-compatible environments
- **Remote accounts** - retrieve remote account addresses needed for multi-location compatibility, using flexible options to specify account types and parachain IDs

To start using these tools, clone the [Astar repository](https://github.com/AstarNetwork/Astar){target=\_blank} and compile the xcm-tools package:

```bash
git clone https://github.com/AstarNetwork/Astar &&
cd Astar &&
cargo build --release -p xcm-tools
```

After compiling, verify the setup with the following command:

```bash
./target/release/xcm-tools --help
```
For more details on using Astar xcm-tools, consult the [official documentation](https://docs.astar.network/docs/learn/interoperability/xcm/integration/tools/){target=\_blank}.

### Chopsticks

The Chopsticks library provides XCM functionality for testing XCM messages across networks, enabling you to fork multiple parachains along with a relay chain. For further details, see the [Chopsticks documentation](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} about XCM.

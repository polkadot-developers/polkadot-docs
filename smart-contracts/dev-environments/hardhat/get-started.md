---
title: Use Hardhat with Polkadot Hub
description: Overview of Hardhat, a powerful development environment for creating, compiling, testing, and deploying smart contracts on Polkadot Hub.
categories: Smart Contracts, Tooling
---

# Hardhat

## Overview

Building on Polkadot Hub often starts with a Solidity codebase, and Hardhat keeps that workflow familiar while giving teams repeatable scripts, rich debugging, and CLI automation suited to the network's Ethereum-compatible execution layer.

Hardhat is a comprehensive development environment for building, testing, and deploying smart contracts. It provides developers with a complete toolkit, including compilation, local testing nodes, debugging tools, and deployment automation.

## Hardhat Workflow

From the first sketch of a contract to ongoing operations, Hardhat encourages a repeatable cycle: define the functionality you need, scaffold the workspace, write and refine Solidity code, compile it into deployable artifacts, validate behavior with automated tests, deploy confidently to the target network, and keep iterating with scripts that monitor and interact with what you shipped.

```mermaid
flowchart LR
    plan[Plan Contract]
    scaffold[Scaffold Project]
    develop[Write & Update Contracts]
    compile[Compile Sources]
    test[Run Automated Tests]
    deploy[Deploy to Target Network]
    operate[Interact & Monitor]

    plan --> scaffold --> develop --> compile --> test --> deploy --> operate
```

## Project Anatomy

A freshly initialized Hardhat project keeps code, configuration, and automation neatly separated:

```
.
├── contracts/
│   └── MyContract.sol
├── ignition/
│   └── modules/
├── scripts/
│   └── interact.js
├── test/
│   └── MyContract.test.js
└── hardhat.config.js
```

- `contracts/`: Solidity sources that define your smart contracts.
- `test/`: Automated tests written in JavaScript or TypeScript.
- `ignition/`: Deployment modules that orchestrate repeatable rollouts.
- `scripts/`: Utility scripts for deploying, validating, or interacting with contracts.
- `hardhat.config.js`: Central configuration for networks, compilers, and tooling.

## Core Functionalities

- **Project structure**: Organizes contracts, tests, scripts, and configuration into a consistent workspace. Provides a clear folder layout and a single configuration file (`hardhat.config.js`) to manage compilers, networks, and tooling.
- **Compilation**: Compiles Solidity sources, supports multiple compiler versions, and generates ABI and bytecode artifacts.
- **Local testing**: Runs tests written in JavaScript or TypeScript against an integrated local network, enabling fast feedback when validating contract behavior.
- **Task automation**: Automates deployments, maintenance operations, and recurring workflows through custom scripts and Hardhat tasks.
- **Contract interaction**: Enables reading contract state, sending transactions, and calling contract functions.

## Where to Go Next

Ready to explore the specifics? Dive into these guides to continue your Hardhat journey:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Install and Configure Hardhat__

    ---

    Initialize your workspace and adjust project settings for this toolchain.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/install-and-config/){target=\_blank}

-   <span class="badge guide">Guide</span> __Compile Smart Contracts__

    ---

    Configure compiler options and generate deployable artifacts.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/compile-and-test/){target=\_blank}

-   <span class="badge guide">Guide</span> __Test Your Smart Contracts__

    ---

    Build automated tests and run them against a local node.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/compile-and-test/){target=\_blank}

-   <span class="badge guide">Guide</span> __Deploy Smart Contracts__

    ---

    Roll out contracts to local, test, or production networks with repeatable scripts.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/deploy-a-contract/){target=\_blank}

-   <span class="badge guide">Guide</span> __Interact with Smart Contracts__

    ---

    Script on-chain interactions and automate maintenance tasks.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/interact-with-a-contract/){target=\_blank}

-   <span class="badge external">External</span> __Hardhat Documentation__

    ---

    Explore Hardhat's official documentation for advanced features and best practices.

    [:octicons-arrow-right-24: Learn More](https://hardhat.org/docs){target=\_blank}

-   <span class="badge external">External</span> __OpenZeppelin Contracts__

    ---

    Use prebuilt, audited contract templates to bootstrap your projects.

    [:octicons-arrow-right-24: Explore](https://www.openzeppelin.com/solidity-contracts){target=\_blank}

</div>
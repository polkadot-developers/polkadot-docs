---
title: Uniswap V2 Core with EVM on Polkadot
description: Deploy and test unmodified Uniswap V2 Core contracts on Polkadot Hub using standard Hardhat and TypeScript with the EVM execution path.
categories: Smart Contracts, Tooling
tools: Hardhat
page_badges:
  tutorial_badge: Intermediate
  test_workflow: polkadot-docs-uniswap-v2-core-hardhat
page_tests:
  path: polkadot-docs/smart-contracts/uniswap-v2-core-hardhat/tests/docs.test.ts
toggle:
  group: uniswap-v2-core
  canonical: true
  variant: evm
  label: EVM
---

# Deploy Uniswap V2 Core with EVM

## Introduction

Polkadot Hub supports two execution paths for running smart contracts: [PVM](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/#pvm) (which compiles Solidity to the Polkadot Virtual Machine via the revive compiler) and EVM (powered by [REVM](https://github.com/bluealloy/revm){target=\_blank}, a Rust implementation of the Ethereum Virtual Machine, which runs standard EVM bytecode with zero modifications). This tutorial follows the EVM path.

With EVM, you deploy the same unmodified Solidity contracts using the same standard Hardhat toolchain you already know. No special compiler plugins, no contract rewrites, and no porting effort. If your project compiles with vanilla Hardhat, it runs on Polkadot Hub through EVM.

This tutorial walks you through cloning, compiling, testing, and deploying [Uniswap V2](https://docs.uniswap.org/contracts/v2/overview){target=\_blank} on Polkadot Hub using Hardhat and TypeScript. By the end, you will have a fully functioning UniswapV2Factory contract deployed to the Polkadot Hub TestNet.

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/){target=\_blank} v22.0.0 or later and npm installed
- Basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} and TypeScript
- Familiarity with the [Hardhat](/smart-contracts/dev-environments/hardhat/){target=\_blank} development environment
- Some test tokens to cover transaction fees, obtained from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet
- A wallet with a private key for signing transactions
- Basic understanding of how AMMs and liquidity pools work

## Set Up the Project

Start by cloning the EVM Hardhat examples repository, which contains the Uniswap V2 Core project with a standard Hardhat and TypeScript configuration:

1. Clone the repository and navigate to the Uniswap V2 project:

    ```bash
    git clone https://github.com/polkadot-developers/revm-hardhat-examples.git
    cd revm-hardhat-examples
    git checkout b0a8627059a9d9cb759682310219557550186bc4
    cd uniswap-v2-core-hardhat/
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Compile the contracts:

    ```bash
    npx hardhat compile
    ```

    If the compilation is successful, you should see output similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/compilation-output.html'

    After running this command, the compiled artifacts (ABI and bytecode) appear in the `artifacts` directory.

## Configure Secure Key Management

This project uses [Hardhat Configuration Variables](https://v2.hardhat.org/hardhat-runner/docs/guides/configuration-variables){target=\_blank} to manage private keys securely. Unlike `.env` files, configuration variables are stored outside your project directory and are never at risk of being committed to version control.

To set your private key for TestNet deployment, run:

```bash
npx hardhat vars set TESTNET_PRIVATE_KEY
```

When prompted, paste your private key. Hardhat stores it securely and makes it available through `vars.get("TESTNET_PRIVATE_KEY")` in the configuration file.

!!! warning
    Keep your private key safe and never share it with anyone. If it is compromised, your funds can be stolen.

The `hardhat.config.ts` file references the variable conditionally, so the project works without it for local development:

```typescript title="hardhat.config.ts"
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/b0a8627059a9d9cb759682310219557550186bc4/uniswap-v2-core-hardhat/hardhat.config.ts:31:41'
```

!!! note
    You only need the `TESTNET_PRIVATE_KEY` variable when deploying to the Polkadot Hub TestNet. Local development against the development node does not require any key configuration.

## Uniswap V2 Core Architecture

Before interacting with the contracts, it is essential to understand the core architecture that powers Uniswap V2. This model forms the basis of nearly every modern DEX implementation and operates under automated market making, token pair liquidity pools, and deterministic pricing principles.

At the heart of Uniswap V2 lies a simple but powerful system composed of two major smart contracts:

- **Factory contract**: Acts as a registry and creator of new trading pairs. When two ERC-20 tokens are to be traded, the Factory contract generates a new Pair contract that manages that specific token pair's liquidity pool. It tracks all deployed pairs and ensures uniqueness, so no duplicate pools can exist for the same token combination.
- **Pair contract**: Each Pair contract is a decentralized liquidity pool that holds reserves of two ERC-20 tokens. These contracts implement the core AMM logic, maintaining a constant product invariant (x * y = k) to facilitate swaps and price determination. Users contribute tokens to these pools in return for LP (liquidity provider) tokens, which represent their proportional share of the reserves.

This architecture enables Uniswap to be highly modular, trustless, and extensible. By distributing responsibilities across these components, developers and users can engage with the protocol in a composable and predictable manner.

The project scaffolding is as follows:

```text
uniswap-v2-core-hardhat/
├── contracts/
│   ├── interfaces/
│   │   ├── IERC20.sol
│   │   ├── IUniswapV2Callee.sol
│   │   ├── IUniswapV2ERC20.sol
│   │   ├── IUniswapV2Factory.sol
│   │   └── IUniswapV2Pair.sol
│   ├── libraries/
│   │   ├── Math.sol
│   │   ├── SafeMath.sol
│   │   └── UQ112x112.sol
│   ├── test/
│   │   └── ERC20.sol
│   ├── UniswapV2ERC20.sol
│   ├── UniswapV2Factory.sol
│   └── UniswapV2Pair.sol
├── ignition/
│   └── modules/
│       └── UniswapV2Factory.ts
├── scripts/
│   └── deploy.ts
├── test/
│   ├── shared/
│   │   └── utilities.ts
│   ├── UniswapV2ERC20.test.ts
│   ├── UniswapV2Factory.test.ts
│   └── UniswapV2Pair.test.ts
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

Key differences from a typical Ethereum Hardhat project are minimal. The Solidity contracts are the original Uniswap V2 source (Solidity 0.5.16) with no modifications. The test files use TypeScript (`.test.ts`) and avoid `loadFixture` for compatibility with the Polkadot execution environment.

## Test the Contracts

The project includes a comprehensive test suite with 28 tests across three test files covering ERC-20 functionality, factory operations, and pair contract interactions including liquidity management and swaps.

To run the tests locally:

1. Start the local development node. Follow the steps in the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/){target=\_blank} guide to set it up.

2. In a new terminal, run the test suite against the local node:

    ```bash
    npx hardhat test --network localNode
    ```

    The tests are configured with a 120-second Mocha timeout to accommodate Polkadot network block times. The result should look similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/testing-output.html'

!!! tip
    If tests time out, ensure your local development node is running and accessible at `http://127.0.0.1:8545`.

## Deploy the Contracts

After successfully testing the contracts, you can deploy them to the Polkadot Hub TestNet using [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank}. The Ignition module at `ignition/modules/UniswapV2Factory.ts` deploys the UniswapV2Factory contract.

Make sure you have [configured your private key](#configure-secure-key-management) and that your account has test tokens. Then run:

```bash
npx hardhat ignition deploy ./ignition/modules/UniswapV2Factory.ts --network polkadotTestnet
```

When prompted, confirm the target network name and chain ID. Ignition deploys the Factory contract and prints the deployed address. The output should look similar to the following:

--8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/deployment-output.html'

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy Uniswap V2 Periphery__

    ---

    Deploy Router contracts for user-facing swaps, liquidity management, and WETH wrapping on top of V2 Core.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/periphery-v2/)

-   <span class="badge guide">Guide</span> __Hardhat on Polkadot__

    ---

    Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Reference](/smart-contracts/dev-environments/hardhat/)

-   <span class="badge guide">Guide</span> __Local Development Node__

    ---

    Set up and run a local development node for testing your smart contracts against Polkadot.

    [:octicons-arrow-right-24: Set Up](/smart-contracts/dev-environments/local-dev-node/)

</div>

---
title: Uniswap V2 Periphery with EVM on Polkadot
description: Deploy and test unmodified Uniswap V2 Periphery Router contracts on Polkadot Hub using standard Hardhat and TypeScript with the EVM execution path.
categories: Smart Contracts, Tooling
page_badges:
  tutorial_badge: Intermediate
  test_workflow: polkadot-docs-uniswap-v2-periphery-hardhat
page_tests:
  path: polkadot-docs/smart-contracts/uniswap-v2-periphery-hardhat/tests/docs.test.ts
---

# Deploy Uniswap V2 Periphery with EVM

## Introduction

The [Uniswap V2 Periphery](https://developers.uniswap.org/docs/protocols/v2/overview){target=\_blank} contracts provide the Router layer that sits on top of the [Uniswap V2 Core](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/){target=\_blank} Factory and Pair contracts. While V2 Core handles the low-level AMM logic, the Periphery Router contracts expose the user-facing functions for adding liquidity, removing liquidity, and executing token swaps safely with built-in deadline and slippage protection.

This tutorial follows the EVM execution path. With EVM (powered by [REVM](https://github.com/bluealloy/revm){target=\_blank}, a Rust implementation of the Ethereum Virtual Machine), you deploy the same unmodified Solidity contracts using the same standard Hardhat toolchain you already know. No special compiler plugins, no contract rewrites, and no porting effort. If your project compiles with vanilla Hardhat, it runs on Polkadot Hub through EVM.

This tutorial walks you through cloning, compiling, testing, and deploying the Uniswap V2 Periphery contracts on Polkadot Hub using Hardhat and TypeScript. By the end, you will have a fully functioning WETH contract, Factory, Router02, two ERC-20 test tokens, and a trading pair deployed to the Polkadot Hub TestNet.

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/){target=\_blank} v22.0.0 or later and npm installed
- Basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} and TypeScript
- Familiarity with the [Hardhat](/smart-contracts/dev-environments/hardhat/){target=\_blank} development environment
- Some test tokens to cover transaction fees, obtained from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet
- A wallet with a private key for signing transactions
- Basic understanding of how AMMs and liquidity pools work
- Completion of the [Uniswap V2 Core tutorial](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/){target=\_blank}, as the Periphery contracts depend on V2 Core

## Set Up the Project

Start by cloning the Hardhat examples repository, which contains the Uniswap V2 Periphery project with a standard Hardhat and TypeScript configuration:

1. Clone the repository and navigate to the Uniswap V2 Periphery project:

    ```bash
    git clone https://github.com/polkadot-developers/revm-hardhat-examples.git
    cd revm-hardhat-examples
    git checkout a871364c8f4da052855b5c8ee4ed6b89fd182cb1
    cd uniswap-v2-periphery-hardhat/
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

    !!! note
        The Periphery project depends on the V2 Core contracts through a local file reference (`"@uniswap/v2-core": "file:../uniswap-v2-core-hardhat"`). The `npm install` command resolves this automatically from the sibling directory in the repository.

3. Compile the contracts:

    ```bash
    npx hardhat compile
    ```

    If the compilation is successful, you should see output similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/periphery-v2/compilation-output.html'

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
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/a871364c8f4da052855b5c8ee4ed6b89fd182cb1/uniswap-v2-periphery-hardhat/hardhat.config.ts:44:57'
```

!!! note
    You only need the `TESTNET_PRIVATE_KEY` variable when deploying to the Polkadot Hub TestNet. Local development against the development node does not require any key configuration.

## Uniswap V2 Periphery Architecture

Before interacting with the contracts, it is essential to understand how the Periphery layer extends the V2 Core system. While the [V2 Core](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/){target=\_blank} contracts handle low-level pool operations, the Periphery contracts provide a safe and convenient interface for end users and integrating applications.

The Periphery layer introduces three major components:

- **WETH9 contract**: A standard Wrapped Ether contract that allows native ETH to be used as an ERC-20 token. The Router uses WETH to support functions that accept native ETH directly (such as `addLiquidityETH` and `swapExactETHForTokens`), wrapping and unwrapping it transparently.
- **Router01 contract**: The original Router implementation providing core functions for adding and removing liquidity, and executing multi-hop token swaps through a path of pairs. It validates deadlines and minimum output amounts to protect users from slippage and front-running.
- **Router02 contract**: The production Router that extends Router01 with additional support for fee-on-transfer tokens. Functions like `swapExactTokensForTokensSupportingFeeOnTransferTokens` handle tokens that deduct fees on every transfer, ensuring swaps complete correctly even when the received amount is less than the sent amount.

This architecture separates user-facing logic from the core AMM primitives, keeping the Core contracts simple and immutable while allowing the Periphery to evolve independently.

The project scaffolding is as follows:

```text
uniswap-v2-periphery-hardhat/
├── contracts/
│   ├── interfaces/
│   │   ├── IERC20.sol
│   │   ├── IUniswapV2Router01.sol
│   │   ├── IUniswapV2Router02.sol
│   │   └── IWETH.sol
│   ├── libraries/
│   │   ├── SafeMath.sol
│   │   └── UniswapV2Library.sol
│   ├── test/
│   │   ├── CompileHelper.sol
│   │   ├── DeflatingERC20.sol
│   │   ├── ERC20.sol
│   │   ├── RouterEventEmitter.sol
│   │   └── WETH9.sol
│   ├── UniswapV2Router01.sol
│   └── UniswapV2Router02.sol
├── ignition/
│   └── modules/
│       └── UniswapV2Router02.ts
├── scripts/
│   └── deploy.ts
├── test/
│   ├── shared/
│   │   ├── fixtures.ts
│   │   └── utilities.ts
│   ├── UniswapV2Router01.test.ts
│   └── UniswapV2Router02.test.ts
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

Key differences from a typical Ethereum Hardhat project are minimal. The Solidity contracts are the original Uniswap V2 Periphery source, using both Solidity 0.5.16 (for the V2 Core dependency) and 0.6.6 (for the Router contracts) with no modifications. The Hardhat configuration includes a multi-compiler setup to handle both versions. The test files use TypeScript (`.test.ts`) and avoid `loadFixture` for compatibility with the Polkadot execution environment.

## Test the Contracts

The project includes a comprehensive test suite with 50 tests across two test files. The Router01 test file covers 38 tests for liquidity operations, token swaps, ETH swaps, and permit-based liquidity removal. The Router02 test file covers 12 tests for fee-on-transfer token support and additional swap scenarios.

To run the tests locally:

1. Start the local development node. Follow the steps in the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/){target=\_blank} guide to set it up.

2. In a new terminal, run the test suite against the local node:

    ```bash
    npx hardhat test --network localNode
    ```

    The tests are configured with a 120-second Mocha timeout to accommodate Polkadot network block times. The result should look similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/periphery-v2/testing-output.html'

!!! tip
    If tests time out, ensure your local development node is running and accessible at `http://127.0.0.1:8545`.

## Deploy the Contracts

After successfully testing the contracts, you can deploy them to the Polkadot Hub TestNet using [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank}. The Ignition module at `ignition/modules/UniswapV2Router02.ts` deploys WETH9, the UniswapV2Factory, and the UniswapV2Router02 contracts.

Make sure you have [configured your private key](#configure-secure-key-management) and that your account has test tokens. Then run:

```bash
npx hardhat ignition deploy ./ignition/modules/UniswapV2Router02.ts --network polkadotTestnet
```

When prompted, confirm the target network name and chain ID. Ignition deploys the contracts in two batches (Factory and WETH9 in parallel, then Router02) and prints all deployed addresses. The output should look similar to the following:

--8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/periphery-v2/deployment-output.html'

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy Uniswap V2 Core__

    ---

    Deploy the underlying Uniswap V2 Factory and Pair contracts on Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/)

-   <span class="badge guide">Guide</span> __Hardhat on Polkadot__

    ---

    Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Reference](/smart-contracts/dev-environments/hardhat/)

-   <span class="badge guide">Guide</span> __Local Development Node__

    ---

    Set up and run a local development node for testing your smart contracts against Polkadot.

    [:octicons-arrow-right-24: Set Up](/smart-contracts/dev-environments/local-dev-node/)

</div>

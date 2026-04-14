---
title: Uniswap V3 Core on Polkadot Hub
description: Deploy and test unmodified Uniswap V3 Core contracts on Polkadot Hub using standard Hardhat and TypeScript with the EVM execution path.
categories: Smart Contracts, Tooling
tools: Hardhat
page_badges:
  tutorial_badge: Intermediate
  test_workflow: polkadot-docs-uniswap-v3-core-hardhat
page_tests:
  path: polkadot-docs/smart-contracts/uniswap-v3-core-hardhat/tests/docs.test.ts
---

# Deploy Uniswap V3 Core with EVM

## Introduction

Polkadot Hub supports two paths for running EVM smart contracts: PVM (which compiles Solidity to the Polkadot Virtual Machine via the revive compiler) and EVM (powered by [REVM](https://github.com/bluealloy/revm){target=\_blank}, a Rust implementation of the Ethereum Virtual Machine, which runs standard EVM bytecode with zero modifications). This tutorial follows the EVM path.

With EVM, you deploy the same unmodified Solidity contracts using the same standard Hardhat toolchain you already know. No special compiler plugins, no contract rewrites, and no porting effort. If your project compiles with vanilla Hardhat, it runs on Polkadot Hub through EVM.

This tutorial walks you through cloning, compiling, testing, and deploying [Uniswap V3 Core](https://docs.uniswap.org/contracts/v3/overview){target=\_blank} on Polkadot Hub using Hardhat and TypeScript. By the end, you will have a fully functioning Factory contract, two ERC-20 test tokens, and a concentrated liquidity pool with a 0.3% fee tier deployed to either a local development node or the Polkadot Hub TestNet.

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/){target=\_blank} v22.0.0 or later and npm installed
- Basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} and TypeScript
- Familiarity with the [Hardhat](/smart-contracts/dev-environments/hardhat/){target=\_blank} development environment
- Some test tokens to cover transaction fees, obtained from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet
- A wallet with a private key for signing transactions
- Basic understanding of how AMMs and liquidity pools work

## Set Up the Project

Start by cloning the EVM Hardhat examples repository, which contains the Uniswap V3 Core project with a standard Hardhat and TypeScript configuration:

1. Clone the repository, check out the pinned commit, and navigate to the Uniswap V3 project:

    ```bash
    git clone https://github.com/polkadot-developers/revm-hardhat-examples.git
    cd revm-hardhat-examples
    git checkout edcf9aa614f7269286c9dba1ac6eb7f705fc0c3a
    cd uniswap-v3-core-hardhat/
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

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/compilation-output.html'

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
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/edcf9aa614f7269286c9dba1ac6eb7f705fc0c3a/uniswap-v3-core-hardhat/hardhat.config.ts:44:49'
```

!!! note
    You only need the `TESTNET_PRIVATE_KEY` variable when deploying to the Polkadot Hub TestNet. Local development against the development node does not require any key configuration.

### V3-Specific Configuration

Uniswap V3 Core requires specific Solidity compiler settings to keep the `UniswapV3Factory` contract under the [EIP-170](https://eips.ethereum.org/EIPS/eip-170){target=\_blank} 24KB contract size limit. The `hardhat.config.ts` file sets `bytecodeHash` to `"none"`, which excludes the metadata hash from the compiled bytecode. This matches the original Uniswap V3 Core deployment configuration:

```typescript title="hardhat.config.ts"
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/edcf9aa614f7269286c9dba1ac6eb7f705fc0c3a/uniswap-v3-core-hardhat/hardhat.config.ts:22:35'
```

The configuration also sets a fixed gas price of 50 gwei for the `localNode` network to match the gas price reported by the Polkadot local development node:

```typescript title="hardhat.config.ts"
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/edcf9aa614f7269286c9dba1ac6eb7f705fc0c3a/uniswap-v3-core-hardhat/hardhat.config.ts:40:43'
```

## Uniswap V3 Core Architecture

Before interacting with the contracts, it is essential to understand the core architecture that powers Uniswap V3. This version introduces concentrated liquidity, a fundamentally different model from V2's uniform distribution that allows liquidity providers to allocate capital within specific price ranges for dramatically improved capital efficiency.

### Concentrated Liquidity and Fee Tiers

In Uniswap V2, liquidity is spread uniformly across the entire price curve from zero to infinity. Uniswap V3 replaces this with concentrated liquidity, where providers choose a specific price range in which their capital is active. This means a position only earns fees when the current price falls within its selected range, but the capital within that range is far more effective.

Uniswap V3 also introduces multiple fee tiers so that pools can match the risk profile of different token pairs:

| Fee Tier | Fee Percentage | Tick Spacing | Typical Use Case |
|:--------:|:--------------:|:------------:|:----------------:|
| 500 | 0.05% | 10 | Stable pairs (e.g., USDC/DAI) |
| 3000 | 0.30% | 60 | Standard pairs (e.g., ETH/USDC) |
| 10000 | 1.00% | 200 | Exotic or volatile pairs |

### Tick System and Price Math

Prices in Uniswap V3 are represented as the square root of the price ratio, stored as a fixed-point Q64.96 value (`sqrtPriceX96`). The continuous price space is divided into discrete ticks, where each tick represents a 0.01% (1 basis point) price change. Liquidity positions are bounded by a lower tick and an upper tick, and the protocol tracks which ticks have active liquidity through a bitmap data structure.

### Core Contracts

At the heart of Uniswap V3 are four core smart contracts:

- **UniswapV3Factory** - Creates and registers new pools. Each unique combination of two tokens and a fee tier produces a single pool. The Factory also controls protocol fee settings and ownership.
- **UniswapV3Pool** - The main contract for each trading pair and fee tier. It manages concentrated liquidity positions, executes swaps using the tick-based price system, and maintains a built-in TWAP (time-weighted average price) oracle.
- **UniswapV3PoolDeployer** - A helper contract used by the Factory to deploy new pools via `CREATE2`, ensuring deterministic pool addresses.
- **NoDelegateCall** - A security base contract that prevents delegate call exploits by verifying the execution context matches the original deployment address.

### Math Libraries

The V3 protocol relies on an extensive suite of 16 math library contracts for precise fixed-point arithmetic, tick calculations, and price computations. These include `TickMath` for converting between ticks and sqrt prices, `SqrtPriceMath` for computing swap amounts, `FullMath` for 512-bit multiplication, and `Oracle` for TWAP accumulator management, among others.

### Project Structure

The project scaffolding is as follows:

```text
uniswap-v3-core-hardhat/
├── contracts/
│   ├── interfaces/
│   │   ├── callback/
│   │   │   ├── IUniswapV3FlashCallback.sol
│   │   │   ├── IUniswapV3MintCallback.sol
│   │   │   └── IUniswapV3SwapCallback.sol
│   │   ├── pool/
│   │   │   ├── IUniswapV3PoolActions.sol
│   │   │   ├── IUniswapV3PoolDerivedState.sol
│   │   │   ├── IUniswapV3PoolEvents.sol
│   │   │   ├── IUniswapV3PoolImmutables.sol
│   │   │   ├── IUniswapV3PoolOwnerActions.sol
│   │   │   └── IUniswapV3PoolState.sol
│   │   ├── IERC20Minimal.sol
│   │   ├── IUniswapV3Factory.sol
│   │   ├── IUniswapV3Pool.sol
│   │   └── IUniswapV3PoolDeployer.sol
│   ├── libraries/
│   │   ├── BitMath.sol
│   │   ├── FixedPoint128.sol
│   │   ├── FixedPoint96.sol
│   │   ├── FullMath.sol
│   │   ├── LiquidityMath.sol
│   │   ├── LowGasSafeMath.sol
│   │   ├── Oracle.sol
│   │   ├── Position.sol
│   │   ├── SafeCast.sol
│   │   ├── SqrtPriceMath.sol
│   │   ├── SwapMath.sol
│   │   ├── Tick.sol
│   │   ├── TickBitmap.sol
│   │   ├── TickMath.sol
│   │   ├── TransferHelper.sol
│   │   └── UnsafeMath.sol
│   ├── test/
│   │   ├── BitMathTest.sol
│   │   ├── FullMathTest.sol
│   │   ├── LiquidityMathTest.sol
│   │   ├── MockTimeUniswapV3Pool.sol
│   │   ├── MockTimeUniswapV3PoolDeployer.sol
│   │   ├── NoDelegateCallTest.sol
│   │   ├── OracleTest.sol
│   │   ├── SqrtPriceMathTest.sol
│   │   ├── SwapMathTest.sol
│   │   ├── TestERC20.sol
│   │   ├── TestUniswapV3Callee.sol
│   │   ├── TestUniswapV3ReentrantCallee.sol
│   │   ├── TestUniswapV3Router.sol
│   │   ├── TestUniswapV3SwapPay.sol
│   │   ├── TickBitmapTest.sol
│   │   ├── TickMathTest.sol
│   │   └── TickTest.sol
│   ├── NoDelegateCall.sol
│   ├── UniswapV3Factory.sol
│   ├── UniswapV3Pool.sol
│   └── UniswapV3PoolDeployer.sol
├── ignition/
│   └── modules/
│       └── UniswapV3Factory.ts
├── scripts/
│   └── deploy.ts
├── test/
│   ├── shared/
│   │   ├── checkObservationEquals.ts
│   │   ├── fixtures.ts
│   │   ├── format.ts
│   │   └── utilities.ts
│   ├── UniswapV3Factory.test.ts
│   └── UniswapV3Pool.test.ts
├── hardhat.config.ts
├── package.json
└── tsconfig.json
```

Key differences from V2 are significant. The Solidity contracts use version 0.7.6 (V2 used 0.5.16). The `contracts/libraries/` directory contains 16 math libraries for tick calculations, fixed-point arithmetic, and oracle management. The `contracts/test/` directory includes 17 test helper contracts, including mock pools, routers, and math test harnesses. The test suite is split across two files instead of three, with a shared utilities directory.

## Test the Contracts

The project includes a comprehensive test suite with 187 tests across two test files:

- **`UniswapV3Factory.test.ts`** - 21 tests covering factory operations, pool creation, fee tier management, and ownership controls
- **`UniswapV3Pool.test.ts`** - 166 tests covering concentrated liquidity positions, swaps across tick boundaries, fee accumulation, flash loans, oracle observations, and edge cases

To run the tests locally:

1. Start the local development node. Follow the steps in the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/){target=\_blank} guide to set it up.

2. In a new terminal, run the test suite against the local node:

    ```bash
    npx hardhat test --network localNode
    ```

    The tests are configured with a 120-second Mocha timeout to accommodate Polkadot network block times. The result should look similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/testing-output.html'

!!! tip
    If tests time out, ensure your local development node is running and accessible at `http://127.0.0.1:8545`.

## Deploy the Contracts

After successfully testing the contracts, you can deploy them. The deployment script at `scripts/deploy.ts` deploys the UniswapV3Factory, two test ERC-20 tokens (each with a supply of 2^255 tokens), and creates a 0.3% fee pool between them.

### Deploy to the Local Node

To deploy to your local development node:

```bash
npx hardhat run scripts/deploy.ts --network localNode
```

This deploys the contracts to your local blockchain for development and testing. No private key configuration is required for local deployment.

### Deploy to the Polkadot Hub TestNet

To deploy to the Polkadot Hub TestNet, make sure you have [configured your private key](#configure-secure-key-management) and that your account has test tokens. Then run:

```bash
npx hardhat run scripts/deploy.ts --network polkadotTestnet
```

This deploys to the actual Polkadot Hub TestNet. It requires test tokens, persists on the network, and operates under real network conditions.

The deployment script outputs the addresses of all deployed contracts. Save these addresses, as you will need them to interact with the contracts. The output should look similar to the following:

--8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/deployment-output.html'

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Hardhat on Polkadot__

    ---

    Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Reference](/smart-contracts/dev-environments/hardhat/)

-   <span class="badge tutorial">Tutorial</span> __Uniswap V2 Core__

    ---

    Compare with the Uniswap V2 Core deployment to see how V2's uniform liquidity model differs from V3's concentrated approach.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core-v2/)

</div>

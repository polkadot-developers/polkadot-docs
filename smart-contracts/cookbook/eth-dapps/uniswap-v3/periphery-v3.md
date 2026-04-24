---
title: Uniswap V3 Periphery with EVM on Polkadot Hub
description: Deploy and test unmodified Uniswap V3 Periphery contracts, SwapRouter and NonfungiblePositionManager, on Polkadot Hub using standard Hardhat and TypeScript with the EVM execution path.
categories: Smart Contracts, Tooling
page_badges:
  tutorial_badge: Intermediate
  test_workflow: polkadot-docs-uniswap-v3-periphery-hardhat
page_tests:
  path: polkadot-docs/smart-contracts/uniswap-v3-periphery-hardhat/tests/docs.test.ts
---

# Deploy Uniswap V3 Periphery with EVM

## Introduction

The [Uniswap V3 Periphery](https://developers.uniswap.org/docs/protocols/v3/overview){target=\_blank} contracts provide the user-facing layer that sits on top of the [Uniswap V3 Core](/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/){target=\_blank} Factory and Pool contracts. While V3 Core handles the low-level concentrated liquidity engine, the Periphery contracts expose the functions that users and applications interact with directly: executing token swaps through one or more pools and managing concentrated liquidity positions as ERC-721 NFTs.

This tutorial follows the EVM execution path. With EVM (powered by [REVM](https://github.com/bluealloy/revm){target=\_blank}, a Rust implementation of the Ethereum Virtual Machine), you deploy the same unmodified Solidity contracts using the same standard Hardhat toolchain you already know. No special compiler plugins, no contract rewrites, and no porting effort. If your project compiles with vanilla Hardhat, it runs on Polkadot Hub through EVM.

This tutorial walks you through cloning, compiling, testing, and deploying the Uniswap V3 Periphery contracts on Polkadot Hub using Hardhat and TypeScript. By the end, you will have a fully functioning SwapRouter and NonfungiblePositionManager deployed to the Polkadot Hub TestNet.

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/){target=\_blank} v22.0.0 or later and npm installed
- Basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} and TypeScript
- Familiarity with the [Hardhat](/smart-contracts/dev-environments/hardhat/){target=\_blank} development environment
- Some test tokens to cover transaction fees, obtained from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet
- A wallet with a private key for signing transactions
- Basic understanding of how AMMs and liquidity pools work
- Completion of the [Uniswap V3 Core tutorial](/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/){target=\_blank}, as the Periphery contracts depend on the V3 Core contracts through a local package reference

## Set Up the Project

Start by cloning the EVM Hardhat examples repository, which contains the Uniswap V3 Periphery project with a standard Hardhat and TypeScript configuration:

1. Clone the repository, check out the pinned commit, and navigate to the Uniswap V3 Periphery project:

    ```bash
    git clone https://github.com/polkadot-developers/revm-hardhat-examples.git
    cd revm-hardhat-examples
    git checkout <PINNED_COMMIT>
    cd uniswap-v3-periphery-hardhat/
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

    !!! note
        The Periphery project depends on the V3 Core contracts through a local file reference (`"@uniswap/v3-core": "file:../uniswap-v3-core-hardhat"`). The `npm install` command resolves this automatically from the sibling directory in the repository, which is why you cloned the full monorepo rather than just the Periphery subdirectory.

3. Compile the contracts:

    ```bash
    npx hardhat compile
    ```

    If the compilation is successful, you should see output similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v3/periphery-v3/compilation-output.html'

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
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/<PINNED_COMMIT>/uniswap-v3-periphery-hardhat/hardhat.config.ts:46:51'
```

!!! note
    You only need the `TESTNET_PRIVATE_KEY` variable when deploying to the Polkadot Hub TestNet. Local development against the development node does not require any key configuration.

### V3-Specific Configuration

The Periphery project uses the same critical compiler setting as V3 Core: `bytecodeHash` is set to `"none"`, which excludes the metadata hash from the compiled bytecode. This is required so that the compiled `UniswapV3Pool` bytecode matches the hardcoded `POOL_INIT_CODE_HASH` constant in `PoolAddress.sol`. The Periphery contracts use this constant to compute pool addresses via CREATE2 — a mismatch causes every swap and LP operation to silently call the wrong address:

```typescript title="hardhat.config.ts"
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/<PINNED_COMMIT>/uniswap-v3-periphery-hardhat/hardhat.config.ts:21:37'
```

The configuration also sets `allowUnlimitedContractSize: true` for the local Hardhat network, which is required because several Periphery contracts exceed the standard 24KB EIP-170 size limit. For the `localNode` network, a fixed gas price of 50 gwei matches the gas price reported by the Polkadot local development node:

```typescript title="hardhat.config.ts"
--8<-- 'https://raw.githubusercontent.com/polkadot-developers/revm-hardhat-examples/<PINNED_COMMIT>/uniswap-v3-periphery-hardhat/hardhat.config.ts:38:45'
```

## Uniswap V3 Periphery Architecture

Before interacting with the contracts, it is essential to understand how the Periphery layer extends the V3 Core system. While the [V3 Core](/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/){target=\_blank} contracts implement the concentrated liquidity engine, the Periphery contracts translate that engine into safe and ergonomic interfaces for end users and integrating applications.

### Concentrated Liquidity and LP Positions

Uniswap V3 allows liquidity providers to concentrate capital within a chosen price range defined by a lower tick and an upper tick. A position earns trading fees only when the current pool price falls within its range.

The token composition of an out-of-range position is determined by its relationship to the current price. When the current price is below the position's range, the position holds 100% token0 because all liquidity has been converted to the cheaper asset as the price moved down through the range. When the current price is above the range, the position holds 100% token1 because all liquidity has been converted to the more expensive asset as the price moved up. Only an in-range position holds both tokens simultaneously.

Accumulated fees are tracked separately from principal liquidity and are staged in `tokensOwed` fields on the position. Retrieving fees requires two explicit steps: calling `decreaseLiquidity` to move accrued principal and fees into `tokensOwed`, then calling `collect` to transfer those amounts to the owner's wallet.

### SwapRouter

The `SwapRouter` contract routes token swaps through one or more V3 pools. It supports four swap modes:

- **`exactInputSingle`**: Spend a fixed amount of one token to receive as much of another token as possible through a single pool. The `amountOutMinimum` parameter enforces a slippage floor, and `sqrtPriceLimitX96` optionally caps how far the price can move (enabling partial fills).
- **`exactInput`**: Execute a multi-hop swap along an ABI-encoded path of pools. Each hop specifies a `tokenIn`, `fee`, and `tokenOut`. The full input amount is consumed and the final output must meet `amountOutMinimum`.
- **`exactOutputSingle`**: Buy a precise amount of one token using as little of another token as possible through a single pool. The `amountInMaximum` parameter caps the input, and the router refunds any unused allowance.
- **`exactOutput`**: Execute a multi-hop exact-output swap. The path is encoded in reverse (from the output token back to the input token), and the caller specifies the exact amount to receive.

### NonfungiblePositionManager

The `NonfungiblePositionManager` (NFPM) represents each concentrated liquidity position as an ERC-721 NFT. A single contract manages the full LP lifecycle:

- **`createAndInitializePoolIfNecessary`**: Creates a new V3 pool for a token pair and fee tier if none exists, and sets its initial price as a `sqrtPriceX96` value. Calling this on an already-initialized pool is a safe no-op.
- **`mint`**: Opens a new position within a specified tick range and mints an NFT to the recipient. The `tokenId` returned uniquely identifies the position. The `amount0Min` and `amount1Min` parameters guard against slippage during the initial deposit.
- **`increaseLiquidity`**: Adds more capital to an existing position identified by its `tokenId`. The position's tick range and fee tier remain unchanged.
- **`decreaseLiquidity`**: Removes a specified amount of liquidity from a position. Tokens are not transferred to the owner immediately; they are staged in the position's `tokensOwed0` and `tokensOwed1` fields. This two-step design allows the owner to decide when to withdraw.
- **`collect`**: Transfers the amounts staged in `tokensOwed` (from both `decreaseLiquidity` and accumulated fees) to a specified recipient. The `amount0Max` and `amount1Max` parameters allow partial collection.
- **`burn`**: Destroys the NFT for a position that has been fully exited. The position must have `liquidity == 0` and `tokensOwed0 == tokensOwed1 == 0`; attempting to burn a live or uncollected position reverts.

### Project Structure

The project scaffolding is as follows:

```text
uniswap-v3-periphery-hardhat/
├── contracts/
│   ├── SwapRouter.sol                      # Swap router (single-hop + multi-hop)
│   ├── NonfungiblePositionManager.sol      # LP position NFT manager
│   ├── NonfungibleTokenPositionDescriptor.sol
│   ├── base/                               # Abstract base contracts
│   │   ├── PeripheryImmutableState.sol
│   │   ├── PeripheryPayments.sol
│   │   ├── LiquidityManagement.sol
│   │   ├── ERC721Permit.sol
│   │   ├── PoolInitializer.sol
│   │   └── ...
│   ├── libraries/                          # Pure utility libraries
│   │   ├── PoolAddress.sol
│   │   ├── Path.sol
│   │   ├── LiquidityAmounts.sol
│   │   └── ...
│   ├── interfaces/                         # Contract interfaces
│   │   ├── ISwapRouter.sol
│   │   ├── INonfungiblePositionManager.sol
│   │   └── ...
│   └── test/                              # Test helper contracts
│       ├── WETH9.sol
│       ├── TestERC20.sol
│       ├── MockTimeSwapRouter.sol
│       ├── MockTimeNonfungiblePositionManager.sol
│       └── CoreContracts.sol
├── ignition/
│   └── modules/
│       └── UniswapV3Periphery.ts          # Hardhat Ignition deployment module
├── scripts/
│   └── deploy.ts
├── test/
│   ├── SwapRouter.test.ts                 # Router tests (14 tests)
│   ├── NonfungiblePositionManager.test.ts # NFPM tests (25 tests)
│   └── shared/
│       ├── fixtures.ts
│       └── utilities.ts
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

Key differences from the V3 Core project are minimal. The Solidity contracts use the same version 0.7.6. The `contracts/libraries/` directory contains periphery-specific math and path-encoding utilities such as `PoolAddress.sol` (deterministic CREATE2 address computation), `Path.sol` (multi-hop path encoding), and `LiquidityAmounts.sol` (token amount to liquidity unit conversion). The `contracts/test/` directory includes `CoreContracts.sol`, an import shim that forces Hardhat to compile `UniswapV3Factory` and `UniswapV3Pool` from `@uniswap/v3-core` so their artifacts are available during tests. The test suite avoids `loadFixture` for compatibility with the Polkadot execution environment, using `beforeEach` with direct fixture calls instead.

## Test the Contracts

The project includes a test suite with 39 tests across two test files:

- **`SwapRouter.test.ts`**: 14 tests covering all four swap modes (exactInputSingle, exactInput, exactOutputSingle, exactOutput), slippage protection enforcement, recipient routing, sqrtPriceLimitX96 partial fills, and on-chain pool state changes after swaps.
- **`NonfungiblePositionManager.test.ts`**: 25 tests covering the full LP lifecycle: pool creation and initialization, minting in-range and out-of-range positions, increasing and decreasing liquidity, fee collection through real swaps, and the complete burn cleanup sequence.

To run the tests locally:

1. Start the local development node. Follow the steps in the [Local Development Node](/smart-contracts/dev-environments/local-dev-node/){target=\_blank} guide to set it up.

2. In a new terminal, run the test suite against the local node:

    ```bash
    npx hardhat test --network localNode
    ```

    The tests are configured with a 120-second Mocha timeout to accommodate Polkadot network block times. The result should look similar to the following:

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v3/periphery-v3/testing-output.html'

!!! tip
    If tests time out, ensure your local development node is running and accessible at `http://127.0.0.1:8545`.

## Deploy the Contracts

After successfully testing the contracts, you can deploy them to the Polkadot Hub TestNet using [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started#overview){target=\_blank}. The Ignition module at `ignition/modules/UniswapV3Periphery.ts` deploys all four contracts: `UniswapV3Factory`, `WETH9`, `SwapRouter`, and `NonfungiblePositionManager`.

Make sure you have [configured your private key](#configure-secure-key-management) and that your account has test tokens. Then run:

```bash
npx hardhat ignition deploy ./ignition/modules/UniswapV3Periphery.ts --network polkadotTestnet
```

When prompted, confirm the target network name and chain ID. Ignition deploys the contracts in two batches — the Factory and WETH9 in parallel first, then the SwapRouter and NonfungiblePositionManager in parallel once their dependencies are available — and prints all deployed addresses. The output should look similar to the following:

--8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v3/periphery-v3/deployment-output.html'

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Uniswap V3 Core__

    ---

    Deploy the Uniswap V3 Factory and Pool contracts on Polkadot Hub to understand the concentrated liquidity engine that the Periphery builds on.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/eth-dapps/uniswap-v3/core-v3/)

-   <span class="badge guide">Guide</span> __Hardhat on Polkadot__

    ---

    Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Reference](/smart-contracts/dev-environments/hardhat/)

-   <span class="badge guide">Guide</span> __Local Development Node__

    ---

    Set up and run a local development node for testing your smart contracts against Polkadot.

    [:octicons-arrow-right-24: Set Up](/smart-contracts/dev-environments/local-dev-node/)

</div>

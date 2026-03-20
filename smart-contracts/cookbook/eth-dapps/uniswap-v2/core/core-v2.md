---
title: Uniswap V2 Core with EVM on Polkadot
description: Deploy and test unmodified Uniswap V2 Core contracts on Polkadot Hub using standard Hardhat and TypeScript with the EVM execution path.
tutorial_badge: Intermediate
categories: Smart Contracts, Tooling
tools: Hardhat
toggle:
  group: uniswap-v2-core
  canonical: true
  variant: evm
  label: EVM
---

# Deploy Uniswap V2 Core with EVM

## Introduction

Polkadot Hub supports two paths for running EVM smart contracts: [PVM](/smart-contracts/cookbook/eth-dapps/uniswap-v2/core/core-v2-pvm/){target=\_blank} (which compiles Solidity to the Polkadot Virtual Machine via the revive compiler) and EVM (powered by [REVM](https://github.com/bluealloy/revm){target=\_blank}, a Rust implementation of the Ethereum Virtual Machine, which runs standard EVM bytecode with zero modifications). This tutorial follows the EVM path.

With EVM, you deploy the same unmodified Solidity contracts using the same standard Hardhat toolchain you already know. No special compiler plugins, no contract rewrites, and no porting effort. If your project compiles with vanilla Hardhat, it runs on Polkadot Hub through EVM.

This tutorial walks you through cloning, compiling, testing, and deploying [Uniswap V2](https://docs.uniswap.org/contracts/v2/overview){target=\_blank} on Polkadot Hub using Hardhat and TypeScript. By the end, you will have a fully functioning Factory contract, two ERC-20 test tokens, and a trading pair deployed to either a local development node or the Polkadot Hub TestNet.

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

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/core/core-v2/compilation-output.html'

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

    --8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/core/core-v2/testing-output.html'

!!! tip
    If tests time out, ensure your local development node is running and accessible at `http://127.0.0.1:8545`.

## Deploy the Contracts

After successfully testing the contracts, you can deploy them. The deployment script at `scripts/deploy.ts` deploys the UniswapV2Factory, two test ERC-20 tokens (each with a supply of 10,000 tokens), and creates a trading pair between them.

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

--8<-- 'code/smart-contracts/cookbook/eth-dapps/uniswap-v2/core/core-v2/deployment-output.html'

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Hardhat on Polkadot__

    ---

    Learn how to create, compile, test, and deploy smart contracts on Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Reference](/smart-contracts/dev-environments/hardhat/)

</div>

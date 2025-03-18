---
title: Smart Contracts
description: Learn about smart contract development in Polkadot using ink! for Wasm contracts and EVM and PolkaVM support for Solidity contracts on Asset Hub and parachains.
template: index-page.html
---

# Smart Contracts

Polkadot allows scalable execution of smart contracts offering cross-chain compatibility and lower fees compared to legacy L1 platforms. Polkadot offers developers flexibility in building smart contracts, supporting both Solidity contracts executed either by the [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design#polkavm){target=\_blank} or by the EVM (Ethereum Virtual Machine), and Wasm-based contracts using [ink!](https://use.ink/){target=\_blank} (written in Rust).

This section guides you through the tools, resources, and guides for building and deploying smart contracts on parachains. [Parachains](/polkadot-protocol/architecture/parachains/overview/){target=\_blank} are specialized blockchains connected to the relay chain, benefiting from shared security and interoperability. Depending on your language and environment preference, you can develop contracts using Wasm/ink! or EVM-based solutions.

## Smart Contract Development Process

Follow this step-by-step process to develop and deploy smart contracts in the Polkadot ecosystem:

[timeline(polkadot-docs/.snippets/text/develop/smart-contracts/index/index-timeline.json)]

## Steps Breakdown

### 1. Choose a Smart Contract Platform

Select from one of these platforms based on your project needs:

- [**PolkaVM (Asset Hub)**](/develop/smart-contracts/overview#native-smart-contracts){target=\_blank} - Native smart contracts on Polkadot's system parachain
- [**EVM (Parachain-based)**](/develop/smart-contracts/overview#parachain-contracts){target=\_blank} - Ethereum Virtual Machine compatibility on parachains
- [**Wasm (ink!)**](/develop/smart-contracts/overview#wasm-ink){target\_blank} - WebAssembly contracts using Rust and ink!

### 2. Get Network Configuration Details

Configure your development environment with the appropriate network settings:

- **PolkaVM** - [Connect to Asset Hub](/develop/build/polkadot-asset-hub){target=\_blank}

- **EVM**

    - [Moonbeam Documentation](https://docs.moonbeam.network/){target=\_blank}
    - [Astar Documentation](https://docs.astar.network/){target=\_blank}
    - [Acala Documentation](https://guide.acalanetwork.com/){target=\_blank}

- **Wasm (ink!):** - depends on those parachains that implement `pallet-contracts`, for more information check the [ink! documentation](https://use.ink/how-it-works#why-include-pallet-contracts-on-a-parachain){target=\_blank}

### 3. Set Up Your Development Environment

Install and configure the necessary tools and frameworks:

- **PolkaVM/EVM:** [Development Environments](/develop/smart-contracts/dev-environments/){target=\_blank}
- **ink!:** [Development Environment Setup](https://use.ink/getting-started/setup){target=\_blank}

### 4. Write, Compile, Test, and Deploy Your Contracts

Develop your smart contracts and deploy them:

- **Writing Solidity Contracts (PolkaVM/EVM)** - [Solidity Development Guide](https://docs.soliditylang.org/en/v0.8.29/introduction-to-smart-contracts.html){target=\_blank}
- **Using Remix IDE and Hardhat** - [EVM Development Frameworks](/develop/smart-contracts/dev-environments/){target=\_blank}
- **Writing ink! Smart Contracts** - [ink! Contract Structure](https://use.ink/basics/contract-structure){target=\_blank}

### 5. Interact With Your Deployed Contracts

Integrate your contracts into applications:

- **PolkaVM/EVM Libraries:** [Contract Libraries](/develop/smart-contracts/libraries/)
- **ink! Interaction:** [Contract Interaction](https://use.ink/basics/contract-interaction)

## In This Section

:::INSERT_IN_THIS_SECTION:::

## Additional Resources

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Smart Contracts Overview__

    ---

    Check out the Smart Contracts overview in the Polkadot ecosystem.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/overview)

-   <span class="badge external">External</span> __View the Official ink! Documentation__

    ---

    Learn everything you need to know about developing smart contracts with ink!.

    [:octicons-arrow-right-24: Reference](https://use.ink/){target=\_blank}

</div>

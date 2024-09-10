---
title: Smart Contracts
description: Learn how to navigate the smart contract aspect of the Polkadot ecosystem, including available languages (Solidity, ink), platforms, and compilation targets.
---

Polkadot doesn't support smart contracts natively. Rather, parachains secured by Polkadot are equipped with the functionality to support smart contracts.

The two primary supported smart contract environments are [ink!](#ink) and EVM. There are multiple [parachains that support both environments](#parachains).

## Developing a Smart Contract Versus a Parachain

[When should one build a Substrate (Polkadot SDK) runtime versus a Substrate (Polkadot SDK) smart contract](https://stackoverflow.com/a/56041305){target=\_blank}?
This post answers the question more technically of when a developer might choose to develop a
runtime versus a smart contract.

### Layer of Abstraction

When you write a smart contract, you are creating the instructions that associate with and deploy on
a specific chain address.

In comparison, a runtime module on a parachain is the entire logic of a chain's state transitions
(what's called a state transition function).

Smart contracts must consciously implement a path to upgrading in the future, while parachains have the ability to swap
out their code through a forkless upgrade.

When you build a smart contract, it will eventually be deployed to a target chain with its own
environment. Parachains allow the developer to declare the environment of their own chain, even
allowing others to write smart contracts for it.

### Gas Fees

Smart contracts must find a way to limit their own execution, or else full nodes are vulnerable to DOS attacks. An infinite loop in a smart contract, for example, could consume the computational resources of an entire chain, preventing others from using it. The [halting problem](https://en.wikipedia.org/wiki/Halting_problem){target=\_blank} shows that even with a powerful enough language, it is impossible to know ahead of time whether or not a program will ever cease execution. Some platforms, such as Bitcoin, get around this constraint by providing a very restricted scripting language. Others, such as Ethereum, "charge" the smart contract "gas" for the rights to execute their code. If a smart contract does get into a state where execution will never halt, it eventually runs out of gas, ceases execution, and any state transition that the smart contract would have made is rolled back.

Parachains can implement arbitrarily powerful programming languages and contain no gas notion for their own native logic. This means that some functionality is easier to implement for the developer, but some constructs, such as a loop without a terminating condition, should _never_ be implemented. Leaving certain logic, such as complex loops that could run indefinitely, to a non-smart contract layer, or even trying to eliminate it, will often be a wiser choice. Parachains try to be proactive, while smart contract platforms are event-driven.

Polkadot and its parachains typically use the _weight-fee model_ and not a _gas-metering model_.

## Building a Smart Contract

The relay chain doesn't natively support smart contracts. However, since the parachains that connect to can support arbitrary state transitions, they support smart contracts.

The Polkadot SDK presently supports smart contracts out-of-the-box in several ways:

- The EVM pallet offered by [Frontier](https://github.com/paritytech/frontier){target=\_blank}
- The [Contracts pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/contracts/){target=\_blank} in the FRAME library for Wasm-based contracts

### Frontier EVM Contracts

[Frontier](https://github.com/paritytech/frontier) is the suite of tools that enables a Substrate chain to run Ethereum contracts (EVM) natively with the same API/RPC interface, Ethereum exposes on Substrate. Ethereum Addresses can also be mapped directly to and from Substrate's SS58 scheme from existing accounts.

<!-- TODO: add info about the different pallets -->

### Contracts Pallet

The experience of deploying to an EVM-based chain may be more familiar to developers that have
written smart contracts before. However, the Contracts pallet makes some notable improvements to the
design of the EVM:

1. **Wasm**. The Contracts pallet uses WebAssembly as its compilation target. Any language that
   compiles to Wasm can potentially be used to write smart contracts. Nevertheless, it is better to
   have a dedicated domain-specific language, and for that reason Parity offers the [ink!](#ink)
   language.

2. **Deposit**. Contracts must hold a deposit (named _ContractDeposit_ ) suitably large enough in
   order to justify their existence on-chain. The developer needs to deposit this into the new contract
   on top of the _ExistentialDeposit_.

3. **Caching**. Contracts are cached by default and therefore means they only need to be deployed
   once and afterward be instantiated as many times as you want. This helps to keep the storage load
   on the chain down to the minimum. On top of this, when a contract is no longer being used and the
   _existential deposit_ is drained, the code will be erased from storage (known as reaping).

#### Storage Rent: Deprecated

`pallet_contracts` was initially designed to combat unbounded state growth by charging contracts for
the state they consume but has since been deprecated.

See the associated [pull request](https://github.com/paritytech/substrate/pull/9669){target=\_blank} for more
details.

### Ink

[ink!](https://github.com/use-ink/ink) is a domain specific language for writing smart contracts
in Rust and compiles to Wasm code.

Here is the list of current resources available to developers who want to get started writing smart
contracts to deploy on parachains based on Substrate.

- [ink!](https://use.ink/){target=\_blank} - Polkadot's "native" smart contract stack, based on WebAssembly
- [OpenBrush](https://docs.openbrush.io/){target=\_blank}: an `ink!` library providing standard contracts based on [PSP](https://github.com/w3f/PSPs){target=\_blank} with useful contracts and macros for building
- [ink!athon](https://inkathon.xyz/){target=\_blank}: Starter kit for full-stack dApps with ink! smart contracts and frontend

ink! has laid much of the groundwork for a new smart contract stack that is based on a Wasm virtual
machine and compatible with Substrate chains.

## Smart Contract Environments

Many smart contract platforms are building to become a parachain in the ecosystem. A community created and maintained list of different smart contract platforms can be found at [PolkaProjects](https://www.polkaproject.com/#/projects?cateID=1&tagID=6){target=\_blank}. Additionally, information about ink smart contracts can be accessed at [use.ink](https://use.ink/#where-can-i-deploy-ink-contracts){target=\_blank}.

#### Moonbeam

- ink!: **Unsupported**
- EVM (Solidity): [**Supported**](https://moonbeam.network/networks/moonbeam/){target=\_blank}

[Moonbeam](https://moonbeam.network/){target=\_blank} is another project that is planning to deploy to Polkadot as a
parachain and will support Ethereum compatible smart contracts. Since Moonbeam uses
[Frontier](https://github.com/paritytech/frontier){target=\_blank}, an interoperability layer with existing Ethereum
tooling, it will support all applications that are written to target the EVM environment with little
friction.

[Moonriver](https://docs.moonbeam.network/networks/moonriver/){target=\_blank}, a companion network to Moonbeam,
launched as a parachain on Kusama. Parachain functionality is live, and features are being
incrementally released. The final phase of the launch will include EVM functionality and balance
transfers.

Try deploying a smart contract to Moonbeam by following their [documentation](https://docs.moonbeam.network/){target=\_blank}.

#### Astar

- ink!/Wasm: [**Supported**](https://docs.astar.network/docs/build/#wasm-smart-contracts){target=\_blank}
- EVM (Solidity): [ **Supported**](https://docs.astar.network/docs/build/#evm-smart-contracts){target=\_blank}

[Astar Network](https://astar.network/){target=\_blank} supports the building of dApps with EVM and Wasm smart
contracts and offers developers true interoperability. True interoperability with cross-consensus
messaging [XCM](https://wiki.polkadot.network/docs/learn-xcm){target=\_blank} and cross-virtual machine
[XVM](https://github.com/AstarNetwork/){target=\_blank}. We are made by developers and for developers. Astar’s
unique Build2Earn model empowers developers to get paid through a dApp staking mechanism for the
code they write and dApps they build.

[Shiden Network](https://shiden.astar.network/){target=\_blank} is the canary network of Astar Network, live as a
parachain on Kusama, and supports the EVM and Wasm environment for all developers who want to build
out use-cases in a canary network with economic value. Shiden acts as a playground for developers.

Try deploying an Ethereum or ink! smart contract by following their
[documentation](https://docs.astar.network/){target=\_blank}.

#### Acala

- ink!: **Unsupported**
- EVM (Solidity): [**Supported**](https://wiki.acala.network/build/development-guide){target=\_blank}

[Acala](https://acala.network/){target=\_blank} is a decentralized finance consortium and DeFi infrastructure chain
delivering a set of protocols to serve as the DeFi hub on Polkadot.
[Karura](https://acala.network/karura){target=\_blank}, Acala's canary network is live as a parachain on Kusama.
Interested teams are now able to deploy DApps and smart contracts on Karura's platform. Acala is
also implementing the [Acala EVM](https://wiki.acala.network/learn/acala-evm/why-acala-evm){target=\_blank}.

Try deploying an Acala EVM smart contract by following their [documentation](https://wiki.acala.network/build/development-guide/smart-contracts){target=\_blank}.

#### Phala

- ink!: **Unsupported**
- EVM (Solidity): **Unsupported**
- See: [**Phat Contracts**](https://docs.phala.network/developers/phat-contract){target=\_blank} powered by ink!

[Phala](https://phala.network){target=\_blank} is an off-chain trustless compute infrastructure that provides fully
verifiable computation. Using [Phat contracts](https://docs.phala.network/developers/phat-contract){target=\_blank},
developers can write smart contracts that can interact with web2 services.
[Khala](https://phala.network/en/khala){target=\_blank} is Phala's canary network and is live as a parachain on
Kusama.

Try deploying a smart contract that interacts with Etherscan's web2 API by following their
[documentation](https://docs.phala.network/developers/build-on-phat-contract/create-contract){target=\_blank}.

#### Darwinia

- ink!: **Unsupported**
- EVM (Solidity) Support:
  [**Supported**](https://docs.darwinia.network/libraries-4a4ce70014ba43b7977aeb16ce9634ab){target=\_blank}

[Darwinia](https://darwinia.network/) is a community-run technology and service powering the
cross-chain capabilities of decentralized applications. By crafting secure and efficient cross-chain
messaging protocols, Darwinia is at the forefront of facilitating seamless communication between
disparate blockchain networks. The newest addition to the suite of protocols is `Darwinia Msgport`,
an innovative messaging abstraction that has been successfully implemented across a wide array of
mainstream smart contract platforms, broadening the potential for interoperability and enabling
developers to create more versatile and connected blockchain ecosystems.

Try deploying a smart contract to Darwinia by following their
[documentation](https://docs.darwinia.network/dapp-development-4b021f21c52d474aa08a8109eb55bbd1){target=\_blank}.
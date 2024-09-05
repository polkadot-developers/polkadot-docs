---
title: Glossary
description: Glossary of terms used within the Polkadot ecosystem, Polkadot SDK, its subsequent libraries, and other relevant web3 terminology.  
---

This glossary defines and explains concepts and terminology specific to blockchain technology within the Polkadot ecosystem.

Other useful glossaries throughout the ecosystem can be found below:

- [Polkadot Wiki Glossary](https://wiki.polkadot.network/docs/glossary){target=\_blank}
- [Polkadot SDK Glossary](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/glossary/index.html){target=\_blank}

## Authority

A generic term for the role in a blockchain that can participate in the consensus mechanism(s). In [GRANDPA](#grandpa), the authorities vote on chains they consider final. In [BABE](#blind-assignment-of-blockchain-extension-babe), the authorities are [block authors](#block-author). Authority sets can be chosen to be mechanisms such as Polkadot's [Nominated Proof of Stake (NPoS)](#nominated-proof-of-stake-npos) algorithm.

## Authority Round (Aura)

A deterministic [consensus](#consensus) protocol where block production is limited to a rotating list of [authorities](#authority) that take turns creating blocks.
With authority round (Aura) consensus, the majority of online authorities are assumed to be honest.

Learn more by reading [the official wiki article](https://openethereum.github.io/Aura){target=\_blank} for the Aura consensus algorithm.

The Aura protocol is often used in combination with [GRANDPA](#grandpa) as a [hybrid consensus](#hybrid-consensus) protocol where [Aura](#aura) is used for block production and short-term probabilistic finality, with deterministic finality provided by [GRANDPA](#grandpa).

## Blind Assignment of Blockchain Extension (BABE)

A [block authoring](#block-author) protocol similar to [Aura](#aura).
However, with BABE (Blind Assignment of Blockchain Extension), [authorities](#authority) win [slots](#slot) based on a VRF (verifiable random function) as opposed to the round-robin selection method.
The winning authority can select a chain and submit a new block for it.

Learn more about BABE by referring to its [official Web3 Foundation research document](https://research.web3.foundation/Polkadot/protocols/block-production/Babe){target=\_blank}.

## Block Author

Describes the node that is responsible for the creation of a block.
Block authors are also referred to as _block producers_.
In a Proof of Work (PoW) blockchain, these nodes are called _miners_.

## Byzantine Fault Tolerance (BFT)

Defines the ability of a distributed computer network to remain operational if a certain proportion of its [nodes](#node) or [authorities](#authority) are defective or behaving maliciously.
Typically, a distributed network is considered Byzantine fault tolerant if it can remain functional, with up to one-third of nodes assumed to be defective, offline, actively malicious, and part of a coordinated attack.

### Byzantine Failure

The loss of a network service due to node failures that exceed the proportion of nodes required to reach consensus.

### Practical Byzantine Fault Tolerance (pBFT)

An early approach to Byzantine fault tolerance (BFT), practical Byzantine fault tolerance (pBFT) systems tolerate Byzantine behavior from up to one-third of participants.
The communication overhead for such systems is `O(n²)`, where `n` is the number of nodes (participants) in the system.

## Call

In a general context, a call describes the act of invoking a function to be executed.
In the context of pallets that contain functions to be dispatched to the runtime, `Call` is an enumeration data type that describes the functions that can be dispatched with one variant per pallet. The object that a `Call` represents is a [dispatch](#dispatchable) data structure.

## Chain Specification 

A chain specification is used to define a network built using the Polkadot SDK, and is used by nodes. A chain specification file defines the set of properties that are required to run the node as part of an active, or new, network. It often contains the initial genesis runtime code, network properties (such as the name of the network), the initial state for some pallets, and the bootnode list.

## Collator

An [author](#block-author) of a [parachain](#parachain) network.
They aren't [authorities](#authority) in themselves, as they require a [relay chain](#relay-chain) to coordinate [consensus](#consensus).
More details are found on the [Polkadot Wiki on collators](https://wiki.polkadot.network/docs/learn-collator){target=\_blank}.

## Consensus

In the context of a blockchain, consensus is the process nodes use to agree on the canonical fork of a chain. Consensus is composed of [authorship](#block-author), finality, and [fork-choice rule](#fork-choice-rulestrategy).

In the Polkadot ecosystem, these are usually three components are separated from one another, and the term consensus often refers specifically to authorship.
In the context of a Substrate node, the term _consensus engine_ describes the node subsystem that is responsible for consensus tasks.

See also [hybrid consensus](#hybrid-consensus).

## Consensus Algorithm

An algorithm that ensures that a set of [actors](#authority)—who don't necessarily trust each other—can reach an agreement about the state as the result of some computation.
Most consensus algorithms assume that up to one-third of the actors or nodes can be [Byzantine fault tolerant](#byzantine-fault-tolerance-bft).

Consensus algorithms are generally concerned with ensuring two properties:

- **safety** - indicating that all honest nodes eventually agreed on the state of the chain
- **liveness** - indicating the ability of the chain to keep progressing

For detailed information about the consensus strategies of the [Polkadot network](#polkadot-network), see the [Polkadot Consensus](https://polkadot.network/polkadot-consensus-part-1-introduction/){target=\_blank} blog series.

See also [hybrid consensus](#hybrid-consensus).

## Collective

Most often used to refer to an instance of the [Collective pallet](#collective) on Substrate-based networks such as [Kusama](#kusama) or [Polkadot](#polkadot) if the Collective pallet is part of the [FRAME](#frame)-based [runtime](#runtime) for the network.
A council primarily serves to optimize and balance the more inclusive referendum system.

## Development Phrase

A [mnemonic phrase](https://en.wikipedia.org/wiki/Mnemonic#For_numerical_sequences_and_mathematical_operations){target=\_blank} that is intentionally made public.
All of the well-known development accounts—Alice, Bob, Charlie, Dave, Eve, and Ferdie—are generated from the same secret phrase.
The secret phrase is:

```
bottom drive obey lake curtain smoke basket hold race lonely fit walk
```

Many tools in the Substrate ecosystem, such as [`subkey`](https://github.com/paritytech/polkadot-sdk/tree/HEAD/substrate/bin/utils/subkey){target=\_blank}, allow you to implicitly specify an account using a derivation path such as `//Alice`.

## Digest

An extensible field of the [block header](#header) that encodes information needed by several actors in a blockchain network including:

- [Light clients](#light-client) for chain synchronization
- Consensus engines for block verification
- The runtime itself in the case of pre-runtime digests

## Dispatchable

Dispatchables are function objects that act as the entry points in FRAME [pallets](#pallet). They can be called by internal or external entities to interact with the blockchain’s state. They are a core aspect of the runtime logic, handling [transactions](#transaction) and other state-changing operations.

## Events

A means of recording, for the benefit of the offchain world, that some particular [state](#state) transition happened.
In the context of [FRAME](#frame), events are a composable data types that each [pallet](#pallet) can individually define.
Events in FRAME are implemented as a set of transient storage items that are inspected immediately after a block has executed and reset during block-initialization.

## Executor

A means of executing a function call in a given [runtime](#runtime) with a set of dependencies.
There are two orchestration engines in Substrate, _WebAssembly_ and _native_.

- The _native executor_ uses a natively compiled runtime embedded in the node to execute calls. This is a performance optimization that up-to-date nodes can take advantage of

- The _WebAssembly executor_ uses a [Wasm](#webassembly-wasm) binary and a Wasm interpreter to execute calls
  
The binary is guaranteed to be up-to-date regardless of the version of the blockchain node because it is persisted in the [state](#state) of the Substrate-based chain.

## Extrinsic

An extrinsic is a general term for a piece of data that is originated outside of the runtime, included into a block and leads to some action. This includes user-initiated transactions as well as inherent transactions which are placed into the block by the block-builder.

It is a SCALE-encoded array typically consisting of a version number, signature, and varying data types indicating the resulting runtime function to be called. Extrinsics take two forms: [inherent](#inherent-transactions) and [transactions](#transaction). For more technical details, see the [Polkadot spec](https://spec.polkadot.network/#id-extrinsics){target=\_blank}.

## Existential Deposit

The minimum balance an account is allowed to have in the [Balances pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/index.html){target=\_blank}.
Accounts cannot be created with a balance less than the existential deposit amount.
If an account balance drops below this amount, the Balances pallet uses [a FRAME System API](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.dec_ref){target=\_blank} to drop its references to that account.
If all of the references to an account are dropped, the account can be [reaped](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.allow_death){target=\_blank}.

## Fork Choice Rule/Strategy

A fork choice rule (or strategy) helps determine which chain is valid when reconciling amongst several forks within a network. A common fork choice rule is the [longest chain](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/struct.LongestChain.html){target=\_blank}, which the chain with the highest number of blocks gets selected.

## FRAME (Framework for Runtime Aggregation of Modularized Entities)

An acronym for the _Framework for Runtime Aggregation of Modularized Entities_ that enables developers to create blockchain [runtime](#runtime) environments from a modular set of components called [pallets](#pallet).  It utilizes a set of procedural macros to construct runtimes.

[Visit the Polkadot SDK docs for more details on FRAME.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank}

## Full Node

It is a node that prunes historical states, keeping only recent finalized block states to reduce storage needs. Full nodes provide current chain state access and allow direct submission and validation of [extrinsics](#extrinsic), maintaining network decentralization.

## Genesis Configuration

A mechanism for specifying the initial state of a blockchain.
By convention, this initial state or first block is commonly referred to as the _genesis state_ or _genesis block_.
The genesis configuration for Substrate-based chains is accomplished by way of a [chain specification](#chain-specification) file.
The chain specification file makes it easy to use a single Substrate codebase as the foundation for multiple independently configured chains.

## GRANDPA

A deterministic finality mechanism for blockchains that is implemented in the [Rust](https://www.rust-lang.org/){target=\_blank} programming language.

The [formal specification](https://github.com/w3f/consensus/blob/master/pdf/grandpa-old.pdf){target=\_blank} is maintained by the [Web3 Foundation](https://web3.foundation/){target=\_blank}.

## Header

The structure that aggregates the information used to summarize a block. A header consists primarily of cryptographic information that is used by [light clients](#light-client) to get a minimally secure but very efficient synchronization of the chain.

## Hybrid Consensus

A blockchain consensus protocol that consists of independent or loosely coupled mechanisms for [block production](#block-author) and finality.
Hybrid consensus allows the chain to grow as fast as probabilistic consensus protocols, such as [Aura](#aura-aka-authority-round) while maintaining the same level of security as [deterministic finality](#deterministic-finality) consensus protocols, such as [GRANDPA](#grandpa).
In general, block production algorithms tend to be faster than finality mechanisms.
Making block production separate from block finalization gives Substrate developers greater control of their chain's performance.

## Inherent Transactions

Inherent transactions, referred to as *inherents*, are a special type of unsigned transaction.  This type of transaction enables a block authoring node to insert information that doesn't require validation directly to a block.

Only the block-authoring node that calls the inherent transaction function can insert data into its block. In general, validators assume the data inserted using an inherent transaction is valid and reasonable even if it can't be deterministically verified.

## JSON-RPC

A stateless, lightweight remote procedure call protocol encoded in JavaScript Object Notation (JSON). JSON-RPC provides a standard way to call functions on a remote system by using JSON.
For Substrate, this protocol is implemented through the [Parity JSON-RPC](https://github.com/paritytech/jsonrpc){target=\_blank} crate.

## Keystore

A subsystem for managing keys for the purpose of producing new blocks.

## Kusama

[Kusama](https://kusama.network/){target=\_blank} is a Substrate-based blockchain that implements a design similar to the [Polkadot network](#polkadot-network).
Kusama is a [canary](https://en.wiktionary.org/wiki/canary_in_a_coal_mine){target=\_blank} network and is referred to as [Polkadot's "wild cousin"](https://wiki.polkadot.network/docs/learn-comparisons-kusama){target=\_blank}.
As a canary network, Kusama is expected to be more stable than a test network like [Westend](#westend), but not as stable as a production network like [Polkadot](#polkadot).

As a canary network, Kusama is controlled by its network participants and is intended to be stable enough to encourage meaningful experimentation.

## Libp2p

A peer-to-peer networking stack that allows use of many transport mechanisms, including WebSockets (usable in a web browser).
Substrate uses the [Rust implementation](https://github.com/libp2p/rust-libp2p){target=\_blank} of the `libp2p` networking stack.

## Light Client

A type of blockchain node that doesn't store the [chain state](#state) or produce blocks.
A light client is capable of verifying cryptographic primitives and exposes a [remote procedure call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call){target=\_blank} server that allows blockchain users to interact with the blockchain network.

## Metadata

Data that provides information about one or more aspects of a system.
The metadata that exposes information about a Substrate blockchain enables you to interact with that system.

## Nominated Proof of Stake (NPoS)

A method for determining [validators](#validator) or _[authorities](#authority)_ based on a willingness to commit their stake to the proper functioning of one or more block-producing nodes.

## Oracle

In a blockchain network, an oracle connects the blockchain to a non-blockchain data source.
Oracles enable the blockchain to access and act upon information from existing data sources and incorporate data from non-blockchain systems and services.

## Origin

A [FRAME](#frame) primitive that identifies the source of a [dispatched](#dispatchable) function call into the [runtime](#runtime).
The FRAME System pallet defines three built-in [origins](#origin).
As a [pallet](#pallet) developer, you can also define custom origins, such as those defined by the [Collective pallet](https://paritytech.github.io/substrate/master/pallet_collective/enum.RawOrigin.html){target=\_blank}.

## Pallet

A module that can be used to extend the capabilities of a [FRAME](#frame)-based [runtime](#runtime).
Pallets bundle domain-specific logic with runtime primitives like [events](#event) and [storage items](#storage-item).

## Paseo

Paseo TestNet provisions testing on Polkadot's "production" runtime, which means less chance of feature/code mismatch when developing parachain apps. Specifically, after the [Polkadot Technical fellowship](https://wiki.polkadot.network/docs/learn-polkadot-technical-fellowship){target=\_blank} proposes a runtime upgrade for Polkadot, this TestNet is updated, giving a period where the TestNet will be ahead of Polkadot to allow for testing.

## Parachain

A parachain is a blockchain that derives shared infrastructure and security from a _[relay chain](#relay-chain)_.
You can learn more about parachains on the [Polkadot Wiki](https://wiki.polkadot.network/docs/en/learn-parachains){target=\_blank}.

## Polkadot network

The [Polkadot network](https://polkadot.network/){target=\_blank} is a blockchain that serves as the central hub of a heterogeneous blockchain network.
It serves the role of the [relay chain](#relay-chain) and supports other chains—the [parachains](#parachain)—by providing shared infrastructure and security.

## Relay Chain

The central hub in a heterogeneous network of multiple blockchains. Relay chains are [blockchains](#blockchain) that provide shared infrastructure and security to the other blockchains—the [parachains](#parachain)—in the network. In addition to providing [consensus](#consensus) capabilities, relay chains also allow parachains to communicate and exchange digital assets without needing to trust one another.

## Rococo

A [parachain](#parachain) test network for the Polkadot network.
The [Rococo](#rococo) network is a Substrate-based blockchain that is an evolving testbed for the capabilities of heterogeneous blockchain networks.

## Runtime

The runtime provides the [state transition function](#state-transition-function-stf) for a node.
In Substrate, the runtime is stored as a [WebAssembly](#webassembly-wasm) binary in the [chain state](#state).

## Slot

A fixed, equal interval of time used by consensus engines such as [Aura](#aura-aka-authority-round) and [BABE](#blind-assignment-of-blockchain-extension-babe).
In each slot, a subset of [authorities](#authority) is permitted—or obliged—to [author](#block-author) a block.

## Sovereign Account

The unique account identifier for each chain in the relay chain ecosystem. It is often used in the context of cross-consensus (XCM) interactions.

The sovereign account for each chain is a root-level account that can only be accessed using the Sudo pallet or through governance.  The account identifier is calculated by concatenating the Blake2 hash of a specific text string and the registered parachain identifier.

The sovereign account is most often used to sign XCM messages that are sent to either the relay chain or other chains in the ecosystem.

## SS58 Address Format

The SS58 address format is a public key address based on the Bitcoin [`Base-58-check`](https://en.bitcoin.it/wiki/Base58Check_encoding){target=\_blank} encoding.
Each Substrate SS58 address uses a `base-58` encoded value to identify a specific account on a specific Substrate-based chain.
These are represented by a `base-58` encoded value to identify a specific account on a specific Substrate chain.
The [canonical `ss58-registry`](https://github.com/paritytech/ss58-registry){target=\_blank} provides additional details about the address format used by different Substrate-based chains, including the network prefix and website used for different networks.

## State Transition Function (STF)

The logic of a blockchain that determines how the state changes when a block is processed.
In Substrate, the state transition function is effectively equivalent to the [runtime](#runtime).

## Storage Item

[FRAME](#frame) primitives that provide type-safe data persistence capabilities to the [runtime](#runtime).
Learn more about storage items in its [reference document in the Polkadot SDK.](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html){target=\_blank}

## Substrate

A flexible framework for building modular, efficient, and upgradeable [blockchains](#blockchain).
Substrate is written in the [Rust](https://www.rust-lang.org/){target=\_blank} programming language and is
maintained by [Parity Technologies](https://www.parity.io/){target=\_blank}.

## Transaction

A type of [extrinsic](#extrinsic) that includes a signature that can be used to verify the account authorizing it inherently or via [signed extensions](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/signed_extensions/index.html){target=\_blank}.

## Transaction Era

A definable period—expressed as a range of block numbers—during which a transaction can be included in a block.
Transaction eras are used to protect against transaction replay attacks in the event that an account is reaped and its replay-protecting nonce is reset to zero.

## Trie (Patricia Merkle Tree)

A data structure that is used to represent sets of key-value pairs.

The Patricia Merkle trie data structure enables the items in the data set to be stored and retrieved using a cryptographic hash. Because incremental changes to the data set result in a new hash, retrieving data is efficient even if the data set is very large. With this data structure, you can also prove whether the data set includes any particular key-value pair without access to the entire data set.

In Polkadot SDK-based blockchains, state is stored in a trie data structure that supports the efficient creation of incremental digests. This trie is exposed to the [runtime](#runtime) as [a simple key/value map](#storage-item) where both keys and values can be arbitrary byte arrays.

## Validator

A validator is a node that participates in the consensus mechanism of the network. Its roles include block production, transaction validation, network integrity, and security maintenance.

## WebAssembly (Wasm)

An execution architecture that allows for the efficient, platform-neutral expression of
deterministic, machine-executable logic.

[WebAssembly](https://webassembly.org/){target=\_blank} can be compiled from many languages, including
the [Rust](http://rust-lang.org/){target=\_blank} programming language.

Substrate-based chains use a WebAssembly binary to provide portable [runtimes](#runtime) that can be included as part of the chain's state.

## Weight

A convention used in Substrate-based blockchains to measure and manage the time it takes to validate a block.
Substrate defines one unit of weight as one picosecond of execution time on reference hardware.

The maximum block weight should be equivalent to one-third of the target block time with an allocation of:

- One-third for block construction
- One-third for network propagation
- One-third for import and verification

By defining weights, you can make trade-offs between the number of transactions per second and the hardware required to maintain the target block time appropriate for your use case.
Because weights are defined in the runtime, you can tune them using runtime updates to keep up with hardware and software improvements.

## Westend

Westend is a Parity-maintained, Substrate-based blockchain that serves as a test network for the [Polkadot network](#polkadot-network).
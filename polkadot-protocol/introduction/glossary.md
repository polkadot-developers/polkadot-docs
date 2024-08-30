---
title: Glossary
description: Glossary of terms used within the Polkadot ecosystem.
---

This glossary defines and explains concepts and terminology specific to blockchain technology within the Polkadot ecosystem.

## Authority

An authority is a generic term for the role in a blockchain that can participate in the consensus mechanism(s). In [GRANDPA](#grandpa), the authorities vote on chains they consider final. In [BABE](#blind-assignment-of-blockchain-extension-babe), the authorities are [block authors](#block-author). Authority sets can be chosen to be mechanisms such as Polkadot's [NPoS](#nominated-proof-of-stake-npos) algorithm.

## Authority Round (Aura)

Deterministic [consensus](#consensus) protocol where [block](#block) production is limited to a rotating list of [authorities](#authority) that take turns creating blocks.
With authority round (Aura) consensus, the majority of online authorities are assumed to be honest.

Learn more by reading [the official wiki article](https://openethereum.github.io/Aura) for the Aura consensus algorithm.

The Aura protocol is often used in combination with [GRANDPA](#grandpa) as a [hybrid consensus](#hybrid-consensus) protocol where [Aura](#aura) is used for block production and short-term [probabilistic finality](#probabilistic-finality), with [deterministic finality](#deterministic-finality) provided by [GRANDPA](#grandpa).

## Blind Assignment of Blockchain Extension (BABE)

A [block authoring](#block-author) protocol similar to [Aura](#aura).
However, with the blind assignment of blockchain extension (BABE) protocol, [authorities](#authority) win [slots](#slot) based on a verifiable random function (VRF) as opposed to the round-robin selection method.
The winning authority can select a chain and submit a new block for it.

Learn more about BABE by referring to its [official Web3 Foundation research document](https://research.web3.foundation/Polkadot/protocols/block-production/Babe).

## Block Author

Describes the [node](#node) that is responsible for the creation of a [block](#block).
Block authors are also referred to as _block producers_.
In a proof-of-work blockchain, these nodes are called _miners_.

## Byzantine Fault Tolerance (BFT)

Defines the ability of a distributed computer network to remain operational if a certain proportion of its [nodes](#node) or [authorities](#authority) are defective or behaving maliciously.
Typically, a distributed network is considered byzantine fault tolerant if it can remain functional with up to one-third of nodes assumed to defective, offline, actively malicious, and acting as part of a coordinated attack.

### Byzantine Failure

The loss of a network service due to node failures that exceed the proportion of nodes required to reach consensus.

### Practical Byzantine Fault Tolerance (pBFT)

An early approach to byzantine fault tolerance. pBFT systems tolerate byzantine behavior from up to one-third of participants.
The communication overhead for such systems is `O(n²)`, where `n` is the number of nodes (participants) in the system.

## Call

In a general context, a call describes the act of invoking a function to be executed.
In the context of pallets that contain functions to be dispatched to the runtime, `Call` is an enumeration data type that describes the functions that can be dispatched with one variant per pallet. The object that a `Call` represents is a [dispatch](#dispatch) data structure or a dispatchable.

## Chain Specification 

A chain specification is used to define a network built using the Polkadot SDK, and is used by nodes. A chain specification file defines the set of properties that are required to run the node as part of an active, or new, network. It often contains the initial genesis runtime code, network properties (i.e., the name of the network), the initial state for some pallets, and the bootnode list.

## Collator

An [author](#block-author) of a [parachain](#parachain) network.
They are not [authorities](#authority) in themselves, as they require a [relay chain](#relay-chain) to coordinate [consensus](#consensus).
More details are found on the [Polkadot Wiki on collators](https://wiki.polkadot.network/docs/learn-collator).

## Consensus

In the context of a [blockchain](#blockchain), consensus is the process nodes use to agree on the canonical [fork](#fork) of a chain.
Consensus is comprised of [authorship](#block-author), [finality](#finality), and [fork-choice rule](#fork-choice-rulestrategy).

In the Substrate ecosystem, these three components are separated from one another, and the term consensus often refers specifically to authorship.
In the context of a Substrate [node](#node), the term **consensus engine** describes the node subsystem that is responsible for consensus tasks.

See also [hybrid consensus](#hybrid-consensus).

## Consensus Algorithm

An algorithm that ensures that a set of [actors](#authority)—who don't necessarily trust each other—can reach agreement about state as the result of some computation.
Most consensus algorithms assume that up to one-third of the actors or nodes can be [byzantine fault tolerant](#byzantine-fault-tolerance-bft).

Consensus algorithms are generately concerned with ensuring two properties:

- **safety** indicating that all honest nodes eventually agreed on the state of the chain.
- **liveness** indicating the ability for the chain to keep making progress.

For detailed information about the consensus strategies of the [Polkadot network](#polkadot-network), see the [Polkadot Consensus](https://polkadot.network/polkadot-consensus-part-1-introduction/) blog series.

See also [hybrid consensus](#hybrid-consensus).

## Collective

Most often used to refer to an instance of the [Collective pallet](#collective) on Substrate-based networks such as [Kusama](#kusama) or [Polkadot](#polkadot) if the Collective pallet is part of the [FRAME](#frame)-based [runtime](#runtime) for the network.
A council primarily serves to optimize and balance the more inclusive referendum system.

## Dev Phrase

A [mnemonic phrase](https://en.wikipedia.org/wiki/Mnemonic#For_numerical_sequences_and_mathematical_operations) that is intentionally made public.
All of the well-known development accounts—Alice, Bob, Charlie, Dave, Eve, and Ferdie—are generated from the same secret phrase.
The secret phrase is:
`bottom drive obey lake curtain smoke basket hold race lonely fit walk`

Many tools in the Substrate ecosystem, such as [`subkey`](https://github.com/paritytech/polkadot-sdk/tree/HEAD/substrate/bin/utils/subkey), allow you to implicitly specify an account using a derivation path such as `//Alice`.

## Digest

An extensible field of the [block header](#header) that encodes information needed by several actors in a blockchain network including:

- [Light clients](#light-client) for chain synchronization.
- Consensus engines for block verification.
- The runtime itself in the case of pre-runtime digests.

## Dispatch

The execution of a function with a predefined set of arguments.
In the context of [runtime](#runtime) development with [FRAME](#frame), a dispatch takes pure data—the [`Call`](#call) type—and uses that data to execute a published function in a runtime module ([pallet](#pallet)) with predefined arguments.
The published functions take one additional parameter, known as [`origin`](#origin), that allows the function to securely determine the provenance of its execution.

## Events

A means of recording, for the benefit of the offchain world, that some particular [state](#state) transition happened.
In the context of [FRAME](#frame), events are a composable data types that each [pallet](#pallet) can individually define.
Events in FRAME are implemented as a set of transient storage items that are inspected immediately after a block has executed and reset during block-initialization.

## Executor

A means of executing a function call in a given [runtime](#runtime) with a set of dependencies.
There are two orchestration engines in Substrate, _WebAssembly_ and _native_.

- The _native executor_ uses a natively compiled runtime embedded in the [node](#node) to execute calls.
  This is a performance optimization that up-to-date nodes can take advantage of.

- The _WebAssembly executor_ uses a [Wasm](#webassembly-wasm) binary and a Wasm interpreter to execute calls.
  The binary is guaranteed to be up-to-date regardless of the version of the blockchain [node](#node) because it is persisted in the [state](#state) of the Substrate-based chain.

## Extrinsic

A SCALE encoded array consisting of a version
number, signature, and varying data types indicating the resulting runtime function to be called,
including the parameters required for that function to be executed. These state changes are invoked
from the outside world, i.e. they are not part of the system itself. Extrinsics take two forms,
"[inherents](#inherent-transactions)" and "[transactions](#transaction)". For more technical details see the
[polkadot spec](https://spec.polkadot.network/#id-extrinsics)

## Existential Deposit

The minimum balance an account is allowed to have in the [Balances pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/index.html).
Accounts cannot be created with a balance less than the existential deposit amount.
If an account balance drops below this amount, the Balances pallet uses [a FRAME System API](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.dec_ref) to drop its references to that account.
If all of the references to an account are dropped, the account can be [reaped](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.allow_death).

## Fork Choice Rule/Strategy

A fork choice rule (or strategy) helps determine which chain is valid when reconciling amongst several forks within a network.  A common fork choice rule is the [longest chain](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/struct.LongestChain.html), which the chain with the highest number of blocks gets selected.

## FRAME

An acronym for the _Framework for Runtime Aggregation of Modularized Entities_ that enables developers to create blockchain [runtime](#runtime) environments from a modular set of components called [pallets](#pallet).  It utilizes a set of procedural macros to construct runtimes.

[Visit the Polkadot SDK docs For more detail on FRAME.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html)

## Full Node

A [node](#node) that is able to synchronize a blockchain securely with all of its available features.  It is able to fully sync blocks, but to a certain point in the past.

## Genesis Configuration

A mechanism for specifying the initial [state](#state) of a [blockchain](#blockchain).
By convention, this initial state or first block is commonly referred to as the **genesis state** or **genesis block**.
The genesis configuration for Substrate-based chains is accomplished by way of a [chain specification](#chain-specification) file.
The chain specification file makes it easy to use a single Substrate codebase as the foundation for multiple independently-configured chains.

## GRANDPA

A [deterministic finality](#deterministic-finality) mechanism for [blockchains](#blockchain) that is implemented in the [Rust](https://www.rust-lang.org/) programming language.
The [formal specification](https://github.com/w3f/consensus/blob/master/pdf/grandpa-old.pdf) is
maintained by the [Web3 Foundation](https://web3.foundation/).

## Header

The structure that aggregates the information used to summarize a [block](#block).
A header consists primarily of [cryptographic](#cryptographic-primitives) information that is used by [light clients](#light-client) to get a minimally-secure but very efficient
synchronization of the chain.

## Hybrid Consensus

A blockchain consensus protocol that consists of independent or loosely-coupled mechanisms for [block production](#block-author) and [finality](#finality).
Hybrid consensus allows the chain to grow as fast as probabilistic consensus protocols, such as [Aura](#aura-aka-authority-round), while maintaining the same level of security as [deterministic finality](#deterministic-finality) consensus protocols, such as [GRANDPA](#grandpa).
In general, block production algorithms tend to be faster than finality mechanisms.
Making block production separate from block finalization gives Substrate developers greater control of their chain's performance.

## Inherent Transactions

Inherent transactions—sometimes referred to as inherents—are a special type of unsigned transaction.
This type of transaction enables a block authoring node to insert information that doesn't require validation directly to a block.
Only the block authoring node that calls the inherent transaction function can insert data into its block.
In general, validators assume the data inserted using an inherent transaction is valid and reasonable even if it can't be deterministically verified.

## JSON-RPC

A stateless, lightweight remote procedure call protocol that is encoded in JSON. JSON-RPC provides a standard way to call functions on a remote system by using JavaScript Object Notation.
For Substrate, this protocol is implemented through the [Parity JSON-RPC](https://github.com/paritytech/jsonrpc) crate.

## Keystore

A subsystem for managing keys for the purpose of producing new blocks.

## Kusama

[Kusama](https://kusama.network/) is a Substrate-based [blockchain](#blockchain) that implements a design similar to the [Polkadot network](#polkadot-network).
Kusama is a [canary](https://en.wiktionary.org/wiki/canary_in_a_coal_mine) network and is referred to as [Polkadot's "wild cousin"](https://wiki.polkadot.network/docs/learn-comparisons-kusama).
As a canary network, Kusama is expected to be more stable than a test network like [Westend](#westend), but not as stable as a production network like [Polkadot](#polkadot).

As a canary network, Kusama is controlled by its network participants and is intended to be stable enough to encourage meaningful experimentation.

## Libp2p

A peer-to-peer networking stack that allows use of many transport mechanisms, including WebSockets (usable in a web browser).
Substrate uses the [Rust implementation](https://github.com/libp2p/rust-libp2p) of the `libp2p` networking stack.

## Light Client

A type of blockchain [node](#node) that does not store the [chain state](#state) or produce blocks.
A light client is capable of verifying [cryptographic primitives](#cryptographic-primitives) and exposes a [remote procedure call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call) server that allows blockchain users to interact with the blockchain network.

## Metadata

Data that provides information about one or more aspects of a system.
The metadata that exposes information about a Substrate [blockchain](#blockchain) enables you to interact with that system.

## Node

A running instance of a blockchain client.
Each node is part of the [peer-to-peer](https://en.wikipedia.org/wiki/Peer-to-peer) network that allows blockchain participants to interact with one another.
Substrate nodes can fill a number of roles in a blockchain network.
For example, the nodes that produce blocks fulfill the [validator](#validator) role for the blockchain.
Nodes that run [light-clients](#light-client) facilitate scalable interactions in resource-constrained environments like [user interfaces](https://github.com/paritytech/substrate-connect) or embedded devices.

## Nominated Proof of Stake (NPoS)

A method for determining [validators](#validator) or _[authorities](#authority)_ based on a willingness to commit their stake to the proper functioning of one or more block producing nodes.

## Oracle

In a blockchain network, an oracle is a mechanism for connecting the blockchain to a non-blockchain data source.
Oracles enable the blockchain to access and act upon information from existing data sources and incorporate data from non-blockchain systems and services.

## Origin

A [FRAME](#frame) primitive that identifies the source of a [dispatched](#dispatch) function call into the [runtime](#runtime).
The FRAME `system` pallet defines three built-in [origins](#origin).
As a [pallet](#pallet) developer, you can also define custom origins, such as those defined by the [Collective pallet](https://paritytech.github.io/substrate/master/pallet_collective/enum.RawOrigin.html).

## Pallet

A module that can be used to extend the capabilities of a [FRAME](#frame)-based [runtime](#runtime).
Pallets bundle domain-specific logic with runtime primitives like [events](#event),
and [storage items](#storage-items).

## Parachain

A parachain is a [blockchain](#blockchain) that derives shared infrastructure and security from a _[relay chain](#relay-chain)_.
You can learn more about parachains on the [Polkadot Wiki](https://wiki.polkadot.network/docs/en/learn-parachains).

## Polkadot network

The [Polkadot network](https://polkadot.network/) is a [blockchain](#blockchain) that serves as the central hub of a heterogeneous blockchain network.
It serves the role of the [relay chain](#relay-chain) and supports other chains—the [parachains](#parachain)—by providing shared infrastructure and security.

## Proof of Finality

Data that can be used to prove that a particular block is finalized.

## Proof of Work

A [consensus](#consensus) mechanism that deters attacks by requiring work on the part of network participants.
For example, some proof-of-work systems require participants to use the [Ethash](#ethash) function to calculate a hash as a proof of completed work.

## Relay Chain

The central hub in a heterogenous network of multiple blockchains.
Relay chains are [blockchains](#blockchain) that provide shared infrastructure and security to the other blockchains—the [parachains](#parachain)—in the network.
In addition to providing [consensus](#consensus) capabilities, relay chains also allow parachains to communicate and exchange digital assets without needing to trust one another.

## Remote Procedure Call (RPC)

A mechanism for interacting with a computer program.
Remote procedure calls enable developers to query the remote computer programs or invoke program logic with parameters they supply.
Substrate nodes expose an RPC server on HTTP and WebSocket endpoints.


## Rococo

A [parachain](#parachain) test network for the Polkadot network.
The Rococco network is a Substrate-based [blockchain](#blockchain) that is an evolving testbed for the capabilities of heterogeneous blockchain networks.

## Runtime

The block execution logic of a blockchain.
The runtime provides the [state transition function](#state-transition-function-stf) for a node.
In Substrate, the runtime is stored as a [WebAssembly](#webassembly-wasm) binary in the [chain state](#state).

## Slot

A fixed, equal interval of time used by consensus engines such as [Aura](#aura-aka-authority-round) and [BABE](#blind-assignment-of-blockchain-extension-babe).
In each slot, a subset of [authorities](#authority) is permitted—or obliged—to [author](#block-author) a [block](#block).

## Sovereign Account

The unique account identifier for each chain in the relay chain ecosystem. It is often used in the context of cross-consensus (XCM) interactions.

The sovereign account for each chain is a root-level that can only be accessed using the Sudo pallet or through governance.
The account identifier is calculated by concatenating the Blake2 hash of a specific text string and the registered parachain identifier.

The sovereign account is most often used to sign XCM messages that are sent to either the relay chain or other chains in the ecosystem.

<!-- TODO: move this to some other relevant page, too long to include here IMO -->

For the relay chain, the parachain account identifier is calculated as the concatenation of (blake2(para+ParachainID) with the hash truncated to the correct length.
For example, the account identifier for the parachain with the parachain identifier of 1012 on the relay chain is:
String to hex para: 0x70617261
Encoded parachain identifier 1012: f4030000

`0x70617261f4030000000000000000000000000000000000000000000000000000`
Account address: 5Ec4AhPc9b6e965pNRSsn8tjTzuKaKambivxcL7Gz9Gne9YB

For other parachains, the parachain account identifier is calculated as the concatenation of (blake2(sibl+ParachainID) with the hash truncated to the correct length.
For example, the account identifier for the parachain with the parachain identifier of 1012 on the relay chain is:
String to hex sibl: 0x7369626c
Encoded parachain identifier 1012: f4030000

0x7369626cf4030000000000000000000000000000000000000000000000000000
Account address: 5Eg2fntREKHYGgoxvRPxtnEYiUadHjdsfNaPsHdmrsJMVugs

## SS58 Address Format

The SS58 address format is a public key address based on the Bitcoin [`Base-58-check`](https://en.bitcoin.it/wiki/Base58Check_encoding) encoding.
Each Substrate SS58 address uses a `base-58` encoded value to identify a specific account on a specific Substrate-based chain.
These are represented by a `base-58` encoded value to identify a specific account on a specific Substrate chain.
The [canonical `ss58-registry`](https://github.com/paritytech/ss58-registry) provide additional details about the address format used by different Substrate-based chains, including the network prefix and website used for different networks.

## State Transition Function (STF)

The logic of a [blockchain](#blockchain) that determines how the state changes when a [block](#block) is processed.
In Substrate, the state transition function is effectively equivalent to the [runtime](#runtime).

## Storage Item

[FRAME](#frame) primitives that provide type-safe data persistence capabilities to the [runtime](#runtime).
Learn more about storage items in its [reference document in the Polkadot SDK.](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html)

## Substrate

A flexible framework for building modular, efficient, and upgradeable [blockchains](#blockchain).
Substrate is written in the [Rust](https://www.rust-lang.org/) programming language and is
maintained by [Parity Technologies](https://www.parity.io/).

## Transaction

A type of [extrinsic](#extrinsic) that includes a signature that can be used to verify the account authorizing it inherently or via [signed extensions](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/signed_extensions/index.html).

## Transaction Era

A definable period—expressed as a range of [block](#block) numbers—during which a transaction can be included in a block.
Transaction eras are used to protect against transaction replay attacks in the event that an account is reaped and its replay-protecting nonce is reset to zero.

## Transaction Pool

A collection of transactions that are not yet included in [blocks](#block) but have been determined to be valid.

A _tagged transaction pool_ is a transaction pool implementation that allows the [runtime](#runtime) to specify whether a given transaction is valid, how it should be prioritized, and how it relates to other transactions in the pool in terms of dependency and mutual-exclusivity.
The tagged transaction pool implementation is designed to be extensible and general enough to express both [unspent transaction output (UTXO)](https://github.com/danforbes/danforbes/blob/master/writings/utxo.md) and account-based transaction models.

## Trie (Patricia Merkle Tree)

A data structure that is used to represent sets of key-value pairs.

The Patricia Merkle trie data structure enables the items in the data set to be stored and retrieved using a cryptographic hash. Because incremental changes to the data set result in a new hash, retrieving data is efficient even if the data set is very large. With this data structure, you can also prove whether the data set includes any particular key-value pair without the access to the entire data set.

In Polkadot SDK-based blockchains, state is stored in a trie data structure that supports the efficient creation of incremental digests.  This trie is exposed to the [runtime](#runtime) as [a simple key/value map](#storage-item) where both keys and values can be arbitrary byte arrays.

## Validator

A semi-trusted—or untrusted but well-incentivized—actor that helps maintain a [blockchain](#blockchain) network.
In Substrate, validators broadly correspond to the [authorities](#authority) running the [consensus](#consensus) system.
In [Polkadot](#polkadot-network), validators also manage other duties such as guaranteeing data availability and validating [parachain](#parachain) candidate [blocks](#block).

## WebAssembly (Wasm)

An execution architecture that allows for the efficient, platform-neutral expression of
deterministic, machine-executable logic.
[WebAssembly](https://webassembly.org/) can be compiled from many languages, including
the [Rust](http://rust-lang.org/) programming language.
Substrate-based chains use a WebAssembly binary to provide portable [runtimes](#runtime) that can be included as part of the chain's [state](#state).

## Weight

A convention used in Substrate-based blockchains to measure and manage the time it takes to validate a block.
Substrate defines one unit of weight as one picosecond of execution time on reference hardware.

The maximum block weight should be equivalent to one-third of the target block time with an allocation of:

- One third for block construction
- One third for network propagation
- One third for import and verification

By defining weights, you can make trade-off decisions between the number of transactions per second and the hardware required to maintain the target block time as appropriate for your use case.
Because weights are defined in the runtime, you can tune them using runtime updates to keep up with hardware and software improvements.

## Westend

Westend is a Parity-maintained, Substrate-based [blockchain](#blockchain) that serves as a test network for the [Polkadot network](#polkadot-network).
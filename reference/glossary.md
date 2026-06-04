---
title: Glossary
description: Glossary of terms used within the Polkadot ecosystem, Polkadot SDK, its subsequent libraries, and other relevant Web3 terminology.
categories: Reference
---

# Glossary

Key definitions, concepts, and terminology specific to the Polkadot ecosystem are included here.

Additional glossaries from around the ecosystem you might find helpful:

- [Polkadot Wiki Glossary](https://wiki.polkadot.com/general/glossary){target=\_blank}
- [Polkadot SDK Glossary](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/glossary/index.html){target=\_blank}

## Alias

A context-specific pseudonym derived from a user's [PoP](#proof-of-personhood-pop) identity via [Ring-VRF](#ring-vrf). Unlinkable across `.dot` domains by default. The same user produces a consistent alias every time they return to the same [Product](#product), but a different alias for any other Product.

## Allowance

An on-chain access-control grant. The chain-level permission that gates publishing or storing data. `pallet-statement-store` records per-account `StatementAllowance` entries (a `max_count` cap on live statements and a `max_size` cap on total bytes). [Bulletin Chain](#bulletin-chain) consumes per-account quotas of transactions and bytes for storage. [Coinage](#coinage) issues periodic free-token allowances to persons. Spam resistance comes from the allowance ceiling rather than from per-transaction fees.

## Asset Hub

[Polkadot](#polkadot)'s system chain for assets, swaps, smart contracts, and EVM-compatible contracts. Hosts the [dotNS](#dotns) contracts, where [`.dot`](#dot-address) names actually live.

## Authority

The role in a blockchain that can participate in consensus mechanisms. 

- **[GRANDPA](#ghost-based-recursive-ancestor-deriving-prefix-agreement-grandpa)**: The authorities vote on chains they consider final.
- **[Blind Assignment of Blockchain Extension](#blind-assignment-of-blockchain-extension-babe) (BABE)**: The authorities are also [block authors](#block-author).

Authority sets can be used as a basis for consensus mechanisms such as the [Nominated Proof of Stake (NPoS)](#nominated-proof-of-stake-npos) protocol.

## Authority Round (Aura)

A deterministic [consensus](#consensus) protocol where block production is limited to a rotating list of [authorities](#authority) that take turns creating blocks. In authority round (Aura) consensus, most online authorities are assumed to be honest. It is often used in combination with [GRANDPA](#ghost-based-recursive-ancestor-deriving-prefix-agreement-grandpa) as a [hybrid consensus](#hybrid-consensus) protocol.

Learn more by reading the official [Aura consensus algorithm](https://openethereum.github.io/Aura){target=\_blank} wiki article.

## Blake2b-256

The cryptographic hash function used pervasively in [Polkadot](#polkadot), for [CIDs](#content-identifier-cid), [statement](#statement)-topic derivation, and content addressing.

## Blind Assignment of Blockchain Extension (BABE)

A [block authoring](#block-author) protocol similar to [Aura](#authority-round-aura), except [authorities](#authority) win [slots](#slot) based on a Verifiable Random Function (VRF) instead of the round-robin selection method. The winning authority can select a chain and submit a new block.

Learn more by reading the Polkadot Wiki page on [BABE](https://wiki.polkadot.com/learn/learn-consensus/#block-production-babe){target=\_blank}.

## Block Author

The node responsible for the creation of a block, also called _block producers_. In a Proof of Work (PoW) blockchain, these nodes are called _miners_.

## Browse

The Polkadot-native channel through which users find published [Products](#product). A curated catalogue surfaced inside the [Hosts](#host) (App and Desktop dashboards), and the destination a developer publishes a Product to once it's ready for end users.

## Bulletin Chain

[Polkadot](#polkadot)'s content-addressed storage [parachain](#parachain). Writes are gated by an explicit on-chain authorization (no token balance for storage). Content is retained ~2 weeks by default and renewable. Powers [Product](#product) bundles, encrypted [chat](#chat) content, profile media, and app assets.

## Byzantine Fault Tolerance (BFT)

The ability of a distributed computer network to remain operational if a certain proportion of its nodes or [authorities](#authority) are defective or behaving maliciously. A distributed network is typically considered Byzantine fault tolerant if it can remain functional, with up to one-third of nodes assumed to be defective, offline, actively malicious, and part of a coordinated attack.

### Byzantine Failure

The loss of a network service due to node failures that exceed the proportion of nodes required to reach consensus.

### Practical Byzantine Fault Tolerance (pBFT)

An early approach to Byzantine fault tolerance (BFT), practical Byzantine fault tolerance (pBFT) systems tolerate Byzantine behavior from up to one-third of participants.

The communication overhead for such systems is `O(n²)`, where `n` is the number of nodes (participants) in the system.

## Call

In the context of pallets containing functions to be dispatched to the runtime, `Call` is an enumeration data type that describes the functions that can be dispatched with one variant per pallet. A `Call` represents a [dispatch](#dispatchable) data structure object.

## Chain Specification 

A chain specification file defines the properties required to run a node in an active or new Polkadot SDK-built network. It often contains the initial genesis runtime code, network properties (such as the network's name), the initial state for some pallets, and the boot node list. The chain specification file makes it easy to use a single Polkadot SDK codebase as the foundation for multiple independently configured chains.

## Chat

The [Polkadot App](#polkadot-app)'s in-App messaging surface. Composes the [Statement Store](#statement-store) (signaling, who's online, message arrival) with the [Bulletin Chain](#bulletin-chain) (encrypted message content). Supports DMs, group chats, file attachments, voice calls, and video calls.

## Coin (in Coinage)

A discrete bearer token object with a power-of-two USD value (denominations from $0.01 to $163.84) and an age counter that increments on every transfer or split. Not a balance. One public key holds at most one coin. Backed 1:1 by an underlying stablecoin.

## Coinage

[Polkadot](#polkadot)'s privacy-preserving payment layer (`pallet-coinage`). Replaces public balances with an anonymous coin system denominated in USD. When Alice sends funds to Bob, the only information revealed is that Alice had enough to cover the transfer. [Products](#product) interact with Coinage only through the abstract Payment API.

## Collator

An [author](#block-author) of a [parachain](#parachain) network.
They aren't [authorities](#authority) in themselves, as they require a [relay chain](#relay-chain) to coordinate [consensus](#consensus).

More details are found on the [Polkadot Collator Wiki](https://wiki.polkadot.com/learn/learn-collator/){target=\_blank}.

## Collective

Most often used to refer to an instance of the Collective pallet on Polkadot SDK-based networks such as [Kusama](#kusama) or [Polkadot](#polkadot) if the Collective pallet is part of the FRAME-based runtime for the network.

## Consensus

Consensus is the process blockchain nodes use to agree on a chain's canonical fork. It is composed of [authorship](#block-author), finality, and [fork-choice rule](#fork-choice-rulestrategy). In the Polkadot ecosystem, these three components are usually separate and the term consensus often refers specifically to authorship.

See also [hybrid consensus](#hybrid-consensus).

## Consensus Algorithm

Ensures a set of [actors](#authority), who don't necessarily trust each other, can reach an agreement about the state as the result of some computation. Most consensus algorithms assume that up to one-third of the actors or nodes can be [Byzantine fault tolerant](#byzantine-fault-tolerance-bft).

Consensus algorithms are generally concerned with ensuring two properties:

- **Safety**: Indicating that all honest nodes eventually agreed on the state of the chain.
- **Liveness**: Indicating the ability of the chain to keep progressing.

## Consensus Engine

The node subsystem responsible for consensus tasks.

For detailed information about the consensus strategies of the [Polkadot](#polkadot) network, see the [Polkadot Consensus](/reference/polkadot-hub/consensus-and-security/pos-consensus/){target=\_blank} blog series.

See also [hybrid consensus](#hybrid-consensus).

## Content Identifier (CID)

An IPFS-compatible identifier derived from the content (multihash + codec). [Bulletin Chain](#bulletin-chain) defaults to Blake2b-256 with the Raw codec. Two identical payloads produce the same CID.

## Coretime

The time allocated for utilizing a core, measured in relay chain blocks. There are two types of coretime: *on-demand* and *bulk*.

On-demand coretime refers to coretime acquired through bidding in near real-time for the validation of a single parachain block on one of the cores reserved specifically for on-demand orders. They are available as an on-demand coretime pool. Set of cores that are available on-demand. Cores reserved through bulk coretime could also be made available in the on-demand coretime pool, in parts or in entirety.

Bulk coretime is a fixed duration of continuous coretime represented by an NFT that can be split, shared, or resold. It is managed by the [Broker pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_broker/index.html){target=\_blank}.

## Cross-Consensus Messaging (XCM)

[Polkadot](#polkadot)'s standard for moving messages and assets between chains. Used for cross-chain [Bulletin Chain](#bulletin-chain) writes initiated from [People Chain](#people-chain), and by the members ring system to distribute ring roots to subscribing [parachains](#parachain).

## DAG-PB

A manifest format used to stitch together the chunks of a large file uploaded to the [Bulletin Chain](#bulletin-chain). When a file is bigger than Bulletin's single-transaction size limit, the SDK splits it into chunks and uploads each one separately, then publishes a DAG-PB manifest that records the order and [CIDs](#content-identifier-cid) of every chunk. Readers fetch the manifest first, then pull the chunks in parallel and reassemble the file locally.

## Derived Sub-Account

A per-[Product](#product) account deterministically derived from the user's identity and the Product's [`.dot`](#dot-address) domain. Each Product sees its own sub-account for the same user, so activity in `app-a.dot` is unlinkable to activity in `app-b.dot` without an explicit cross-domain permission grant. Derivation is computed locally by the [Host](#host), so no round trip to the paired [App](#polkadot-app) is needed to obtain the account.

## Development Phrase

A [mnemonic phrase](https://en.wikipedia.org/wiki/Mnemonic#For_numerical_sequences_and_mathematical_operations){target=\_blank} that is intentionally made public.

Well-known development accounts, such as Alice, Bob, Charlie, Dave, Eve, and Ferdie, are generated from the same secret phrase:

```
bottom drive obey lake curtain smoke basket hold race lonely fit walk
```

Many tools in the Polkadot SDK ecosystem, such as [`subkey`](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/bin/utils/subkey){target=\_blank}, allow you to implicitly specify an account using a derivation path such as `//Alice`.

## Digest

An extensible field of the [block header](#header) that encodes information needed by several actors in a blockchain network, including:

- [Light clients](#light-client) for chain synchronization.
- Consensus engines for block verification.
- The runtime itself, in the case of pre-runtime digests.

## Dimension of Individuality Measurement (DIM)

A way of demonstrating that you're a real, unique person. Each DIM is a separate mechanism a user can complete to build up their personhood score. The PoP Game is the primary DIM in use today. Tattoo verification and in-person meetups have been discussed as future additions.

## Dispatchable

Function objects that act as the entry points in FRAME [pallets](#pallet). Internal or external entities can call them to interact with the blockchain’s state. They are a core aspect of the runtime logic, handling [transactions](#transaction) and other state-changing operations.

## DOT

[Polkadot](#polkadot)'s native mainnet token. Used for [transaction](#transaction) fees, staking, and governance deposits.

## dot Address

A human-readable name in the [dotNS](#dotns) registry on [Asset Hub](#asset-hub), of the form `something.dot`. Resolves to a content reference ([CID](#content-identifier-cid)) pointing at a published [Product](#product) bundle on [Bulletin Chain](#bulletin-chain) (or via an [IPFS](#interplanetary-file-system-ipfs) gateway), plus a wallet address for users.

## DotNS

[Polkadot](#polkadot)'s name service. A suite of smart contracts on [Asset Hub](#asset-hub) that map `.dot` names to on-chain resources, including wallet addresses for users and [CIDs](#content-identifier-cid) for [Products](#product). Architecturally derived from ENS (Ethereum Name Service) and uses the same name-hashing scheme.

## Entropy

Verifiable randomness sourced from chain state, such as block hashes, VRF outputs, or randomness beacons. Useful when fairness has to be checkable by an external party after the fact (lotteries, fair-shuffle games, randomized airdrops), and stronger than a [Product](#product)'s local CSPRNG for that purpose.

## Ephemeral

Short-lived data that exists outside chain blocks and decays after a defined window. [Statements](#statement) ([Statement Store](#statement-store)), [HOP](#handoff-protocol-hop) entries, and [chat](#chat) messages are all ephemeral. They propagate peer-to-peer, expire after a TTL, and never durably commit to the chain itself.

## Events

A means of recording that some particular [state](#state) transition happened.

In the context of [FRAME](#framework-for-runtime-aggregation-of-modularized-entities-frame), events are composable data types that each [pallet](#pallet) can individually define. Events in FRAME are implemented as a set of transient storage items inspected immediately after a block has been executed and reset during block initialization.

## Executor

A means of executing a function call in a given [runtime](#runtime) with a set of dependencies.
There are two orchestration engines in Polkadot SDK, _WebAssembly_ and _native_.

- The _native executor_ uses a natively compiled runtime embedded in the node to execute calls. This is a performance optimization available to up-to-date nodes.

- The _WebAssembly executor_ uses a [Wasm](#webassembly-wasm) binary and a Wasm interpreter to execute calls. The binary is guaranteed to be up-to-date regardless of the version of the blockchain node because it is persisted in the [state](#state) of the Polkadot SDK-based chain.

## Existential Deposit

The minimum balance an account is allowed to have in the [Balances pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/index.html){target=\_blank}. Accounts cannot be created with a balance less than the existential deposit amount. 

If an account balance drops below this amount, the Balances pallet uses [a FRAME System API](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.dec_ref){target=\_blank} to drop its references to that account.

If the Balances pallet reference to an account is dropped, the account can be [reaped](https://paritytech.github.io/substrate/master/frame_system/pallet/struct.Pallet.html#method.allow_death){target=\_blank}.

## Extrinsic

A general term for data that originates outside the runtime, is included in a block, and leads to some action. This includes user-initiated transactions and inherent transactions placed into the block by the block builder.

It is a SCALE-encoded array typically consisting of a version number, signature, and varying data types indicating the resulting runtime function to be called. Extrinsics can take two forms: [inherents](#inherent-transactions) and [transactions](#transaction). 

## Fork Choice Rule/Strategy

A fork choice rule or strategy helps determine which chain is valid when reconciling several network forks. A common fork choice rule is the [longest chain](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/struct.LongestChain.html){target=\_blank}, in which the chain with the most blocks is selected.

## Framework for Runtime Aggregation of Modularized Entities (FRAME)

Enables developers to create blockchain [runtime](#runtime) environments from a modular set of components called [pallets](#pallet). It utilizes a set of procedural macros to construct runtimes.

[Visit the Polkadot SDK docs for more details on FRAME.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank}

## Full Node

A node that prunes historical states, keeping only recently finalized block states to reduce storage needs. Full nodes provide current chain state access and allow direct submission and validation of [extrinsics](#extrinsic), maintaining network decentralization.

## Genesis Configuration

A mechanism for specifying the initial state of a blockchain. By convention, this initial state or first block is commonly referred to as the genesis state or genesis block. The genesis configuration for Polkadot SDK-based chains is accomplished by way of a [chain specification](#chain-specification) file.

## GHOST-based Recursive Ancestor Deriving Prefix Agreement (GRANDPA)

A deterministic finality mechanism for blockchains that is implemented in the [Rust](https://rust-lang.org/){target=\_blank} programming language.

The [formal specification](https://github.com/w3f/consensus/blob/master/pdf/grandpa-old.pdf){target=\_blank} is maintained by the [Web3 Foundation](https://web3.foundation/){target=\_blank}.

## Handoff Protocol (HOP)

A [Substrate](#substrate) node service for [ephemeral](#ephemeral), addressed, peer-to-peer data delivery between users. Like a dead-drop with an expiry timer. A sender deposits data for named recipients, recipients collect, and the data self-destructs after collection or ~24 hours.

## Header

A structure that aggregates the information used to summarize a block. Primarily, it consists of cryptographic information used by [light clients](#light-client) to get minimally secure but very efficient chain synchronization.

## HOLLAR

The placeholder stablecoin currently backing [Coinage](#coinage). Will be replaced by [pUSD](#pusd) once pUSD is available.

## Host

One of the three Polkadot applications ([App](#polkadot-app), [Desktop](#polkadot-desktop), [Web](#polkadot-web)) that load Polkadot [Products](#product) in a [sandboxed](#sandbox) container and mediate every capability the Product uses, including chain calls, storage, signing, and outbound requests.

## Host API

The set of methods a [Host](#host) exposes to the [Products](#product) running inside it. Often used interchangeably with [TrUAPI](#triangle-user-agent-programming-interface-truapi). "Host API" emphasizes the consumer side, "TrUAPI" emphasizes the protocol specification.

## Hybrid Consensus

A blockchain consensus protocol that consists of independent or loosely coupled mechanisms for [block production](#block-author) and finality.

Hybrid consensus allows the chain to grow as fast as probabilistic consensus protocols, such as [Aura](#authority-round-aura), while maintaining the same level of security as deterministic finality consensus protocols, such as [GRANDPA](#ghost-based-recursive-ancestor-deriving-prefix-agreement-grandpa).

## Inherent Transactions

A special type of unsigned transaction, referred to as _inherents_, that enables a block authoring node to insert information that doesn't require validation directly into a block.

Only the block-authoring node that calls the inherent transaction function can insert data into its block. In general, validators assume the data inserted using an inherent transaction is valid and reasonable even if it can't be deterministically verified.

## InterPlanetary File System (IPFS)

The content-addressed delivery layer [Polkadot Web](#polkadot-web)'s host shell can use to fetch a [Product](#product) bundle by [CID](#content-identifier-cid), as an alternative to direct [Bulletin Chain](#bulletin-chain) peer-to-peer fetch.

## JSON-RPC

A stateless, lightweight remote procedure call protocol encoded in JavaScript Object Notation (JSON). JSON-RPC provides a standard way to call functions on a remote system by using JSON.

For Polkadot SDK, this protocol is implemented through the [Parity JSON-RPC](https://github.com/paritytech/jsonrpc){target=\_blank} crate.

## Keystore

A subsystem for managing keys for the purpose of producing new blocks.

## Kusama

[Kusama](https://kusama.network/){target=\_blank} is a Polkadot SDK-based blockchain that implements a design similar to the [Polkadot](#polkadot) network.

Kusama is a [canary](https://en.wiktionary.org/wiki/canary_in_a_coal_mine){target=\_blank} network and is referred to as [Polkadot's "wild cousin."](https://wiki.polkadot.com/learn/learn-comparisons-kusama/){target=\_blank}.

As a canary network, Kusama is expected to be more stable than a test network like [Westend](#westend) but less stable than a production network like [Polkadot](#polkadot). Kusama is controlled by its network participants and is intended to be stable enough to encourage meaningful experimentation.

## libp2p

A peer-to-peer networking stack that allows the use of many transport mechanisms, including WebSockets (usable in a web browser).

Polkadot SDK uses the [Rust implementation](https://github.com/libp2p/rust-libp2p){target=\_blank} of the `libp2p` networking stack.

## Light Client

A type of blockchain node that doesn't store the [chain state](#state) or produce blocks.

A light client can verify cryptographic primitives and provides a [remote procedure call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call){target=\_blank} server, enabling blockchain users to interact with the network.

## Manifest

A JSON file packaged with a [Product](#product)'s bundle that declares the permissions it needs and (for [Polkadot Web](#polkadot-web) Products) the routes and [CIDs](#content-identifier-cid) the [Host](#host) loads. Permissions are declared in the manifest, not requested ad-hoc at runtime.

## Metadata

Data that provides information about one or more aspects of a system.
The metadata that exposes information about a Polkadot SDK blockchain enables you to interact with that system.

## Nominated Proof of Stake (NPoS)

A method for determining [validators](#validator) or _[authorities](#authority)_ based on a willingness to commit their stake to the proper functioning of one or more block-producing nodes.

## Oracle

An entity that connects a blockchain to a non-blockchain data source. Oracles enable the blockchain to access and act upon information from existing data sources and incorporate data from non-blockchain systems and services.

## Origin

A [FRAME](#framework-for-runtime-aggregation-of-modularized-entities-frame) primitive that identifies the source of a [dispatched](#dispatchable) function call into the [runtime](#runtime). The FRAME System pallet defines three built-in [origins](#origin). As a [pallet](#pallet) developer, you can also define custom origins, such as those defined by the [Collective pallet](https://paritytech.github.io/substrate/master/pallet_collective/enum.RawOrigin.html){target=\_blank}.

## Pairing

The one-time cryptographic handshake between [Polkadot Desktop](#polkadot-desktop) and the user's mobile [App](#polkadot-app). Desktop displays a QR code, the App scans it and returns a derived [session public key](#session-public-key) that Desktop stores. The private key never leaves the phone.

## Pallet

A module that can be used to extend the capabilities of a [FRAME](#framework-for-runtime-aggregation-of-modularized-entities-frame)-based [runtime](#runtime).
Pallets bundle domain-specific logic with runtime primitives like [events](#events) and [storage items](#storage-item).

## PAPI

`polkadot-api`. The standard typed TypeScript library for interacting with [Polkadot](#polkadot) chains. The [Product](#product) SDK's chain-client wraps PAPI, so Products use familiar PAPI patterns under the hood.

## Parachain

A parachain is a blockchain that derives shared infrastructure and security from a _[relay chain](#relay-chain)_.
You can learn more about parachains on the [Polkadot Wiki](https://wiki.polkadot.com/learn/learn-parachains/){target=\_blank}.

## PAS

The native token of the [Paseo TestNet](#paseo-testnet). The test-network counterpart to [DOT](#dot). Distributed via the Polkadot Faucet for development.

## Paseo TestNet

The [Polkadot](#polkadot) ecosystem test network. Provisions testing on Polkadot's "production" runtime, which means less chance of feature or code mismatch when developing [parachain](#parachain) apps. After the [Polkadot Technical fellowship](https://wiki.polkadot.com/learn/learn-polkadot-technical-fellowship/){target=\_blank} proposes a runtime upgrade for Polkadot, this TestNet is updated, giving a period where the TestNet is ahead of Polkadot to allow for testing. The network that lives behind the [Polkadot Desktop](#polkadot-desktop) environment called `paseo-next`. Accounts, balances, and identities on Paseo TestNet are isolated from mainnet.

## People Chain

[Polkadot](#polkadot)'s system [parachain](#parachain) for identity, usernames, and [Proof of Personhood](#proof-of-personhood-pop). Hosts the PoP pallet set (`pallet-people`, `pallet-game`, `pallet-score`, `pallet-identity`, `pallet-ubc`, `pallet-airdrop`, `pallet-members`), the [Statement Store](#statement-store) [allowance](#allowance) records, and [Coinage](#coinage).

## Pocket

[Polkadot Desktop](#polkadot-desktop)'s peer-to-peer send flow. Two distinguishing properties. First, [personhood](#proof-of-personhood-pop)-aware addressing (the sender can address a recipient by their personhood, not just an account address). Second, two-sided confirmation (the recipient explicitly accepts or declines on their [App](#polkadot-app)).

## Polkadot

The [Polkadot network](https://polkadot.com/){target=\_blank} is a blockchain that serves as the central hub of a heterogeneous blockchain network. It serves the role of the [relay chain](#relay-chain) and provides shared infrastructure and security to support [parachains](#parachain).

## Polkadot App

The mobile [Host](#host) in the [Triangle](#triangle). Runs on the user's phone, holds the user's private key, performs [Proof of Personhood](#proof-of-personhood-pop) verification, and signs every [transaction](#transaction) a [Product](#product) submits anywhere in the Triangle.

## Polkadot Cloud

Polkadot Cloud is a platform for deploying resilient, customizable and scalable Web3 applications through Polkadot's functionality. It encompasses the wider Polkadot network infrastructure and security layer where parachains operate. The platform enables users to launch Ethereum-compatible chains, build specialized blockchains, and flexibly manage computing resources through on-demand or bulk coretime purchases. Initially launched with basic parachain functionality, Polkadot Cloud has evolved to offer enhanced flexibility with features like coretime, elastic scaling, and async backing for improved performance.

## Polkadot Desktop

The desktop [Host](#host) in the [Triangle](#triangle). A specialized browser that loads Polkadot [Products](#product) by their `.dot` names inside a [sandbox](#sandbox). Never holds private keys. Routes every signing request to the paired mobile [App](#polkadot-app).

## Polkadot Hub

Polkadot Hub is a Layer 1 platform that serves as the primary entry point to the Polkadot ecosystem, providing essential functionality without requiring parachain deployment. It offers core services including smart contracts, identity management, staking, governance, and interoperability with other ecosystems, making it simple and fast for both builders and users to get started in Web3.

## Polkadot SDK

The umbrella project that contains [Substrate](#substrate) (the blockchain framework), Cumulus (the [parachain](#parachain) integration layer that lets a Substrate chain plug into [Polkadot](#polkadot)'s [relay chain](#relay-chain) as a parachain), and the Polkadot node implementation itself, all in one monorepo. Most teams building on Polkadot depend on the Polkadot SDK rather than on Substrate alone, because Cumulus is what makes a Substrate chain a parachain of Polkadot.

## Polkadot Virtual Machine (PVM)

A custom virtual machine optimized for performance, leveraging a RISC-V-based architecture to support Solidity and any language that compiles to RISC-V. Specifically designed for the Polkadot ecosystem, enabling smart contract deployment and execution.

## Polkadot Web

The browser-based [Host](#host) in the [Triangle](#triangle), served at `dot.li`. Loads Polkadot [Products](#product) by their `.dot` names inside a [sandboxed](#sandbox) iframe. Pairs with the user's mobile [App](#polkadot-app) for signing. No installation required.

## PoP Full

The destination [personhood](#proof-of-personhood-pop) tier. Cryptographically proven via the biometric verification flow in the official [Polkadot App](#polkadot-app). PoP Full holders join the active membership ring on the [People Chain](#people-chain) and can generate full [Ring-VRF](#ring-vrf) proofs.

## PoP Lite

The on-ramp [personhood](#proof-of-personhood-pop) tier. Third-party attestation registered in a separate lite-people ring. Supply is governance-bounded for spam resistance. Lite holders can produce lite-ring [Ring-VRF](#ring-vrf) proofs but do not yet hold membership in the full personhood ring.

## PoP Tier

A user's level of [Proof of Personhood](#proof-of-personhood-pop). Currently one of three options: Full (cryptographically proven via biometric verification), Lite (third-party attested, governance-bounded supply), or none. The tier determines which features unlock, including short `.dot` names, UBI eligibility, and free unload tokens. Checked through [Ring-VRF](#ring-vrf) proofs against the corresponding members ring.

## Preimage

A preimage is the data that is input into a hash function to calculate a hash. Since a hash function is a [one-way function](https://en.wikipedia.org/wiki/One-way_function){target=\_blank}, the output (the hash) cannot be used to reveal the input (the preimage). Another way to define it is as off-chain content addressed by hash that an on-chain operation will dereference, for example the bytes of a governance proposal that a referendum points at. This differs from a [Statement](#statement). A preimage is durable (it lives until the referencing operation completes), where a Statement is short-lived gossip.

## Product

A third-party single-page application that runs inside a [Host](#host), addressed by a `.dot` domain, reachable from the outside world only through the [Host API](#host-api). Products cannot hold keys, make arbitrary network requests, or talk to chains directly.

## Proof of Personhood (PoP)

[Polkadot](#polkadot)'s privacy-preserving "real human" check on the [People Chain](#people-chain). Verified once via an in-App video interaction (the PoP Game). The result is registered in `pallet-people`'s membership ring and unlocks personhood-gated features such as TestNet funds, short `.dot` names, and [alias](#alias)-gated checks.

## pUSD

[Polkadot](#polkadot)'s planned native stablecoin on [Asset Hub](#asset-hub). Will eventually back [Coinage](#coinage). Until pUSD is live on TestNet, [HOLLAR](#hollar) is the placeholder backing.

## Recycler

A mixing pool built on [Ring-VRF](#ring-vrf) that breaks the on-chain link between a [coin](#coin-in-coinage)'s deposit and withdrawal. Users load a coin into the recycler, wait for other users to load too (a larger set makes deposits harder to link to withdrawals), then unload anonymously into a fresh coin.

## Relay Chain

Relay chains are blockchains that provide shared infrastructure and security to the [parachains](#parachain) in the network. In addition to providing [consensus](#consensus) capabilities, relay chains allow parachains to communicate and exchange digital assets without needing to trust one another.

## Ring-VRF

The cryptographic primitive at the heart of [PoP](#proof-of-personhood-pop). Lets a verified person prove "I'm one of the recognized persons in this set" without revealing which one. The privacy foundation under [aliases](#alias), [Coinage](#coinage), and airdrops.

## Rococo

A [parachain](#parachain) test network for the Polkadot network. The [Rococo](#rococo) network is a Polkadot SDK-based blockchain with an October 14, 2024 deprecation date. Development teams are encouraged to use the Paseo TestNet instead.

## Runtime

The runtime represents the [state transition function](#state-transition-function-stf) for a blockchain. In Polkadot SDK, the runtime is stored as a [Wasm](#webassembly-wasm) binary in the chain state. The Runtime is stored under a unique state key and can be modified during the execution of the state transition function.

## Sandbox

The [Host](#host)-governed environment a [Product](#product) runs in. Products see [derived sub-accounts](#derived-sub-account) (not the user's root identity), reach the outside world only through the [Host API](#host-api), and are isolated from one another by default. Declared permissions selectively relax this isolation.

## Session Public Key

The derived public key [Desktop](#polkadot-desktop) receives from the mobile [App](#polkadot-app) during [pairing](#pairing). Lets Desktop identify the user and construct per-[Product](#product) sub-accounts, but is never enough to sign on its own. A dev-pairing artifact, unrelated to [validator](#validator) session keys used for block production.

## Shield States

The security-indicator UI in [Polkadot Web](#polkadot-web). Yellow while verifying. Green when confirmed. Orange when content was served via a gateway fallback rather than peer-to-peer. Red when the on-chain record has changed since the cached version was loaded.

## Sign In with Polkadot

The [Host](#host)-level authentication handshake between [Polkadot Desktop](#polkadot-desktop) (or [Web](#polkadot-web)) and the paired [Polkadot App](#polkadot-app). Establishes session identity so the Host can construct per-[Product](#product) sub-accounts. Distinct from per-[transaction](#transaction) signing. Sign In runs once at the start of a session, and signing runs per-transaction.

## Signing Model

Mobile is the signer. [Desktop](#polkadot-desktop) is the mediator. Every [transaction](#transaction) routes from the [Product](#product) through Desktop's signing modal to the paired [App](#polkadot-app), where the user explicitly approves on their phone. The Chain Submit permission gates the ability to request a signing prompt. It never authorizes auto-signing.

## Simple Concatenated Aggregate Little-Endian (SCALE)

The compact binary codec used by [Polkadot SDK](#polkadot-sdk) for on-chain data, RPC messages, and inter-chain payloads. [TrUAPI](#triangle-user-agent-programming-interface-truapi) messages are SCALE-encoded.

## Slot

A fixed, equal interval of time used by consensus engines such as [Aura](#authority-round-aura) and [BABE](#blind-assignment-of-blockchain-extension-babe). In each slot, a subset of [authorities](#authority) is permitted, or obliged, to [author](#block-author) a block.

## Smoldot

The [Polkadot](#polkadot) [light client](#light-client). Used by [Polkadot Web](#polkadot-web)'s host shell to verify chain state in-browser without running a [full node](#full-node). Planned for direct [Statement Store](#statement-store) participation by end-user apps.

## Sovereign Account

The unique account identifier for each chain in the relay chain ecosystem. It is often used in cross-consensus (XCM) interactions to sign XCM messages sent to the relay chain or other chains in the ecosystem.

The sovereign account for each chain is a root-level account that can only be accessed using the Sudo pallet or through governance. The account identifier is calculated by concatenating the Blake2 hash of a specific text string and the registered parachain identifier.

## Sr25519

The default cryptographic signature scheme used across [Polkadot](#polkadot). Schnorr signatures over Ristretto. Used for [transactions](#transaction), [statements](#statement), and [PoP](#proof-of-personhood-pop) proofs.

## SS58 Address Format

A public key address based on the Bitcoin [`Base-58-check`](https://en.bitcoin.it/wiki/Base58Check_encoding){target=\_blank} encoding. Each Polkadot SDK SS58 address uses a `base-58` encoded value to identify a specific account on a specific Polkadot SDK-based chain

The [canonical `ss58-registry`](https://github.com/paritytech/ss58-registry){target=\_blank} provides additional details about the address format used by different Polkadot SDK-based chains, including the network prefix and website used for different networks

## State Transition Function (STF)

The logic of a blockchain that determines how the state changes when a block is processed. In Polkadot SDK, the state transition function is effectively equivalent to the [runtime](#runtime).

## Statement

An [ephemeral](#ephemeral), signed data blob in the [Statement Store](#statement-store). Lives in the node's local pool, not in chain blocks. Carries a payload (up to ~1 MB), one or more topics, an optional channel for last-write-wins replacement, and an authentication proof.

## Statement Store

A network-layer pub/sub primitive on the [People Chain](#people-chain), not a chain in its own right. [Statements](#statement) are signed, [allowance](#allowance)-gated, propagated peer-to-peer through gossip, and decay after a short TTL.

## Storage Item

[FRAME](#framework-for-runtime-aggregation-of-modularized-entities-frame) primitives that provide type-safe data persistence capabilities to the [runtime](#runtime).
Learn more in the [storage items](https://paritytech.github.io/polkadot-sdk/master/frame_support/storage/types/index.html){target=\_blank} reference document in the Polkadot SDK.

## Substrate

The modular [Rust](https://rust-lang.org/){target=\_blank} blockchain framework Polkadot is built on, and now one component of the Polkadot SDK. A Substrate runtime is composed of pallets (reusable modules implementing chain logic — balances, staking, governance, etc.) and uses the SCALE codec for encoding. Substrate is the framework; Polkadot is one chain built with it. Substrate is maintained by [Parity Technologies](https://www.parity.io/){target=\_blank}.

## Transaction

An [extrinsic](#extrinsic) that includes a signature that can be used to verify the account authorizing it inherently or via [signed extensions](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/signed_extensions/index.html){target=\_blank}.

## Transaction Era

A definable period expressed as a range of block numbers during which a transaction can be included in a block.
Transaction eras are used to protect against transaction replay attacks if an account is reaped and its replay-protecting nonce is reset to zero.

## Triangle

Three Polkadot [Hosts](#host) (the [Polkadot App](#polkadot-app) on mobile, [Polkadot Desktop](#polkadot-desktop), and [Polkadot Web](#polkadot-web)) together with the [Products](#product) that run inside them and the [TrUAPI](#triangle-user-agent-programming-interface-truapi) protocol that connects them. The mobile App is always the key custodian. Desktop and Web never hold private keys.

## Triangle User-Agent Programming Interface (TrUAPI)

The protocol that mediates all communication between [Hosts](#host) and [Products](#product). Always capitalized this way. Eleven method groups cover signing, chain interaction, storage, [chat](#chat), payments, and more.

## Trie (Patricia Merkle Tree)

A data structure used to represent sets of key-value pairs and enables the items in the data set to be stored and retrieved using a cryptographic hash. Because incremental changes to the data set result in a new hash, retrieving data is efficient even if the data set is very large. With this data structure, you can also prove whether the data set includes any particular key-value pair without access to the entire data set.

In Polkadot SDK-based blockchains, state is stored in a trie data structure that supports the efficient creation of incremental digests. This trie is exposed to the [runtime](#runtime) as [a simple key/value map](#storage-item) where both keys and values can be arbitrary byte arrays.

## Validator

A validator is a node that participates in the consensus mechanism of the network. Its roles include block production, transaction validation, network integrity, and security maintenance.

## WebAssembly (Wasm)

An execution architecture that allows for the efficient, platform-neutral expression of
deterministic, machine-executable logic.

[Wasm](https://webassembly.org/){target=\_blank} can be compiled from many languages, including
the [Rust](https://rust-lang.org/){target=\_blank} programming language. Polkadot SDK-based chains use a Wasm binary to provide portable [runtimes](#runtime) that can be included as part of the chain's state.

## Weight

A convention used in Polkadot SDK-based blockchains to measure and manage the time it takes to validate a block.
Polkadot SDK defines one unit of weight as one picosecond of execution time on reference hardware.

The maximum block weight should be equivalent to one-third of the target block time with an allocation of one-third each for:

- Block construction
- Network propagation
- Import and verification

By defining weights, you can trade-off the number of transactions per second and the hardware required to maintain the target block time appropriate for your use case. Weights are defined in the runtime, meaning you can tune them using runtime updates to keep up with hardware and software improvements.

## Westend

Westend is a Parity-maintained, Polkadot SDK-based blockchain that serves as a test network for the [Polkadot](#polkadot) network.

---
title: Overview
description: Explore the fundamental concepts of the Polkadot protocol, including account addresses, extrinsics, events and runtime upgrades.
---

# Overview

This page offers a comprehensive introduction to the Polkadot protocol, covering key terminology unique to Polkadot, significant distinctions from other blockchain networks, and practical guidance for interacting with the chain.

!!!note 
    If the information provided below doesn't fully address your questions about the Polkadot protocol, be sure to visit the [Polkadot Specification](https://spec.polkadot.network/id-polkadot-protocol){target=\_blank}.

## Tokens

- Token decimals:
    - Polkadot (DOT): 10
    - Kusama (KSM): 12
- Base unit: "Planck"
- Balance type: `u128`

### Redomination

Polkadot conducted a community poll, which ended on **27 July 2020** at block **888,888** to decide whether to redenominate the DOT token. 

The stakeholders chose to redenominate the token, changing the value of 1 DOT from 1e12 plancks to 1e10 plancks. 

Importantly, this did not affect the total number of base units (plancks) in the network, only how a single DOT is represented.

The redenomination became effective 72 hours after transfers were enabled, occurring at block 1,248,326 on 21 August 2020 around 16:50 UTC.

## Addresses

In Polkadot and most Substrate-based chains, user accounts are represented by a **32-byte (256-bit)** `AccountId`, which is typically — but not always — the public key of a cryptographic key pair.

Polkadot uses the `SS58` address format, a versatile meta-format designed to support various cryptographic schemes and blockchain networks. 

It shares characteristics with Bitcoin's `Base58Check` encoding, such as a version prefix, hash-based checksum, and base-58 encoding, ensuring addresses are network-specific and resistant to errors.

!!!note
    For detailed encoding methods and a comprehensive list of network prefixes, refer to the [`SS58-registry`](https://github.com/paritytech/ss58-registry){target=\_blank} repository 

!!!warning "Do not use regular expressions (regex) to validate addresses"
    Always verify an address using its prefix and checksum to ensure its validity. 
    
    The [**Substrate API Sidecar**](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} offers an endpoint at accounts/{accountId}/validate, which returns a boolean isValid response for any provided address.

### Cryptography

Polkadot supports several [cryptographic](link to cryptography page on our site) key pairs and signing algorithms to enhance security and versatility in transactions. 

The primary types include:

- **Ed25519**: This is a popular signature scheme known for its speed and security, widely used in various blockchain applications.

- **Sr25519**: This utilizes Schnorr signatures on the Ristretto group, providing extra security features, including resistance to certain types of attacks that can affect other signature schemes.

- **ECDSA**: Specifically, Polkadot employs ECDSA signatures on the `secp256k1` curve, a standard in many cryptocurrencies like Bitcoin.

It’s important to note that for `secp256k1` keys, the address is derived from the `SS58` encoding of the hash of the public key. 

This reduces the public key from **33** bytes to **32** bytes, ensuring a more compact representation while maintaining security.

## Extrinsics and Events

### Block Format

In Polkadot, a block is composed of two main components: the **block header** and the **block body**.

#### Block Body

The block body consists of extrinsics, which are a generalized form of transactions.

These extrinsics can include any external data that the blockchain needs to validate and track. 

#### Block Header

The block header contains a 5-tuple with the following elements:

1. `parent_hash`: A 32-byte `Blake2b` hash of the SCALE-encoded parent block header.

2. `number`: An integer that indicates the index of the current block in the chain. This starts at 0 for the genesis block and increments with each new block.

3. `state_root`: The root of the Merkle tree, which acts as the storage root for the system. This data structure allows efficient verification of the state.

4. `extrinsics_root`: This field is reserved for the runtime to validate the integrity of the extrinsics that make up the block body.

5. `digest`: A field used to store auxiliary data relevant to the chain, such as block signatures and information that can assist light clients in interacting with the block without needing full storage access.

When a node creates or receives a new block, it must "gossip" (broadcast) this block to other nodes in the network. 

Other nodes will track these announcements and can request more information about the blocks. 

This mechanism is crucial for maintaining consensus and ensuring all nodes have the most current state of the blockchain.

!!!note
    For more detailed information on how blocks are announced please refer to [Polkadot Spec](https://spec.polkadot.network/chap-networking#sect-msg-block-announce){target=\_blank} documentation 

### Extrinsics

An extrinsic is a [SCALE](https://github.com/paritytech/parity-scale-codec#parity-scale-codec){target=\_blank} encoded array consisting of a `version number`, `signature`, and varying `data` types indicating the resulting runtime function to be called, including the parameters required for that function to be executed.

Extrinsics constitute information from the outside world and take on three forms:

- Inherents
- Signed Transactions
- Unsigned Transactions

As an infrastructure provider, you will deal almost exclusively with signed transactions. You will, however, see other extrinsics within the blocks that you decode as well. 

#### Inherents

Inherent extrinsics are unsigned transactions that contain information based on validators' consensus rather than verifiable truth. 

For example, while a timestamp can't be definitively proven, validators can agree it falls within a reasonable range according to their system clocks. 

Unlike standard transactions, inherent extrinsics are included in blocks produced by validators and are not shared individually throughout the network.

#### Signed Transaction

Signed transactions contain a signature from the account that initiated the transaction. 

This signature verifies the authenticity of the transaction and indicates that the account will pay a fee for its inclusion on the blockchain. 

Because the potential value of signed transactions is identifiable before execution, they can be shared across the network with minimal risk of spam, making them suitable for efficient node communication.

This concept aligns with how transactions function in Ethereum and Bitcoin, where signed transactions are essential for validating and processing operations on the blockchain.

#### Unsigned Transactions

Some transactions require unsigned transactions because they cannot be initiated by an account with sufficient funds to pay fees. 

For instance, when a user claims DOT tokens from an Ethereum DOT indicator contract to a new DOT address, the new address starts with zero funds and cannot cover transaction fees. 

Thus, unsigned transactions are essential in enabling actions in such scenarios, ensuring users can participate without funding limitations.

### Transaction Mortality

Extrinsics can be classified as either **mortal** or **immortal**. 

Each transaction payload includes a block number and a block hash checkpoint, marking the point from which the transaction is valid. 

The validity period, sometimes referred to as "era" indicates the number of blocks after this checkpoint during which the transaction remains valid. 

If the extrinsic isn't included in a block within this timeframe, it will be removed from the transaction queue.

The blockchain only retains a limited number of prior block hashes for reference, known as the `BlockHashCount`. You can query this parameter from the chain state or its metadata. 

If the validity period exceeds the stored blocks, the transaction will only be valid as long as there is a corresponding block available for verification, which means its validity will be capped by the lesser of the validity period or the block hash count.

By setting the block checkpoint to zero (using the genesis hash) and the validity period to zero, you can create an "immortal" transaction that remains valid indefinitely.

!!!note
    If an account is reaped and subsequently re-funded by a user, they could potentially replay an immortal transaction. Therefore, it's always advisable to default to using a mortal extrinsic 

### Unique Identifiers for Extrinsics

!!!warning "Transaction Hash is not a unique identifier"
    The assumption that a transaction's hash is a unique identifier is the number one mistake that indexing services and custodians make. 
    
    This error can cause major issues for your users. Make sure that you read this section carefully.

In Substrate-based chains like Polkadot, assuming a transaction’s hash is a unique identifier, as is common in blockchains like Ethereum, can lead to issues. 

In Polkadot, the transaction hash acts as a fingerprint for the transaction's data. However, it's possible for two transactions with the same hash to be valid under different circumstances. 

If one transaction is deemed invalid, the network automatically handles it, preventing fees from being charged to the sender and excluding it from the block’s capacity.

Imagine this contrived example with a reaped account. The first and last transactions are identical, and both valid.

| Index | Hash | Origin    | Nonce | Call                | Results                       |
|-------|------|-----------|-------|---------------------|-------------------------------|
| 0     | 0x01 | Account A | 0     | Transfer 5 DOT to B | Account A reaped              |
| 1     | 0x02 | Account B | 4     | Transfer 7 DOT to A | Account A created (nonce = 0) |
| 2     | 0x01 | Account A | 0     | Transfer 5 DOT to B | Successful transaction        |

In Substrate-based chains, not every extrinsic originates from a simple public/private key pair account. The dispatch **Origin** concept introduces various contexts in which a signed extrinsic can operate. 

For example, the origin could represent an individual public key, or a collective like a governance body. These origins lack a nonce, unlike typical accounts.

In governance cases, for instance, the same call could be made multiple times (e.g., "increase validator set by 10%"), and although the hash and dispatch data might be identical, the actual execution would depend on the chain's state at each moment of dispatch. This difference highlights that the extrinsic's hash alone isn't a unique identifier.

To uniquely identify an extrinsic in a Substrate chain, the combination of the **block ID** (either height or hash) and the **extrinsic's index** within the block is the correct method. 

Since each block contains an array of extrinsics, an index within a specific block will always pinpoint a unique extrinsic. 

This approach is used within the Substrate framework, such as in [referencing past transactions](https://paritytech.github.io/polkadot-sdk/master/pallet_multisig/struct.Timepoint.html){target=\_blank} in the Multisig pallet.

### Events

Extrinsics represent data coming from external sources, while events represent outcomes or actions initiated by the blockchain itself. Extrinsics often trigger events. 

For instance, in the Staking pallet, claiming rewards triggers a **Reward** event, informing users of the amount credited.

When monitoring transactions for balance deposits, it's essential to watch events, not just specific extrinsics like `balances.transfer`. Multiple extrinsics, such as `balances.transferKeepAlive` or `utility.batch`, can trigger balance changes as well. 

Therefore, monitoring events in each block that involve your addresses ensures accuracy when tracking deposits.

### Fees

Polkadot uses a weight-based fee model, unlike Ethereum's gas system. Transaction fees are calculated and charged before dispatch. The fee is based on the "weight" of a transaction, which measures the computational resources required to process it.

Users also have the option to include a "tip" with their transaction. This tip increases the priority of their transaction during times of network congestion, ensuring faster inclusion in a block.

!!!note
    For more details on fees, please refer to the [Polkadot documentation page](transaction fee page){target=\_blank}.

### Encoding

Parity's integration tools offer a convenient way to handle decoded blockchain data, enabling efficient interaction with the Polkadot network. 

However, if you prefer to bypass these tools and deal directly with the raw chain data, Polkadot uses the [SCALE codec](https://github.com/paritytech/parity-scale-codec#parity-scale-codec){target=\_blank} to encode block and transaction data. 

This allows you to implement your own codecs for custom interactions with the chain if needed.

## Runtime Upgrades

Runtime upgrades allow Polkadot to change the logic of the chain without the need for a hard fork. 

!!!note
    You can find a guide for how to properly perform a runtime upgrade [here](runtime upgrades page).

### Runtime Versioning

There are a number of fields that are a part of the overall `RuntimeVersion`.

Apart the `runtime_version` there is also the `transaction_version` which denotes how to correctly encode/decode calls for a given runtime (useful for hardware wallets). 

The reason `transaction_version` is separate from `runtime_version` is that it explicitly notes that the call interface is broken/not compatible.

## FAQ

**Can an account's balance change without a corresponding, on-chain transaction?**

No, but not all balance changes are in a transaction, some are in events. You will need to run an archive node and listen for events and transactions to track all account activity. This especially applies to locking operations if you are calculating balance as the spendable balance, i.e. free balance minus the maximum lock.

**What chain depth is considered "safe"?**

Polkadot uses a deterministic finality mechanism. Once a block is finalized, it cannot be reverted except by a hard fork. Kusama has had hard forks that had to revert four finalized blocks in order to cancel a runtime upgrade. Using a finalized depth of ten blocks should be safe.

Note that block production and finality are isolated processes in Polkadot, and the chain can have a long unfinalized head.

**Do users need to interact with any smart contracts?**

No, users interact directly with the chain's logic.

**Does Polkadot have state rent?**

No, Polkadot uses the existential deposit to prevent dust accounts and other economic mechanisms like locking or reserving tokens for operations that utilize state.

**What is an external source to see the current chain height?**

[Polkadot-JS explorer](https://polkadot.js.org/apps/#/explorer){target=\_blank}
[Subscan](https://www.subscan.io/git){target=\_blank}

--8<-- 'code/tutorials/tooling/chopsticks/overview/dev-newblock-example.js'
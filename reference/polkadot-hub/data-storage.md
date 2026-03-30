---
title: Data Storage
description: Technical reference for the Polkadot Bulletin Chain, a specialized data storage chain with IPFS-compatible content addressing for the Polkadot ecosystem.
categories: Polkadot Protocol
---

# Data Storage

The Polkadot Bulletin Chain is for storing raw data and files on-chain — images, HTML, JSON, documents, and more. You get back a CID (Content Identifier) and the data is directly retrievable. Think of it as decentralized file hosting built on a Polkadot SDK-based blockchain with [IPFS](https://ipfs.tech/){target=\_blank}-compatible content addressing. The data has a retention period and needs renewal. There are no ownership semantics — it's just storage.

The Bulletin Chain is designed as a utility chain — it has **no native token balances**. Instead, access is managed through an authorization system that grants accounts or preimages the ability to store data. For more details, see the [Polkadot Bulletin Chain repository](https://github.com/paritytech/polkadot-bulletin-chain){target=\_blank}.

## Use Cases

The Bulletin Chain is suited for any scenario where you need decentralized, content-addressable storage on Polkadot. Common use cases include:

- **Static sites**: Host a static website entirely on-chain, served via IPFS-compatible gateways.
- **Images and media assets**: Store images, icons, or other media files with permanent, verifiable CIDs.
- **Application data**: Persist configuration files, metadata, or other structured data that needs to be publicly accessible and tamper-proof.
- **Document storage**: Store documents, certificates, or records that benefit from on-chain verifiability.

## Key Concepts

- **No balances**: The chain does not use token balances for transaction fees. Authorization is required to store data.
- **Authorization-based access**: Accounts must be authorized before they can submit storage transactions.
- **Content Identifiers (CIDs)**: Stored data is addressable via IPFS-compatible CIDs, enabling interoperability with IPFS tooling.
- **Retention periods**: Stored data is retained for a limited period (~2 weeks on Polkadot TestNet) and must be renewed to persist beyond that.
- **Chunked uploads**: Large files (up to ~64 MiB) can be split into chunks, each stored as a separate transaction (max ~8 MiB per transaction).

## Authorization

The Bulletin Chain has no token balances — there are no fees to pay. Instead, storage access is controlled through an authorization system that prevents spam and ensures fair usage. A privileged account must explicitly grant permission before an account can store data.

Authorization is not a token transfer — it's a **permission entry** recorded in the chain's storage that specifies:

- The **account** allowed to store data
- The number of **transactions** and **bytes** the account can use
- An optional **expiration block** after which the authorization becomes invalid

Authorization is consumed as you store data — each storage transaction decrements your remaining transaction count and byte allowance. Once your allocation is used up or the expiration block is reached, you need new authorization. Unused authorization is not refunded.

### Who Grants Authorization

The `authorize_account` and `authorize_preimage` extrinsics require **Root origin**, meaning only privileged accounts can grant authorization. How this works depends on the network:

| Network | Authorization Source |
|:--:|:--:|
| Polkadot TestNet | The [Console UI Faucet](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank} grants authorization for testing |
| Local Development | The `//Alice` account has sudo access for local testing |
| Polkadot Mainnet | The authorization model is being finalized. Check the [Bulletin Chain repository](https://github.com/paritytech/polkadot-bulletin-chain){target=\_blank} for the latest updates |

### Account Authorization

Account authorization grants a specific account the ability to store any data on-chain, up to the allocated transaction and byte limits. This is the most common authorization type for active users.

- Granted via the `authorize_account` extrinsic (Root origin)
- Can be refreshed with `refresh_account_authorization`
- Expired authorizations can be cleaned up with `remove_expired_account_authorization`

### Preimage Authorization

Preimage authorization grants storage access to anyone who can provide the preimage of a specific hash. This is useful for sponsored uploads where a third party authorizes the storage of specific, known content without needing to know which account will submit it.

- Granted via the `authorize_preimage` extrinsic (Root origin)
- Can be refreshed with `refresh_preimage_authorization`
- Expired authorizations can be cleaned up with `remove_expired_preimage_authorization`

### Capacity Planning

When requesting authorization, estimate how many transactions and bytes you need. For simple uploads, a single file under 8 MiB requires one transaction. For chunked uploads (files over 8 MiB), each 1 MiB chunk requires a separate transaction, plus one additional transaction for the manifest. For example, a 100 MiB file would require approximately 101 transactions.

## Transaction Storage Pallet

The `transactionStorage` pallet is the core module for interacting with the Bulletin Chain. It provides the following extrinsics:

| Extrinsic | Description | Origin |
|:--:|:--:|:--:|
| `store(data)` | Store arbitrary data on-chain. Returns a CID for the stored content | Signed |
| `store_with_cid_config(data, cid_config)` | Store data with a custom CID configuration (e.g., codec, hash function) | Signed |
| `renew(block, index)` | Renew a previously stored transaction by specifying the block number and transaction index | Signed |
| `check_proof(proof)` | Submit a storage proof for verification | None |
| `authorize_account(account, expiration)` | Authorize an account to store data until the specified block | Root |
| `authorize_preimage(hash, expiration)` | Authorize a preimage hash for storage access until the specified block | Root |
| `refresh_account_authorization(account, expiration)` | Extend the expiration of an existing account authorization | Root |
| `refresh_preimage_authorization(hash, expiration)` | Extend the expiration of an existing preimage authorization | Root |
| `remove_expired_account_authorization(account)` | Remove an expired account authorization to free storage | Signed |
| `remove_expired_preimage_authorization(hash)` | Remove an expired preimage authorization to free storage | Signed |

The pallet also exposes the following storage items:

| Storage Item | Type | Description |
|:--:|:--:|:--:|
| `Authorizations` | `Map<AccountId, BlockNumber>` | Maps authorized accounts to their authorization expiration block |
| `PreimageAuthorizations` | `Map<Hash, BlockNumber>` | Maps authorized preimage hashes to their authorization expiration block |
| `Transactions` | `Map<BlockNumber, Vec<TransactionInfo>>` | Stores transaction metadata indexed by block number |
| `ByteFee` | `Balance` | The fee charged per byte of stored data |
| `EntryFee` | `Balance` | The base fee charged per storage transaction |
| `RetentionPeriod` | `BlockNumber` | The number of blocks for which stored data is retained |

The pallet emits the following events:

| Event | Description |
|:--:|:--:|
| `Stored` | Emitted when data is successfully stored. Contains the transaction index, content hash, and CID |
| `Renewed` | Emitted when a stored transaction is renewed |
| `ProofChecked` | Emitted when a storage proof is successfully verified |
| `AccountAuthorized` | Emitted when an account is granted storage authorization |
| `PreimageAuthorized` | Emitted when a preimage hash is granted storage authorization |
| `AccountAuthorizationRefreshed` | Emitted when an account authorization is refreshed |
| `PreimageAuthorizationRefreshed` | Emitted when a preimage authorization is refreshed |
| `AccountAuthorizationRemoved` | Emitted when an expired account authorization is removed |
| `PreimageAuthorizationRemoved` | Emitted when an expired preimage authorization is removed |

## IPFS Integration and Data Retrieval

The Bulletin Chain follows a **"write-to-chain, read-from-network"** architecture. Data is stored via on-chain transactions and retrieved directly from validator nodes using the CID. The chain is designed to work seamlessly with the [InterPlanetary File System (IPFS)](https://ipfs.tech/){target=\_blank} — Bulletin Chain nodes are themselves IPFS participants.

### How It Works

When you store data on the Bulletin Chain, the following happens:

1. **CID generation** — the chain computes an IPFS-compatible [Content Identifier (CID)](https://docs.ipfs.tech/concepts/content-addressing/){target=\_blank} from your data using a cryptographic hash. This CID uniquely identifies the content regardless of where it is stored
2. **Bitswap serving** — Bulletin Chain validator nodes implement the IPFS [Bitswap](https://docs.ipfs.tech/concepts/bitswap/){target=\_blank} wire protocol, which is the standard way IPFS nodes exchange data blocks. IPFS clients can request data directly from validator nodes using the CID
3. **DHT registration** — validator nodes register as content providers on the IPFS [Kademlia DHT](https://docs.ipfs.tech/concepts/dht/){target=\_blank}, making stored data discoverable by the IPFS network

### Retrieval Methods

| Method | Status | Description |
|:--:|:--:|:--:|
| [Console UI](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank} | Available | Download data via the Bulletin Chain Console UI using P2P or the IPFS gateway. The simplest option — no code required |
| Direct P2P ([Helia](https://helia.io/){target=\_blank}) | Available | Connect to validator nodes via [libp2p](https://libp2p.io/){target=\_blank} and fetch data using the CID. The recommended decentralized approach for production applications |
| Bulletin Chain IPFS Gateway | Available | Access data via `https://paseo-ipfs.polkadot.io/ipfs/<CID>` for Polkadot TestNet. Can also be used programmatically via `fetch()` |
| Smoldot Light Client | Coming Soon | Fully decentralized retrieval via the `bitswap_block` RPC, enabling trustless data access without connecting to a full node |

!!! warning
    Generic public IPFS gateways like `ipfs.io` or `cloudflare-ipfs.com` are **deprecated** for Bulletin Chain retrieval. They do not reliably serve Bulletin Chain data and introduce external single points of failure.

!!! tip
    For fully decentralized retrieval, use Direct P2P (Helia) or the upcoming Smoldot light client support.

### Content Provider Record Expiry

Content provider records on the DHT are only maintained for data within the retention period. Once data expires and is not renewed, validator nodes stop advertising it on the DHT. However, if another IPFS node has pinned the data, it remains accessible through that node.

## Data Lifecycle

The typical lifecycle of data on the Bulletin Chain follows these steps:

1. **Authorization** — obtain authorization to store data through the faucet (Polkadot TestNet) or from a privileged account (mainnet)
2. **Storage** — submit a `store` or `store_with_cid_config` transaction with your data payload
3. **Retrieval** — fetch data from validator nodes using the CID via the Console UI, Direct P2P (Helia), the Bulletin Chain IPFS gateway, or (coming soon) the Smoldot light client
4. **Renewal** — before the retention period expires, submit a `renew` transaction to extend the data's lifetime

## Size Limits

| Parameter | Value |
|:---:|:--:|
| Max transaction size | ~8 MiB |
| Max file size (chunked) | ~64 MiB |
| Retention period (Polkadot TestNet) | ~2 weeks |

For files larger than the max transaction size, data must be split into chunks using the [DAG-PB (UnixFS)](https://ipld.io/specs/codecs/dag-pb/){target=\_blank} standard. Each chunk is stored as a separate transaction. A final manifest transaction is uploaded last, containing the CIDs of all chunks. The manifest's CID becomes the root CID for the complete file. IPFS clients can then retrieve and reassemble the file automatically using the manifest.

## Network Endpoints

| Network | Endpoint |
|:--:|:--:|
| Bulletin Chain RPC (Polkadot TestNet) | `wss://paseo-bulletin-rpc.polkadot.io` |
| IPFS Gateway (Polkadot TestNet) | `https://paseo-ipfs.polkadot.io` |

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Store Data on the Bulletin Chain__

    ---

    Learn how to authorize your account, store an image, retrieve it, and manage renewals using the Console UI or PAPI.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/store-data/)

</div>

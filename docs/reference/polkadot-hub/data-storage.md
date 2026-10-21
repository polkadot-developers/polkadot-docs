---
title: Data Storage
description: Technical reference for the Polkadot Bulletin Chain, a specialized data storage chain with IPFS-compatible content addressing for the Polkadot ecosystem.
categories: Polkadot Protocol
---

# Data Storage

The Polkadot Bulletin Chain is for storing raw data and files on-chain — images, HTML, JSON, documents, and more. You get back a CID (Content Identifier) and the data is directly retrievable. Think of it as decentralized file hosting built on a Polkadot SDK-based blockchain with [IPFS](https://ipfs.tech/){target=\_blank}-compatible content addressing. The data is only kept for a specific retention period and needs to be renewed to be kept for longer. There are no ownership semantics — it's just storage.

The Bulletin Chain is designed as a utility chain — it has **no native token balances**. Instead, access is managed through an authorization system that grants accounts or preimages the ability to store data. For more details, see the [Polkadot Bulletin Chain repository](https://github.com/paritytech/polkadot-bulletin-chain){target=\_blank} (will be moving to the [fellowship runtimes repository](https://github.com/polkadot-fellows/runtimes){target=\_blank} in the future).

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
- **Chunked uploads**: Files larger than 2 MiB must be split into chunks, each stored as a separate transaction (max 2 MiB per transaction).

## Authorization

The Bulletin Chain has no token balances — there are no fees to pay. Instead, storage access is controlled through an authorization system that prevents spam and ensures fair usage. Only privileged origins can grant authorizations, as described in [Who Grants Authorization](#who-grants-authorization).

Authorization is not a token transfer — it's a **permission entry** recorded in the chain's storage that specifies:

- The **account** allowed to store data
- The number of **transactions** and **bytes** the account can use
- An **expiration block** after which the authorization becomes invalid, set a fixed number of blocks after the authorization is granted (14 days on Polkadot TestNet)

Authorization is consumed as you store data — each storage transaction decrements your remaining transaction count and byte allowance. Once your allocation is used up or the expiration block is reached, you need a new authorization.

### Who Grants Authorization

The `authorize_account` and `authorize_preimage` extrinsics require the _authorizer_ origin. On Polkadot TestNet, the authorizer origin accepts Root, sibling parachains that are allowed to manage authorizations, and accounts that Root registers with `add_authorizer`. Each registered account has a budget that limits how much authorization it can grant.

How you get authorization depends on the network:

| Network | Authorization Source |
|:--:|:--:|
| Polkadot TestNet | The [Console UI Faucet](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank} grants authorization for testing |
| Local Development | The `//Alice` account has sudo access for local testing |
| Polkadot Mainnet | The authorization model is being finalized. Check the [Bulletin Chain repository](https://github.com/paritytech/polkadot-bulletin-chain){target=\_blank} for the latest updates |

### Account Authorization

Account authorization grants a specific account the ability to store any data on-chain, up to the allocated transaction and byte limits. This is the most common authorization type for active users.

- Granted via the `authorize_account` extrinsic (authorizer origin)
- Can be refreshed with `refresh_account_authorization`
- Expired authorizations can be cleaned up with `remove_expired_account_authorization`

### Preimage Authorization

Preimage authorization grants storage access to anyone who can provide the preimage of a specific hash. This is useful for sponsored uploads where a third party authorizes the storage of specific, known content without needing to know which account will submit it.

- Granted via the `authorize_preimage` extrinsic (authorizer origin)
- Can be refreshed with `refresh_preimage_authorization`
- Expired authorizations can be cleaned up with `remove_expired_preimage_authorization`

### Capacity Planning

When requesting authorization, estimate how many transactions and bytes you need. For simple uploads, a single file of up to 2 MiB requires one transaction. For chunked uploads (files over 2 MiB), each chunk requires a separate transaction, plus one additional transaction for the manifest. With the Bulletin SDKs' default chunk size of 1 MiB, a 10 MiB file requires 11 transactions.

## Transaction Storage Pallet

The `TransactionStorage` pallet is the core module for interacting with the Bulletin Chain. It provides the following extrinsics:

| Extrinsic | Description | Origin |
|:--:|:--:|:--:|
| `store(data)` | Store data on-chain. Emits `Stored` with the transaction index, content hash, and CID | Authorized account, Root, or unsigned with a matching preimage authorization |
| `store_with_cid_config(cid, data)` | Store data with an explicit CID configuration (codec and hashing algorithm) | Authorized account, Root, or unsigned with a matching preimage authorization |
| `authorize_account(who, transactions, bytes)` | Authorize an account to store up to `bytes` bytes in `transactions` transactions. Calling it again before the authorization expires adds to the existing allowance | Authorizer |
| `authorize_preimage(content_hash, max_size)` | Authorize anyone to store data with the given content hash, up to `max_size` bytes | Authorizer |
| `refresh_account_authorization(who)` | Extend the expiration of an existing account authorization. The allowance is unchanged | Authorizer |
| `refresh_preimage_authorization(content_hash)` | Extend the expiration of an existing preimage authorization. The allowance is unchanged | Authorizer |
| `remove_expired_account_authorization(who)` | Remove an expired account authorization from storage | Any account |
| `remove_expired_preimage_authorization(content_hash)` | Remove an expired preimage authorization from storage | Any account |
| `add_authorizer(who, budget)` | Allow an account to grant authorizations, within the given budget | Root |
| `remove_authorizer(who)` | Remove an account from the allowed authorizers | Root |
| `remove_exhausted_authorizer(who)` | Remove an authorizer whose budget is used up or whose validity period has ended | Any account |
| `apply_block_inherents(proof)` | Submit the block's storage proof | None (inherent) |

Authorizations expire after a fixed number of blocks (14 days on Polkadot TestNet).

The pallet also exposes the following storage items:

| Storage Item | Type | Description |
|:--:|:--:|:--:|
| `Authorizations` | `Map<AuthorizationScope, Authorization>` | Active authorizations, keyed by account (`Account`) or content hash (`Preimage`) |
| `AllowedAuthorizers` | `Map<AccountId, AuthorizerBudget>` | Accounts allowed to grant authorizations, with their remaining budget |
| `Transactions` | `Map<BlockNumber, Vec<TransactionInfo>>` | Metadata of the transactions stored in each block |
| `TransactionByContentHash` | `Map<Hash, (BlockNumber, u32)>` | Most recent block number and transaction index for each content hash. Updated on every renewal |
| `BlockTransactions` | `Vec<TransactionInfo>` | Transactions stored in the current block |
| `ProofChecked` | `bool` | Whether the storage proof was checked in the current block |
| `ByteFee` | `Balance` | The fee charged per byte of stored data |
| `EntryFee` | `Balance` | The base fee charged per storage transaction |
| `RetentionPeriod` | `BlockNumber` | The number of blocks for which stored data is retained |

The pallet emits the following events:

| Event | Description |
|:--:|:--:|
| `Stored` | Emitted when data is stored. Contains the transaction index, content hash, and CID |
| `ProofChecked` | Emitted when a storage proof is successfully verified |
| `AccountAuthorized` | Emitted when an account is granted storage authorization |
| `AccountAuthorizationRefreshed` | Emitted when an account authorization is refreshed |
| `PreimageAuthorized` | Emitted when a content hash is granted storage authorization |
| `PreimageAuthorizationRefreshed` | Emitted when a preimage authorization is refreshed |
| `ExpiredAccountAuthorizationRemoved` | Emitted when an expired account authorization is removed |
| `ExpiredPreimageAuthorizationRemoved` | Emitted when an expired preimage authorization is removed |
| `AuthorizerAdded` | Emitted when an account is added to the allowed authorizers |
| `AuthorizerRemoved` | Emitted when Root removes an account from the allowed authorizers |
| `ExhaustedAuthorizerRemoved` | Emitted when an authorizer is removed because its budget is used up or its validity period has ended |

## Data Renewal Pallet

Stored data is removed when its retention period ends. The `DataRenewal` pallet extends the retention of data stored through the `TransactionStorage` pallet. Renewal calls identify the data in one of two ways:

- **`Position { block, index }`**: The block number and transaction index of the most recent store or renewal of the data.
- **`ContentHash(hash)`**: The content hash of the data. The chain maps each content hash to its most recent position, so this form keeps working after the data is renewed.

The pallet provides the following extrinsics:

| Extrinsic | Description | Origin |
|:--:|:--:|:--:|
| `renew(entry)` | Schedule a one-time renewal. It takes effect when the retention period ends, and the registration is then removed. The renewal is paid from your authorization when you register it | Authorized account |
| `force_renew(entry)` | Renew the data immediately | Authorized account, Root, or unsigned with a matching preimage authorization |
| `enable_auto_renew(content_hash)` | Renew the data at the end of every retention period. The first renewal is paid when you register; later renewals are charged to your authorization, and the registration is dropped if your authorization cannot cover one | Authorized account |
| `disable_auto_renew(content_hash)` | Cancel recurring renewal. The owner can disable it only after the prepaid first renewal has taken effect | Authorized account that owns the registration, or Root |
| `process_pending_renewals()` | Process the renewals due in the current block | None (inherent) |

Each content hash can have only one registered renewal at a time, across all accounts: `renew` and `enable_auto_renew` fail with `RenewalAlreadyEnabled` while a registration exists.

Renewed bytes are tracked separately from stored bytes. A renewal is rejected when the bytes already renewed under the authorization, plus the size of the data, would exceed the authorization's byte allowance (`InvalidTransaction::Custom(5)`), or when it would exceed the chain-wide cap on renewed storage, `MaxPermanentStorageSize` (`InvalidTransaction::Custom(6)`). To check whether a renewal would be accepted, call the `BulletinTransactionStorageApi.can_renew(account, entry)` runtime API.

The pallet exposes the following storage items:

| Storage Item | Type | Description |
|:--:|:--:|:--:|
| `Renewals` | `Map<Hash, RenewalData>` | Renewal registrations, keyed by content hash |
| `PendingRenewals` | `Vec<(Hash, TransactionInfo, RenewalData)>` | Renewals to process in the current block |
| `PermanentStorageUsed` | `u64` | Total bytes of renewed data on chain, across all accounts |

The pallet emits the following events:

| Event | Description |
|:--:|:--:|
| `Renewed` | Emitted when data is renewed immediately with `force_renew`. Contains the new transaction index and the content hash |
| `RenewalEnabled` | Emitted when a renewal is registered. `recurring` is `true` for `enable_auto_renew` |
| `AutoRenewalDisabled` | Emitted when recurring renewal is disabled |
| `DataRenewed` | Emitted when a registered renewal takes effect. Contains the new transaction index, the content hash, and the account |
| `RenewalFailed` | Emitted when a registered renewal cannot be paid from the account's authorization. The registration is dropped and the data expires |
| `PermanentStorageUsedUpdated` | Emitted when the total of renewed storage changes |
| `PermanentStorageNearCap` | Emitted when the total of renewed storage crosses 80% of `MaxPermanentStorageSize` |

## IPFS Integration and Data Retrieval

The Bulletin Chain follows a **"write-to-chain, read-from-network"** architecture. Data is stored via on-chain transactions and retrieved directly from collator nodes using the CID. The chain is designed to work seamlessly with the [InterPlanetary File System (IPFS)](https://ipfs.tech/){target=\_blank} — Bulletin Chain nodes are themselves IPFS participants.

### How It Works

When you store data on the Bulletin Chain, the following happens:

1. **CID generation**: The chain computes an IPFS-compatible [Content Identifier (CID)](https://docs.ipfs.tech/concepts/content-addressing/){target=\_blank} from your data using a cryptographic hash. This CID uniquely identifies the content regardless of where it is stored.
2. **Bitswap serving**: Bulletin Chain collator nodes implement the IPFS [Bitswap](https://docs.ipfs.tech/concepts/bitswap/){target=\_blank} wire protocol, which is the standard way IPFS nodes exchange data blocks. IPFS clients can request data directly from collator nodes using the CID.

### Retrieval Methods

| Method | Status | Description |
|:--:|:--:|:--:|
| [Console UI](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank} | Available | Download data via the Bulletin Chain Console UI using P2P or the IPFS gateway. The simplest option — no code required |
| Direct P2P ([Helia](https://helia.io/){target=\_blank}) | Available | Connect to collator nodes via [libp2p](https://libp2p.io/){target=\_blank} and fetch data using the CID. The recommended decentralized approach for production applications |
| Bulletin Chain IPFS Gateway | Available | Access data via `https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/<CID>` for Polkadot TestNet. Can also be used programmatically via `fetch()` |
| Smoldot Light Client | Coming Soon | Fully decentralized retrieval via the `bitswap_block` RPC, enabling trustless data access without connecting to a full node |

!!! warning
    Generic public IPFS gateways like `ipfs.io` or `cloudflare-ipfs.com` are **deprecated** for Bulletin Chain retrieval. They do not reliably serve Bulletin Chain data and introduce external single points of failure.

!!! tip
    For fully decentralized retrieval, use Direct P2P (Helia) or the upcoming Smoldot light client support.

## Data Lifecycle

The typical lifecycle of data on the Bulletin Chain follows these steps:

1. **Authorization**: Obtain authorization to store data through the faucet (Polkadot TestNet) or from a privileged account (MainNet).
2. **Storage**: Submit a `store` or `store_with_cid_config` transaction with your data payload.
3. **Retrieval**: Fetch data from collator nodes using the CID via the Console UI, Direct P2P (Helia), the Bulletin Chain IPFS gateway, or (coming soon) the Smoldot light client.
4. **Renewal**: Before the retention period ends, register a renewal with the `DataRenewal` pallet: `renew` for a one-time renewal or `enable_auto_renew` for recurring renewal. Use `force_renew` to renew immediately.

## Size Limits

| Parameter | Value |
|:---:|:--:|
| Max transaction size | 2 MiB |
| Default chunk size (Bulletin SDKs) | 1 MiB |
| Max file size per chunking operation (Bulletin SDKs) | 64 MiB |
| Retention period (Polkadot TestNet) | ~2 weeks |

For files larger than the max transaction size, data must be split into chunks using the [DAG-PB (UnixFS)](https://ipld.io/specs/codecs/dag-pb/){target=\_blank} standard. Each chunk is stored as a separate transaction. A final manifest transaction is uploaded last, containing the CIDs of all chunks. The manifest's CID becomes the root CID for the complete file. IPFS clients can then retrieve and reassemble the file automatically using the manifest.

The Bulletin SDKs chunk at most 64 MiB in a single operation. To store a larger file, split it into segments of at most 64 MiB and chunk each segment separately.

## Network Endpoints

| Network | Endpoint |
|:--:|:--:|
| Bulletin Chain RPC (Polkadot TestNet) | `wss://paseo-bulletin-next-rpc.polkadot.io` |
| IPFS Gateway (Polkadot TestNet) | `https://paseo-bulletin-next-ipfs.polkadot.io` |

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Store Data on the Bulletin Chain__

    ---

    Learn how to authorize your account, store an image, retrieve it, and manage renewals using the Console UI or PAPI.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/store-data/bulletin-chain/)

</div>

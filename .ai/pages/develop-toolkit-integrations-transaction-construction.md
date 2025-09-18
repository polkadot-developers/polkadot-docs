---
title: Transaction Construction
description: Understand how to construct, sign, and broadcast transactions in the Polkadot ecosystem using various tools and libraries.
url: https://docs.polkadot.com/develop/toolkit/integrations/transaction-construction/
---

# Transaction Construction

## Introduction

This page will discuss the transaction format in Polkadot and how to create, sign, and broadcast transactions, as well as highlight some of the commands and tools available for integrators.

Always refer to each tool's documentation when integrating.

For further reading, refer to [blocks, transactions, and fees](/polkadot-protocol/parachain-basics/blocks-transactions-fees/){target=\_blank} to learn more about the basics.

## Transaction Format

Polkadot has some basic transaction information that is common to all transactions.

- **Address**: The [SS58-encoded address](/polkadot-protocol/glossary/#ss58-address-format){target=\_blank} of the sending account.
- **Block hash**: The hash of the [checkpoint](/polkadot-protocol/parachain-basics/blocks-transactions-fees/transactions/#transaction-mortality){target=\_blank} block.
- **Block number**: The number of the checkpoint block.
- **Genesis hash**: The genesis hash of the chain.
- **Metadata**: The [SCALE-encoded](/polkadot-protocol/parachain-basics/data-encoding/){target=\_blank} metadata for the runtime when submitted.
- **Nonce**: The nonce for this transaction.
- **Spec version**: The current spec version for the runtime.
- **Transaction version**: The current version of the transaction format.
- **Tip**: The [tip](/polkadot-protocol/parachain-basics/blocks-transactions-fees/fees/#how-fees-are-calculated){target=\_blank} to increase transaction priority. This is optional when constructing the transaction.
- **Mode**: The flag indicating whether to verify the metadata hash or not.
- **Era period**: The number of blocks after the checkpoint for which a transaction is valid. If zero, the transaction is [immortal](/polkadot-protocol/parachain-basics/blocks-transactions-fees/transactions/#transaction-mortality){target=\_blank}. This is optional when constructing the transaction.
- **Metadata hash**: The metadata hash which should match the [`RUNTIME_METADATA_HASH`](https://paritytech.github.io/polkadot-sdk/master/frame_metadata_hash_extension/struct.CheckMetadataHash.html){target=\_blank} environment variable. This is optional when constructing the transaction.

!!!warning
    There are risks to making a transaction immortal. If an account is reaped and a user refunds the account, then they could replay an immortal transaction. Always default to using a mortal extrinsic.
    
The nonce queried from the [System module](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/index.html){target=\_blank} does not account for pending transactions. You must manually track and increment the nonce if you want to submit multiple valid transactions simultaneously.

Each transaction will have its own parameters, or it may have none to add. For example, the [`transferKeepAlive`](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/pallet/enum.Call.html#variant.transfer_keep_alive){target=\_blank}  function from the [Balances pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/index.html){target=\_blank} will take:

- `dest`: Destination address
- `#[compact] value`: Number of tokens (compact encoding)

Refer to [the protocol specifications](https://spec.polkadot.network/id-extrinsics){target=\_blank} for the concrete specifications and types required to build a transaction.

### Mode and Metadata Hash

The [`mode`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/guides/enable_metadata_hash/index.html){target=\_blank} and [`metadata hash`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/guides/enable_metadata_hash/index.html){target=\_blank} fields were introduced in transaction construction to support the optional [`CheckMetadataHash` Signed Extension](https://github.com/polkadot-fellows/RFCs/blob/main/text/0078-merkleized-metadata.md){target=\_blank}. This enables trustless metadata verification by allowing the chain to verify the correctness of the metadata used without the need of a trusted party. This functionality was included in [v1.2.5](https://github.com/polkadot-fellows/runtimes/releases/tag/v1.2.5){target=\_blank} runtime release by the [Fellowship](https://github.com/polkadot-fellows/manifesto){target=\_blank}. A user may opt out of this functionality by setting the `mode` to `0`. When the mode is `0`, the [`metadata hash`](https://paritytech.github.io/polkadot-sdk/master/frame_metadata_hash_extension/struct.CheckMetadataHash.html){target=\_blank} field is empty/`None`.

### Serialized Transactions and Metadata

Before being submitted, transactions are serialized. Serialized transactions are hex encoded SCALE-encoded bytes. The relay chain runtimes are upgradable, and therefore, any interfaces are subject to change. The metadata allows developers to structure any extrinsics or storage entries accordingly and provides you with all of the information required to construct the serialized call data specific to your transaction. You can read more about the metadata, its format and how to get it in the [Subxt documentation](/polkadot-protocol/parachain-basics/chain-data/#use-subxt){target=\_blank}.

### Transaction Flow

The typical transaction workflow is as follows:

1. Construct an unsigned transaction.
2. Create a signing payload.
3. Sign the payload.
4. Serialize the signed payload into a transaction.
5. Submit the serialized transaction.

There are several tools to help perform these steps.

## Polkadot-JS Tools

[Polkadot-JS Tools](https://www.npmjs.com/package/@polkadot/signer-cli){target=\_blank} contains a set of command-line tools for interacting with a Polkadot SDK client, including one called "Signer CLI" to create, sign, and broadcast transactions.

This example will use the `signer submit` command, which creates and submits the transaction. The `signer sendOffline` command has the same API, but will not broadcast the transaction. The `submit` and `sendOffline` must be connected to a node to fetch the current metadata and construct a valid transaction.

Start by installing the Signer CLI.

```bash
npm install -g @polkadot/signer-cli
```

To create a transaction, you need to connect to a chain, enabling the creation of a transaction using the chain's metadata. 

Here is the format for `submit` or `sendOffline`:

```bash
polkadot-js-signer <submit|sendOffline> --account <from-account-ss58> --ws <endpoint> <module.method> [param1] [...] [paramX]
```

And for signing a transaction:

```bash
polkadot-js-signer sign --account <from-account-ss58> --seed <seed> --type <sr25519|ed25519> <payload>
```

### Creating a Transaction, Signing, and Submitting

For the sake of this example, create two accounts using the [Subkey](/polkadot-protocol/parachain-basics/accounts/#using-subkey){target=\_blank} CLI tool.

<div id="termynal" data-termynal>
    <span data-ty="input">subkey generate</span>
    <span data-ty>Secret phrase:       south ladder exile ... grape rival settle coil</span>
    <span data-ty>  Network ID:        substrate</span>
    <span data-ty>  Secret seed:       0x60b875ea64f33b23093b8f8af542d5360ea121dd017d3053957c64cb73097def</span>
    <span data-ty>  Public key (hex):  0x84a16fd4762cb944569d5b0a0deb4897fcb9d0a7bc153602f7b908c1b994222a</span>
    <span data-ty>  Account ID:        0x84a16fd4762cb944569d5b0a0deb4897fcb9d0a7bc153602f7b908c1b994222a</span>
    <span data-ty>  Public key (SS58): 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2</span>
    <span data-ty>  SS58 Address:      5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2</span>
    <span data-ty></span>
    <span data-ty="input">subkey generate</span>
    <span data-ty>Secret phrase:       car blood garden ... bomb armed potato</span>
    <span data-ty>  Network ID:        substrate</span>
    <span data-ty>  Secret seed:       0xced7bd306e992e7fce7efb3e4e1f6b196c402173d23c55ece35f1ca685d8e4eb</span>
    <span data-ty>  Public key (hex):  0xa4e4a64dcabae6f6f95de52a81d42361926443e26efede9c7cd9d6034e43c761</span>
    <span data-ty>  Account ID:        0xa4e4a64dcabae6f6f95de52a81d42361926443e26efede9c7cd9d6034e43c761</span>
    <span data-ty>  Public key (SS58): 5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD</span>
    <span data-ty>  SS58 Address:      5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD</span>
</div>

Let's say you want to send 1 WND from `5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2` to `5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD` on [Westend's Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fasset-hub-westend-rpc.n.dwellir.com#/accounts){target=\_blank} using `polkadot-js-signer`.

First, fund the sending account. You can use the [Westend Faucet](https://faucet.polkadot.io/westend){target=\_blank} to do so.
Request some tokens for `5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2`.

Next, call `submit` to create the transaction, which will give you the payload to sign.

```bash
polkadot-js-signer submit --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --ws wss://asset-hub-westend-rpc.n.dwellir.com balances.transferKeepAlive 5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD 1000000000000
```

This will return a payload to sign and an input waiting for a signature.

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>polkadot-js-signer submit --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --ws wss://asset-hub-westend-rpc.n.dwellir.com balances.transferKeepAlive 5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD 1000000000000</span>
    <span data-ty>Payload: 0x040300ff4a83f1...a8239139ff3ff7c3f6</span>
    <span data-ty>Signature></span>
</div>

Take this payload and use your normal signing environment (e.g., air-gapped machine, VM, etc.). In a separate tab of your terminal, sign the payload.

```bash
polkadot-js-signer sign --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --seed "south ladder exile ... grape rival settle coil" --type sr25519 0x040300ff4a83f1...a8239139ff3ff7c3f6
```

This will output the transaction's signature. 

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>polkadot-js-signer sign --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --seed "south ladder exile ... grape rival settle coil" --type sr25519 0x040300ff4a83f1...a8239139ff3ff7c3f6</span>
    <span data-ty>Signature: 0xe6facf194a8e...413ce3155c2d1240b</span>
</div>

Paste this signature into the `submit` signature field, and send the transaction (or just return the serialized transaction if using `sendOffline`).

By default, submit will create a mortal extrinsic with a lifetime of 50 blocks. 

Assuming a six-second block time, you will have five minutes to go offline, sign the transaction, paste the signature, and submit the signed transaction.

You will get useful output in the terminal with details like the events that were fired off, as well as the block in which the extrinsic is in. 

??? code "Full example output"
    <div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>polkadot-js-signer submit --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --ws wss://westend-asset-hub-rpc.polkadot.io balances.transferKeepAlive 5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD 1000000000000</span>
    <span data-ty>    2025-07-16 16:00:12        REGISTRY: Unknown signed extensions AuthorizeCall, StorageWeightReclaim found, treating them as no-effect</span>
    <span data-ty>    2025-07-16 16:00:12        API/INIT: RPC methods not decorated: archive_v1_body, archive_v1_call, archive_v1_finalizedHeight, archive_v1_genesisHash, archive_v1_hashByHeight, archive_v1_header, archive_v1_stopStorage, archive_v1_storage, archive_v1_storageDiff, archive_v1_storageDiff_stopStorageDiff, chainHead_v1_body, chainHead_v1_call, chainHead_v1_continue, chainHead_v1_follow, chainHead_v1_header, chainHead_v1_stopOperation, chainHead_v1_storage, chainHead_v1_unfollow, chainHead_v1_unpin, chainSpec_v1_chainName, chainSpec_v1_genesisHash, chainSpec_v1_properties, transactionWatch_v1_submitAndWatch, transactionWatch_v1_unwatch, transaction_v1_broadcast, transaction_v1_stop</span>
    <span data-ty>    Payload: 0x0a0300a4e4a64dcabae6f6f95de52a81d42361926443e26efede9c7cd9d6034e43c761070010a5d4e8f503000000009d880f001000000067f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c949f8bd6deece0f1717c444d4323c255962b627b615b18de8316c5a47d960402c00</span>
    <span data-ty>    Signature> 0x01960389b87612cda987189e21143e83907cad9bba0a0990b377df915b9e3df561dbe953cf2f20f11a5e8ad80c0d0da2dcc6bc5bc85967116c9f3ecd9f613a5e82</span>
    <span data-ty>    {</span>
    <span data-ty>      "events": [],</span>
    <span data-ty>      "status": "Ready"</span>
    <span data-ty>    }</span>
    <span data-ty>    {</span>
    <span data-ty>      "events": [],</span>
    <span data-ty>      "status": {</span>
    <span data-ty>        "Broadcast": [</span>
    <span data-ty>          "12D3KooWDoq4PVdWm5nzRSvEz3DSSKjVgRhWVUaKyi5JMKwJKYbk",</span>
    <span data-ty>          "12D3KooWRZBHqijn91FMnihg3oN487oXLFoumr6SoN886Dxdu3yU",</span>
    <span data-ty>          "12D3KooWSQvp4JByYRdieqhqoDEZ6NL2g2wttivrRuQH2KPGCWfh",</span>
    <span data-ty>          "12D3KooWSKSHBXBAs7QvUKwDkFheuyL22KpHPS26q371iZ3WFQuF",</span>
    <span data-ty>          "12D3KooWDkgKu9ibY92EfC2YBhVWSmnTuwE5d4M7AoSphZ7YbkSP",</span>
    <span data-ty>          "12D3KooWLHHS5UtH6QCdWdDu92915k5Ka8H9uJW4SpCEuT7wJycg",</span>
    <span data-ty>          "12D3KooWG4YUe7AfSxVwyLQBRRMU99krssmGAUghqUFoVY1iPkQs",</span>
    <span data-ty>          "12D3KooWJaAfPyiye7ZQBuHengTJJoMrcaz7Jj1UzHiKdNxA1Nkd",</span>
    <span data-ty>          "12D3KooWGD9caunL5KZuqMuHHFR6xv7gLqJH8cLrb9Q23yDy9JG1",</span>
    <span data-ty>          "12D3KooWN7MjtEfEnS9FZHgRdfZcxQ9RPppeDqBLKQ4VQ1QWPtSC",</span>
    <span data-ty>          "12D3KooWDfepM7kqUHMXdGqJw3ZmtvAcE2CjPcnYjT2tTfAw3ZBd",</span>
    <span data-ty>          "12D3KooWCUYurDvauYyjLQH81LSj9hCdkcKtYYMEJWfLsJWZENs2",</span>
    <span data-ty>          "12D3KooWJbrCd1v9i21bY7hbtnUkhmkHct62331kxRTdZDPF2U8D",</span>
    <span data-ty>          "12D3KooWSVSxmf8BNTqwb9gZDVWJGho7Sy84QiAcArQUeTgkePyV",</span>
    <span data-ty>          "12D3KooWLjaXWhNTSiRVFbTJCKLRWt9XXHLGVnAFtxvnExKkVPqn",</span>
    <span data-ty>          "12D3KooWPPVazRmxrWK4AGYFuwNdJXzZshiLU73tw9ikpv8VhsP7",</span>
    <span data-ty>          "12D3KooWE4UDXqgtTcMCyUQ8S4uvaT8VMzzTBA6NWmKuYwTacWuN",</span>
    <span data-ty>          "12D3KooWJwsogNonEiY9PJUX9Gk564KJ1NfHAiTDPtL7rh7djf3A",</span>
    <span data-ty>          "12D3KooWDUPyF2q8b6fVFEuwxBbRV3coAy1kzuCPU3D9TRiLnUfE",</span>
    <span data-ty>          "12D3KooWFLR2UN6PMAUwNAjiWBAiEDoYcWRrtjDrUfRkdUssge4v",</span>
    <span data-ty>          "12D3KooWHpoHiCNYJAcfwe8uiqybx5wX25a2YAPr9A5nq5Htg223",</span>
    <span data-ty>          "12D3KooWLgfaWf4uBJkGv3MRq2x7zxgBwQ6yHVCerF3dU8FncWkX",</span>
    <span data-ty>          "12D3KooWK13Bi57EgkxxiJV2RsPCWoaEWRyq6kuAPwMq39Y4WLQj",</span>
    <span data-ty>          "12D3KooWFGswsMTKSrbPyRRTjcjjCVJVANKu1aLSZzxH5gSk4xhs",</span>
    <span data-ty>          "12D3KooWE7C5Tebbccm76xzJY61LhqGhp9CLHyTtfDetLAURHpDJ",</span>
    <span data-ty>          "12D3KooWLG4V41JQw12GXqXXmKe6w68LvyzEYcAhUmeZTf67Cs6P",</span>
    <span data-ty>          "12D3KooWQKMXaeDjgWyvkBECeYF6Zz2r8YrtuvYeQ4ir9KazpqXP",</span>
    <span data-ty>          "12D3KooWHU4qqSyqKdbXdrCTMXUJxxueaZjqpqSaQqYiFPw6XqEx"</span>
    <span data-ty>        ]</span>
    <span data-ty>      }</span>
    <span data-ty>    }</span>
    <span data-ty>    {</span>
    <span data-ty>      "dispatchInfo": {</span>
    <span data-ty>        "weight": {</span>
    <span data-ty>          "refTime": "383,866,000",</span>
    <span data-ty>          "proofSize": "4,261"</span>
    <span data-ty>        },</span>
    <span data-ty>        "class": "Normal",</span>
    <span data-ty>        "paysFee": "Yes"</span>
    <span data-ty>      },</span>
    <span data-ty>      "events": [</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "Withdraw",</span>
    <span data-ty>            "section": "balances",</span>
    <span data-ty>            "index": "0x0a08",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "who": "5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2",</span>
    <span data-ty>              "amount": "2,933,772,732"</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        },</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "NewAccount",</span>
    <span data-ty>            "section": "system",</span>
    <span data-ty>            "index": "0x0003",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "account": "5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD"</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        },</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "Endowed",</span>
    <span data-ty>            "section": "balances",</span>
    <span data-ty>            "index": "0x0a00",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "account": "5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD",</span>
    <span data-ty>              "freeBalance": "1,000,000,000,000"</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        },</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "Transfer",</span>
    <span data-ty>            "section": "balances",</span>
    <span data-ty>            "index": "0x0a02",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "from": "5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2",</span>
    <span data-ty>              "to": "5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD",</span>
    <span data-ty>              "amount": "1,000,000,000,000"</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        },</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "Deposit",</span>
    <span data-ty>            "section": "balances",</span>
    <span data-ty>            "index": "0x0a07",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "who": "5EYCAe5cKPAoFh2HnQQvpKqRYZGqBpaA87u4Zzw89qPE58is",</span>
    <span data-ty>              "amount": "2,933,772,732"</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        },</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "TransactionFeePaid",</span>
    <span data-ty>            "section": "transactionPayment",</span>
    <span data-ty>            "index": "0x0b00",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "who": "5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2",</span>
    <span data-ty>              "actualFee": "2,933,772,732",</span>
    <span data-ty>              "tip": "0"</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        },</span>
    <span data-ty>        {</span>
    <span data-ty>          "phase": {</span>
    <span data-ty>            "ApplyExtrinsic": "2"</span>
    <span data-ty>          },</span>
    <span data-ty>          "event": {</span>
    <span data-ty>            "method": "ExtrinsicSuccess",</span>
    <span data-ty>            "section": "system",</span>
    <span data-ty>            "index": "0x0000",</span>
    <span data-ty>            "data": {</span>
    <span data-ty>              "dispatchInfo": {</span>
    <span data-ty>                "weight": {</span>
    <span data-ty>                  "refTime": "383,866,000",</span>
    <span data-ty>                  "proofSize": "4,261"</span>
    <span data-ty>                },</span>
    <span data-ty>                "class": "Normal",</span>
    <span data-ty>                "paysFee": "Yes"</span>
    <span data-ty>              }</span>
    <span data-ty>            }</span>
    <span data-ty>          },</span>
    <span data-ty>          "topics": []</span>
    <span data-ty>        }</span>
    <span data-ty>      ],</span>
    <span data-ty>      "status": {</span>
    <span data-ty>        "InBlock": "0x08cc8737961b31d7e9e8877e289bad780c08ac92ac09037871688e6761a8e793"</span>
    <span data-ty>      }</span>
    <span data-ty>    }</span>
</div>

!!!note "Submitting Pre-Signed Transaction"
    You can also submit pre-signed transactions, e.g., generated using the `sendOffline` command.
    ```bash
    polkadot-js-signer submit --tx <signedTransaction> --ws <endpoint>
    ```

## Txwrapper

If you do not want to use the CLI for signing operations, Parity provides an SDK called [txwrapper-core](https://github.com/paritytech/txwrapper-core){target=\_blank} to generate and sign transactions offline. For Polkadot, Kusama, and select parachains, use the `txwrapper-polkadot` package. Other Polkadot SDK-based chains will have their own `txwrapper-{chain}` implementations. See the [examples](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/README.md){target=\_blank} for a guide.

### Creating a Transaction, Signing, and Submitting

You will need a network to test the transaction.
Let's use [chopsticks](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} for this:

```bash
npx @acala-network/chopsticks --config=polkadot -p 9944
```

You should get a Polkadot network running on port 9944.

The [`txwrapper` example script](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank} will then be used to create and sign transactions.

For this, you will need the [`txwrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank} library. Let's clone [`txwrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank}:

```bash
git clone https://github.com/paritytech/txwrapper-core
cd txwrapper-core
yarn install && yarn build
cd packages/txwrapper-examples
```

Build and run the [Polkadot `txwrapper` example script](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank}:

```bash
yarn run build
yarn run polkadot
```

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>yarn run polkadot</span>
    <span data-ty>Alice's SS58-Encoded Address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY</span>
    <span data-ty></span>
    <span data-ty>Decoded Transaction</span>
    <span data-ty>  To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
    <span data-ty>  Amount: "10000000000"</span>
    <span data-ty></span>
    <span data-ty>Payload to Sign: 0xa40503008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a480700e40b54028500000000b1590f001a00000091b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3843125cd049613a7edf44b55a01efbabffcd1b962068a82070cff82314b67bbc00</span>
    <span data-ty></span>
    <span data-ty>Decoded Transaction</span>
    <span data-ty>  To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
    <span data-ty>  Amount: "10000000000"</span>
    <span data-ty></span>
    <span data-ty>Signature: 0x01ae703e667b3b444e3613a5f06d16bedf2460a18e52075b47c6442ebc1d316917c6d12e3aa7bbd2f8db76cc859b43134cecb4495613d8d504901de776d0642b82</span>
    <span data-ty></span>
    <span data-ty>Transaction to Submit: 0x45028400d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01ae703e667b3b444e3613a5f06d16bedf2460a18e52075b47c6442ebc1d316917c6d12e3aa7bbd2f8db76cc859b43134cecb4495613d8d504901de776d0642b8285000000000503008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a480700e40b5402</span>
    <span data-ty></span>
    <span data-ty>Expected Tx Hash: 0xa12126a095b38f0c70331be78743329a851e33839f9b2f93a7ecc34541507891</span>
    <span data-ty>Actual Tx Hash: 0xa12126a095b38f0c70331be78743329a851e33839f9b2f93a7ecc34541507891</span>
    <span data-ty></span>
    <span data-ty>Decoded Transaction</span>
    <span data-ty>  To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
    <span data-ty>  Amount: "10000000000"</span>
</div>

The [`txwrapper` example script](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank} includes several reference examples.

## Additional Libraries for Submitting a Transaction

Other than Polkadot JS Tools and txwrapper, there are several other libraries that can also be used to submit a signed payload, such as the [Sidecar API](/develop/toolkit/api-libraries/sidecar/#sidecar-api){target=\_blank} or using RPC calls with [`author_submitExtrinsic`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/author/trait.AuthorApiServer.html#tymethod.submit_extrinsic){target=\_blank} or [`author_submitAndWatchExtrinsic`](https://github.com/paritytech/polkadot-sdk/blob/0ae5c5bbd96a600aed81358339be2f16bade4a81/substrate/client/rpc-api/src/author/mod.rs#L69-L78){target=\_blank}, the latter of which will subscribe you to events to be notified as a transaction gets validated and included in the chain. You can see all the available libraries in the [API Libraries](/develop/toolkit/api-libraries/){target=\_blank} section of the Polkadot Docs.

---
title: Transaction Construction
description: Understand how to construct, sign, and broadcast transactions in the Polkadot ecosystem using various tools and libraries.
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

For the sake of this example, create two accounts using the [Subkey](/polkadot-protocol/basics/accounts/#using-subkey){target=\_blank} CLI tool.

--8<-- 'code/develop/toolkit/integrations/subkey-generate-output.html'

Let's say you want to send 1 WND from `5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2` to `5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD` on [Westend's Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fasset-hub-westend-rpc.n.dwellir.com#/accounts){target=\_blank} using `polkadot-js-signer`.

First, fund the sending account. You can use the [Westend Faucet](https://faucet.polkadot.io/westend){target=\_blank} to do so.
Request some tokens for `5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2`.

Next, call `submit` to create the transaction, which will give you the payload to sign.

```bash
polkadot-js-signer submit --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --ws wss://asset-hub-westend-rpc.n.dwellir.com balances.transferKeepAlive 5FnudgwK8xJvmujsXXP35pF2xwskhHQzBSRM8KZhXjnEz5gD 1000000000000
```

This will return a payload to sign and an input waiting for a signature.

--8<-- 'code/develop/toolkit/integrations/signer-cli-submit-output.html'

Take this payload and use your normal signing environment (e.g., air-gapped machine, VM, etc.). In a separate tab of your terminal, sign the payload.

```bash
polkadot-js-signer sign --account 5F4c8mNz6schf2WMXQZiz1eyR1GGxrMf2coXpAn8mNjxyzp2 --seed "south ladder exile ... grape rival settle coil" --type sr25519 0x040300ff4a83f1...a8239139ff3ff7c3f6
```

This will output the transaction's signature. 

--8<-- 'code/develop/toolkit/integrations/signer-cli-sign-output.html'

Paste this signature into the `submit` signature field, and send the transaction (or just return the serialized transaction if using `sendOffline`).

By default, submit will create a mortal extrinsic with a lifetime of 50 blocks. 

Assuming a six-second block time, you will have five minutes to go offline, sign the transaction, paste the signature, and submit the signed transaction.

You will get useful output in the terminal with details like the events that were fired off, as well as the block in which the extrinsic is in. 

??? code "Full example output"
    --8<-- 'code/develop/toolkit/integrations/signer-cli-submit-full-output.html'

!!!note "Submitting Pre-Signed Transaction"
    You can also submit pre-signed transactions, e.g. generated using the `sendOffline` command.
    ```bash
    polkadot-js-signer submit --tx <signedTransaction> --ws <endpoint>
    ```

## Txwrapper

If you do not want to use the CLI for signing operations, Parity provides an SDK called [txwrapper-core](https://github.com/paritytech/txwrapper-core){target=\_blank} to generate and sign transactions offline. For Polkadot, Kusama, and select parachains, use the `txwrapper-polkadot` package. Other Polkadot SDK-based chains will have their own `txwrapper-{chain}` implementations. See the [examples](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/README.md){target=\_blank} for a guide.

### Creating a Transaction, Signing, and Submitting

You will need a network to run test the transaction on. 
Let's use [chopsticks](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} for this:

```bash
npx @acala-network/chopsticks --config=polkadot -p 9944
```

You should get a Polkadot network running on port 9944.

The [txwrapper example script](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank} will then be used to create and sign transactions.

For this you will need the [`txwrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank} library. Let's clone [`txwrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank}:

```bash
git clone https://github.com/paritytech/txwrapper-core
cd txwrapper-core
yarn install && yarn build
cd packages/txwrapper-examples
```

Build and run the [`txwrapper Polkadot example script`](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank}:

```bash
yarn run build
yarn run polkadot
```

--8<-- 'code/develop/toolkit/integrations/txwrapper-output.html'

The [`txwrapper example script`](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank} includes several reference examples.

## Additional Libraries for Submitting a Transaction

Other than Polkadot JS Tools and txwrapper, there are several other libraries that can also be used to submit a signed payload such as the [Sidecar API](/develop/toolkit/api-libraries/sidecar/#sidecar-api){target=\_blank} or using RPC calls with [`author_submitExtrinsic`](https://paritytech.github.io/polkadot-sdk/master/sc_rpc/author/trait.AuthorApiServer.html#tymethod.submit_extrinsic){target=\_blank} or [`author_submitAndWatchExtrinsic`](https://github.com/paritytech/polkadot-sdk/blob/0ae5c5bbd96a600aed81358339be2f16bade4a81/substrate/client/rpc-api/src/author/mod.rs#L69-L78){target=\_blank}, the latter of which will subscribe you to events to be notified as a transaction gets validated and included in the chain. You can see all the available libraries in the [API Libraries](/develop/toolkit/api-libraries/){target=\_blank} section of the Polkadot Docs.
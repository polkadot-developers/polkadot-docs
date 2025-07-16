---
title: Transaction Construction
description: Understand how to construct, sign, and broadcast transactions in the Polkadot ecosystem using various tools and libraries.
---

# Transaction Construction

## Introduction

This page will discuss the transaction format in Polkadot and how to create, sign, and broadcast transactions as well as highlight some of commands and tools available for integrators.

**Always refer to each tool's documentation when integrating.**

For further reading, refer to [blocks, transactions, and fees](/polkadot-protocol/parachain-basics/blocks-transactions-fees/){target=\_blank} to learn more about the basics.

## Transaction Format

Polkadot has some basic transaction information that is common to all transactions.

- Address: The [SS58-encoded address](/polkadot-protocol/glossary/#ss58-address-format){target=\_blank} of the sending account.
- Block Hash: The hash of the [checkpoint](/polkadot-protocol/parachain-basics/blocks-transactions-fees/transactions/#transaction-mortality){target=\_blank} block.
- Block Number: The number of the checkpoint block.
- Genesis Hash: The genesis hash of the chain.
- Metadata: The [SCALE-encoded metadata](polkadot-protocol/parachain-basics/data-encoding/){target=\_blank} for the runtime when submitted.
- Nonce: The nonce for this transaction.
- Spec Version: The current spec version for the runtime.
- Transaction Version: The current version for transaction format.
- Tip: Optional, the [tip](https://docs.polkadot.com/polkadot-protocol/parachain-basics/blocks-transactions-fees/fees/#how-fees-are-calculated){target=\_blank} to increase transaction priority.
- Mode: The flag indicating whether to verify the metadata hash or not.
- Era Period: Optional, the number of blocks after the checkpoint for which a transaction is valid.
  If zero, the transaction is [immortal](/polkadot-protocol/parachain-basics/blocks-transactions-fees/transactions/#transaction-mortality){target=\_blank}
- MetadataHash: Optional, the metadata hash which should match the RUNTIME_METADATA_HASH environment
  variable.

!!!warning
    There are risks to making a transaction immortal. If an account is reaped and a user re-funds the 
    account, then they could replay an immortal transaction. Always default to using a mortal extrinsic.
    
The nonce queried from the System module does not account for pending transactions. You must track 
and increment the nonce manually if you want to submit multiple valid transactions at the same time.

Each transaction will have its own (or no) parameters to add. For example, the [`transferKeepAlive`](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/pallet/enum.Call.html#variant.transfer_keep_alive){target=\_blank} 
function from the Balances pallet will take:

- `dest`: Destination address
- `#[compact] value`: Number of tokens (compact encoding)

Refer to [the protocol specifications](https://spec.polkadot.network/id-extrinsics){target=\_blank}, for the
concrete specifications and types to build a transaction.

**Mode and MetadataHash**

The mode and metadataHash fields were introduced in transaction construction to support the optional
[`CheckMetadataHash` Signed Extension](https://github.com/polkadot-fellows/RFCs/blob/main/text/0078-merkleized-metadata.md){target=\_blank}.
This enables trustless metadata verification by allowing the chain to verify the correctness of the
metadata used without the need of a trusted party. This functionality was included in
[v1.2.5](https://github.com/polkadot-fellows/runtimes/releases/tag/v1.2.5){target=\_blank} runtime release by the
Fellowship. A user may opt out of this functionality by setting the mode to `0`. When the mode is 00,
the `metadataHash` field is empty/None.

**Serialized transactions and metadata**

Before being submitted, transactions are serialized. Serialized transactions are hex encoded
SCALE-encoded bytes. The relay chain runtimes are upgradable and therefore any interfaces are
subject to change, the metadata allows developers to structure any extrinsics or storage entries
accordingly. The metadata provides you with all of the information required to know how to construct
the serialized call data specific to your transaction. You can read more about the metadata, its
format and how to get it in the [Subxt documentation](/polkadot-protocol/parachain-basics/chain-data/#use-subxt){target=\_blank}.

**Transaction Flow**

The typical transaction workflow is as follows:

1. Construct an unsigned transaction.
2. Create a signing payload.
3. Sign the payload.
4. Serialize the signed payload into a transaction.
5. Submit the serialized transaction.

Parity provides several tools to help perform these steps.

## Polkadot-JS Tools

[Polkadot-JS Tools](https://github.com/polkadot-js/tools){target=\_blank} contains a set of command line tools for
interacting with a Polkadot SDK client, including one called "Signer CLI" to create, sign, and
broadcast transactions.

!!!note "Generating SS58 Addresses"
    For the examples on this page, it may be helpful to generate new accounts for signing purposes.
    For this, you can use the [Subkey](/polkadot-protocol/basics/accounts/#using-subkey){target=\_blank} CLI tool.
    ```bash
    $ subkey --network polkadot generate
    Secret phrase `pulp gaze fuel ... mercy inherit equal` is account:
      Secret seed:      0x57450b3e09ba4598 ... ... ... ... ... ... ... .. 219756eeba80bb16
      Public key (hex): 0x2ca17d26ca376087dc30ed52deb74bf0f64aca96fe78b05ec3e720a72adb1235
      Account ID:       0x2ca17d26ca376087dc30ed52deb74bf0f64aca96fe78b05ec3e720a72adb1235
      SS58 Address:     121X5bEgTZcGQx5NZjwuTjqqKoiG8B2wEAvrUFjuw24ZGZf2

    $ subkey --network polkadot generate
    Secret phrase `exercise auction soft ... obey control easily` is account:
      Secret seed:      0x5f4bbb9fbb69261a ... ... ... ... ... ... ... .. 4691ed7d1130fbbd
      Public key (hex): 0xda04de6cd781c98acf0693dfb97c11011938ad22fcc476ed0089ac5aec3fe243
      Account ID:       0xda04de6cd781c98acf0693dfb97c11011938ad22fcc476ed0089ac5aec3fe243
      SS58 Address:     15vrtLsCQFG3qRYUcaEeeEih4JwepocNJHkpsrqojqnZPc2y
    ```

This example will use the `signer submit` command, which will create and submit the transaction. The
`signer sendOffline` command has the exact same API, but will not broadcast the transaction.
`submit` and `sendOffline` must be connected to a node to fetch the current metadata and construct a
valid transaction.

Let's start by installing the Signer CLI:

```bash
npm install -g @polkadot/signer-cli
```

And spinning up a network to test our transactions:

```
npx @acala-network/chopsticks --config=polkadot -p 9944
```
We should get a Polkadot network running on port 9944.

> If you are new to chopsticks, you can checkout the [chopsticks guide](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank}.

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

For example, let's send 0.5 DOT from `121X5bEgTZcGQx5NZjwuTjqqKoiG8B2wEAvrUFjuw24ZGZf2` to `15vrtLsCQFG3qRYUcaEeeEih4JwepocNJHkpsrqojqnZPc2y` using `polkadot-js-signer`.

First we call submit to create the transaction and give us the payload to sign:

```bash
polkadot-js-signer submit --account 121X5bEgTZcGQx5NZjwuTjqqKoiG8B2wEAvrUFjuw24ZGZf2 --ws ws://127.0.0.1:9944 balances.transferKeepAlive 15vrtLsCQFG3qRYUcaEeeEih4JwepocNJHkpsrqojqnZPc2y 5000000000
```

This will return a payload to sign and an input waiting for a signature. Something like this:

```
Payload: 0x040300ff4a83f1...a8239139ff3ff7c3f6
Signature>
```

Take this payload and use your normal signing environment (e.g. air gapped machine, VM, etc.). In a separate tab in your terminal, sign the payload:

```bash
polkadot-js-signer sign --account 121X5bEgTZcGQx5NZjwuTjqqKoiG8B2wEAvrUFjuw24ZGZf2 --seed "pulp gaze fuel ... mercy inherit equal" --type sr25519 0x040300ff4a83f1...a8239139ff3ff7c3f6
```

This will output the signature of the transaction:
```
Signature: 0xe6facf194a8e...413ce3155c2d1240b
```

Paste this signature into the `submit`'s signature field, and send the transaction (or just return the serialized transaction if using `sendOffline`).

By default, submit will create a mortal extrinsic with a lifetime of 50 blocks. 
Assuming a six-second block time, you will have five minutes to go offline, sign the transaction, paste the signature, and submit the signed transaction.

!!!note "Submitting Pre-Signed Transaction"
    You can also submit pre-signed transactions, e.g. generated using the `sendOffline` command.
    ```
    polkadot-js-signer submit --tx <signedTransaction> --ws <endpoint>
    ```

## TxWrapper

If you do not want to use the CLI for signing operations, Parity provides an SDK called
[TxWrapper Core](https://github.com/paritytech/txwrapper-core){target=\_blank} to generate and sign transactions
offline. For Polkadot, Kusama, and select parachains, use the `txwrapper-polkadot` package. Other
Substrate-based chains will have their own `txwrapper-{chain}` implementations. See the
[examples](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/README.md){target=\_blank}
for a guide.

### Creating a Transaction, Signing, and Submitting

We will need a network to run test the transaction on. 
Let's use [chopsticks](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} for this:

```
npx @acala-network/chopsticks --config=polkadot -p 9944
```
We should get a Polkadot network running on port 9944.

Next we will use the [`TxWrapper example script`](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank} to create and sign transactions.

For this we will need the [`TxWrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank} library. Let's clone [`TxWrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank}:

```
git clone https://github.com/paritytech/txwrapper-core
cd txwrapper-core
yarn install && yarn build
cd packages/txwrapper-examples
```

Build and run the [`TxWrapper Polkadot example script`](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank}:
```
yarn run build
yarn run polkadot
```

You will get output like the following:
```
Alice's SS58-Encoded Address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

Decoded Transaction
  To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3
  Amount: "10000000000"

Payload to Sign: 0xa40503008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a480700e40b54028500000000b1590f001a00000091b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3843125cd049613a7edf44b55a01efbabffcd1b962068a82070cff82314b67bbc00

Decoded Transaction
  To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3
  Amount: "10000000000"

Signature: 0x01ae703e667b3b444e3613a5f06d16bedf2460a18e52075b47c6442ebc1d316917c6d12e3aa7bbd2f8db76cc859b43134cecb4495613d8d504901de776d0642b82

Transaction to Submit: 0x45028400d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d01ae703e667b3b444e3613a5f06d16bedf2460a18e52075b47c6442ebc1d316917c6d12e3aa7bbd2f8db76cc859b43134cecb4495613d8d504901de776d0642b8285000000000503008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a480700e40b5402

Expected Tx Hash: 0xa12126a095b38f0c70331be78743329a851e33839f9b2f93a7ecc34541507891
Actual Tx Hash: 0xa12126a095b38f0c70331be78743329a851e33839f9b2f93a7ecc34541507891

Decoded Transaction
  To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3
  Amount: "10000000000"
```

The [`TxWrapper example script`](https://github.com/paritytech/txwrapper-core/blob/main/packages/txwrapper-examples/polkadot/src/polkadot.ts){target=\_blank} includes many of the reference examples below:

**Import a private key**

```ts
import { importPrivateKey } from '@substrate/txwrapper-polkadot';

const keypair = importPrivateKey(“pulp gaze fuel ... mercy inherit equal”);
```

**Derive an address from a public key**

```ts
import { deriveAddress } from '@substrate/txwrapper-polkadot';

// Public key, can be either hex string, or Uint8Array
const publicKey = “0x2ca17d26ca376087dc30ed52deb74bf0f64aca96fe78b05ec3e720a72adb1235”;
const address = deriveAddress(publicKey);
```

**Construct a transaction offline**

```ts
import { methods } from "@substrate/txwrapper-polkadot";

const unsigned = methods.balances.transferKeepAlive(
  {
    dest: "15vrtLsCQFG3qRYUcaEeeEih4JwepocNJHkpsrqojqnZPc2y",
    value: 5000000000,
  },
  {
    address: "121X5bEgTZcGQx5NZjwuTjqqKoiG8B2wEAvrUFjuw24ZGZf2",
    blockHash: "0x1fc7493f3c1e9ac758a183839906475f8363aafb1b1d3e910fe16fab4ae1b582",
    blockNumber: 4302222,
    genesisHash: "0xe3777fa922cafbff200cadeaea1a76bd7898ad5b89f7848999058b50e715f636",
    metadataRpc, // must import from client RPC call state_getMetadata
    nonce: 2,
    specVersion: 1019,
    tip: 0,
    eraPeriod: 64, // number of blocks from checkpoint that transaction is valid
    transactionVersion: 1,
  },
  {
    metadataRpc,
    registry, // Type registry
  }
);
```

**Construct a signing payload**

```ts
import { methods, createSigningPayload } from '@substrate/txwrapper-polkadot';

// See "Construct a transaction offline" for "{...}"
const unsigned = methods.balances.transferKeepAlive({...}, {...}, {...});
const signingPayload = createSigningPayload(unsigned, { registry });
```

**Serialize a signed transaction**

```ts
import { createSignedTx } from "@substrate/txwrapper-polkadot";

// Example code, replace `signWithAlice` with actual remote signer.
// An example is given here:
// https://github.com/paritytech/txwrapper-core/blob/b213cabf50f18f0fe710817072a81596e1a53cae/packages/txwrapper-core/src/test-helpers/signWithAlice.ts
const signature = await signWithAlice(signingPayload);
const signedTx = createSignedTx(unsigned, signature, { metadataRpc, registry });
```

**Decode payload types**

You may want to decode payloads to verify their contents prior to submission.

```ts
import { decode } from "@substrate/txwrapper-polkadot";

// Decode an unsigned tx
const txInfo = decode(unsigned, { metadataRpc, registry });

// Decode a signing payload
const txInfo = decode(signingPayload, { metadataRpc, registry });

// Decode a signed tx
const txInfo = decode(signedTx, { metadataRpc, registry });
```

**Check a transaction's hash**

```ts
import { getTxHash } from ‘@substrate/txwrapper-polkadot’;
const txHash = getTxHash(signedTx);
```

## Additional Libraries for Submitting a Transaction

Other than Polkadot JS Tools and TXWrapper, there are several other libraries that can also be used to submit a signed payload such as the [Sidecar API](/develop/toolkit/api-libraries/sidecar/#sidecar-api){target=\_blank} or using RPC calls with `author_submitExtrinsic` or `author_submitAndWatchExtrinsic`, the latter of which will subscribe you to events to be notified as a transaction gets validated and included in the chain. You can see all the available libraries in the [API Libraries](/develop/toolkit/api-libraries/) section of the Polkadot Docs.
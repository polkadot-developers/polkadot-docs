---
title: Transfer Tokens Between Parachains
description: A step-by-step guide to using the ParaSpell XCM SDK to build, verify, and execute a transfer from one Parachain to another.
---

# Transfer Tokens Between Parachains

## Introduction

This guide walks you through transferring tokens between two parachains using the [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=\_blank}. This example utilizes [Asset Hub](/polkadot-protocol/architecture/system-chains/asset-hub/){target=\_blank} and the [People Chain](/polkadot-protocol/architecture/system-chains/people/){target=\_blank}. However, the same approach can be applied to transfers between other parachains.

For development purposes, this guide will use the [Polkadot TestNet](/develop/networks/#paseo){target=\_blank}, so the transferred token will be PAS.

In this guide, you will:

- Build an XCM transfer transaction using ParaSpell XCM SDK.
- Perform a dry run to validate the transfer.
- Verify the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement on the destination chain.
- Retrieve information regarding the transfer, along with fee estimates.
- Submit the transaction.

### Prerequisites

Before you begin, ensure you have the following:

- Knowledge of the [fundamentals of Polkadot](/polkadot-protocol/parachain-basics/){target=\_blank}.
- Basic understanding of [XCM](/develop/interoperability/intro-to-xcm/){target=\_blank}.
- Basic familiarity with JavaScript or TypeScript.
- Installed [bun](https://bun.com/docs/installation){target=\_blank}, a JavaScript and TypeScript package manager.

## Initialize Your Project

Create the project folder:

```bash
mkdir paraspell-transfer
cd paraspell-transfer
```

Initialize the JavaScript project:

```bash
bun init -y
```

Install the required dependencies:

```bash
bun add @paraspell/sdk@11.3.2 polkadot-api@1.17.1 @polkadot-labs/hdkd-helpers@0.0.25 @polkadot-labs/hdkd@0.0.24
```

Now add the following setup code to `index.ts`:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:1:27'
```

Replace the `INSERT_YOUR_SEED_PHRASE` with the seed phrase from your Polkadot development account.

Be sure to fund this account with some PAS tokens on Paseo's Asset Hub using the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000){target=\_blank}.

!!!warning "Security Warning"
    Never commit your mnemonic phrase to production code. Use environment variables or secure key management systems.

## Build a Token Transfer Transaction

The next step is to build the transaction that you intend to execute.

In this example, you will transfer 10 PAS tokens from Paseo's Asset Hub to Paseo's People Chain system parachain.

Add the ParaSpell transaction code to your `index.ts` file:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:29:47'
```

Do not execute it just yet. You will perform a dry run of this transaction first to ensure it works as expected.

## Perform a Dry Run

Dry runs simulate the transaction without broadcasting it, allowing you to confirm success in advance.

Add the following dry run code to your `index.ts` script:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:49:70'
```
Run the script using the following command:

```bash
bun run index.ts
```

The result of the dry run will look similar to the following example output:

--8<-- 'code/develop/toolkit/interoperability/paraspell/dry-run-output.html'

## Verify the Existential Deposit

Check if the recipient account meets the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement before sending by using [`verifyEdOnDestination`](https://paraspell.github.io/docs/sdk/xcmUtils.html#verify-ed-on-destination){target=\_blank}:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:72:88'
```
Comment out the `dryRunTransfer()` function so that it is not executed again. Then, execute the `verifyED()` by running the following command:

```bash
bun run index.ts
```

After that, you will get output confirming the ED which will look similar to the following:

--8<-- 'code/develop/toolkit/interoperability/paraspell/ed-verification-output.html'

## Get Transfer Info and Fee Estimates

Before sending an XCM transaction, it is helpful to estimate the fees associated with executing and delivering the cross-chain message.

ParaSpell has a helpful function for this: [`getTransferInfo()`](https://paraspell.github.io/docs/sdk/xcmUtils.html#xcm-transfer-info){target=\_blank}. This function returns an estimate of the associated XCM fees, along with the account's balance before and after the fees are paid.

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:90:106'
```

Comment out the `verifyED()` and execute the `XcmTransferInfo()` by running:

```bash
bun run index.ts
```

You should be able to see all the information for your transfer:

--8<-- 'code/develop/toolkit/interoperability/paraspell/transfer-info-output.html'

Now that you have:

- Completed a successful dry run of the transaction
- Verified the existential deposit on the recipient account
- Obtained an estimate of the associated XCM fees

Now you can execute the transfer function by adding the following statement:

Add the following code:

```typescript title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:108:108'
```

Comment out the `XcmTransferInfo()` and execute the transfer:

```bash
bun run index.ts
```

Your `transfer` function will submit the transaction, and you will get the following output:

--8<-- 'code/develop/toolkit/interoperability/paraspell/transfer-output.html'

Once the transaction is successfully included in a block, you will see the recipient's account balance updated, and you will receive output similar to the one below.

???- code "Successful Transaction Submission"
    This output will be returned once the transaction has been successfully included in a block.

    --8<-- 'code/develop/toolkit/interoperability/paraspell/transfer-callback-output.html'

After executing the transfer, check the account balance on [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo){target=\_blank} for [Paseo's Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo#/accounts){target=\_blank} and [Paseo's People Chain](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.ibp.network%2Fpeople-paseo#/accounts){target=\_blank}.

You should see:

- The recipient account now has 10 more PAS tokens.
- The sender account has the transfer amount (10 PAS) + the fees amount debited from their account balance.

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

???- code "Full Code"

    ```typescript title="index.ts"
    --8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts'
    ```

## Next Steps

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/) in the Polkadot Docs.
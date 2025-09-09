---
title: Teleport Tokens Between Polkadot Rollups
description: A step-by-step guide to building, verifying, and executing a teleport from one Polkadot Rollup to another using the ParaSpell XCM SDK.
---

# eleport Tokens Between Polkadot Rollups

## Introduction

This guide walks you through teleporting tokens between two Polkadot Rollups—[Asset Hub](/polkadot-protocol/architecture/system-chains/asset-hub/){target=\_blank} and the [People Chain](/polkadot-protocol/architecture/system-chains/people/){target=\_blank}—using the [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=\_blank}.

For development purposes, this guide will use the [Paseo TestNet](/develop/networks/#paseo){target=\_blank}, so the teleport will be from Paseo's Asset Hub to Paseo's People Chain.

You’ll learn how to:

- Build a teleport transaction.
- Perform a dry run to validate it.
- Verify the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement on the destination chain.
- Retrieve information regarding the transfer, along with fee estimates.
- Submit the transaction.

### Prerequisites

- Basic familiarity with JavaScript/TypeScript
- Knowledge of the [fundamentals of Polkadot](/polkadot-protocol/parachain-basics/){target=\_blank}

## Initialize Your Project

Create the project folder:

```bash
mkdir paraspell-teleport
cd paraspell-teleport
```

Initialize the JavaScript project:

```bash
bun init -y
```

Install the required dependencies:

```bash
bun add @paraspell/sdk polkadot-api @polkadot-labs/hdkd-helpers @polkadot-labs/hdkd
```

Now add the following setup code to `index.ts`:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:1:27'
```

Replace the `INSERT_YOUR_SEED_PHRASE ` with the seed phrase from your Polkadot development account.

Be sure to fund this account with some PAS tokens on Passeo's Asset Hub using the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000){target=\_blank}.

!!!note "Security Warning"
    Never commit your mnemonic phrase in production code. Use environment variables or secure key management systems.

## Build a Teleport Transaction

The next step is to build the transaction that you intend to execute.

In this example, you will teleport 10 PAS tokens from Paseo's Asset Hub to Paseo's People Chain system parachain.

Add the ParaSpell transaction code to your `index.ts` file:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:29:46'
```

Do not execute it just yet. You will perform a dry run of this transaction first to ensure it works as expected.

## Perform a Dry Run

Dry runs simulate the transaction without broadcasting it, allowing you to confirm success in advance.

Add the following dry run code to your `index.ts` script:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:48:68'
```
Go ahead and run the script.

```bash
bun run index.ts
```

The result of the dry run will be similar to this:

--8<-- 'code/develop/toolkit/interoperability/paraspell/dry-run-output.html'

## Verify the Existential Deposit

Check if the recipient account meets the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement before sending by using [`verifyEdOnDestination`](https://paraspell.github.io/docs/sdk/xcmUtils.html#verify-ed-on-destination){target=\_blank}:

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:70:85'
```
Execute the code by running:

```bash
bun run index.ts
```

After that, you will get output confirming the ED:

--8<-- 'code/develop/toolkit/interoperability/paraspell/ed-verification-output.html'

## Get Transfer Info and Fee Estimates

Before sending an XCM transaction, it is helpful to estimate the fees associated with executing and delivering the cross-chain message.

ParaSpell has a helpful function for this: [`getTransferInfo()`](https://paraspell.github.io/docs/sdk/xcmUtils.html#xcm-transfer-info){target=\_blank}. This function returns an estimate of the associated XCM fees, along with the account's balance before and after the fees are paid.

```ts title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:87:102'
```

Go ahead and execute the script:

```bash
bun run index.ts
```

You should be able to see all the information for your transfer:

--8<-- 'code/develop/toolkit/interoperability/paraspell/transfer-info-output.html'

Now that you have:

- Completed a successful dry run of the transaction
- Verified the existential deposit on the recipient account
- Obtained an estimate of the associated XCM fees

Now you can execute the teleport function by adding the following statement:

Add the following code:

```typescript title="index.ts"
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:104:104'
```

And execute your teleport:

```bash
bun run index.ts
```

Your `teleport` function will submit the transaction, and you will get the following output:

--8<-- 'code/develop/toolkit/interoperability/paraspell/teleport-output.html'

Once the transaction is successfully included in a block, you will see the recipient's account balance updated, and you will receive output similar to the one below.

???- code "Successful Transaction Submission"
    This output will be returned once the transaction has been successfully included in a block.

    --8<-- 'code/develop/toolkit/interoperability/paraspell/teleport-callback-output.html'

After executing the teleport, check the account balance on [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo){target=\_blank} for [Paseo's Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo#/accounts){target=\_blank} and [Paseo's People Chain](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.ibp.network%2Fpeople-paseo#/accounts){target=\_blank}.

You should see:

- The recipient account now has 10 more PAS tokens.
- The sender account has the transfer amount (10 PAS) + the fees amount debited from their account balance.

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

## Next Steps

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/) in the Polkadot Docs.
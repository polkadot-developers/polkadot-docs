---
title: ParaSpell XCM SDK – Teleport Tokens from Asset Hub to Relay Chain
description: A step-by-step guide to building, verifying, and executing a teleport from Asset Hub to Relay chain using the ParaSpell XCM SDK.
---

# Teleport Tokens from Asset Hub to Relay Chain

## Introduction

This guide will walk you through teleporting tokens from Asset Hub to the Relay chain using the [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=_blank}.
For development purposes, this guide will use the [Paseo TestNet](/develop/networks/#paseo){target=_blank}, so the teleport will be from Paseo's Asset Hub to the Paseo Relay chain.

You’ll learn how to:

- Build a teleport transaction
- Perform a dry run to validate it
- Verify the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=_blank} requirement on the destination chain
- Retrieve information regarding the transfer, along with fee estimates
- Submit the transaction

[ParaSpell](https://paraspell.github.io/docs/){target=_blank} is an open-source toolkit for simplifying cross-chain transactions in the Polkadot ecosystem. The [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=_blank} offers a builder pattern for constructing XCM messages, eliminating the need to handle parachain-specific differences.

### Prerequisites

- Basic familiarity with JavaScript/TypeScript
- Knowledge of the [fundamentals of Polkadot](/polkadot-protocol/parachain-basics/){target=_blank}

## Initialize Your Project

Create a new directory, initialize it, and install the dependencies:

```bash
mkdir paraspell-teleport
cd paraspell-teleport
bun init -y
bun add @paraspell/sdk polkadot-api @polkadot-labs/hdkd-helpers @polkadot-labs/hdkd
```

Add the following setup code to `index.ts`:

```ts
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:1:28'
```
Replace the `SEED_PHRASE` with the `SEED_PHRASE` from your Polkadot development account.
Be sure to fund this account with some PAS tokens on Passeo's Asset Hub using the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000){target=_blank}.

!!!note "Security Warning"
    Never commit your mnemonic phrase in production code. Use environment variables or secure key management systems.

## Build a Teleport Transaction

The next step is to build the transaction that you intend to execute.

In this example, you will teleport 10 PAS tokens from Asset Hub Paseo to the Paseo Relay chain:

Add the ParaSpell transaction code to your `index.ts` file:

```ts
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:30:47'
```
Do not execute it just yet. You will perform a dry run of this transaction first to ensure it works as expected.

## Perform a Dry Run

Dry runs simulate the transaction without broadcasting it, allowing you to confirm success in advance.

Add the following dry run code to your `index.ts` script:

```ts
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:49:69'
```
Go ahead and run the script.

```bash
bun run index.ts
```

The result of the dry run will be similar to this:

--8<-- 'code/develop/toolkit/interoperability/paraspell/dry-run-output.html'

## Verify the Existential Deposit

Check if the recipient account meets the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=_blank} requirement before sending:

```ts
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:71:86'
```
Execute the code.

```bash
bun run index.ts
```

You should get output confirming the ED:

--8<-- 'code/develop/toolkit/interoperability/paraspell/ed-verification-output.html'

## Get Transfer Info and Fee Estimates

Before sending an XCM transaction, it is helpful to estimate the fees associated with executing and delivering the cross-chain message.

ParaSpell has a helpful function for this: `getTransferInfo()`. This function returns an estimate of the associated XCM fees, along with the account's balance before and after the fees are paid.

```ts
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:88:103'
```
Go ahead and execute the script.

```bash
bun run index.ts
```
You should be able to see all the information for your transfer:

--8<-- 'code/develop/toolkit/interoperability/paraspell/transfer-info-output.html'

Now that you have:

- completed a successful dry run of the transaction
- verified the existential deposit on the recipient account
- obtained an estimate of the associated XCM fees
You can execute the teleport transaction with confidence.

Add the following code:

```typescript
--8<-- 'code/develop/toolkit/interoperability/paraspell/index.ts:105:105'
```
And execute your teleport:
```bash
bun run index.ts
```
Your ParaSpell `teleport()` function will submit the transaction, and you will get the following output:

--8<-- 'code/develop/toolkit/interoperability/paraspell/teleport-output.html'

Once the transaction is successfully included in a block, you will see the recipient's account balance updated, and you will get output similar to below.

???- code "Successful Transaction Submission"
    This output will be returned once the transaction has successfully been included in a block.

    --8<-- 'code/develop/toolkit/interoperability/paraspell/teleport-callback-output.html'

After executing the teleport, check the account balance on [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo#/accounts). 

You should see:

- The recipient account now has 10 more PAS tokens.
- The sender account has the transfer amount (10 PAS) + the fees amount debited from their account balance.

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

## Next Steps

- Explore other transfers: 
    - Try a parachain-to-parachain transfer or a transfer from a parachain back to the Relay chain.

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/) in the Polkadot Docs.
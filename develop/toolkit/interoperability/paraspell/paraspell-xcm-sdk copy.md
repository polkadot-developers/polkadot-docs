---
title: ParaSpell XCM SDK – Teleport PAS from AssetHubPaseo to Paseo
description: A step-by-step guide to building, verifying, and executing a PAS teleport from AssetHubPaseo to Paseo using the ParaSpell XCM SDK.
---

# ParaSpell XCM SDK – Teleport PAS from AssetHubPaseo to Paseo

## Introduction

This guide will walk you through **teleporting PAS tokens** from **AssetHubPaseo** to **Paseo** using the [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=_blank}.  
You’ll learn to:

- Build a teleport transaction
- Perform a dry run to validate it
- Verify the Existential Deposit (ED) requirement on the destination chain
- Retrieve transfer info and fee estimates
- Submit the transaction

[ParaSpell](https://paraspell.github.io/docs/){target=_blank} is an open-source toolkit for simplifying cross-chain transactions in the Polkadot ecosystem. Its SDK provides a **builder pattern** for constructing XCM messages without dealing with parachain-specific differences.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/){target=_blank} installed
- A Polkadot account with **PAS** on AssetHubPaseo to cover the transfer amount and fees
- Your account’s **12-word mnemonic** or secret seed
- Basic familiarity with JavaScript/TypeScript

---

## Initialize Your Project

Create a new directory, initialize it, and install the dependencies:

```bash
mkdir paraspell-teleport
cd paraspell-teleport
npm init -y
npm install @paraspell/sdk @polkadot-labs/hdkd-helpers @polkadot-labs/hdkd polkadot-api
```

Create a file called index.js and add the following:

```javascript
import { Builder, hasDryRunSupport } from "@paraspell/sdk";
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from "@polkadot-labs/hdkd-helpers";
import { getPolkadotSigner } from "polkadot-api/signer";
import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import { inspect } from "util";

// DOT/PAS has 10 decimals
const PAS_UNITS = 10_000_000_000n;

// Replace with your own mnemonic
const SEED_PHRASE =
  "depart thank scorpion shed dutch code above pledge insect recycle giraffe salt";

// Create Sr25519 signer from mnemonic
function getSigner() {
  const entropy = mnemonicToEntropy(SEED_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const keyPair = derive("");
  return getPolkadotSigner(
    keyPair.publicKey,
    "Sr25519",
    keyPair.sign
  );
}

const RECIPIENT_ADDRESS = ss58Address(getSigner().publicKey);
const SENDER_ADDRESS = ss58Address(getSigner().publicKey);
```

!!! note "Security Warning"
Never commit your mnemonic phrase in production code. Use environment variables or secure key management systems.

## Build a Teleport Transaction

Now you can create the teleport transaction from `AssetHubPaseo` to `Paseo`:

```javascript
async function teleport() {
  const signer = getSigner();

  const tx = await Builder()
    .from("AssetHubPaseo")
    .to("Paseo")
    .currency({
      symbol: "PAS",
      amount: 10n * PAS_UNITS, // 10 PAS
    })
    .address(RECIPIENT_ADDRESS)
    .build();

  console.log("Built transaction:", inspect(tx, { colors: true, depth: null }));

  const result = await tx.signAndSubmit(signer);
  console.log(inspect(result, { colors: true, depth: null }));
}
```
Do not execute it yet. We will be dry-running it first to ensure that the transaction works.

## Perform a Dry Run

Dry runs simulate the transaction without broadcasting it, allowing you to confirm success in advance:

```javascript
async function dryRunTeleport() {
  if (!hasDryRunSupport("AssetHubPaseo")) {
    console.log("Dry run is not supported on AssetHubPaseo.");
    return;
  }

  const tx = await Builder()
    .from("AssetHubPaseo")
    .to("Paseo")
    .currency({
      symbol: "PAS",
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .dryRun();

  console.log(inspect(tx, { colors: true, depth: null }));
}

dryRunTeleport();
```
Go ahead and run the script.

```bash
node index.js
```

## Verify the Existential Deposit

You can check if the destination account meets the ED requirement before sending:

```javascript
async function verifyED() {
  const isValid = await Builder()
    .from("AssetHubPaseo")
    .to("Paseo")
    .currency({
      symbol: "PAS",
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .verifyEdOnDestination();

  console.log(`ED verification ${isValid ? "successful" : "failed"}.`);
}

verifyED();
```

## Get Transfer Info and Fee Estimates

Before sending, it’s useful to check estimated fees and balances:

```javascript
async function XcmTransferInfo() {
  const info = await Builder()
    .from("AssetHubPaseo")
    .to("Paseo")
    .currency({
      symbol: "PAS",
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .getTransferInfo();

  console.log("Transfer Info:", info);
}

XcmTransferInfo();
```

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

## Next Steps

- Explore other transfers: Try a parachain-to-parachain transfer or a transfer from a parachain back to the Relay chain.

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/) in the Polkadot Docs.
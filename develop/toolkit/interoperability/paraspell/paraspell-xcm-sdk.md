---
title: ParaSpell XCM SDK (Quick Start)
description: A step-by-step guide on sending a cross-chain transfer on Polkadot using the ParaSpell XCM SDK. Learn to build, estimate fees, and send transactions.
---

# ParaSpell XCM SDK (Quick Start)

## Introduction

This guide provides a hands-on walkthrough of using the ParaSpell XCM SDK to perform a cross-chain transfer. You will learn how to send DOT from the Polkadot Relay Chain to an address on the Acala parachain.

[ParaSpell](https://paraspell.github.io/docs/){target=\_blank} is an open-source suite of tools designed to simplify the complexities of the Cross-Consensus Messaging (XCM) protocol within the Polkadot ecosystem. Its primary goal is to provide developers with a unified and streamlined experience for building interoperable dApps, abstracting away the implementation differences between parachains and saving valuable development time.

The **[ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html)** is the core library for integrating XCM into your applications. It offers a user-friendly builder pattern to easily construct and dispatch XCM messages, supporting both PolkadotJS and Polkadot API. This Quick Start guide will walk you through installing the SDK, building a cross-chain transfer from the Polkadot Relay Chain to the Acala parachain, estimating fees, and handling the transaction results.

### Prerequisites

- You have [Node.js](https://nodejs.org/en/download/){target=\_blank} installed.
- You have a Polkadot account with a small amount of **DOT** to pay for transaction fees and the transfer amount.
- You have access to your account's 12-word mnemonic phrase or secret seed to sign the transaction.
- You have a basic understanding of JavaScript/TypeScript.

---

## Initialize Your Project

First, create a new directory for your project, navigate into it, and initialize a new Node.js project.

```bash
mkdir paraspell-transfer
cd paraspell-transfer
bun init -y
```

Now, install the required dependencies: @paraspell/xcm-sdk and @polkadot/api.

```bash
bun add @paraspell/sdk @polkadot/api
```

The `bun init` command created a file named `index.ts`. Replace its contents with the following script.

```typescript
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { Builder } from '@paraspell/xcm-sdk';
import { KeyringPair } from '@polkadot/keyring/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';

const main = async () => {
  // 1. Initialize API and Signer
  const wsProvider = new WsProvider('wss://rpc.polkadot.io');
  const api: ApiPromise = await ApiPromise.create({ provider: wsProvider });
  const keyring = new Keyring({ type: 'sr25519' });
  const mnemonic = 'your twelve words here another twelve words here another twelve words here';
  const account: KeyringPair = keyring.addFromMnemonic(mnemonic);

  console.log(`Initialized with signer address: ${account.address}`);

  // 2. Define transfer parameters
  const destination = 'Acala';
  const currency = 'DOT';
  const amount = '10000000000'; // 1 DOT
  const recipientAddress = '231iAgsG6t9o4J52mN442i1A1W8XAH1p834p1m13x2nCq54Y';

  // 3. Build the extrinsic
  console.log(`Building extrinsic to send ${amount} ${currency} to ${recipientAddress} on ${destination}...`);
  const xt: SubmittableExtrinsic<'promise'> = Builder(api)
    .to(destination)
    .currency(currency)
    .amount(amount)
    .address(recipientAddress)
    .build();

  // 4. Estimate fees
  const paymentInfo = await xt.paymentInfo(account);
  console.log(`Estimated transaction fee: ${paymentInfo.partialFee.toHuman()}`);

  // 5. Sign and send, handling the results
  const unsub = await xt.signAndSend(account, ({ status, events, dispatchError }) => {
    if (status.isInBlock) {
      console.log(`Transaction included in block: ${status.asInBlock}`);
    }

    if (status.isFinalized) {
      console.log(`Transaction finalized in block: ${status.asFinalized}`);
      
      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { docs, name, section } = decoded;
          console.error(`❌ Dispatch Error: ${section}.${name}: ${docs.join(' ')}`);
        } else {
          console.error(`❌ Dispatch Error: ${dispatchError.toString()}`);
        }
      } else {
        const successEvent = events.find(({ event }) => api.events.xcmPallet.Attempted.is(event));
        if (successEvent) {
          console.log('✅ XCM message successfully processed!');
        } else {
          console.error('❌ XCM message execution failed.');
        }
      }
      
      unsub();
      process.exit(0);
    }
  });
};

main().catch(console.error).finally(() => console.log('Script finished. Waiting for finalization...'));
```

## Set Up the API and Signer

Open index.js in your code editor. The first step is to import the necessary modules and establish a connection to a Polkadot node. Since our transfer originates from the Relay Chain, we will connect to a public Polkadot RPC endpoint. You will also set up a keyring to load your account and sign the transaction.

```javascript
// index.js

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { Builder } from '@paraspell/xcm-sdk';

// Main function to run the script
const main = async () => {
  // 1. Initialize the Polkadot API
  const wsProvider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  // 2. Initialize a keyring to sign transactions
  const keyring = new Keyring({ type: 'sr25519' });
  
  // Replace with your own 12-word mnemonic phrase
  const mnemonic = 'your twelve words here another twelve words here another twelve words here';
  const account = keyring.addFromMnemonic(mnemonic); 

  console.log(`Initialized with signer address: ${account.address}`);
  
  // The rest of our code will go here...
};

main().catch(console.error).finally(() => console.log('Script finished'));
```

!!!note "Security Warning"
    Never hardcode your mnemonic phrase in production code. This is for demonstration purposes only. Consider using environment variables or other secure methods for handling secrets.

## Build the XCM Transfer

With the setup complete, you can now use the SDK's Builder function to construct the XCM extrinsic. The builder provides a clean, chainable interface that makes defining the transfer straightforward.

Add the following code inside your main function:

```javascript
// ...inside the main function

// 3. Define transfer parameters
const destination = 'Acala';
const currency = 'DOT';
const amount = '10000000000'; // Represents 1 DOT (DOT has 10 decimals)
const recipientAddress = '231iAgsG6t9o4J52mN442i1A1W8XAH1p834p1m13x2nCq54Y'; // An example Acala address

// 4. Use the builder to create the extrinsic
console.log(`Building extrinsic to send ${amount} ${currency} to ${recipientAddress} on ${destination}...`);
const xt = Builder(api)
  .to(destination)
  .currency(currency)
  .amount(amount)
  .address(recipientAddress)
  .build();
```

### Estimate Fees and Send the Transaction

Before dispatching the transaction, it's good practice to estimate the fees. The SDK makes this easy. After that, you can sign and send the transaction, using a callback function to listen for status updates and determine the final outcome.

Add this final piece of code to your main function:

```javascript
// ...inside the main function

// 5. Get the payment info to estimate fees
const paymentInfo = await xt.paymentInfo(account);
console.log(`Estimated transaction fee: ${paymentInfo.partialFee.toHuman()}`);

// 6. Sign and send the transaction
const unsub = await xt.signAndSend(account, ({ status, events, dispatchError }) => {
  if (status.isInBlock) {
    console.log(`Transaction included in block: ${status.asInBlock}`);
  }

  if (status.isFinalized) {
    console.log(`Transaction finalized in block: ${status.asFinalized}`);

    // Check for errors during transaction dispatch
    if (dispatchError) {
      if (dispatchError.isModule) {
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        const { docs, name, section } = decoded;
        console.error(`❌ Dispatch Error: ${section}.${name}: ${docs.join(' ')}`);
      } else {
        console.error(`❌ Dispatch Error: ${dispatchError.toString()}`);
      }
    } else {
      // Check events for the outcome of the XCM message itself
      const successEvent = events.find(
        ({ event }) => api.events.xcmPallet.Attempted.is(event)
      );
      if (successEvent) {
        console.log('✅ XCM message successfully processed!');
      } else {
        // The extrinsic was successful, but the XCM message failed to execute
        console.error('❌ XCM message execution failed.');
      }
    }
    
    unsub(); // Unsubscribe from status updates
    process.exit(0); // Exit the script
  }
});
```

## Putting It All Together

Here is the complete index.js file for you to review and run.

```javascript
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { Builder } from '@paraspell/xcm-sdk';

const main = async () => {
  // 1. Initialize the Polkadot API
  const wsProvider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider: wsProvider });

  // 2. Initialize a keyring to sign transactions
  const keyring = new Keyring({ type: 'sr25519' });
  const mnemonic = 'your twelve words here another twelve words here another twelve words here';
  const account = keyring.addFromMnemonic(mnemonic); 

  console.log(`Initialized with signer address: ${account.address}`);

  // 3. Define transfer parameters
  const destination = 'Acala';
  const currency = 'DOT';
  const amount = '10000000000'; // 1 DOT
  const recipientAddress = '231iAgsG6t9o4J52mN442i1A1W8XAH1p834p1m13x2nCq54Y';

  // 4. Use the builder to create the extrinsic
  console.log(`Building extrinsic to send ${amount} ${currency} to ${recipientAddress} on ${destination}...`);
  const xt = Builder(api)
    .to(destination)
    .currency(currency)
    .amount(amount)
    .address(recipientAddress)
    .build();
  
  // 5. Get the payment info to estimate fees
  const paymentInfo = await xt.paymentInfo(account);
  console.log(`Estimated transaction fee: ${paymentInfo.partialFee.toHuman()}`);

  // 6. Sign and send the transaction, handling the results
  const unsub = await xt.signAndSend(account, ({ status, events, dispatchError }) => {
    if (status.isInBlock) {
      console.log(`Transaction included in block: ${status.asInBlock}`);
    }

    if (status.isFinalized) {
      console.log(`Transaction finalized in block: ${status.asFinalized}`);
      
      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { docs, name, section } = decoded;
          console.error(`❌ Dispatch Error: ${section}.${name}: ${docs.join(' ')}`);
        } else {
          console.error(`❌ Dispatch Error: ${dispatchError.toString()}`);
        }
      } else {
        const successEvent = events.find(
          ({ event }) => api.events.xcmPallet.Attempted.is(event)
        );
        if (successEvent) {
          console.log('✅ XCM message successfully processed!');
        } else {
          console.error('❌ XCM message execution failed.');
        }
      }
      
      unsub();
      process.exit(0);
    }
  });
};

main().catch(console.error).finally(() => console.log('Script finished. Waiting for finalization...'));
```

To run the script, execute the following command in your terminal:

```bash
node index.js
```

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

## Next Steps

- Explore other transfers: Try a parachain-to-parachain transfer or a transfer from a parachain back to the Relay Chain.

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/){target=\_blank} in the Polkadot Docs.
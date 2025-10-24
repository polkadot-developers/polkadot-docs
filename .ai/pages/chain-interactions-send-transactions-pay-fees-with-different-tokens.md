---
title: Send a Transaction While Paying the Fee with a Different Token
description: This tutorial demonstrates how to send a DOT transfer transaction while paying the fees using a different token on the Asset Hub.
url: https://docs.polkadot.com/chain-interactions/send-transactions/pay-fees-with-different-tokens/
---

# Send a Transaction While Paying the Fee with a Different Token

## Introduction

The Asset Hub provides a powerful feature that allows users to pay transaction fees using alternative tokens instead of the native token of the chain.

This tutorial demonstrates how to send a DOT transfer transaction while paying the fees using a different token (USDT in this example) on the Asset Hub.

## Environment Setup

Let's set up the development environment for this tutorial:

1. Create a new directory and initialize the project:

    ```bash
    mkdir fee-payment-tutorial && \
    cd fee-payment-tutorial
    ```

2. Initialize the project:

    ```bash
    npm init -y
    ```

3. Install dev dependencies:

    ```bash
    npm install --save-dev @types/node@^22.12.0 ts-node@^10.9.2 typescript@^5.7.3
    ```

4. Install dependencies:

    ```bash
    npm install --save @polkadot-labs/hdkd@^0.0.13 @polkadot-labs/hdkd-helpers@^0.0.13 polkadot-api@1.9.5
    ```

5. Create TypeScript configuration:

    ```bash
    npx tsc --init && npm pkg set type=module
    ```

    The command `npm pkg set type=module` is used to set the type of the project to module. This is necessary to use the `import` statement in the TypeScript code.

6. Generate Polkadot API types for Asset Hub:

    ```bash
    npx papi add assetHub -n polkadot_asset_hub
    ```

7. Create a new file called `fee-payment-transaction.ts`:

    ```bash
    touch fee-payment-transaction.ts
    ```

## Local Asset Hub Setup

Before running the script, you'll need to fork the Asset Hub locally using Chopsticks:

```bash
chopsticks -c polkadot-asset-hub
```

This command forks the Asset Hub chain, making it available at `ws://localhost:8000`. By running `polkadot-asset-hub`, you're using the Asset Hub fork with the configuration specified in the [`polkadot-asset-hub.yml`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot-asset-hub.yml){target=_blank} file. This configuration defines Alice's account with USDT assets. If you want to use a different chain, ensure the account you're using has the necessary assets.

## Implementation

In the following sections, you'll set up imports and constants, create a transaction signer, and connect to the Polkadot Asset Hub chain. Then, you'll create and send a DOT transfer transaction, requesting that fees be paid in USDT instead of DOT.

### Import Dependencies

Add the following imports to your `fee-payment-transaction.ts` file:

```typescript title="fee-payment-transaction.ts"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import { getPolkadotSigner } from "polkadot-api/signer";
import { createClient } from "polkadot-api";
import { assetHub } from "@polkadot-api/descriptors";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { MultiAddress } from "@polkadot-api/descriptors";
```

### Define Constants

Define the constants for your transaction:

```typescript title="fee-payment-transaction.ts"
const TARGET_ADDRESS = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3"; // Bob's address
const TRANSFER_AMOUNT = 3_000_000_000n; // 3 DOT
const USD_ASSET_ID = 1337;
```

### Create a Signer

Create a signer using Alice's development account:

```typescript title="fee-payment-transaction.ts"
const createSigner = async () => {
  const entropy = mnemonicToEntropy(DEV_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const hdkdKeyPair = derive("//Alice");
  const polkadotSigner = getPolkadotSigner(
    hdkdKeyPair.publicKey,
    "Sr25519",
    hdkdKeyPair.sign
  );
  return polkadotSigner;
};
```

This function will return a signer that can be used to sign the transaction.

### Setup the Client and API

Create the client connection to the local Asset Hub:

```typescript title="fee-payment-transaction.ts"
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("ws://localhost:8000") // Chopsticks Asset Hub
  )
);

const api = client.getTypedApi(assetHub);
```

### Create the Transaction

Create a standard DOT transfer transaction:

```typescript title="fee-payment-transaction.ts"
const tx = api.tx.Balances.transfer_keep_alive({
  dest: MultiAddress.Id(TARGET_ADDRESS),
  value: BigInt(TRANSFER_AMOUNT),
});
```

This creates a transaction that transfers 3 DOT to Bob's address while keeping Alice's account alive.

### Sign and Submit with Alternative Fee Payment

The key part of this tutorial is specifying an alternative asset for fee payment. This is done through the `asset` parameter in the `signAndSubmit` options:

```typescript title="fee-payment-transaction.ts"
const signer = await createSigner();

const result = await tx.signAndSubmit(signer, {
  asset: {
    parents: 0,
    interior: {
      type: "X2",
      value: [
        { type: "PalletInstance", value: 50 },
        { type: "GeneralIndex", value: BigInt(USD_ASSET_ID) },
      ],
    },
  },
});

const { txHash, ok, block, events } = result;
console.log(`Tx finalized: ${txHash} (ok=${ok})`);
console.log(`Block: #${block.number} ${block.hash} [tx index ${block.index}]`);

console.log("Events:");
for (const ev of events) {
  const type = (ev as any).type ?? "unknown";
  console.log(`- ${type}`);
}

process.exit(0);
```

This specifies that the fees should be paid using the USDT asset.

## Full Code

The full code for the complete implementation is the following:

??? code "Complete Code"

    ```typescript title="fee-payment-transaction.ts"
    import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
    import {
      DEV_PHRASE,
      entropyToMiniSecret,
      mnemonicToEntropy,
    } from "@polkadot-labs/hdkd-helpers";
    import { getPolkadotSigner } from "polkadot-api/signer";
    import { createClient } from "polkadot-api";
    import { assetHub } from "@polkadot-api/descriptors";
    import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
    import { getWsProvider } from "polkadot-api/ws-provider/node";
    import { MultiAddress } from "@polkadot-api/descriptors";

    const TARGET_ADDRESS = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3"; // Bob's address
    const TRANSFER_AMOUNT = 3_000_000_000n; // 3 DOT
    const USD_ASSET_ID = 1337;

    const createSigner = async () => {
      const entropy = mnemonicToEntropy(DEV_PHRASE);
      const miniSecret = entropyToMiniSecret(entropy);
      const derive = sr25519CreateDerive(miniSecret);
      const hdkdKeyPair = derive("//Alice");
      const polkadotSigner = getPolkadotSigner(
        hdkdKeyPair.publicKey,
        "Sr25519",
        hdkdKeyPair.sign
      );
      return polkadotSigner;
    };

    const client = createClient(
      withPolkadotSdkCompat(
        getWsProvider("ws://localhost:8000") // Chopsticks Asset Hub
      )
    );

    const api = client.getTypedApi(assetHub);

    const tx = api.tx.Balances.transfer_keep_alive({
      dest: MultiAddress.Id(TARGET_ADDRESS),
      value: BigInt(TRANSFER_AMOUNT),
    });

    const signer = await createSigner();

    const result = await tx.signAndSubmit(signer, {
      asset: {
        parents: 0,
        interior: {
          type: "X2",
          value: [
            { type: "PalletInstance", value: 50 },
            { type: "GeneralIndex", value: BigInt(USD_ASSET_ID) },
          ],
        },
      },
    });

    const { txHash, ok, block, events } = result;
    console.log(`Tx finalized: ${txHash} (ok=${ok})`);
    console.log(`Block: #${block.number} ${block.hash} [tx index ${block.index}]`);

    console.log("Events:");
    for (const ev of events) {
      const type = (ev as any).type ?? "unknown";
      console.log(`- ${type}`);
    }

    process.exit(0);
    ```

## Running the Script

To run the script:

```bash
npx ts-node fee-payment-transaction.ts
```

## Expected Output

When you run the script successfully, you should see output similar to:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx ts-node fee-payment-transaction.ts</span>
  <pre>
Tx finalized: 0x771956fdf40b3741bdc3c1e981a6daacbe5521877ad1915542e7413bb4a820bc (ok=true)
Block: #9645060 0x57710514f168b5c444c8e47b1e1a31dd9e7bc7e9a51d8d25ccdbc6053e159f6b [tx index 2]
Events:
- Assets
- Balances
- Assets
- AssetConversion
- Balances
- Balances
- AssetTxPayment
- System
</pre>
</div>
The key events to look for are:

- **Assets**: The asset was transferred.
- **Balances**: The fees were paid using the alternative asset.
- **AssetConversion**: The fees were converted to the alternative asset.
- **AssetTxPayment**: The fees were paid using the alternative asset.
- **System**: The transaction was successful.

## Conclusion

Paying transaction fees with alternative tokens on Asset Hub provides significant flexibility for users and applications.

The key takeaway is understanding how to specify alternative assets using the XCM location format, which opens up possibilities for building applications that can operate entirely using specific token ecosystems while still leveraging the full power of the network.

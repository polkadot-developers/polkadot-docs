---
title: Send Transaction Paying Fees with Different Tokens
description: This tutorial demonstrates how to send a DOT transfer transaction while paying the fees using a different token on the Asset Hub.
---

# Send Transaction Paying Fees with Different Tokens

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
    npx tsc --init
    ```

6. Generate the types for the Polkadot API for Asset Hub:

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

This command forks the Asset Hub chain, making it available at `ws://localhost:8000`. By running `polkadot-asset-hub`, you're using the Asset Hub fork with the configuration specified in the [`polkadot-asset-hub.yml`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot-asset-hub.yml){target=_blank} file.  This configuration defines the Alice account with USDT assets. If you want to use a different chain, ensure the account you're using has the necessary assets.

## Implementation

Now let's implement the fee payment transaction step by step.

### Import Dependencies

Add the following imports to your `fee-payment-transaction.ts` file:

```typescript title="fee-payment-transaction.ts"
--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts:1:12"
```

### Define Constants

Define the constants for your transaction:

```typescript title="fee-payment-transaction.ts"
--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts:14:16"
```

### Create Signer

Create a signer using Alice's development account:

```typescript title="fee-payment-transaction.ts"
--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts:18:29"
```

This function will return a signer that can be used to sign the transaction.

### Setup Client and API

Create the client connection to the local Asset Hub:

```typescript title="fee-payment-transaction.ts"
--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts:31:37"
```

### Create the Transaction

Create a standard DOT transfer transaction:

```typescript title="fee-payment-transaction.ts"
--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts:39:42"
```

This creates a transaction that transfers 3 DOT to Bob's address while keeping Alice's account alive.

### Sign and Submit with Alternative Fee Payment

The key part of this tutorial is specifying an alternative asset for fee payment. This is done through the `asset` parameter in the `signAndSubmit` options:

```typescript title="fee-payment-transaction.ts"
--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts:44:69"
```

This specifies that the fees should be paid using the USDT asset.

## Full Code

The full code for the complete implementation is the following:

??? code "Complete Code"

    ```typescript title="fee-payment-transaction.ts"
    --8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction.ts"
    ```

## Running the Script

To run the script:

```bash
npx ts-node fee-payment-transaction.ts
```

## Expected Output

When you run the script successfully, you should see output similar to:

--8<-- "code/tutorials/polkadot-sdk/parachains/system-chains/asset-hub/send-tx-paying-fees-with-different-tokens/fee-payment-transaction-output.html"

The key events to look for are:

- **Assets**: The asset was transferred
- **Balances**: The fees were paid using the alternative asset
- **AssetConversion**: The fees were converted to the alternative asset
- **AssetTxPayment**: The fees were paid using the alternative asset
- **System**: The transaction was successful

## Conclusion

Paying transaction fees with alternative tokens on Asset Hub provides significant flexibility for users and applications. 

The key takeaway is understanding how to specify alternative assets using the XCM location format, which opens up possibilities for building applications that can operate entirely using specific token ecosystems while still leveraging the full power of the network.
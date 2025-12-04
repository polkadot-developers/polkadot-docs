---
title: Calculate Transaction Fees
description: Learn how to calculate transaction fees for transfers between accounts using Polkadot-API, Polkadot.js API, and the Polkadot.js Apps UI.
categories: Basics, Transactions, Developer Tools
---

# Calculate Transaction Fees

## Introduction

Transaction fees are essential costs for executing operations on Polkadot and its parachains. Understanding how to estimate these fees helps you manage account balances and build better user experiences in your applications. 

This tutorial will guide you through different methods for calculating transaction fees.

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/){target=\_blank} version 18 or higher installed
- Basic understanding of JavaScript/TypeScript
- Test accounts with sufficient balance to pay transaction fees

!!! note
    Transaction fees on Polkadot are calculated based on three components: a base fee, a length fee (proportional to transaction size), and a weight fee (proportional to computational complexity). An optional tip can be added to prioritize transaction inclusion.

## Polkadot-API (PAPI)

[Polkadot-API](/reference/tools/papi){target=\_blank} is the modern, recommended library for building TypeScript applications with type safety and light client support.

Create a new project directory and initialize it:

```bash
mkdir fee-calculator
cd fee-calculator
npm init -y && npm pkg set type=module
```

Install the required packages:

```bash
npm install polkadot-api
npm install --save-dev typescript tsx
```

Add the Polkadot relay chain to generate type-safe descriptors:

```bash
npx papi add polkadotTestNet -w INSERT_WS_ENDPOINT
```

This command downloads the latest Polkadot metadata and generates TypeScript descriptors in the `@polkadot-api/descriptors` package. Ensure to replace `INSERT_WS_ENDPOINT` with the proper websocket endpoint. For this example, we will use the Polkadot Testnet (`wss://pas-rpc.stakeworld.io/assethub`).

Create a file named `papi-fee-calculator.ts`:

```typescript title="papi-fee-calculator.ts"
--8<-- 'code/chain-interactions/send-transactions/calculate-transaction-fees/papi-fee-calculator.ts'
```

Ensure to replace `INSERT_WS_ENDPOINT` with your WebSocket endpoint, `INSERT_ALICE_ADDRESS` with the sender's address, and `INSERT_BOB_ADDRESS` with the recipient's address.

Key aspects of the code:

- **Transaction creation**: The `api.tx.Balances.transfer_keep_alive()` method constructs a balance transfer transaction.
- **`dest` parameter**: Specifies the recipient using a `MultiAddress` type with `Id` variant.
- **`getEstimatedFees()`**: Returns the estimated fee in plancks (the smallest unit, where 1 DOT = 10^10 plancks).
- The method applies a dummy signature internally to simulate the transaction.

Execute the script using `tsx`:

```bash
npx tsx papi-fee-calculator.ts
```

You should see output similar to:

--8<-- 'code/chain-interactions/send-transactions/calculate-transaction-fees/papi-fee-calculator-output.html'

## Polkadot.js API

[Polkadot.js API](https://polkadot.js.org/docs/api/){target=\_blank} is a mature JavaScript/TypeScript library for interacting with Polkadot SDK-based chains, providing comprehensive RPC client functionality and transaction building capabilities.

In the same project directory (or a new one), install the Polkadot.js packages:

```bash
npm install @polkadot/api
```

Create a file named `polkadotjs-fee-calculator.ts`:

```typescript title="polkadotjs-fee-calculator.ts"
--8<-- 'code/chain-interactions/send-transactions/calculate-transaction-fees/polkadotjs-fee-calculator.ts'
```

Ensure to replace `INSERT_WS_ENDPOINT` with your WebSocket endpoint, `INSERT_ALICE_ADDRESS` with the sender's address, and `INSERT_BOB_ADDRESS` with the recipient's address.

Key aspects of the code:

- **Transaction creation**: The `api.tx.balances.transferKeepAlive()` method constructs a balance transfer transaction.
- **`paymentInfo()`**: Applies a dummy signature and queries the RPC endpoint for fee estimation
- **Return values**: The `partialFee` property contains the estimated fee in the smallest unit (plancks).

Execute the script using `tsx`:

```bash
npx tsx polkadotjs-fee-calculator.ts
```

You should see output similar to:

--8<-- 'code/chain-interactions/send-transactions/calculate-transaction-fees/polkadotjs-fee-calculator-output.html'

## Polkadot-JS Apps Interface

For non-programmatic fee inspection, the PolkadotJS Apps interface provides a visual way to estimate transaction fees.

Navigate to the [Polkadot-JS Apps interface](https://polkadot.js.org/apps){target=\_blank} and ensure you're connected to the Polkadot relay chain (or your desired network).

### Estimate Fees via Transfer Interface

To see fees before submitting a transfer:

1. Navigate to **Accounts** > **Accounts** in the top menu.
2. Choose an account and click **send**.
3. Fill in the transfer details:
    - **Send to address**: Enter Bob's address.
    - **Amount**: Enter the amount you wish to transfer (e.g., 1 DOT).
4. Click **Sign and Submit**.
5. The transaction fee will be displayed in the confirmation dialog before you sign.

    ![](/images/chain-interactions/send-transactions/calculate-transaction-fees/calculate-transaction-fees-01.gif)

## Where to Go Next

Now that you can calculate transaction fees, explore related guides to send transactions and manage fees in your applications.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Pay Fees with Different Tokens__

    ---

    Learn how to send transactions while paying fees using alternative tokens instead of the native chain token.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/pay-fees-with-different-tokens/)

-   <span class="badge guide">Guide</span> __Send Transactions with SDKs__

    ---

    Learn how to send signed transactions using Polkadot-API and Polkadot.js API libraries.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/with-sdks/)

-   <span class="badge guide">Guide</span> __Query Chain Data__

    ---

    Explore different methods for querying blockchain data using REST APIs, SDKs, and runtime API calls.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

</div>
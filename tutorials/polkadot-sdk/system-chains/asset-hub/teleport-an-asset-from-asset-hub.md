---
title: Teleport an Asset from a Parachain to Asset Hub
description: An in-depth guide on how to teleport a sufficient asset from Asset Hub to a Parachain
tutorial_badge: Intermediate
---

# Teleport an Asset from Asset Hub to a Parachain

## Prerequisites

Before you begin, make sure you have the following:

- Strong knowledge of [XCM (Cross-Consensus Messaging)](/develop/interoperability/intro-to-xcm/)
- Firm understanding of [sufficient and non-sufficient assets](/polkadot-protocol/architecture/system-chains/asset-hub/#sufficient-and-non-sufficient-assets)

## Introduction

Say you have the following scenario:

1. You want to send a [sufficient asset](/polkadot-protocol/architecture/system-chains/asset-hub/#sufficient-and-non-sufficient-assets) (USDC) from Asset Hub to a Parachain.
2. You don't have DOT to pay for the transaction fee.
3. You want to pay the transaction fee with the asset that you're sending.
4. The asset can be swapped for DOT on Asset Hub to cover for the XCM transfer transaction fee.

For the sake of this example, we will use the [Asset Transfer API](/develop/toolkit/interoperability/asset-transfer-api){target=\_blank} for this solution.

## Setup the Client

First, let's create an instance of the `AssetTansferApi` client along with some variables.

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:1:19'
```

## Create the XCM Transfer

Next, we will add the XCM transfer from Asset Hub to the destination parachain.

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:23:32'
```

## Estimate the Transaction Fee

Now that we have constructed the transaction, we can take the transaction and estimate the fee for the transaction.

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:35:35'
```

## Cover for the XCM Fee

We also need to include a small amount to cover for the XCM fee.

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:42:42'
```

## Swap USDC for DOT

We will now construct a swap using the assets' `MultiLocation`. This will swap the suffcient asset (USDC) for the native asset (DOT) once executed.

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:45:69'
```

## Create a Batch Transaction

Next we will create a `batch` transaction so that we can send the swap and teleport transactions all in one transaction.

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:71:74'
```

## Sign and Send the Transaction

And finally, we will execute the transaction and pay for the fee in our sufficient asset (USDC).

```typescript
--8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:78:80'
```

Expand the following item to view the full source code.

???- code "Full Code"

    ```javascript
    --8<-- 'code/tutorials/polkadot-sdk/system-chains/asset-hub/teleport-sufficient.js:1:80'
    ```

Source: [https://github.com/lrazovic/xcm-batch-example/blob/main/index.ts](https://github.com/lrazovic/xcm-batch-example/blob/main/index.ts)

Demo transaction: [https://assethub-polkadot.subscan.io/extrinsic/6657108-3](https://assethub-polkadot.subscan.io/extrinsic/6657108-3)


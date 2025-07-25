---
title: Transact
description: How to execute arbitrary calls on remote chains using the Transact instruction.
---

# Transact

The `Transact` instruction enables arbitrary cross-chain execution of pallet calls or smart contract functions.
It's one of the most powerful XCM instructions because it allows you to perform any operation that would normally be done locally on a remote chain.
However, it requires knowing implementation details of the destination chain.

## Basic structure

```typescript
XcmV5Instruction.Transact({
  call: /* The encoded call to execute */,
  origin_kind: /* OriginKind specifying how to treat the origin */,
  fallback_max_weight: /* Optional weight limit for non-v5 destinations */,
})
```

### Parameters

- **`call`**: The encoded runtime call to execute on the destination chain

- **`origin_kind`**: Specifies how the origin should be interpreted on the destination chain:

  - `SovereignAccount`: Execute as the sovereign account of the origin
  - `Superuser`: Execute with root privileges (requires special configuration)
  - `Xcm`: Execute as a generic XCM origin

- **`fallback_max_weight`**: Optional weight limit for execution:

  - `None`: Let the destination chain calculate weight automatically (requires XCMv5 support)
  - `Some(weight)`: Specify maximum weight for backward compatibility with pre-v5 chains

## Chain-specific knowledge required

Unlike other XCM instructions like `DepositAsset` or `WithdrawAsset` which are generic, `Transact` requires detailed knowledge of the destination chain:

### What you need to know

1. **Runtime metadata**: The specific pallets, calls, and their parameters available on the destination chain
2. **Call encoding**: How to properly encode the call data for the destination runtime
3. **Permissions**: What origins are allowed to execute specific calls

### Examples of chain-specific requirements

```typescript
// Example: Different chains have different ways to represent the same operation

// Asset Hub - using pallet_assets
const assetHubCall = api.tx.Assets.transfer({
  id: 1984, // USDT
  target: beneficiary,
  amount: 1_000_000n
})

// Hydration - using pallet_currencies
const hydrationCall = api.tx.Currencies.transfer({
  dest: beneficiary,
  currency_id: 10, // USDT
  amount: 1_000_000n
})
```

## Origin considerations

The choice of `origin_kind` significantly affects what operations are permitted:

- Use `SovereignAccount` for most application use cases
- `Superuser` requires special trust relationships and configuration
- Consider how the destination chain interprets different origin kinds

The `Transact` instruction is powerful but requires careful consideration of the trade-offs between flexibility and maintainability.

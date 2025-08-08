---
title: Fees
description: Explore the key differences in fee handling between XCM V4 and V5, including new payment mechanisms, delivery fees, and improved predictability for cross-chain transactions.
---

# Fees (XCM V4 → XCM V5)

XCM V5 introduces a new fee payment mechanism that simplifies and unifies how fees are handled across different types of XCM operations.

## Key Changes from V4

XCM V5 replaces the [`BuyExecution`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.BuyExecution){target=\_blank} instruction with a more predictable [`PayFees`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.PayFees){target=\_blank} approach that handles both execution and delivery fees.

### BuyExecution vs. PayFees

- **XCM V4 Approach:**

    - Used `BuyExecution` instruction that handles only execution fees.
    - Leftover assets after buying execution are returned to holding.
    - Required explicit specification of execution weight limits.
    - Delivery fees might not be found and error out.

- **XCM V5 Approach:**

    - Introduces `PayFees` instruction for unified fee handling.
    - All assets passed to `PayFees` are kept in a special `fees` register, they are _NOT_ returned to holding.
    - No need to specify weights, only assets.
    - More predictable.

### PayFees Instruction

The new `PayFees` instruction provides a cleaner interface:

```typescript
// XCM V5 - New PayFees instruction
XcmV5Instruction.PayFees({
  asset: {
    id: // Asset id for fee payment
    fun: // Amount to dedicate for fees (both execution + delivery)
  },
})
```

This replaces the more complex `BuyExecution` pattern:

```typescript
// XCM V4 - BuyExecution instruction
XcmV4Instruction.BuyExecution({
  fees: {
    id: // Asset id
    fun: // Fee amount (only execution will be charged, rest is returned to holding)
  },
  weight_limit: // Explicit weight limit
})
```

## Backward Compatibility

XCM V5 maintains backward compatibility with `BuyExecution` for existing implementations. Both instructions are supported, allowing gradual migration:

- **BuyExecution**: Still supported for compatibility with existing XCM programs
- **PayFees**: Recommended for new development and simplified fee management

## Migration Considerations

When migrating from XCM V4 to XCM V5:

- `BuyExecution` can remain in existing programs.
- New programs should use `PayFees` for better maintainability.
- Fee estimation becomes more straightforward with the new approach.
- No breaking changes to existing functionality.

When using `PayFees`, keep in mind that _ALL_ assets passed to the instruction will be entirely dedicated to fees, not returned to holding.
That's why it's more important than before to [properly estimate XCM fees](/develop/interoperability/xcm-runtime-apis/){target=\_blank}.

## `RefundSurplus` Instruction

When you overestimate fees with [`PayFees`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.PayFees){target=\_blank}, you can recover unused funds using the [`RefundSurplus`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.RefundSurplus){target=\_blank} instruction.

You can use `RefundSurplus` to put the leftover fees back into holding. This is useful when you've overestimated the fees needed for your XCM program. You can then deposit them to some account with [`DepositAsset`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.DepositAsset){target=\_blank}.

```typescript
// After all instructions that send messages.
XcmV5Instruction.RefundSurplus(),
XcmV5Instruction.DepositAsset({
  assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.All()),
  beneficiary: {
    parents: 0,
    interior: XcmV5Junctions.X1(
      XcmV5Junction.AccountId32({
        id: ACCOUNT,
        network: undefined,
      }),
    ),
  }
})
```

The `RefundSurplus` instruction:

- Takes any unused fees from the fees register.
- Moves them back to the holding register.
- Allows you to use or return the surplus assets with `DepositAsset`.

This is especially important with `PayFees` since all assets passed to it are dedicated to fees, unlike `BuyExecution` which automatically returned unused assets to holding.

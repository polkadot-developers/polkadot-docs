---
title: Fees
description: Key differences in fee handling between XCMv4 and XCMv5.
---

# Fees

XCMv5 introduces a new fee payment mechanism that simplifies and unifies how fees are handled across different types of XCM operations.

## Key changes from v4

XCMv5 replaces the `BuyExecution` instruction with a more predictable `PayFees` approach that handles both execution and delivery fees.

### BuyExecution vs PayFees

**XCMv4 approach:**
- Used `BuyExecution` instruction that handles only execution fees
- Leftover assets after buying execution are returned to holding
- Required explicit specification of execution weight limits
- Delivery fees might not be found and error out

**XCMv5 approach:**
- Introduces `PayFees` instruction for unified fee handling
- All assets passed to `PayFees` are kept in a special `fees` register, they are NOT returned to holding
- No need to specify weights, only assets
- More predictable

### PayFees instruction

The new `PayFees` instruction provides a cleaner interface:

```typescript
// XCMv5 - New PayFees instruction
XcmV5Instruction.PayFees({
  asset: {
    id: // Asset id for fee payment
    fun: // Amount to dedicate for fees (both execution + delivery)
  },
})
```

This replaces the more complex `BuyExecution` pattern:

```typescript
// XCMv4 - BuyExecution instruction
XcmV4Instruction.BuyExecution({
  fees: {
    id: // Asset id
    fun: // Fee amount (only execution will be charged, rest is returned to holding)
  },
  weight_limit: // Explicit weight limit
})
```

## Backward compatibility

XCMv5 maintains backward compatibility with `BuyExecution` for existing implementations. Both instructions are supported, allowing gradual migration:

- **BuyExecution**: Still supported for compatibility with existing XCM programs
- **PayFees**: Recommended for new development and simplified fee management

## Migration considerations

When migrating from v4 to v5:

- `BuyExecution` can remain in existing programs
- New programs should use `PayFees` for better maintainability
- Fee estimation becomes more straightforward with the new approach
- No breaking changes to existing functionality

When using `PayFees`, keep in mind that **ALL** assets passed to the instruction will be entirely dedicated to fees, not returned to holding.
That's why it's more important than before to [properly estimate XCM fees](/develop/interoperability/xcm-runtime-apis/).

## RefundSurplus

When you overestimate fees with `PayFees`, you can recover unused funds using the `RefundSurplus` instruction.

You can use `RefundSurplus` to put the leftover fees back into holding.
This is useful when you've overestimated the fees needed for your XCM program.
You can then deposit them to some account with `DepositAsset`.

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
- Takes any unused fees from the fees register
- Moves them back to the holding register
- Allows you to use or return the surplus assets with `DepositAsset`

This is especially important with `PayFees` since all assets passed to it are dedicated to fees, unlike `BuyExecution` which automatically returned unused assets to holding.

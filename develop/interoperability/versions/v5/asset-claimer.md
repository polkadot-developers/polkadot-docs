---
title: Asset claimer
description: How the AssetClaimer hint improves trapped asset recovery in XCMv5.
---

# Asset claimer

XCMv5 introduces the `AssetClaimer` execution hint through `SetHints`, which significantly simplifies the process of recovering trapped assets when XCM execution fails.

## The problem before v5

When XCM execution failed and assets became trapped:

- **Governance dependency**: Most trapped asset recovery required governance proposals
- **Complex procedures**: Manual intervention through referendum processes
- **Long delays**: Recovery could take weeks or months through governance
- **Risk of loss**: Assets could remain permanently trapped if governance didn't act
- **High barriers**: Small amounts often weren't worth the governance overhead

## The v5 solution: AssetClaimer hint

The new `AssetClaimer` hint allows XCM programs to preemptively designate who can claim trapped assets:

```typescript
// Set asset claimer before risky operations
XcmV5Instruction.SetHints({ 
  hints: [Enum('AssetClaimer', claimerLocation)] 
})
```

## How it improves the situation

### Before XCMv5
```typescript
// If this XCM fails, assets become trapped
const riskyXcm = [
  XcmInstruction.WithdrawAsset([assets]),
  XcmInstruction.BuyExecution({ fees, weight_limit }),
  XcmInstruction.Transact({ /* risky call */ }),
  XcmInstruction.DepositAsset({ assets, beneficiary })
]

// Recovery required governance intervention
```

### With XCMv5
```typescript
// Proactive asset claimer setup
const saferXcm = [
  // Anyone can now claim if execution fails
  XcmV5Instruction.SetHints({ 
    hints: [Enum('AssetClaimer', claimerLocation)] 
  }),
  XcmV5Instruction.WithdrawAsset([assets]),
  XcmV5Instruction.PayFees({ asset }),
  XcmV5Instruction.Transact({ /* risky call */ }),
  XcmV5Instruction.DepositAsset({ assets, beneficiary })
]

// Recovery can be done immediately by the claimer
```

## Key improvements

### 1. Immediate recovery
- **Before**: Wait for governance process (weeks/months)
- **After**: Designated claimer can act immediately

### 2. Reduced governance burden
- **Before**: Every trapped asset required a governance proposal
- **After**: Only complex cases need governance intervention

### 3. Predictable recovery
- **Before**: Uncertain if governance would approve recovery
- **After**: Predetermined claimer provides certainty

### 4. Lower barriers
- **Before**: Small amounts often not worth governance overhead
- **After**: Any amount can be efficiently recovered

## Best practices

### 1. Set hint early
```typescript
// Set claimer hint before any risky operations
XcmV5Instruction.SetHints({ hints: [Enum('AssetClaimer', claimerLocation)] }),
// ... other instructions that might fail
```

### 2. Use for cross-chain transfers
Particularly useful for setting local accounts on destination chains:

```typescript
// In remote_xcm for cross-chain transfers
const remoteXcm = [
  XcmV5Instruction.SetHints({ 
    hints: [Enum('AssetClaimer', {
      parents: 0,
      interior: { X1: { AccountId32: { id: localAccountId } } }
    })] 
  }),
  // ... transfer instructions
]
```

### 3. Consider origin preservation
When origin preservation is available, trapped assets are automatically associated with the original origin, making claiming easier without additional hints.

## Migration impact

This change makes XCM programs more resilient and user-friendly:

- **Reduced risk**: Assets are less likely to be permanently lost
- **Better UX**: Users can recover their own assets without waiting for governance
- **Increased adoption**: Lower risk encourages more XCM usage
- **Operational efficiency**: Reduces governance workload for routine recoveries

The `AssetClaimer` hint represents a significant improvement in XCM's fault tolerance and user experience, making cross-chain operations safer and more predictable.

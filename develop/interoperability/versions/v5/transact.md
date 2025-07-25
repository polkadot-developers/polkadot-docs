---
title: Transact in XCMv5
description: Key changes to the Transact instruction in XCMv5.
---

# Transact in XCMv5

XCMv5 improves the `Transact` instruction by introducing optional weight specification through the `fallback_max_weight` parameter, making cross-chain calls more flexible and reliable.

## Changes from v4

### Weight parameter evolution

**Previous versions:**
```typescript
// Required explicit weight specification
XcmV4Instruction.Transact({
  origin_kind: XcmV2OriginKind.SovereignAccount(),
  require_weight_at_most: {
    ref_time: 1000000000n,
    proof_size: 100000n
  },
  call: encodedCall
})
```

**XCMv5:**
```typescript
// Optional weight specification with fallback
XcmV5Instruction.Transact({
  origin_kind: XcmV2OriginKind.SovereignAccount(),
  fallback_max_weight: undefined, // or weight object for compatibility
  call: encodedCall
})
```

## The fallback_max_weight parameter

### When to use undefined
Use `fallback_max_weight: undefined` when:
- The destination chain supports XCMv5
- You want automatic weight calculation
- You prefer simplified, more reliable execution

```typescript
// Preferred approach for v5-compatible destinations
XcmV5Instruction.Transact({
  origin_kind: XcmV2OriginKind.SovereignAccount(),
  fallback_max_weight: undefined,
  call: encodedCall
})
```

### When to specify weight
Use `fallback_max_weight: { ref_time: ..., proof_size: ... }` when:
- The destination chain doesn't support XCMv5 yet
- You need backward compatibility
- You want explicit weight control

```typescript
// Backward compatibility approach
XcmV5Instruction.Transact({
  origin_kind: XcmV2OriginKind.SovereignAccount(), 
  fallback_max_weight: {
    ref_time: 1000000000n,
    proof_size: 100000n
  },
  call: encodedCall
})
```

## Benefits of the new approach

### Problems solved
The previous mandatory weight specification created:
1. **Brittle implementations**: Weight requirements changed with runtime upgrades
2. **Over/under-estimation**: Incorrect weight estimates led to failures or waste
3. **Maintenance overhead**: Constant monitoring and updates required

### XCMv5 improvements
- **Automatic weight handling**: Destination chains calculate appropriate weights when `fallback_max_weight` is `undefined`
- **Backward compatibility**: Legacy chains still work with specified weights
- **Flexibility**: Choose the approach based on destination chain capabilities
- **Reduced brittleness**: Less prone to failures from weight miscalculation

## Migration strategy

When migrating from v4 to v5:

1. **For v5-compatible destinations**: Replace `require_weight_at_most` with `fallback_max_weight: undefined`
2. **For mixed environments**: Keep weight specification for non-v5 chains
3. **Gradual transition**: Start with explicit weights and move to `undefined` as chains upgrade

## Fee implications

Fees are still required for `Transact` execution:
- Use `PayFees` or `BuyExecution` before the instruction
- With `fallback_max_weight: undefined`, fees are deducted based on actual execution weight
- Fee estimation becomes more predictable without manual weight calculations

This change makes `Transact` both more developer-friendly and backward-compatible while maintaining powerful cross-chain execution capabilities.
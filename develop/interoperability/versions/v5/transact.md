---
title: Transact
description: Explore the key changes to the Transact instruction in XCM V5, including automatic weight calculation, improved reliability, and simplified cross-chain execution patterns.
---

# Transact (XCM V4 → XCM V5)

XCM V5 improves the [`Transact`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.Transact){target=\_blank} instruction by introducing optional weight specification through the `fallback_max_weight` parameter, making cross-chain calls more flexible and reliable.

## Changes from V4

XCM V5 improves weight handling by making weight specification optional to reduce transaction failures.

### Weight Parameter Evolution

- **Previous Versions:**

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

- **XCM V5:**

    ```typescript
    // Optional weight specification with fallback
    XcmV5Instruction.Transact({
        origin_kind: XcmV2OriginKind.SovereignAccount(),
        fallback_max_weight: undefined, // or weight object for compatibility
        call: encodedCall
    })
    ```

## The `fallback_max_weight` Parameter

### When to Use `undefined`

Use `fallback_max_weight: undefined` when:

- The destination chain supports XCM V5.
- You want automatic weight calculation.
- You prefer simplified, more reliable execution.

    ```typescript
    // Preferred approach for v5-compatible destinations
    XcmV5Instruction.Transact({
        origin_kind: XcmV2OriginKind.SovereignAccount(),
        fallback_max_weight: undefined,
        call: encodedCall
    })
    ```

### When to Specify Weight

Use `fallback_max_weight: { ref_time: ..., proof_size: ... }` when:

- The destination chain doesn't support XCM V5 yet.
- You need backward compatibility.
- You want explicit weight control.

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

## Benefits of the New Approach

### Problems Solved

The previous mandatory weight specification created:

- **Brittle implementations**: Weight requirements changed with runtime upgrades.
- **Over/under-estimation**: Incorrect weight estimates that led to failures or waste.
- **Maintenance overhead**: Constant monitoring and updates required.

### XCM V5 Improvements

- **Automatic weight handling**: Destination chains calculate appropriate weights when `fallback_max_weight` is `undefined`.
- **Backward compatibility**: Legacy chains still work with specified weights.
- **Flexibility**: Choose the approach based on destination chain capabilities.
- **Reduced brittleness**: Less prone to failures from weight miscalculation.

## Migration Strategy

When migrating from XCM V4 to XCM V5:

- **For V5-compatible destinations**: Replace `require_weight_at_most` with `fallback_max_weight: undefined`.
- **For mixed environments**: Keep weight specification for non-v5 chains.
- **Gradual transition**: Start with explicit weights and move to `undefined` as chains upgrade.

## Fee Implications

Fees are still required for `Transact` execution:

- Use `PayFees` or `BuyExecution` before the instruction.
- With `fallback_max_weight: undefined`, fees are deducted based on actual execution weight.
- Fee estimation becomes more predictable without manual weight calculations.

This change makes `Transact` both more developer-friendly and backward-compatible while maintaining powerful cross-chain execution capabilities.
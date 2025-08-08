---
title: Writing XCM Programs
description: Learn how to write XCM programs in version 5, including new execution patterns, instruction syntax, and best practices for cross-chain communication.
---

# Writing XCM Programs (XCM V4 → XCM V5)

XCM V5 shifts the recommended approach from using dedicated extrinsics to executing raw XCM programs directly.

## The Paradigm Shift

### Previous Approach

The previous approach was to use specialized extrinsics in `pallet-xcm` and `xtokens` for different operations:

- Used specialized extrinsics in `pallet-xcm` and `xtokens`.
- Separate functions for different operations:
    - `limited_teleport_assets`
    - `limited_reserve_transfer_assets`
    - `claim_assets`

Each new use case required a new extrinsic.

### XCM V5 Recommendation

- Craft raw XCM programs directly.
- Use `pallet_xcm::execute()` for execution.
- Compose instructions within programs.
- No new extrinsics needed for custom use cases.

## Execution Approach

XCM V5 promotes using `execute()` directly:

```typescript
// XCM V5 recommended approach
const tx = api.tx.PolkadotXcm.execute({
  message: xcm, // The XCM program
  max_weight: weight, // Weight limit for execution
})
```

This provides more flexibility than calling specialized extrinsics:

```typescript
// Previous approach - specialized extrinsics
api.tx.PolkadotXcm.limitedTeleportAssets(...)
api.tx.PolkadotXcm.limitedReserveTransferAssets(...)
api.tx.PolkadotXcm.claimAssets(...)
```

## Benefits of Direct Execution

1. **Flexibility**: Full control over XCM instruction sequences.
2. **Composability**: Combine multiple operations in a single program.
3. **Extensibility**: Custom use cases without new extrinsics.
4. **Maintainability**: Fewer specialized functions to maintain.

## Migration Considerations

- Existing dedicated extrinsics continue to work.
- No breaking changes to existing programs.
- New development should prefer `execute()` for better flexibility.
- Gradual migration path available for existing applications.
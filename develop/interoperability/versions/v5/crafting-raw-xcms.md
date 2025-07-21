---
title: Executing XCM programs in v5
description: Changes in XCM program execution approach in v5.
---

# Executing XCM programs in v5

XCMv5 shifts the recommended approach from using dedicated extrinsics to executing raw XCM programs directly.

## The paradigm shift

### Previous approach
- Used specialized extrinsics in `pallet-xcm` and `xtokens`
- Separate functions for different operations:
  - `limited_teleport_assets`
  - `limited_reserve_transfer_assets`
  - `claim_assets`
- Each new use case required a new extrinsic

### XCMv5 recommendation
- Craft raw XCM programs directly
- Use `pallet_xcm::execute()` for execution
- Compose instructions within programs
- No new extrinsics needed for custom use cases

## Execution approach

XCMv5 promotes using `execute()` directly:

```typescript
// XCMv5 recommended approach
const tx = api.tx.PolkadotXcm.execute({
  message: xcm, // Your XCM program
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

## Benefits of direct execution

1. **Flexibility**: Full control over XCM instruction sequences
2. **Composability**: Combine multiple operations in a single program
3. **Extensibility**: Custom use cases without new extrinsics
4. **Maintainability**: Fewer specialized functions to maintain

## Migration considerations

- Existing dedicated extrinsics continue to work
- No breaking changes to existing programs
- New development should prefer `execute()` for better flexibility
- Gradual migration path available for existing applications
---
title: Transfers
description: Key differences in transfer handling between XCMv4 and XCMv5.
---

# Transfers

XCMv5 introduces the unified [`InitiateTransfer`](https://paritytech.github.io/polkadot-sdk/master/xcm/v5/instruction/enum.Instruction.html#variant.InitiateTransfer){target=\_blank} instruction that consolidates and enhances cross-chain transfer capabilities.

## Changes from v4

### Instruction consolidation

**Previous versions:**
- `InitiateTeleport` - For teleport transfers
- `InitiateReserveWithdraw` - For reserve withdrawals  
- `DepositReserveAsset` - For reserve deposits
- Separate instructions for different transfer types

**XCMv5:**
- Single `InitiateTransfer` instruction for all transfer types
- Transfer type specified within the instruction parameters
- Unified interface with enhanced capabilities

### Enhanced transfer specification

**Previous approach:**
```typescript
// Separate instructions for different transfer types
XcmV4Instruction.InitiateTeleport({ /* teleport params */ })
XcmV4Instruction.InitiateReserveWithdraw({ /* reserve params */ })
```

**XCMv5 approach:**
```typescript
// Unified instruction with transfer type specification
XcmV5Instruction.InitiateTransfer({
  destination: /* location */,
  remote_fees: Enum('ReserveDeposit', /* fee asset */),
  preserve_origin: false,
  assets: [
    Enum('Teleport', /* teleport assets */),
    Enum('ReserveDeposit', /* reserve assets */)
  ],
  remote_xcm: /* remote execution */
})
```

## Key enhancements

### 1. Mixed transfer types
XCMv5 allows mixing different transfer types in a single transaction:
- Teleport some assets while reserve-transferring others
- Use different transfer types for fees vs. main assets
- More flexible asset handling in complex scenarios

### 2. Origin preservation
New `preserve_origin` parameter enables:
- Maintaining the original sender's identity on destination chains
- Executing transactions (`Transact`) on behalf of the origin
- More sophisticated cross-chain operations

**Important**: Origin preservation requires specific configuration on the destination chain.
If the destination chain doesn't support it, transfers with `preserve_origin: true` will fail.
Setting `preserve_origin: false` will work as before, regardless of destination chain configuration.

### 3. Integrated fee handling
Built-in `remote_fees` parameter:
- Automatic `PayFees` instruction insertion on destination
- Cleaner fee specification with transfer type
- Better fee management across chains

## Backward compatibility

XCMv5 maintains full backward compatibility:
- Previous transfer instructions (`InitiateTeleport`, `InitiateReserveWithdraw`, `DepositReserveAsset`) remain available
- Existing XCM programs continue to work without modification
- Gradual migration path to the new unified approach

## Migration benefits

Moving to `InitiateTransfer` provides:
- **Simplified development**: Single instruction for all transfer scenarios
- **Enhanced flexibility**: Mix transfer types and preserve origins  
- **Better maintainability**: Fewer instruction types to manage
- **Future-proofing**: Foundation for additional transfer enhancements

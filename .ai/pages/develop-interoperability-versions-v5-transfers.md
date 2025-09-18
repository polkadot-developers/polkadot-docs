---
title: Transfers
description: Explore the key differences in transfer handling between XCM V4 and V5, including unified transfer instructions, multiple asset types, and improved cross-chain transfer capabilities.
url: https://docs.polkadot.com/develop/interoperability/versions/v5/transfers/
---

# Transfers (XCM V4 → XCM V5)

XCM V5 introduces the unified [`InitiateTransfer`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.InitiateTransfer){target=\_blank} instruction that consolidates and enhances cross-chain transfer capabilities.

## Changes from v4

### Instruction Consolidation

- **Previous versions:**

    - `InitiateTeleport`: For teleport transfers.
    - `InitiateReserveWithdraw`: For reserve withdrawals.  
    - `DepositReserveAsset`: For reserve deposits.
    - Separate instructions for different transfer types.

- **XCM V5:**

    - Single `InitiateTransfer` instruction for all transfer types.
    - Transfer type specified within the instruction parameters.
    - Unified interface with enhanced capabilities.

### Enhanced Transfer Specification

- **Previous approach:**

    ```typescript
    // Separate instructions for different transfer types
    XcmV4Instruction.InitiateTeleport({ /* teleport params */ })
    XcmV4Instruction.InitiateReserveWithdraw({ /* reserve params */ })
    ```

- **XCM V5 approach:**

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

## Key Enhancements

### Mixed Transfer Types

XCM V5 allows mixing different transfer types in a single transaction:

- Teleport some assets while reserve-transferring others.
- Use different transfer types for fees vs. main assets.
- More flexible asset handling in complex scenarios.

### Origin Preservation

The new `preserve_origin` parameter enables:

- Maintaining the original sender's identity on destination chains.
- Executing transactions (`Transact`) on behalf of the origin.
- More sophisticated cross-chain operations.

!!! note "Important"

    Origin preservation requires a specific configuration on the destination chain.
    If the destination chain doesn't support it, transfers with `preserve_origin: true` will fail.
    Setting `preserve_origin: false` will continue to work as before, regardless of the destination chain configuration.

### Integrated Fee Handling

Built-in `remote_fees` parameter:

- Automatic `PayFees` instruction insertion on destination.
- Cleaner fee specification with transfer type.
- Better fee management across chains.

## Backward Compatibility

XCM V5 maintains full backward compatibility:

- Previous transfer instructions `InitiateTeleport`, `InitiateReserveWithdraw`, `DepositReserveAsset` remain available.
- Existing XCM programs continue to work without modification.
- Gradual migration path to the new unified approach.

## Migration Benefits

Moving to `InitiateTransfer` provides:

- **Simplified development**: Single instruction for all transfer scenarios.
- **Enhanced flexibility**: Mix transfer types and preserve origins.
- **Better maintainability**: Fewer instruction types to manage.
- **Future-proofing**: Foundation for additional transfer enhancements.

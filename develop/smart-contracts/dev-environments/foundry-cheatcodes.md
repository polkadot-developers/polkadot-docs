---
title: Foundry-Polkadot Cheatcodes
description: Complete reference of supported cheatcodes for testing with forge test --polkadot=evm or --polkadot=pvm.
---

# Foundry-Polkadot Cheatcodes

This page lists all cheatcodes supported by `foundry-polkadot` when running tests with `forge test --polkadot=evm` or `forge test --polkadot=pvm`. Cheatcodes allow you to manipulate the testing environment, mock calls, and make assertions.

## Test Execution Model

When running tests with `--polkadot=evm` or `--polkadot=pvm`, `foundry-polkadot` uses a hybrid execution model:

**Where Tests Run:**

- **Test Contract**: Your test contract (implementing `Test` or `DSTest`) runs inside Foundry's standard REVM (EVM)
- **Contract Execution**: Deployed contracts execute inside the Polkadot runtime (pallet-revive) using the specified backend (EVM or PVM)

**Opcode Interception:**

Specific EVM operations are intercepted and redirected to the Polkadot runtime:

| Opcode                                 | Behavior                                                                        |
|----------------------------------------|---------------------------------------------------------------------------------|
| `CREATE` / `CREATE2`                   | Contract deployment happens in Polkadot runtime instead of Foundry REVM         |
| `CALL` / `STATICCALL` / `DELEGATECALL` | Contract calls execute in Polkadot runtime instead of Foundry REVM              |

**State Synchronization:**

To maintain consistency between Foundry's REVM and the Polkadot runtime, a diff-based state bridging mechanism is used:

1. **Polkadot → REVM**: Storage changes from Polkadot runtime execution are synced back to Foundry's REVM
2. **REVM → Polkadot**: State modifications via cheatcodes (like `vm.store`, `vm.deal`) are applied to the Polkadot runtime

This ensures cheatcodes work correctly and test assertions can read state from contracts executing in the Polkadot runtime.

!!!warning "Cheatcode Limitations"

    Cheatcodes are only handled in the top-level test contract, not in nested contracts. This differs from original Foundry behavior.

## Polkadot-Specific Cheatcodes

These cheatcodes are specific to the Polkadot integration and control runtime behavior.

### `vm.polkadotSkip`

When running in Polkadot context, skips the next `CREATE` or `CALL` operation, executing it on the Foundry EVM instead of the Polkadot runtime. All contracts deployed within this skip will automatically have their calls executed in Foundry EVM without needing to mark each call location.

```solidity
vm.polkadotSkip();
```

**Example:**

```solidity
function testMixedExecution() public {
    // This deploys in Polkadot runtime
    MyContract polkadotContract = new MyContract();

    // Skip next CREATE - deploys in Foundry EVM
    vm.polkadotSkip();
    MyContract foundryContract = new MyContract();

    // All calls to foundryContract will automatically execute in Foundry EVM
    foundryContract.someFunction();
}
```

### `vm.polkadot`

Switches between Polkadot runtime and standard Foundry EVM, or between different Polkadot backends.

```solidity
// Switch to/from Polkadot runtime (uses CLI-specified backend)
vm.polkadot(bool enable);

// Switch to/from Polkadot runtime with specific backend
vm.polkadot(bool enable, string memory runtime);
```

**Parameters:**

- `enable` - `true` to switch to Polkadot runtime, `false` to switch back to Foundry EVM
- `runtime` - Backend to use: `"evm"` or `"pvm"`. When omitted, uses the last explicitly set backend, or the CLI-specified backend if none was set yet

**Example:**

```solidity
function testCrossRuntime() public {
    // Deploy in standard Foundry EVM
    vm.polkadot(false);
    MyContract contract1 = new MyContract();

    // Deploy in Polkadot EVM runtime
    vm.polkadot(true, "evm");
    MyContract contract2 = new MyContract();

    // Deploy in Polkadot PVM runtime
    vm.polkadot(true, "pvm");
    MyContract contract3 = new MyContract();
}
```

## Block and Environment Manipulation

These cheatcodes allow you to control block properties and the execution environment.

### `vm.warp`

Sets the block timestamp.

```solidity
vm.warp(uint256 newTimestamp);
```

### `vm.roll`

Sets the block number.

```solidity
vm.roll(uint256 newHeight);
```

### `vm.fee`

Sets the block base fee.

```solidity
vm.fee(uint256 newBasefee);
```

### `vm.chainId`

Sets the chain ID.

```solidity
vm.chainId(uint256 newChainId);
```

### `vm.coinbase`

Sets the block coinbase address.

```solidity
vm.coinbase(address newCoinbase);
```

### `vm.txGasPrice`

Sets the transaction gas price.

```solidity
vm.txGasPrice(uint256 newGasPrice);
```

### `vm.setBlockhash`

Sets the blockhash for a specific block number.

```solidity
vm.setBlockhash(uint256 blockNumber, bytes32 blockHash);
```

### `vm.getBlockNumber`

Returns the current block number.

```solidity
uint256 height = vm.getBlockNumber();
```

### `vm.getBlockTimestamp`

Returns the current block timestamp.

```solidity
uint256 timestamp = vm.getBlockTimestamp();
```

## Account Manipulation

These cheatcodes manipulate account state and caller identity.

### `vm.deal`

Sets the balance of an address.

```solidity
vm.deal(address account, uint256 newBalance);
```

### `vm.prank`

Sets `msg.sender` for the next call only.

```solidity
vm.prank(address msgSender);
vm.prank(address msgSender, address txOrigin);
vm.prank(address msgSender, bool delegateCall);
vm.prank(address msgSender, address txOrigin, bool delegateCall);
```

### `vm.startPrank`

Sets `msg.sender` for all subsequent calls until `stopPrank` is called.

```solidity
vm.startPrank(address msgSender);
vm.startPrank(address msgSender, address txOrigin);
vm.startPrank(address msgSender, bool delegateCall);
vm.startPrank(address msgSender, address txOrigin, bool delegateCall);
```

### `vm.stopPrank`

Stops the active prank started with `startPrank`.

```solidity
vm.stopPrank();
```

### `vm.readCallers`

Reads the current caller mode and addresses.

```solidity
(CallerMode callerMode, address msgSender, address txOrigin) = vm.readCallers();
```

### `vm.getNonce`

Returns the nonce of an address or wallet.

```solidity
uint64 nonce = vm.getNonce(address account);
uint64 nonce = vm.getNonce(Wallet calldata wallet);
```

### `vm.setNonce`

Sets the nonce of an address.

```solidity
vm.setNonce(address account, uint64 newNonce);
```

### `vm.resetNonce`

Resets the nonce of an address.

```solidity
vm.resetNonce(address account);
```

### `vm.addr`

Derives an Ethereum address from a private key.

```solidity
address keyAddr = vm.addr(uint256 privateKey);
```

### `vm.label`

Labels an address for easier identification in traces.

```solidity
vm.label(address account, string calldata label);
```

### `vm.getLabel`

Returns the label for an address.

```solidity
string memory label = vm.getLabel(address account);
```

## Storage Manipulation

These cheatcodes allow direct manipulation of contract storage.

### `vm.store`

Writes a value to a storage slot.

```solidity
vm.store(address target, bytes32 slot, bytes32 value);
```

### `vm.load`

Reads a value from a storage slot.

```solidity
bytes32 data = vm.load(address target, bytes32 slot);
```

### `vm.etch`

Sets the bytecode of a contract. Only EVM bytecode is supported.

```solidity
vm.etch(address target, bytes calldata newRuntimeBytecode);
```

## Mock Calls

These cheatcodes allow you to mock contract calls for testing.

### `vm.mockCall`

Mocks all calls to a contract.

```solidity
vm.mockCall(address callee, bytes calldata data, bytes calldata returnData);
vm.mockCall(address callee, uint256 msgValue, bytes calldata data, bytes calldata returnData);
vm.mockCall(address callee, bytes4 data, bytes calldata returnData);
vm.mockCall(address callee, uint256 msgValue, bytes4 data, bytes calldata returnData);
```

### `vm.mockCallRevert`

Mocks a call to revert with specific data.

```solidity
vm.mockCallRevert(address callee, bytes calldata data, bytes calldata revertData);
vm.mockCallRevert(address callee, uint256 msgValue, bytes calldata data, bytes calldata revertData);
vm.mockCallRevert(address callee, bytes4 data, bytes calldata revertData);
vm.mockCallRevert(address callee, uint256 msgValue, bytes4 data, bytes calldata revertData);
```

### `vm.mockCalls`

Mocks multiple sequential calls with different return values.

```solidity
vm.mockCalls(address callee, bytes calldata data, bytes[] calldata returnData);
vm.mockCalls(address callee, uint256 msgValue, bytes calldata data, bytes[] calldata returnData);
```

### `vm.clearMockedCalls`

Clears all mocked calls.

```solidity
vm.clearMockedCalls();
```

## State Snapshots

These cheatcodes allow you to snapshot and revert state during tests.

### `vm.snapshotState`

Creates a snapshot of the current state.

```solidity
uint256 snapshotId = vm.snapshotState();
```

### `vm.revertToState`

Reverts to a previously created state snapshot.

```solidity
bool success = vm.revertToState(uint256 snapshotId);
```

### `vm.revertToStateAndDelete`

Reverts to a snapshot and deletes it.

```solidity
bool success = vm.revertToStateAndDelete(uint256 snapshotId);
```

### `vm.deleteStateSnapshot`

Deletes a specific snapshot.

```solidity
bool success = vm.deleteStateSnapshot(uint256 snapshotId);
```

### `vm.deleteStateSnapshots`

Deletes all snapshots.

```solidity
vm.deleteStateSnapshots();
```

## Gas Metering

These cheatcodes control gas metering during tests.

### `vm.pauseGasMetering`

Pauses gas metering.

```solidity
vm.pauseGasMetering();
```

### `vm.resumeGasMetering`

Resumes gas metering.

```solidity
vm.resumeGasMetering();
```

### `vm.resetGasMetering`

Resets the gas meter.

```solidity
vm.resetGasMetering();
```

## Expectations

These cheatcodes set up expectations for calls, emits, and reverts.

### `vm.expectRevert`

Expects the next call to revert.

```solidity
vm.expectRevert();
vm.expectRevert(bytes4 revertData);
vm.expectRevert(bytes calldata revertData);
vm.expectRevert(address reverter);
vm.expectRevert(bytes4 revertData, address reverter);
vm.expectRevert(bytes calldata revertData, address reverter);
vm.expectRevert(uint64 count);
vm.expectRevert(bytes4 revertData, uint64 count);
vm.expectRevert(bytes calldata revertData, uint64 count);
vm.expectRevert(address reverter, uint64 count);
vm.expectRevert(bytes4 revertData, address reverter, uint64 count);
vm.expectRevert(bytes calldata revertData, address reverter, uint64 count);
```

### `vm.expectEmit`

Expects an event to be emitted.

```solidity
vm.expectEmit();
vm.expectEmit(address emitter);
vm.expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData);
vm.expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, address emitter);
vm.expectEmit(uint64 count);
vm.expectEmit(address emitter, uint64 count);
vm.expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, uint64 count);
vm.expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, address emitter, uint64 count);
```

### `vm.expectEmitAnonymous`

Expects an anonymous event to be emitted.

```solidity
vm.expectEmitAnonymous();
vm.expectEmitAnonymous(address emitter);
vm.expectEmitAnonymous(bool checkTopic0, bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData);
vm.expectEmitAnonymous(bool checkTopic0, bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, address emitter);
vm.expectEmitAnonymous(uint64 count);
vm.expectEmitAnonymous(address emitter, uint64 count);
vm.expectEmitAnonymous(bool checkTopic0, bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, uint64 count);
vm.expectEmitAnonymous(bool checkTopic0, bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData, address emitter, uint64 count);
```

### `vm.expectCall`

Expects a call to be made to a specific address.

```solidity
vm.expectCall(address callee, bytes calldata data);
vm.expectCall(address callee, bytes calldata data, uint64 count);
vm.expectCall(address callee, uint256 msgValue, bytes calldata data);
vm.expectCall(address callee, uint256 msgValue, bytes calldata data, uint64 count);
vm.expectCall(address callee, uint256 msgValue, uint64 gas, bytes calldata data);
vm.expectCall(address callee, uint256 msgValue, uint64 gas, bytes calldata data, uint64 count);
```

### `vm.expectCallMinGas`

Expects a call with minimum gas to be made to a specific address.

```solidity
vm.expectCallMinGas(address callee, uint256 msgValue, uint64 minGas, bytes calldata data);
vm.expectCallMinGas(address callee, uint256 msgValue, uint64 minGas, bytes calldata data, uint64 count);
```

### `vm.expectCreate`

Expects a contract to be created.

```solidity
vm.expectCreate(bytes calldata bytecode, address deployer);
```

## State Recording

These cheatcodes record state changes and accesses.

### `vm.record`

Starts recording all storage reads and writes.

```solidity
vm.record();
```

### `vm.accesses`

Returns the recorded storage accesses.

```solidity
(bytes32[] memory readSlots, bytes32[] memory writeSlots) = vm.accesses(address target);
```

### `vm.recordLogs`

Starts recording all emitted logs.

```solidity
vm.recordLogs();
```

### `vm.getRecordedLogs`

Returns all recorded logs.

```solidity
Log[] memory logs = vm.getRecordedLogs();
```

### `vm.startStateDiffRecording`

Starts recording state differences.

```solidity
vm.startStateDiffRecording();
```

### `vm.stopAndReturnStateDiff`

Stops recording and returns the state diff.

```solidity
AccountAccess[] memory accountAccesses = vm.stopAndReturnStateDiff();
```

## Testing

These cheatcodes help control test execution.

### `vm.skip`

Marks a test as skipped.

```solidity
vm.skip(bool skipTest);
vm.skip(bool skipTest, string calldata reason);
```

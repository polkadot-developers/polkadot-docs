---
title: Interact with the System Precompile
description: Learn how to use the System precompile to access core runtime functionality, cryptographic operations, and system utilities from your smart contracts.
categories: Smart Contracts
---

# System Precompile

## Introduction

The System precompile provides access to essential runtime-level functionality that smart contracts frequently need. Located at the fixed address `0x0000000000000000000000000000000000000900`, it offers a comprehensive set of utilities including:

- **Cryptographic operations**: BLAKE2 hashing, sr25519 signature verification, and ECDSA operations
- **Account management**: Account ID conversions and balance queries
- **Runtime queries**: Origin checks, code hash retrieval, and weight tracking
- **Contract lifecycle**: Safe contract termination

This precompile is particularly useful for contracts that need to interact with Polkadot-native cryptographic primitives or query runtime state information.

## Precompile Interface

The System precompile implements the `ISystem` interface, which is defined in the Polkadot SDK. The source code for the interface is as follows:

```solidity title="ISystem.sol"
--8<-- "https://raw.githubusercontent.com/paritytech/polkadot-sdk/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi/sol/ISystem.sol"
```

For the complete implementation, refer to the [ISystem.sol](https://github.com/paritytech/polkadot-sdk/blob/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi/sol/ISystem.sol){target=\_blank} file in the Polkadot SDK.

## Key Functions

### Cryptographic Operations

#### `hashBlake256`

Computes the BLAKE2 256-bit hash of the provided input data. BLAKE2 is the native hashing algorithm used throughout the Polkadot ecosystem and is more efficient than SHA-256 for most operations on PVM.

```solidity
function hashBlake256(bytes memory input) external pure returns (bytes32 digest);
```

**Parameters:**

- **`input`**: The data to hash

**Returns:**

- **`digest`**: The 32-byte BLAKE2-256 hash

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
bytes memory data = "Hello Polkadot!";
bytes32 hash = system.hashBlake256(data);
```

#### `hashBlake128`

Computes the BLAKE2 128-bit hash of the provided input data. This variant is useful when a shorter hash is acceptable for your use case.

```solidity
function hashBlake128(bytes memory input) external pure returns (bytes32 digest);
```

**Parameters:**

- **`input`**: The data to hash

**Returns:**

- **`digest`**: The 16-byte BLAKE2-128 hash (returned as bytes32 with padding)

#### `sr25519Verify`

Verifies a sr25519 signature. Sr25519 is the signature scheme used by most accounts in Polkadot and is essential for verifying signatures from Polkadot native wallets.

```solidity
function sr25519Verify(uint8[64] calldata signature, bytes calldata message, bytes32 publicKey) external view returns (bool);
```

**Parameters:**

- **`signature`**: The 64-byte signature to verify
- **`message`**: The message that was signed
- **`publicKey`**: The 32-byte public key

**Returns:**

- **`bool`**: `true` if the signature is valid, `false` otherwise

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
uint8[64] memory sig = ...; // The signature bytes
bytes memory message = "Sign this message";
bytes32 pubKey = 0x...; // The sr25519 public key

bool isValid = system.sr25519Verify(sig, message, pubKey);
require(isValid, "Invalid signature");
```

#### `ecdsaToEthAddress`

Converts a compressed ECDSA public key to an Ethereum address. This is useful when working with Ethereum-style accounts and need to derive addresses from public keys.

```solidity
function ecdsaToEthAddress(uint8[33] calldata publicKey) external view returns (bytes20);
```

**Parameters:**

- **`publicKey`**: The 33-byte compressed ECDSA public key

**Returns:**

- **`bytes20`**: The derived Ethereum address

### Account Management

#### `toAccountId`

Converts an H160 Ethereum-style address to the native account ID format used by the runtime. This is crucial when contracts need to interact with runtime functionality that expects account IDs rather than addresses.

```solidity
function toAccountId(address input) external view returns (bytes memory account_id);
```

**Parameters:**

- **`input`**: The Ethereum address to convert

**Returns:**

- **`account_id`**: The native account ID bytes

!!!note
    If no mapping exists for the provided address, a fallback account ID will be returned.

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
address ethAddr = 0x1234567890123456789012345678901234567890;
bytes memory accountId = system.toAccountId(ethAddr);
```

### Runtime Queries

#### `callerIsOrigin`

Checks whether the immediate caller of your contract is the origin (the initial caller) of the entire call stack. This is useful for determining if your contract was called directly by a user or through another contract.

```solidity
function callerIsOrigin() external view returns (bool);
```

**Returns:**

- **`bool`**: `true` if the caller is the origin, `false` if called through another contract

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
require(system.callerIsOrigin(), "Must be called directly by user");
```

#### `callerIsRoot`

Checks whether the caller is a root origin. Root origins have elevated privileges and can perform privileged operations. Note that if this returns `true`, `callerIsOrigin()` will also return `true`, as only the origin can be root.

```solidity
function callerIsRoot() external view returns (bool);
```

**Returns:**

- **`bool`**: `true` if the caller is root, `false` otherwise

#### `minimumBalance`

Returns the existential deposit - the minimum balance required for an account to exist on the chain. Accounts with balances below this threshold are reaped (removed) from state.

```solidity
function minimumBalance() external view returns (uint);
```

**Returns:**

- **`uint`**: The minimum balance in the smallest unit of the native token

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
uint minBalance = system.minimumBalance();
require(msg.value >= minBalance, "Below existential deposit");
```

#### `ownCodeHash`

Returns the code hash of the calling contract. This can be used for contract identity verification or to check if a contract has been upgraded.

```solidity
function ownCodeHash() external view returns (bytes32);
```

**Returns:**

- **`bytes32`**: The BLAKE2-256 hash of the contract's code

#### `weightLeft`

Returns the amount of computational resources (weight) remaining in the current execution context. Weight is Polkadot's measure of computational cost, consisting of two components:

```solidity
function weightLeft() external view returns (uint64 refTime, uint64 proofSize);
```

**Returns:**

- **`refTime`**: Remaining reference time (computational cycles)
- **`proofSize`**: Remaining proof size allowance (storage proof bytes)

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
(uint64 refTime, uint64 proofSize) = system.weightLeft();
require(refTime > 1000000, "Insufficient weight remaining");
```

### Contract Lifecycle

#### `terminate`

Terminates the calling contract and transfers its remaining balance to a specified beneficiary. This is useful for cleanup or when a contract has fulfilled its purpose.

```solidity
function terminate(address beneficiary) external;
```

**Parameters:**

- **`beneficiary`**: The address that will receive the contract's remaining balance

!!!warning
    This function will revert if called from:
    
    - A constructor
    - A static context
    - A delegate context
    - A contract with balance locks

**Example usage:**

```solidity
ISystem system = ISystem(SYSTEM_ADDR);
address beneficiary = 0x1234567890123456789012345678901234567890;
system.terminate(beneficiary); // Contract is terminated after this call
```

## Interact with the System Precompile

To interact with the System precompile in [Remix IDE](/smart-contracts/dev-environments/remix/){target=\_blank}:

1. Create a new file called `ISystem.sol` in Remix
2. Copy and paste the `ISystem` interface code into the file
3. Compile the interface by selecting the compile button or using **Ctrl + S**
4. In the **Deploy & Run Transactions** tab, select the `ISystem` interface from the contract dropdown
5. Enter the precompile address `0x0000000000000000000000000000000000000900` in the **At Address** input field
6. Select the **At Address** button to connect to the precompile

Once connected, you can interact with any of the System precompile functions directly through the Remix interface.

## Practical Examples

### Example 1: Verifying Polkadot Native Signatures

This example shows how to verify signatures from Polkadot native wallets using sr25519:

```solidity
contract SignatureVerifier {
    ISystem private constant system = ISystem(SYSTEM_ADDR);
    
    function verifyPolkadotSignature(
        uint8[64] calldata signature,
        bytes calldata message,
        bytes32 publicKey
    ) public view returns (bool) {
        return system.sr25519Verify(signature, message, publicKey);
    }
}
```

### Example 2: Hash-Based Data Verification

Using BLAKE2 hashing for data integrity checks:

```solidity
contract DataRegistry {
    ISystem private constant system = ISystem(SYSTEM_ADDR);
    mapping(bytes32 => bool) public registeredHashes;
    
    function registerData(bytes memory data) public {
        bytes32 hash = system.hashBlake256(data);
        registeredHashes[hash] = true;
    }
    
    function verifyData(bytes memory data) public view returns (bool) {
        bytes32 hash = system.hashBlake256(data);
        return registeredHashes[hash];
    }
}
```

### Example 3: Origin and Privilege Checks

Restricting function access based on caller status:

```solidity
contract PrivilegedContract {
    ISystem private constant system = ISystem(SYSTEM_ADDR);
    
    function directCallOnly() public view {
        require(system.callerIsOrigin(), "Must be called directly");
        // Function logic...
    }
    
    function rootOnly() public view {
        require(system.callerIsRoot(), "Root privileges required");
        // Privileged operations...
    }
}
```

### Example 4: Weight-Aware Execution

Monitoring remaining computational resources during execution:

```solidity
contract WeightAwareContract {
    ISystem private constant system = ISystem(SYSTEM_ADDR);
    
    function processWithWeightCheck() public {
        (uint64 refTime, uint64 proofSize) = system.weightLeft();
        require(refTime > 5000000, "Insufficient weight for operation");
        
        // Perform heavy computation
        for (uint i = 0; i < 100; i++) {
            // Processing...
        }
    }
}
```

## Conclusion

The System precompile provides essential building blocks for smart contracts that need to interact with Polkadot-native functionality. By offering access to cryptographic primitives, runtime queries, and system utilities, it enables developers to build sophisticated applications that leverage the full power of the Polkadot runtime.

Whether you're building identity systems that verify sr25519 signatures, contracts that need precise weight management, or applications that interact with Polkadot's native account system, the System precompile offers the necessary tools to bridge the gap between smart contract logic and runtime functionality.

## Reference

- [ISystem.sol source code](https://github.com/paritytech/polkadot-sdk/blob/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi/sol/ISystem.sol){target=\_blank}
- [Revive uapi directory](https://github.com/paritytech/polkadot-sdk/tree/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi){target=\_blank}

---
title: Interact with the Storage Precompile
description: Learn how to use the Storage precompile for low-level contract storage access, including reads, writes, partial reads, key inspection, and storage management.
categories: Smart Contracts
---

# Storage Precompile

## Introduction

The Storage precompile provides low-level access to contract storage operations at the runtime level. Located at the fixed address `0x0000000000000000000000000000000000000901`, it offers a comprehensive set of utilities, including:

- **Direct storage access**: Read and write raw storage keys and values.
- **Partial reads**: Retrieve specific segments of large values to optimize gas costs.
- **Storage inspection**: Check for key existence and value sizes.
- **Storage management**: Efficiently remove and manage storage entries.

This precompile is particularly useful for contracts that need fine-grained control over storage layout, want to optimize gas costs for large data structures, or need to implement custom storage patterns.

## Precompile Interface

The Storage precompile implements the `IStorage` interface, which is defined in the Polkadot SDK. The source code for the interface is as follows:

```solidity title="IStorage.sol"
--8<-- "https://raw.githubusercontent.com/paritytech/polkadot-sdk/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi/sol/IStorage.sol"
```

For the complete implementation, refer to the [IStorage.sol](https://github.com/paritytech/polkadot-sdk/blob/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi/sol/IStorage.sol){target=\_blank} file in the Polkadot SDK.

## Reading Storage

### Read Full Value

Retrieves the complete value stored at a given storage key. This is the most straightforward way to access storage data.

```solidity
function get(bytes32 key) external view returns (bytes memory);
```

**Parameters:**

- **`key`**: The storage key to read from.

**Returns:**

- **`bytes memory`**: The complete value stored at the key.

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("myStorageKey");
bytes memory value = storage.get(key);
```

!!!note
    This function will revert if the key does not exist in storage. Use `has_key` to check existence first if needed.

### Read Partial Value

Reads a specific segment of a stored value, defined by an offset and length. This is useful for handling large values efficiently without loading the entire data into memory.

```solidity
function get_range(bytes32 key, uint32 offset, uint32 length) external view returns (bytes memory);
```

**Parameters:**

- **`key`**: The storage key to read from.
- **`offset`**: Starting byte position within the stored value.
- **`length`**: Number of bytes to read.

**Returns:**

- **`bytes memory`**: The requested segment of the stored value.

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("largeData");

// Read bytes 100-200 of a large stored value
bytes memory segment = storage.get_range(key, 100, 100);
```

!!!warning
    This function will revert if the sum of offset and length exceeds the actual length of the stored value.

### Read Value Prefix

Retrieves up to a specified number of bytes from the beginning of a stored value. If the stored value is shorter than the requested length, only the available bytes are returned.

```solidity
function get_prefix(bytes32 key, uint32 max_length) external view returns (bytes memory);
```

**Parameters:**

- **`key`**: The storage key to read from.
- **`max_length`**: Maximum number of bytes to read from the start.

**Returns:**

- **`bytes memory`**: The prefix of the stored value (up to `max_length` bytes).

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("userData");

// Read first 32 bytes (might be a header or metadata)
bytes memory header = storage.get_prefix(key, 32);
```

## Writing Storage

### Write Value

Writes or overwrites a value at a specified storage key. This operation completely replaces any existing value at the key.

```solidity
function set(bytes32 key, bytes memory value) external;
```

**Parameters:**

- **`key`**: The storage key to write to.
- **`value`**: The data to store.

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("myData");
bytes memory data = abi.encode("Hello Polkadot!");

storage.set(key, data);
```

!!!note
    Large storage writes can be expensive in terms of gas. Breaking large data into smaller chunks is recommended.

### Remove Value

Deletes the value stored at a specified key, freeing up storage space and potentially refunding gas.

```solidity
function remove(bytes32 key) external;
```

**Parameters:**

- **`key`**: The storage key to delete.

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("obsoleteData");

storage.remove(key);
```

## Storage Inspection

### Check Key Existence

Checks whether a given storage key exists, even if the stored value is empty.

```solidity
function has_key(bytes32 key) external view returns (bool);
```

**Parameters:**

- **`key`**: The storage key to check.

**Returns:**

- **`bool`**: `true` if the key exists, `false` otherwise.

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("maybeExists");

if (storage.has_key(key)) {
    bytes memory value = storage.get(key);
    // Process value...
} else {
    // Handle missing data...
}
```

### Get Value Length

Returns the byte length of the value stored at a key without reading the actual data. This is useful for determining how much data exists before reading it.

```solidity
function length(bytes32 key) external view returns (uint32);
```

**Parameters:**

- **`key`**: The storage key to query.

**Returns:**

- **`uint32`**: The length in bytes of the stored value.

**Example usage:**

```solidity
IStorage storage = IStorage(STORAGE_ADDR);
bytes32 key = keccak256("largeFile");

uint32 size = storage.length(key);
if (size > 10000) {
    // Handle large value with partial reads
    bytes memory chunk = storage.get_range(key, 0, 1000);
} else {
    // Small enough to read in full
    bytes memory value = storage.get(key);
}
```

!!!note
    This function will revert if the key does not exist.

## Interact with the Storage Precompile

To interact with the Storage precompile in [Remix IDE](/smart-contracts/dev-environments/remix/){target=\_blank}:

1. Create a new file called `IStorage.sol` in Remix.
2. Copy and paste the `IStorage` interface code into the file.

    ![](/images/smart-contracts/precompiles/storage/storage-precompile-01.webp)

3. Compile the interface using the **Compile** button at the top or press **Ctrl + S**.
4. In the **Deploy & Run Transactions** tab, select the `IStorage` interface from the contract dropdown.
5. Enter the precompile address `0x0000000000000000000000000000000000000901` in the **At Address** input field.
6. Select the **At Address** button to connect to the precompile.

    ![](/images/smart-contracts/precompiles/storage/storage-precompile-02.webp)

Once connected, you can interact with any Storage precompile function directly through the Remix interface.

![](/images/smart-contracts/precompiles/storage/storage-precompile-03.webp)

## Conclusion

The Storage precompile provides essential building blocks for smart contracts that need low-level access to storage operations. By offering direct control over storage keys and values, partial reads for optimization, and efficient storage management functions, it enables developers to build sophisticated applications with fine-grained storage control.

Whether you're building custom data structures that require specific storage layouts, optimizing gas costs for large datasets through chunked reads, or implementing specialized storage systems, the Storage precompile offers the necessary tools to work directly with the runtime's storage layer.

## Reference

- [IStorage.sol source code](https://github.com/paritytech/polkadot-sdk/blob/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi/sol/IStorage.sol){target=\_blank}
- [Revive uapi directory](https://github.com/paritytech/polkadot-sdk/tree/62fa27df30d985600963fd5bcec1080e4c63fd4b/substrate/frame/revive/uapi){target=\_blank}

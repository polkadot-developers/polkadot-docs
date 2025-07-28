---
title: JSON-RPC APIs
description: JSON-RPC APIs guide for Polkadot Hub, covering supported methods, parameters, and examples for interacting with the chain.
---

# JSON-RPC APIs

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

Polkadot Hub provides Ethereum compatibility through its JSON-RPC interface, allowing developers to interact with the chain using familiar Ethereum tooling and methods. This document outlines the supported [Ethereum JSON-RPC methods](https://ethereum.org/en/developers/docs/apis/json-rpc/#json-rpc-methods) and provides examples of how to use them.

This guide uses the Polkadot Hub TestNet endpoint:

```text
https://testnet-passet-hub-eth-rpc.polkadot.io
```

## Available Methods

### eth_accounts

Returns a list of addresses owned by the client. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts).

**Parameters**:

None

**Example**:

```bash title="eth_accounts"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_accounts",
    "params":[],
    "id":1
}'
```

---

### eth_blockNumber

Returns the number of the most recent block. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber).

**Parameters**:

None

**Example**:

```bash title="eth_blockNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_blockNumber",
    "params":[],
    "id":1
}'
```

---

### eth_call

Executes a new message call immediately without creating a transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call).

**Parameters**:

- `transaction` ++"object"++ - the transaction call object:
    - `to` ++"string"++ - recipient address of the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `data` ++"string"++ - hash of the method signature and encoded parameters. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `from` ++"string"++ - (optional) sender's address for the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `gas` ++"string"++ - (optional) gas limit to execute the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `gasPrice` ++"string"++ - (optional) gas price per unit of gas. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `value` ++"string"++ - (optional) value in wei to send with the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
- `blockValue` ++"string"++ - (optional) block tag or block number to execute the call at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_call"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[{
        "to": "INSERT_RECIPIENT_ADDRESS",
        "data": "INSERT_ENCODED_CALL"
    }, "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_RECIPIENT_ADDRESS`, `INSERT_ENCODED_CALL`, and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_chainId

Returns the chain ID used for signing transactions. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid).

**Parameters**:

None

**Example**:

```bash title="eth_chainId"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_chainId",
    "params":[],
    "id":1
}'
```

---

### eth_estimateGas

Estimates gas required for a transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas).

**Parameters**:

- `transaction` ++"object"++ - the transaction call object:
    - `to` ++"string"++ - recipient address of the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `data` ++"string"++ - hash of the method signature and encoded parameters. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `from` ++"string"++ - (optional) sender's address for the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `gas` ++"string"++ - (optional) gas limit to execute the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `gasPrice` ++"string"++ - (optional) gas price per unit of gas. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `value` ++"string"++ - (optional) value in wei to send with the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
- `blockValue` ++"string"++ - (optional) block tag or block number to execute the call at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_estimateGas"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_estimateGas",
    "params":[{
        "to": "INSERT_RECIPIENT_ADDRESS",
        "data": "INSERT_ENCODED_FUNCTION_CALL"
    }],
    "id":1
}'
```

Ensure to replace the `INSERT_RECIPIENT_ADDRESS` and `INSERT_ENCODED_CALL` with the proper values.

---

### eth_gasPrice

Returns the current gas price in Wei. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice).

**Parameters**:

None

**Example**:

```bash title="eth_gasPrice"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_gasPrice",
    "params":[],
    "id":1
}'
```

---

### eth_getBalance

Returns the balance of a given address. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance).

**Parameters**:

- `address` ++"string"++ - address to query balance. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `blockValue` ++"string"++ - (optional) the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_getBalance"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getBlockByHash

Returns information about a block by its hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash).

**Parameters**:

- `blockHash` ++"string"++ – the hash of the block to retrieve. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `fullTransactions` ++"boolean"++ – if `true`, returns full transaction details; if `false`, returns only transaction hashes

**Example**:

```bash title="eth_getBlockByHash"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockByHash",
    "params":["INSERT_BLOCK_HASH", INSERT_BOOLEAN],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_HASH` and `INSERT_BOOLEAN` with the proper values.

---

### eth_getBlockByNumber

Returns information about a block by its number. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber).

**Parameters**:

- `blockValue` ++"string"++ - (optional) the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)
- `fullTransactions` ++"boolean"++ – if `true`, returns full transaction details; if `false`, returns only transaction hashes

**Example**:

```bash title="eth_getBlockByNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockByNumber",
    "params":["INSERT_BLOCK_VALUE", INSERT_BOOLEAN],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_VALUE` and `INSERT_BOOLEAN` with the proper values.

---

### eth_getBlockTransactionCountByNumber

Returns the number of transactions in a block from a block number. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber).

**Parameters**:

- `blockValue` ++"string"++ - the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_getBlockTransactionCountByNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockTransactionCountByNumber",
    "params":["INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getBlockTransactionCountByHash

Returns the number of transactions in a block from a block hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash).

**Parameters**:

- `blockHash` ++"string"++ – the hash of the block to retrieve. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string

**Example**:

```bash title="eth_getBlockTransactionCountByHash"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getBlockTransactionCountByHash",
    "params":["INSERT_BLOCK_HASH"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_HASH` with the proper values.

---

### eth_getCode

Returns the code at a given address. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode).

**Parameters**:

- `address` ++"string"++ - contract or account address to query code. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `blockValue` ++"string"++ - (optional) the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_getCode"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getLogs

Returns an array of all logs matching a given filter object. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs).

**Parameters**:

- `filter` ++"object"++ - the filter object:
    - `fromBlock` ++"string"++ - (optional) block number or tag to start from. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)
    - `toBlock` ++"string"++ - (optional) block number or tag to end at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)
    - `address` ++"string" or "array of strings"++ - (optional) contract address or a list of addresses from which to get logs. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `topics` ++"array of strings"++ - (optional) array of topics for filtering logs. Each topic can be a single [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string or an array of such strings (meaning OR).
    - `blockhash` ++"string"++ - (optional) hash of a specific block. Cannot be used with `fromBlock` or `toBlock`. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string

**Example**:

```bash title="eth_getLogs"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getLogs",
    "params":[{
        "fromBlock": "latest",
        "toBlock": "latest"
    }],
    "id":1
}'
```

---

### eth_getStorageAt

Returns the value from a storage position at a given address. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat).

**Parameters**:

- `address` ++"string"++ - contract or account address to query code. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `storageKey` ++"string"++ - position in storage to retrieve data from. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
- `blockValue` ++"string"++ - (optional) the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_getStorageAt"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getStorageAt",
    "params":["INSERT_ADDRESS", "INSERT_STORAGE_KEY", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS`, `INSERT_STORAGE_KEY`, and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getTransactionCount

Returns the number of transactions sent from an address (nonce). [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount).

**Parameters**:

- `address` ++"string"++ - address to query balance. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `blockValue` ++"string"++ - (optional) the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)

**Example**:

```bash title="eth_getTransactionCount"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionCount",
    "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
    "id":1
}'
```

Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

---

### eth_getTransactionByHash

Returns information about a transaction by its hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyhash).

**Parameters**:

- `transactionHash` ++"string"++ - the hash of the transaction. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string

**Example**:

```bash title="eth_getTransactionByHash"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionByHash",
    "params":["INSERT_TRANSACTION_HASH"],
    "id":1
}'
```

Ensure to replace the `INSERT_TRANSACTION_HASH` with the proper values.

---

### eth_getTransactionByBlockNumberAndIndex

Returns information about a transaction by block number and transaction index. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyblocknumberandindex).

**Parameters**:

- `blockValue` ++"string"++ - the block value to be fetched. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)
- `transactionIndex` ++"string"++ - the index of the transaction in the block. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string

**Example**:

```bash title="eth_getTransactionByBlockNumberAndIndex"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionByBlockNumberAndIndex",
    "params":["INSERT_BLOCK_VALUE", "INSERT_TRANSACTION_INDEX"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_VALUE` and `INSERT_TRANSACTION_INDEX` with the proper values.

---

### eth_getTransactionByBlockHashAndIndex

Returns information about a transaction by block hash and transaction index. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionbyblockhashandindex).

**Parameters**:

- `blockHash` ++"string"++ – the hash of the block. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `transactionIndex` ++"string"++ - the index of the transaction in the block. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string

**Example**:

```bash title="eth_getTransactionByBlockHashAndIndex"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionByBlockHashAndIndex",
    "params":["INSERT_BLOCK_HASH", "INSERT_TRANSACTION_INDEX"],
    "id":1
}'
```

Ensure to replace the `INSERT_BLOCK_HASH` and `INSERT_TRANSACTION_INDEX` with the proper values.

---

### eth_getTransactionReceipt

Returns the receipt of a transaction by transaction hash. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt).

**Parameters**:

- `transactionHash` ++"string"++ - the hash of the transaction. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string

**Example**:

```bash title="eth_getTransactionReceipt"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_getTransactionReceipt",
    "params":["INSERT_TRANSACTION_HASH"],
    "id":1
}'
```

Ensure to replace the `INSERT_TRANSACTION_HASH` with the proper values.

---

### eth_maxPriorityFeePerGas

Returns an estimate of the current priority fee per gas, in Wei, to be included in a block.

**Parameters**:

None

**Example**:

```bash title="eth_maxPriorityFeePerGas"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_maxPriorityFeePerGas",
    "params":[],
    "id":1
}'
```

---

### eth_sendRawTransaction

Submits a raw transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction).

**Parameters**:

- `callData` ++"string"++ - signed transaction data. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string

**Example**:

```bash title="eth_sendRawTransaction"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_sendRawTransaction",
    "params":["INSERT_CALL_DATA"],
    "id":1
}'
```

Ensure to replace the `INSERT_CALL_DATA` with the proper values.

---

### eth_sendTransaction

Creates and sends a new transaction. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction).

**Parameters**:

- `transaction` ++"object"++ - the transaction object:
    - `from` ++"string"++ - address sending the transaction. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `to` ++"string"++ - (optional) recipient address. No need to provide this value when deploying a contract. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `gas` ++"string"++ - (optional, default: `90000`) gas limit for execution. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `gasPrice` ++"string"++ - (optional) gas price per unit. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `value` ++"string"++ - (optional) amount of Ether to send. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `data` ++"string"++ - (optional) contract bytecode or encoded method call. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `nonce` ++"string"++ - (optional) transaction nonce. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string

**Example**:

```bash title="eth_sendTransaction"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_sendTransaction",
    "params":[{
        "from": "INSERT_SENDER_ADDRESS",
        "to": "INSERT_RECIPIENT_ADDRESS",
        "gas": "INSERT_GAS_LIMIT",
        "gasPrice": "INSERT_GAS_PRICE",
        "value": "INSERT_VALUE",
        "input": "INSERT_INPUT_DATA",
        "nonce": "INSERT_NONCE"
    }],
    "id":1
}'
```

Ensure to replace the `INSERT_SENDER_ADDRESS`, `INSERT_RECIPIENT_ADDRESS`, `INSERT_GAS_LIMIT`, `INSERT_GAS_PRICE`, `INSERT_VALUE`, `INSERT_INPUT_DATA`, and `INSERT_NONCE` with the proper values.

---

### eth_syncing

Returns an object with syncing data or `false` if not syncing. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_syncing).

**Parameters**:

None

**Example**:

```bash title="eth_syncing"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"eth_syncing",
    "params":[],
    "id":1
}'
```

---

### net_listening

Returns `true` if the client is currently listening for network connections, otherwise `false`. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#net_listening).

**Parameters**:

None

**Example**:

```bash title="net_listening"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"net_listening",
    "params":[],
    "id":1
}'
```

---

### net_peerCount

Returns the number of peers currently connected to the client.

**Parameters**:

None

**Example**:

```bash title="net_peerCount"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"net_peerCount",
    "params":[],
    "id":1
}'
```

---

### net_version

Returns the current network ID as a string. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#net_version).

**Parameters**:

None

**Example**:

```bash title="net_version"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"net_version",
    "params":[],
    "id":1
}'
```

---

### system_health

Returns information about the health of the system.

**Parameters**:

None

**Example**:

```bash title="system_health"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"system_health",
    "params":[],
    "id":1
}'
```

---

### web3_clientVersion

Returns the current client version. [Reference](https://ethereum.org/en/developers/docs/apis/json-rpc/#web3_clientversion).

**Parameters**:

None

**Example**:

```bash title="web3_clientVersion"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"web3_clientVersion",
    "params":[],
    "id":1
}'
```

---

### debug_traceBlockByNumber 

Traces a block's execution by its number and returns a detailed execution trace for each transaction.

**Parameters**:

- `blockValue` ++"string"++ - the block number or tag to trace. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)
- `options` ++"object"++ - (optional) an object containing tracer options:
    - `tracer` ++"string"++ - the name of the tracer to use (e.g., "callTracer", "opTracer").
    - Other tracer-specific options may be supported.

**Example**:

```bash title="debug_traceBlockByNumber"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"debug_traceBlockByNumber",
    "params":["INSERT_BLOCK_VALUE", {"tracer": "callTracer"}],
    "id":1
}'
```

Ensure to replace `INSERT_BLOCK_VALUE` with a proper block number if needed.

---

### debug_traceTransaction

Traces the execution of a single transaction by its hash and returns a detailed execution trace.

**Parameters**:

- `transactionHash` ++"string"++ - the hash of the transaction to trace. Must be a [32 byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
- `options` ++"object"++ - (optional) an object containing tracer options (e.g., `tracer: "callTracer"`).

**Example**:

```bash title="debug_traceTransaction"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"debug_traceTransaction",
    "params":["INSERT_TRANSACTION_HASH", {"tracer": "callTracer"}],
    "id":1
}'
```

Ensure to replace the `INSERT_TRANSACTION_HASH` with the proper value.

---

### debug_traceCall

Executes a new message call and returns a detailed execution trace without creating a transaction on the blockchain.

**Parameters**:

- `transaction` ++"object"++ - the transaction call object, similar to `eth_call` parameters:
    - `to` ++"string"++ - recipient address of the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `data` ++"string"++ - hash of the method signature and encoded parameters. Must be a [data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `from` ++"string"++ - (optional) sender's address for the call. Must be a [20-byte data](https://ethereum.org/en/developers/docs/apis/json-rpc/#unformatted-data-encoding) string
    - `gas` ++"string"++ - (optional) gas limit to execute the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `gasPrice` ++"string"++ - (optional) gas price per unit of gas. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
    - `value` ++"string"++ - (optional) value in wei to send with the call. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string
- `blockValue` ++"string"++ - (optional) block tag or block number to execute the call at. Must be a [quantity](https://ethereum.org/en/developers/docs/apis/json-rpc/#quantities-encoding) string or a [default block parameter](https://ethereum.org/en/developers/docs/apis/json-rpc/#default-block)
- `options` ++"object"++ - (optional) an object containing tracer options (e.g., `tracer: "callTracer"`).

**Example**:

```bash title="debug_traceCall"
curl -X POST https://testnet-passet-hub-eth-rpc.polkadot.io \
-H "Content-Type: application/json" \
--data '{
    "jsonrpc":"2.0",
    "method":"debug_traceCall",
    "params":[{
        "from": "INSERT_SENDER_ADDRESS",
        "to": "INSERT_RECIPIENT_ADDRESS",
        "data": "INSERT_ENCODED_CALL"
    }, "INSERT_BLOCK_VALUE", {"tracer": "callTracer"}],
    "id":1
}'
```

Ensure to replace the `INSERT_SENDER_ADDRESS`, `INSERT_RECIPIENT_ADDRESS`, `INSERT_ENCODED_CALL`, and `INSERT_BLOCK_VALUE` with the proper value.

---

## Response Format

All responses follow the standard JSON-RPC 2.0 format:

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": ... // The return value varies by method
}
```

## Error Handling

If an error occurs, the response will include an error object:

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "error": {
        "code": -32000,
        "message": "Error message here"
    }
}
```

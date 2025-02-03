---
title: JSON-RPC APIs
description: JSON-RPC APIs guide for Asset Hub, covering supported methods, parameters, and examples for interacting with the Asset Hub chain.
---

# JSON-RPC APIs

## Introduction

Asset Hub provides Ethereum compatibility through its JSON-RPC interface, allowing developers to interact with the chain using familiar Ethereum tooling and methods. This document outlines the supported Ethereum JSON-RPC methods and provides examples of how to use them.

This article uses the Westend Asset Hub endpoint to interact with:

```text
https://westend-asset-hub-eth-rpc.polkadot.io
```

## Available Methods

### Chain Information

- [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid){target=\_blank} - returns the chain ID used for signing transactions

    ???- "Query Example" 

        ```bash title="eth_chainId"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_chainId",
            "params":[],
            "id":1
        }'
        ```

- [`net_version`](https://ethereum.org/en/developers/docs/apis/json-rpc/#net_version){target=\_blank} - returns the current network ID as a string

    ???- "Query Example" 

        ```bash title="net_version"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"net_version",
            "params":[],
            "id":1
        }'
        ```

### Block Information

- [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber){target=\_blank} - returns the number of the most recent block

    ???- "Query Example" 

        ```bash title="eth_blockNumber"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_blockNumber",
            "params":[],
            "id":1
        }'
        ```

- [`eth_getBlockByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash){target=\_blank} - returns information about a block by its hash

    - Parameters
        - Block Hash - The block hash of the block to retrieve
        - Boolean - `true` returns full transaction details, while `false` provides only transaction hashes

    ???- "Query Example"

        ```bash title="eth_getBlockByHash"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_getBlockByHash",
            "params":["INSERT_BLOCK_HASH", INSERT_BOOLEAN],
            "id":1
        }'
        ```
    
        Ensure to replace the `INSERT_BLOCK_HASH` and `INSERT_BOOLEAN` with the proper values.

- [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber){target=\_blank} - returns information about a block by its number

    - Parameters
        - Block Value - quantity or tag of the block value to be fetched
        - Boolean - `true` returns full transaction details, while `false` provides only transaction hashes

    ???- "Query Example" 

        ```bash title="eth_getBlockByNumber"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_getBlockByNumber",
            "params":["INSERT_BLOCK_VALUE", INSERT_BOOLEAN],
            "id":1
        }'
        ```

        Ensure to replace the `INSERT_BLOCK_VALUE` and `INSERT_BOOLEAN` with the proper values.

### Account Information

- [`eth_accounts`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts){target=\_blank} - returns a list of addresses owned by the client

    ???- "Query Example" 

        ```bash
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_accounts",
            "params":[],
            "id":1
        }'
        ```

- [`eth_getBalance`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance){target=\_blank} - returns the balance of a given address

    - Parameters
        - Address - address to query balance
        - Block Value - quantity or tag of the block value to be fetched

    ???- "Query Example" 

        ```bash title="eth_getBalance"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_getBalance",
            "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
            "id":1
        }'
        ```

        Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

### Transaction Operations

- [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction){target=\_blank} - creates and sends a new transaction

    - Parameters
        - From - address sending the transaction  
        - To - (optional when deploying a contract) recipient address  
        - Gas - (optional, default: 90000) gas limit for execution  
        - Gas Price - (optional) gas price per unit  
        - Value - (optional) amount of Ether to send  
        - Input - contract bytecode or encoded method call  
        - Nonce - (optional) transaction nonce
    
    ???- "Query Example" 

        ```bash title="eth_sendtransaction"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
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

        Ensure to replace the `INSERT_SENDER_ADDRESS`, `INSERT_RECIPIENT_ADDRESS`, `INSERT_GAS_LIMIT`, `INSERT_GAS_PRICE`, `INSERT_VALUE`, `INSERT_INPUT_DATA` and `INSERT_NONCE` with the proper values.

- [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction){target=\_blank} - submits a raw transaction

    - Parameters
        - Call Data - signed transaction data 

    ???- "Query Example" 

        ```bash title="eth_sendRawTransaction"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_sendRawTransaction",
            "params":["INSERT_CALL_DATA"],
            "id":1
        }'
        ```

        Ensure to replace the `INSERT_CALL_DATA` with the proper values.

- [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount){target=\_blank} - returns the number of transactions sent from an address (nonce)

    - Parameters
        - Address - address to query balance
        - Block Value - quantity or tag of the block value to be fetched

    ???- "Query Example" 

        ```bash title="eth_getTransactionCount"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_getTransactionCount",
            "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
            "id":1
        }'
        ```

        Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

### Smart Contract Interaction

- [`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call){target=\_blank} - executes a new message call immediately without creating a transaction

    - Parameters
        - From (optional) - address initiating the call
        - To - recipient address of the call
        - Gas (optional) - gas limit for execution (not consumed by `eth_call`)
        - Gas Price (optional) - gas price for execution
        - Value (optional) - amount of token sent with the call
        - Input (optional) - hash of the method signature and encoded parameters
        - Block Value - quantity or tag of the block value to be fetched

    ???- "Query Example" 

        ```bash title="eth_call"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
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

        Ensure to replace the `INSERT_RECIPIENT_ADDRESS`, `INSERT_ENCODED_CALL` and `INSERT_BLOCK_VALUE` with the proper values.

- [`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas){target=\_blank} - estimates gas required for a transaction

    - Parameters
        - From (optional) - address initiating the call
        - To (optional) - recipient address of the call
        - Gas (optional) - gas limit for execution
        - Gas Price (optional) - gas price for execution
        - Value (optional) - amount of token sent with the call
        - Input (optional) - hash of the method signature and encoded parameters
        - Block Value (optional) - quantity or tag of the block value to be fetched

    ???- "Query Example" 

        ```bash title="eth_estimateGas"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
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

### Gas and Fees

- [`eth_gasPrice`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice){target=\_blank} - returns the current gas price in wei

    ???- "Query Example" 

        ```bash title="eth_gasPrice"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_gasPrice",
            "params":[],
            "id":1
        }'
        ```

- [`eth_maxPriorityFeePerGas`](){target=\_blank} - returns the current maxPriorityFeePerGas in wei

    ???- "Query Example" 

        ```bash title="eth_maxPriorityFeePerGas"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_maxPriorityFeePerGas",
            "params":[],
            "id":1
        }'
        ```

### State and Storage

- [`eth_getCode`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode){target=\_blank} - returns the code at a given address

    - Parameters
      - Address - contract or account address to query code
      - Block Value (optional) - quantity or tag of the block value to be fetched

    ???- "Query Example" 

        ```bash title "eth_getCode"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_getCode",
            "params":["INSERT_ADDRESS", "INSERT_BLOCK_VALUE"],
            "id":1
        }'
        ```

        Ensure to replace the `INSERT_ADDRESS` and `INSERT_BLOCK_VALUE` with the proper values.

- [`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat){target=\_blank} - returns the value from a storage position at a given address

    - Parameters
        - Address - contract or account address to query storage
        - Storage Key - position in storage to retrieve data from
        - Block Value (optional) - quantity or tag of the block value to be fetched

    ???- "Query Example" 

        ```bash title="eth_getStorageAt"
        curl -X POST https://westend-asset-hub-eth-rpc.polkadot.io \
        -H "Content-Type: application/json" \
        --data '{
            "jsonrpc":"2.0",
            "method":"eth_getStorageAt",
            "params":["INSERT_ADDRESS", "INSERT_STORAGE_KEY", "INSERT_BLOCK_VALUE"],
            "id":1
        }'
        ```

        Ensure to replace the `INSERT_ADDRESS`, `INSERT_STORAGE_KEY` and `INSERT_BLOCK_VALUE` with the proper values.

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
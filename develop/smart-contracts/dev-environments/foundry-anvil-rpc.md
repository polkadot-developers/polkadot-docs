---
title: Anvil-Polkadot RPC Methods
description: Complete reference of supported RPC methods in anvil-polkadot local development node.
---

# Anvil-Polkadot RPC Methods

This page lists all RPC methods supported by `anvil-polkadot`. Methods marked with ✅ are implemented and available for use.

## Standard Ethereum RPC Methods

### Web3 Methods

| Method | Status | Description |
|--------|--------|-------------|
| `web3_clientVersion` | ✅ | Returns the current client version |
| `web3_sha3` | ❌ | Returns Keccak-256 hash of the given data |

### Network Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_chainId` | ✅ | Returns the chain ID |
| `eth_networkId` | ✅ | Returns the network ID |
| `net_listening` | ✅ | Returns true if client is actively listening for network connections |

### Block Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_blockNumber` | ✅ | Returns the number of most recent block |
| `eth_getBlockByHash` | ✅ | Returns information about a block by Ethereum hash |
| `eth_getBlockByNumber` | ✅ | Returns information about a block by number |
| `eth_getBlockReceipts` | ❌ | Returns all transaction receipts for a given block |

### Account Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_accounts` | ✅ | Returns a list of addresses owned by client |
| `eth_getBalance` | ✅ | Returns the balance of the account of given address |
| `eth_getAccount` | ✅ | Returns account information |
| `eth_getAccountInfo` | ✅ | Returns detailed account information |
| `eth_getStorageAt` | ✅ | Returns the value from a storage position at a given address |
| `eth_getCode` | ✅ | Returns code at a given address |
| `eth_getProof` | ❌ | Returns the account and storage values including the Merkle proof |
| `eth_getTransactionCount` | ✅ | Returns the number of transactions sent from an address |
| `eth_getTransactionCountByHash` | ✅ | Returns the number of transactions in a block by block hash |
| `eth_getTransactionCountByNumber` | ✅ | Returns the number of transactions in a block by block number |

### Transaction Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_sendTransaction` | ✅ | Creates new message call transaction or a contract creation |
| `eth_sendTransactionSync` | ✅ | Sends transaction synchronously |
| `eth_sendRawTransaction` | ✅ | Creates new message call transaction or a contract creation for signed transactions |
| `eth_sendRawTransactionSync` | ✅ | Sends raw transaction synchronously |
| `eth_sendUnsignedTransaction` | ✅ | Sends unsigned transaction |
| `eth_call` | ✅ | Executes a new message call immediately without creating a transaction |
| `eth_estimateGas` | ✅ | Generates and returns an estimate of how much gas is necessary |
| `eth_createAccessList` | ❌ | Creates an EIP-2930 access list |
| `eth_simulateV1` | ❌ | Simulates arbitrary number of transactions at arbitrary blockchain index |

### Transaction Receipt Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_getTransactionByHash` | ✅ | Returns information about a transaction by hash |
| `eth_getTransactionByBlockHashAndIndex` | ✅ | Returns information about a transaction by block hash and transaction index |
| `eth_getTransactionByBlockNumberAndIndex` | ✅ | Returns information about a transaction by block number and transaction index |
| `eth_getTransactionReceipt` | ✅ | Returns the receipt of a transaction by transaction hash |
| `eth_getRawTransactionByHash` | ❌ | Returns raw transaction data by hash |
| `eth_getRawTransactionByBlockHashAndIndex` | ❌ | Returns raw transaction data by block hash and index |
| `eth_getRawTransactionByBlockNumberAndIndex` | ❌ | Returns raw transaction data by block number and index |

### Gas and Fee Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_gasPrice` | ✅ | Returns the current price per gas in wei |
| `eth_maxPriorityFeePerGas` | ✅ | Returns the current max priority fee per gas |
| `eth_blobBaseFee` | ❌ | Returns the base fee for blob gas |
| `eth_feeHistory` | ✅ | Returns historical gas information |

### Filter and Log Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_getLogs` | ✅ | Returns an array of all logs matching a given filter object |
| `eth_newFilter` | ✅ | Creates a filter object based on filter options |
| `eth_newBlockFilter` | ✅ | Creates a filter in the node to notify when a new block arrives |
| `eth_newPendingTransactionFilter` | ✅ | Creates a filter to notify when new pending transactions arrive |
| `eth_getFilterChanges` | ✅ | Polling method for a filter, returns array of logs |
| `eth_getFilterLogs` | ✅ | Returns an array of all logs matching filter with given id |
| `eth_uninstallFilter` | ✅ | Uninstalls a filter with given id |

### Signing Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_sign` | ✅ | Calculates an Ethereum specific signature |
| `eth_signTransaction` | ✅ | Signs a transaction that can be submitted later |
| `eth_signTypedData` | ✅ | Signs typed data |
| `eth_signTypedData_v3` | ✅ | Signs typed data (v3) |
| `eth_signTypedData_v4` | ✅ | Signs typed data (v4) |
| `personal_sign` | ✅ | Calculates an Ethereum-specific signature with personal_sign |

### Uncle Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_getUnclesCountByHash` | ❌ | Returns the number of uncles in a block by hash |
| `eth_getUnclesCountByNumber` | ❌ | Returns the number of uncles in a block by number |
| `eth_getUncleByBlockHashAndIndex` | ❌ | Returns information about an uncle by block hash and index |
| `eth_getUncleByBlockNumberAndIndex` | ❌ | Returns information about an uncle by block number and index |

### Sync and Blob Methods

| Method | Status | Description |
|--------|--------|-------------|
| `eth_syncing` | ✅ | Returns syncing status or false |
| `eth_getWork` | ❌ | Returns the hash of the current block, seedHash, and boundary condition |
| `eth_submitWork` | ❌ | Used for submitting a proof-of-work solution |
| `eth_submitHashRate` | ❌ | Used for submitting mining hashrate |
| `eth_getBlobByHash` | ❌ | Returns blob data by hash |
| `eth_getBlobByTransactionHash` | ❌ | Returns blob data by transaction hash |

## Debug and Trace Methods

| Method | Status | Description |
|--------|--------|-------------|
| `debug_traceTransaction` | ✅ | Returns a full trace of a transaction's execution |
| `debug_traceCall` | ✅ | Returns a full trace of a call's execution |
| `debug_getRawTransaction` | ❌ | Returns the raw transaction data |
| `debug_codeByHash` | ❌ | Returns the code for a given code hash |
| `trace_transaction` | ✅ | Returns a Parity-style trace of a transaction |
| `trace_block` | ✅ | Returns traces created at given block |
| `trace_filter` | ❌ | Returns traces matching the given filter |

## Anvil-Specific Methods

### Account Impersonation

| Method | Status | Description |
|--------|--------|-------------|
| `anvil_impersonateAccount` | ✅ | Impersonate an account |
| `anvil_stopImpersonatingAccount` | ✅ | Stop impersonating an account |
| `anvil_autoImpersonateAccount` | ✅ | Enable automatic impersonation for an account |

### Mining Control

| Method | Status | Description |
|--------|--------|-------------|
| `anvil_mine` | ✅ | Mine one or more blocks |
| `evm_setAutomine` | ✅ | Enable or disable automine |
| `anvil_getAutomine` | ✅ | Get the current automine status |
| `anvil_setIntervalMining` | ✅ | Set the mining interval |
| `anvil_getIntervalMining` | ✅ | Get the current mining interval |
| `evm_mine` | ✅ | Mine a single block |
| `evm_mineDetailed` | ✅ | Mine a single block and return detailed information |

### State Manipulation

| Method | Status | Description |
|--------|--------|-------------|
| `anvil_setBalance` | ✅ | Modifies the balance of an account |
| `anvil_addBalance` | ❌ | Adds to the balance of an account |
| `anvil_setCode` | ✅ | Sets the code of a contract |
| `anvil_setNonce` | ✅ | Sets the nonce of an address |
| `anvil_setStorageAt` | ✅ | Writes a single slot of the account's storage |
| `anvil_setCoinbase` | ✅ | Sets the coinbase address |
| `anvil_setChainId` | ✅ | Sets the chain ID |
| `anvil_setMinGasPrice` | ❌ | Sets the minimum gas price |
| `anvil_setNextBlockBaseFeePerGas` | ✅ | Sets the base fee of the next block |
| `anvil_dealERC20` | ❌ | Deals ERC20 tokens to an account |
| `anvil_setERC20Allowance` | ❌ | Sets ERC20 allowance |
| `evm_setTime` | ✅ | Sets the block timestamp |
| `evm_setNextBlockTimestamp` | ✅ | Sets the timestamp of the next block |
| `anvil_setBlockTimestampInterval` | ✅ | Sets the block timestamp interval |
| `anvil_removeBlockTimestampInterval` | ✅ | Removes the block timestamp interval |
| `evm_increaseTime` | ✅ | Increase the current timestamp |

### Snapshot and Revert

| Method | Status | Description |
|--------|--------|-------------|
| `evm_snapshot` | ✅ | Snapshot the state of the blockchain |
| `evm_revert` | ✅ | Revert the state to a previous snapshot |

### Transaction Pool

| Method | Status | Description |
|--------|--------|-------------|
| `anvil_dropTransaction` | ✅ | Removes a transaction from the pool |
| `anvil_dropAllTransactions` | ✅ | Removes all transactions from the pool |
| `anvil_removePoolTransactions` | ✅ | Removes specific transactions from the pool |
| `txpool_status` | ✅ | Returns the number of pending and queued transactions |
| `txpool_inspect` | ✅ | Returns a summary of all transactions in the pool |
| `txpool_content` | ✅ | Returns the details of all transactions in the pool |

### Network and Node

| Method | Status | Description |
|--------|--------|-------------|
| `anvil_reset` | ✅ | Resets the state of the blockchain |
| `anvil_setRpcUrl` | ❌ | Sets the RPC URL for forking |
| `anvil_nodeInfo` | ✅ | Returns information about the node |
| `anvil_metadata` | ✅ | Returns metadata about the Anvil instance |
| `anvil_setLoggingEnabled` | ✅ | Enables or disables logging |
| `anvil_enableTraces` | ❌ | Enables call traces |

### Advanced

| Method | Status | Description |
|--------|--------|-------------|
| `anvil_dumpState` | ❌ | Serializes the current state to JSON |
| `anvil_loadState` | ❌ | Loads a previously dumped state |
| `anvil_reorg` | ❌ | Reorganizes the blockchain |
| `anvil_rollback` | ✅ | Rolls back the blockchain to a previous state |
| `anvil_addCapability` | ❌ | Adds a wallet capability |
| `anvil_setExecutor` | ❌ | Sets the executor |

### Wallet Methods

| Method | Status | Description |
|--------|--------|-------------|
| `wallet_getCapabilities` | ❌ | Returns wallet capabilities |
| `wallet_sendTransaction` | ❌ | Sends transaction with wallet |

## Unsupported Methods

The following method categories are not supported in `anvil-polkadot`:

- **Erigon Methods**: `erigon_getHeaderByNumber`
- **Otterscan Methods**: `ots_*` methods for blockchain exploration
- **Fork Mode**: Methods related to forking are not supported (see limitation below)

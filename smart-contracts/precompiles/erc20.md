---
title: Interact with the ERC20 Precompile
description: Learn how to use the ERC20 precompile to interact with assets from the assets pallet using standard ERC20 token interfaces in your smart contracts.
categories: Smart Contracts
---

# ERC20 Precompile

## Introduction

The ERC20 precompile provides a standard ERC20 token interface for interacting with assets managed by the [Assets pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=\_blank}, helping smart contracts to interact with native Polkadot assets (such as USDT, USDC, and other tokens) using familiar Ethereum-style ERC20 calls.

Each asset in the Assets pallet is mapped to a unique precompile address based on its asset ID. The precompile implements core ERC20 functionality:

- **Token transfers**: Send assets between accounts using standard `transfer` and `transferFrom` methods
- **Approvals and allowances**: Manage spending permissions with `approve` and `allowance`.
- **Balance queries**: Check token balances with `balanceOf` and total supply with `totalSupply`.

## Precompile Interface

The ERC20 precompile implements a subset of the standard ERC20 interface. The following functions are available:

```solidity title="IERC20-precompile.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    // Implemented functions
    function totalSupply() external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
```

## Query Functions

### Get Total Supply

Returns the total number of tokens in circulation for this asset.

```solidity
function totalSupply() external view returns (uint256);
```

**Returns:**

- **`uint256`**: The total supply of tokens

**Example usage:**

```solidity
IERC20 token = IERC20(0x000007C000000000000000000000000001200000);
uint256 supply = token.totalSupply();
```

### Get Balance

Returns the token balance of a specific account address.

```solidity
function balanceOf(address account) external view returns (uint256);
```

**Parameters:**

- **`account`**: The address to query

**Returns:**

- **`uint256`**: The token balance of the account

**Example usage:**

```solidity
IERC20 token = IERC20(0x000007C000000000000000000000000001200000);
address user = 0x1234567890123456789012345678901234567890;
uint256 balance = token.balanceOf(user);
```

### Check Allowance

Returns the amount of tokens that the spender is allowed to spend on behalf of the owner.

```solidity
function allowance(address owner, address spender) external view returns (uint256);
```

**Parameters:**

- **`owner`**: The account that owns the tokens
- **`spender`**: The account authorized to spend

**Returns:**

- **`uint256`**: The remaining allowance

**Example usage:**

```solidity
IERC20 token = IERC20(0x000007C000000000000000000000000001200000);
address owner = 0x1111111111111111111111111111111111111111;
address spender = 0x2222222222222222222222222222222222222222;
uint256 remaining = token.allowance(owner, spender);
```

## Token Operations

### Transfer Tokens

Transfers tokens from the caller's account to the recipient address.

```solidity
function transfer(address to, uint256 amount) external returns (bool);
```

**Parameters:**

- **`to`**: The recipient address
- **`amount`**: The amount of tokens to transfer

**Returns:**

- **`bool`**: `true` if the transfer was successful

**Example usage:**

```solidity
IERC20 token = IERC20(0x000007C000000000000000000000000001200000);
address recipient = 0x3333333333333333333333333333333333333333;
uint256 amount = 1000 * 10**10; // Assuming 10 decimals

bool success = token.transfer(recipient, amount);
require(success, "Transfer failed");
```

!!!warning
    The transfer will fail if the caller doesn't have sufficient balance.

### Approve Spending

Approves the spender to withdraw up to a specified amount from the caller's account.

```solidity
function approve(address spender, uint256 amount) external returns (bool);
```

**Parameters:**

- **`spender`**: The address authorized to spend tokens
- **`amount`**: The maximum amount the spender can withdraw

**Returns:**

- **`bool`**: `true` if the approval was successful

**Example usage:**

```solidity
IERC20 token = IERC20(0x000007C000000000000000000000000001200000);
address spender = 0x4444444444444444444444444444444444444444;
uint256 amount = 500 * 10**10;

bool success = token.approve(spender, amount);
require(success, "Approval failed");
```

### Transfer From

Transfers tokens from one account to another using the allowance mechanism. The caller must have sufficient allowance from the `from` account.

```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool);
```

**Parameters:**

- **`from`**: The account to transfer from
- **`to`**: The recipient address
- **`amount`**: The amount of tokens to transfer

**Returns:**

- **`bool`**: `true` if the transfer was successful

**Example usage:**

```solidity
IERC20 token = IERC20(0x000007C000000000000000000000000001200000);
address owner = 0x5555555555555555555555555555555555555555;
address recipient = 0x6666666666666666666666666666666666666666;
uint256 amount = 250 * 10**10;

bool success = token.transferFrom(owner, recipient, amount);
require(success, "Transfer from failed");
```

!!!note "Metadata Functions Not Available"
    The optional ERC20 metadata functions (`name()`, `symbol()`, `decimals()`) are **not implemented** in this precompile. These functions are only available through the Assets pallet's storage, not via the ERC20 interface.

For the complete implementation, refer to the [ERC20 precompile source code](https://github.com/paritytech/polkadot-sdk/blob/11be995be95ac1e25a5b2a6dd941006e7097bffc/substrate/frame/assets/precompiles/src/lib.rs){target=\_blank} in the Polkadot SDK.


## Interact with the ERC20 Precompile

To interact with the ERC20 precompile in [Remix IDE](/smart-contracts/dev-environments/remix/){target=\_blank}:

1. Create a new file called `IERC20-precompile.sol` in Remix
2. Copy and paste the `IERC20` interface code shown above into the file

    ![](/images/smart-contracts/precompiles/erc20/erc20-01.webp)

3. Compile the interface by selecting the compile button or using **Ctrl + S**
4. Calculate the ERC20 precompile address for your asset using the [Asset ID to ERC20 Address Converter](https://tiagobndr.github.io/erc20-precompile-address/){target=\_blank}
   
    - Each asset has a unique address based on its asset ID
    - Format: `0x[assetId (8 hex)] + [24 zeros] + [prefix (8 hex)]`
    - Example: Asset ID `1984` (USD Tether) → `0x000007C000000000000000000000000001200000`

5. In the **Deploy & Run Transactions** tab, select the `IERC20` interface from the contract dropdown
6. Enter the calculated precompile address in the **At Address** input field
7. Select the **At Address** button to connect to the precompile

    ![](/images/smart-contracts/precompiles/erc20/erc20-02.webp)

Once connected, you can interact with any of the ERC20 precompile functions directly through the Remix interface.

![](/images/smart-contracts/precompiles/erc20/erc20-03.webp)

## Conclusion

The ERC20 precompile provides seamless integration between Polkadot's native asset management and Ethereum's familiar token standard. By mapping asset IDs to deterministic precompile addresses, developers can interact with native Polkadot assets using standard ERC20 interfaces.

Whether you're building DeFi protocols, token swaps, or any application requiring asset interactions, the ERC20 precompile enables you to leverage Polkadot's rich asset ecosystem with the same tools and patterns used in Ethereum development.

## Reference

- [ERC20 precompile source code](https://github.com/paritytech/polkadot-sdk/blob/11be995be95ac1e25a5b2a6dd941006e7097bffc/substrate/frame/assets/precompiles/src/lib.rs){target=\_blank}
- [Assets pallet documentation](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=\_blank}
- [EIP-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20){target=\_blank}
- [Asset ID to ERC20 Address Converter](https://tiagobndr.github.io/erc20-precompile-address/){target=\_blank}

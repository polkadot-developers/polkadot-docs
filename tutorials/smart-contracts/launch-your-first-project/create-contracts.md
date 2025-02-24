---
title: Create a Smart Contract
description: Learn how to write a basic smart contract using just a text editor. This guide covers creating and preparing a contract for deployment on Asset Hub.
---

# Create a Smart Contract

## Introduction

Creating smart contracts is fundamental to blockchain development. While many frameworks and tools are available, understanding how to write a contract from scratch with just a text editor is essential knowledge.

This tutorial will guide you through creating a basic smart contract that can be used with other tutorials for deployment and integration.

## Prerequisites

Before starting, make sure you have:

- A text editor of your choice ([VS Code](https://code.visualstudio.com/){target=\_blank}, [Sublime Text](https://www.sublimetext.com/){target=\_blank}, etc.)
- Basic understanding of programming concepts
- Familiarity with the Solidity programming language syntax. For further references, check the official [Solidity documentation](https://docs.soliditylang.org/en/latest/){target=\_blank}

## Understanding Smart Contract Structure

Let's explore these components before building the contract:

- [**SPDX license identifier**](https://docs.soliditylang.org/en/v0.6.8/layout-of-source-files.html){target=\_blank} - a standardized way to declare the license under which your code is released. This helps with legal compliance and is required by the Solidity compiler to avoid warnings
- **Pragma directive** - specifies which version of Solidity compiler should be used for your contract
- **Contract declaration** - similar to a class in object-oriented programming, it defines the boundaries of your smart contract
- **State variables** - data stored directly in the contract that persists between function calls. These represent the contract's "state" on the blockchain
- **Functions** - executable code that can read or modify the contract's state variables
- **Events** - notification mechanisms that applications can subscribe to in order to track blockchain changes

## Create the Smart Contract

In this section, you'll build a simple storage contract step by step. Later, you'll explore each component in more detail to understand what's happening behind the scenes.

This contract will:

- Store a number
- Allow updating the stored number
- Emit an event when the number changes

To build the smart contract, follow the steps below:

1. Create a new file named `Storage.sol` in your text editor

2. Add the SPDX license identifier at the top of the file. The Solidity compiler requires this:

    ```solidity
    // SPDX-License-Identifier: MIT
    ```

    This line tells users and tools which license governs your code. The [MIT license](https://opensource.org/license/mit){target=\_blank} is commonly used for open-source projects. The Solidity compiler requires this line to avoid licensing-related warnings.

3. Specify the Solidity version you want to use. We'll use a recent stable version:

    ```solidity
    pragma solidity ^0.8.19;
    ```

    The caret `^` means "this version or any compatible newer version." This helps ensure your contract compiles correctly with the intended compiler features.

4. Create the contract structure:

    ```solidity
    contract Storage {
        // Contract code will go here
    }
    ```

    This defines a contract named "Storage", similar to how you would define a class in other programming languages.

5. Add the state variables and event:

    ```solidity
    contract Storage {
        // State variable to store a number
        uint256 private number;
        
        // Event to notify when the number changes
        event NumberChanged(uint256 newNumber);
    }
    ```

    Here, you're defining:

    - A state variable named `number` of type `uint256` (unsigned integer with 256 bits), which is marked as `private` so it can only be accessed via functions within this contract
    - An event named `NumberChanged` that will be triggered whenever the number changes. The event includes the new value as data

6. Add the getter and setter functions:

    ```solidity
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/create-contracts/Storage.sol'
    ```

The complete contract should look like this:

??? code "Storage.sol"

    ```solidity title="Storage.sol"
    --8<-- 'code/tutorials/smart-contracts/launch-your-first-project/create-contracts/Storage.sol'
    ```

## Understanding the Code

Let's break down the key components of the contract:

- **State Variable**

    - `uint256 private number` - a private variable that can only be accessed through the contract's functions
    - The `private` keyword prevents direct access from outside the contract
    - State variables in Solidity are permanent storage on the blockchain, making them different from variables in traditional programming. Every change to a state variable requires a transaction and costs gas (the fee paid for blockchain operations)

- **Event**

    - `event NumberChanged(uint256 newNumber)` - emitted when the stored number changes
    - When triggered, events write data to the blockchain's log, which can be efficiently queried by applications
    - Unlike state variables, events cannot be read by smart contracts, only by external applications
    - Events are much more gas-efficient than storing data when you only need to notify external systems of changes

- **Functions**

    - `store(uint256 newNumber)` - Updates the stored number and emits an event.
        - This function changes the state of the contract and requires a transaction to execute
        - The `emit` keyword is used to trigger the defined event

    - `retrieve()` - Returns the current stored number.
        - The `view` keyword indicates that this function only reads data and doesn't modify the contract's state
        - View functions don't require a transaction and don't cost gas when called externally

    For those new to Solidity, this naming pattern (getter/setter functions) is a common design pattern. Instead of directly accessing state variables, the convention is to use functions to control access and add additional logic if needed.

This basic contract serves as a foundation for learning smart contract development. Real-world contracts often require additional security considerations, more complex logic, and thorough testing before deployment.

For more detailed information about Solidity types, functions, and best practices, refer to the [Solidity documentation](https://docs.soliditylang.org/en/latest/){target=\_blank} or this [beginner's guide to Solidity](https://www.tutorialspoint.com/solidity/index.htm){target=\_blank}.

## Where to Go Next


<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Test and Deploy with Hardhat__

    ---

    Learn how to test and deploy the smart contract you created by using Hardhat.

    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat/)

</div>
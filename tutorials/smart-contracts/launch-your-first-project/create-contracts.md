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

A Solidity smart contract follows a basic structure that includes:

1. [SPDX license identifier](https://docs.soliditylang.org/en/v0.6.8/layout-of-source-files.html){target=\_blank}
2. Pragma directive
3. Contract declaration
4. State variables
5. Functions

Let's create a simple storage contract that will:

- Store a number
- Allow updating the stored number
- Emit an event when the number changes

## Create the Smart Contract

1. Create a new file named `Storage.sol` in your text editor

2. Add the SPDX license identifier at the top of the file. The Solidity compiler requires this:

    ```solidity
    // SPDX-License-Identifier: MIT
    ```

3. Specify the Solidity version you want to use. We'll use a recent stable version:

    ```solidity
    pragma solidity ^0.8.19;
    ```

4. Create the contract structure:

    ```solidity
    contract Storage {
        // Contract code will go here
    }
    ```

5. Add the state variables and event:

    ```solidity
    contract Storage {
        // State variable to store our number
        uint256 private number;
        
        // Event to notify when the number changes
        event NumberChanged(uint256 newNumber);
    }
    ```

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

Let's break down the key components of our contract:

- **State Variable**

    - `uint256 private number` - a private variable that can only be accessed through the contract's functions
    - The `private` keyword prevents direct access from outside the contract

- **Event**

    - `event NumberChanged(uint256 newNumber)` - emitted when the stored number changes
    - Events allow external applications to track contract state changes

- **Functions**

    - `store(uint256 newNumber)` - updates the stored number and emits an event
    - `retrieve()` - returns the current stored number
    - The `view` keyword indicates that `retrieve()` doesn't modify contract state


This basic contract serves as a foundation for learning smart contract development. Real-world contracts often require additional security considerations, more complex logic, and thorough testing before deployment.

## Where to Go Next


<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Test and Deploy with Hardhat__

    ---

    Learn how to test and deploy the smart contract you created by using Hardhat.

    [:octicons-arrow-right-24: Get Started](/tutorials/smart-contracts/launch-your-first-project/test-and-deploy-with-hardhat/)

</div>
---
title: Ether.Js
description: TODO
---

# Ether.Js

## Introduction

The Ethers.js library provides a set of tools to interact with EVM compatible blockchains through JavaScript.

## Set Up the Project

```bash
npm install -y init
```

## Install Dependencies

You need to install the Ethers.js library

```bash
npm install ethers
```

## Set Up the Ethers.js Provider

To set up the Ethers.js provider and connect to Asset Hub you need to create the following logic:

```js
const { JsonRpcProvider } = require('ethers');

const PROVIDER_RPC = {
    rpc: 'INSERT_RPC_URL',
    chainId: 'INSERT_CHAIN_ID',
    name: 'INSERT_CHAIN_NAME',
};

const provider = new JsonRpcProvider(PROVIDER_RPC.rpc, {
    chainId: PROVIDER_RPC.chainId,
    name: PROVIDER_RPC.name,
});
```

!!! note
    Ensure to replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the correct values. To connect to Westend Asset Hub for example, you can use the following parameters:

    ```js
    const PROVIDER_RPC = {
        rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
        chainId: 420420421,
        name: 'westend-asset-hub'
    };
    ```

With a [`Provider`](https://docs.ethers.org/v6/api/providers/#Provider){target=\_blank}, you gain read-only access to blockchain data, enabling you to query account states, retrieve historical logs, inspect contract code, and more. For example, a typical operation that you can do is to fetch the last block of the chain, to do so, copy and paste the following code:

??? code "Fetch Last Block code"

    ```js
    const { JsonRpcProvider } = require('ethers');

    const PROVIDER_RPC = {
        rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
        chainId: 420420421,
        name: 'westend-asset-hub'
    };

    const main = async () => {
        try {
            const provider = new JsonRpcProvider(PROVIDER_RPC.rpc, {
                chainId: PROVIDER_RPC.chainId,
                name: PROVIDER_RPC.name,
            });

            const latestBlock = await provider.getBlockNumber();
            console.log(`Latest block: ${latestBlock}`);
        } catch (error) {
            console.error('Error connecting to Asset Hub: ' + error.message);
        }
    };

    main();
    ```

## Compile Contracts

To compile contracts that can be deployed to Asset Hub, you must use the following library:

```bash
npm install --save-dev @parity/revive 
```

This library is a Node.js module to compile Solidity contracts to Polkavm bytecode, using [Revive](https://github.com/paritytech/revive){target=\_blank}.

As an example, you can copy and paste the following Solidity smart contract code:


??? code "Token.sol"

    ```solidity
    //SPDX-License-Identifier: UNLICENSED

    // Solidity files have to start with this pragma.
    // It will be used by the Solidity compiler to validate its version.
    pragma solidity ^0.8.9;

    // This is the main building block for smart contracts.
    contract Token {
        // Some string type variables to identify the token.
        string public name = 'My Asset Hub Token';
        string public symbol = 'MAT';

        // The fixed amount of tokens stored in an unsigned integer type variable.
        uint256 public totalSupply = 1000000;

        // An address type variable is used to store ethereum accounts.
        address public owner;

        // A mapping is a key/value map. Here we store each account balance.
        mapping(address => uint256) balances;

        // The Transfer event helps off-chain applications understand
        // what happens within your contract.
        event Transfer(address indexed _from, address indexed _to, uint256 _value);

        /**
        * Contract initialization.
        */
        constructor() {
            // The totalSupply is assigned to the transaction sender, which is the
            // account that is deploying the contract.
            balances[msg.sender] = totalSupply;
            owner = msg.sender;
        }

        /**
        * A function to transfer tokens.
        *
        * The `external` modifier makes a function *only* callable from outside
        * the contract.
        */
        function transfer(address to, uint256 amount) external {
            // Check if the transaction sender has enough tokens.
            // If `require`'s first argument evaluates to `false` then the
            // transaction will revert.
            require(balances[msg.sender] >= amount, 'Not enough tokens');

            // Transfer the amount.
            balances[msg.sender] -= amount;
            balances[to] += amount;

            // Notify off-chain applications of the transfer.
            emit Transfer(msg.sender, to, amount);
        }

        /**
        * Read only function to retrieve the token balance of a given account.
        *
        * The `view` modifier indicates that it doesn't modify the contract's
        * state, which allows us to call it without executing a transaction.
        */
        function balanceOf(address account) external view returns (uint256) {
            return balances[account];
        }
    }
    ```

To compile that contract, you can simply create a function that reads and compile the Solidity code into `polkadovm` bytecodes:

```javascript
const { compile } = require('@parity/revive');
const { readFileSync, writeFileSync } = require('fs');
const { basename, join } = require('path');

async function compileContract() {
    try {
        // Read the Solidity file
        const inputFile = './Token.sol';
        const source = readFileSync(inputFile, 'utf8');

        // Construct the input object for the compiler
        const input = {
            [basename(inputFile)]: { content: source },
        };

        console.log('🔨 Compiling Token.sol...');
        
        // Compile the contract
        const out = await compile(input);

        for (const contracts of Object.values(out.contracts)) {
            for (const [name, contract] of Object.entries(contracts)) {
                console.log(`📜 Compiled contract: ${name}`);

                // Write the ABI
                const abiPath = join('.', `${name}.json`);
                writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
                console.log(`✅ ABI saved to ${abiPath}`);

                // Write the bytecode
                const bytecodePath = join('.', `${name}.polkavm`);
                writeFileSync(
                    bytecodePath,
                    Buffer.from(contract.evm.bytecode.object, 'hex')
                );
                console.log(`✅ Bytecode saved to ${bytecodePath}`);
            }
        }
    } catch (error) {
        console.error('❌ Error compiling contracts:', error);
    }
}
```

Note that the script above is tied to the contract name, but it can be replaced with a different name if needed.

## Contracts Deployment




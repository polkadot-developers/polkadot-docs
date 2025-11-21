---
title: Web3.py
description: Learn how to interact with Polkadot Hub using the Web3 python library, deploying Solidity contracts, and interacting with deployed smart contracts.
categories: Smart Contracts, Tooling
url: https://docs.polkadot.com/smart-contracts/libraries/web3-py/
---

# Web3.py

## Introduction

Interacting with blockchains typically requires an interface between your application and the network. [Web3.py](https://web3py.readthedocs.io/en/stable/index.html){target=\_blank} offers this interface through a collection of libraries, facilitating seamless interaction with the nodes using HTTP or WebSocket protocols. 

This guide illustrates how to utilize Web3.py for interactions with Polkadot Hub.

## Set Up the Project

1. To start working with Web3.py, begin by initializing your project:

    ```bash
    mkdir web3py-project
    cd web3py-project
    ```

2. Create and activate a virtual environment for your project:

    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3. Next, install the Web3.py library:

    ```bash
    pip install web3
    ```

## Set Up the Web3 Provider

The [provider](https://web3py.readthedocs.io/en/stable/providers.html){target=\_blank} configuration is the foundation of any Web3.py application.  It serves as a bridge between your application and the blockchain, allowing you to query blockchain data and interact with smart contracts.

To interact with Polkadot Hub, you must set up a Web3.py provider. This provider connects to a blockchain node, allowing you to query blockchain data and interact with smart contracts. The following code sets up the provider configuration:

```python
from web3 import Web3

PROVIDER_RPC = "INSERT_RPC_URL"
web3 = Web3(Web3.HTTPProvider(PROVIDER_RPC))

```

!!! note
    Replace `INSERT_RPC_URL` with the appropriate value. For instance, to connect to Polkadot Hub TestNet, use the following parameter:

    ```python
    PROVIDER_RPC = 'https://testnet-passet-hub-eth-rpc.polkadot.io'
    ```

With the Web3 provider set up, start querying the blockchain. For instance, you can use the following code snippet to fetch the latest block number of the chain.

??? code "Fetch last block example"

    ```python title="fetch_last_block.py"
    from web3 import Web3


    def main():
        try:
            PROVIDER_RPC = "https://testnet-passet-hub-eth-rpc.polkadot.io"
            web3 = Web3(Web3.HTTPProvider(PROVIDER_RPC))
            latest_block = web3.eth.block_number
            print("Last block: " + str(latest_block))
        except Exception as error:
            print("Error connecting to Polkadot Hub TestNet: " + str(error))


    if __name__ == "__main__":
        main()

    ```

## Sample Storage Contract

Polkadot Hub exposes an Ethereum JSON-RPC endpoint, so you can compile Solidity contracts to familiar EVM bytecode with the [`py-solc-x`](https://solcx.readthedocs.io/en/latest/){target=\_blank} compiler.

To follow this guide, you can use the following Solidity contract as an example:

```solidity title="Storage.sol"
//SPDX-License-Identifier: MIT

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

contract Storage {
    // Public state variable to store a number
    uint256 public storedNumber;

    /**
    * Updates the stored number.
    *
    * The `public` modifier allows anyone to call this function.
    *
    * @param _newNumber - The new value to store.
    */
    function setNumber(uint256 _newNumber) public {
        storedNumber = _newNumber;
    }
}
```



After you've compiled the `Storage.sol` contract, you should have:

- **An ABI (`.json`) file**: Provides a JSON interface describing the contract's functions and how to interact with it.
- **A bytecode (`.bin`) file**: Contains the low-level machine code executable on EVM that represents the compiled smart contract ready for blockchain deployment.

## Contract Deployment

To deploy your compiled contract to Polkadot Hub using Web3.py, you'll need an account with a private key to sign the deployment transaction. The deployment process is exactly the same as for any Ethereum-compatible chain, involving creating a contract instance, estimating gas, and sending a deployment transaction. Here's how to deploy the contract. Replace `INSERT_RPC_URL` and `INSERT_PRIVATE_KEY` with the appropriate values:

```python title="deploy.py"
from web3 import Web3
import json
import time


def get_abi(contract_name):
    try:
        with open(f"{contract_name}.json", "r") as file:
            return json.load(file)
    except Exception as error:
        print(f"❌ Could not find ABI for contract {contract_name}: {error}")
        raise error


def get_bytecode(contract_name):
    try:
        with open(f"{contract_name}.bin", "r") as file:
            bytecode = file.read().strip()
            return bytecode if bytecode.startswith("0x") else f"0x{bytecode}"
    except Exception as error:
        print(f"❌ Could not find bytecode for contract {contract_name}: {error}")
        raise error


def deploy_with_retry(config, max_retries=3):
    """Deploy with retry logic for RPC errors"""
    for attempt in range(max_retries):
        try:
            return deploy(config)
        except Exception as error:
            error_str = str(error)
            if (
                "500" in error_str
                or "Internal Server Error" in error_str
                or "Connection" in error_str
            ):
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3
                    print(
                        f"RPC error, retrying in {wait_time} seconds... (attempt {attempt + 1}/{max_retries})"
                    )
                    time.sleep(wait_time)
                    continue
            raise error


def deploy(config):
    try:
        # Initialize Web3 with RPC URL and longer timeout
        web3 = Web3(
            Web3.HTTPProvider(config["rpc_url"], request_kwargs={"timeout": 120})
        )

        # Prepare account
        formatted_private_key = (
            config["private_key"]
            if config["private_key"].startswith("0x")
            else f"0x{config['private_key']}"
        )
        account = web3.eth.account.from_key(formatted_private_key)
        print(f"Deploying from address: {account.address}")

        # Load ABI and bytecode
        abi = get_abi("Storage")
        bytecode = get_bytecode("Storage")
        print(f"Bytecode length: {len(bytecode)}")

        # Create contract instance
        contract = web3.eth.contract(abi=abi, bytecode=bytecode)

        # Get current nonce (this will test the connection)
        print("Getting nonce...")
        nonce = web3.eth.get_transaction_count(account.address)
        print(f"Nonce: {nonce}")

        # Estimate gas
        print("Estimating gas...")
        gas_estimate = web3.eth.estimate_gas(
            {"from": account.address, "data": bytecode}
        )
        print(f"Estimated gas: {gas_estimate}")

        # Get gas price
        print("Getting gas price...")
        gas_price = web3.eth.gas_price
        print(f"Gas price: {web3.from_wei(gas_price, 'gwei')} gwei")

        # Build deployment transaction
        print("Building transaction...")
        construct_txn = contract.constructor().build_transaction(
            {
                "from": account.address,
                "nonce": nonce,
                "gas": gas_estimate,
                "gasPrice": gas_price,
            }
        )

        # Sign transaction
        print("Signing transaction...")
        signed_txn = web3.eth.account.sign_transaction(
            construct_txn, private_key=formatted_private_key
        )

        # Send transaction
        print("Sending transaction...")
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction hash: {tx_hash.hex()}")

        # Wait for transaction receipt
        print("Waiting for transaction receipt...")
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
        contract_address = tx_receipt.contractAddress

        # Log results
        print(f"✅ Contract deployed at: {contract_address}")
        print(f"Gas used: {tx_receipt.gasUsed}")
        print(f"Block number: {tx_receipt.blockNumber}")

        return web3.eth.contract(address=contract_address, abi=abi)

    except Exception as error:
        print(f"❌ Deployment failed: {error}")
        raise error


if __name__ == "__main__":
    deployment_config = {
        "rpc_url": "INSERT_RPC_URL",
        "private_key": "INSERT_PRIVATE_KEY",
    }

    deploy_with_retry(deployment_config)

```

!!!warning
    Never commit or share your private key. Exposed keys can lead to immediate theft of all associated funds.

## Interact with the Contract

After deployment, interact with your contract using Web3.py methods. The example below demonstrates how to set and retrieve a number. Be sure to replace the `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_ADDRESS` placeholders with your specific values:

```python title="update_storage.py"
from web3 import Web3
import json


def get_abi(contract_name):
    try:
        with open(f"{contract_name}.json", "r") as file:
            return json.load(file)
    except Exception as error:
        print(f"❌ Could not find ABI for contract {contract_name}: {error}")
        raise error


async def update_storage(config):
    try:
        # Initialize Web3 with RPC URL
        web3 = Web3(Web3.HTTPProvider(config["rpc_url"]))

        # Prepare account
        account = web3.eth.account.from_key(config["private_key"])

        # Load ABI
        abi = get_abi("Storage")

        # Create contract instance
        contract = web3.eth.contract(address=config["contract_address"], abi=abi)

        # Get initial value
        initial_value = contract.functions.storedNumber().call()
        print("Current stored value:", initial_value)

        # Get current nonce
        nonce = web3.eth.get_transaction_count(account.address)

        # Prepare transaction
        transaction = contract.functions.setNumber(1).build_transaction(
            {"from": account.address, "nonce": nonce}
        )

        # Sign transaction
        signed_txn = web3.eth.account.sign_transaction(
            transaction, private_key=config["private_key"]
        )

        # Send transaction
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction hash: {tx_hash.hex()}")

        # Wait for receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        # Get updated value
        new_value = contract.functions.storedNumber().call()
        print("New stored value:", new_value)

        return receipt

    except Exception as error:
        print("Update failed:", error)
        raise error


if __name__ == "__main__":
    # Example usage
    import asyncio

    config = {
        "rpc_url": "INSERT_RPC_URL",
        "private_key": "INSERT_PRIVATE_KEY",
        "contract_address": "INSERT_CONTRACT_ADDRESS",
    }

    asyncio.run(update_storage(config))

```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Web3.py Docs__

    ---

    Explore the Web3.py documentation to learn how to use additional features, such as wallet management, signing messages, subscribing to events, and more.

    [:octicons-arrow-right-24: Get Started](https://web3py.readthedocs.io/en/stable/){target=\_blank}

</div>

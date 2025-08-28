---
title: Web3.py
...
description: Learn how to interact with Polkadot Hub using the Web3 python library, deploying Solidity
  contracts, and interacting with deployed smart contracts.
...
categories: Smart Contracts, Tooling
...
url: https://docs.polkadot.com/develop/smart-contracts/libraries/web3-py/
...
---

# Web3.py

-!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

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

The [provider](https://web3py.readthedocs.io/en/stable/providers.html){target=\_blank} configuration is the foundation of any Web3.py application. The following example establishes a connection to Polkadot Hub. Follow these steps to use the provider configuration:

1. Replace `INSERT_RPC_URL` with the appropriate value. For instance, to connect to Polkadot Hub TestNet, use the following parameter:

    ```python
    PROVIDER_RPC = 'https://testnet-passet-hub-eth-rpc.polkadot.io'
    ```

    The provider connection script should look something like this:

    ```python title="connect_to_provider.py"
    -from web3 import Web3

def create_provider(rpc_url):
    web3 = Web3(Web3.HTTPProvider(rpc_url))
    return web3

PROVIDER_RPC = 'INSERT_RPC_URL'

create_provider(PROVIDER_RPC)
    ```

1. With the Web3 provider set up, start querying the blockchain. For instance, you can use the following code snippet to fetch the latest block number of the chain:

    ```python title="fetch_last_block.py"
    -def main():
    try:
        web3 = create_provider(PROVIDER_RPC)
        latest_block = web3.eth.block_number
        print('Last block: ' + str(latest_block))
    except Exception as error:
        print('Error connecting to Polkadot Hub TestNet: ' + str(error))

if __name__ == "__main__":
    main()
    ```

    ??? code "View complete script"

        ```python title="fetch_last_block.py"
        -from web3 import Web3

def create_provider(rpc_url):
    web3 = Web3(Web3.HTTPProvider(rpc_url))
    return web3

PROVIDER_RPC = 'https://testnet-passet-hub-eth-rpc.polkadot.io'

def main():
    try:
        web3 = create_provider(PROVIDER_RPC)
        latest_block = web3.eth.block_number
        print('Last block: ' + str(latest_block))
    except Exception as error:
        print('Error connecting to Polkadot Hub TestNet: ' + str(error))

if __name__ == "__main__":
    main()
        ```

## Contract Deployment

Before deploying your contracts, make sure you've compiled them and obtained two key files:

- An ABI (.json) file, which provides a JSON interface describing the contract's functions and how to interact with it.
- A bytecode (.polkavm) file, which contains the low-level machine code executable on [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design#polkavm){target=\_blank} that represents the compiled smart contract ready for blockchain deployment.

To follow this guide, you can use the following solidity contract as an example:

```solidity title="Storage.sol"
-//SPDX-License-Identifier: MIT

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

To deploy your compiled contract to Polkadot Hub using Web3.py, you'll need an account with a private key to sign the deployment transaction. The deployment process is exactly the same as for any Ethereum-compatible chain, involving creating a contract instance, estimating gas, and sending a deployment transaction. Here's how to deploy the contract. Replace `INSERT_RPC_URL` and `INSERT_PRIVATE_KEY` with the appropriate values:

```python title="deploy.py"
-from web3 import Web3
import json

def get_abi(contract_name):
    try:
        with open(f"{contract_name}.json", 'r') as file:
            return json.load(file)
    except Exception as error:
        print(f"❌ Could not find ABI for contract {contract_name}: {error}")
        raise error

def get_bytecode(contract_name):
    try:
        with open(f"{contract_name}.polkavm", 'rb') as file:
            return '0x' + file.read().hex()
    except Exception as error:
        print(f"❌ Could not find bytecode for contract {contract_name}: {error}")
        raise error

async def deploy(config):
    try:
        # Initialize Web3 with RPC URL
        web3 = Web3(Web3.HTTPProvider(config["rpc_url"]))
        
        # Prepare account
        account = web3.eth.account.from_key(config["private_key"])
        print(f"address: {account.address}")
        
        # Load ABI
        abi = get_abi('Storage')
        
        # Create contract instance
        contract = web3.eth.contract(abi=abi, bytecode=get_bytecode('Storage'))
        
        # Get current nonce
        nonce = web3.eth.get_transaction_count(account.address)
        
        # Prepare deployment transaction
        transaction = {
            'from': account.address,
            'nonce': nonce,
        }
        
        # Build and sign transaction
        construct_txn = contract.constructor().build_transaction(transaction)
        signed_txn = web3.eth.account.sign_transaction(construct_txn, private_key=config["private_key"])
        
        # Send transaction
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction hash: {tx_hash.hex()}")
        
        # Wait for transaction receipt
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        contract_address = tx_receipt.contractAddress
        
        # Log and return contract details
        print(f"Contract deployed at: {contract_address}")
        return web3.eth.contract(address=contract_address, abi=abi)
    
    except Exception as error:
        print('Deployment failed:', error)
        raise error

if __name__ == "__main__":
    # Example usage
    import asyncio
    
    deployment_config = {
        "rpc_url": "INSERT_RPC_URL",
        "private_key": "INSERT_PRIVATE_KEY",
    }
    
    asyncio.run(deploy(deployment_config))
```

!!!warning
    Never commit or share your private key. Exposed keys can lead to immediate theft of all associated funds. Use environment variables instead.

## Interact with the Contract

After deployment, interact with your contract using Web3.py methods. The example below demonstrates how to set and retrieve a number. Be sure to replace the `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_ADDRESS` placeholders with your specific values:

```python title="update_storage.py"
-from web3 import Web3
import json

def get_abi(contract_name):
    try:
        with open(f"{contract_name}.json", 'r') as file:
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
        abi = get_abi('Storage')
        
        # Create contract instance
        contract = web3.eth.contract(address=config["contract_address"], abi=abi)
        
        # Get initial value
        initial_value = contract.functions.storedNumber().call()
        print('Current stored value:', initial_value)
        
        # Get current nonce
        nonce = web3.eth.get_transaction_count(account.address)
        
        # Prepare transaction
        transaction = contract.functions.setNumber(1).build_transaction({
            'from': account.address,
            'nonce': nonce
        })
        
        # Sign transaction
        signed_txn = web3.eth.account.sign_transaction(transaction, private_key=config["private_key"])
        
        # Send transaction
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        print(f"Transaction hash: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get updated value
        new_value = contract.functions.storedNumber().call()
        print('New stored value:', new_value)
        
        return receipt
    
    except Exception as error:
        print('Update failed:', error)
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

Now that you have the foundation for using Web3.py with Polkadot Hub, consider exploring:

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Advanced Web3.py Features__
  
    ---
    Explore Web3.py's documentation:
    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Middleware](https://web3py.readthedocs.io/en/stable/middleware.html){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Filters & Events](https://web3py.readthedocs.io/en/stable/filters.html){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: ENS](https://web3py.readthedocs.io/en/stable/ens_overview.html){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Testing Frameworks__

    ---
    Integrate Web3.py with Python testing frameworks:

    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Pytest](https://docs.pytest.org/){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Brownie](https://eth-brownie.readthedocs.io/){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Transaction Management__

    ---
    Learn advanced transaction handling:

    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Gas Strategies](https://web3py.readthedocs.io/en/stable/gas_price.html){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Account Management](https://web3py.readthedocs.io/en/stable/web3.eth.account.html){target=\_blank}</li>
    </ul>

-   <span class="badge external">External</span> __Building dApps__

    ---
    Combine Web3.py with these frameworks to create full-stack applications:

    <ul class="card-list">
    <li>[:octicons-arrow-right-24: Flask](https://flask.palletsprojects.com/){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: Django](https://www.djangoproject.com/){target=\_blank}</li>
    <li>[:octicons-arrow-right-24: FastAPI](https://fastapi.tiangolo.com/){target=\_blank}</li>
    </ul>

</div>

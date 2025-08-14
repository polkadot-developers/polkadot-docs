---
title: Web3.py
description: Learn how to interact with Polkadot Hub using the Web3 python library, deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Web3.py

--8<-- 'text/smart-contracts/polkaVM-warning.md'

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
    --8<-- "code/develop/smart-contracts/libraries/web3-py/connect_to_provider.py"
    ```

1. With the Web3 provider set up, start querying the blockchain. For instance, you can use the following code snippet to fetch the latest block number of the chain:

    ```python title="fetch_last_block.py"
    --8<-- "code/develop/smart-contracts/libraries/web3-py/fetch_last_block.py:9:18"
    ```

    ??? code "View complete script"

        ```python title="fetch_last_block.py"
        --8<-- "code/develop/smart-contracts/libraries/web3-py/fetch_last_block.py"
        ```

## Contract Deployment

Before deploying your contracts, make sure you've compiled them and obtained two key files:

- An ABI (.json) file, which provides a JSON interface describing the contract's functions and how to interact with it.
- A bytecode (.polkavm) file, which contains the low-level machine code executable on [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design#polkavm){target=\_blank} that represents the compiled smart contract ready for blockchain deployment.

To follow this guide, you can use the following solidity contract as an example:

```solidity title="Storage.sol"
--8<-- "code/develop/smart-contracts/libraries/web3-py/Storage.sol"
```

To deploy your compiled contract to Polkadot Hub using Web3.py, you'll need an account with a private key to sign the deployment transaction. The deployment process is exactly the same as for any Ethereum-compatible chain, involving creating a contract instance, estimating gas, and sending a deployment transaction. Here's how to deploy the contract. Replace `INSERT_RPC_URL` and `INSERT_PRIVATE_KEY` with the appropriate values:

```python title="deploy.py"
--8<-- "code/develop/smart-contracts/libraries/web3-py/deploy.py"
```

!!!warning
    Never commit or share your private key. Exposed keys can lead to immediate theft of all associated funds. Use environment variables instead.

## Interact with the Contract

After deployment, interact with your contract using Web3.py methods. The example below demonstrates how to set and retrieve a number. Be sure to replace the `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_ADDRESS` placeholders with your specific values:

```python title="update_storage.py"
--8<-- "code/develop/smart-contracts/libraries/web3-py/update_storage.py"
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

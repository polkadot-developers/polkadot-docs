from web3 import Web3
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
from web3 import Web3
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
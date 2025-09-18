from web3 import Web3

def create_provider(rpc_url):
    web3 = Web3(Web3.HTTPProvider(rpc_url))
    return web3

PROVIDER_RPC = 'INSERT_RPC_URL'

create_provider(PROVIDER_RPC)
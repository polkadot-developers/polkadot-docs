from web3 import Web3

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
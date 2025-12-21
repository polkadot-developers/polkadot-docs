from web3 import Web3


def main():
    try:
        PROVIDER_RPC = "https://services.polkadothub-rpc.com/testnet"
        web3 = Web3(Web3.HTTPProvider(PROVIDER_RPC))
        latest_block = web3.eth.block_number
        print("Last block: " + str(latest_block))
    except Exception as error:
        print("Error connecting to Polkadot Hub TestNet: " + str(error))


if __name__ == "__main__":
    main()

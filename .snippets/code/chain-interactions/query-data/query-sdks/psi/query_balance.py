from substrateinterface import SubstrateInterface

ASSET_HUB_RPC = "wss://polkadot-asset-hub-rpc.polkadot.io"

# Example address to query (Polkadot Hub address)
ADDRESS = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3"


def main():
    # Connect to Polkadot Hub
    substrate = SubstrateInterface(url=ASSET_HUB_RPC)

    print("Connected to Polkadot Hub")
    print(f"Querying balance for: {ADDRESS}\n")

    # Query the System.Account storage
    account_info = substrate.query(
        module="System",
        storage_function="Account",
        params=[ADDRESS],
    )

    # Extract balance information
    nonce = account_info.value["nonce"]
    data = account_info.value["data"]
    free = data["free"]
    reserved = data["reserved"]
    frozen = data["frozen"]

    print("Account Information:")
    print(f"  Nonce: {nonce}")
    print(f"  Free Balance: {free}")
    print(f"  Reserved: {reserved}")
    print(f"  Frozen: {frozen}")

    # Close connection
    substrate.close()


if __name__ == "__main__":
    main()

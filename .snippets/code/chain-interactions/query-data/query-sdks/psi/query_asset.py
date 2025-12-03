from substrateinterface import SubstrateInterface

ASSET_HUB_RPC = "INSERT_WS_ENDPOINT"

# USDT on Polkadot Hub
USDT_ASSET_ID = 1984

# Example address to query asset balance
ADDRESS = "INSERT_ADDRESS"


def main():
    # Connect to Polkadot Hub
    substrate = SubstrateInterface(url=ASSET_HUB_RPC)

    print("Connected to Polkadot Hub")
    print(f"Querying asset ID: {USDT_ASSET_ID}\n")

    # Query asset metadata
    asset_metadata = substrate.query(
        module="Assets",
        storage_function="Metadata",
        params=[USDT_ASSET_ID],
    )

    if asset_metadata.value:
        metadata = asset_metadata.value
        print("Asset Metadata:")
        print(f"  Name: {metadata['name']}")
        print(f"  Symbol: {metadata['symbol']}")
        print(f"  Decimals: {metadata['decimals']}")

    # Query asset details
    asset_details = substrate.query(
        module="Assets",
        storage_function="Asset",
        params=[USDT_ASSET_ID],
    )

    if asset_details.value:
        details = asset_details.value
        print("\nAsset Details:")
        print(f"  Owner: {details['owner']}")
        print(f"  Supply: {details['supply']}")
        print(f"  Accounts: {details['accounts']}")
        print(f"  Min Balance: {details['min_balance']}")
        print(f"  Status: {details['status']}")

    # Query account's asset balance
    print(f"\nQuerying asset balance for: {ADDRESS}")
    asset_account = substrate.query(
        module="Assets",
        storage_function="Account",
        params=[USDT_ASSET_ID, ADDRESS],
    )

    if asset_account.value:
        account = asset_account.value
        print("\nAsset Account:")
        print(f"  Balance: {account['balance']}")
        print(f"  Status: {account['status']}")
    else:
        print("\nNo asset balance found for this account")

    # Close connection
    substrate.close()


if __name__ == "__main__":
    main()

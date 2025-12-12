from substrateinterface import SubstrateInterface

ASSET_HUB_RPC = "INSERT_WS_ENDPOINT"

# Example address to query
ADDRESS = "INSERT_ADDRESS"


def main():
    # Connect to Polkadot Hub TestNet (Paseo Asset Hub)
    substrate = SubstrateInterface(url=ASSET_HUB_RPC)

    print("Connected to Polkadot Hub TestNet")
    print(f"Querying runtime APIs for: {ADDRESS}\n")

    # Call AccountNonceApi to get the account nonce
    nonce = substrate.runtime_call("AccountNonceApi", "account_nonce", [ADDRESS])
    print("AccountNonceApi Results:")
    print(f"  Account Nonce: {nonce.value}")

    # Query runtime version using Core runtime API
    version = substrate.runtime_call("Core", "version", [])
    print("\nCore API Results:")
    print(f"  Spec Name: {version.value['spec_name']}")
    print(f"  Spec Version: {version.value['spec_version']}")
    print(f"  Impl Version: {version.value['impl_version']}")

    # Close connection
    substrate.close()


if __name__ == "__main__":
    main()

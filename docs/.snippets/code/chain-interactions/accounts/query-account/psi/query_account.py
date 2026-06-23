    from substrateinterface import SubstrateInterface

    POLKADOT_HUB_RPC = "INSERT_WS_ENDPOINT"
    ACCOUNT_ADDRESS = "INSERT_ACCOUNT_ADDRESS"
    PAS_UNITS = 10_000_000_000

    def main():
        # Connect to Polkadot Hub
        substrate = SubstrateInterface(url=POLKADOT_HUB_RPC)

        print("Connected to Polkadot Hub")

        print(f"\nQuerying account: {ACCOUNT_ADDRESS}\n")

        # Query account information
        account_info = substrate.query(
            module="System", storage_function="Account", params=[ACCOUNT_ADDRESS]
        )

        # Display account information
        print("Account Information:")
        print("===================")
        print(f"Nonce: {account_info.value['nonce']}")
        print(f"Consumers: {account_info.value['consumers']}")
        print(f"Providers: {account_info.value['providers']}")
        print(f"Sufficients: {account_info.value['sufficients']}")

        print("\nBalance Details:")
        print("================")
        free_balance = account_info.value["data"]["free"]
        reserved_balance = account_info.value["data"]["reserved"]
        frozen_balance = account_info.value["data"]["frozen"]

        print(f"Free Balance: {free_balance} ({free_balance / PAS_UNITS} PAS)")
        print(
            f"Reserved Balance: {reserved_balance} ({reserved_balance / PAS_UNITS} PAS)"
        )
        print(f"Frozen Balance: {frozen_balance} ({frozen_balance / PAS_UNITS} PAS)")

        total = free_balance + reserved_balance
        print(f"\nTotal Balance: {total} ({total / PAS_UNITS} PAS)")

        # Close connection
        substrate.close()
        print("\nDisconnected")


    if __name__ == "__main__":
        main()
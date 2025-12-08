from substrateinterface import SubstrateInterface, Keypair

POLKADOT_TESTNET_RPC = "INSERT_RPC_URL"
SENDER_MNEMONIC = "INSERT_MNEMONIC"
DEST_ADDRESS = "INSERT_DEST_ADDRESS"
AMOUNT = 1_000_000_000  # 1 PAS (adjust decimals as needed)


def main():
    # Connect to Polkadot Hub
    substrate = SubstrateInterface(url=POLKADOT_TESTNET_RPC)

    print("Connected to Polkadot Testnet")

    # Create keypair from mnemonic
    keypair = Keypair.create_from_mnemonic(SENDER_MNEMONIC)
    sender_address = keypair.ss58_address

    print(f"Sender address: {sender_address}")
    print(f"Recipient address: {DEST_ADDRESS}")
    print(f"Amount: {AMOUNT} ({AMOUNT / 1_000_000_000} PAS)\n")

    # Get sender's account info to check balance
    account_info = substrate.query(
        module="System", storage_function="Account", params=[sender_address]
    )
    print(f"Sender balance: {account_info.value['data']['free']}")

    # Compose the transfer call
    call = substrate.compose_call(
        call_module="Balances",
        call_function="transfer_keep_alive",
        call_params={"dest": DEST_ADDRESS, "value": AMOUNT},
    )

    # Create a signed extrinsic
    print("\nSigning and submitting transaction...")
    extrinsic = substrate.create_signed_extrinsic(call=call, keypair=keypair)

    # Submit and wait for inclusion
    receipt = substrate.submit_extrinsic(
        extrinsic, wait_for_inclusion=True
    )

    if receipt.is_success:
        print("\nTransaction successful!")
        print(f"Extrinsic Hash: {receipt.extrinsic_hash}")
        print(f"Block Hash: {receipt.block_hash}")
    else:
        print(f"\nTransaction failed: {receipt.error_message}")

    # Close connection
    substrate.close()


if __name__ == "__main__":
    main()
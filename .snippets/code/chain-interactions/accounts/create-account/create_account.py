from substrateinterface import Keypair

mnemonic = Keypair.generate_mnemonic()
keypair = Keypair.create_from_mnemonic(mnemonic)

print(f"Address: {keypair.ss58_address}")
print(f"Mnemonic: {mnemonic}")
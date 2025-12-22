---
title: Send Transactions with SDKs
description: Learn how to construct, sign, and submit transactions using PAPI, Polkadot.js, Dedot, Python Substrate Interface, and Subxt.
categories: Chain Interactions
url: https://docs.polkadot.com/chain-interactions/send-transactions/with-sdks/
---

# Send Transactions with SDKs

## Introduction

Sending transactions on Polkadot SDK-based blockchains involves constructing an extrinsic (transaction), signing it with your account's private key, and submitting it to the network. Each SDK provides different methods for transaction construction, signing, and submission.

This guide demonstrates how to send transactions using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}**: Modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}**: Comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}**: Lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}**: Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}**: Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that send balance transfer transactions on Polkadot Hub.

## Prerequisites

- Access to a Polkadot-SDK-compatible wallet, with its mnemonic phrase or private key.
- A funded account on Polkadot Hub, with some testnet tokens. You can use the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank} to obtain test tokens.

## Send Transactions

!!! warning
    Never share your mnemonic phrase or private keys. The examples below use mnemonics for demonstration purposes only. In production, use secure key management solutions.

=== "PAPI"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir papi-send-tx-example && cd papi-send-tx-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install polkadot-api @polkadot/util-crypto @polkadot/keyring && \
        npm install --save-dev @types/node tsx typescript
        ```

    3. Generate types for Polkadot Hub TestNet:

        ```bash
        npx papi add polkadotTestNet -w wss://asset-hub-paseo.dotters.network
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send-transfer.ts` and add the following code to it:

    ```typescript title="send-transfer.ts"
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import { polkadotTestNet } from '@polkadot-api/descriptors';
    import { cryptoWaitReady } from '@polkadot/util-crypto';
    import { Keyring } from '@polkadot/keyring';
    import { getPolkadotSigner } from 'polkadot-api/signer';

    const POLKADOT_TESTNET_RPC = 'INSERT_WS_ENDPOINT';
    const SENDER_MNEMONIC = 'INSERT_MNEMONIC';
    const DEST_ADDRESS = 'INSERT_DEST_ADDRESS';
    const AMOUNT = 1_000_000_000n; // 1 PAS (adjust decimals as needed)

    async function main() {
      try {
        await cryptoWaitReady();

        const keyring = new Keyring({ type: 'sr25519' });
        const sender = keyring.addFromMnemonic(SENDER_MNEMONIC);

        console.log(`Sender address: ${sender.address}`);

        // Create the client connection
        const client = createClient(
          withPolkadotSdkCompat(getWsProvider(POLKADOT_TESTNET_RPC))
        );

        // Get the typed API
        const api = client.getTypedApi(polkadotTestNet);
        console.log('Connected to Polkadot Testnet');

        // Create signer using getPolkadotSigner
        const signer = getPolkadotSigner(
          sender.publicKey,
          'Sr25519',
          async (input) => sender.sign(input)
        );

        // Construct and submit the transfer transaction
        const tx = api.tx.Balances.transfer_keep_alive({
          dest: { type: 'Id', value: DEST_ADDRESS },
          value: AMOUNT,
        });

        console.log('\nSigning and submitting transaction...');
        const { txHash } = await tx.signAndSubmit(signer);
        console.log(`Transaction submitted with hash: ${txHash}`);

        await client.destroy();
        console.log('Disconnected');
      } catch (error) {
        console.error('Error:', error);
        process.exit(1);
      }
    }

    main();

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    npx tsx send-transfer.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx send-transfer.ts</span>
        <span data-ty>Sender address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty>Connected to Polkadot Testnet</span>
        <span data-ty>Signing and submitting transaction...</span>
        <span data-ty>Transaction submitted with hash: 0x45ce4b5223428d003ddeed5118182eede1224dd0b6e881d7ed40517d60aa1c57</span>
        <span data-ty>Disconnected</span>
    </div>
=== "Polkadot.js"

    !!! warning "Maintenance Mode Only"
        The Polkadot.js API is no longer actively developed. New projects should use [PAPI](/reference/tools/papi/){target=\_blank} or [Dedot](/reference/tools/dedot/){target=\_blank} as actively maintained alternatives.

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir pjs-send-tx-example && cd pjs-send-tx-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install @polkadot/api @polkadot/keyring @polkadot/util-crypto
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send-transfer.js` and add the following code:

    ```javascript title="send-transfer.js"
    import { ApiPromise, WsProvider } from '@polkadot/api';
    import { Keyring } from '@polkadot/keyring';
    import { cryptoWaitReady } from '@polkadot/util-crypto';

    const POLKADOT_TESTNET_RPC = 'INSERT_WS_ENDPOINT';
    const SENDER_MNEMONIC = 'INSERT_MNEMONIC';
    const DEST_ADDRESS = 'INSERT_DEST_ADDRESS';
    const AMOUNT = 1_000_000_000n; // 1 PAS (adjust decimals as needed)

    async function main() {
      // Wait for crypto to be ready
      await cryptoWaitReady();

      // Create a WebSocket provider
      const wsProvider = new WsProvider(POLKADOT_TESTNET_RPC);

      // Initialize the API
      const api = await ApiPromise.create({ provider: wsProvider });
      console.log('Connected to Polkadot Testnet');

      // Set up keyring and get sender account
      const keyring = new Keyring({ type: 'sr25519' });
      const sender = keyring.addFromMnemonic(SENDER_MNEMONIC);
      const senderAddress = sender.address;

      console.log(`Sender address: ${senderAddress}`);
      console.log(`Recipient address: ${DEST_ADDRESS}`);
      console.log(`Amount: ${AMOUNT} (${Number(AMOUNT) / 1_000_000_000} PAS)\n`);

      // Get sender's account info to check balance
      const accountInfo = await api.query.system.account(senderAddress);
      console.log(
        `Sender balance: ${accountInfo.data.free.toString()} (${
          Number(accountInfo.data.free.toBigInt()) / 1_000_000_000
        } PAS)`
      );

      // Construct and sign the transfer transaction
      console.log('\nSigning and submitting transaction...');

      await new Promise((resolve, reject) => {
        api.tx.balances
          .transferKeepAlive(DEST_ADDRESS, AMOUNT)
          .signAndSend(sender, ({ status, txHash, dispatchError }) => {
            if (status.isInBlock) {
              console.log(
                `Transaction included in block: ${status.asInBlock.toHex()}`
              );
            } else if (status.isFinalized) {
              console.log(
                `Transaction finalized in block: ${status.asFinalized.toHex()}`
              );
              console.log(`Transaction hash: ${txHash.toHex()}`);

              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  const { docs, name, section } = decoded;
                  reject(new Error(`${section}.${name}: ${docs.join(' ')}`));
                } else {
                  reject(new Error(dispatchError.toString()));
                }
              } else {
                console.log('Transaction successful!');
                resolve(txHash.toHex());
              }
            }
          })
          .catch(reject);
      });

      // Disconnect from the node
      await api.disconnect();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    node send-transfer.js
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>node send-transfer.js</span>
        <span data-ty></span>Connected to Polkadot Testnet</span>
        <span data-ty></span>Sender address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty></span>Recipient address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty>Amount: 1000000000 (1 PAS)</span>
        <span data-ty></span>
        <span data-ty>Sender balance: 59912386816 (59.912386816 PAS)</span>
        <span data-ty></span>
        <span data-ty>Signing and submitting transaction...</span>
        <span data-ty>Transaction included in block: 0x77b5d73d30412ec39ac6cfe6cf3ec2134fec8e3fcbcd821218863d01f9fac40f</span>
        <span data-ty>Transaction finalized in block: 0x77b5d73d30412ec39ac6cfe6cf3ec2134fec8e3fcbcd821218863d01f9fac40f</span>
        <span data-ty>Transaction hash: 0x6f2fbe51985c87a5534c919d76859b66138aaf874147a1e300e50d93cee1c429</span>
        <span data-ty>Transaction successful!</span>
    </div>

=== "Dedot"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir dedot-send-tx-example && cd dedot-send-tx-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install dedot @polkadot/keyring @polkadot/util-crypto && \
        npm install --save-dev @dedot/chaintypes @types/node tsx typescript
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send-transfer.ts` and add the following code to it:

    ```typescript title="send-transfer.ts"
    import { DedotClient, WsProvider } from 'dedot';
    import type { PolkadotAssetHubApi } from '@dedot/chaintypes';
    import { cryptoWaitReady } from '@polkadot/util-crypto';
    import { Keyring } from '@polkadot/keyring';

    const POLKADOT_TESTNET_RPC = 'INSERT_WS_ENDPOINT';
    const SENDER_MNEMONIC = 'INSERT_MNEMONIC';
    const DEST_ADDRESS = 'INSERT_DEST_ADDRESS';
    const AMOUNT = 1_000_000_000n; // 1 PAS (adjust decimals as needed)

    async function main() {
      // Wait for crypto to be ready
      await cryptoWaitReady();

      // Initialize provider and client with Asset Hub types
      const provider = new WsProvider(POLKADOT_TESTNET_RPC);
      const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

      console.log('Connected to Polkadot Testnet');

      // Set up keyring and get sender account
      const keyring = new Keyring({ type: 'sr25519' });
      const sender = keyring.addFromMnemonic(SENDER_MNEMONIC);
      const senderAddress = sender.address;

      console.log(`Sender address: ${senderAddress}`);
      console.log(`Recipient address: ${DEST_ADDRESS}`);
      console.log(`Amount: ${AMOUNT} (${AMOUNT / 1_000_000_000n} PAS)\n`);

      // Get sender's account info to check balance
      const accountInfo = await client.query.system.account(senderAddress);
      console.log(`Sender balance: ${accountInfo.data.free}`);

      // Sign and submit the transfer transaction
      console.log('\nSigning and submitting transaction...');

      // Wait for transaction to complete using a Promise
      await new Promise<void>((resolve, reject) => {
        client.tx.balances
          .transferKeepAlive(DEST_ADDRESS, AMOUNT)
          .signAndSend(sender, async ({ status, txHash, dispatchError }) => {
            console.log(`Transaction status: ${status.type}`);

            // Log transaction hash immediately
            if (txHash) {
              console.log(
                `Transaction hash: ${
                  typeof txHash === 'string' ? txHash : txHash.toHex()
                }`
              );
            }

            if (status.type === 'BestChainBlockIncluded') {
              console.log(
                `Transaction included in block: ${status.value.blockHash}`
              );
            }

            if (status.type === 'Finalized') {
              console.log(
                `Transaction finalized in block: ${status.value.blockHash}`
              );

              // Check for dispatch errors
              if (dispatchError) {
                if (dispatchError.type === 'Module') {
                  const decoded = client.registry.findMetaError(
                    dispatchError.value
                  );
                  console.error(
                    `Dispatch error: ${decoded.section}.${decoded.name}: ${decoded.docs}`
                  );
                  reject(
                    new Error(
                      `Transaction failed: ${decoded.section}.${decoded.name}`
                    )
                  );
                } else {
                  console.error(`Dispatch error: ${dispatchError.type}`);
                  reject(new Error(`Transaction failed: ${dispatchError.type}`));
                }
              } else {
                console.log('Transaction successful!');
                resolve();
              }
            }
          })
          .catch(reject);
      });

      // Disconnect the client after transaction completes
      await client.disconnect();
      console.log('Disconnected from Polkadot Hub');
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    npx tsx send-transfer.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx send-transfer.ts</span>
        <span data-ty></span>Connected to Polkadot Testnet</span>
        <span data-ty>Sender address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty>Recipient address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty>Amount: 1000000000 (1 PAS)</span>
        <span data-ty></span>
        <span data-ty>Sender balance: 59868680224</span>
        <span data-ty></span>
        <span data-ty>Signing and submitting transaction...</span>
        <span data-ty>Transaction status: Validated</span>
        <span data-ty>Transaction status: Broadcasting</span>
        <span data-ty>Transaction status: BestChainBlockIncluded</span>
        <span data-ty>Transaction included in block: 0x80b039e897d8cfe4ec0c641cd17cc7a47ed4b26797b31c7d3c93c3b0b96f7b9f</span>
        <span data-ty>Transaction status: Finalized</span>
        <span data-ty>Transaction hash: 0x325a1c1cff76fb6a004190cf5ee382f89433596b3c396f10fd25ce6945f2b1df</span>
        <span data-ty>Transaction finalized in block: 0x80b039e897d8cfe4ec0c641cd17cc7a47ed4b26797b31c7d3c93c3b0b96f7b9f</span>
        <span data-ty>Transaction successful!</span>
        <span data-ty>Disconnected from Polkadot Testnet</span>
    </div>

=== "Python Substrate Interface"

    **Prerequisites**

    - [Python](https://www.python.org/){target=\_blank} 3.8 or higher
    - pip package manager

    **Environment Setup**

    1. Create a new project directory and set up a virtual environment:

        ```bash
        mkdir psi-send-tx-example && cd psi-send-tx-example && \
        python3 -m venv venv && source venv/bin/activate
        ```

    2. Install the substrate-interface package:

        ```bash
        pip install substrate-interface
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send_transfer.py` and add the following code to it:

    ```python title="send_transfer.py"
    from substrateinterface import SubstrateInterface, Keypair

    POLKADOT_TESTNET_RPC = "INSERT_WS_ENDPOINT"
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
        receipt = substrate.submit_extrinsic(extrinsic, wait_for_inclusion=True)

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

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    python send_transfer.py
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>python send_transfer.py</span>
        <span data-ty>Connected to Polkadot Testnet</span>
        <span data-ty>Sender address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty>Recipient address: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty>Amount: 1000000000 (1.0 PAS)</span>
        <span data-ty></span>
        <span data-ty>Sender balance: 59854111360</span>
        <span data-ty></span>
        <span data-ty>Signing and submitting transaction...</span>
        <span data-ty>Transaction successful!</span>
        <span data-ty>Extrinsic Hash: 0x5509e26874f5274747896349be68b0904058f4e2822385fdb7c8dc86f2dab879</span>
        <span data-ty>Block Hash: 0xfd79ad0e21c5a91c358e2bd59540a98681e407e4231c9577221f97cc121449b8</span>
    </div>

=== "Subxt"

    [Subxt](/reference/tools/subxt/){target=\_blank} is a Rust library that provides compile-time type safety through code generation from chain metadata.

    **Prerequisites**

    - [Rust](https://rustup.rs/){target=\_blank} toolchain (latest stable)
    - Cargo package manager

    **Environment Setup**

    1. Create a new Rust project:

        ```bash
        cargo new subxt-send-tx-example && cd subxt-send-tx-example
        ```

    2. Install the Subxt CLI:

        ```bash
        cargo install subxt-cli@0.44.0
        ```

    3. Download the Polkadot Hub metadata:

        ```bash
        subxt metadata --url INSERT_WS_ENDPOINT -o asset_hub_metadata.scale
        ```

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        [package]
        name = "subxt-send-tx-example"
        version = "0.1.0"
        edition = "2021"

        [[bin]]
        name = "send_transfer"
        path = "src/bin/send_transfer.rs"

        [dependencies]
        subxt = { version = "0.35", default-features = false, features = ["macros"] }
        subxt-signer = { version = "0.4", features = ["bip39"] }
        tokio = { version = "1", features = ["rt", "macros"] }



        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file at `src/bin/send_transfer.rs` and add the following code to it:

    ```rust title="src/bin/send_transfer.rs"
    use std::str::FromStr;
    use subxt::utils::AccountId32;
    use subxt::{OnlineClient, PolkadotConfig};
    use subxt_signer::{bip39::Mnemonic, sr25519::Keypair};

    // Generate an interface from the node's metadata
    #[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
    pub mod asset_hub {}

    const ASSET_HUB_RPC: &str = "INSERT_WS_ENDPOINT";
    const SENDER_MNEMONIC: &str = "INSERT_SENDER_MNEMONIC";
    const DEST_ADDRESS: &str = "INSERT_DEST_ADDRESS";
    const AMOUNT: u128 = 1_000_000_000_000; // 1 DOT (12 decimals)

    #[tokio::main(flavor = "current_thread")]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
        // Initialize the Subxt client
        let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

        println!("Connected to Polkadot Hub");

        // Load the sender's keypair from a mnemonic phrase
        let mnemonic = Mnemonic::parse(SENDER_MNEMONIC)?;
        let sender_keypair = Keypair::from_phrase(&mnemonic, None)?;
        let sender_address = AccountId32::from(sender_keypair.public_key());

        println!("Sender address: {}", sender_address);
        println!("Recipient address: {}", DEST_ADDRESS);
        println!("Amount: {} ({} DOT)\n", AMOUNT, AMOUNT / 1_000_000_000_000);

        // Get sender's account info to check balance
        let storage_query = asset_hub::storage().system().account(sender_address);
        let account_info = api
            .storage()
            .at_latest()
            .await?
            .fetch(&storage_query)
            .await?;

        if let Some(info) = account_info {
            println!("Sender balance: {}", info.data.free);
        }

        // Convert the recipient address into an AccountId32
        let dest = AccountId32::from_str(DEST_ADDRESS)?;

        // Build the balance transfer extrinsic
        let balance_transfer_tx = asset_hub::tx()
            .balances()
            .transfer_keep_alive(dest.into(), AMOUNT);

        // Sign and submit the extrinsic, then wait for it to be finalized
        println!("\nSigning and submitting transaction...");
        let events = api
            .tx()
            .sign_and_submit_then_watch_default(&balance_transfer_tx, &sender_keypair)
            .await?
            .wait_for_finalized_success()
            .await?;

        // Check for a successful transfer event
        if let Some(event) = events.find_first::<asset_hub::balances::events::Transfer>()? {
            println!("\nTransaction successful!");
            println!("Transfer event: {:?}", event);
        }

        Ok(())
    }



    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    cargo run --bin send_transfer
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>cargo run --bin send_transfer</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Sender address: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty>Recipient address: 15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X</span>
        <span data-ty>Amount: 1000000000000 (1 DOT)</span>
        <span data-ty></span>
        <span data-ty>Sender balance: 50000000000000</span>
        <span data-ty></span>
        <span data-ty>Signing and submitting transaction...</span>
        <span data-ty></span>
        <span data-ty>Transaction successful!</span>
        <span data-ty>Transfer event: Transfer { from: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3, to: 15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X, amount: 1000000000000 }</span>
    </div>



## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Query On-Chain State**

    ---

    Learn how to query storage and runtime data with the SDKs used in this guide.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

- <span class="badge guide">Guide</span> **Calculate Transaction Fees**

    ---

    Estimate fees before sending transactions

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/calculate-transaction-fees/)

</div>

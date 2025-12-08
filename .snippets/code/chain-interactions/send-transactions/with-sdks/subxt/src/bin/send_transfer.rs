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


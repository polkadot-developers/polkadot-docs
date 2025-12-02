use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};

// Generate an interface from the node's metadata
#[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
pub mod asset_hub {}

const ASSET_HUB_RPC: &str = "wss://polkadot-asset-hub-rpc.polkadot.io";

// Example address to query (Polkadot Hub address)
const ADDRESS: &str = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the Subxt client
    let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

    println!("Connected to Polkadot Hub");
    println!("Querying balance for: {}\n", ADDRESS);

    // Parse the address
    let account = AccountId32::from_str(ADDRESS)?;

    // Build storage query for System.Account
    let storage_query = asset_hub::storage().system().account(account);

    // Fetch the account information
    let account_info = api
        .storage()
        .at_latest()
        .await?
        .fetch(&storage_query)
        .await?;

    match account_info {
        Some(info) => {
            println!("Account Information:");
            println!("  Nonce: {}", info.nonce);
            println!("  Free Balance: {}", info.data.free);
            println!("  Reserved: {}", info.data.reserved);
            println!("  Frozen: {}", info.data.frozen);
        }
        None => {
            println!("Account not found");
        }
    }

    Ok(())
}

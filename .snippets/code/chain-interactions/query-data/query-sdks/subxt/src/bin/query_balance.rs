use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};

// Generate an interface from the node's metadata
#[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
pub mod asset_hub {}

const ASSET_HUB_RPC: &str = "INSERT_WS_ENDPOINT";

// Example address to query (Polkadot Hub address)
const ADDRESS: &str = "INSERT_ADDRESS";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the Subxt client
    let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

    // Anchor to the current block
    let at_block = api.at_current_block().await?;

    println!("Connected to Polkadot Hub");
    println!("Querying balance for: {}\n", ADDRESS);

    // Parse the address
    let account = AccountId32::from_str(ADDRESS)?;

    // Build storage entry for System.Account
    let account_storage = at_block
        .storage()
        .entry(asset_hub::storage().system().account())?;

    // Fetch the account information
    let info = account_storage
        .fetch((account,))
        .await?
        .decode()?;

    println!("Account Information:");
    println!("  Nonce: {}", info.nonce);
    println!("  Free Balance: {}", info.data.free);
    println!("  Reserved: {}", info.data.reserved);
    println!("  Frozen: {}", info.data.frozen);

    Ok(())
}

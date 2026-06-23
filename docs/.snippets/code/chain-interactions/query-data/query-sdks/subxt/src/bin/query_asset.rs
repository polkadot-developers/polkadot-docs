use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};

// Generate an interface from the node's metadata
#[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
pub mod asset_hub {}

const ASSET_HUB_RPC: &str = "INSERT_WS_ENDPOINT";

// USDT on Polkadot Hub
const USDT_ASSET_ID: u32 = 1984;

// Example address to query asset balance
const ADDRESS: &str = "INSERT_ADDRESS";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the Subxt client
    let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

    // Anchor to the current block
    let at_block = api.at_current_block().await?;

    println!("Connected to Polkadot Hub");
    println!("Querying asset ID: {}\n", USDT_ASSET_ID);

    // Query asset metadata
    let metadata_storage = at_block
        .storage()
        .entry(asset_hub::storage().assets().metadata())?;
    let meta = metadata_storage
        .fetch((USDT_ASSET_ID,))
        .await?
        .decode()?;

    println!("Asset Metadata:");
    println!(
        "  Name: {}",
        String::from_utf8_lossy(&meta.name.0)
    );
    println!(
        "  Symbol: {}",
        String::from_utf8_lossy(&meta.symbol.0)
    );
    println!("  Decimals: {}", meta.decimals);

    // Query asset details
    let asset_storage = at_block
        .storage()
        .entry(asset_hub::storage().assets().asset())?;
    let details = asset_storage
        .fetch((USDT_ASSET_ID,))
        .await?
        .decode()?;

    println!("\nAsset Details:");
    println!("  Owner: {}", details.owner);
    println!("  Supply: {}", details.supply);
    println!("  Accounts: {}", details.accounts);
    println!("  Min Balance: {}", details.min_balance);

    // Query account's asset balance
    let account = AccountId32::from_str(ADDRESS)?;
    println!("\nQuerying asset balance for: {}", ADDRESS);

    let account_storage = at_block
        .storage()
        .entry(asset_hub::storage().assets().account())?;
    let asset_account = account_storage
        .fetch((USDT_ASSET_ID, account))
        .await?
        .decode()?;

    println!("\nAsset Account:");
    println!("  Balance: {}", asset_account.balance);

    Ok(())
}

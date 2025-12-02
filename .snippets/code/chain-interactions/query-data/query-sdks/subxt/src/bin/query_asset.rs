use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};

// Generate an interface from the node's metadata
#[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
pub mod asset_hub {}

const ASSET_HUB_RPC: &str = "wss://polkadot-asset-hub-rpc.polkadot.io";

// USDT on Polkadot Hub
const USDT_ASSET_ID: u32 = 1984;

// Example address to query asset balance
const ADDRESS: &str = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the Subxt client
    let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

    println!("Connected to Polkadot Hub");
    println!("Querying asset ID: {}\n", USDT_ASSET_ID);

    // Query asset metadata
    let metadata_query = asset_hub::storage().assets().metadata(USDT_ASSET_ID);
    let metadata = api
        .storage()
        .at_latest()
        .await?
        .fetch(&metadata_query)
        .await?;

    if let Some(meta) = metadata {
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
    }

    // Query asset details
    let asset_query = asset_hub::storage().assets().asset(USDT_ASSET_ID);
    let asset_details = api
        .storage()
        .at_latest()
        .await?
        .fetch(&asset_query)
        .await?;

    if let Some(details) = asset_details {
        println!("\nAsset Details:");
        println!("  Owner: {}", details.owner);
        println!("  Supply: {}", details.supply);
        println!("  Accounts: {}", details.accounts);
        println!("  Min Balance: {}", details.min_balance);
    }

    // Query account's asset balance
    let account = AccountId32::from_str(ADDRESS)?;
    println!("\nQuerying asset balance for: {}", ADDRESS);

    let account_query = asset_hub::storage()
        .assets()
        .account(USDT_ASSET_ID, account);
    let asset_account = api
        .storage()
        .at_latest()
        .await?
        .fetch(&account_query)
        .await?;

    match asset_account {
        Some(account) => {
            println!("\nAsset Account:");
            println!("  Balance: {}", account.balance);
        }
        None => {
            println!("\nNo asset balance found for this account");
        }
    }

    Ok(())
}

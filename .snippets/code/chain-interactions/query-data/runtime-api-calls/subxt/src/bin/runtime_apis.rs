use std::str::FromStr;
use subxt::dynamic::Value;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};

// Generate an interface from the node's metadata
#[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
pub mod asset_hub {}

const ASSET_HUB_RPC: &str = "INSERT_WS_ENDPOINT";

// Example address to query
const ADDRESS: &str = "INSERT_ADDRESS";

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the Subxt client
    let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

    println!("Connected to Polkadot Hub TestNet");
    println!("Querying runtime APIs for: {}\n", ADDRESS);

    // Parse the address
    let account = AccountId32::from_str(ADDRESS)?;

    // Call AccountNonceApi using static interface
    let nonce_call = asset_hub::apis()
        .account_nonce_api()
        .account_nonce(account.clone());
    let nonce = api.runtime_api().at_latest().await?.call(nonce_call).await?;
    println!("AccountNonceApi Results:");
    println!("  Account Nonce: {}", nonce);

    // Call Metadata API to get supported versions using dynamic call
    let metadata_versions_call =
        subxt::dynamic::runtime_api_call("Metadata", "metadata_versions", Vec::<Value>::new());
    let versions_result = api
        .runtime_api()
        .at_latest()
        .await?
        .call(metadata_versions_call)
        .await?;
    println!("\nMetadata API Results:");
    println!(
        "  Supported Metadata Versions: {}",
        versions_result.to_value()?
    );

    Ok(())
}

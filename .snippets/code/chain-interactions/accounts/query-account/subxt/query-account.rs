use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};

// Generate an interface from the node's metadata
#[subxt::subxt(runtime_metadata_path = "polkadot_testnet_metadata.scale")]
pub mod polkadot_testnet {}

const POLKADOT_TESTNET_RPC: &str = "INSERT_WS_ENDPOINT";
const ACCOUNT_ADDRESS: &str = "INSERT_ACCOUNT_ADDRESS";
const PAS_UNITS: u128 = 10_000_000_000;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize the Subxt client
    let api = OnlineClient::<PolkadotConfig>::from_url(POLKADOT_TESTNET_RPC).await?;

    println!("Connected to Polkadot Hub");

    // Convert the account address into an AccountId32
    let account = AccountId32::from_str(ACCOUNT_ADDRESS)?;

    println!("\nQuerying account: {}\n", account);

    // Query account information
    let storage_query = polkadot_testnet::storage().system().account(account);
    let account_info = api
        .storage()
        .at_latest()
        .await?
        .fetch(&storage_query)
        .await?;

    if let Some(info) = account_info {
        // Display account information
        println!("Account Information:");
        println!("===================");
        println!("Nonce: {}", info.nonce);
        println!("Consumers: {}", info.consumers);
        println!("Providers: {}", info.providers);
        println!("Sufficients: {}", info.sufficients);

        println!("\nBalance Details:");
        println!("================");
        println!(
            "Free Balance: {} ({} PAS)",
            info.data.free,
            info.data.free as f64 / PAS_UNITS as f64
        );
        println!(
            "Reserved Balance: {} ({} PAS)",
            info.data.reserved,
            info.data.reserved as f64 / PAS_UNITS as f64
        );
        println!(
            "Frozen Balance: {} ({} PAS)",
            info.data.frozen,
            info.data.frozen as f64 / PAS_UNITS as f64
        );

        let total = info.data.free + info.data.reserved;
        println!(
            "\nTotal Balance: {} ({} PAS)",
            total,
            total as f64 / PAS_UNITS as f64
        );
    } else {
        println!("Account not found or has no data");
    }

    println!("\nDisconnected");

    Ok(())
}
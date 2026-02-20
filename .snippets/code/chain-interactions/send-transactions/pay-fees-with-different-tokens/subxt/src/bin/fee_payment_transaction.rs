use std::str::FromStr;
use subxt::config::{Config, DefaultExtrinsicParams, DefaultExtrinsicParamsBuilder, PolkadotConfig};
use subxt::utils::AccountId32;
use subxt::{OnlineClient, SubstrateConfig};

// Generate types from the Polkadot Hub metadata with Location trait derives
#[subxt::subxt(
    runtime_metadata_path = "metadata/asset_hub.scale",
    derive_for_type(
        path = "staging_xcm::v5::location::Location",
        derive = "Clone, Eq, PartialEq, codec::Encode",
        recursive
    )
)]
pub mod asset_hub {}

// Import XCM location types from the generated metadata module
use asset_hub::runtime_types::staging_xcm::v5::{
    junction::Junction,
    junctions::Junctions,
    location::Location,
};

// Define a custom config where AssetId is an XCM Location
pub enum AssetHubConfig {}

impl Config for AssetHubConfig {
    type AccountId = <PolkadotConfig as Config>::AccountId;
    type Address = <PolkadotConfig as Config>::Address;
    type Signature = <PolkadotConfig as Config>::Signature;
    type Hasher = <PolkadotConfig as Config>::Hasher;
    type Header = <SubstrateConfig as Config>::Header;
    type ExtrinsicParams = DefaultExtrinsicParams<AssetHubConfig>;
    type AssetId = Location;
}

const POLKADOT_HUB_RPC: &str = "ws://localhost:8000";
const TARGET_ADDRESS: &str = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3";
const TRANSFER_AMOUNT: u128 = 3_000_000_000; // 3 DOT
const USDT_ASSET_ID: u128 = 1984;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to the local Chopsticks Polkadot Hub fork
    let api = OnlineClient::<AssetHubConfig>::from_url(POLKADOT_HUB_RPC).await?;
    println!("Connected to Polkadot Hub (Chopsticks fork)");

    // Create Alice's dev keypair
    let alice = subxt_signer::sr25519::dev::alice();
    println!("Sender (Alice): {}", AccountId32::from(alice.public_key()));

    // Create the balance transfer transaction
    let dest = AccountId32::from_str(TARGET_ADDRESS)?;
    let tx = asset_hub::tx()
        .balances()
        .transfer_keep_alive(dest.into(), TRANSFER_AMOUNT);

    // Define the USDT asset location in XCM format
    let asset_location = Location {
        parents: 0,
        interior: Junctions::X2([
            Junction::PalletInstance(50),
            Junction::GeneralIndex(USDT_ASSET_ID),
        ]),
    };

    // Build transaction params to pay fees with the alternative asset
    let tx_params = DefaultExtrinsicParamsBuilder::<AssetHubConfig>::new()
        .tip_of(0, asset_location)
        .build();

    // Sign, submit, and watch for finalization
    println!("Signing and submitting transaction...");
    let progress = api
        .tx()
        .sign_and_submit_then_watch(&tx, &alice, tx_params)
        .await?;

    let in_block = progress.wait_for_finalized().await?;
    let block_hash = in_block.block_hash();
    let events = in_block.wait_for_success().await?;

    // Display transaction results
    println!("\nTransaction finalized in block: {:?}", block_hash);

    println!("\nEvents:");
    for event in events.iter() {
        let event = event?;
        println!(
            "  {}.{}",
            event.pallet_name(),
            event.variant_name()
        );
    }

    Ok(())
}

use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};
use subxt_signer::{bip39::Mnemonic,sr25519::Keypair};

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Define the node URL.
    const NODE_URL: &str = "INSERT_NODE_URL";

    // Initialize the Subxt client for interacting with the blockchain.
    let api = OnlineClient::<PolkadotConfig>::from_url(NODE_URL).await?;

    // A query to obtain some contant:
    let constant_query = polkadot::constants().balances().existential_deposit();

    // Obtain the value:
    let value = api.constants().at(&constant_query)?;

    println!("Existential deposit: {:?}", value);

    // Define the target account address.
    const ADDRESS: &str = "INSERT_ADDRESS";
    let account = AccountId32::from_str(ADDRESS).unwrap();

    // Build a storage query to access account information.
    let storage_query = polkadot::storage().system().account(&account.into());

    // Fetch the latest state for the account.
    let result = api
        .storage()
        .at_latest()
        .await?
        .fetch(&storage_query)
        .await?
        .unwrap();

    println!("Account info: {:?}", result);

    // Define the recipient address and transfer amount.
    const DEST_ADDRESS: &str = "INSERT_DEST_ADDRESS";
    const AMOUNT: u128 = INSERT_AMOUNT;

    // Convert the recipient address into an `AccountId32`.
    let dest = AccountId32::from_str(DEST_ADDRESS).unwrap();

    // Build the balance transfer extrinsic.
    let balance_transfer_tx = polkadot::tx()
        .balances()
        .transfer_allow_death(dest.into(), AMOUNT);

    // Load the sender's keypair from a mnemonic phrase.
    const SECRET_PHRASE: &str = "INSERT_SECRET_PHRASE";
    let mnemonic = Mnemonic::parse(SECRET_PHRASE).unwrap();
    let sender_keypair = Keypair::from_phrase(&mnemonic, None).unwrap();

    // Sign and submit the extrinsic, then wait for it to be finalized.
    let events = api
        .tx()
        .sign_and_submit_then_watch_default(&balance_transfer_tx, &sender_keypair)
        .await?
        .wait_for_finalized_success()
        .await?;

    // Check for a successful transfer event.
    if let Some(event) = events.find_first::<polkadot::balances::events::Transfer>()? {
        println!("Balance transfer successful: {:?}", event);
    }

    Ok(())
}
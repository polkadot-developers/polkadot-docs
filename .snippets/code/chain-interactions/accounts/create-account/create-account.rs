use sp_core::{crypto::Ss58Codec, Pair};

fn main() {
    let (pair, phrase, _) = sp_core::sr25519::Pair::generate_with_phrase(None);
    let address = pair.public().to_ss58check();
    
    println!("Address: {}", address);
    println!("Mnemonic: {}", phrase);
}
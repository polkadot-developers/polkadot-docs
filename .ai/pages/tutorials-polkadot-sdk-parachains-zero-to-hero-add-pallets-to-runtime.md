---
title: Add Pallets to the Runtime
description: Add pallets to your runtime for custom functionality. Learn to configure and integrate pallets in Polkadot SDK-based blockchains.
categories: Basics, Parachains
url: https://docs.polkadot.com/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/
---

# Add Pallets to the Runtime

## Introduction

In previous tutorials, you learned how to [create a custom pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} and [test it](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/){target=\_blank}. The next step is to include this pallet in your runtime, integrating it into the core logic of your blockchain.

This tutorial will guide you through adding two pallets to your runtime: the custom pallet you previously developed and the [utility pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_utility/index.html){target=\_blank}. This standard Polkadot SDK pallet provides powerful dispatch functionality. The utility pallet offers, for example, batch dispatch, a stateless operation that enables executing multiple calls in a single transaction.

## Add the Pallets as Dependencies

First, you'll update the runtime's `Cargo.toml` file to include the Utility pallet and your custom pallets as dependencies for the runtime. Follow these steps:

1. Open the `runtime/Cargo.toml` file and locate the `[dependencies]` section. Add pallet-utility as one of the features for the `polkadot-sdk` dependency with the following line:

    ```toml hl_lines="4" title="runtime/Cargo.toml"
    [dependencies]
    ...
    polkadot-sdk = { workspace = true, features = [
  "pallet-utility",
        ...
    ], default-features = false }
    ```

2. In the same `[dependencies]` section, add the custom pallet that you built from scratch with the following line:

    ```toml hl_lines="3" title="Cargo.toml"
    [dependencies]
    ...
    custom-pallet = { path = "../pallets/custom-pallet", default-features = false }
    ```

3. In the `[features]` section, add the custom pallet to the `std` feature list:

    ```toml hl_lines="5" title="Cargo.toml"
    [features]
default = ["std"]
std = [
      ...
      "custom-pallet/std",
      ...
    ]
    ```

3. Save the changes and close the `Cargo.toml` file.

    Once you have saved your file, it should look like the following:

    ???- code "runtime/Cargo.toml"
        
        ```rust title="runtime/Cargo.toml"
        [package]
name = "parachain-template-runtime"
description = "A parachain runtime template built with Substrate and Cumulus, part of Polkadot Sdk."
version = "0.1.0"
license = "Unlicense"
authors.workspace = true
homepage.workspace = true
repository.workspace = true
edition.workspace = true
publish = false

[package.metadata.docs.rs]
targets = ["x86_64-unknown-linux-gnu"]

[build-dependencies]
docify = { workspace = true }
substrate-wasm-builder = { optional = true, workspace = true, default-features = true }

[dependencies]
codec = { features = ["derive"], workspace = true }
cumulus-pallet-parachain-system.workspace = true
docify = { workspace = true }
hex-literal = { optional = true, workspace = true, default-features = true }
log = { workspace = true }
pallet-parachain-template = { path = "../pallets/template", default-features = false }
polkadot-sdk = { workspace = true, features = [
  "pallet-utility",
  "cumulus-pallet-aura-ext",
  "cumulus-pallet-session-benchmarking",
  "cumulus-pallet-weight-reclaim",
  "cumulus-pallet-xcm",
  "cumulus-pallet-xcmp-queue",
  "cumulus-primitives-aura",
  "cumulus-primitives-core",
  "cumulus-primitives-utility",
  "pallet-aura",
  "pallet-authorship",
  "pallet-balances",
  "pallet-collator-selection",
  "pallet-message-queue",
  "pallet-session",
  "pallet-sudo",
  "pallet-timestamp",
  "pallet-transaction-payment",
  "pallet-transaction-payment-rpc-runtime-api",
  "pallet-xcm",
  "parachains-common",
  "polkadot-parachain-primitives",
  "polkadot-runtime-common",
  "runtime",
  "staging-parachain-info",
  "staging-xcm",
  "staging-xcm-builder",
  "staging-xcm-executor",
], default-features = false }
scale-info = { features = ["derive"], workspace = true }
serde_json = { workspace = true, default-features = false, features = [
  "alloc",
] }
smallvec = { workspace = true, default-features = true }

custom-pallet = { path = "../pallets/custom-pallet", default-features = false }

[features]
default = ["std"]
std = [
  "codec/std",
  "cumulus-pallet-parachain-system/std",
  "log/std",
  "pallet-parachain-template/std",
  "polkadot-sdk/std",
  "scale-info/std",
  "serde_json/std",
  "substrate-wasm-builder",
  "custom-pallet/std",
]

runtime-benchmarks = [
  "cumulus-pallet-parachain-system/runtime-benchmarks",
  "hex-literal",
  "pallet-parachain-template/runtime-benchmarks",
  "polkadot-sdk/runtime-benchmarks",
]

try-runtime = [
  "cumulus-pallet-parachain-system/try-runtime",
  "pallet-parachain-template/try-runtime",
  "polkadot-sdk/try-runtime",
]

# Enable the metadata hash generation.
#
# This is hidden behind a feature because it increases the compile time.
# The wasm binary needs to be compiled twice, once to fetch the metadata,
# generate the metadata hash and then a second time with the
# `RUNTIME_METADATA_HASH` environment variable set for the `CheckMetadataHash`
# extension.
metadata-hash = ["substrate-wasm-builder/metadata-hash"]

# A convenience feature for enabling things when doing a build
# for an on-chain release.
on-chain-release-build = ["metadata-hash"]

        ```

Update your root parachain template's `Cargo.toml` file to include your custom pallet as a dependency. Follow these steps:

1. Open the `./Cargo.toml` file and locate the `[workspace]` section. 
    
    Make sure the `custom-pallet` is a member of the workspace:

    ```toml hl_lines="4" title="Cargo.toml"
     [workspace]
default-members = ["pallets/template", "runtime"]
members = [
    "node", "pallets/custom-pallet",
    "pallets/template",
    "runtime",
]
    ```

???- code "./Cargo.toml"

    ```rust title="./Cargo.toml"
    [workspace.package]
license = "MIT-0"
authors = ["Parity Technologies <admin@parity.io>"]
homepage = "https://paritytech.github.io/polkadot-sdk/"
repository = "https://github.com/paritytech/polkadot-sdk-parachain-template.git"
edition = "2021"

[workspace]
default-members = ["pallets/template", "runtime"]
members = [
    "node", "pallets/custom-pallet",
    "pallets/template",
    "runtime",
]
resolver = "2"

[workspace.dependencies]
parachain-template-runtime = { path = "./runtime", default-features = false }
pallet-parachain-template = { path = "./pallets/template", default-features = false }
clap = { version = "4.5.13" }
color-print = { version = "0.3.4" }
docify = { version = "0.2.9" }
futures = { version = "0.3.31" }
jsonrpsee = { version = "0.24.3" }
log = { version = "0.4.22", default-features = false }
polkadot-sdk = { version = "2503.0.1", default-features = false }
prometheus-endpoint = { version = "0.17.2", default-features = false, package = "substrate-prometheus-endpoint" }
serde = { version = "1.0.214", default-features = false }
codec = { version = "3.7.4", default-features = false, package = "parity-scale-codec" }
cumulus-pallet-parachain-system = { version = "0.20.0", default-features = false }
hex-literal = { version = "0.4.1", default-features = false }
scale-info = { version = "2.11.6", default-features = false }
serde_json = { version = "1.0.132", default-features = false }
smallvec = { version = "1.11.0", default-features = false }
substrate-wasm-builder = { version = "26.0.1", default-features = false }
frame = { version = "0.9.1", default-features = false, package = "polkadot-sdk-frame" }

[profile.release]
opt-level = 3
panic = "unwind"

[profile.production]
codegen-units = 1
inherits = "release"
lto = true
    ```


### Update the Runtime Configuration

Configure the pallets by implementing their `Config` trait and update the runtime macro to include the new pallets:

1. Add the `OriginCaller` import:

    ```rust title="mod.rs" hl_lines="8"
    // Local module imports
use super::OriginCaller;
    ...
    ```

2. Implement the [`Config`](https://paritytech.github.io/polkadot-sdk/master/pallet_utility/pallet/trait.Config.html){target=\_blank} trait for both pallets at the end of the `runtime/src/config/mod.rs` file:

    ```rust title="mod.rs" hl_lines="8-25"
    ...
    /// Configure the pallet template in pallets/template.
impl pallet_parachain_template::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = pallet_parachain_template::weights::SubstrateWeight<Runtime>;
}

// Configure utility pallet.
impl pallet_utility::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type RuntimeCall = RuntimeCall;
    type PalletsOrigin = OriginCaller;
    type WeightInfo = pallet_utility::weights::SubstrateWeight<Runtime>;
}
    // Define counter max value runtime constant.
parameter_types! {
    pub const CounterMaxValue: u32 = 500;
}

// Configure custom pallet.
impl custom_pallet::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
    }
    ```

3. Locate the `#[frame_support::runtime]` macro in the `runtime/src/lib.rs` file and add the pallets:

    ```rust hl_lines="9-14" title="lib.rs"
    #[frame_support::runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
            ...
            )]
    pub struct Runtime;

        #[runtime::pallet_index(51)]
    pub type Utility = pallet_utility;

    #[runtime::pallet_index(52)]
    pub type CustomPallet = custom_pallet;
    }
    ```

## Recompile the Runtime

After adding and configuring your pallets in the runtime, the next step is to ensure everything is set up correctly. To do this, recompile the runtime with the following command (make sure you're in the project's root directory):

```bash
cargo build --release
```

This command ensures the runtime compiles without errors, validates the pallet configurations, and prepares the build for subsequent testing or deployment.

## Run Your Chain Locally

Launch your parachain locally and start producing blocks:

!!!tip
    Generated chain TestNet specifications include development accounts "Alice" and "Bob." These accounts are pre-funded with native parachain currency, allowing you to sign and send TestNet transactions. Take a look at the [Polkadot.js Accounts section](https://polkadot.js.org/apps/#/accounts){target=\_blank} to view the development accounts for your chain.

1. Create a new chain specification file with the updated runtime:

    ```bash
    chain-spec-builder create -t development \
    --relay-chain paseo \
    --para-id 1000 \
    --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    named-preset development
    ```

2. Start the omni node with the generated chain specification:

    ```bash
    polkadot-omni-node --chain ./chain_spec.json --dev
    ```

3. Verify you can interact with the new pallets using the [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/extrinsics){target=\_blank} interface. Navigate to the **Extrinsics** tab and check that you can see both pallets:

    - Utility pallet

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/add-pallets-to-runtime-1.webp)
    

    - Custom pallet

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/add-pallets-to-runtime-2.webp)

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy on Paseo TestNet__

    ---

    Deploy your Polkadot SDK blockchain on Paseo! Follow this step-by-step guide for a seamless journey to a successful TestNet deployment.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/)

-   <span class="badge tutorial">Tutorial</span> __Pallet Benchmarking (Optional)__

    ---

    Discover how to measure extrinsic costs and assign precise weights to optimize your pallet for accurate fees and runtime performance.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/)

</div>

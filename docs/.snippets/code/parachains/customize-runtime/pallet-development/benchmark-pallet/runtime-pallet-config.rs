// Configure pallet.
impl pallet_parachain_template::Config for Runtime {
    // ...
    type WeightInfo = pallet_parachain_template::weights::SubstrateWeight<Runtime>;
}
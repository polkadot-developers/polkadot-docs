...
/// Configure the pallet-template in pallets/template.
impl pallet_template::Config for Runtime {
    ...
}

// Add here after all the other pallets implementations
impl pallet_utility::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type RuntimeCall = RuntimeCall;
    type PalletsOrigin = OriginCaller;
    type WeightInfo = pallet_utility::weights::SubstrateWeight<Runtime>;
}
...
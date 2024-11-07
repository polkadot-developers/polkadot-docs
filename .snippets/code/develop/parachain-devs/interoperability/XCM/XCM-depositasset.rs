DepositAsset {
    assets: All.into(),
    beneficiary:  MultiLocation {
        parents: 0,
        interior: Junction::AccountId32 {
            network: None,
            id: BOB.clone().into()
        }.into(),
    }.into()
}
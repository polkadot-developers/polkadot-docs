---
title: Configure Asynchronous Backing
description: Learn how to increase the efficiency and throughput of your parachain
  by configuring it to leverage asynchronous backing.
url: https://docs.polkadot.com/develop/parachains/maintenance/configure-asynchronous-backing/
---

# Configure Parachain for Asynchronous Backing Compatibility

## Introduction

This guide applies to parachain projects based on Cumulus that started in 2023 or earlier, where the backing process was synchronous, allowing parablocks to be built only on the latest relay chain block. In contrast, async backing will enable collators to build parablocks on older relay chain blocks and create pipelines of multiple pending parablocks. This parallel block generation increases efficiency and throughput.

!!!note
    When starting a new parachain project, please use an async backing-compatible template, such as the [parachain template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank}. The rollout process for async backing has three phases. Phases 1 and 2 below involve the installation of new infrastructure. Then, async backing is enabled in phase 3.

## Prerequisite

The relay chain must have async backing enabled; therefore, double-check the relay's runtime to verify that the following three parameters are included in the relay chain configuration (especially when testing locally with tools like [Zombienet](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/){target=\_blank}):

```rust title="runtimes/relay/polkadot/src/genesis_config_presets.rs"
-...
"async_backing_params": {
    "max_candidate_depth": 3,
    "allowed_ancestry_len": 2
},
...
```

You can see GitHub for an example of the Polkadot relay chain's [`async_backing_params`](https://github.com/polkadot-fellows/runtimes/blob/d49a9f33d0ea85ce51c26c84a70b61624ec06901/relay/polkadot/src/genesis_config_presets.rs#L131-L134){target=\_blank} configuration. 

You must also ensure the `lookahead` in [`schedulerParams`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/relay_chain/struct.SchedulerParams.html){target=\_blank} is set to `3`. You can verify the setting by querying the [`scheduler_params`](https://paritytech.github.io/polkadot-sdk/master/polkadot_runtime_parachains/configuration/struct.HostConfiguration.html#structfield.scheduler_params){target=\_blank} using the [`configuration.activeConfig()`](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-polkadot.helixstreet.io#/chainstate) query in Polkadot JS.

!!! warning 
    If the `lookahead` field is not set to 3, parachain block times will degrade, resulting in worse performance than using synchronous backing.

## Phase 1 - Update Parachain Runtime

This phase involves configuring your parachain's runtime `/runtime/src/lib.rs` to utilize an async backing system.

1. Verify the constants for capacity ([`UNINCLUDED_SEGMENT_CAPACITY`](https://github.com/paritytech/polkadot-sdk/blob/b4b019e4db0ef47b0952638388eba4958e1c4004/templates/parachain/runtime/src/lib.rs#L229){target=\_blank}) and velocity ([`BLOCK_PROCESSING_VELOCITY`](https://github.com/paritytech/polkadot-sdk/blob/b4b019e4db0ef47b0952638388eba4958e1c4004/templates/parachain/runtime/src/lib.rs#L232){target=\_blank}) are both set to `1` in the runtime.

    - `UNINCLUDED_SEGMENT_CAPACITY` will be increased to `3` later in this guide.

2. Verify the constant relay chain slot duration measured in milliseconds is equal to `6000` in the runtime.

    ```rust title="lib.rs"
    -// Maximum number of blocks simultaneously accepted by the runtime, not yet included into the
// relay chain.
pub const UNINCLUDED_SEGMENT_CAPACITY: u32 = 1;
// How many parachain blocks are processed by the relay chain per parent. Limits the number of
// blocks authored per slot.
pub const BLOCK_PROCESSING_VELOCITY: u32 = 1;
// Relay chain slot duration, in milliseconds.
pub const RELAY_chain_SLOT_DURATION_MILLIS: u32 = 6000;
    ```

3. Verify the constants [`MILLISECS_PER_BLOCK`](https://github.com/paritytech/polkadot-sdk/blob/b4b019e4db0ef47b0952638388eba4958e1c4004/templates/parachain/runtime/src/lib.rs#L189){target=\_blank} and [`SLOT_DURATION`](https://github.com/paritytech/polkadot-sdk/blob/b4b019e4db0ef47b0952638388eba4958e1c4004/templates/parachain/runtime/src/lib.rs#L193){target=\_blank} are present in the runtime.

    - `MILLISECS_PER_BLOCK` will be decreased to `6000` later in this guide.

    ```rust title="lib.rs"
    -// `SLOT_DURATION` is picked up by `pallet_timestamp` which is in turn picked
// up by `pallet_aura` to implement `fn slot_duration()`.
//
// Change this to adjust the block time.
pub const MILLISECS_PER_BLOCK: u64 = 12000;
pub const SLOT_DURATION: u64 = MILLISECS_PER_BLOCK;
    ```

4. Configure [`cumulus_pallet_parachain_system`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/index.html){target=\_blank} in the runtime using the following steps:

    a. Define a [`FixedVelocityConsensusHook`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_aura_ext/consensus_hook/struct.FixedVelocityConsensusHook.html){target=\_blank} using our capacity, velocity, and relay slot duration constants.

        ```rust title="lib.rs"
        -type ConsensusHook = cumulus_pallet_aura_ext::FixedVelocityConsensusHook<
    Runtime,
    RELAY_CHAIN_SLOT_DURATION_MILLIS,
    BLOCK_PROCESSING_VELOCITY,
    UNINCLUDED_SEGMENT_CAPACITY,
>;
        ```

    b. Use this to set the parachain system [`ConsensusHook`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/pallet/trait.Config.html#associatedtype.ConsensusHook){target=\_blank} property.

        ```rust title="lib.rs"
        -impl cumulus_pallet_parachain_system::Config for Runtime {
    ...
    type ConsensusHook = ConsensusHook;
    ...
}
        ```

    c. Set the parachain system property [`CheckAssociatedRelayNumber`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/pallet/trait.Config.html#associatedtype.CheckAssociatedRelayNumber){target=\_blank} to [`RelayNumberMonotonicallyIncreases`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/struct.RelayNumberMonotonicallyIncreases.html){target=\_blank}.

        ```rust title="lib.rs"
        -impl cumulus_pallet_parachain_system::Config for Runtime {
    ...
    type CheckAssociatedRelayNumber = RelayNumberMonotonicallyIncreases;
    ...
}
        ```

5. Configure [`pallet_aura`](https://paritytech.github.io/polkadot-sdk/master/pallet_aura/index.html){target=\_blank} in the runtime to implement Authority Round (Aura) as follows:

    a. Set [`AllowMultipleBlocksPerSlot`](https://paritytech.github.io/polkadot-sdk/master/pallet_aura/pallet/trait.Config.html#associatedtype.AllowMultipleBlocksPerSlot){target=\_blank} to `false`.

        - This will be set to `true` when you activate async backing in phase 3.

    b. Define [`pallet_aura::SlotDuration`](https://paritytech.github.io/polkadot-sdk/master/pallet_aura/pallet/trait.Config.html#associatedtype.SlotDuration){target=\_blank} using our constant [`SLOT_DURATION`](https://github.com/polkadot-fellows/runtimes/blob/d49a9f33d0ea85ce51c26c84a70b61624ec06901/system-parachains/constants/src/lib.rs#L38-L40){target=\_blank}.

        ```rust title="lib.rs"
        -impl pallet_aura::Config for Runtime {
    ...
    type AllowMultipleBlocksPerSlot = ConstBool<false>;
    #[cfg(feature = "experimental")]
    type SlotDuration = ConstU64<SLOT_DURATION>;
    ...
}
        ```

    !!! note
        Aura is a deterministic [consensus](/polkadot-protocol/glossary/#consensus){target=\_blank} protocol where block production is limited to a rotating list of authorities that take turns creating blocks and [`pallet_timestamp`](https://paritytech.github.io/polkadot-sdk/master/pallet_timestamp/index.html){target=\_blank} is used to track consensus rounds (via [`slots`](https://paritytech.github.io/polkadot-sdk/master/pallet_aura/pallet/trait.Config.html#associatedtype.SlotDuration){target=\_blank}).


6. Update `sp_consensus_aura::AuraApi::slot_duration` in `sp_api::impl_runtime_apis` to match the constant [`SLOT_DURATION`](https://github.com/polkadot-fellows/runtimes/blob/d49a9f33d0ea85ce51c26c84a70b61624ec06901/system-parachains/constants/src/lib.rs#L38-L40){target=\_blank}.

    ```rust title="apis.rs"
    -fn impl_slot_duration() -> sp_consensus_aura::SlotDuration {
    sp_consensus_aura::SlotDuration::from_millis(SLOT_DURATION)
}
    ```

7. Implement the [`AuraUnincludedSegmentApi`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_aura/trait.AuraUnincludedSegmentApi.html){target=\_blank}, which allows the collator client to query its runtime to determine whether it should author a block using these steps:

    a. Add the dependency [`cumulus-primitives-aura`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_aura/index.html){target=\_blank} to the `runtime/Cargo.toml` file for your runtime.

        ```rust title="Cargo.toml"
        -...
cumulus-primitives-aura = { path = "../../../../primitives/aura", default-features = false }
...
        ```

    b. In the same file, add `"cumulus-primitives-aura/std",` to the `std` feature.

    c. Inside the [`impl_runtime_apis!`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/runtime/src/apis.rs#L87-L91){target=\_blank} block for your runtime, implement the [`cumulus_primitives_aura::AuraUnincludedSegmentApi`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_aura/trait.AuraUnincludedSegmentApi.html){target=\_blank} as shown below.
        
        ```rust title="apis.rs"
        -impl cumulus_primitives_aura::AuraUnincludedSegmentApi<Block> for Runtime {
    fn can_build_upon(
        included_hash: <Block as BlockT>::Hash,
        slot: cumulus_primitives_aura::Slot,
    ) -> bool {
        Runtime::impl_can_build_upon(included_hash, slot)
    }
}
        ```

    !!!note
        With a capacity of 1, you have an effective velocity of ½, even when velocity is configured to a larger value. Capacity will be filled after a single block is produced and will only be freed up after that block is included on the relay chain, which takes two relay blocks to accomplish. Thus, with a capacity of 1 and a velocity of 1, you achieve the customary 12-second parachain block time.

8. If your `runtime/src/lib.rs` provides a [`CheckInherents`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/macro.register_validate_block.html){target=\_blank} type to [`register_validate_block`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/macro.register_validate_block.html), remove it. [`FixedVelocityConsensusHook`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_aura_ext/consensus_hook/struct.FixedVelocityConsensusHook.html){target=\_blank} makes it unnecessary. The following example shows how `register_validate_block` should look after removing `CheckInherents`.

    ```rust title="lib.rs"
    -cumulus_pallet_parachain_system::register_validate_block! {
    Runtime = Runtime,
    BlockExecutor = cumulus_pallet_aura_ext::BlockExecutor::<Runtime, Executive>,
}
    ```

## Phase 2 - Update Parachain Nodes

This phase consists of plugging in the new lookahead collator node.

1. Import [`cumulus_primitives_core::ValidationCode`](https://paritytech.github.io/polkadot-sdk/master/cumulus_primitives_core/relay_chain/struct.ValidationCode.html){target=\_blank} to `node/src/service.rs`.

    ```rust title="node/src/service.rs"
    -use cumulus_primitives_core::{
    relay_chain::{CollatorPair, ValidationCode},
    GetParachainInfo, ParaId,
};
    ```

2. In `node/src/service.rs`, modify [`sc_service::spawn_tasks`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L340-L347){target=\_blank} to use a clone of `Backend` rather than the original.

    ```rust title="node/src/service.rs"
    -sc_service::spawn_tasks(sc_service::SpawnTasksParams {
    ...
    backend: backend.clone(),
    ...
})?;
    ```

3. Add `backend` as a parameter to [`start_consensus()`](https://paritytech.github.io/polkadot-sdk/master/parachain_template_node/service/fn.start_consensus.html){target=\_blank} in `node/src/service.rs`.

    ```rust title="node/src/service.rs"
    -fn start_consensus(
    ...
    backend: Arc<ParachainBackend>,
    ...
    ```

    ```rust title="node/src/service.rs"
    -if validator {
    start_consensus(
        ...
        backend.clone(),
        ...
    )?;
}
    ```

4. In `node/src/service.rs` [import the lookahead collator](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L19){target=\_blank} rather than the basic collator.

    ```rust title="node/src/service.rs"
    -use cumulus_client_consensus_aura::collators::lookahead::{self as aura, Params as AuraParams};
    ```

5. In `start_consensus()` replace the `BasicAuraParams` struct with [`AuraParams`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L206){target=\_blank} as follows:

    a. Change the struct type from `BasicAuraParams` to `AuraParams`.

    b. In the [`para_client`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L206-L225){target=\_blank} field, pass in a cloned para client rather than the original.

    c. Add a [`para_backend`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L206-L225){target=\_blank} parameter after `para_client`, passing in our para backend.

    d. Provide a [`code_hash_provider`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L206-L225){target=\_blank} closure like that shown below.

    e. Increase [`authoring_duration`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L206-L225){target=\_blank} from 500 milliseconds to 2000.

    ```rust title="node/src/service.rs"
    -let params = AuraParams {
    ...
    para_client: client.clone(),
    para_backend: backend.clone(),
    ...
    code_hash_provider: move |block_hash| {
        client.code_at(block_hash).ok().map(|c| ValidationCode::from(c).hash())
    },
    ...
    authoring_duration: Duration::from_millis(2000),
    ...
};
    ```

    !!!note
        Set [`authoring_duration`](https://paritytech.github.io/polkadot-sdk/master/cumulus_client_consensus_aura/collators/slot_based/struct.Params.html#structfield.authoring_duration){target=\_blank} to whatever you want, taking your hardware into account. But if the backer, who should be slower than you due to reading from disk, times out at two seconds, your candidates will be rejected.

6. In [`start_consensus()`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L173) replace `basic_aura::run` with [`aura::run`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/node/src/service.rs#L226){target=\_blank}.

    ```rust title="node/src/service.rs"
	-let fut = aura::run::<Block, sp_consensus_aura::sr25519::AuthorityPair, _, _, _, _, _, _, _, _>(
    params,
);
task_manager.spawn_essential_handle().spawn("aura", None, fut);
    ```

## Phase 3 - Activate Async Backing

This phase involves changes to your parachain's runtime that activate the asynchronous backing feature.

1. Configure [`pallet_aura`](https://paritytech.github.io/polkadot-sdk/master/pallet_aura/index.html){target=\_blank}, setting [`AllowMultipleBlocksPerSlot`](https://paritytech.github.io/polkadot-sdk/master/pallet_aura/pallet/trait.Config.html#associatedtype.AllowMultipleBlocksPerSlot){target=\_blank} to true in `runtime/src/lib.rs`.

    ```rust title="runtime/src/lib.rs"
    -impl pallet_aura::Config for Runtime {
    type AuthorityId = AuraId;
    type DisabledValidators = ();
    type MaxAuthorities = ConstU32<100_000>;
    type AllowMultipleBlocksPerSlot = ConstBool<true>;
    type SlotDuration = ConstU64<SLOT_DURATION>;
}
    ```

2. Increase the maximum [`UNINCLUDED_SEGMENT_CAPACITY`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/runtime/src/lib.rs#L226-L235){target=\_blank} in `runtime/src/lib.rs`.

    ```rust title="runtime/src/lib.rs"
    -mod async_backing_params {
    /// Maximum number of blocks simultaneously accepted by the Runtime, not yet included
    /// into the relay chain.
    pub(crate) const UNINCLUDED_SEGMENT_CAPACITY: u32 = 3;
    /// How many parachain blocks are processed by the relay chain per parent. Limits the
    /// number of blocks authored per slot.
    pub(crate) const BLOCK_PROCESSING_VELOCITY: u32 = 1;
    /// Relay chain slot duration, in milliseconds.
    pub(crate) const RELAY_CHAIN_SLOT_DURATION_MILLIS: u32 = 6000;
}
    ```

3. Decrease [`MILLI_SECS_PER_BLOCK`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/runtime/src/lib.rs#L182-L194){target=\_blank} to 6000.

    !!!note
        For a parachain that measures time in terms of its own block number, rather than by relay block number, it may be preferable to increase velocity. Changing block time may cause complications, requiring additional changes. See the section [Timing by Block Number](#timing-by-block-number){target=\_blank}.

    ```rust title="runtime/src/lib.rs"
    -mod block_times {
    /// This determines the average expected block time that we are targeting. Blocks will be
    /// produced at a minimum duration defined by `SLOT_DURATION`. `SLOT_DURATION` is picked up by
    /// `pallet_timestamp` which is in turn picked up by `pallet_aura` to implement `fn
    /// slot_duration()`.
    ///
    /// Change this to adjust the block time.
    pub const MILLI_SECS_PER_BLOCK: u64 = 6000;

    // NOTE: Currently it is not possible to change the slot duration after the chain has started.
    // Attempting to do so will brick block production.
    pub const SLOT_DURATION: u64 = MILLI_SECS_PER_BLOCK;
}
    ```

4. Update [`MAXIMUM_BLOCK_WEIGHT`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/runtime/src/lib.rs#L219-L223){target=\_blank} to reflect the increased time available for block production.

    ```rust title="runtime/src/lib.rs"
    -const MAXIMUM_BLOCK_WEIGHT: Weight = Weight::from_parts(
    WEIGHT_REF_TIME_PER_SECOND.saturating_mul(2),
    cumulus_primitives_core::relay_chain::MAX_POV_SIZE as u64,
);
    ```

5. For [`MinimumPeriod`](https://paritytech.github.io/polkadot-sdk/master/pallet_timestamp/pallet/trait.Config.html#associatedtype.MinimumPeriod) in [`pallet_timestamp`](https://paritytech.github.io/polkadot-sdk/master/pallet_timestamp/index.html){target=\_blank} the type should be [`ConstU64<0>`](https://github.com/paritytech/polkadot-sdk/blob/6b17df5ae96f7970109ec3934c7d288f05baa23b/templates/parachain/runtime/src/configs/mod.rs#L141){target=\_blank}.

    ```rust title="runtime/src/lib.rs"
    -impl pallet_timestamp::Config for Runtime {
    ...
    type MinimumPeriod = ConstU64<0>;
    ...
}
    ```

## Timing by Block Number

With asynchronous backing, it will be possible for parachains to opt for a block time of 6 seconds rather than 12 seconds. However, modifying block duration isn't so simple for a parachain that measures time in terms of its own block number, which could result in the expected and actual time not matching up, stalling the parachain.

One strategy to address this issue is to rely on relay chain block numbers for timing instead. Relay block number is kept track of by each parachain in [`pallet-parachain-system`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/index.html){target=\_blank} with the storage value [`LastRelaychainBlockNumber`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_parachain_system/pallet/type.LastRelayChainBlockNumber.html){target=\_blank}. This value can be obtained and used wherever timing based on block number is needed.

---
title: Add Multiple Pallet Instances
description: Learn how to implement multiple instances of the same pallet in your Polkadot SDK-based runtime to create and interact with modular blockchain components.
categories: Parachains
---

# Add Multiple Pallet Instances

## Introduction

Running multiple instances of the same pallet within a runtime is a powerful technique in Polkadot SDK development. This approach lets you reuse pallet functionality without reimplementing it, enabling diverse use cases with the same codebase. The Polkadot SDK provides developer-friendly traits for creating instantiable pallets and, in most cases, handles unique storage allocation for different instances automatically. This guide teaches you how to implement and configure multiple instances of a pallet in your runtime.

## Understanding Instantiable Pallets

Unlike standard pallets that exist as a single instance in a runtime, instantiable pallets require special configuration through an additional [generic parameter](https://doc.rust-lang.org/reference/items/generics.html){target=\_blank} `I`.
This generic `I` creates a unique [lifetime](https://doc.rust-lang.org/rust-by-example/scope/lifetime.html){target=\_blank} for each pallet instance, affecting the pallet's generic types and its configuration trait `T`.

You can identify an instantiable pallet by examining its `Pallet` struct definition, which will include both the standard generic `T` and the instantiation generic `I`:

```rust
#[pallet::pallet]
pub struct Pallet<T, I = ()>(PhantomData<(T, I)>);
```

The instantiation generic also appears throughout the pallet's components, including the `Config` trait, storage items, events, errors, and genesis configuration.

## Adding Instantiable Pallets to Your Runtime

The process resembles adding a standard pallet with some key differences. In this example you will see how adding two instances of the [pallet-collective](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame/collective){target=\_blank} is implemented.

### Define Pallet Parameters

First, define the parameters needed to configure the pallet instances. This step is identical whether implementing single or multiple instances:

```rust
parameter_types! {
    pub const MotionDuration: BlockNumber = 24 * HOURS;
    pub MaxProposalWeight: Weight = Perbill::from_percent(50) * RuntimeBlockWeights::get().max_block;
    pub const MaxProposals: u32 = 100;
    pub const MaxMembers: u32 = 100;
}
```

### Configure the Pallet Instances

For a single instance, the configuration would look like this:

```rust hl_lines="1"
impl pallet_collective::Config for Runtime {
    type RuntimeOrigin = RuntimeOrigin;
    type Proposal = RuntimeCall;
    type RuntimeEvent = RuntimeEvent;
    type MotionDuration = MotionDuration;
    type MaxProposals = MaxProposals;
    type MaxMembers = MaxMembers;
    type DefaultVote = pallet_collective::MoreThanMajorityThenPrimeDefaultVote;
    type SetMembersOrigin = EnsureRoot<AccountId>;
    type WeightInfo = pallet_collective::weights::SubstrateWeight<Runtime>;
    type MaxProposalWeight = MaxProposalWeight;
    type DisapproveOrigin = EnsureRoot<Self::AccountId>;
    type KillOrigin = EnsureRoot<Self::AccountId>;
    type Consideration = ();
}
```

For multiple instances, you need to create a unique identifier for each instance using the `Instance` type with a number suffix, then implement the configuration for each one:

```rust hl_lines="2-3"
// Configure first instance
type Collective1 = pallet_collective::Instance1;
impl pallet_collective::Config<Collective1> for Runtime {
    type RuntimeOrigin = RuntimeOrigin;
    type Proposal = RuntimeCall;
    type RuntimeEvent = RuntimeEvent;
    type MotionDuration = MotionDuration;
    type MaxProposals = MaxProposals;
    type MaxMembers = MaxMembers;
    type DefaultVote = pallet_collective::MoreThanMajorityThenPrimeDefaultVote;
    type SetMembersOrigin = EnsureRoot<AccountId>;
    type WeightInfo = pallet_collective::weights::SubstrateWeight<Runtime>;
    type MaxProposalWeight = MaxProposalWeight;
    type DisapproveOrigin = EnsureRoot<Self::AccountId>;
    type KillOrigin = EnsureRoot<Self::AccountId>;
    type Consideration = ();
}
```
```rust hl_lines="2-3"
// Configure second instance
type Collective2 = pallet_collective::Instance2;
impl pallet_collective::Config<Collective2> for Runtime {
    type RuntimeOrigin = RuntimeOrigin;
    type Proposal = RuntimeCall;
    type RuntimeEvent = RuntimeEvent;
    type MotionDuration = MotionDuration;
    type MaxProposals = MaxProposals;
    type MaxMembers = MaxMembers;
    type DefaultVote = pallet_collective::MoreThanMajorityThenPrimeDefaultVote;
    type SetMembersOrigin = EnsureRoot<AccountId>;
    type WeightInfo = pallet_collective::weights::SubstrateWeight<Runtime>;
    type MaxProposalWeight = MaxProposalWeight;
    type DisapproveOrigin = EnsureRoot<Self::AccountId>;
    type KillOrigin = EnsureRoot<Self::AccountId>;
    type Consideration = ();
}
```

While the example above uses identical configurations for both instances, you can customize each instance's parameters to serve different purposes within your runtime.

### Add Pallet Instances to the Runtime

Finally, add both pallet instances to your runtime definition, ensuring each has:

- A unique pallet index
- The correct instance type specified

```rust hl_lines="6-10"
#[frame_support::runtime]
mod runtime {
    #[runtime::runtime]
    // ... other runtime configuration

    #[runtime::pallet_index(16)]
    pub type Collective1 = pallet_collective<Instance1>;
    
    #[runtime::pallet_index(17)]
    pub type Collective2 = pallet_collective<Instance2>;
    
    // ... other pallets
}
```

## Where to Go Next

If you've followed all the steps correctly, you should now be able to compile your runtime and interact with both instances of the pallet. Each instance will operate independently with its own storage, events, and configured parameters.

Now that you've mastered implementing multiple pallet instances, the next step is creating your own custom pallets. Explore the following resources:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Make a Custom Pallet__

    ---

    Learn how to create custom pallets using FRAME, allowing for flexible, modular, and scalable blockchain development. Follow the step-by-step guide.

    [:octicons-arrow-right-24: Reference](/rollups/pallet-development/)

</div>

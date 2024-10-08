---
title: Transactions Weights and Fees
description: Overview of transaction weights and fees in Polkadot SDK chains, detailing how fees are calculated using a defined formula and runtime specifics.
---

# Transactions Weights and Fees

## Introductions

When transactions are executed, or data is stored on-chain, the activity changes the state of the chain and consumes blockchain resources. Because the resources available to a blockchain are limited, it’s important to manage how operations on-chain consume them. In addition to being limited in practical terms—such as storage capacity—blockchain resources represent a potential attack vector for malicious users. For example, a malicious user might attempt to overload the network with messages to stop the network from producing new blocks. To protect blockchain resources from being drained or overloaded, you need to manage how they are made available and how they are consumed. The resources to be aware of include:

- Memory usage
- Storage input and output
- Computation
- Transaction and block size
- State database size

The Polkadot SDK provides block authors with several ways to manage access to resources and to prevent individual components of the chain from consuming too much of any single resource. Two of the most important mechanisms available to block authors are weights and transaction fees.

[Weights](TODO:update-path){target=\_blank} manage the time it takes to validate a block and characterize the time it takes to execute the calls in the block’s body. By controlling the execution time that a block can consume, weights set limits on storage input, output, and computation.

Some of the weight allowed for a block is consumed as part of the block's initialization and finalization. The weight might also be used to execute mandatory inherent extrinsic calls. To help ensure blocks don’t consume too much execution time—and prevent malicious users from overloading the system with unnecessary calls—weights are combined with transaction fees.

Transaction fees provide an economic incentive to limit execution time, computation, and the number of calls required to perform operations. Transaction fees are also used to make the blockchain economically sustainable because they are typically applied to transactions initiated by users and deducted before a transaction request is executed.

## How Fees are Calculated

The final fee for a transaction is calculated using the following parameters:

- `base fee` - this is the minimum amount a user pays for a transaction. It is declared a base weight in the runtime and converted to a fee using the [`WeightToFee`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/weights/src/lib.rs#L172){target=\_blank} conversion
- `weight fee` - a fee proportional to the execution time (input and output and computation) that a transaction consumes
- `length fee` - a fee proportional to the encoded length of the transaction
- `tip` - an optional tip to increase the transaction’s priority, giving it a higher chance to be included in the transaction queue

The base fee and proportional weight and length fees constitute the inclusion fee. The inclusion fee is the minimum fee that must be available for a transaction to be included in a block.

## Using the Transaction Payment Pallet

The [Transaction Payment pallet](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/transaction-payment){target=\_blank} provides the basic logic for calculating the inclusion fee. You can also use the Transaction Payment pallet to:

- Convert a weight value into a deductible fee based on a currency type using [`Config::WeightToFee`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/transaction-payment/src/lib.rs#L357){target=\_blank}
- Update the fee for the next block by defining a multiplier based on the chain’s final state at the end of the previous block using [`Config::FeeMultiplierUpdate`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/transaction-payment/src/lib.rs#L364){target=\_blank}
- Manage the withdrawal, refund, and deposit of transaction fees using [`Config::OnChargeTransaction`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/transaction-payment/src/lib.rs#L353){target=\_blank}

You can learn more about these configuration traits in the [Transaction Payment documentation](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment/index.html){target=\_blank}.

You should note that transaction fees are withdrawn before the transaction is executed. After the transaction is executed, the weight can be adjusted to reflect the actual resources used. If a transaction uses fewer resources than expected, the transaction fee is corrected, and the adjusted transaction fee is deposited.

### Understanding the Inclusion Fee

The formula for calculating the inclusion fee is as follows:

`inclusion_fee = base_fee + length_fee + [targeted_fee_adjustment * weight_fee]`

And then, for calculating the final fee:

`final_fee = inclusion_fee + tip`

In the first formula, the `targeted_fee_adjustment` is a multiplier that can tune the final fee based on the network’s congestion.

- The `base_fee` derived from the base weight covers inclusion overhead like signature verification
- The `length_fee` is a per-byte fee that is multiplied by the length of the encoded extrinsic
- The `weight_fee` fee is calculated using two parameters:
  - The `ExtrinsicBaseWeight` that is declared in the runtime and applies to all extrinsics
  - The `#[pallet::weight]` annotation that accounts for an extrinsic's complexity

To convert the weight to Currency, the runtime must define a `WeightToFee` struct that implements a conversion function, [`Convert<Weight,Balance>`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/transaction-payment/src/lib.rs#L664){target=\_blank}.

Note that the extrinsic sender is charged the inclusion fee before the extrinsic is invoked. The fee is deducted from the sender's balance even if the transaction fails upon execution.

### Accounts with an Insufficient Balance

If an account does not have a sufficient balance to pay the inclusion fee and remain alive—that is, enough to pay the inclusion fee and maintain the minimum existential deposit—then you should ensure the transaction is canceled so that no fee is deducted and the transaction does not begin execution.

The Polkadot SDK doesn't enforce this rollback behavior. However, this scenario would be rare because the transaction queue and block-making logic perform checks to prevent it before adding an extrinsic to a block.

### Fee Multipliers

The inclusion fee formula always results in the same fee for the same input. However, weight can be dynamic and—based on how [WeightToFee](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/transaction-payment/src/lib.rs#L357){target=\_blank} is defined—the final fee can include some degree of variability.
The Transaction Payment pallet provides the [FeeMultiplierUpdate](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/transaction-payment/src/lib.rs#L364){target=\_blank} configurable parameter to account for this variability.

The Polkadot network inspires the default update function and implements a targeted adjustment in which a target saturation level of block weight is defined. If the previous block is more saturated, the fees increase slightly. Similarly, if the last block has fewer transactions than the target, fees are decreased by a small amount. For more information about fee multiplier adjustments, see the [Web3 Research Page](https://research.web3.foundation/Polkadot/overview/token-economics#relay-chain-transaction-fees-and-per-block-transaction-limits){target=\_blank}.

## Transactions with Special Requirements

Inclusion fees must be computable before execution and can only represent fixed logic. Some transactions warrant limiting resources with other strategies. For example:

- Bonds are a type of fee that might be returned or slashed after some on-chain event. For example, you might want to require users to place a bond to participate in a vote. The bond might then be returned at the end of the referendum or slashed if the voter attempted malicious behavior.
- Deposits are fees that might be returned later. For example, you might require users to pay a deposit to execute an operation that uses storage. The user’s deposit could be returned if a subsequent operation frees up storage.
- Burn operations are used to pay for a transaction based on its internal logic. For example, a transaction might burn funds from the sender if the transaction creates new storage items to pay for the increased the state size.
- Limits enable you to enforce constant or configurable limits on specific operations. For example, the default [Staking pallet](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/staking){target=\_blank} only allows nominators to nominate 16 validators to limit the complexity of the validator election process.

It is important to note that if you query the chain for a transaction fee, it only returns the inclusion fee.

## Default Weight Annotations





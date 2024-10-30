---
title: Pause Validating
description: Learn how to temporarily pause staking activity in Polkadot using the chill extrinsic, with guidance for validators and nominators.
---

# Pause Validating

## Introduction

If you need to temporarily stop participating in Polkadot staking activities without fully unbonding your funds, chilling your account allows you to do so efficiently. Chilling removes your node from active validation or nomination in the next era while keeping your funds bonded, making it ideal for planned downtimes or temporary pauses. This guide covers the steps for chilling as a validator or nominator, using the `chill` and `chillOther` extrinsics, and how these affect your staking status and nominations.

## Chilling Your Node

If you need to temporarily step back from staking without unbonding your funds, you can "chill" your account. Chilling pauses your active staking participation, setting your account to inactive in the next era while keeping your funds bonded.

To chill your account, go to the **Network > Staking > Account Actions** page on [Polkadot.js Apps](https://polkadot.js.org/apps){target=\_blank}, and select **Stop**. Alternatively, you can call the [`chill`](https://paritytech.github.io/polkadot-sdk/master/pallet_staking/enum.Call.html#variant.chill){target=\_blank} extrinsic in the `staking` pallet. 

<!--TODO: I don't think we have this image. I can't find it if we do. If we need or want it, we need a new screenshot-->
![staking](/images/infrastructure/operational-tasks/staking-keys-stash-proxy.webp)

## Consideration for Staking Election

A bond that is actively participating in staking but chilled would continue to participate in
staking for the rest of the current era. If the bond was chilled in sessions 1 through 4 and
continues to be chilled for the rest of the era, it would *not* be selected for election in the next
era. If a bond was chilled for the entire session 5, it would not be considered in the next
election. If the bond was chilled in session 6, its participation in the next era's election would
depend on its state in session 5.

## Chilling as a Nominator

When you chill after being a nominator, your nominations will be reset. This means that when you
decide to start nominating again you will need to select validators to nominate once again. These
can be the same validators if you prefer, or, a completely new set. Just be aware - your nominations
won't persist across chills.

Your nominator will remain bonded when it is chilled. When you are ready to nominate again, you will
not need to go through the whole process of bonding again, rather, you will issue a new nominate
call that specifies the new validators to nominate.

## Chilling as a Validator

When you voluntarily chill after being a validator, your nominators will remain. As long as your
nominators make no action, you will still have the nominations when you choose to become an active
validator once again. You bond however would not be listed as a nominable validator thus any
nominators issuing new or revisions to existing nominations would not be able to select your bond.

When you become an active validator, you will also need to reset your validator preferences
(commission, etc.). These can be configured as the same values set previously or something
different.

## Chill Other

An unbounded and unlimited number of nominators and validators in [Polkadot's NPoS](https://wiki.polkadot.network/docs/learn-phragmen){target=_blank} isn't possible due to constraints in the runtime. As a result, multiple checks are incorporated to keep the size of staking system manageable, like mandating minimum active bond requirements for both nominators and validators. When these requirements are modified through on-chain governance, they can be enforced only on the accounts that newly call `nominate` or `validate` after the update. The changes to the bonding parameters would not automatically chill the active accounts on-chain which don't meet the requirements.

!!!note "Chill Threshold"
    `ChillThreshold` defines how close to the max nominators or validators that must be reached before users can start chilling one another.

For instance, consider a scenario where the minimum staking requirement for nominators is
changed from 80 DOTs to 120 DOTs. An account that was actively nominating with 80 DOTs before this
update would still keep receiving staking rewards. To handle this corner case, the `chillOther`
extrinsic was incorporated which also helps to keep things backwards compatible and safe. The
`chillOther` extrinsic is permissionless and any third party user can target it on an account where
the minimum active bond isn't satisfied, and chill that account. The list of addresses of all the
active validators and their nominators can be viewed by running [validator stats](https://github.com/w3f/validator-stats){target=_blank} script.

!!!info "Chill Other on Polkadot Network"
    Through [Referendum 90](https://polkadot.polkassembly.io/referendum/90){target=_blank}, `maxNominatorCount` on Polkadot is set to `None` eliminating the upper bound on the number of nominators on the network. Due to this, the `chillOther` extrinsic on Polkadot network has no effect as the chill threshold will never be met.
---
title: Stop Validating
description: Instructions on how to stop validating, unbonding your tokens, purging validator keys, and chilling your Polkadot validator.
---

If you wish to remain a validator or nominator (for example, you're only stopping for planned downtime or server maintenance), submitting the `chill` extrinsic in the `staking` pallet should suffice. It is
only if you wish to unbond funds or reap an account that you should continue with the following.

To ensure a smooth stop to validation, make sure you should do the following actions:

- Chill your validator
- Purge validator session keys
- Unbond your tokens

These can all be done with [Polkadot.js](https://polkadot.js.org/apps){target=_blank} interface or with extrinsics.

<!-- TODO: add links later -->

## Chill Validator

To chill your validator or nominator, call the `staking.chill()` extrinsic. See the [How to Chill](todo:link) page for more information. You can also claim your rewards at this time.

## Purge Validator Session Keys

Purging validator session keys removes the key reference. This can be done through the
`session.purgeKeys()` extrinsic. The key reference exists on the account that originally called the
`session.set_keys()` extrinsic, which could be the stash or the staking proxy (at the time the keys
were set).

!!!warning "Purge keys using the same account that set the keys"
    Make sure to call the session.purge_keys() extrinsic from the same account that set the keys in the
    first place in order for the correct reference to be removed. Calling the `session.purge_keys()`
    from the wrong account, although it may succeed, will result in a reference on the other account
    that _cannot_ be removed, and as a result that account cannot be reaped.

!!!warning
    **If you skip this step, you won't be able to reap your stash account**, and you will also need
    to rebond, purge the session keys, unbond, and wait the unbonding period again before being able to
    transfer your tokens.

    See [Unbonding and Rebonding on the Polkadot Wiki](https://wiki.polkadot.network/docs/learn-guides-nominator#bond-your-tokens{target=_blank}) for more details.


## Unbond your Tokens

Unbonding your tokens can be done through the `Network > Staking > Account actions` page in
PolkadotJS Apps by clicking the corresponding stash account dropdown and selecting **Unbond Funds**.
This can also be done through the `staking.unbond()` extrinsic with the staking proxy account.
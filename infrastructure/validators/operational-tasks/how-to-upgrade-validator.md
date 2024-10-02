---
title: Upgrade Your Node
description: Instructions on how to upgrade your validator node.
---

Validators perform critical functions for the network by [backing and including blocks](https://wiki.polkadot.network/docs/learn-parachains-protocol){target=\_blank}. Validators may have to go offline for short-periods of time to upgrade client software or to upgrade the host machine.

Usually, standard client upgrades will only require you to stop the service, replace the binary and
restart the service. This operation can be executed within a session.

Validators may also need to perform long-lead maintenance tasks that will span more than one
session. Under these circumstances, an active validator may chill their stash and be removed from
the active validator set. Alternatively, the validator may substitute the active validator server
with another allowing the former to undergo maintenance activities.

This guide will provide an option for validators to seamlessly substitute an active validator server
to allow for maintenance operations.

The process can take several hours, so make sure you understand the instructions first and plan
accordingly.

!!!tip "Keep an eye out on new releases from the community"
    Upgrade or downgrade accordingly.


## Key Components

### Session Keys

Session keys are stored in the client and used to sign validator operations. They are what link your
validator node to your staking proxy. If you change them within a session you will have to wait for
the current session to finish and a further two sessions to elapse before they are applied.

[More info about keys in Polkadot.](https://wiki.polkadot.network/docs/learn-cryptography#keys){target=\_blank}

### Keystore

Each validator server contains essential private keys in a folder called the _keystore_. These keys
are used by a validator to sign transactions at the network level. If two or more validators sign
certain transactions using the same keys, it can lead to an [equivocation slash.](https://wiki.polkadot.network/docs/learn-offenses){target=\_blank}

For this reason, it is advised that validators don't clone or copy the `_keystore_` folder and
instead generate session keys for each new validator instance.

Default keystore path - `/home/polkadot/.local/share/polkadot/chains/<chain>/keystore`

## Steps

The following steps require a second validator which will be referred to as `Validator B`. The
original server that is in the active set will be referred to as `Validator A`.

### Session `N`

1. Start a second node. Once it is synced, use the `--validator` flag. This is now "Validator B"
2. Generate Session keys for **Validator B**
3. Submit a `set_key` extrinsic from your staking proxy with the session key generated from
   **Validator B**
4. Take note of the Session that this extrinsic was executed in
5. Allow the current session to elapse and then wait for two full sessions

**It is imperative that you keep Validator A running during this time.** `set_key` doesn't have an
immediate effect and requires two full sessions to elapse before it does. If you do switch off
Validator A too early you may risk being chilled and face a fault within the Thousand Validator
Programme.

### Session `N+3`

**Validator B** is now acting as your validator - you can safely perform operations on **Validator
A**.

When you are ready to restore **Validator A**:

1. Start **Validator A**, sync the database and ensure that it is operating with the `--validator`
   flag
2. Generate new Session keys for **Validator A**
3. Submit a `set_key` extrinsic from your staking proxy with the session key generated from
   **Validator A**
4. Take note of the Session that this extrinsic was executed in

**Again, it is imperative that Validator B is kept running until the current session finishes and
two further full sessions have elapsed.**

Once this time has elapsed, **Validator A** will take over. You can safely stop Validator B.

!!! note
    To verify that the Session has changed, make sure that a block in the new Session is
finalized. You should see log messages like the ones below to confirm the change:

```
2019-10-28 21:44:13 Applying authority set change scheduled at block #450092
2019-10-28 21:44:13 Applying GRANDPA set change to new set with 20 authorities
```
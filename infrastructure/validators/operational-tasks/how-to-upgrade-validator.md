---
title: Upgrade a Validator Node
description: Learn how to upgrade your Polkadot validator node, manage session keys, and perform seamless server maintenance without disrupting network validation.
---

# Upgrade a Validator Node

## Introduction

Validators perform critical functions for the network by [backing and including blocks](https://wiki.polkadot.network/docs/learn-parachains-protocol){target=\_blank}. Validators may have to go offline for short-periods of time to upgrade client software or to upgrade the host machine. Usually, standard client upgrades will only require you to stop the service, replace the binary and restart the service. This operation can be executed within a session.

Validators may also need to perform long-lead maintenance tasks that will span more than one session. Under these circumstances, an active validator may chill their stash and be removed from the active validator set. Alternatively, the validator may substitute the active validator server with another allowing the former to undergo maintenance activities.

This guide will provide an option for validators to seamlessly substitute an active validator server to allow for maintenance operations. The process can take several hours, so make sure you understand the instructions first and plan accordingly.

!!!tip 
    Keep an eye out for new releases from the community and upgrade or downgrade accordingly.

## Prerequisites

Before continuing with this guide, ensure you have:

<!--TODO: what should I have already read/done/installed before I go on? -->

- A fully working validator setup, including all necessary binaries in accordance to [How to Validate](todo:add-link)
- The capacity on your VPS to start a secondary validator for the upgrade process

## Key Components

### Session Keys

Session keys are stored in the client and used to sign validator operations. They are what link your
validator node to your staking proxy. If you change them within a session you will have to wait for
the current session to finish and a further two sessions to elapse before they are applied.

Visit the [Keys section](https://wiki.polkadot.network/docs/learn-cryptography#keys){target=\_blank} of the Polkadot Wiki to learn more about the types of keys and their usage in the Polkadot network.

### Keystore

Each validator server contains essential private keys in a folder called the `keystore`. These keys are used by a validator to sign transactions at the network level. If two or more validators sign certain transactions using the same
keys, it can lead to an [equivocation slash](https://wiki.polkadot.network/docs/learn-offenses){target=\_blank}.

For this reason, it is advised that validators don't clone or copy the `keystore` folder and instead generate session keys for each new validator instance.

Default keystore path:

```bash
/home/polkadot/.local/share/polkadot/chains/<chain>/keystore
```

## Steps

The following steps require a second validator which will be referred to as `Validator B`. The original server that is in the active set will be referred to as `Validator A`.

### Session `N`

1. Start a second node. Once it is synced, use the `--validator` flag. This is now `Validator B`
2. Generate session keys for `Validator B`
3. Submit a `set_key` extrinsic from your staking proxy with the session key generated from
   `Validator B`
4. Take note of the session that this extrinsic was executed in
5. Allow the current session to elapse and then wait for two full sessions

!!! warning

      It is imperative you keep `Validator A` running during this time. `set_key` doesn't have an immediate effect and requires two full sessions to elapse before it does. If you switch off `Validator A` too early you may risk being chilled and face a fault within the Thousand Validator Programme.

### Session `N+3`

`Validator B` is now acting as your validator and you can safely perform operations on `Validator A`.

When you are ready to restore `Validator A`:

1. Start `Validator A`, sync the database and ensure that it is operating with the `--validator`
   flag
2. Generate new session keys for `Validator A`
3. Submit a `set_key` extrinsic from your staking proxy with the session key generated from
   `Validator A`
4. Take note of the session that this extrinsic was executed in

Again, it is imperative that `Validator B` is kept running until the current session finishes and two further full sessions have elapsed.

Once this time has elapsed, `Validator A` will take over. To verify that the session has changed, make sure that a block in the new session is finalized. You can then safely stop `Validator B`. You should see log messages like the ones below to confirm the change:

--8<-- 'code/infrastructure/validators/operational-tasks/how-to-upgrade-validator/terminal/verify-session-change.md'

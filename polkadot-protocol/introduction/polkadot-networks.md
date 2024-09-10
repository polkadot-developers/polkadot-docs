---
title: Development Networks
description: This section contains the list of networks and resources available for developers in the Polkadot ecosystem for testing purposes. 
hide: 
- feedback
template: subsection-index-page.html
---

# Polkadot Development Networks

The development and testing networks and resources presented here are intended for Polkadot core developers, Parachain developers, 
application developers as well as the end users.

![Polkadot Development infographic](/images/polkadot-protocol/introduction/development-networks.png)

Polkadot Core Developers typically test upgrades on a local development node. Then they are deployed and tested on [Westend](#westend). 
After rigorous testing on Westend, the upgrades make their way to Kusama and eventually on to Polkadot.

Parachain developers use local testnets powered by tools like [Zombienet](#zombienet) and then deploy the upgrades on their respective
parachains on either [Rococo](#rococo) or [Paseo](#paseo) networks.

Application developers and end users of Polkadot ecosystem can test many features without risking or spending their tokens on production 
networks by using tools like [Chopsticks](#chopsticks).

## Kusama Network

Kusama is the experimental development network for teams who want to innovate, move fast and test their applications on a
production grade environment with economics and game theory involved. It comprises of a relay chain with its own governance, system chains 
and parachains.

Native token: KSM

## Test Networks

The tokens for the test networks listed below are available through [faucet.polkadot.io](https://faucet.polkadot.io/){target=\_blank} 

### Westend

A perma-testnet (that is not reset back to genesis block) intended for Polkadot core developers and maintained by Parity Technologies. 
Primarily used to test features that are to be deployed onto Kusama and then to Polkadot. 

Native token: WND

### Paseo

A community-run testnet which mirrors the Polkadot runtime that is intended for parachain developers. It is maintained by the members of 
Polkadot community.

Native token: PAS

### Rococo

Soon to be deprecated testnet intended for parachain developers. It is maintained by Parity Technologies.

Native token: ROC

## Local Test Networks

### Zombienet

[Zombienet](https://github.com/paritytech/zombienet){target=\_blank} is a testing framework for Polkadot SDK based blockchains, allowing 
users to spawn and test ephemeral networks. 

### Chopsticks

[Acala Chopsticks](https://github.com/AcalaNetwork/chopsticks){target=\_blank} lets you create a fork of any Polkadot SDK based blockchain 
and interact with it. This tool can also be used for testing cross chain applications.

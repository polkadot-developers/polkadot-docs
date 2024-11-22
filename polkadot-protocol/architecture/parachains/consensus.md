---
title: Parachain Consensus
description: Understand how the blocks authored by parachain collators are secured by the relay chain validators and how the parachain transactions achieve finality
--- 

Parachains are sovereign blockchains built using the Polkadot SDK. Parachains have their own nodes, known as collators, which are responsible for collating, or sequencing end-user transactions. This is very simillar to the role of sequencers in Ethereum. 

Collators are also tasked with maintaining the current state of the parachain. This aspect is central to Polkadot’s data sharding strategy, where each parachain manages its own state. By doing so, the load on relay chain validators is significantly reduced, as they do not need to store or track the state of every parachain.
For a deep dive into Parachain's protocol, refer to the [Wiki](https://wiki.polkadot.network/docs/learn-parachains-protocol#parachain-protocol){target=\_blank} and for implementation details, refer to the [Polkadot parachain host implementer guide](https://paritytech.github.io/polkadot-sdk/book/protocol-overview.html){target=\_blank}.
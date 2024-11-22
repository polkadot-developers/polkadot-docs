---
title: Networks
description: Explore the Polkadot ecosystem networks and learn the unique purposes of each, tailored for blockchain innovation, testing, and enterprise-grade solutions.
template: root-subdirectory-page.html
---

# Networks

## Introduction

The Polkadot ecosystem consists of multiple networks designed to support different stages of blockchain development, from main networks to test networks. Each network serves a unique purpose, providing developers with flexible environments for building, testing, and deploying blockchain applications.

This section includes essential network information such as RPC endpoints, currency symbols and decimals, and how to acquire TestNet tokens for the Polkadot ecosystem of networks.

## Production Networks

### Polkadot

Polkadot is the primary production blockchain network for high-stakes, enterprise-grade applications. Polkadot MainNet has been running since May 2020 and has implementations in various programming languages ranging from Rust to JavaScript.

=== "Network Details"

    **Currency symbol** - `DOT`

    ---
    
    **Currency decimals** - 10

    ---

    **Block explorer** - [Polkadot Subscan](https://polkadot.subscan.io/){target=\_blank}

=== "RPC Endpoints"
    Blockops
    ```
    wss://polkadot-public-rpc.blockops.network/ws
    ```
    ---
    Dwellir
    ```
    wss://polkadot-rpc.dwellir.com
    ```
    ---
    Dwellir Tunisia
    ```
    wss://polkadot-rpc-tn.dwellir.com
    ```
    ---
    IBP1
    ```
    wss://rpc.ibp.network/polkadot
    ```
    ---
    IBP2
    ```
    wss://polkadot.dotters.network
    ```
    ---
    LuckyFriday
    ```
    wss://rpc-polkadot.luckyfriday.io
    ```
    ---
    OnFinality
    ```
    wss://polkadot.api.onfinality.io/public-ws
    ```
    ---
    RadiumBlock
    ```
    wss://polkadot.public.curie.radiumblock.co/ws
    ```
    ---
    RockX
    ```
    wss://rockx-dot.w3node.com/polka-public-dot/ws
    ```
    ---
    Stakeworld
    ```
    wss://dot-rpc.stakeworld.io
    ```
    ---
    SubQuery
    ```
    wss://polkadot.rpc.subquery.network/public/ws
    ```
    ---
    Light client
    ```
    light://substrate-connect/polkadot
    ```

### Kusama

Kusama is a network built as a risk-taking, fast-moving "canary in the coal mine" for its cousin Polkadot. As it is built on top of the same infrastructure, Kusama often acts as a final testing ground for new features before they are launched on Polkadot. Unlike true TestNets, however, the Kusama KSM native token does have economic value. This incentive encourages paricipants to maintain this robust and performant structure for the benefit of the community.

=== "Network Details"

    **Currency symbol** - `KSM`

    ---

    **Currency decimals** - 12

    ---
    
    **Block explorer** - [Kusama Subscan](https://kusama.subscan.io/){target=\_blank}

=== "RPC Endpoints"
    Dwellir
    ```
    wss://kusama-rpc.dwellir.com
    ```
    ---
    Dwellir Tunisia
    ```
    wss://kusama-rpc-tn.dwellir.com
    ```
    ---
    IBP1
    ```
    wss://rpc.ibp.network/kusama
    ```
    ---
    IBP2
    ```
    wss://kusama.dotters.network
    ```
    ---
    LuckyFriday
    ```
    wss://rpc-kusama.luckyfriday.io
    ```
    ---
    OnFinality
    ```
    wss://kusama.api.onfinality.io/public-ws
    ```
    ---
    RadiumBlock
    ```
    wss://kusama.public.curie.radiumblock.co/ws
    ```
    ---
    RockX
    ```
    wss://rockx-ksm.w3node.com/polka-public-ksm/ws
    ```
    ---
    Stakeworld
    ```
    wss://rockx-ksm.w3node.com/polka-public-ksm/ws
    ```
    ---
    Light client
    ```
    light://substrate-connect/kusama
    ```

## Test Networks

### Westend

Westend is the primary test network that mirrors Polkadot's functionality for protocol-level feature development. As a true TestNet, the WND native token intentionally does not have any economic value. Use the faucet information in the following section to obtain WND tokens.

=== "Network Information"

    **Currency symbol** - `WND`

    ---

    **Currency decimals** - 12

    ---
    
    **Block explorer** - [Westend Subscan](https://westend.subscan.io/){target=\_blank}

    ---

    **Faucet** - [Official Westend faucet](https://faucet.polkadot.io/westend){target=\_blank}


=== "RPC Endpoints"
    Dwellir
    ```
    wss://westend-rpc.dwellir.com
    ```
    ---
    Dwellir Tunisia
    ```
    wss://westend-rpc-tn.dwellir.com
    ```
    ---
    IBP1
    ```
    wss://rpc.ibp.network/westend
    ```
    ---
    IBP2
    ```
    wss://westend.dotters.network
    ```
    ---
    OnFinality
    ```
    wss://westend.api.onfinality.io/public-ws
    ```
    ---
    Parity
    ```
    wss://westend-rpc.polkadot.io
    ```
    ---
    Light client
    ```
    light://substrate-connect/westend
    ```

### Paseo

Paseo is a decentralised, community run, stable testnet for parachain and dapp developers to build and test their applications. Unlike Westend, Paseo is not intended for protocol-level testing. As a true TestNet, the PAS native token intentionally does not have any economic value. Use the faucet information in the following section to obtain PAS tokens.

=== "Network Information"
    **RPC URL**
    ```
    wss://paseo.rpc.amforc.com
    ```

    ---

    **Currency symbol** - `PAS`

    ---

    **Currency decimals** - 10

    ---
    
    **Block explorer** - [Paseo Subscan](https://paseo.subscan.io/){target=\_blank}

    ---

    **Faucet** - [Official Paseo faucet](https://faucet.polkadot.io/){target=\_blank}

=== "RPC Endpoints"
    Amforc
    ```
    wss://paseo.rpc.amforc.com
    ```
    ---
    Dwellir
    ```
    wss://paseo-rpc.dwellir.com
    ```
    ---
    IBP1
    ```
    wss://rpc.ibp.network/paseo
    ```
    ---
    IBP2
    ```
    wss://paseo.dotters.network
    ```
    ---
    StakeWorld
    ```
    wss://pas-rpc.stakeworld.io
    ```

## Additional Resources

- [**Polkadot Fellowship runtimes repository**](https://github.com/polkadot-fellows/runtimes){target=\_blank} - find a collection of runtimes for Polkadot, Kusama, and their system-parachains as maintained by the community via the [Polkadot Technical Fellowship](https://wiki.polkadot.network/docs/learn-polkadot-technical-fellowship){target=\_blank}

---
title: Ethereum-Native Precompiles
description: General overview of Ethereum-native precompiles in Polkadot Hub’s Revive pallet, including usage basics and details on standard precompiles for smart contracts.
categories: Smart Contracts
url: https://docs.polkadot.com/smart-contracts/precompiles/eth-native/
---

# Ethereum-Native Precompiles

## Introduction

Ethereum-native precompiles are special contract implementations that provide essential cryptographic and utility functions at the runtime level. These precompiles are available at predefined addresses and offer optimized, native implementations of commonly used operations that would be computationally expensive or impractical to implement in pure contract code.

In Polkadot Hub's Revive pallet, these precompiles maintain compatibility with standard Ethereum addresses, allowing developers familiar with Ethereum to seamlessly transition their smart contracts while benefiting from the performance optimizations of the PolkaVM runtime.

## How to Use Precompiles

To use a precompile in your smart contract, simply call the precompile's address as you would any other contract. Each precompile has a specific address (shown in the table below) and expects input data in a particular format. The precompile executes natively at the runtime level and returns the result directly to your contract.

For example, to use the ECRecover precompile to verify a signature, you would call address `0x0000000000000000000000000000000000000001` with the properly formatted signature data. The precompile handles the complex cryptographic operations efficiently and returns the recovered public key.

You can find sample contracts for each precompile in the [`precompiles-hardhat`](https://github.com/polkadot-developers/polkavm-hardhat-examples/tree/master/precompiles-hardhat/contracts){target=\_blank} project.

## Standard Precompiles in Polkadot Hub

Revive implements the standard set of Ethereum precompiles:

|                                                                                   Contract Name                                                                                   | Address (Last Byte) |                                           Description                                           |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------: | :---------------------------------------------------------------------------------------------: |
|  [ECRecover](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/ecrecover.rs){target=\_blank}   |        0x01         |                       Recovers the public key associated with a signature                       |
|     [Sha256](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/sha256.rs){target=\_blank}      |        0x02         |                              Implements the SHA-256 hash function                               |
|  [Ripemd160](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/ripemd160.rs){target=\_blank}   |        0x03         |                             Implements the RIPEMD-160 hash function                             |
|   [Identity](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/identity.rs){target=\_blank}    |        0x04         |                          Data copy function (returns input as output)                           |
|     [Modexp](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/modexp.rs){target=\_blank}      |        0x05         |                                     Modular exponentiation                                      |
|   [Bn128Add](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/bn128.rs#L27){target=\_blank}   |        0x06         |    Addition on the [alt_bn128 curve](https://eips.ethereum.org/EIPS/eip-196){target=\_blank}    |
|   [Bn128Mul](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/bn128.rs#L48){target=\_blank}   |        0x07         | Multiplication on the [alt_bn128 curve](https://eips.ethereum.org/EIPS/eip-196){target=\_blank} |
| [Bn128Pairing](https://github.com/paritytech/polkadot-sdk/blob/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/bn128.rs#L69){target=\_blank} |        0x08         |                              Pairing check on the alt_bn128 curve                               |
|    [Blake2F](https://github.com/paritytech/polkadot-sdk/tree/polkadot-stable2503/substrate/frame/revive/src/pure_precompiles/blake2f.rs){target=\_blank}     |        0x09         |                                  Blake2 compression function F                                  |

## Conclusion

Ethereum-native precompiles provide a powerful foundation for smart contract development on Polkadot Hub, offering high-performance implementations of essential cryptographic and utility functions. By maintaining compatibility with standard Ethereum precompile addresses and interfaces, Revive ensures that developers can leverage existing knowledge and tools while benefiting from the enhanced performance of native execution.

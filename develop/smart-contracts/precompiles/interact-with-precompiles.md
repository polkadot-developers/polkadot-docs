---
title: Interact with Precompiles
description: Learn how to interact with Polkadot Hub’s precompiles from Solidity to access native, low-level functions like hashing, pairing, EC ops, etc.
---

# Interact with Precompiles

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

Precompiles offer Polkadot Hub developers access to high-performance native functions directly from their smart contracts. Each precompile has a specific address and accepts a particular input data format. When called correctly, they execute optimized, native implementations of commonly used functions much more efficiently than equivalent contract-based implementations.

This guide demonstrates how to interact with each standard precompile available in Polkadot Hub through Solidity smart contracts.

## Basic Precompile Interaction Pattern

All precompiles follow a similar interaction pattern:

```solidity
// Generic pattern for calling precompiles
function callPrecompile(address precompileAddress, bytes memory input)
    internal
    returns (bool success, bytes memory result)
{
    // Direct low-level call to the precompile address
    (success, result) = precompileAddress.call(input);

    // Ensure the call was successful
    require(success, "Precompile call failed");

    return (success, result);
}
```

Feel free to check the [`precompiles-hardhat`](https://github.com/polkadot-developers/polkavm-hardhat-examples/tree/v0.0.3/precompiles-hardhat){target=\_blank} repository to check all the precompiles examples. The repository contains a set of example contracts and test files demonstrating how to interact with each precompile in Polkadot Hub.

Now, you'll explore how to use each precompile available in Polkadot Hub.

## ECRecover (0x01)

ECRecover recovers an Ethereum address associated with the public key used to sign a message.

```solidity title="ECRecover.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/ECRecover.sol"
```

To interact with the ECRecover precompile, you can deploy the `ECRecoverExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment. The `callECRecover` function takes a 128-byte input combining the message `hash`, `v`, `r`, and `s` signature values. Check this [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/ECRecover.js){target=\_blank} that shows how to format this input and verify that the recovered address matches the expected result.

## SHA-256 (0x02)

The SHA-256 precompile computes the SHA-256 hash of the input data.

```solidity title="SHA256.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/SHA256.sol"
```

To use it, you can deploy the `SHA256Example` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call callH256 with arbitrary bytes. Check out this [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/SHA256.js){target=\_blank} shows how to pass a UTF-8 string, hash it using the precompile, and compare it with the expected hash from Node.js's [crypto](https://www.npmjs.com/package/crypto-js){target=\_blank} module.

## RIPEMD-160 (0x03)

The RIPEMD-160 precompile computes the RIPEMD-160 hash of the input data.

```solidity title="RIPEMD160.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/RIPEMD160.sol"
```

To use it, you can deploy the `RIPEMD160Example` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `calculateRIPEMD160` with arbitrary bytes. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/RIPEMD160.js){target=\_blank} shows how to hash a UTF-8 string, pad the 20-byte result to 32 bytes, and verify it against the expected output.

## Identity (Data Copy) (0x04)

The Identity precompile simply returns the input data as output. While seemingly trivial, it can be useful for testing and certain specialized scenarios.

```solidity title="Identity.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/Identity.sol"
```

To use it, you can deploy the `IdentityExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `callIdentity` with arbitrary bytes. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/Identity.js){target=\_blank} shows how to pass input data and verify that the precompile returns it unchanged.

## Modular Exponentiation (0x05)

The ModExp precompile performs modular exponentiation, which is an operation commonly needed in cryptographic algorithms.

```solidity title="ModExp.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/ModExp.sol"
```

To use it, you can deploy the `ModExpExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `modularExponentiation` with encoded `base`, `exponent`, and `modulus` bytes. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/ModExp.js){target=\_blank} shows how to test modular exponentiation like (4 ** 13) % 497 = 445.

## BN128 Addition (0x06)

The BN128Add precompile performs addition on the alt_bn128 elliptic curve, which is essential for zk-SNARK operations.

```solidity title="BN128Add.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/BN128Add.sol"
```

To use it, you can deploy the `BN128AddExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `callBN128Add` with valid `alt_bn128` points. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/BN128Add.js){target=\_blank} demonstrates a valid curve addition and checks the result against known expected values.

## BN128 Scalar Multiplication (0x07)

The BN128Mul precompile performs scalar multiplication on the alt_bn128 curve.

```solidity title="BN128Mul.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/BN128Mul.sol"
```

To use it, deploy `BN128MulExample` in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `bn128ScalarMul` with a valid point and scalar. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/BN128Mul.js){target=\_blank} shows how to test the operation and verify the expected scalar multiplication result on `alt_bn128`.

## BN128 Pairing Check (0x08)

The BN128Pairing precompile verifies a pairing equation on the alt_bn128 curve, which is critical for zk-SNARK verification.

```solidity title="BN128Pairing.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/BN128Pairing.sol"
```

You can deploy `BN128PairingExample` in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or your preferred environment. Check out this [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/BN128Pairing.js){target=\_blank} contains these tests with working examples.

## Blake2F (0x09)

The Blake2F precompile performs the Blake2 compression function F, which is the core of the Blake2 hash function.

```solidity title="Blake2F.sol"
--8<-- "https://raw.githubusercontent.com/polkadot-developers/polkavm-hardhat-examples/refs/tags/v0.0.4/precompiles-hardhat/contracts/Blake2Example.sol"
```

To use it, deploy `Blake2FExample` in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `callBlake2F` with the properly formatted input parameters for rounds, state vector, message block, offset counters, and final block flag. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/Blake2.js){target=\_blank} demonstrates how to perform Blake2 compression with different rounds and verify the correctness of the output against known test vectors.

## Conclusion

Precompiles in Polkadot Hub provide efficient, native implementations of cryptographic functions and other commonly used operations. By understanding how to interact with these precompiles from your Solidity contracts, you can build more efficient and feature-rich applications on the Polkadot ecosystem.

The examples provided in this guide demonstrate the basic patterns for interacting with each precompile. Developers can adapt these patterns to their specific use cases, leveraging the performance benefits of native implementations while maintaining the flexibility of smart contract development.
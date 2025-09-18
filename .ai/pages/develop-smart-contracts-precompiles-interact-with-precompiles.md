---
title: Interact with Precompiles
description: Learn how to interact with Polkadot Hub’s precompiles from Solidity to access native, low-level functions like hashing, pairing, EC ops, etc.
categories: Smart Contracts
url: https://docs.polkadot.com/develop/smart-contracts/precompiles/interact-with-precompiles/
---

# Interact with Precompiles

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

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
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ECRecoverExample {
    event ECRecovered(bytes result);

    // Address of the ECRecover precompile
    address constant EC_RECOVER_ADDRESS = address(0x01);
    bytes public result;

    function callECRecover(bytes calldata input) public {
        bool success;
        bytes memory resultInMemory;

        (success, resultInMemory) = EC_RECOVER_ADDRESS.call{value: 0}(input);

        if (success) {
            emit ECRecovered(resultInMemory);
        }

        result = resultInMemory;
    }

    function getRecoveredAddress() public view returns (address) {
        require(result.length == 32, "Invalid result length");
        return address(uint160(uint256(bytes32(result))));
    }
}
```

To interact with the ECRecover precompile, you can deploy the `ECRecoverExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment. The `callECRecover` function takes a 128-byte input combining the message `hash`, `v`, `r`, and `s` signature values. Check this [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/ECRecover.js){target=\_blank} that shows how to format this input and verify that the recovered address matches the expected result.

## SHA-256 (0x02)

The SHA-256 precompile computes the SHA-256 hash of the input data.

```solidity title="SHA256.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SHA256Example {
    event SHA256Called(bytes result);

    // Address of the SHA256 precompile
    address constant SHA256_PRECOMPILE = address(0x02);

    bytes public result;

    function callH256(bytes calldata input) public {
        bool success;
        bytes memory resultInMemory;

        (success, resultInMemory) = SHA256_PRECOMPILE.call{value: 0}(input);

        if (success) {
            emit SHA256Called(resultInMemory);
        }

        result = resultInMemory;
    }
}
```

To use it, you can deploy the `SHA256Example` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call callH256 with arbitrary bytes. Check out this [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/SHA256.js){target=\_blank} shows how to pass a UTF-8 string, hash it using the precompile, and compare it with the expected hash from Node.js's [crypto](https://www.npmjs.com/package/crypto-js){target=\_blank} module.

## RIPEMD-160 (0x03)

The RIPEMD-160 precompile computes the RIPEMD-160 hash of the input data.

```solidity title="RIPEMD160.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RIPEMD160Example {
    // RIPEMD-160 precompile address
    address constant RIPEMD160_PRECOMPILE = address(0x03);

    bytes32 public result;

    event RIPEMD160Called(bytes32 result);

    function calculateRIPEMD160(bytes calldata input) public returns (bytes32) {
        (bool success, bytes memory returnData) = RIPEMD160_PRECOMPILE.call(
            input
        );
        require(success, "RIPEMD-160 precompile call failed");
        // return full 32 bytes, no assembly extraction
        bytes32 fullHash;
        assembly {
            fullHash := mload(add(returnData, 32))
        }
        result = fullHash;
        emit RIPEMD160Called(fullHash);
        return fullHash;
    }
}
```

To use it, you can deploy the `RIPEMD160Example` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `calculateRIPEMD160` with arbitrary bytes. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/RIPEMD160.js){target=\_blank} shows how to hash a UTF-8 string, pad the 20-byte result to 32 bytes, and verify it against the expected output.

## Identity (Data Copy) (0x04)

The Identity precompile simply returns the input data as output. While seemingly trivial, it can be useful for testing and certain specialized scenarios.

```solidity title="Identity.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityExample {
    event IdentityCalled(bytes result);

    // Address of the Identity precompile
    address constant IDENTITY_PRECOMPILE = address(0x04);

    bytes public result;

    function callIdentity(bytes calldata input) public {
        bool success;
        bytes memory resultInMemory;

        (success, resultInMemory) = IDENTITY_PRECOMPILE.call(input);

        if (success) {
            emit IdentityCalled(resultInMemory);
        }

        result = resultInMemory;
    }
}
```

To use it, you can deploy the `IdentityExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `callIdentity` with arbitrary bytes. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/Identity.js){target=\_blank} shows how to pass input data and verify that the precompile returns it unchanged.

## Modular Exponentiation (0x05)

The ModExp precompile performs modular exponentiation, which is an operation commonly needed in cryptographic algorithms.

```solidity title="ModExp.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ModExpExample {
    address constant MODEXP_ADDRESS = address(0x05);

    function modularExponentiation(
        bytes memory base,
        bytes memory exponent,
        bytes memory modulus
    ) public view returns (bytes memory) {
        bytes memory input = abi.encodePacked(
            toBytes32(base.length),
            toBytes32(exponent.length),
            toBytes32(modulus.length),
            base,
            exponent,
            modulus
        );

        (bool success, bytes memory result) = MODEXP_ADDRESS.staticcall(input);
        require(success, "ModExp precompile call failed");

        return result;
    }

    function toBytes32(uint256 value) internal pure returns (bytes32) {
        return bytes32(value);
    }
}
```

To use it, you can deploy the `ModExpExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `modularExponentiation` with encoded `base`, `exponent`, and `modulus` bytes. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/ModExp.js){target=\_blank} shows how to test modular exponentiation like (4 ** 13) % 497 = 445.

## BN128 Addition (0x06)

The BN128Add precompile performs addition on the alt_bn128 elliptic curve, which is essential for zk-SNARK operations.

```solidity title="BN128Add.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BN128AddExample {
    address constant BN128_ADD_PRECOMPILE = address(0x06);

    event BN128Added(uint256 x3, uint256 y3);

    uint256 public resultX;
    uint256 public resultY;

    function callBN128Add(uint256 x1, uint256 y1, uint256 x2, uint256 y2) public {
        bytes memory input = abi.encodePacked(
            bytes32(x1), bytes32(y1), bytes32(x2), bytes32(y2)
        );

        bool success;
        bytes memory output;

        (success, output) = BN128_ADD_PRECOMPILE.call{value: 0}(input);

        require(success, "BN128Add precompile call failed");
        require(output.length == 64, "Invalid output length");

        (uint256 x3, uint256 y3) = abi.decode(output, (uint256, uint256));

        resultX = x3;
        resultY = y3;

        emit BN128Added(x3, y3);
    }
}
```

To use it, you can deploy the `BN128AddExample` contract in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `callBN128Add` with valid `alt_bn128` points. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/BN128Add.js){target=\_blank} demonstrates a valid curve addition and checks the result against known expected values.

## BN128 Scalar Multiplication (0x07)

The BN128Mul precompile performs scalar multiplication on the alt_bn128 curve.

```solidity title="BN128Mul.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BN128MulExample {
    // Precompile address for BN128Mul
    address constant BN128_MUL_ADDRESS = address(0x07);

    bytes public result;

    // Performs scalar multiplication of a point on the alt_bn128 curve
    function bn128ScalarMul(uint256 x1, uint256 y1, uint256 scalar) public {
        // Format: [x, y, scalar] - each 32 bytes
        bytes memory input = abi.encodePacked(
            bytes32(x1),
            bytes32(y1),
            bytes32(scalar)
        );

        (bool success, bytes memory resultInMemory) = BN128_MUL_ADDRESS.call{
            value: 0
        }(input);
        require(success, "BN128Mul precompile call failed");

        result = resultInMemory;
    }

    // Helper to decode result from `result` storage
    function getResult() public view returns (uint256 x2, uint256 y2) {
        bytes memory tempResult = result;
        require(tempResult.length >= 64, "Invalid result length");
        assembly {
            x2 := mload(add(tempResult, 32))
            y2 := mload(add(tempResult, 64))
        }
    }
}
```

To use it, deploy `BN128MulExample` in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `bn128ScalarMul` with a valid point and scalar. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/BN128Mul.js){target=\_blank} shows how to test the operation and verify the expected scalar multiplication result on `alt_bn128`.

## BN128 Pairing Check (0x08)

The BN128Pairing precompile verifies a pairing equation on the alt_bn128 curve, which is critical for zk-SNARK verification.

```solidity title="BN128Pairing.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BN128PairingExample {
    // Precompile address for BN128Pairing
    address constant BN128_PAIRING_ADDRESS = address(0x08);

    bytes public result;

    // Performs a pairing check on the alt_bn128 curve
    function bn128Pairing(bytes memory input) public {
        // Call the precompile
        (bool success, bytes memory resultInMemory) = BN128_PAIRING_ADDRESS
            .call{value: 0}(input);
        require(success, "BN128Pairing precompile call failed");

        result = resultInMemory;
    }

    // Helper function to decode the result from `result` storage
    function getResult() public view returns (bool isValid) {
        bytes memory tempResult = result;
        require(tempResult.length == 32, "Invalid result length");

        uint256 output;
        assembly {
            output := mload(add(tempResult, 32))
        }

        isValid = (output == 1);
    }
}
```

You can deploy `BN128PairingExample` in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or your preferred environment. Check out this [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/BN128Pairing.js){target=\_blank} contains these tests with working examples.

## Blake2F (0x09)

The Blake2F precompile performs the Blake2 compression function F, which is the core of the Blake2 hash function.

```solidity title="Blake2F.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blake2FExample {
    // Precompile address for Blake2F
    address constant BLAKE2F_ADDRESS = address(0x09);

    bytes public result;

    function blake2F(bytes memory input) public {
        // Input must be exactly 213 bytes
        require(input.length == 213, "Invalid input length - must be 213 bytes");

        // Call the precompile
        (bool success, bytes memory resultInMemory) = BLAKE2F_ADDRESS.call{
            value: 0
        }(input);
        require(success, "Blake2F precompile call failed");

        result = resultInMemory;
    }

    // Helper function to decode the result from `result` storage
    function getResult() public view returns (bytes32[8] memory output) {
        bytes memory tempResult = result;
        require(tempResult.length == 64, "Invalid result length");

        for (uint i = 0; i < 8; i++) {
            assembly {
                mstore(add(output, mul(32, i)), mload(add(add(tempResult, 32), mul(32, i))))
            }
        }
    }


    // Helper function to create Blake2F input from parameters
    function createBlake2FInput(
        uint32 rounds,
        bytes32[8] memory h,
        bytes32[16] memory m,
        bytes8[2] memory t,
        bool f
    ) public pure returns (bytes memory) {
        // Start with rounds (4 bytes, big-endian)
        bytes memory input = abi.encodePacked(rounds);

        // Add state vector h (8 * 32 = 256 bytes)
        for (uint i = 0; i < 8; i++) {
            input = abi.encodePacked(input, h[i]);
        }

        // Add message block m (16 * 32 = 512 bytes, but we need to convert to 16 * 8 = 128 bytes)
        // Blake2F expects 64-bit words in little-endian format
        for (uint i = 0; i < 16; i++) {
            // Take only the first 8 bytes of each bytes32 and reverse for little-endian
            bytes8 word = bytes8(m[i]);
            input = abi.encodePacked(input, word);
        }

        // Add offset counters t (2 * 8 = 16 bytes)
        input = abi.encodePacked(input, t[0], t[1]);

        // Add final block flag (1 byte)
        input = abi.encodePacked(input, f ? bytes1(0x01) : bytes1(0x00));

        return input;
    }

    // Simplified function that works with raw hex input
    function blake2FFromHex(string memory hexInput) public {
        bytes memory input = hexStringToBytes(hexInput);
        blake2F(input);
    }

    // Helper function to convert hex string to bytes
    function hexStringToBytes(string memory hexString) public pure returns (bytes memory) {
        bytes memory hexBytes = bytes(hexString);
        require(hexBytes.length % 2 == 0, "Invalid hex string length");
        
        bytes memory result = new bytes(hexBytes.length / 2);
        
        for (uint i = 0; i < hexBytes.length / 2; i++) {
            result[i] = bytes1(
                (hexCharToByte(hexBytes[2 * i]) << 4) | 
                hexCharToByte(hexBytes[2 * i + 1])
            );
        }
        
        return result;
    }

    function hexCharToByte(bytes1 char) internal pure returns (uint8) {
        uint8 c = uint8(char);
        if (c >= 48 && c <= 57) return c - 48;      // 0-9
        if (c >= 65 && c <= 70) return c - 55;      // A-F
        if (c >= 97 && c <= 102) return c - 87;     // a-f
        revert("Invalid hex character");
    }
}
```

To use it, deploy `Blake2FExample` in [Remix](/develop/smart-contracts/dev-environments/remix){target=\_blank} or any Solidity-compatible environment and call `callBlake2F` with the properly formatted input parameters for rounds, state vector, message block, offset counters, and final block flag. This [test file](https://github.com/polkadot-developers/polkavm-hardhat-examples/blob/v0.0.3/precompiles-hardhat/test/Blake2.js){target=\_blank} demonstrates how to perform Blake2 compression with different rounds and verify the correctness of the output against known test vectors.

## Conclusion

Precompiles in Polkadot Hub provide efficient, native implementations of cryptographic functions and other commonly used operations. By understanding how to interact with these precompiles from your Solidity contracts, you can build more efficient and feature-rich applications on the Polkadot ecosystem.

The examples provided in this guide demonstrate the basic patterns for interacting with each precompile. Developers can adapt these patterns to their specific use cases, leveraging the performance benefits of native implementations while maintaining the flexibility of smart contract development.

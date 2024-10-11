---
title: Address Formats
description: Overview of Polkadot address formats, covering different encoding strategies and best practices for secure and efficient usage.
---

# Address Formats

The SS58 address format is a key component of the Polkadot SDK, enabling unique and secure account identification across Polkadot SDK-based chains. SS58 is a modified version of Bitcoin's Base58Check format, designed to offer flexibility in how accounts are represented on various chains within the Polkadot ecosystem. This format allows encoding different address types, integrating network-specific identifiers, and providing checksum validation for added security.

While other formats can be used, SS58 provides a base-58-encoded value that uniquely identifies an account on any Polkadot SDK chain.

This article explores the structure of SS58 addresses, the encoding process, and the tools available for validating and managing these addresses.

## Basic Format

You can find the implementation for the SS58 address format in [Ss58Codec](https://paritytech.github.io/polkadot-sdk/master/sp_core/crypto/trait.Ss58Codec.html){target=\_blank}.

The basic format of the address can be described as:

```text
base58encode(concat(<address-type>, <address>, <checksum>))
```

The address is the concatenated byte series consisting of an address type, the encoded address, and a checksum passed into a Base58 encoder.

The Base58 [encode](https://docs.rs/bs58/latest/bs58/fn.encode.html){target=\_blank} function is implemented exactly as defined in Bitcoin and IPFS specifications, using the same alphabet as both implementations.

The Base58 alphabet eliminates characters that might look ambiguous when printed, for example:

- Non-alphanumerical characters (+ and /)
- Zero (0)
- Capital i (I)
- Capital o (O)
- Lower-case L (l)

## Address Type

The address type in the SS58 address format consists of one or more bytes that specify the exact format of the address bytes that follow it.

Currently, the valid values are:

- `00000000b..=00111111b` (0 to 63 inclusive)

    Simple account/address/network identifier. The byte can be interpreted directly as such an identifier.

- `01000000b..=01111111b` (64 to 127 inclusive)

    Full address/address/network identifier. The lower 6 bits of this byte represent the upper 6 bits of a 14-bit identifier, while the next byte defines the lower 8 bits. This allows for identifiers ranging from 0 to 16,383 (2²¹).

- `10000000b..=11111111b` (128 to 255 inclusive)

    This section is reserved for future address format extensions. The address type 42 is designed to be valid across all Polkadot SDK networks that support fixed-length addresses. However, for production networks, using a network-specific version may be preferable to prevent key reuse between networks and mitigate associated issues.

    By default, Polkadot SDK nodes display keys using address type 42, but Polkadot SDK-based chains in the Polkadot ecosystem with different node implementations might use a different default address type.

## Address Length in bytes

There are 16 different address formats, each identified by the total payload length in bytes, which includes the checksum.

| Total | Type | Raw account | Checksum |
|-------|------|-------------|----------|
| 3     | 1    | 1           | 1        |
| 4     | 1    | 2           | 1        |
| 5     | 1    | 2           | 2        |
| 6     | 1    | 4           | 1        |
| 7     | 1    | 4           | 2        |
| 8     | 1    | 4           | 3        |
| 9     | 1    | 4           | 4        |
| 10    | 1    | 8           | 1        |
| 11    | 1    | 8           | 2        |
| 12    | 1    | 8           | 3        |
| 13    | 1    | 8           | 4        |
| 14    | 1    | 8           | 5        |
| 15    | 1    | 8           | 6        |
| 16    | 1    | 8           | 7        |
| 17    | 1    | 8           | 8        |
| 35    | 1    | 32          | 2        |

## Checksum Types

Polkadot SDK offers several potential checksum strategies, each providing varying length and longevity guarantees.

There are two types of checksum preimages (`SS58` and `AccountID`) and a range of checksum lengths from 1 to 8 bytes.

For Polkadot SDK, the Blake2b-512 hash function is used in all cases. The variants simply select the preimage used as the input to the hash function and the number of bytes taken from its output. The bytes used are always the leftmost bytes. The input consists of the non-checksum portion of the SS58 byte series, which is used as input to the Base58 function.

For example, this input is formed by concatenating the `concat(<address-type>, <address>)`. A context prefix of `0x53533538505245` (the string "SS58PRE") is then prepended to this input to create the final hashing preimage.

The advantage of using additional checksum bytes lies in the increased protection they offer against input errors and index alterations. However, this comes at the expense of expanding the textual address by a few extra characters. This increase is negligible in the account ID format, which is why no 1-byte alternative is provided. For shorter account index formats, the extra byte constitutes a significantly larger portion of the final address.

Therefore, it is left to higher levels of the stack (rather than the end-user) to determine the best trade-off based on their specific needs.

## Address Types and Network Registry

The [SS58 registry](https://github.com/paritytech/ss58-registry){target=\_blank} is the canonical listing of all address type identifiers and how they map to Polkadot SDK-based networks.

## Encoding Address and Network Identifiers

Identifiers up to 64 can be represented using a simple address format, where the least significant byte of the network identifier is encoded as the first byte of the address.

For identifiers ranging from `64` to `16,383`, the full address format must be utilized. The full address encoding requires special handling because SCALE encoding as little endian requires the first two bits to be used for the `01` prefix.

To encode the network identifier, the full address format treats the first two bytes as a 16-bit sequence and disregards the first two bits of that sequence to account for the `01` prefix. The remaining 14 bits encode the network identifier value as a little endian, assuming that the two missing higher-order bits are zero. This effectively spreads the low-order byte across the boundary between the two bytes.

For example, the 14-bit identifier `0b00HHHHHH_MMLLLLLL` is expressed in two bytes as:

```text
0b01LLLLLL
0bHHHHHHMM
```

!!! note
    Identifiers of `16384` and beyond aren't currently supported.

## Validating Addresses

You can verify that a value is a valid SS58 address using the subkey command-line interface or the Polkadot.js API.

### Using Subkey

[Subkey](https://paritytech.github.io/polkadot-sdk/master/subkey/index.html){target=\_blank} is a key generation and management utility that is included in the Polkadot SDK repository.

The `inspect` command gets a public key and an SS58 address from the provided secret URI. The basic syntax for the `subkey inspect` command is:

```bash
subkey inspect [flags] [options] uri
```

For the `uri` command-line argument, you can specify the secret seed phrase, a hex-encoded private key, or an SS58 address. If the input is a valid address, the `subkey` program displays the corresponding hex-encoded public key, account identifier, and SS58 addresses.

For example, to inspect the public keys derived from a secret seed phrase, you can run a command similar to the following:

```bash
subkey inspect "caution juice atom organ advance problem want pledge someone senior holiday very"
```

The command displays output similar to the following:

--8<-- 'code/polkadot-protocol/protocol-components/accounts/address-formats/address-formats-1.html'

The `subkey` program assumes an address is based on a public/private key pair. If you inspect an address, the command returns the 32-byte account identifier.

However, not all addresses in Polkadot SDK-based networks are based on keys.

Depending on the command-line options you specify and the input you provided, the command output might also display the network for which the address has been encoded. For example:

```bash
subkey inspect "12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1iZU"
```

The command displays output similar to the following:

--8<-- 'code/polkadot-protocol/protocol-components/accounts/address-formats/address-formats-2.html'

### Using Polkadot.js API

To verify an address in JavaScript or TypeScript projects, you can use the functions built into the [Polkadot.js API](https://polkadot.js.org/docs/){target=\_blank}. For example:

```js
--8<-- 'code/polkadot-protocol/protocol-components/accounts/address-formats/address-formats-3.js'
```

If the function returns `true`, the address you specified is a valid address.

### Other SS58 Implementations

Support for encoding and decoding Polkadot SDK SS58 addresses has been implemented in several other languages and libraries.

- Crystal - [`wyhaines/base58.cr`](https://github.com/wyhaines/base58.cr){target=\_blank}
- Go - [`itering/subscan-plugin`](https://github.com/itering/subscan-plugin){target=\_blank}
- Python - [`polkascan/py-scale-codec`](https://github.com/polkascan/py-scale-codec){target=\_blank}
- TypeScript - [`subsquid/squid-sdk`](https://github.com/subsquid/squid-sdk){target=\_blank}

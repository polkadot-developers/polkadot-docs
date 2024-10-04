---
title: Cryptography
description: A concise guide to cryptography in blockchain, covering hash functions, encryption types, digital signatures, and elliptic curve applications.
---

# Cryptography

## Introduction

Cryptography forms the backbone of blockchain technology, providing the mathematical verifiability crucial for consensus systems, data integrity, and user security. While a deep understanding of the underlying mathematical processes isn't necessary for most blockchain developers, grasping the fundamental applications of cryptography is essential. This page comprehensively overviews various cryptographic implementations used across Polkadot SDK-based chains and the broader blockchain ecosystem.

## Hash Functions

Hash functions are fundamental to blockchain technology, creating a unique digital fingerprint for any piece of data including simple text, images, or any other form of file. They map input data of any size to a fixed-size output (typically 32 bytes) using complex mathematical operations. Hashing is used for verifying data integrity, creating digital signatures, and providing a secure way to store passwords. This form of mapping is known as the 'pigeonhole principle', and it is primarily implemented to efficiently and verifiably identify data from large sets.

### Key Properties of Hash Functions

- **Deterministic** - the same input always produces the same output
- **Quick computation** - it's easy to calculate the hash value for any given input
- **Pre-image resistance** - it's infeasible to generate the input data from its hash
- **Small changes in input yield large changes in output** - known as the avalanche effect
- **Collision resistance** - it's extremely difficult to find two different inputs with the same hash

### Blake2

The Polkadot SDK utilizes Blake2, a state-of-the-art hashing method that offers:

- Equal or greater security compared to SHA-2
- Significantly faster performance than other algorithms

These properties make Blake2 ideal for blockchain systems, reducing sync times for new nodes and lowering the resources required for validation.

!!! note
    For a detailed technical specification of Blake2, refer to the [official Blake2 paper](https://www.blake2.net/blake2.pdf){target=\_blank}.

## Types of Cryptography

There are two different ways that cryptographic algorithms are implemented: symmetric cryptography, and asymmetric cryptography.

### Symmetric cryptography

Symmetric encryption is a branch of cryptography that is not based on one-way functions, unlike asymmetric cryptography. It uses the same cryptographic key for both the encryption of plain text and the decryption of the resulting ciphertext.

Symmetric Cryptography is the type of encryption that has been used throughout history, such as the Enigma Cipher and the Caesar Cipher. It is still widely used today, and can be found in web2 and web3 applications alike. There is only one single key, and requires a recipient to also have access to it in order to access the contained information.

#### Advantages

- Fast and efficient for large amounts of data
- Requires less computational power

#### Disadvantages

- Key distribution can be challenging
- Scalability issues in systems with many users

### Asymmetric Cryptography

Asymmetric encryption is a type of cryptography which uses two different keys, known as a keypair: a public key, used to encrypt plain text, and a private counterpart, used to decrypt the cipher text.

The public key is used to encrypt a fixed length message that can only be decrypted with the recipient's private key and, at times, a set password. The public key can be used to cryptographically verify that the corresponding private key was used to create a piece of data without compromising the private key itself, such as with digital signatures. This has obvious implications for identity, ownership and properties, and is used in many different protocols across both web2 and web3.

#### Advantages

- Solves the key distribution problem
- Enables digital signatures and secure key exchange

#### Disadvantages

- Slower than symmetric encryption
- Requires more computational resources

### Trade-offs and Compromises

Symmetric cryptography is faster and requires fewer bits in the key to achieve the same level of security that asymmetric cryptography provides. However, it requires a shared secret before communication can take place, which poses issues to it's integrity and a potential compromise point. Asymmetric cryptography, on the other hand, does not require the secret to be shared ahead of time, allowing for far better end-user security.

Hybrid symmetric and asymmetric cryptography is often used to overcome the engineering issues of asymmetric cryptography, as it is slower and requires more bits in the key to achieve the same level of security. It is used to encrypt a key, and then use the comparatively lightweight symmetric cipher to do the 'heavy lifting' with the message.

## Digital Signatures

Digital signatures are a way of verifying the authenticity of a document or message using asymmetric keypairs. They are used to ensure that a sender or signer's document or message has not been tampered with in transit, and for recipients to verify said data is accurate and from the expected sender.

Signing digital signatures only requires a low level understanding of mathematics and cryptography. For a conceptual example -- when signing a check, it is expected that the check cannot be cashed multiple times. This is not a feature of the signature system, but rather the check serialization system. The bank will check that the serial number on the check has not already been used. Digital signatures essentially combines these two concepts, allowing the signature itself to provide the serialization via a unique cryptographic fingerprint that cannot be reproduced.

Unlike with a pen and paper signatures, knowledge of the digital signature cannot be used to create other signatures. Digital signatures are often used in bureaucratic processes, as they are more secure than simply scanning in a signature and pasting it onto a document.

Polkadot SDK provides multiple different cryptographic schemes and is generic such that it can support anything which implements the [`Pair` trait](https://paritytech.github.io/polkadot-sdk/master/sp_core/crypto/trait.Pair.html){target=\_blank}.

### Example of Creating a Digital Signature

1. The sender creates a hash of the message
2. The hash is encrypted using the sender's private key, creating the signature
3. The message and signature are sent to the recipient
4. The recipient decrypts the signature using the sender's public key
5. The recipient hashes the received message and compares it to the decrypted hash

If the hashes match, the signature is valid, confirming the message's integrity and the sender's identity

## Elliptic Curve

Blockchain technology requires the ability to have multiple keys creating a signature for block proposal and validation. To this end, Elliptic Curve Digital Signature Algorithm (ECDSA) and Schnorr signatures are two of the most commonly used methods. While ECDSA are a far simpler implementation, Schnorr signatures are more efficient when it comes to multi-signatures.

Schnorr signatures bring some noticeable features over the ECDSA/EdDSA schemes:

- It is better for hierarchical deterministic key derivations
- It allows for native multi-signature through [signature aggregation](https://bitcoincore.org/en/2017/03/23/schnorr-signature-aggregation/){target=\_blank}
- It is generally more resistant to misuse

One sacrifice that is made when using Schnorr signatures over ECDSA is that both require 64 bytes, but only ECDSA signatures communicate their public key.

### Various Implementations

- [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm){target=\_blank} - Polkadot SDK provides an ECDSA signature scheme using the [secp256k1](https://en.bitcoin.it/wiki/Secp256k1){target=\_blank} curve. This is the same cryptographic algorithm used to secure [Bitcoin](https://en.wikipedia.org/wiki/Bitcoin){target=\_blank} and [Ethereum](https://en.wikipedia.org/wiki/Ethereum){target=\_blank}

- [Ed25519](https://en.wikipedia.org/wiki/EdDSA#Ed25519){target=\_blank} - is an EdDSA signature scheme using [Curve25519](https://en.wikipedia.org/wiki/Curve25519){target=\_blank}. It is carefully engineered at several levels of design and implementation to achieve very high speeds without compromising security

- [SR25519](https://research.web3.foundation/Polkadot/security/keys/accounts-more){target=\_blank} - is based on the same underlying curve as Ed25519. However, it uses Schnorr signatures instead of the EdDSA scheme
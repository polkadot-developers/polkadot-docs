---
title: Keys
description: Overview of the Product SDK keys package — derive application-scoped keys, session signers, and product-account addresses without touching the user's seed phrase.
categories: Apps
---

# Keys

## Introduction

[`@parity/product-sdk-keys`](https://paritytech.github.io/product-sdk/api/keys/) derives application-scoped keys and accounts without ever touching the user's seed phrase. From a one-time user signature it can derive symmetric keys and keypairs your Product owns; it can generate and persist a session signer; and it can compute the address of a Host-derived product account from a public key alone.

Reach for it when your Product needs its own keys — for encrypting local data, deriving an app-scoped account, or maintaining a burner signer that survives reloads — rather than the user's primary wallet accounts.

## When to Use It

- To derive app-private encryption or signing keys deterministically from a one-time user signature (`KeyManager.fromSignature`), so the app scopes its own keys without asking for a mnemonic.
- To keep a persistent session or burner signer that survives reloads by storing its mnemonic in a local store (`SessionKeyManager`).
- To compute the public address of a Host-derived product account off-device, from a parent public key (`deriveProductAccountPublicKey`).
- Not for signing real transactions with the user's wallet accounts; use the [Signer](/apps/product-sdk/signer/) package for that. This package manages app-derived and session keys.

## Core Concepts

- **`KeyManager`**: Holds a master key in memory and derives child keys with HKDF. Create it with `KeyManager.fromSignature(signature, signerAddress)` or `KeyManager.fromRawKey(masterKey)`. It persists nothing; persistence is the consumer's responsibility.
- **Derivation methods**: `deriveSymmetricKey(context)` returns a 32-byte key; `deriveAccount(context)` returns an sr25519 account; `deriveKeypairs()` returns encryption and signing keypairs. The same context always yields the same key, and different contexts are uncorrelated.
- **`SessionKeyManager`**: Storage-backed. It generates a mnemonic, persists it in a `LocalKvStore`, and derives an account. `create`, `get`, `getOrCreate`, and `clear` manage its lifecycle.
- **`DerivedAccount`**: The account shape returned throughout: `publicKey`, `ss58Address`, `h160Address`, and a ready-to-use `signer`.
- **`deriveProductAccountPublicKey`**: Computes a product account's public key from a parent public key and a Product identifier, matching the derivation the Host performs privately, so an external client derives the same address.

## Keep a Persistent Session Key

Back a session signer with the local store so it survives reloads:

```typescript
import { SessionKeyManager } from '@parity/product-sdk-keys';
import { createLocalKvStore } from '@parity/product-sdk-local-storage';

const store = await createLocalKvStore();
const sessionKeys = new SessionKeyManager({ store });

const session = await sessionKeys.getOrCreate();
console.log(session.account.ss58Address);
```

## Derive App-Scoped Keys From a Signature

Turn a one-time user signature into keys the app owns, scoped by context:

```typescript
import { KeyManager } from '@parity/product-sdk-keys';

const keys = KeyManager.fromSignature(signatureBytes, signerAddress);

const docKey = keys.deriveSymmetricKey('doc:123'); // 32-byte symmetric key
const docAccount = keys.deriveAccount('doc-account:123'); // sr25519 account
const { encryption, signing } = keys.deriveKeypairs();
```

## Limitations

- `KeyManager` holds the master key in memory and persists nothing; use `exportKey` and `fromRawKey` to manage persistence yourself.
- `fromSignature` requires at least 32 bytes of signature material, and `fromRawKey` requires exactly 32 bytes; both throw otherwise.
- A session key's mnemonic is stored in plaintext in the key-value store; it is the only thing persisted.
- Invalid mnemonics throw; validate input before deriving.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Signer**

    ---

    For signing with the user's wallet accounts and deriving Host product accounts.

    [:octicons-arrow-right-24: Signer](/apps/product-sdk/signer/)

-   <span class="badge learn">Learn</span> **Local Storage**

    ---

    The store the session-key manager persists its mnemonic to.

    [:octicons-arrow-right-24: Local Storage](/apps/product-sdk/local-storage/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `keys` surface: `KeyManager`, `SessionKeyManager`, and derivation helpers.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/keys/)

</div>

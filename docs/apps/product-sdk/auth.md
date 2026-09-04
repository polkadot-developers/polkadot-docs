---
title: Auth
description: Overview of the Product SDK auth package — the runtime-agnostic sign-in, session-signing, and resource-allocation flow behind a Polkadot product CLI.
categories: Apps
---

# Auth

## Introduction

[`@parity/product-sdk-auth`](https://paritytech.github.io/product-sdk/api/auth/) is the sign-in flow for a Polkadot product CLI, with no interface attached. It wraps QR pairing, session discovery, session signing, resource allocation, and sign-out behind one object, `AuthClient`, and leaves every rendering decision to you.

It sits one level above [Terminal](/apps/product-sdk/terminal/): where that package gives you an adapter and the primitives, this one composes them into the login, logout, and allowance steps a CLI actually performs, parameterized by an `AuthConfig` so the same code serves any product. Terminal-rendering helpers live behind a separate `./ui` entry point, so a headless consumer never pulls them in.

!!! note "Not for Products"
    Like [Terminal](/apps/product-sdk/terminal/), this is CLI infrastructure. A Product runs inside a Host that already owns pairing and signing, so it uses [Signer](/apps/product-sdk/signer/) instead.

## When to Use It

- To build the login and logout flows of a command-line tool that signs as the user's Polkadot App account.
- To resolve a signer from mixed sources — a paired phone session, a dev `--suri`, or a named dev account — behind one call (`resolveSigner`).
- To request the resource allowances a fresh session needs before it can sign anything (`requestResourceAllocation`).
- When you want the flow without the terminal rendering: import from the package root and supply your own interface.
- Not inside a Product, and not when [Terminal](/apps/product-sdk/terminal/)'s lower-level primitives are all you need.

## Core Concepts

- **`createAuthClient(config)`**: Builds a client bound to one product's `AuthConfig`. Every adapter, derivation, and storage path reads from that config, which is what makes the package product-agnostic.
- **`AuthConfig`**: Four fields. `dappId` scopes the on-disk session namespace (`~/.polkadot-apps/{dappId}_*`) and the pairing, so each product gets an independently revocable session; `productId` and `derivationIndex` derive the product account; `peopleEndpoints` are the RPC endpoints the adapter connects to.
- **`connect()` returns one of two shapes**: `{ kind: 'existing' }` when a session is already on disk, or `{ kind: 'qr', qrCode, login }` when the user has to scan. Print the QR _before_ mounting any interface, then await `waitForLogin(handle, onStatus)`.
- **Three addresses, one key**: `SessionAddresses` carries `rootAddress` (the wallet root, the right input for `lookupUsername` in [Individuality](/apps/product-sdk/individuality/)), `productAddress` (the product account that actually signs), and `productH160` (the same product key as an EVM address). The last two are the same public key in two encodings.
- **`SessionHandle.destroy()` is mandatory**: The signer depends on a long-lived adapter whose WebSocket keeps the Node event loop alive. Not calling `destroy()` means your CLI hangs on exit.
- **Allocation before signing**: A freshly paired session cannot sign until the user grants resource allowances. `requestAllocation` requests `DEFAULT_RESOURCES` through the client's own `productId`, and `summarizeOutcomes` sorts the results into `granted`, `rejected`, and `unavailable` buckets by pairing each outcome with the resource at the same index.

## Log In and Sign

Build the client, branch on whether a session already exists, then get a signer:

```typescript
import { createAuthClient } from '@parity/product-sdk-auth';

const auth = createAuthClient({
  dappId: 'my-cli',
  productId: 'my-cli.dot',
  derivationIndex: 0,
  peopleEndpoints: ['wss://paseo-people-next-system-rpc.polkadot.io'],
});

const connection = await auth.connect();

if (connection.kind === 'qr') {
  console.log(connection.qrCode); // print before any interface mounts
  await auth.waitForLogin(connection.login, (status) => {
    if (status.step === 'pending') console.log(status.stage);
  });
}

const session = await auth.getSessionSigner();
if (session) {
  try {
    console.log('signing as', session.addresses.productAddress);
    // Use session.signer with submitAndWatch, a contract .tx(), or any PAPI call.
  } finally {
    session.destroy(); // required — releases the WebSocket
  }
}
```

## Request Allowances

A fresh session needs allowances before its first signature. Request them once and report what the user actually granted:

```typescript
import { summarizeOutcomes, DEFAULT_RESOURCES } from '@parity/product-sdk-auth';

// The client binds `productId` from your AuthConfig, so it is not passed here.
const outcomes = await auth.requestAllocation(session.userSession, DEFAULT_RESOURCES);

const { granted, rejected, unavailable } = summarizeOutcomes(outcomes, DEFAULT_RESOURCES);
if (rejected.length || unavailable.length) {
  console.warn(
    'not granted:',
    [...rejected, ...unavailable].map((resource) => resource.tag).join(', '),
  );
}
```

`DEFAULT_RESOURCES` covers what a CLI product account normally needs: `BulletInAllowance`, `StatementStoreAllowance`, and `SmartContractAllowance` for derivation index `0`. `summarizeOutcomes` buckets the results into `granted`, `rejected`, and `unavailable` — it is order-sensitive, so pass the same resource array you requested. Treat anything other than granted as a capability being unavailable rather than a fatal error, so a declined grant degrades gracefully. See [Allowances and Permissions](/apps/concepts/allowances/) for what each resource authorizes.

!!! warning "These outcomes are tagged objects, not strings"
    An allocation outcome here is `{ tag: 'Allocated' | 'Rejected' | 'NotAvailable', ... }`, so compare `outcome.tag`, not `outcome`. The same concept in [`host`](/apps/product-sdk/host/) is a bare string union, and a comparison written for one silently never matches on the other.

The standalone `requestResourceAllocation(session, productId, resources?, onExisting?)` is there when you are not holding an `AuthClient`. It throws on transport failures; per-resource refusals come back as outcomes rather than exceptions.

## Resolve a Signer From Mixed Sources

A CLI usually accepts several ways to sign: the paired phone in normal use, a dev key in CI. `resolveSigner` collapses that into one call:

```typescript
import { resolveSigner, SignerNotAvailableError } from '@parity/product-sdk-auth';

let resolved;
try {
  // A `--suri` wins; otherwise the paired session is used.
  resolved = await resolveSigner(auth, { suri: process.env.DEPLOY_SURI });
} catch (error) {
  if (error instanceof SignerNotAvailableError) {
    console.error('No signer: pass --suri or log in first.');
  }
  throw error;
}

try {
  console.log(`signing as ${resolved.address} (${resolved.source})`);
  // Pass resolved.signer to submitAndWatch, a contract .tx(), or any PAPI call.
} finally {
  resolved.destroy(); // tears down the session adapter; a no-op for dev signers
}
```

`resolveSigner` takes the client first, then the options, and returns a `ResolvedSigner`: the `signer` itself plus `address`, `source` (`'dev'` or `'session'`), and a `destroy()` to call in a `finally` block. For a mobile session it also carries `userSession` and the `addresses` triple; both are absent for a dev signer. `parseDevAccountName` turns a name such as `//Alice` into the corresponding well-known dev account, for the CI path.

## Limitations

- Node only, like [Terminal](/apps/product-sdk/terminal/), and subject to the same Node 21 requirement through it.
- Failures are thrown, not returned on a `Result` channel. `resolveSigner` raises `SignerNotAvailableError`; other steps surface their own errors.
- `SessionHandle.destroy()` must be called or the process will not exit.
- `AuthConfig` has no defaults — `dappId`, `productId`, `derivationIndex`, and `peopleEndpoints` are all required, because the values are per product and per network.
- Sessions are keyed by `dappId` on disk, so two products never share a session and signing out of one leaves the other paired.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Terminal**

    ---

    The layer below: the adapter, QR rendering, and allowance signers this package composes.

    [:octicons-arrow-right-24: Terminal](/apps/product-sdk/terminal/)

-   <span class="badge learn">Learn</span> **Allowances and Permissions**

    ---

    What each resource allowance authorizes, its scope and lifetime, and how re-approval works.

    [:octicons-arrow-right-24: Allowances](/apps/concepts/allowances/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `auth` surface: `AuthClient`, session signers, allocation helpers, and the `/ui` subpath.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/auth/)

</div>

---
title: Sign and Submit Transactions
description: Derive product-scoped accounts and sign transactions from a Polkadot Product using the Product SDK, with all approvals routed to the Polkadot App.
categories: Apps
---

# Sign and Submit Transactions

## Introduction

This page is for developers building Polkadot Products that need to derive accounts and sign payloads — raw bytes or full transactions — from inside a Polkadot host container. It covers the `@parity/product-sdk-signer` package, which gives your Product a typed, host-aware signing interface.

The code examples throughout this guide are confirmed working with Polkadot Desktop v0.3.17 and `@parity/product-sdk` v0.9.0. The same patterns apply regardless of the specific chain you target — only the SS58 prefix and dotNS identifier change.

The SDK exposes a single orchestrator, `SignerManager`, that wraps both the production host path (Polkadot Desktop) and a deterministic dev path (Alice / Bob) behind the same `Result`-typed API. You call `connect()`, pick an account, and sign — the SDK handles the rest.

Each Product receives its own isolated account, derived deterministically from your identity. The account for `app-a.dot` is not linkable to the account for `app-b.dot` without explicit cross-product permission. This per-Product isolation is a core privacy property of the platform, not an implementation detail.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project with a TypeScript toolchain
- Node.js 20 or later with ESM support (`@parity/product-sdk-signer` is ESM only)
- Polkadot Desktop v0.3.17 or later to run your Product inside a host container. See [Install and Pair Polkadot Desktop](/apps/set-up/install-and-pair/)

!!! note
    To test signing without a host container, use `manager.connect("dev")`. This loads the standard Substrate dev accounts (Alice, Bob, and others) locally and does not require Polkadot Desktop. See [Test Without a Host](#test-without-a-host).

## Install the SDK

You have two installation options depending on your needs:

- **Individual package** — install only the signer. Keeps your bundle smaller and makes dependencies explicit.

    ```bash
    npm install @parity/product-sdk-signer
    ```

- **Umbrella package** — install the full SDK in one command. Convenient when your Product uses several SDK features (signing, chain client, cloud storage, etc.) and bundle size is not a concern.

    ```bash
    npm install @parity/product-sdk
    ```

All import paths shown in this guide work with both options.

## How Product Accounts Work

Every product-scoped account is identified by a `ProductAccountId` tuple:

- **`dotNsIdentifier`** — the dotNS identifier of the Product requesting the account, for example the `.dot` name your Product is loaded under.
- **`derivationIndex`** — a non-negative integer chosen by the Product. Index `0` is the conventional default; higher indices give you additional sub-accounts within the same Product.

The same `(dotNsIdentifier, derivationIndex)` pair always yields the same public key, so your Product can reproduce the same address across sessions without persisting it.

!!! note "Per-Product isolation is a privacy feature"
    `app-a.dot` and `app-b.dot` produce different addresses for the same user. This prevents passive on-chain correlation across Products. Sharing an account across Products requires explicit permission — it is never the default.

## Set Up SignerManager

Construct `SignerManager` once and hold it for the lifetime of your Product. Always set `ss58Prefix` and `dappName` explicitly. Use the `onConnect` callback to request any resources your Product needs immediately after connection — the callback fires exactly once per connect and re-fires automatically after any auto-reconnect.

```typescript
import { SignerManager } from '@parity/product-sdk-signer';

const manager = new SignerManager({
  ss58Prefix: 0,
  dappName: 'my-product',
  onConnect: async (_account, { requestResourceAllocation }) => {
    await requestResourceAllocation([{ tag: 'AutoSigning', value: undefined }]);
  },
});
```

- **`ss58Prefix`** — the SS58 address-format prefix for the target network. Use `0` for the Polkadot relay chain.
- **`dappName`** — a human-readable name for your Product, shown in Desktop UI.
- **`onConnect`** — fires once per connection transition. Use `ctx.requestResourceAllocation` to request permissions such as `AutoSigning` up front, before any signing call is made.

## Connect to the Host

Call `connect()` to establish a session with the host and discover available accounts. `connect()`, `selectAccount()`, `getProductAccount()`, and `signRaw()` all return a `Result` — always check `.ok` before accessing `.value`. (`getSigner()` returns a nullable directly, not a `Result`.)

```typescript
const connectResult = await manager.connect();
if (!connectResult.ok) {
  // HostUnavailableError when running outside Desktop
  console.error(connectResult.error.message);
  return;
}

// Auto-select the first account if none is already selected
const accounts = connectResult.value;
if (accounts.length > 0 && !manager.getState().selectedAccount) {
  const selectResult = manager.selectAccount(accounts[0].address);
  if (!selectResult.ok) {
    console.error(selectResult.error.message);
    return;
  }
}
```

`connect()` defaults to the host provider. Outside a host container it returns `HostUnavailableError` — use `connect("dev")` for local testing instead. See [Test Without a Host](#test-without-a-host).

## Get a Product Account

`getProductAccount` requests the product-scoped account for a given `dotNsIdentifier` from the host. This is a host-only API — it returns `HostUnavailableError` when the active provider is `"dev"`.

```typescript
const accountResult = await manager.getProductAccount('my-product.dot', 0);
if (!accountResult.ok) {
  console.error(accountResult.error.message);
  return;
}

const { address, publicKey } = accountResult.value;
```

The returned `SignerAccount` exposes:

- **`address`** — the SS58-encoded address for the current network.
- **`publicKey`** — the raw 32-byte public key.
- **`name`** — an optional display name, or `null`.

## Sign Arbitrary Bytes

Use `signRaw` to sign an arbitrary byte payload with the currently selected account. This is useful for off-chain authentication, message proofs, and any use case that does not require a full transaction.

`signRaw` returns a `Result<Uint8Array, SignerError>` — it never throws. Always check `.ok` before accessing `.value`.

```typescript
const selectResult = manager.selectAccount(accountResult.value.address);
if (!selectResult.ok) {
  console.error(selectResult.error.message);
  return;
}

const payload = new TextEncoder().encode('hello polkadot');
const result = await manager.signRaw(payload);

if (result.ok) {
  console.log(result.value); // Uint8Array — the raw signature
} else {
  console.error(result.error.message);
}
```

## Sign and Submit a Transaction

To sign a transaction, get a `PolkadotSigner` from `SignerManager` and pass it directly to PAPI's `signAndSubmit`. The SDK handles routing the signing request to Desktop, which renders a signing modal and forwards to the Polkadot App.

`@parity/product-sdk-signer` provides only the signer interface — chain connectivity uses polkadot-api directly. Set up your PAPI client separately:

```typescript
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { dot } from '@polkadot-api/descriptors';

const client = createClient(getWsProvider('wss://rpc.polkadot.io'));
const api = client.getTypedApi(dot);
```

The `dot` descriptor is the typed API surface for the Polkadot relay chain. Run `npx papi add dot` in your project to pull or regenerate it.

```typescript
const accountResult = await manager.getProductAccount('my-product.dot', 0);
if (!accountResult.ok) return;

const selectResult = manager.selectAccount(accountResult.value.address);
if (!selectResult.ok) return;

// getSigner() returns null if no account is selected
const signer = manager.getSigner();
if (!signer) return;

const recipient = 'INSERT_RECIPIENT_ADDRESS';
const tx = api.tx.Balances.transfer_keep_alive({
  dest: recipient,
  value: 1_000_000_000_000n,
});

const result = await tx.signAndSubmit(signer);
```

## Handle Signing Errors

Two outcomes are worth handling explicitly: the user rejects the request, or the signing session times out.

```typescript
import {
  HostRejectedError,
  TimeoutError,
} from '@parity/product-sdk-signer';

try {
  const result = await tx.signAndSubmit(signer);
} catch (error) {
  if (error instanceof HostRejectedError) {
    // The user dismissed the signing prompt on the Polkadot App
    return;
  }
  if (error instanceof TimeoutError) {
    // The signing session expired before the user responded
    return;
  }
  throw error;
}
```

- **`HostRejectedError`** — the user explicitly denied the request. Return the user to a stable state and let them retry.
- **`TimeoutError`** — the signing session expired. Treat this the same as a rejection.

!!! tip "Design for async latency"
    Signing is asynchronous because the Polkadot App runs on a separate device. Show a non-blocking pending state rather than freezing the interface, and make sure your retry path is idempotent in case the user attempts the same action twice.

## Test Without a Host

During development, use `connect("dev")` to load the standard Substrate dev accounts (Alice, Bob, Charlie, Dave, Eve, Ferdie) without needing Polkadot Desktop. The signing API is identical — only the provider changes.

```typescript
const result = await manager.connect("dev");
if (!result.ok) return;

const selectResult = manager.selectAccount(result.value[0].address);
if (!selectResult.ok) return;

const signResult = await manager.signRaw(new TextEncoder().encode('test'));
if (signResult.ok) {
  console.log(signResult.value); // Uint8Array — the raw signature
}
```

!!! warning
    `getProductAccount`, `getProductAccountAlias`, and `createRingVRFProof` are host-only APIs. They return `HostUnavailableError` when the active provider is `"dev"`.

## Limitations

- `getProductAccount`, `getProductAccountAlias`, and `createRingVRFProof` require an active host connection. They are not available in `"dev"` mode.
- The package is ESM only — your Product's build pipeline must support ESM imports.
- `SignerManager.destroy()` is terminal. After calling it, all subsequent method calls return `DestroyedError`. Use `disconnect()` for a reversible reset.
- Account persistence across page reloads requires the host to expose `localStorage`. Outside a host container, persistence silently no-ops.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Read Chain State**

    ---

    Query on-chain storage, constants, and account balances from your Polkadot Product.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/)

-   <span class="badge external">External</span> **polkadot-api Docs**

    ---

    Reference for the typed PAPI signer interface that `@parity/product-sdk-signer` exposes.

    [:octicons-arrow-right-24: Visit Site](https://papi.how){target=\_blank}

</div>

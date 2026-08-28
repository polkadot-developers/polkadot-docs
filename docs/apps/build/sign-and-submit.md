---
title: Sign and Submit Transactions
description: Derive product-scoped accounts and sign transactions from a Polkadot Product using the Product SDK, with all approvals routed to the Polkadot App.
categories: Apps
page_badges:
  tutorial_badge: Beginner
---

# Sign and Submit Transactions

## Introduction

This guide covers the `@parity/product-sdk-signer` package, which gives your Product a typed, host-aware signing interface for deriving accounts and signing payloads (raw bytes or full transactions) from inside a Polkadot host container. The SDK exposes a single orchestrator, `SignerManager`, that wraps both the production host path ([Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/)) and a deterministic dev path behind the same `Result`-typed API.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project running locally (see [Set Up Your Project](/apps/build/#set-up-your-project)) with a TypeScript toolchain
- Node.js 20 or later with ESM support (`@parity/product-sdk-signer` is ESM only)
- Polkadot Desktop to run your Product inside a host container (see [Install Desktop and Pair](/apps/get-started/))

!!! note
    To test signing without a host container, use `manager.connect('dev')`. This loads the standard Substrate dev accounts (Alice, Bob, and others) locally and does not require Polkadot Desktop. See [Test Without a Host](#test-without-a-host).

!!! note "Code examples"
    The snippets in this guide are standalone; each one illustrates one concept and can be pasted into your Product independently. They are confirmed working with Polkadot Desktop and `@parity/product-sdk` v0.9.0.

## Install the SDK

You have two installation options depending on your needs:

- **Umbrella package** (recommended starting point): Install the full SDK in one command. Convenient when your Product uses several SDK features (signing, chain client, cloud storage, and more) and bundle size is not a concern.

    ```bash
    npm install @parity/product-sdk
    ```

- **Individual package**: Install only the signer. Keeps your bundle smaller and makes dependencies explicit; switch to this later as a bundle-size optimization.

    ```bash
    npm install @parity/product-sdk-signer
    ```

All import paths shown in this guide work with both options.

## How Product Accounts Work

Every product-scoped account is identified by a `ProductAccountId` tuple:

- **`dotNsIdentifier`**: The dotNS identifier of the Product requesting the account, for example the `.dot` name your Product is loaded under.
- **`derivationIndex`**: A non-negative integer chosen by the Product. Index `0` is the conventional default; higher indices give you additional sub-accounts within the same Product.

The same `(dotNsIdentifier, derivationIndex)` pair always yields the same public key, so your Product can reproduce the same address across sessions without persisting it.

!!! note "Per-Product isolation is a privacy feature"
    `app-a.dot` and `app-b.dot` produce different addresses for the same user. This prevents passive on-chain correlation across Products. Sharing an account across Products requires explicit permission; it is never the default.

## Set Up Signer Manager

Construct `SignerManager` once and hold it for the lifetime of your Product. Always set `ss58Prefix` and `dappName` explicitly. Use the `onConnect` callback to request any resources your Product needs immediately after connection; the callback fires exactly once per connect and re-fires automatically after any auto-reconnect.

```typescript
import { SignerManager } from '@parity/product-sdk-signer';

const manager = new SignerManager({
  ss58Prefix: 0,
  dappName: 'my-product',
  onConnect: async (_account, { requestResourceAllocation, signal }) => {
    try {
      const outcomes = await requestResourceAllocation([
        { tag: 'BulletinAllowance', value: undefined },
      ]);
      if (signal.aborted) return;
      if (outcomes.some((outcome) => outcome !== 'Allocated')) {
        // Degrade gracefully: the capability is unavailable, not fatal.
      }
    } catch (cause) {
      // Typed host error; the connection itself is unaffected.
    }
  },
});
```

- **`ss58Prefix`**: The SS58 address-format prefix for the target network. Use `0` for the Polkadot relay chain.
- **`dappName`**: A human-readable name for your Product, shown in Desktop UI.
- **`onConnect`**: Fires once per connection transition. Request the resources your Product needs here, before any signing call is made.
- **`ctx.requestResourceAllocation`**: The one call in this package that **throws** instead of returning a `Result`, so wrap it in `try`/`catch`. Each outcome is `'Allocated'`, `'Rejected'`, or `'NotAvailable'`; treat anything other than allocated as the capability being unavailable.
- **`ctx.signal`**: Aborts if the user disconnects while the request is in flight. Check it before acting on the outcomes.

!!! note "`AutoSigning` is not grantable yet"
    It is the resource most worth requesting and the one you cannot depend on: both the Android and iOS wallets return `NotAvailable` for it today. Keep per-transaction signing as the real path. See [Allowances and Permissions](/apps/concepts/allowances/).

## Connect to the Host

Call `connect()` to establish a session with the host and discover available accounts. `connect()`, `selectAccount()`, `getProductAccount()`, and `signRaw()` all return a `Result`; always check `.ok` before accessing `.value`. (`getSigner()` returns a nullable directly, not a `Result`.)

Each step below is a self-contained function over the `manager` you built above, so you can paste them one at a time.

```typescript
async function connectAndSelect() {
  const connectResult = await manager.connect();
  if (!connectResult.ok) {
    // HostUnavailableError when running outside Desktop
    console.error(connectResult.error.message);
    return null;
  }

  const accounts = connectResult.value;
  if (accounts.length === 0) {
    // Connected, but the host derived no accounts for this Product.
    return null;
  }

  // Auto-select the first account if none is already selected
  if (!manager.getState().selectedAccount) {
    const selectResult = manager.selectAccount(accounts[0].address);
    if (!selectResult.ok) {
      console.error(selectResult.error.message);
      return null;
    }
  }

  return manager.getState().selectedAccount;
}
```

!!! warning "A successful connect can still yield zero accounts"
    `connect()` resolves with `ok([])` — not an error — when `dappName` is unset or the host rejects the derivation, typically because the `.dot` identifier is not registered for that user. Check the length before indexing, or `accounts[0].address` throws on a path the SDK treats as normal.

`connect()` defaults to the host provider. Outside a host container it returns `HostUnavailableError`; use `connect('dev')` for local testing instead. See [Test Without a Host](#test-without-a-host).

## Get a Product Account

`getProductAccount` requests the product-scoped account for a given `dotNsIdentifier` from the host. This is a host-only API; it returns `HostUnavailableError` when the active provider is `'dev'`.

```typescript
async function loadProductAccount() {
  const accountResult = await manager.getProductAccount('my-product.dot', 0);
  if (!accountResult.ok) {
    console.error(accountResult.error.message);
    return null;
  }

  return accountResult.value; // SignerAccount
}
```

The returned `SignerAccount` exposes:

- **`address`**: The SS58-encoded address for the current network.
- **`publicKey`**: The raw 32-byte public key.
- **`name`**: An optional display name, or `null`.

## Sign Arbitrary Bytes

Use `signRaw` to sign an arbitrary byte payload with the currently selected account. This is useful for off-chain authentication, message proofs, and any use case that does not require a full transaction.

`signRaw` returns a `Result<Uint8Array, SignerError>`; it never throws. Always check `.ok` before accessing `.value`.

```typescript
async function signMessage() {
  const account = await loadProductAccount();
  if (!account) return null;

  const selectResult = manager.selectAccount(account.address);
  if (!selectResult.ok) {
    console.error(selectResult.error.message);
    return null;
  }

  const payload = new TextEncoder().encode('hello polkadot');
  const result = await manager.signRaw(payload);

  if (!result.ok) {
    console.error(result.error.message);
    return null;
  }

  return result.value; // Uint8Array - the raw signature
}
```

## Sign and Submit a Transaction

To sign a transaction, get a `PolkadotSigner` from `SignerManager` and pass it to the `signAndSubmit` method from `polkadot-api` (PAPI). The SDK handles routing the signing request to Desktop, which renders a signing modal and forwards to the [Polkadot App](/reference/apps/hosts/polkadot-app/).

`@parity/product-sdk-signer` provides only the signer interface; chain connectivity uses `polkadot-api` directly. Set up your PAPI client separately:

```typescript
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { dot } from '@polkadot-api/descriptors';

const client = createClient(getWsProvider('wss://rpc.polkadot.io'));
const api = client.getTypedApi(dot);
```

The `dot` descriptor is the typed API surface for the Polkadot relay chain. Run `npx papi add dot` in your project to pull or regenerate it.

```typescript
async function transfer() {
  const recipient = 'INSERT_RECIPIENT_ADDRESS';

  const account = await loadProductAccount();
  if (!account) return null;

  const selectResult = manager.selectAccount(account.address);
  if (!selectResult.ok) return null;

  // getSigner() returns null if no account is selected
  const signer = manager.getSigner();
  if (!signer) return null;

  const tx = api.tx.Balances.transfer_keep_alive({
    dest: recipient,
    value: 1_000_000_000_000n,
  });

  return tx.signAndSubmit(signer);
}
```

## Handle Signing Errors

Two outcomes are worth handling explicitly: the user rejects the request, or the signing session times out.

```typescript
import {
  HostRejectedError,
  TimeoutError,
} from '@parity/product-sdk-signer';
import type { PolkadotSigner } from 'polkadot-api';

async function submitOrReport(
  tx: { signAndSubmit(signer: PolkadotSigner): Promise<unknown> },
  signer: PolkadotSigner,
) {
  try {
    return await tx.signAndSubmit(signer);
  } catch (error) {
    if (error instanceof HostRejectedError) {
      // The user dismissed the signing prompt on the Polkadot App
      return null;
    }
    if (error instanceof TimeoutError) {
      // The signing session expired before the user responded
      return null;
    }
    throw error;
  }
}
```

- **`HostRejectedError`**: The user explicitly denied the request. Return the user to a stable state and let them retry.
- **`TimeoutError`**: The signing session expired. Treat this the same as a rejection.

!!! tip "Design for async latency"
    Signing is asynchronous because the Polkadot App runs on a separate device. Show a non-blocking pending state rather than freezing the interface, and make sure your retry path is idempotent in case the user attempts the same action twice. There is no push notification when the phone is waiting, so a stalled-looking action is often an [unanswered prompt](/apps/troubleshooting/#the-app-seems-frozen-after-an-action).

## Test Without a Host

During development, use `connect('dev')` to load the standard Substrate dev accounts (Alice, Bob, Charlie, Dave, Eve, and Ferdie) without needing Polkadot Desktop. The signing API is identical — only the provider changes.

```typescript
async function devSignRaw() {
  const result = await manager.connect('dev');
  if (!result.ok) return null;

  const [alice] = result.value;
  if (!alice) return null;

  const selectResult = manager.selectAccount(alice.address);
  if (!selectResult.ok) return null;

  const signResult = await manager.signRaw(new TextEncoder().encode('test'));
  if (!signResult.ok) return null;

  return signResult.value; // Uint8Array - the raw signature
}
```

!!! warning
    `getProductAccount`, `getProductAccountAlias`, and `createRingVRFProof` are host-only APIs. They return `HostUnavailableError` when the active provider is `'dev'`.

## Limitations

- `getProductAccount`, `getProductAccountAlias`, and `createRingVRFProof` require an active host connection. They are not available in `'dev'` mode.
- The package is ESM only; your Product's build pipeline must support ESM imports.
- `SignerManager.destroy()` is terminal. After calling it, all subsequent method calls return `DestroyedError`. Use `disconnect()` for a reversible reset.
- Account persistence across page reloads requires the host to expose `localStorage`. Outside a host container, persistence silently no-ops.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    Your Product can sign; next, use that signer to store content on the Bulletin Chain and fetch it from anywhere by CID.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

-   <span class="badge external">External</span> **PAPI Docs**

    ---

    Reference for the typed PAPI signer interface that `@parity/product-sdk-signer` exposes.

    [:octicons-arrow-right-24: Visit Site](https://papi.how)

-   <span class="badge external">External</span> **Product SDK API Reference**

    ---

    The full `product-sdk` surface beyond this recipe: every package, class, and method.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/)

</div>

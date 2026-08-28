---
title: Signer
description: Overview of the Product SDK signer package — discover accounts, select one, and obtain a signer, with every approval routed to the user's Polkadot App.
categories: Apps
---

# Signer

## Introduction

[`@parity/product-sdk-signer`](https://paritytech.github.io/product-sdk/api/signer/) handles account discovery, selection, and signing, decoupled from where the keys actually live. Your Product talks to one class, `SignerManager`, and the same call sites work whether signing routes to the user's [Polkadot App](/reference/apps/hosts/polkadot-app/) in production or to local dev accounts in a test.

Every fallible method returns a typed `Result`, so you check `.ok` before reading `.value` rather than wrapping calls in `try`/`catch`.

## When to Use It

- Whenever your Product needs to discover accounts, select one, and obtain a `PolkadotSigner` to sign transactions or raw bytes.
- To manage the connection lifecycle: connect, disconnect, subscribe to state changes, and run once-per-session setup through the `onConnect` hook (for example, requesting permissions).
- Use the host provider for real signing on [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/) and the Polkadot App; use the dev provider for tests with well-known accounts such as Alice and Bob.
- The product-account and Ring-VRF methods are Host-only; they return `HostUnavailableError` under the dev provider.

## Core Concepts

- **`SignerManager`**: The central class. It wraps one or more providers behind a `Result`-typed API and holds a `SignerState` that it pushes to subscribers.
- **`Result`, `ok`, `err`**: The return idiom across the package. Branch on `res.ok`, then read `res.value` or `res.error`; only unexpected internal failures throw.
- **`SignerAccount`**: A signing-capable account. It exposes the SS58 `address`, the EVM-derived `h160Address` (for `pallet-revive`), the `publicKey`, an optional `name`, and `getSigner()`.
- **Host vs dev providers**: `connect()` defaults to the Host; `connect('dev')` loads well-known dev accounts locally, so no Host is needed for tests.
- **`onConnect` and `subscribe`**: `subscribe` fires on every state change; `onConnect` fires exactly once per transition into the connected state (and again after an auto-reconnect), which is where you request resources up front.
- **Product accounts**: `getProductAccount(dotNsIdentifier, derivationIndex)` returns a per-Product account the Host derives, so different Products get different addresses for the same user. This is a Host-only API.

## Connect and Sign Raw Bytes

Construct the manager once, connect, select an account, and sign. Each step returns a `Result`:

```typescript
import { SignerManager } from '@parity/product-sdk-signer';

async function signHello() {
  const manager = new SignerManager({ ss58Prefix: 0, dappName: 'my-product' });

  const connectResult = await manager.connect();
  if (!connectResult.ok) return; // HostUnavailableError outside a Host

  const [account] = connectResult.value;
  if (!account) return; // connected, but the Host returned no accounts

  manager.selectAccount(account.address);

  const signature = await manager.signRaw(new TextEncoder().encode('hello'));
  if (signature.ok) {
    console.log(signature.value); // Uint8Array
  }
}
```

!!! warning "A successful connect can still yield zero accounts"
    `connect()` resolves with `ok([])` — not an error — when `dappName` is unset or the Host rejects the derivation, typically because the `.dot` identifier is not registered for that user. Destructure and check before indexing, or `value[0].address` throws on a path the SDK documents as normal. A Product in that state can still drive the explicit signing paths, such as `getLegacyAccountSigner`.

## Request Permissions Once Per Session

Use the `onConnect` hook to request resource allocations as soon as the connection is established, before any signing call. Unlike the rest of the package, `requestResourceAllocation` **throws** rather than returning a `Result`, so guard it:

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
      if (signal.aborted) return; // user disconnected mid-request
      if (outcomes.some((outcome) => outcome !== 'Allocated')) {
        // Degrade gracefully: treat the capability as unavailable, not fatal.
      }
    } catch (cause) {
      // Typed host error — the connection itself is unaffected.
    }
  },
});
```

Three things that example is doing deliberately:

- **`try`/`catch`**: `requestResourceAllocation` adapts the Host's `Result`-returning call into a throwing one, so an unguarded `await` can throw inside `onConnect`. Errors thrown here are logged and do not break the connected state, but you lose the chance to react.
- **`signal.aborted`**: The `AbortSignal` fires if the user disconnects or the manager is destroyed while the request is still in flight. Check it before acting on the outcomes.
- **Checking the outcomes**: Each is `'Allocated'`, `'Rejected'`, or `'NotAvailable'` — bare strings here, unlike the tagged objects the [`auth`](/apps/product-sdk/auth/) package returns. See [Allowances and Permissions](/apps/concepts/allowances/) for what each resource authorizes.

!!! note "Why not `AutoSigning` in this example"
    `AutoSigning` is the most interesting resource to request and the one you cannot rely on: it returns `NotAvailable` on both the Android and iOS wallets today. Request it if you want, but treat per-transaction signing as the real path and do not build a flow that depends on the grant landing.

## Limitations

- Most methods return a `Result`; branch on `.ok`. Only terminal conditions such as calling a destroyed manager surface as thrown errors.
- `destroy()` is terminal: later calls return `DestroyedError`. Use `disconnect()` for a reversible reset.
- `subscribe` does not prime with the current state; call `getState()` for the initial read, and use `onConnect` for once-per-connect logic.
- `getProductAccount`, `getProductAccountAlias`, `createRingVRFProof`, and `getUserId` are Host-only.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Sign and Submit Transactions**

    ---

    The task-focused recipe: derive a product account, sign, and submit a transaction end to end.

    [:octicons-arrow-right-24: Sign and Submit Transactions](/apps/build/sign-and-submit/)

-   <span class="badge learn">Learn</span> **Transactions**

    ---

    Take the signer this package produces and submit and track a transaction to finality.

    [:octicons-arrow-right-24: Transactions](/apps/product-sdk/tx/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `signer` surface: `SignerManager`, `SignerAccount`, providers, and the error hierarchy.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/signer/)

</div>

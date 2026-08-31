---
title: Terminal
description: Overview of the Product SDK terminal package — QR-code login, allowance signers, and transaction signing for command-line tools paired with the Polkadot App.
categories: Apps
---

# Terminal

## Introduction

[`@parity/product-sdk-terminal`](https://paritytech.github.io/product-sdk/api/terminal/) brings the Polkadot App pairing flow to command-line tools. It prints a QR code, waits for the user to scan it with their phone, and hands back a `PolkadotSigner` that routes every signature to that phone, exactly as a Host does for a Product in a browser.

This is the package the [`playground` CLI](/apps/quick-start/) is built on. `pg login` is `createTerminalAdapter` plus a QR render plus `authenticate()`; `pg deploy`'s Bulletin uploads are signed by `getBulletinSigner`.

!!! note "Not for Products"
    A Polkadot Product runs inside a Host, which already owns the pairing and the signing route, so a Product uses [Signer](/apps/product-sdk/signer/) instead. Reach for this package when you are writing a Node CLI *alongside* your Product — a deploy script, a migration tool, a CI job that has to sign as you.

## When to Use It

- To pair a Node CLI with the Polkadot App over a QR code and sign transactions as the paired account (`createTerminalAdapter`, `createSessionSigner`).
- To write to the Bulletin Chain or publish to the Statement Store from a CLI, through an allowance slot the phone grants once (`getBulletinSigner`, `getStatementStoreProver`).
- To check whether an allowance is already cached, so a health check or readiness probe never makes the user's phone buzz (`hasBulletinAllowance`, `hasStatementStoreAllowance`).
- Not inside a Product, and not in a browser: this package assumes Node, a filesystem for its session store, and a terminal to draw in.

## Core Concepts

- **`createTerminalAdapter(options)`**: The entry point. `appId` is the storage namespace and the product identity; `endpoints` defaults to Paseo, and `storageDir` overrides the on-disk session directory (`~/.polkadot-apps/` by default). `await destroy()` when finished — it returns a promise, and the WebSocket keeps the Node event loop alive until it settles.
- **Pairing is a subscription, not a return value**: Subscribe to `adapter.sso.pairingStatus` and render the QR when a `pairing` status arrives, *then* await `adapter.sso.authenticate()`. Printing before any interface mounts is what keeps the code scannable.
- **Sessions load asynchronously**: They are read from disk after the adapter starts, so `waitForSessions(adapter, timeoutMs)` bridges the gap rather than an immediate read that would see an empty list.
- **Two signer entry points**: `createSessionSigner(session, adapter)` signs as the session's default account (`derivationIndex: 0`) under the adapter's `appId`, which is what nearly every CLI wants. `createSessionSignerForAccount(session, ref)` is the escape hatch for a non-default sub-account or a different `productId`.
- **Allowance signers are the canonical write path**: For Bulletin and Statement Store writes, ask the wallet for an allowance slot once and sign locally afterward. The first call prompts the phone; later calls return the cached slot key with no round trip.
- **Cache-only probes never prompt**: `hasBulletinAllowance` reads the on-disk allowance file directly. Use it to decide whether to warn the user that a prompt is coming.

## Pair a CLI and Sign

Create the adapter, render the QR as pairing starts, authenticate, then build a signer:

```typescript
import {
  createTerminalAdapter,
  createSessionSigner,
  renderQrCode,
  waitForSessions,
} from '@parity/product-sdk-terminal';

const adapter = createTerminalAdapter({ appId: 'my-cli' });

try {
  adapter.sso.pairingStatus.subscribe(async (status) => {
    if (status.step === 'pairing') {
      console.log(await renderQrCode(status.payload));
      console.log('Scan with the Polkadot App…');
    }
  });

  const result = await adapter.sso.authenticate();
  result.match(
    (session) => console.log('Logged in:', session?.id),
    (error) => console.error('Failed:', error.message),
  );

  const [session] = await waitForSessions(adapter, 2000);
  if (session) {
    const signer = createSessionSigner(session, adapter);
    // Pass `signer` to submitAndWatch, a contract .tx(), or any PAPI call.
  }
} finally {
  await adapter.destroy(); // async, and required — otherwise the CLI never exits
}
```

## Get an Allowance Signer

For Bulletin or Statement Store writes, request a slot and sign with what comes back. Probe the cache first if you want to warn the user before their phone lights up:

```typescript
import {
  getBulletinSigner,
  hasBulletinAllowance,
  AllowanceError,
} from '@parity/product-sdk-terminal';

if (!(await hasBulletinAllowance(adapter, 'my-cli.dot'))) {
  console.log('Approve the allowance request on your phone…');
}

try {
  const signer = await getBulletinSigner(adapter, 'my-cli.dot');
  // Sign Bulletin extrinsics with `signer`.
} catch (error) {
  if (error instanceof AllowanceError && error.reason === 'Rejected') {
    console.error('The allowance request was declined on the phone.');
  } else {
    throw error;
  }
}
```

Both helpers default `sessionId` to the only paired session. With zero or more than one paired session and no explicit id, they throw `AllowanceError` with `reason: 'NoSession'`.

## Limitations

- **Requires Node 21 or later.** The package relies on the global `WebSocket` that Node 21 was the first to expose. On Node 18 or 20 it installs fine and then fails at connect time with `WebSocket is not defined`.
- Node only. There is no browser build, and sessions are stored on disk.
- Allowance helpers throw rather than returning a `Result`, because they unwrap the underlying library's own result type. Catch `AllowanceError` and branch on `reason`.
- `adapter.destroy()` is not optional: without it the WebSocket keeps the process alive and your CLI never exits. It is async, so `await` it, and call it from a `finally` block so a failed pairing still tears down.
- `destroy()` suppresses one benign teardown line (`Client destroyed`) that the upstream statement-store logs to `console.error`, and exports the predicate it uses, `isBenignTeardownError`, for consumers filtering their own output. It does not cover an auth subscription left open at teardown, which still raises `Error: Not connected`.
- The cache-only probes mirror an upstream codec that has no public probe API yet. The public surface will not change when the upstream one ships.
- If you are on a release before 0.3, drop any `--import @parity/product-sdk-terminal/register` flag from your `node` or `tsx` invocation — that WASM loader hook has been removed and is no longer needed.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Auth**

    ---

    The runtime-agnostic core beneath this package, if you want the sign-in flow without the terminal rendering.

    [:octicons-arrow-right-24: Auth](/apps/product-sdk/auth/)

-   <span class="badge learn">Learn</span> **Signer**

    ---

    The equivalent for a Product running inside a Host, where pairing is already handled for you.

    [:octicons-arrow-right-24: Signer](/apps/product-sdk/signer/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `terminal` surface: the adapter, session signers, allowance helpers, and the `/host` subpath.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/terminal/)

</div>

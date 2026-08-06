---
title: Host
description: Overview of the Product SDK host package — detect the Polkadot Host container and reach its lower-level API surface for accounts, storage, payments, chat, and more.
categories: Apps
---

# Host

## Introduction

[`@parity/product-sdk-host`](https://paritytech.github.io/product-sdk/api/host/) detects the Polkadot Host container and exposes its full surface directly: accounts and signing, storage, permissions, payments, chat, notifications, navigation, entropy, the statement store, and chain providers. It is the foundation the other SDK packages build on, wrapping the Host protocol so higher-level packages can offer focused APIs.

Most Products reach these capabilities through the higher-level packages rather than calling the Host directly. Use this package when you need a surface those packages do not wrap yet, or when you need to detect whether your Product is running inside a Host at all.

## When to Use It

- To detect whether your Product is running inside a Host container (`isInsideContainer`, `isInsideContainerSync`) and branch behavior accordingly.
- To reach a Host capability directly: accounts and signers, payments, chat, push notifications, deep-link navigation, or feature and chain probes.
- To get a PAPI-compatible provider that routes chain traffic through the Host (`getHostProvider`), or the native statement store transport (`getStatementStore`).
- Prefer the higher-level packages where they exist: [Signer](/apps/product-sdk/signer/) for signing, [Local Storage](/apps/product-sdk/local-storage/) for key-value storage, and [Chain Client](/apps/product-sdk/chain-client/) for connections. Outside a container, every getter resolves to `null`.

## Core Concepts

- **Container detection**: `isInsideContainer()` is the async check; `isInsideContainerSync()` is a fast heuristic. Every Host getter returns `null` when not inside a container.
- **Feature-detection getters**: `getAccountsProvider`, `getHostLocalStorage`, `getPaymentManager`, `getChatManager`, `getNotificationManager`, and more each return an adapter, or `null` if the Host is absent.
- **Two error conventions**: Flat operations such as `requestPermission` and `navigateTo` return a `Result` (check `.ok`). Adapter methods keep throwing, because they implement external interfaces such as PAPI's provider that cannot carry a `Result`.
- **Accounts surface**: `getAccountsProvider()` exposes product accounts (app-scoped keypairs the Host derives per Product) and legacy accounts (the user's existing wallet keys), plus signer factories for each.
- **Chain support probes**: `getHostProvider(genesisHash)` throws a `ChainNotSupportedError` when the Host cannot serve a chain, rather than returning a provider that hangs.

## Detect the Container and Read Host Storage

Check for a Host, then use its storage surface directly:

```typescript
import {
  isInsideContainer,
  getHostLocalStorage,
} from '@parity/product-sdk-host';

if (await isInsideContainer()) {
  const storage = await getHostLocalStorage();
  if (storage) {
    await storage.writeString('theme', 'dark');
    const theme = await storage.readString('theme'); // "" if missing
  }
}
```

## Get a Product Account and Signer

Reach an app-scoped product account and build a signer for it:

```typescript
import { getAccountsProvider } from '@parity/product-sdk-host';

const accounts = await getAccountsProvider();
if (accounts) {
  const account = await accounts
    .getProductAccount('my-product.dot', 0)
    .match((a) => a, () => null);

  if (account) {
    const signer = accounts.getProductAccountSigner(account);
  }
}
```

## Limitations

- Every getter returns `null` outside a Host container; this package has no standalone fallback.
- The package mixes two error conventions: flat operations return a `Result`, while adapter methods throw. Handle both.
- `getHostProvider` throws `ChainNotSupportedError` when the Host cannot serve a chain, rather than returning a working provider.
- Host storage returns an empty string for a missing key; normalize it yourself, or use the [Local Storage](/apps/product-sdk/local-storage/) package, which does.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **App Development Reference**

    ---

    How the Host mediates between your Product and Polkadot's infrastructure.

    [:octicons-arrow-right-24: Reference](/reference/apps/)

-   <span class="badge learn">Learn</span> **Signer**

    ---

    The higher-level way to discover accounts and sign, built on this package.

    [:octicons-arrow-right-24: Signer](/apps/product-sdk/signer/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `host` surface: container detection and every Host capability getter.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/host/)

</div>

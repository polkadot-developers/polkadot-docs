---
title: Build a Shared Todo App
description: Build a complete Polkadot Product end to end with a shared todo board that combines signing, local persistence, real-time pub/sub, and on-chain storage.
categories: Apps
page_badges:
  tutorial_badge: Advanced
---

# Build a Shared Todo App

## Introduction

Each [Build guide](/apps/build/) takes one `product-sdk` capability from zero to working code. This tutorial is the capstone: it combines four of them into one product, a Shared Todo Board where every participant sees changes live and the board survives durably on chain.

What you will build, and which package carries each part:

|      Capability      |                  Package                   |                                                     Role in the app                                                     |
| :------------------: | :----------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
| Identity and signing | `signer` (via the umbrella's `wallet` API) | Connect to the Host and get the account that authors and signs everything                                               |
| Local persistence    | `local-storage`                            | The board renders instantly from the device's last known state                                                          |
| Real-time sharing    | `statement-store`                          | Every mutation gossips to other participants as a signed statement                                                      |
| Durable storage      | `cloud-storage`                            | Snapshots of the board live on the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/), addressable by CID |

![The Shared Todo Board running inside Polkadot Desktop, with the connected account in the header, a synced todo list, and the latest snapshot CID in the footer](/images/apps/tutorials/shared-todo-app/shared-todo-app-01.webp)

The guides cover the individual calls. This tutorial focuses on how the layers compose. Statements are capped at 512 bytes and expire after 30 seconds, so they carry individual mutations, not the whole board. The Bulletin Chain holds full snapshots, and a last-write-wins channel announces the latest snapshot's CID. This is the same split [Polkadot App](/reference/apps/hosts/polkadot-app/)'s Chat uses: gossip for signaling, Bulletin for content.

The code here is written against the current SDK line: `@parity/product-sdk` v0.25.0, `@parity/product-sdk-statement-store` v0.6.7, and `@parity/product-sdk-cloud-storage` v0.11.1. It needs at least `product-sdk` v0.18.0 and `statement-store` v0.5.0 — the releases that introduced the `Result` model and the sponsored host-signing path.

!!! warning "Upgrading from an SDK before 0.18.0"
    Version 0.18.0 moved several calls this app uses from throwing (or returning a bare value) to returning a typed `Result`: `app.cloudStorage.upload` and `.fetch`, `checkAuthorization`, and `StatementStoreClient.publish` and `ChannelStore.write` (previously `Promise<boolean>`). Code written against an earlier release keeps compiling in places but stops working, because a `Result` object is always truthy, so `if (!accepted)` on a publish never fires, and `if (!status.authorized)` always does. The snippets below check `.ok` throughout. If you are porting older code, audit every call site rather than trusting it to fail loudly.

## Prerequisites

Before starting, ensure you have:

- Node.js 20 or later.
- Polkadot Desktop installed and paired. See [Install Desktop and Pair](/apps/get-started/).
- A statement allowance and a Bulletin Chain storage authorization for your wallet account. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/) and the [Bulletin Chain authorizations](https://paritytech.github.io/polkadot-bulletin-chain/authorizations) reference. Without the storage authorization, snapshot uploads are rejected.
- The individual [Build guides](/apps/build/) are optional but helpful because they cover each capability in more depth.

## Scaffold the Project

Create a Next.js app and install the SDK:

```bash
npx create-next-app@latest shared-todo-board --typescript --tailwind --eslint --app --no-src-dir
cd shared-todo-board
npm install @parity/product-sdk @parity/product-sdk-statement-store @parity/product-sdk-cloud-storage
```

Three dependencies, for three reasons:

- **`@parity/product-sdk`**: The umbrella package. It re-exports the wallet, local-storage, and cloud-storage capabilities this app uses, plus the React provider. See [Umbrella or Individual Packages](/apps/build/#umbrella-or-individual-packages) if you would rather install per-capability packages.
- **`@parity/product-sdk-statement-store`**: The pub/sub client. It is not re-exported by the umbrella, so it is always its own dependency.
- **`@parity/product-sdk-cloud-storage`**: Installed explicitly because the app imports `CloudStorageClient` and `getBulletinAllowanceStatus` directly for its allowance pre-flight; relying on the umbrella's transitive copy would depend on npm hoisting.

!!! note "If the build fails on `@polkadot-api/json-rpc-provider`"
    Earlier SDK releases had transitive dependencies pinning `@polkadot-api/json-rpc-provider@0.0.1`, which npm hoisted to the top of `node_modules` and broke the build. The current dependency tree resolves `0.2.0` throughout, so no workaround should be needed. If you do hit it, declare `@polkadot-api/json-rpc-provider@^0.2.0` as a direct dependency to force the resolution — no `overrides` or patching required.

Wrap the app in `ProductSDKProvider` so every component can reach the SDK through `useProductSDK()`:

```tsx title="app/providers.tsx"
--8<-- "code/apps/tutorials/shared-todo-app/providers.tsx"
```

Then mount it in the root layout. The inline script is a Polkadot Desktop workaround: it sets the host webview mark synchronously, so the SDK's container detection returns true before its bundle evaluates. It forces host mode unconditionally, which is acceptable here because every capability in this app needs the Host anyway. Drop the line if you want honest container detection — for a Product that renders a useful "open me in a Host" state instead of failing, say — but note that nothing in this app functions outside one:

```tsx title="app/layout.tsx"
--8<-- "code/apps/tutorials/shared-todo-app/layout.tsx"
```

All SDK logic in this tutorial lives in a `lib/` directory, one file per capability, so each section that follows is one focused module. Start with the shared types: a `Todo` carries its author and an `updatedAt` timestamp, and the timestamps are what every later layer uses to resolve conflicts.

```typescript title="lib/types.ts"
--8<-- "code/apps/tutorials/shared-todo-app/types.ts"
```

## Connect and Get an Identity

The app publishes todos, statements, and snapshots, and each item is attributed to an account, so identity comes first. `connectIdentity` connects to the Host, selects the first available account, and prefers the product-scoped account when the Host provides one:

```typescript title="lib/signer.ts"
--8<-- "code/apps/tutorials/shared-todo-app/signer.ts"
```

The product account is a per-Product, privacy-preserving identity derived by the Host. See [Sign and Submit Transactions](/apps/build/sign-and-submit/) for how derivation and approval routing work. Outside a host container, `connect()` fails, which the page surfaces as an error banner; there is deliberately no fallback path here because every later capability needs the Host anyway.

!!! note "If Connect reports no accounts"
    `connectIdentity` throws `No accounts available from the host` when `connect()` succeeds but hands back an empty list. That is a real outcome, not a bug: the `name` you pass to `ProductSDKProvider` becomes the dotNS identifier the Host derives the account from, and a bare label like `shared-todo-board` is qualified to `shared-todo-board.dot`. If the Host declines to derive for that identifier, you get zero accounts and no error. Change `name` to a `.dot` identifier you own — the same string then also namespaces your local storage, so treat it as fixed once you pick it. See [A Minimal Product](/apps/product-sdk/#a-minimal-product) for the same trap on the `createApp` path.

## Keep State on the Device

The board should render instantly on launch before the Host connection and before any network. `local-storage` gives each Product an isolated key-value store on the device, so the whole persistence layer is one key:

```typescript title="lib/board.ts"
--8<-- "code/apps/tutorials/shared-todo-app/board.ts"
```

The `getJSON` and `setJSON` helpers handle serialization, and the SDK namespaces keys per Product automatically, so no prefixing is needed. The store is backed by the Host — there is no browser `localStorage` fallback, so these calls only work inside a container. See [Persist Data Locally](/apps/build/persist-data-locally/).

Note what this file _does not_ contain: mutation logic. Adding, toggling, and deleting todos are defined in the next section as events, so that a change made locally and a change arriving from the network flow through identical code.

## Share the Board in Real Time

The [Statement Store](/reference/apps/infrastructure/statement-store/) gossips small signed payloads between instances of your Product. See [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/) for the full model. Two of its limits shape this app's protocol:

- The whole board does not fit inside the 512-byte statement cap, so each statement carries one mutation: an upsert of a single todo, or a deletion.
- Statements have a 30-second TTL. They are signaling, not storage. A participant who joins late sees nothing until the next mutation; that gap is closed by the durable snapshots in the next section.

??? code "lib/sync.ts"
    ```typescript title="lib/sync.ts"
    --8<-- "code/apps/tutorials/shared-todo-app/sync.ts"
    ```

The pieces:

- **`createSyncClient`**: Connects a `StatementStoreClient` in host mode. The `appName` is hashed into the statement topic, so instances of this Product only see each other's traffic. Host mode takes no account: since `statement-store` v0.5.0 the Host signs each statement itself, through the sponsored path, using the Product's allowance account. Older examples pass an `accountId` to `connect()`; it is accepted for compatibility and ignored.

- **`publishEvent` / `subscribeToBoard`**: Thin typed wrappers over `publish` and `subscribe`.
- **`applyEvent`**: The merge rule: per-todo last write wins, compared by `updatedAt`. It is idempotent, so replayed statements (including your own, which the node echoes back) are harmless no-ops.

## Make the Board Durable

Statements vanish after 30 seconds; the board should not. The [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/) stores content-addressed data on chain: upload bytes, get back a CID, and fetch by CID from anywhere. The app uploads the whole board as a JSON snapshot, then announces the CID on a last-write-wins channel so every participant knows where the freshest snapshot lives. Announcements are published with a one-hour TTL because the default 30 seconds would make the board undiscoverable almost immediately. A participant who joins within that window receives the latest live announcement on subscribe and loads the board from the Bulletin Chain; beyond it, the board appears once any participant saves again:

??? code "lib/snapshot.ts"
    ```typescript title="lib/snapshot.ts"
    --8<-- "code/apps/tutorials/shared-todo-app/snapshot.ts"
    ```

The pieces:

- **`uploadSnapshot` / `fetchSnapshot`**: Use `app.cloudStorage` from the umbrella. `upload` signs and submits the storage transaction through the Host and resolves with the CID; `fetch` is permissionless. [Store Data on Chain](/apps/build/store-data-on-chain/) covers chunking, renewal, and the lower-level client.
- **`ensureAuthorized`**: A pre-flight that runs before every upload, turning a missing [storage allowance](https://paritytech.github.io/polkadot-bulletin-chain/authorizations) into an actionable error instead of a bare on-chain rejection. It uses `getBulletinAllowanceStatus`, which costs one extra block read over `checkAuthorization` and derives `usable` — authorized, unexpired, and with quota left. Checking `authorized` alone would wave through an expired or exhausted allowance. Because `usable` does not know your payload size, the function also compares `remainingBytes` against the encoded snapshot.
- **`announceSnapshot` / `onSnapshotAnnounced`**: Use the statement store's channel mechanism. Each channel keeps only its latest value per signer (one live announcement per account; `receiveSnapshot` reconciles announcements from different participants by `updatedAt`). Publishing goes through `client.publish` directly rather than `ChannelStore.write` so the statement can carry the long TTL; receiving still uses `ChannelStore`, which replays the latest live value to new subscribers. The announcement is `{ cid, updatedAt }`, comfortably inside the 512-byte cap. This is the composition the platform recommends: the channel is the index, the Bulletin Chain is the data.
- **`mergeBoards`**: Folds a fetched snapshot into local state with the same per-todo last-write-wins rule as live sync.

## Wire Up the Page

The UI is a single client component. All the SDK behavior you have built lives in `lib/`; the page wires it to React state. The two functions worth reading closely are `dispatch` (apply a local mutation, persist it, broadcast it) and `receiveEvent` (apply a remote mutation through the _same_ merge), plus `handleSaveBoard` and `receiveSnapshot` doing the equivalent pair for snapshots:

??? code "app/page.tsx"
    ```tsx title="app/page.tsx"
    --8<-- "code/apps/tutorials/shared-todo-app/page.tsx"
    ```

## Run It

Start the dev server and load the Product in Polkadot Desktop (per [Set Up Your Project](/apps/build/#set-up-your-project)):

```bash
npm run dev
```

Then walk the same checks this tutorial's reference app was verified with:

1. **Identity**: Click **Connect**; your account address appears in the header and a green live badge confirms the statement subscription.
2. **Local persistence**: Add todos, reload the page, and the board comes back instantly from device storage.
3. **Real-time sync**: Open the Product in a second host client and connect; a todo added in one appears in the other within a couple of seconds.
4. **Durability**: Click **Save board**; after the signing approval, the snapshot CID appears in the footer. Connect a third client with no local state within the announcement's one-hour TTL: it receives the announced CID and loads the board from the Bulletin Chain.

## Ship It

The board runs from `localhost` inside your host container. The remaining step is making it a real, discoverable Product. [Deploy Your App](/apps/deploy-your-app/) walks through bundling, publishing, and registering a DotNS name for it. Once it is live, the same bundle opens in Polkadot Desktop and on [Polkadot Web](/reference/apps/hosts/polkadot-web/) at `https://<name>.paseo.li` in any browser.

## Where to Go Next

Each capability this tutorial composed has a guide that owns the depth:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Sign and Submit Transactions**

    ---

    Product accounts, raw-byte signing, full transaction submission, and error handling.

    [:octicons-arrow-right-24: Get Started](/apps/build/sign-and-submit/)

-   <span class="badge guide">Guide</span> **Persist Data Locally**

    ---

    The local key-value store in depth: JSON helpers, React hooks, prefixes.

    [:octicons-arrow-right-24: Get Started](/apps/build/persist-data-locally/)

-   <span class="badge guide">Guide</span> **Publish and Subscribe to Off-Chain Data**

    ---

    Statement Store internals: topics, channels, TTLs, and allowances.

    [:octicons-arrow-right-24: Get Started](/apps/build/pub-sub-off-chain-data/)

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    Bulletin Chain in depth: chunking, authorization, renewal, and preimages.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)

-   <span class="badge guide">Guide</span> **Read On-Chain Data**

    ---

    The one capability this app did not need: typed, host-routed chain reads.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/)

</div>

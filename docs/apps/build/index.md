---
title: Build
description: Build Polkadot Product capabilities with product-sdk packages for signing, on-chain reads, decentralized storage, off-chain pub/sub, and local persistence.
categories: Apps
---

# Build

The Build section is a cookbook of focused recipes, one per [`product-sdk`](https://github.com/paritytech/product-sdk){target=\_blank} package; each recipe takes a single capability and walks you from an empty project to working Product code. They apply no matter how you started: a [Quick Start](/apps/quick-start/) deploy (RevX or CLI) or a project you [set up yourself](#set-up-your-project). Pick the capability your Product needs, in any order; the recipes are ordered by how little they ask of you, and the first one requires no account and no tokens.

!!! tip "Full API reference"
    Each recipe walks one path through a package. For the complete `product-sdk` surface (every package, class, and method), see the [Product SDK API reference](https://paritytech.github.io/product-sdk/){target=\_blank}.

## Set Up Your Project

Every guide assumes a Product project running locally in [Polkadot Desktop](/apps/get-started/). The steps below apply no matter how you bootstrapped your Product: a [Quick Start](/apps/quick-start/) deploy (RevX or CLI) or a project created from scratch.

1. Scaffold a project. Any framework that serves on `localhost` works; this example uses Next.js:

    ```bash
    npx create-next-app@latest my-product
    cd my-product
    ```

2. Install the [Product SDK](https://github.com/paritytech/product-sdk){target=\_blank}:

    ```bash
    npm install @parity/product-sdk
    ```

3. Start the dev server:

    ```bash
    npm run dev
    ```

4. Open Polkadot Desktop and click **Skip (Dev only)**.

    ![Polkadot Desktop showing the "Skip (Dev only)" button](/images/apps/build/start-a-local-dev-loop/start-a-local-dev-loop-01.webp)

5. Type `localhost:3000` (or your dev server's port) in the address bar and press **Enter**.

    Desktop recognizes `localhost` as a whitelisted origin, skips `.dot` resolution, and loads your Product directly from the local server.

    ![Polkadot Desktop showing a local Product loaded from localhost:3000](/images/apps/build/start-a-local-dev-loop/start-a-local-dev-loop-02.webp)

Your Product is now running inside the Polkadot Desktop sandbox, served from your local machine. Live reload works through your dev server's hot module replacement: edit, save, and watch the change appear in Desktop. The sandbox and permission prompts apply exactly as they would for a published `.dot` Product, and no Proof of Personhood or funds are needed to load from `localhost`.

## Capabilities

<div class="grid cards" markdown>

-   <span class="badge beginner">Beginner</span> **Read On-Chain Data**

    ---

    Your Product needs to show live balances, storage, and chain state. Reads are unsigned: no account, no tokens, no infrastructure to run.

    [:octicons-arrow-right-24: Read On-Chain Data](/apps/build/read-chain-state/)

-   <span class="badge beginner">Beginner</span> **Sign and Submit Transactions**

    ---

    Your Product needs to act on chain on the user's behalf. Derive a per-user account and request signatures; every approval happens on the user's phone.

    [:octicons-arrow-right-24: Sign and Submit Transactions](/apps/build/sign-and-submit/)

-   <span class="badge intermediate">Intermediate</span> **Store Data on Chain**

    ---

    Your Product needs content that outlives a session: profile photos, published posts, file uploads. Write to the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/){target=\_blank} and fetch from anywhere by CID.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

-   <span class="badge intermediate">Intermediate</span> **Publish and Subscribe to Off-Chain Data**

    ---

    Your Product needs real-time state between users: presence, typing indicators, multiplayer cursors. Signed pub/sub via the [Statement Store](/reference/apps/infrastructure/statement-store/){target=\_blank}, no fees per message.

    [:octicons-arrow-right-24: Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/)

-   <span class="badge beginner">Beginner</span> **Persist Data Locally**

    ---

    Your Product needs to remember things on this device: preferences, drafts, cached values. Per-Product key-value storage that works inside a Host or in a plain browser tab.

    [:octicons-arrow-right-24: Persist Data Locally](/apps/build/persist-data-locally/)

</div>

## The product-sdk Packages

Each guide is built around one _primary_ package and weaves in _utility_ packages where they are needed. The full source is at [`paritytech/product-sdk`](https://github.com/paritytech/product-sdk){target=\_blank}. Here is what each package is for:

|      Package      |                                                                                                                    What it does                                                                                                                     |                                     Guide                                      |
|:-----------------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------:|
|  `chain-client`   |                                                A typed, host-routed client for reading on-chain storage, constants, and account state across one or more chains, with no RPC infrastructure to run.                                                 |              [Read On-Chain Data](/apps/build/read-chain-state/)               |
|     `signer`      |                                             Derives product-scoped accounts and requests signatures, routing every approval to the user's Polkadot App. Your Product signs without ever handling keys.                                              |          [Sign and Submit Transactions](/apps/build/sign-and-submit/)          |
|  `cloud-storage`  | A high-level client for the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/){target=\_blank}, Polkadot's content-addressed storage. Uploads and retrieves data by CID, with chunking, manifests, and authorization handled for you. |            [Store Data on Chain](/apps/build/store-data-on-chain/)             |
| `statement-store` | A pub/sub client for the [Statement Store](/reference/apps/infrastructure/statement-store/){target=\_blank}: publish and subscribe to signed, short-lived statements gossiped peer-to-peer off-chain. Ideal for real-time signaling between users.  | [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/) |
|  `local-storage`  |                                                       A per-Product, per-device key-value store backed by the Host, for preferences, drafts, and cached values that persist across sessions.                                                        |           [Persist Data Locally](/apps/build/persist-data-locally/)            |

These five anchor the current recipes because their surfaces are stable. Other packages in the SDK (`contracts`, `keys`, `crypto`, `host`) will get recipes of their own as their surfaces stabilize.

The guides also use these utility packages where relevant:

- **`tx`**: Builds, signs, and tracks the lifecycle of transactions (used alongside `signer`).
- **`address`**: Encodes, decodes, and validates SS58 addresses.
- **`descriptors`**: Provides typed chain metadata for the `chain-client` Bring Your Own Descriptors path.
- **`host`**: Provides low-level access to the Host API (for example, the preimage manager used for sponsored uploads).

## Umbrella or Individual Packages

Every guide works with either install style; choose based on your needs:

- **Umbrella package**: `npm install @parity/product-sdk`. One dependency that re-exports everything. Convenient when your Product uses several capabilities and bundle size is not a concern.
- **Individual packages**: `npm install @parity/product-sdk-cloud-storage` (and so on). Install only what you use to keep your bundle smaller and your dependencies explicit.

Import paths are identical either way, so you can start with the umbrella package and switch to individual packages later as a bundle-size optimization.

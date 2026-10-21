---
title: Store and Retrieve Data on the Bulletin Chain
description: Learn how to store and retrieve an image on the Polkadot Bulletin Chain using the Console UI or PAPI, with step-by-step instructions.
categories: Chain Interactions
page_badges:
  tutorial_badge: Intermediate
---

# Store and Retrieve Data on the Bulletin Chain

The [Bulletin Chain](/reference/polkadot-hub/data-storage/){target=\_blank} is a specialized storage chain in the Polkadot ecosystem that provides decentralized data storage with IPFS-compatible content addressing. You can use it to store static sites, images, media assets, application data, or any other files that benefit from availability and censorship-resistance.

In this tutorial, you'll walk through a common developer scenario: storing an image using the Bulletin Chain's decentralized storage and obtaining its CID (Content Identifier) so it can be referenced from a dApp, NFT metadata, or any IPFS-compatible system. The same steps apply to any file type — documents, JSON configs, HTML pages, and more.

## Prerequisites

- A Polkadot account (SS58 format) — see [Create an Account](/chain-interactions/accounts/create-account/){target=\_blank} if you need one
- A browser wallet extension (Polkadot.js, Talisman, SubWallet, or Fearless)
- An image or file to store (at most 2 MiB per transaction; for larger files, you can chunk your data — see [Size Limits](/reference/polkadot-hub/data-storage/#size-limits))
- Authorization to store data on the Bulletin Chain (covered in the next section)
- For the PAPI method: [Node.js](https://nodejs.org/){target=\_blank} v18 or higher

## Get Authorization

The Bulletin Chain has no token balances — you need authorization before you can store data. Authorization grants your account a specific number of transactions and bytes that you can use for storage.

For this tutorial, we're going to use the testnet faucet for authorizations.

=== "Console UI"

    1. Navigate to the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank} and click **Connect** to connect your wallet.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-1.webp)

    2. Go to the **Faucet** page and select the **Storage Faucet** tab.
    3. Under **Authorize Account**, enter the desired number of **Transactions** and **Bytes** for your storage needs, then click **Authorize Account**.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-2.webp)

    4. Approve the transaction in your wallet extension. You should see a success confirmation.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-3.webp)

    5. To verify your authorization, switch to the **Accounts** tab to view your remaining transactions, bytes, and expiration block.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-4.webp)

    !!! note
        Authorization has an expiration block. Once expired, unused authorization is not refunded — you'll need to request new authorization.

!!! note
    The `authorize_account` extrinsic requires the authorizer origin: Root, or an account or parachain allowed to grant authorizations. You cannot self-authorize programmatically. On Polkadot TestNet, use the Console UI faucet to authorize your account before using PAPI to store data.

## Store Your Image

Now that your account is authorized, you can store your image on-chain. Choose the method that best fits your workflow.

!!! note
    You can also interact with the Bulletin Chain directly through [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpaseo-bulletin-next-rpc.polkadot.io) or [dev.papi.how](https://dev.papi.how/) by submitting extrinsics from the `TransactionStorage` pallet to store data and from the `DataRenewal` pallet to renew it.

=== "Console UI"

    1. Navigate to the **Upload** page in the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank}. You can see your account's storage usage and authorization quota on the right side panel.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-5.webp)

    2. Select the **File** tab, then drag and drop your image or click to browse. The UI shows the file name and size.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-6.webp)

    3. Leave the **CID Configuration** at the defaults (Blake2b-256 hash, Raw codec) unless you have specific requirements.

    4. Click **Upload to Bulletin Chain** and approve the transaction in your wallet extension.

    5. On success, the UI displays your **CID**, **Block Number**, and **Transaction Index**.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-7.webp)

    !!! warning
        Save the **CID** — you'll need it to renew your data before it expires. The Console UI auto-saves your uploads to your browser history, but you should record the CID separately as well.

=== "PAPI"

    Use the [Polkadot API (PAPI)](https://papi.how/){target=\_blank} to store an image programmatically — ideal for integrating into build scripts, CI pipelines, or dApp backends.

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir bulletin-store-example && cd bulletin-store-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install the required dependencies:

        ```bash
        npm install polkadot-api@{{dependencies.javascript_packages.polkadot_api.version}} @polkadot-labs/hdkd@{{dependencies.javascript_packages.hdkd.version}} @polkadot-labs/hdkd-helpers@{{dependencies.javascript_packages.hdkd_helpers.version}} multiformats
        ```

    3. Fetch the Bulletin Chain metadata and generate typed descriptors:

        ```bash
        npx papi add bulletin -w wss://paseo-bulletin-next-rpc.polkadot.io
        ```

        This command connects to the Bulletin Chain RPC endpoint, downloads the chain metadata, and generates typed descriptors that provide full type safety for all pallet interactions.

    **Store an Image**

    Create a file named `store-data.ts` with the following content:

    ```typescript title="store-data.ts"
    --8<-- "code/chain-interactions/store-data/bulletin-chain/store-data.ts"
    ```

    !!! note
        Replace `INSERT_IMAGE_PATH` with the path to your image (e.g., `./logo.png`). Ensure the file is at most 2 MiB. For the signer, replace the dev phrase with your own mnemonic for a Polkadot TestNet-authorized account.

    Run the script:

    ```bash
    npx tsx store-data.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/store-data/bulletin-chain/store-data-ts.html'

## Verify Your Stored Image

After storing your image, you can verify it was successfully recorded using the **Explorer** in the Console UI. Navigate to the block number where your image was stored, shown on the **Upload** page or printed by the store script, to see the `TransactionStorage.Stored` event with the content hash and CID.

![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-8.webp)

## Retrieve Your Data

The Bulletin Chain follows a "write-to-chain, read-from-network" architecture — you retrieve data from collator nodes using the CID. For a full overview of retrieval methods, see the [reference page](/reference/polkadot-hub/data-storage/#retrieval-methods).

=== "Console UI"

    1. Navigate to the **Download** page in the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank}.
    2. Choose a retrieval method:

        - **P2P Connection**: Connects directly to Bulletin Chain collator nodes (decentralized, recommended).
        - **IPFS Gateway**: Uses the Bulletin Chain's IPFS gateway at `https://paseo-bulletin-next-ipfs.polkadot.io`.

    3. Enter your **CID** in the "Fetch by CID" field — you can use either the `bafk2bzace...` format or the hex-encoded `0x0155a0e4...` format.
    4. Click **Fetch Data** to retrieve your content. The UI also generates a direct **Gateway Link** you can open in your browser.

        ![](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-9.webp)

    !!! tip
        You can also access your data directly in the browser via the Bulletin Chain IPFS gateway:

        ```text
        https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/<CID>
        ```

        For fully decentralized retrieval, use P2P or the upcoming Smoldot light client.

=== "Programmatic (Gateway)"

    You can retrieve data programmatically using the Bulletin Chain's IPFS gateway:

    ```typescript
    const cid = 'INSERT_CID';
    const response = await fetch(`https://paseo-bulletin-next-ipfs.polkadot.io/ipfs/${cid}`);
    const data = await response.arrayBuffer();
    console.log(`Retrieved ${data.byteLength} bytes`);
    ```

    !!! note
        Replace `INSERT_CID` with the CID string you received when storing your data (e.g., `bafk2bzacea6wlxy...`).

=== "Direct P2P (Helia)"

    For production applications, the recommended decentralized approach is to connect directly to Bulletin Chain collator nodes using [Helia](https://helia.io/){target=\_blank} (a lean IPFS implementation) and retrieve data via the CID over [libp2p](https://libp2p.io/){target=\_blank}.

    This method requires knowing the public multiaddresses of Bulletin Chain collator nodes. See the [Bulletin Chain repository](https://github.com/paritytech/polkadot-bulletin-chain){target=\_blank} for Helia configuration examples and available collator endpoints.

!!! tip
    Smoldot light client support for retrieval via the `bitswap_block` RPC is coming soon. This will enable fully trustless, decentralized data retrieval without connecting to a full node.

!!! note
    Stored data is only available within the retention period (~2 weeks on Polkadot TestNet). After that, the data is pruned from the chain and is no longer retrievable unless it has been renewed.

## Renew Your Data

Stored data is retained for a limited period (~2 weeks on Polkadot TestNet). If you need your image to remain available beyond the retention period, renew it before it expires.

=== "Console UI"

    1. Navigate to the **Renew** page in the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/) and connect your wallet.
    2. Find your data in one of the following ways:
        - On the **By CID** tab, enter your CID and click **Resolve CID**.
        - On the **By Block + Index** tab, enter the **Block Number** and **Transaction Index** and click **Lookup Transaction**.
    3. Check the expiration status, then choose an action and approve the transaction in your wallet extension:
        - **Renew**: Schedules one renewal that takes effect when the current retention period ends. This is the `renew` call in the PAPI tab.
        - **Renew immediately**: Renews the data now, and the full retention period restarts from the current block. This is the `force_renew` call.
        - **Enable auto-renew**: Renews the data at the end of every retention period. The first renewal is prepaid, and later renewals use your authorization until it runs out. This is the `enable_auto_renew` call.

=== "PAPI"

    Register a renewal with the `DataRenewal` pallet. Identify your data by the content hash that the store script printed:

    ```typescript
    console.log('Registering renewal...');
    const result = await api.tx.DataRenewal.renew({
      entry: { type: 'ContentHash', value: 'INSERT_CONTENT_HASH' },
    }).createAndSubmit(signer);
    console.log(`Renewal registered in block: ${result.block.hash}`);
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/store-data/bulletin-chain/renew-data-ts.html'

The `renew` call registers a one-time renewal. When the retention period of your data ends, the chain stores the data again, so it stays available for another full retention period. The renewal is paid from your authorization when you register it. Each content hash can have only one registered renewal at a time, so registering again before this one takes effect fails with `RenewalAlreadyEnabled`.

The `DataRenewal` pallet also provides the following alternatives:

- **`force_renew`**: Renews the data immediately. It takes the same `entry` argument as `renew`.
- **`enable_auto_renew`**: Renews the data at the end of every retention period. It takes the data's content hash. Each renewal after the first is charged to your authorization, and recurring renewal stops if your authorization cannot cover it.

!!! warning
    You can also identify the data by its position, using the block number and the `Index` value that the store script printed:

    ```typescript
    entry: {
      type: 'Position',
      value: { block: INSERT_BLOCK_NUMBER, index: INSERT_INDEX },
    },
    ```

    A position identifies one stored copy of the data and stays valid until that copy's retention period ends. Each renewal stores a new copy at a new block number and index. When a `renew` takes effect, the original copy expires at the same time, and calls that use its position fail with `RenewedNotFound`. After `force_renew`, the original copy keeps its position until its own period ends, so renewing that position again stores another copy. The content hash always resolves to the latest copy.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge reference">Reference</span> __Data Storage Reference__

    ---

    Explore the full technical reference for the Bulletin Chain, including all extrinsics, storage items, and events.

    [:octicons-arrow-right-24: Reference](/reference/polkadot-hub/data-storage/)

</div>

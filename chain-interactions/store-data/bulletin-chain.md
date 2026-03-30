---
title: Store Data on the Bulletin Chain
description: Learn how to store an image on the Polkadot Bulletin Chain using the Console UI or PAPI, with step-by-step instructions.
categories: Chain Interactions
tutorial_badge: Beginner
---

# Store Data on the Bulletin Chain

The [Bulletin Chain](/reference/polkadot-hub/data-storage/){target=\_blank} is a specialized storage chain in the Polkadot ecosystem that provides decentralized data storage with IPFS-compatible content addressing. You can use it to store static sites, images, media assets, application data, or any other files that benefit from on-chain verifiability.

In this tutorial, you'll walk through a common developer scenario: storing an image on-chain and obtaining its CID (Content Identifier) so it can be referenced from a dApp, NFT metadata, or any IPFS-compatible system. The same steps apply to any file type — documents, JSON configs, HTML pages, and more.

## Prerequisites

- A Polkadot account (SS58 format) — see [Create an Account](/chain-interactions/accounts/create-account/){target=\_blank} if you need one
- A browser wallet extension (Polkadot.js, Talisman, SubWallet, or Fearless)
- An image or file to store (under ~8 MiB; for larger files, see [Size Limits](/reference/polkadot-hub/data-storage/#size-limits){target=\_blank})
- Authorization to store data on the Bulletin Chain (covered in the next section)
- For the PAPI method: [Node.js](https://nodejs.org/){target=\_blank} v18 or higher

## Get Authorization

The Bulletin Chain has no token balances — you need authorization before you can store data. Authorization grants your account a specific number of transactions and bytes that you can use for storage.

=== "Console UI"

    1. Navigate to the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank} and click **Connect** to connect your wallet.

        ![](/images/chain-interactions/store-data/bulletin-chain/console-connect-wallet.webp)

    2. Go to the **Faucet** page and select the **Storage Faucet** tab.
    3. Under **Authorize Account**, enter the desired number of **Transactions** and **Bytes** for your storage needs, then click **Authorize Account**.

        ![](/images/chain-interactions/store-data/bulletin-chain/faucet-authorize-account.webp)

    4. Approve the transaction in your wallet extension. You should see a success confirmation.

        ![](/images/chain-interactions/store-data/bulletin-chain/faucet-authorization-success.webp)

    5. To verify your authorization, switch to the **Accounts** tab to view your remaining transactions, bytes, and expiration block.

        ![](/images/chain-interactions/store-data/bulletin-chain/faucet-your-authorization.webp)

    !!! note
        Authorization has an expiration block. Once expired, unused authorization is not refunded — you'll need to request new authorization.

!!! note
    The `authorize_account` extrinsic requires Root origin (a privileged account). You cannot self-authorize programmatically — on Polkadot TestNet, use the Console UI faucet to authorize your account before using PAPI to store data.

## Store Your Image

Now that your account is authorized, you can store your image on-chain. Choose the method that best fits your workflow.

!!! note
    You can also interact with the Bulletin Chain directly through [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpaseo-bulletin-rpc.polkadot.io){target=\_blank} by submitting extrinsics from the `transactionStorage` pallet.

=== "Console UI"

    1. Navigate to the **Upload** page in the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank}. You can see your account's storage usage and authorization quota on the right side panel.

        ![](/images/chain-interactions/store-data/bulletin-chain/upload-empty.webp)

    2. Select the **File** tab, then drag and drop your image or click to browse. The UI shows the file name and size.

        ![](/images/chain-interactions/store-data/bulletin-chain/upload-file-selected.webp)

    3. Leave the **CID Configuration** at the defaults (Blake2b-256 hash, Raw codec) unless you have specific requirements.

    4. Click **Upload to Bulletin Chain** and approve the transaction in your wallet extension.

    5. On success, the UI displays your **CID**, **Block Number**, and **Transaction Index**.

        ![](/images/chain-interactions/store-data/bulletin-chain/upload-success.webp)

    !!! warning
        Save the **Block Number** and **Transaction Index** — you'll need these values to renew your data before it expires. The Console UI auto-saves this to your browser history, but you should record it separately as well.

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
        npx papi add bulletin -w wss://paseo-bulletin-rpc.polkadot.io
        ```

        This command connects to the Bulletin Chain RPC endpoint, downloads the chain metadata, and generates typed descriptors that provide full type safety for all pallet interactions.

    **Store an Image**

    Create a file named `store-data.ts` with the following content:

    ```typescript title="store-data.ts"
    --8<-- "code/chain-interactions/store-data/bulletin-chain/store-data.ts"
    ```

    !!! note
        Replace `INSERT_IMAGE_PATH` with the path to your image (e.g., `./logo.png`). Ensure the file is under ~8 MiB. For the signer, replace the dev phrase with your own mnemonic for a Polkadot TestNet-authorized account.

    Run the script:

    ```bash
    npx tsx store-data.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/store-data/bulletin-chain/store-data-ts.html'

## Verify Your Stored Image

After storing your image, you can verify it was successfully recorded using the **Explorer** in the Console UI. Navigate to the block number from the `Stored` event to see the `TransactionStorage.Stored` event with the content hash and CID.

![](/images/chain-interactions/store-data/bulletin-chain/explorer-stored-event.webp)

## Retrieve Your Data

The Bulletin Chain follows a "write-to-chain, read-from-network" architecture — you retrieve data from validator nodes using the CID. For a full overview of retrieval methods, see the [reference page](/reference/polkadot-hub/data-storage/#retrieval-methods).

=== "Console UI"

    1. Navigate to the **Download** page in the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank}.
    2. Choose a retrieval method:

        - **P2P Connection**: Connects directly to Bulletin Chain validator nodes (decentralized, recommended).
        - **IPFS Gateway**: Uses the Bulletin Chain's IPFS gateway at `https://paseo-ipfs.polkadot.io`.

    3. Enter your **CID** in the "Fetch by CID" field — you can use either the `bafk2bzace...` format or the hex-encoded `0x0155a0e4...` format.
    4. Click **Fetch Data** to retrieve your content. The UI also generates a direct **Gateway Link** you can open in your browser.

        ![](/images/chain-interactions/store-data/bulletin-chain/download-ipfs-gateway.webp)

    !!! tip
        You can also access your data directly in the browser via the Bulletin Chain IPFS gateway:

        ```text
        https://paseo-ipfs.polkadot.io/ipfs/<CID>
        ```

        For fully decentralized retrieval, use P2P or the upcoming Smoldot light client.

=== "Programmatic (Gateway)"

    You can retrieve data programmatically using the Bulletin Chain's IPFS gateway:

    ```typescript
    const cid = 'INSERT_CID';
    const response = await fetch(`https://paseo-ipfs.polkadot.io/ipfs/${cid}`);
    const data = await response.arrayBuffer();
    console.log(`Retrieved ${data.byteLength} bytes`);
    ```

    !!! note
        Replace `INSERT_CID` with the CID string you received when storing your data (e.g., `bafk2bzacea6wlxy...`).

=== "Direct P2P (Helia)"

    For production applications, the recommended decentralized approach is to connect directly to Bulletin Chain validator nodes using [Helia](https://helia.io/){target=\_blank} (a lean IPFS implementation) and retrieve data via the CID over [libp2p](https://libp2p.io/){target=\_blank}.

    This method requires knowing the public multiaddresses of Bulletin Chain validator nodes. See the [Bulletin Chain repository](https://github.com/paritytech/polkadot-bulletin-chain){target=\_blank} for Helia configuration examples and available validator endpoints.

!!! tip
    Smoldot light client support for retrieval via the `bitswap_block` RPC is coming soon. This will enable fully trustless, decentralized data retrieval without connecting to a full node.

!!! note
    Stored data is only available within the retention period (~2 weeks on Polkadot TestNet). After that, the data is pruned from the chain and is no longer retrievable unless it has been renewed or pinned by an external IPFS node.

## Renew Your Data

Stored data is retained for a limited period (~2 weeks on Polkadot TestNet). If you need your image to remain available beyond the retention period, renew it before it expires.

=== "Console UI"

    1. Navigate to the **Renew** page in the [Bulletin Chain Console](https://paritytech.github.io/polkadot-bulletin-chain/){target=\_blank}.
    2. Select your stored transaction from the **Load from History** dropdown, or manually enter the **Block Number** and **Transaction Index**.

        ![](/images/chain-interactions/store-data/bulletin-chain/renew-find-transaction.webp)

    3. Click **Lookup Transaction** to view the transaction details, including the content hash, size, and expiration status.

        ![](/images/chain-interactions/store-data/bulletin-chain/renew-transaction-details.webp)

    4. Click **Renew Storage** and approve the transaction in your wallet extension.

=== "PAPI"

    ```typescript
    console.log('Renewing stored data...');
    const result = await api.tx.TransactionStorage.renew({
      block: INSERT_BLOCK_NUMBER,
      index: INSERT_INDEX,
    }).signAndSubmit(signer);
    console.log(`Renewal included in block: ${result.block.hash}`);
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/store-data/bulletin-chain/renew-data-ts.html'

Renewal resets the retention timer, keeping your image available for another full retention period.

!!! warning
    Each renewal generates a **new block number and index**. You must track the latest `(block, index)` pair from the `Renewed` event for any subsequent renewals. Using the original values after a renewal will fail.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge reference">Reference</span> __Data Storage Reference__

    ---

    Explore the full technical reference for the Bulletin Chain, including all extrinsics, storage items, and events.

    [:octicons-arrow-right-24: Reference](/reference/polkadot-hub/data-storage/)

</div>

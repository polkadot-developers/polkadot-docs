---
title: Deploy Your App
description: Deploy your Polkadot Product to the playground using the playground CLI — build, upload, and publish your app on-chain and register a DotNS name.
categories: Apps
page_badges:
  tutorial_badge: Intermediate
---

# Deploy Your App

## Introduction

This page covers how to take a finished Polkadot Product live with the `playground` CLI. By the end, your app bundle will be uploaded to the Bulletin Chain, registered under a DotNS name, and, if you choose, discoverable in the Polkadot Playground.

--8<-- 'text/apps/network-tld.md'

A deploy is really four stages, and `playground deploy` walks you through all of them in one flow:

- **Build**: Compile your Product into a static bundle of files (HTML, JS, CSS, assets) with `playground build`.
- **Register**: Reserve a DotNS name for your Product through the on-chain name service. This is the address people use to reach it. See [Register a `.dot` Domain](/apps/register-dot-domain/).
- **Publish**: Optionally list your Product in the public Playground directory so others can discover it. Deploying without publishing keeps it reachable at its DotNS address but unlisted. See [List Your App](/apps/list-your-app/).
- **Deploy**: Upload the bundle to the Bulletin Chain and bind it to your name, so any Host can fetch and verify it directly.

If your Product includes a [smart contract](/apps/build/deploy-a-smart-contract/), the deploy flow can redeploy that too, covered in the contract prompt below.

## Prerequisites

Before deploying, ensure you have:

- Complete [Install Desktop and Pair](/apps/get-started/) and [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/); your account needs PAS funds and a Bulletin Chain authorization. If you have not obtained a Bulletin Chain authorization yet, request one from the [Bulletin Chain authorization page](https://paritytech.github.io/polkadot-bulletin-chain/authorizations)
- A Polkadot Product project running locally. See [Set Up Your Project](/apps/build/#set-up-your-project)

## Build Your App Bundle

Run `playground build` to compile your project into a deployable bundle.

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>playground build</span>
</div>

The CLI auto-detects your project type and runs the appropriate build. The output is a set of static files (HTML, JS, CSS, assets) that will be uploaded in the next step.

!!! tip
    If you have already built the project, you can skip this step. `playground deploy` will prompt you to reuse the existing build.

## Deploy Your App

Run `playground deploy` to start the interactive deploy flow. The CLI walks you through a series of prompts, then shows a confirmation summary before uploading.

<div class="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>playground deploy</span>
</div>

The CLI presents the following prompts in order:

1. **Review app detail page**: A reminder that your `README.md` becomes your app's detail page on the playground. Make sure it's up to date, then press ++enter++ to continue (or ++esc++ to exit and edit it first).

2. **Redeploy contracts if changed**: Smart contracts hold your app's on-chain logic and data, and deploy separately from your website. Choose **no** if you only changed the website. Choose **yes** if you changed contract code in this project. The CLI then redeploys and reinstalls the contracts and rebuilds the site to match. See [Add a Smart Contract to Your Product](/apps/build/deploy-a-smart-contract/) for the contract workflow in depth.

    <div class="termynal" data-termynal>
    <span data-ty><pre>  did you change your smart contracts?
      › no  ·  I only changed the website
        yes  ·  I changed contract code too</pre></span>
    </div>

3. **Choose to rebuild before deployment**: Compiles your latest code into the files that get uploaded. Choose **yes** to rebuild now, or **no** to redeploy the build that's already in your build folder.

    <div class="termynal" data-termynal>
    <span data-ty><pre>  build before deploy?
      › yes  ·  rebuild with my latest code
        no  ·  redeploy the existing build</pre></span>
    </div>

4. **Choose who signs the upload**: Publishing writes to the blockchain, which needs a signature. The **dev signer** uses a shared test account: instant, no phone needed. The **phone signer** signs with your own logged-in account, with a few taps on your phone.

    <div class="termynal" data-termynal>
    <span data-ty><pre>  who signs the upload?
      › dev signer  ·  fast, no phone needed
        your phone signer  ·  signs with your own account</pre></span>
    </div>

    !!! note "Your phone will prompt — check it"
        With the phone signer, each step waits for you to approve it in the Polkadot App, and there is no push notification announcing that a prompt is waiting. If the deploy appears to stall — including a deliberate pause while your name is registered — open the app and look for a pending approval. See the troubleshooting entries for [an unanswered phone prompt](/apps/troubleshooting/#the-app-seems-frozen-after-an-action) and [the registration pause](/apps/troubleshooting/#the-deploy-pauses-for-about-a-minute), and [Accounts and Signing](/apps/concepts/accounts/) for which account the phone signer uses.

5. **Choose a default build directory**:  The folder holding your built site (the files that get uploaded). The default `dist` fits most projects. This example uses `.next` for a Next.js app.

    <div class="termynal" data-termynal>
    <span data-ty><pre>  build directory  default: dist
      › .next█</pre></span>
    </div>

6. **Choose a domain name**: Pick the address people will use to reach your app. Enter the bare label, such as `myproject57`; the CLI appends the environment's TLD, so on Paseo Next v2 that becomes `myproject57.paseo`. Which names you may register depends on the **base length** (the label minus any two-digit suffix) and on whether that suffix is present:

    | Base length            | Two-digit suffix | Requirement                                          |
    |------------------------|------------------|------------------------------------------------------|
    | 9 characters or longer | Either           | Open to everyone — no personhood check                |
    | 6 to 8 characters      | Yes              | Requires Lite Proof of Personhood                     |
    | 6 to 8 characters      | No               | Requires Full Proof of Personhood                     |
    | 5 characters or fewer  | Either           | Reserved for governance                               |

    <div class="termynal" data-termynal>
    <span data-ty><pre>  domain
      › myproject57█</pre></span>
    </div>

    The label also has to be 3 to 63 lowercase characters (`a-z`, `0-9`, `-`), with no leading or trailing dash, and any trailing digit run must be exactly two digits that do not follow a dash. If registration is rejected, the name may already be [taken](/apps/troubleshooting/#the-name-is-already-registered) or [reserved for accounts with Proof of Personhood](/apps/troubleshooting/#the-name-requires-proof-of-personhood). See [Register a `.dot` Domain](/apps/register-dot-domain/#choose-a-name) for the full name rules.

7. **Publish to the playground**: Choose **yes** to list your app in the public Polkadot Playground so others can find and open it. Choose **no** to still deploy it to your DotNS address, but keep it unlisted.

    <div class="termynal" data-termynal>
    <span data-ty><pre>  publish to the playground?
      › yes  ·  list it in the public playground
        no  ·  deploy to my .paseo address only</pre></span>
    </div>

8. **Review confirmation summary**: The CLI shows a summary of your choices before uploading. Review it, then press ++enter++ to deploy (or ++esc++ to cancel). With the dev signer, no phone taps are needed and `phone approvals` reads `none`.

    <div class="termynal" data-termynal>
    <span data-ty><pre>  playground deploy  ·  myproject57.paseo  ·  paseo next v2        v0.47.0
      ────────────────────────────────────────────────────────────────────────<br>
      deploying myproject57.paseo<br>
      signer        Dev signer (no phone taps for upload)
      build         skip (use existing)
      build dir     .next
      contracts     skip
      publish       DotNS only<br>
      phone approvals none<br>
      enter to deploy  ·  esc to cancel</pre></span>
    </div>

    Press ++enter++ to confirm. The CLI then runs the upload and on-chain registration steps. If you chose the **phone signer**, each step triggers an approval prompt in the Polkadot mobile app — open the app and approve when prompted. With the **dev signer** selected here, the upload and DotNS registration run automatically with no phone prompts, and the deploy finalizes:

    <div class="termynal" data-termynal>
    <span data-ty><pre>  playground deploy  ·  myproject57.paseo  ·  paseo next v2        v0.47.0
      ────────────────────────────────────────────────────────────────────────<br>
      frontend<br>
      · build         skipped
      ✓ upload + dotns<br>
      ✓ deploy complete<br>
      url           https://myproject57.paseo.li
      domain        myproject57.paseo
      app cid       bafybeihvru3e6ojhopxj7xxwtafrpyvsha6kylzklryon5k67u4clr26re
      ipfs cid      bafybeigr2liqwftbmily4sdxvo7mq4atgboqsrpdadypmsbpkn7c25cwja</pre></span>
    </div>

## Open Your App

Once the deploy completes, the CLI prints the URLs for your app. Regardless of whether you published it to the playground, your app is live at its DotNS address and reachable through the web gateway, which appends `.li` to the full name:

```
https://myproject57.paseo.li
```

You can also navigate directly by entering your name in the [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/) browser address bar:

```
myproject57.paseo
```

![Successfully deployed app reachable at its DotNS URL](/images/apps/deploy-your-app/deploy-your-app-01.webp)

Either way, the app loads directly from the Bulletin Chain — no central server involved.

If you chose **yes** at the `publish to the playground?` prompt, your app is also listed in the public playground directory. Open `playground.dot` in Polkadot Desktop browser and your app appears under your name, so others can find and open it. If you chose **no** (`DotNS only`, as in this example), the app is still fully deployed and reachable at the URLs above — it just won't be listed in the directory.

!!! tip
    If your app does not appear immediately, wait a few seconds and refresh. On-chain state propagation can take a short time after the deploy transaction finalizes, and the web gateway resolves your name through an in-browser light client. A `curl` or script against the gateway URL returns a generic gateway shell rather than your app — open it in a real browser. If it still does not resolve, see [Troubleshooting](/apps/troubleshooting/#the-app-does-not-appear-right-after-deploy).

## Keep Your App Available

Data published to the Bulletin Chain, including your app bundle, is retained for about two weeks by default and must be renewed to persist beyond that. The exact retention window is still being finalized, so treat "about two weeks" as provisional. Renewal is a separate transaction that pushes the expiration forward without moving the data or changing its CID.

Renewal needs a bookkeeping handle from the original write: the `(block, index)` pair from the `Stored` event. That pair is captured at write time and cannot be cheaply recovered afterward, so record it when you publish.

!!! warning "The CLI deploy does not surface the renewal handle yet"
    `playground deploy` prints only the `app cid` and `ipfs cid`, not the block number and index that renewal needs, so a bundle deployed through the CLI has no captured renewal handle today. If your app must outlive the retention window, publish its data through the programmatic `CloudStorageClient.store(...).send()` path, which returns the `(block, index)` pair, and track it. See [Store Data on Chain](/apps/build/store-data-on-chain/) for the store receipt and renewal flow, and the [Bulletin Chain renewal reference](/reference/apps/infrastructure/bulletin-chain/renewal/) for the mechanics.

## If a Deploy Fails

Deploy-time issues have named fixes in [Troubleshooting](/apps/troubleshooting/):

- [The deploy pauses for about a minute](/apps/troubleshooting/#the-deploy-pauses-for-about-a-minute): the DotNS commit-reveal window, not a hang.
- [The name is already registered](/apps/troubleshooting/#the-name-is-already-registered) or [requires Proof of Personhood](/apps/troubleshooting/#the-name-requires-proof-of-personhood): choose a different or longer name.
- [`no allowance set for account`](/apps/troubleshooting/#no-allowance-set-for-account) or [uploads are rejected](/apps/troubleshooting/#uploads-are-rejected-or-host-storage-unavailable): the signing account is missing PAS or a storage authorization.
- [The app does not appear right after deploy](/apps/troubleshooting/#the-app-does-not-appear-right-after-deploy): on-chain propagation and gateway resolution take a moment.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Register a `.dot` Domain**

    ---

    The naming step in depth: availability rules, the commit-reveal flow, and managing your name.

    [:octicons-arrow-right-24: Register a `.dot` Domain](/apps/register-dot-domain/)

-   <span class="badge guide">Guide</span> **List Your App**

    ---

    Make your Product discoverable in the Playground and Browse directories.

    [:octicons-arrow-right-24: List Your App](/apps/list-your-app/)

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The store receipt, chunking, authorization, and the renewal handle in full.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

</div>

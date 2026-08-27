---
title: List Your App
description: List your published Polkadot Product in the Playground directory with the playground CLI, and understand how the Browse catalogue works.
categories: Apps
page_badges:
  tutorial_badge: Intermediate
---

# List Your App

## Introduction

Deploying makes your Product reachable at its DotNS address. Listing makes it _discoverable_: it puts your Product in a directory that users browse inside their Host, so people who have never heard your `.dot` name can still find and open it.

There are two discovery surfaces:

- **The Playground directory** (`playground.dot`): The directory the [`playground` CLI](/apps/quick-start/) publishes to. This is the path you use when you deploy with `playground deploy`.
- **[Browse](/reference/glossary/#browse)**: Polkadot's native discovery catalogue, surfaced in the App and Desktop dashboards. It is the broader destination for a Product that is ready for end users.

Both are catalogues of published Products surfaced inside the Hosts, and both store a minimal on-chain record while pulling display details from your name's [DotNS](/reference/apps/infrastructure/dotns/) metadata. They differ in the tooling that publishes to them, covered below.

## The Playground Directory

The Playground directory lives at `playground.dot`, which you open in the Polkadot Desktop browser. Listed Products appear under their DotNS name, and your Product's `README.md` becomes its detail page in the directory, so make sure it is up to date before you publish.

### List During Deploy

Listing is a choice you make during `playground deploy`. At the `publish to the playground?` prompt, choose **yes**:

<div class="termynal" data-termynal>
<span data-ty><pre>  publish to the playground?
    › yes  ·  list it in the public playground
      no  ·  deploy to my .paseo address only</pre></span>
</div>

Choosing **no** still deploys your Product to its DotNS address; it stays unlisted. To skip the prompt, pass the `--playground` flag:

```bash
playground deploy --domain my-product --playground
```

With the phone signer, publishing adds one more approval in the Polkadot App, for writing the listing to the Playground registry.

### Categorize the Listing

Pass `--tag` to file your Product under a category, which drives the tag filter in the playground app. Omit the flag and the CLI prompts you:

```bash
playground deploy --domain my-product --playground --tag gaming
```

An app carries at most one tag, and the accepted values are a fixed list: `site`, `social`, `chat`, `utility`, `gaming`, `marketplace`, and `irl`. There is no free-form tag, because a value outside this list still renders on your app's card but has no filter pill, making it effectively unfilterable.

### Keep a Listing Private

Pass `--private` (alongside `--playground`) to publish with owner-only visibility. The listing exists but only you see it, which is useful for staging a Product in the directory before you announce it. Unlike the other listing choices, this one is never prompted for — you have to pass the flag:

```bash
playground deploy --domain my-product --playground --private
```

### Let Others Fork Your Product

Pass `--moddable` (alongside `--playground`) to mark your Product as one others can clone, customize, and redeploy as their own. A moddable listing records your public repository as its source:

```bash
playground deploy --domain my-product --playground --moddable
```

The CLI reads your existing `origin` remote and records its URL in the Bulletin metadata. It never creates a repo or pushes for you, so set that up first. The deploy fails with an actionable message if `origin` is unset, points at a private repo, or points anywhere other than GitHub, because `pg mod` fetches source only from `codeload.github.com`:

```bash
git remote add origin https://github.com/<user>/<repo>
git push -u origin main
```

Anyone can then clone a moddable Product with `pg mod`:

```bash
pg mod my-product
```

`pg mod` copies a moddable Product from the Playground registry into a local project you can edit and redeploy under your own name. Omit the domain to open a picker showing every moddable Product. See the [Quick Start](/apps/quick-start/) for the full `pg mod` reference.

### Change or Remove a Listing

The listing choice is made at deploy time through the `publish to the playground?` prompt (or `--playground`). Redeploying re-runs that choice, so deploy again with your preferred option to update the listing state. The `playground` CLI does not currently expose a separate unlist command.

## Browse

[Browse](/reference/glossary/#browse) is Polkadot's native discovery catalogue: a curated directory surfaced inside the Host dashboards, and the destination for a Product once it is ready for end users. You saw its **Browse** section on the Polkadot Desktop dashboard after pairing.

### How a Browse Listing Works

Browse enforces who can list, on chain, so the directory stays tied to real ownership and real people:

- **Ownership**: You must own the DotNS name you are listing.
- **Proof of Personhood**: The listing account needs [Proof of Personhood](/reference/apps/infrastructure/pop/), Lite or Full. Personhood is obtained in the Polkadot App on your device.
- **Rate limits**: Listings are rate-limited per personhood tier over a rolling 24 hours — Lite accounts can publish one per day, Full accounts five per day.

A listing itself stores only a minimal on-chain record: a hash of the label, the publisher's address, and a timestamp. The display name, description, and icon are not stored in the listing; they are read from your name's DotNS manifest when the directory renders, so keeping your manifest current keeps your Browse card current.

### Publishing to Browse

Publishing into the on-chain Browse catalogue is handled by the Polkadot Community Foundation's deploy tooling (`pad`), which is separate from the `playground` CLI. The `playground` CLI publishes to the Playground directory described above, not to Browse. For the `pad` publish and unpublish flow, the personhood requirements, and the Browse contract details, see the [Polkadot Community Foundation developer documentation](https://docs.polkadotcommunity.foundation).

!!! note "Two toolchains, two directories"
    These docs standardize on the `playground` CLI, whose listing path is the Playground directory. Browse is populated by the Community Foundation's `pad` tooling. The two are separate publish mechanisms that share the same idea: a discovery directory of published Products surfaced inside the Hosts.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Deploy Your App**

    ---

    The full deploy flow, where the `publish to the playground?` choice is made.

    [:octicons-arrow-right-24: Deploy Your App](/apps/deploy-your-app/)

-   <span class="badge guide">Guide</span> **Register a `.dot` Domain**

    ---

    A listing points at your `.dot` name, so register one first.

    [:octicons-arrow-right-24: Register a `.dot` Domain](/apps/register-dot-domain/)

-   <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    The personhood tiers a Browse listing checks, and how they gate names and features.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/)

</div>

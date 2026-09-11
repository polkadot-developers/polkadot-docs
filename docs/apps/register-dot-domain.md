---
title: Register a .dot Domain
description: Register a .dot domain with dotNS, covering name rules, the commit-reveal flow, the three CLIs that can register a name, and managing your name.
categories: Apps
page_badges:
  tutorial_badge: Intermediate
---

# Register a `.dot` Domain

## Introduction

Every published Polkadot Product is reached by a dotNS name, such as `awesome.dot`. That name is registered with [dotNS](/reference/apps/infrastructure/dotns/), Polkadot's decentralized, on-chain name service. dotNS turns a human-readable name into the Product bundle it points at, and it is the lookup every Host runs when a user navigates to it.

--8<-- 'text/apps/network-tld.md'

The registry — names, owners, and the content record each name points at — lives as contract state on Asset Hub. Resolution runs `name → namehash → contenthash → CID`: the name hashes to a deterministic key, the record's `contenthash` points at your bundle's CID, and the Host fetches and content-verifies the bundle before loading it.

Registration happens on chain, so the rules below hold no matter which tool you use. Three CLIs can register a name: the [`playground` CLI](/apps/quick-start/) folds it into a deploy, while `pad` and the dotNS CLI let you drive it directly. This guide explains how to choose a name your account is allowed to register, the paths available to register one, and how to manage the name afterward. See [Ways to Register](#ways-to-register) to pick a path.

## Prerequisites

Before registering, ensure you have:

- Completed [Install Desktop and Pair](/apps/get-started/) and [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/); your account needs PAS to pay fees and any name deposit.
- One of the CLIs in [Ways to Register](#ways-to-register) installed. For the `playground` path that means `pg login` has paired it with your signer.
- A Product project ready to deploy. See [Deploy Your App](/apps/deploy-your-app/).

## Choose a Name

A name is a bare label plus the environment's TLD, as in `myproject57.paseo`. How you supply it depends on the tool: `playground` and `dotns` take the bare label and append the TLD for you, and reject a label that already carries a different one, while `pad` takes the full name.

### Label Rules

A label must satisfy all of these, or registration is rejected:

- **Length**: 3 to 63 characters.
- **Character set**: lowercase letters, digits, and dashes (`a-z`, `0-9`, `-`) only.
- **Dashes**: cannot start or end with a dash.
- **Digit suffix**: a trailing run of digits must be exactly two, or none at all. One trailing digit, or three or more, is rejected.
- **Dash before a digit suffix**: a two-digit suffix cannot follow a dash. Use `my-app42`, not `my-app-42`.

### Personhood Tiers

Which tier a name falls into depends on its _base length_, the label length minus any two-digit suffix, and on whether that suffix is present:

| Base length            | Two-digit suffix | Requirement                                          |
|------------------------|------------------|------------------------------------------------------|
| 9 characters or longer | Either           | Open to everyone — registers with no personhood check |
| 6 to 8 characters      | Yes              | Requires **Lite** Proof of Personhood                 |
| 6 to 8 characters      | No               | Requires **Full** Proof of Personhood                 |
| 5 characters or fewer  | Either           | Reserved for governance                               |

So `myproject57` (base `myproject`, 9 characters) is open to anyone, while `myproj` needs Full personhood and `myproj01` needs only Lite — adding a two-digit suffix lowers the tier a 6-to-8-character base demands. A short base stays reserved either way: `alice` and `alice01` both have a 5-character base.

Beyond the tier check, some open names carry a deposit that scales with length. See the [PopRules pricing reference](/reference/apps/infrastructure/dotns/poprules-pricing/) for the complete ladder and deposit formulas.

!!! note "Personhood and the network"
    Proof of Personhood is obtained in the Polkadot App on your device; there is no CLI path to a tier. If your account has no personhood status, pick a base name of 9 characters or more, which registers with no personhood check. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/) for how names, deposits, and personhood interact on TestNet.

## Ways to Register

Three CLIs register names against the same registry, so the name rules above apply identically to all of them. They differ in how much of the deploy they own:

|              Tool               |                            Best for                            |                             What it does                              |
|:-------------------------------:|:--------------------------------------------------------------:|:---------------------------------------------------------------------:|
| [`playground`](/apps/quick-start/) | Getting a first Product live, and hackathons | Registers the name as one step of an interactive `playground deploy` |
| `pad` | Scripted or CI deploys of a built bundle | Uploads to Bulletin, registers the name if needed, and writes the content record in one command |
| `dotns` | Managing names directly, independently of any deploy | Registration, lookups, content records, primary names, transfers, and subnames |

You do not have to pick one permanently. A name registered by any of them is an ordinary name owned by your account, and the others can operate on it afterward.

## Register with the `playground` CLI

When you run `playground deploy` and reach the `domain` prompt, enter the name you want:

<div class="termynal" data-termynal>
<span data-ty><pre>  domain
    › myproject57█</pre></span>
</div>

From there, the CLI registers the name on chain. If you deploy with the phone signer, each on-chain step is a separate approval in the Polkadot App, in this order:

1. **Reserve domain**: Submits a dotNS commitment for the name without revealing it in the clear.
2. **Finalize domain**: Claims the name for your account.
3. **Link content**: Points the name's `contenthash` at your uploaded bundle's CID, so the name now resolves to your Product.

!!! note "The ~60-second pause is expected"
    Between reserve and finalize, the deploy pauses for about 60 seconds. This is dotNS's commit-reveal window: the commitment is submitted first, then the name is claimed a short time later, so a watcher cannot see your desired name and race to register it ahead of you. The deploy is not stuck.

Names are first come, first served. If the CLI reports that a name is [already registered](/apps/troubleshooting/#the-name-is-already-registered), choose another; if it reports the name [requires Proof of Personhood](/apps/troubleshooting/#the-name-requires-proof-of-personhood), pick a longer base name or add a two-digit suffix. With the dev signer, these steps run without phone prompts; the deployed name is owned by the shared dev account rather than by you.

## Register with `pad`

[`polkadot-app-deploy`](https://github.com/paritytech/polkadot-app-deploy) publishes a built bundle and registers its name in a single command, which makes it the better fit for a scripted or CI deploy:

```bash
npm i -g @parity/polkadot-app-deploy
pad ./dist myproject57.dot --env devnet --mnemonic "$MNEMONIC"
```

`pad` uploads the bundle to the Bulletin Chain, skipping unchanged blocks on repeat deploys, registers the name if you do not already own it, and writes the content record on Asset Hub. A successful run ends with `Verified on-chain:` and the CID it published. Add `--publish` to also list the Product in the on-chain registry; that step is gated on Proof of Personhood and reports `NoPersonhood` without it, while the deploy itself still succeeds.

`pad` also has a `login` mode that signs with your Polkadot App instead of a local key. It does not read the dotNS keystore, so pass the key explicitly when you are not using `login`.

!!! warning "Keep the mnemonic out of your shell history"
    Pass the phrase through an environment variable, never as a literal on the command line, and never commit it. A deploy key that registers names controls them.

## Register with the dotNS CLI

The dotNS CLI registers a name on its own, with no bundle and no deploy involved — useful when you want to hold a name before the Product is ready, or manage names as a separate task:

```bash
npm i -g @parity/dotns-cli
dotns register domain -n myproject57 --env devnet
```

Registration runs the same commit-reveal handshake described above, so expect it to take several minutes: the commitment has to finalize, mature, and then be revealed. The CLI prints the tier and the price before the final step. Add `-r` to also set the name as your account's primary (reverse) record, or `--json` for machine-readable output.

Confirm the result on chain rather than trusting the printed output, and resume the handshake only if the owner is not your address:

```bash
dotns lookup owner-of myproject57 --env devnet
dotns register list --env devnet              # inspect cached commitments
dotns register retry myproject57 --env devnet
```

!!! note "Preset names select the network"
    `--env` picks a network preset that bundles the endpoints and registry addresses the tool needs; `devnet` is the preset for the community devnet. Preset names differ per tool and per network, so check the CLI's own list rather than assuming. See [Networks](/apps/concepts/networks/).

## Update the Bundle a Name Points At

Registration binds the name to your account once. Publishing a new version of your Product does not re-register the name; it updates the name's `contenthash` to the new CID. Every path handles this the same way — re-running against a name you already own skips the reservation steps, so later deploys need fewer approvals:

- **`playground`**: Re-run `playground deploy` against the same name.
- **`pad`**: Re-run the same command; it uploads only the changed blocks and rewrites the content record.
- **`dotns`**: Set the record directly with `dotns content set <name> <cid>` once you have the new CID.

Because a name's content record is mutable and the owner can transfer or repoint it, treat a name as a pointer rather than a permanent identity. Code that consumes another Product should verify the `contenthash` it resolves at use time, not assume a name maps to the same bundle forever.

## Manage Your Name

Everything past registration — transfers, subnames, primary names, and content records set outside a deploy — is the [dotNS CLI](/reference/apps/infrastructure/dotns/cli/)'s job. A deploy tool repoints the one name it just published; `dotns` operates on any name your account owns:

- **Transfer**: A dotNS name is owned by an Asset Hub account and can be transferred to another account with `dotns lookup transfer <name> --to <address>`. A transfer changes only the owner; the name and its current content record are unchanged, so users keep seeing the same bundle until the new owner updates it. Proof of Personhood status and any tier reservations do not transfer with the name. See the [transfer reference](/reference/apps/infrastructure/dotns/transfer/).
- **Content records**: `dotns content set <name> <cid>` points a name at a bundle outside a deploy, and `dotns content view <name>` reads back what it resolves to.
- **Primary name**: `dotns primary set <name>` makes one of your names the reverse record for your account, and `dotns primary status` reports the current one.
- **Subnames**: `dotns register subname` registers a subname under a name you already own.

!!! warning "These CLIs are still moving"
    `@parity/dotns-cli` is in active development and its per-command flags are still being finalized, and `pad` describes itself as a prototype reference implementation. Both work today, but treat the exact flags here as a snapshot and check `--help` before scripting against them. `pad` and `cdm` also require Node 22 or newer, and fail at startup on Node 20 with an unrelated-looking error.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Deploy Your App**

    ---

    The full deploy flow that registers your name and uploads your bundle in one pass.

    [:octicons-arrow-right-24: Deploy Your App](/apps/deploy-your-app/)

-   <span class="badge guide">Guide</span> **List Your App**

    ---

    Once your name resolves, list your Product so others can discover it.

    [:octicons-arrow-right-24: List Your App](/apps/list-your-app/)

-   <span class="badge learn">Learn</span> **dotNS Reference**

    ---

    The name mechanism, PopRules pricing, contract architecture, and transfer model in depth.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/)

</div>

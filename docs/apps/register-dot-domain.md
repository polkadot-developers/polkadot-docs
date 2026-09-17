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

The registry (names, owners, and the content record each name points at) lives as contract state on Polkadot Hub. Resolution runs `name → namehash → contenthash → CID`: the name hashes to a deterministic key, the record's `contenthash` points at your bundle's CID, and the Host fetches and content-verifies the bundle before loading it.

Registration happens on chain, so the name rules below hold whichever tool you use. Three CLIs can register a name: the [`playground` CLI](/apps/quick-start/) folds it into a deploy, `pad` publishes a built bundle and registers its name in one command, and the [dotNS CLI](/reference/apps/infrastructure/dotns/cli/) drives the registry directly. This guide explains how to choose a name your account is allowed to register, which path to take, and how to manage the name afterward.

## Prerequisites

Before registering, ensure you have:

- Completed [Install Desktop and Pair](/apps/get-started/) and [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/); your account needs PAS to pay fees and any name deposit.
- One of the CLIs in [Ways to Register](#ways-to-register) installed. On the `playground` path that means `pg login` has paired it with your signer.
- A Product project ready to deploy, if you are registering as part of a deploy with `playground` or `pad`. Registering with the dotNS CLI needs no bundle. See [Deploy Your App](/apps/deploy-your-app/).

## Choose a Name

A name is a bare label plus the network's TLD, as in `johnsmith57.paseo`. How you supply it depends on the tool: `playground` and the dotNS CLI take the bare label (`johnsmith57`) and append the TLD for you, rejecting a label that already carries a different one, while `pad` takes the full name.

### Label Rules

A label must satisfy all of these, or registration is rejected before anything is submitted on chain:

- **Length**: 3 to 63 characters.
- **Character set**: lowercase letters, digits, and dashes (`a-z`, `0-9`, `-`) only.
- **Dashes**: cannot start or end with a dash.
- **Digits**: allowed anywhere, in any quantity. A trailing run of digits no longer carries any special meaning.

!!! note "Out-of-date tooling is stricter"
    Releases built against the previous label rules cap a trailing run of digits at two and reject a longer one, which the chain no longer does. `@parity/dotns-cli` lifted the cap in `0.9.0`. If a label with three or more trailing digits is refused before anything is submitted on chain, update your tooling rather than changing the name.

### Personhood Tiers

Which tier a name falls into depends on its length, counted as written. Digits count like any other character:

| Length                 | Requirement                                              |
|------------------------|----------------------------------------------------------|
| 9 characters or longer | Open to everyone, with no personhood check               |
| 6 to 8 characters      | Requires Full Proof of Personhood                        |
| 5 characters or fewer  | Reserved for governance, not sold on this path           |

So `johnsmith57` is open to anyone because it is 11 characters, and so is `johnsmith` at exactly nine. `johnny` and `johnny01` both need full proof of personhood at six and eight characters, and `john` is not sold on this path at all at four. A device proof does not open that band: a device name such as `joseph.42` is earned through the personhood gateway and cannot be registered here. Adding digits no longer lowers the tier a name demands: it only makes the name longer, which can move it into the open band.

Every name this path admits pays the same refundable deposit, whatever its length. See the [PopRules and Pricing reference](/reference/apps/infrastructure/dotns/poprules-pricing/) for the bands and the deposit.

!!! note "Personhood and the network"
    Proof of Personhood is obtained in the Polkadot App on your device; there is no CLI path to a tier. If your account has no personhood status, pick a name of nine characters or more, which registers with no personhood check. A device or personhood name, such as `joseph.42`, is earned through the personhood gateway rather than registered here. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/) for how names, deposits, and personhood interact on TestNet.

## Ways to Register

All three CLIs write to the same registry, so the name rules above apply identically to each. They differ in how much of the deploy they own:

|                 Tool                  |                    Best for                     |                                      What it does                                       |
|:-------------------------------------:|:-----------------------------------------------:|:---------------------------------------------------------------------------------------:|
| [`playground`](/apps/quick-start/)    | A first Product, and hackathons                  | Registers the name as one step of an interactive `playground deploy`                     |
| `pad`                                 | Scripted or CI deploys of a built bundle         | Uploads the bundle, registers the name if needed, and writes the content record in one command |
| [`dotns`](/reference/apps/infrastructure/dotns/cli/) | Managing names on their own, with no deploy | Registration, lookups, content records, transfers, subnames, and escrow                  |

The choice is not permanent. A name registered by any of them is an ordinary name owned by your account, and the others operate on it afterward.

## Register with the `playground` CLI

When you run `playground deploy` and reach the `domain` prompt, enter the name you want:

<div class="termynal" data-termynal>
<span data-ty><pre>  domain
    › johnsmith57█</pre></span>
</div>

From there, the CLI registers the name on chain. If you deploy with the phone signer, each on-chain step is a separate approval in the Polkadot App, in this order:

1. **Reserve domain**: Submits a dotNS commitment for the name without revealing it in the clear.
2. **Finalize domain**: Claims the name for your account.
3. **Link content**: Points the name's `contenthash` at your uploaded bundle's CID, so the name now resolves to your Product.

!!! note "The ~60-second pause is expected"
    Between reserve and finalize, the deploy pauses for about 60 seconds. Most of that is the tooling waiting for the commitment to settle: the contract requires only that the commitment be six seconds old before the name is claimed. The two-step handshake is what stops a watcher seeing your desired name and racing to register it ahead of you. The deploy is not stuck.

!!! note "An abandoned commitment expires after a day"
    A commitment is valid for `MAX_COMMITMENT_AGE`, one day. If a deploy fails between reserve and finalize and you come back later than that, the commitment is no longer claimable and the handshake starts over from the beginning.

Names are first come, first served. If the CLI reports that a name is [already registered](/apps/troubleshooting/#the-name-is-already-registered), choose another; if it reports the name [requires Proof of Personhood](/apps/troubleshooting/#the-name-requires-proof-of-personhood), pick a longer name. With the dev signer, these steps run without phone prompts; the deployed name is owned by the shared dev account rather than by you.

## Register with `pad`

[`polkadot-app-deploy`](https://github.com/paritytech/polkadot-app-deploy) publishes a built bundle and registers its name in a single command, which suits a scripted or CI deploy:

```bash
npm i -g @parity/polkadot-app-deploy
pad ./dist johnsmith57.paseo --mnemonic "$MNEMONIC"
```

`pad` uploads the bundle to the Bulletin Chain, skipping unchanged blocks on repeat deploys, registers the name if you do not already own it, and writes the content record on Polkadot Hub. It also has a `login` mode: on TestNet a local worker registers the name and then transfers it to the signed-in account, so the deploy runs without phone taps unless you pass `--no-transfer-to-signedin-user`. `pad` does not read the dotNS keystore, so supply the key explicitly when you are not using `login`.

!!! warning "Keep the mnemonic out of your shell history"
    Pass the phrase through an environment variable, never as a literal on the command line, and never commit it. A deploy key that registers names controls them.

!!! note "Node 22 or newer"
    `pad` requires Node 22+ and fails at startup on older versions with an unrelated-looking error. It also describes itself as a prototype reference implementation, so check `pad --help` against the version you installed before scripting around it.

## Register with the dotNS CLI

The [dotNS CLI](/reference/apps/infrastructure/dotns/cli/) registers a name on its own, with no bundle and no deploy involved. Reach for it when you want to hold a name before the Product is ready, script a batch of names, or debug a registration that failed:

```bash
npm i -g @parity/dotns-cli
dotns register domain --help
```

Registration runs the same commit-reveal handshake described above, so expect a comparable pause whichever tool drives it. The CLI can also preview `PopRules` eligibility for a proposed name and account, showing the band and the deposit before you submit.

!!! warning "Check the flags against your version"
    The dotNS CLI's per-command flags are still being confirmed against the published package, which is why the [CLI reference](/reference/apps/infrastructure/dotns/cli/) lists command families rather than a flag table. Run `--help` on the version you installed rather than copying flags from elsewhere; the PCF publishes its own build of this tool under a different scope, and the two are not interchangeable.

## Update the Bundle a Name Points At

Registration binds the name to your account once. Publishing a new version of your Product does not re-register the name; it updates the name's `contenthash` to the new CID. Every path handles this the same way, and re-running against a name you already own skips the reservation steps, so later deploys need fewer approvals:

- **`playground`**: Re-run `playground deploy` against the same name.
- **`pad`**: Re-run the same command; it uploads only the changed blocks and rewrites the content record.
- **`dotns`**: Set the record directly with the CLI's `content set` command once you have the new CID.

Because a name's content record is mutable and the owner can transfer or repoint it, treat a name as a pointer rather than a permanent identity. Code that consumes another Product should verify the `contenthash` it resolves at use time, not assume a name maps to the same bundle forever.

## Manage Your Name

Everything past registration is the [dotNS CLI](/reference/apps/infrastructure/dotns/cli/)'s job. A deploy tool repoints the one name it just published; `dotns` operates on any name your account owns:

- **Transfer**: A name registered on this path is owned by a Polkadot Hub account and can be transferred to another account. A transfer changes only the owner; the name and its current content record are unchanged, so users keep seeing the same bundle until the new owner updates it. Proof of Personhood status and reservations do not transfer with the name. A device or personhood name cannot be transferred at all, and some moves carry a fee. See the [transfer reference](/reference/apps/infrastructure/dotns/transfer/).
- **Subnames**: The dotNS CLI can register subnames under a name you own.
- **Content records**: The dotNS CLI can view and set a name's content record outside a deploy.

!!! warning "These CLIs are still moving"
    `@parity/dotns-cli` is in active development with breaking changes expected between versions, and `pad` describes itself as a prototype reference implementation. Both work today; treat the commands here as a snapshot and confirm them with `--help` before depending on them in a pipeline.

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

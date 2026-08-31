---
title: Register a .dot Domain
description: Register a .dot domain with DotNS through the playground CLI, covering name rules, the commit-reveal flow, and managing your name.
categories: Apps
page_badges:
  tutorial_badge: Intermediate
---

# Register a `.dot` Domain

## Introduction

Every published Polkadot Product is reached by a DotNS name, such as `awesome.dot`. That name is registered with [DotNS](/reference/apps/infrastructure/dotns/), Polkadot's decentralized, on-chain name service. DotNS turns a human-readable name into the Product bundle it points at, and it is the lookup every Host runs when a user navigates to it.

--8<-- 'text/apps/network-tld.md'

The registry — names, owners, and the content record each name points at — lives as contract state on Asset Hub. Resolution runs `name → namehash → contenthash → CID`: the name hashes to a deterministic key, the record's `contenthash` points at your bundle's CID, and the Host fetches and content-verifies the bundle before loading it.

You do not register a name as a separate chore. The [`playground` CLI](/apps/quick-start/) registers it for you as part of `playground deploy`. This guide explains what happens during that step, how to choose a name that your account is allowed to register, and how to manage the name afterward.

## Prerequisites

Before registering, ensure you have:

- Completed [Install Desktop and Pair](/apps/get-started/) and [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/); your account needs PAS to pay fees and any name deposit.
- The [`playground` CLI](/apps/quick-start/) installed and paired with your signer (`pg login`).
- A Product project ready to deploy. See [Deploy Your App](/apps/deploy-your-app/).

## Choose a Name

Enter the bare label — `myproject57`, not `myproject57.paseo`. The CLI appends the environment's TLD for you, and a label that already carries a different TLD is rejected.

### Label Rules

A label must satisfy all of these, or `playground deploy` rejects it before submitting anything on chain:

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

## Register During Deploy

When you run `playground deploy` and reach the `domain` prompt, enter the name you want:

<div class="termynal" data-termynal>
<span data-ty><pre>  domain
    › myproject57█</pre></span>
</div>

From there, the CLI registers the name on chain. If you deploy with the phone signer, each on-chain step is a separate approval in the Polkadot App, in this order:

1. **Reserve domain**: Submits a DotNS commitment for the name without revealing it in the clear.
2. **Finalize domain**: Claims the name for your account.
3. **Link content**: Points the name's `contenthash` at your uploaded bundle's CID, so the name now resolves to your Product.

!!! note "The ~60-second pause is expected"
    Between reserve and finalize, the deploy pauses for about 60 seconds. This is DotNS's commit-reveal window: the commitment is submitted first, then the name is claimed a short time later, so a watcher cannot see your desired name and race to register it ahead of you. The deploy is not stuck.

Names are first come, first served. If the CLI reports that a name is [already registered](/apps/troubleshooting/#the-name-is-already-registered), choose another; if it reports the name [requires Proof of Personhood](/apps/troubleshooting/#the-name-requires-proof-of-personhood), pick a longer base name or add a two-digit suffix. With the dev signer, these steps run without phone prompts; the deployed name is owned by the shared dev account rather than by you.

## Update the Bundle a Name Points At

Registration binds the name to your account once. Publishing a new version of your Product does not re-register the name; it updates the name's `contenthash` to the new CID. Re-running `playground deploy` against a name you already own uploads the new build and repoints the name, so you skip the reservation steps and see fewer approvals on later deploys.

Because a name's content record is mutable and the owner can transfer or repoint it, treat a name as a pointer rather than a permanent identity. Code that consumes another Product should verify the `contenthash` it resolves at use time, not assume a name maps to the same bundle forever.

## Manage Your Name

The `playground` CLI covers the common path — registering and repointing a name as part of a deploy. For lower-level or scriptable operations, use the dedicated [`@parity/dotns-cli`](/reference/apps/infrastructure/dotns/cli/), which exposes DotNS management directly:

- **Transfer**: A DotNS name is owned by an Asset Hub account and can be transferred to another account. A transfer changes only the owner; the name and its current content record are unchanged, so users keep seeing the same bundle until the new owner updates it. Proof of Personhood status and any tier reservations do not transfer with the name. See the [transfer reference](/reference/apps/infrastructure/dotns/transfer/).
- **Subnames**: The DotNS CLI can register subnames under a name you own.
- **Content records**: The DotNS CLI can view and set a name's content record outside a deploy.

!!! warning "The DotNS CLI is provisional"
    `@parity/dotns-cli` is in active development, and its per-command flags are still being finalized. For most Products, registering and repointing through `playground deploy` is the supported path; reach for the DotNS CLI only when you need operations the deploy flow does not cover.

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

-   <span class="badge learn">Learn</span> **DotNS Reference**

    ---

    The name mechanism, PopRules pricing, contract architecture, and transfer model in depth.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/)

</div>

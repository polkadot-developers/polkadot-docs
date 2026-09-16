---
title: dotNS Reference
description: Reference for dotNS, the .dot name system on Polkadot Hub that resolves Product names to published bundles, with PopRules eligibility and contract architecture.
categories: Apps, Reference
---

# dotNS

## Introduction

dotNS is Polkadot's decentralized name service for Products — the registry that turns a human-readable `.dot` name like `awesome.dot` into the published Polkadot Product it points at. It's the lookup every Host runs whenever a user navigates to a `.dot` address.

If you have used a DNS provider, the role is similar: human-readable names map to content. dotNS exists for the guarantees DNS lacks. A name belongs to its holder alone, with no registry operator able to suspend or transfer it, and it resolves wherever the chain is reachable, with no server in the path. Resolution returns a [Content Identifier (CID)](/reference/glossary/#content-identifier-cid) for a Product bundle rather than an IP address. And eligibility for the shorter names is tied to [Proof of Personhood](/reference/apps/infrastructure/pop/), so short, human-scale names go to people rather than to whoever arrives first with the most capital.

Four properties shape how a Product developer interacts with dotNS:

- **The registry lives on Polkadot Hub**: Names, owners, and the content references they point at are stored as contract state on Polkadot Hub.
- **Name resolution is content-addressed at the end**: A `.dot` name resolves to a CID, and the CID points at bytes on the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/) (or via an IPFS gateway). See [Name Mechanism](/reference/apps/infrastructure/dotns/name-mechanism/).
- **Eligibility is personhood-gated by PopRules**: A name's length places it in a band. Six to eight characters requires full proof of personhood on the public path. Five or fewer is not sold there at all. Every name the public path admits pays the same refundable deposit, so personhood gates who may register rather than what it costs. See [PopRules and Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/).
- **The architecture is a small set of cooperating contracts**: Not a single registrar — a set of contracts each handling a slice of the model. See [Architecture](/reference/apps/infrastructure/dotns/architecture/).

For the Product-side how-to (registering a name, publishing your bundle), see [Register and Publish](/apps/deploy-your-app/).

## One Deployment per Network

dotNS is deployed separately on each network, and three things follow from that.

- **The TLD is set at deploy time**: Each network's registry carries one TLD. A TestNet uses its own, so a name reads `awesome.paseo` on Paseo, and the planned Polkadot deployment uses `.dot`. Tools take the bare label and append the TLD of the environment they target, so a label carrying a different TLD is rejected rather than translated.
- **The deposit is the network's native token**: A registration costs 10 units of whatever the chain uses, so 10 PAS on Paseo. See [PopRules and Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/).
- **Registrations do not cross networks**: Each deployment keeps its own registry, so holding a name on a TestNet grants no claim to the matching name on Polkadot. A name has to be registered on each network where it is needed.

The deployments have different operators. Parity runs dotNS on the TestNets, including Paseo, and the planned deployment on Polkadot will be run by the [Polkadot Community Foundation](https://docs.polkadotcommunity.foundation/). The contracts are the same, but each operator configures its own deployment, so governance-set values such as the deposit amount need not match between them.

!!! note "Scope"
    This reference covers the developer-facing surface. Operator-side procedures, such as migration, batch updates, and contract upgrade paths, are outside it.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Name Mechanism**

    ---

    How a `.dot` name resolves to a Product bundle — `namehash` derivation, the `contenthash` → CID mapping, and the IPFS/Bulletin delivery path.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/name-mechanism/)

- <span class="badge learn">Learn</span> **Architecture**

    ---

    The contract architecture on Polkadot Hub that backs the registry: what each contract is responsible for and how they cooperate.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/architecture/)

- <span class="badge learn">Learn</span> **PopRules and Pricing**

    ---

    Which length band a name falls in, who may register it, and what the deposit is.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/poprules-pricing/)

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The Product-side how-to: registering a `.dot` name, attaching your published Product bundle, and going live.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-your-app/)
</div>

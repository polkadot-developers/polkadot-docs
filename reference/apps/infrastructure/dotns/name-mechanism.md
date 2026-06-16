---
title: The .dot Name Mechanism
description: How a .dot name resolves to a Polkadot Product — namehash derivation, contenthash to CID mapping, and the IPFS gateway and Bulletin Chain delivery path.
categories: Apps, Reference
---

# The `.dot` Name Mechanism

## Introduction

A `.dot` name is the front door a user enters to reach a Polkadot Product. Behind that front door, four layers cooperate to turn the name a user typed into the bytes a Host loads into its sandbox:

1. The dotNS registry on Asset Hub.
2. A `namehash` derivation that turns the string name into a deterministic key.
3. A `contenthash` record that points the `namehash` at a content reference.
4. A delivery layer (IPFS gateway, or Bulletin Chain peer-to-peer) that turns the content reference into bytes.

This page documents each of those layers so a Product developer knows what each one is doing and where to look when something doesn't resolve correctly.

## Layer 1: The Registry on Asset Hub

The registry of names — who owns `myproduct.dot`, when the registration was last updated, what record is currently attached — lives in contract state on Asset Hub, not on the People Chain or Bulletin Chain. Asset Hub is the natural home: it is Polkadot's system chain for asset and registry primitives, and dotNS is implemented as a set of contracts on it (see [Architecture](/reference/apps/infrastructure/dotns/architecture/)).

A registration creates a record; a transfer or update modifies it. A resolver reading the registry asks Asset Hub for the current state of a specific name and gets back the records associated with it, including the `contenthash` that points at the Product bundle.

## Layer 2: Namehash Derivation

`.dot` uses an ENS-compatible `namehash` scheme to derive a deterministic key from the dotted name. For example, the name `myproduct.dot` is hashed in a recursive way (hash of `dot`, then hash of `(parent_hash, label_hash)`, where `label_hash` is the keccak hash of the label `myproduct`). The result is a fixed-size hash that the registry uses internally as the lookup key.

This is the same scheme ENS uses for `.eth`, which is intentional — the derivation is well-understood, well-tooled, and lets dotNS interoperate with the existing `namehash` ecosystem.

## Layer 3: `contenthash` → CID

Each name's record carries a `contenthash` field that points at the Product bundle. The format follows the ENS `contenthash` codec, which can encode:

- **An IPFS CID (with the appropriate codec prefix)**: The canonical pointer for content-addressed bundles.
- **A Bulletin Chain CID**: Polkadot-native content references, used the same way.

The `contenthash` is what changes when a Product publishes a new version: the name stays the same, the `contenthash` updates to point at the new CID. Old `contenthash` references can be retained for rollback or audit, depending on how the operator manages the registration.

## Layer 4: Delivery (IPFS Gateway or Bulletin Peer-to-Peer)

Once a resolver has the CID, the bytes still need to actually be fetched and handed to the Host. Two delivery paths:

- **IPFS gateway**: The CID is a standard IPFS reference; any IPFS gateway can serve it. Hosts can use a gateway integration for the fetch.
- **Bulletin Chain peer-to-peer**: For Bulletin CIDs, the chain's collator network serves the bytes peer-to-peer without going through a centralized gateway. This is the Polkadot-native path.

Both paths produce the same bytes, because both are addressing the same content by the same hash. A Host can fall back from one to the other if one path fails, or prefer one for policy reasons (e.g. always Bulletin peer-to-peer when available, to avoid a third-party gateway).

## End-to-End Resolution

Stitching the four layers together, a typical resolution looks like this:

1. A user navigates to `myproduct.dot` in a Host (Polkadot Web at `dot.li`, or Polkadot Desktop's address bar).
2. The Host computes the `namehash` of `myproduct.dot`.
3. The Host reads the contract record for that `namehash` from Asset Hub and extracts the `contenthash`.
4. The Host decodes the `contenthash` into a CID.
5. The Host fetches the bytes for the CID via the configured delivery path.
6. The Host validates the bytes against the CID (content-addressed verification) and loads them into the sandbox.

A failure at any layer surfaces as a specific shield-state transition in the Host UI (see [Shield States](/reference/apps/hosts/polkadot-web/shield-states/)) — for example, a stale-cache CID that no longer matches the current `contenthash` will show as an out-of-sync state.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Architecture**

    ---

    The contract architecture on Asset Hub that backs the registry layer above.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/architecture/)

- <span class="badge learn">Learn</span> **PopRules and Pricing**

    ---

    Who can register what name, and at what cost, before the resolution flow above ever runs.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/poprules-pricing/)

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The Product-side how-to for creating a name record and attaching a `contenthash`.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-and-publish/register-and-publish/)
</div>

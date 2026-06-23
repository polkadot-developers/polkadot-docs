---
title: pallet-game Reference
description: The PoP pallet for personhood-gated on-chain games and randomized selection — fair-draw mechanics that rely on Ring-VRF aliases for unique participation.
categories: Apps, Reference
---

# `pallet-game`

## Introduction

`pallet-game` is the Proof of Personhood pallet for personhood-gated on-chain games and randomized selection flows. Its core property is _fair participation_: when the pallet selects from a set of entrants, it can guarantee each real person has exactly one entry, regardless of how many accounts they control — because the entrants are scoped by alias, not by account address.

Typical use cases include lottery-style draws, raffles, one-person-one-entry contests, randomized airdrops, and any flow where "one entry per real human" is part of the fairness contract.

!!! warning "Provisional"
    The exact dispatch surface of `pallet-game` — extrinsics, parameter shapes, storage layout, supported game types, and its integration with the forthcoming `pallet-airdrop` — is still being finalized. This page documents the conceptual responsibilities; the per-extrinsic reference will be added once the surface confirms.

## What the Pallet Guarantees

Three properties the pallet enforces:

- **One entry per alias**: When a user enters under their per-game alias (resolved via `under_alias`), the pallet stores the alias. A second entry from the same user produces the same alias and is rejected or replaces the first, depending on the game's mode.
- **Verifiable randomness for selection**: When the pallet selects a winner (or a set of winners), the randomness is sourced from a verifiable source — a block hash, a VRF output, a beacon — that an external party can later check. The selection is not chosen by a privileged operator after the fact.
- **Account unlinkability for state**: The pallet's storage maps from alias to game-side state. The state cannot be linked back to a specific user account without that user's own cooperation.

## What a Product Uses It For

A Product can dispatch into `pallet-game` to:

- Register entries in a game on behalf of the current user — a call wrapped in `under_alias` so the pallet sees the alias.
- Read game state — current entrant count, current prize pool, outcome of a completed draw — through the standard chain client surface.
- Subscribe to outcomes when a game completes, so the Product UI can react in real time.

A Product does _not_ run the game itself; the pallet does. The Product is the UI that lets users enter and see results.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **pallet-people**

    ---

    The foundational pallet that issues the aliases this pallet keys on.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/pallet-people/)

- <span class="badge learn">Learn</span> **TrUAPI Entropy**

    ---

    The verifiable-randomness primitives that pair with `pallet-game` when a Product also wants its own randomness on the same chain state. *(Reference page forthcoming.)*

</div>

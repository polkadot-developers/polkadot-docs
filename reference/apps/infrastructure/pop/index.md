---
title: Proof of Personhood Reference
description: Reference for Polkadot's Proof of Personhood infrastructure — Ring-VRF and aliases, plus per-pallet documentation for the pallets that gate logic on personhood.
categories: Apps, Reference
---

# Proof of Personhood

## Introduction

**Proof of Personhood (PoP)** is Polkadot's privacy-preserving "real human" check, anchored on the People Chain. A user completes PoP once (in the Polkadot App); from then on, a single proof unlocks features that gate on personhood — the TestNet faucet, short `.dot` names, alias-gated checks inside a Polkadot Product, on-chain payments routed through personhood-aware pallets.

For a Product developer, PoP shows up in two places:

- **As a primitive a Product calls into.** Through [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank} a Product requests an alias for the current user, has the user prove control of that alias against a challenge, and gates features on the result. The Polkadot App is where the proving happens; the Product never sees the underlying biometric or the user's identity record.
- **As a runtime origin a Product dispatches under.** Polkadot's PoP pallets accept calls under the `under_alias` origin, so a Product can submit on-chain operations that resolve to the user's alias inside the called pallet — pallet state stays unlinkable to the underlying account.

This reference is organized into two halves: the **mechanism** (Ring-VRF, aliases, the unlinkability property, how `under_alias` works) on its own page, and **per-pallet reference** for the pallets a Product is most likely to dispatch into.

## The Mechanism

[Ring-VRF and Aliases](/reference/apps/infrastructure/pop/ring-vrf-and-aliases/) is the conceptual deep dive: how the PoP cryptography produces unlinkable per-Product aliases, what `under_alias` is at the runtime layer, and the privacy property the whole stack delivers.

## The Pallets

| Pallet | What It Covers |
|---|---|
| [pallet-people](/reference/apps/infrastructure/pop/pallet-people/) | Personhood registration, alias-issuing, and the `under_alias` runtime origin. The foundational pallet the rest of the set depends on. |
| [pallet-game](/reference/apps/infrastructure/pop/pallet-game/) | Personhood-gated on-chain games and randomized selection flows. |
| [pallet-score](/reference/apps/infrastructure/pop/pallet-score/) | Personhood-anchored reputation and scoring primitives. |
| [pallet-identity](/reference/apps/infrastructure/pop/pallet-identity/) | The identity record on People Chain associated with a PoP account. |
| [pallet-ubc](/reference/apps/infrastructure/pop/pallet-ubc/) | Universal Basic Capacity — the per-person on-chain capacity primitives. |
| [pallet-coinage](/reference/apps/infrastructure/pop/pallet-coinage/) | The personhood-aware peer-to-peer payment surface behind the App's Coinage feature. |

For the Product-side how-to consuming these pallets, see [Use Personhood in Your App](/apps/build/use-personhood-in-your-app/){target=\_blank}.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Ring-VRF and Aliases**

    ---

    The cryptographic and runtime mechanism — how PoP produces unlinkable per-Product aliases, what `under_alias` is, and the privacy property the whole stack delivers.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/ring-vrf-and-aliases/)

- <span class="badge learn">Learn</span> **pallet-people**

    ---

    The foundational pallet of the PoP set — registration, alias-issuing, and the `under_alias` runtime origin.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/pallet-people/)

- <span class="badge guide">Guide</span> **Use Personhood in Your App**

    ---

    The Product-side how-to for alias-gated checks and `under_alias` dispatch.

    [:octicons-arrow-right-24: Get Started](/apps/build/use-personhood-in-your-app/){target=\_blank}

</div>

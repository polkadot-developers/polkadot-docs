---
title: PopRules and dotNS Pricing
description: The pricing ladder for .dot name registration — who can register what name length at what cost, organized by PoP tier and suffix shape.
categories: Apps, Reference
---

# PopRules and Pricing

## Introduction

dotNS uses a scarcity ladder for `.dot` name registration. The shortest, most-premium names are reserved for governance or free to personhood holders; longer names are open to anyone for a deposit. The mechanism that enforces "free for personhood holders" is `PopRules` — the contract that evaluates a proposed registration against the registering account's PoP status and the requested name's length and suffix shape.

This page documents the ladder, the two PoP tiers `PopRules` recognizes, and the deposit formulas for open-tier registrations.

## The Two PoP Tiers

`PopRules` recognizes two personhood tiers, registered separately on the People Chain:

- **PoP Full**: Cryptographically proven personhood, the destination state. The user completes the full biometric verification flow in the Polkadot App; their key joins the active membership ring on the People Chain. PoP Full holders can generate zero-knowledge proofs of personhood. See the [Proof of Personhood reference](/reference/apps/hosts/polkadot-app/pop/) for details.
- **PoP Lite**: Third-party attestation. An authorized attester submits an on-chain attestation that an account belongs to a real user; the account is registered against a separate `lite-people` ring. Lite supply is bounded by governance — it is the on-ramp; Full is the destination.

Both tiers qualify for free name registration, but at different name-length tiers.

!!! note "Self-declared PoP tier"
    dotNS reads PoP tier from a status the user sets themselves. On-chain verification against the People Chain is a forthcoming integration; until that ships, treat the tier check as cooperative, not adversarial.

## The Pricing Ladder

| Name format                                     | Who can register         | Deposit                                 |
|:------------------------------------------------|:-------------------------|:----------------------------------------|
| ≤5 chars                                        | Governance only          | —                                       |
| 6–8 chars (no numeric suffix)                   | PoP Full holders         | Free                                    |
| 6–8 chars + 2-digit suffix (e.g. `alice01`)     | PoP Lite or Full holders | Free                                    |
| 9–14 chars (no numeric suffix)                  | PoP Full holders         | Free                                    |
| 9–14 chars + 2-digit suffix (e.g. `acmecorp01`) | Anyone                   | `startingPrice × (15 − nameLength)` DOT |
| 15+ chars                                       | Anyone                   | `startingPrice / 2` DOT                 |

Two patterns explain the ladder:

- **Premium = short and unmarked**: A 6–8-character name with no numeric suffix is the most valuable shape; `PopRules` reserves it for PoP Full. A 6–8-character name with a 2-digit suffix is the next tier down; both PoP tiers can register one. Beyond that, the ladder opens up.
- **Anyone can buy length**: A 9–14-character name with a numeric suffix is open to anyone for a sliding-scale deposit; the longer the name, the smaller the deposit. A 15+-character name uses a fixed half-`startingPrice` deposit.

## Lite → Full Migration Reservation

When a PoP Lite holder registers a Lite-tier name (6–8 chars with suffix, or longer), dotNS reserves the matching no-suffix base name for them for 12 weeks. If the Lite holder upgrades to PoP Full within that window, they can claim the base name without contention — without the reservation, by the time they upgraded, someone else might have grabbed the unsuffixed name and they would have lost their identity continuity.

The reservation is automatic. A PoP Lite holder registering `alice01.dot` reserves `alice.dot` for themselves for 12 weeks; if they upgrade to Full in that window, `alice.dot` is claimable.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    Where the `PopRules` contract reads the PoP tier from — the App-side mechanism that produces Full and Lite registrations.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/pop/)

- <span class="badge guide">Guide</span> **Register and Publish**

    ---

    The Product-side how-to that consumes the PopRules check — registering a `.dot` name and seeing the deposit or free-tier outcome.

    [:octicons-arrow-right-24: Get Started](/apps/deploy-your-app/)
</div>

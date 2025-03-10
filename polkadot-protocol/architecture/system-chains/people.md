---
title: People Chain
description: Learn how People chain secures decentralized identity management, empowering users to control and verify digital identities without central authorities.
---

# People Chain

## Introduction

People chain is a specialized parachain within the Polkadot ecosystem dedicated to secure, decentralized identity management. 

This solution empowers users to create, control, and verify their digital identities without reliance on centralized authorities. By prioritizing user sovereignty and data privacy, People chain establishes a foundation for trusted interactions throughout the Polkadot ecosystem while returning control of personal information to individuals.

## Identity Management System

People chain provides a comprehensive identity framework allowing users to:

- Establish verifiable on-chain identities
- Control disclosure of personal information
- Receive verification from trusted registrars
- Link multiple accounts under a unified identity

Users must reserve funds in a bond to store their information on chain. These funds are locked, not spent, and returned when the identity is cleared.

### Sub-Identities

The platform supports hierarchical identity structures through sub-accounts:

- Primary accounts can establish up to 100 linked sub-accounts
- Each sub-account maintains its own distinct identity
- All sub-accounts require a separate bond deposit

## Verification Process

### Judgment Requests

After establishing an on-chain identity, users can request verification from [registrars](#registrars):

1. Users specify the maximum fee they're willing to pay for judgment
2. Only registrars whose fees fall below this threshold can provide verification
3. Registrars assess the provided information and issue a judgment

### Judgment Classifications

Registrars can assign the following confidence levels to identity information:

- **Unknown** - default status; no judgment rendered yet
- **Reasonable** - data appears valid but without formal verification (standard for most verified identities)
- **Known good** - information certified correct through formal verification (requires documentation; limited to registrars)
- **Out of date** - previously verified information that requires updating
- **Low quality** - imprecise information requiring correction
- **Erroneous** - incorrect information, potentially indicating fraudulent intent

A temporary "Fee Paid" status indicates judgment in progress. Both "Fee Paid" and "Erroneous" statuses lock identity information from modification until resolved.

### Registrars

Registrars serve as trusted verification authorities within the People chain ecosystem. These entities validate user identities and provide attestations that build trust in the network.

- Registrars set specific fees for their verification services
- They can specialize in verifying particular identity fields
- Verification costs vary based on complexity and thoroughness

When requesting verification, users specify their maximum acceptable fee. Only registrars whose fees fall below this threshold can provide judgment. Upon completing the verification process, the user pays the registrar's fee, and the registrar issues an appropriate confidence level classification based on their assessment.

Multiple registrars operate across the Polkadot and People chain ecosystems, each with unique specializations and fee structures. To request verification:

1. Research available registrars and their verification requirements
2. Contact your chosen registrar directly through their specified channels
3. Submit required documentation according to their verification process
4. Pay the associated verification fee

You must contact specific registrars individually to request judgment. Each registrar maintains its own verification procedures and communication channels.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Polkadot.js Guides about Identity__

    ---

    Step-by-step instructions for managing identities through the Polkadot.js interface, with practical examples and visual guides.

    [:octicons-arrow-right-24: Reference](https://wiki.polkadot.network/docs/learn-guides-identity)

-   <span class="badge external">External</span> __How to Set and Clear an Identity__

    ---

    Practical walkthrough covering identity setup and removal process on People chain.

    [:octicons-arrow-right-24: Reference](https://support.polkadot.network/support/solutions/articles/65000181981-how-to-set-and-clear-an-identity)

-   <span class="badge external">External</span> __People Chain Runtime Implementation__

    ---

    Source code for the People chain runtime, detailing the technical architecture of decentralized identity management.

    [:octicons-arrow-right-24: Reference](https://github.com/polkadot-fellows/runtimes/tree/main/system-parachains/people)

</div>
---
title: XCMv5
description: Learn about XCM version 5.
---

# XCMv5

The latest iteration of XCM is version 5.
Changes to the standard are managed by the [Polkadot Technical Fellowship RFCs](https://github.com/polkadot-fellows/RFCs/).
The main RFCs defining the changes in version 5 are the following:

- [Legacy #37 - SetAssetClaimer](https://github.com/polkadot-fellows/xcm-format/blob/master/proposals/0037-custom-asset-claimer.md)

- [Legacy #38 - ExecuteWithOrigin](https://github.com/polkadot-fellows/xcm-format/blob/master/proposals/0038-execute-with-origin.md)

- [#100 - InitiateTransfer instruction](https://github.com/polkadot-fellows/RFCs/pull/100)

- [#101 - Remove weight from Transact](https://github.com/polkadot-fellows/RFCs/pull/101)

- [#105 - Improved fee mechanism](https://github.com/polkadot-fellows/RFCs/pull/105)

- [#107 - Execution hints](https://github.com/polkadot-fellows/RFCs/pull/107)

- [#108 - Remove testnet network ids](https://github.com/polkadot-fellows/RFCs/pull/108)

- [#122 - InitiateTransfer origin preservation](https://github.com/polkadot-fellows/RFCs/pull/122)

??? note "What are legacy RFCs?"

    The first two RFCs are legacy ones from when XCM RFCs were separate from the Polkadot Technical Fellowship RFCs.
    As part of the XCMv5 specification, these two were combined since the Polkadot Technical Fellowship Manifesto
    specifies XCM as part of its mandate.

## Why?

Version 5 addresses key pain points that developers faced in previous versions:

### Before

- Cross-chain transfers were limited to only one transfer type, requiring multiple XCMs
- Fee management across multiple hops was extremely complicated to get right, particularly because of delivery fees
- Cross-chain transfers cleared the origin, making it impossible to `Transact`
- Claiming trapped assets when transfers failed was troublesome, requiring governance to intervene most of the time
- Having to specify the weight for `Transact` was really brittle

### After

- A unified cross-chain transfer instruction handles all possible transfer types and allows multiple ones in the same XCM
- The fee payment mechanism has been standardized to handle multiple types of fees, making fees much more predictable
- It's now possible to preserve the origin during a cross-chain transfer, enabling the use of `Transact`
- A custom asset claimer can be set, reducing the need for governance to intervene for claiming trapped assets
- `Transact` no longer needs to specify the weight of the call

This section aims to give you all the changes in this new version you need to make the most of the latest
and greatest in cross-chain interactions.

We'll be using [Polkadot-API (PAPI)](/develop/toolkit/api-libraries/papi) throughout these docs to write XCMs.
This is a low-level library that can interact with Polkadot SDK chains via the JSON-RPC protocol and read its
metadata to provide a type-safe API for developers.

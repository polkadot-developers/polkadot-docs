---
title: XCMv5
description: Learn about XCM version 5.
---

# XCMv5

The latest iteration of XCM is version 5.
The main RFCs defining the changes in version 5 are the following:

- [Legacy #37 - SetAssetClaimer](https://github.com/polkadot-fellows/xcm-format/blob/master/proposals/0037-custom-asset-claimer.md){target=\_blank}

- [Legacy #38 - ExecuteWithOrigin](https://github.com/polkadot-fellows/xcm-format/blob/master/proposals/0038-execute-with-origin.md){target=\_blank}

- [#100 - InitiateTransfer instruction](https://github.com/polkadot-fellows/RFCs/pull/100){target=\_blank}

- [#101 - Remove weight from Transact](https://github.com/polkadot-fellows/RFCs/pull/101){target=\_blank}

- [#105 - Improved fee mechanism](https://github.com/polkadot-fellows/RFCs/pull/105){target=\_blank}

- [#107 - Execution hints](https://github.com/polkadot-fellows/RFCs/pull/107){target=\_blank}

- [#108 - Remove testnet network ids](https://github.com/polkadot-fellows/RFCs/pull/108){target=\_blank}

- [#122 - InitiateTransfer origin preservation](https://github.com/polkadot-fellows/RFCs/pull/122){target=\_blank}

??? note "What are legacy RFCs?"

    The first two RFCs are legacy ones from when XCM RFCs were separate from the Polkadot Technical Fellowship RFCs.
    As part of the XCMv5 specification, these two were combined since the Polkadot Technical Fellowship Manifesto
    specifies XCM as part of its mandate.

Version 5 addresses key pain points that developers faced in previous versions:

- Before
    - Cross-chain transfers were limited to only one transfer type, requiring multiple different XCMs to send the entirety of the tokens
    - Fee management across multiple hops was extremely complicated to get right, particularly because of delivery fees
    - Cross-chain transfers cleared the origin, making it impossible to [`Transact`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v4/enum.Instruction.html#variant.Transact) in the same XCM as a transfer
    - Claiming trapped assets when transfers failed was troublesome, most of the time requiring governance to intervene
    - Having to specify the weight for `Transact` was really brittle
- After
    - A unified cross-chain transfer instruction handles all possible transfer types and allows multiple ones in the same XCM
    - The fee payment mechanism has been standardized to handle multiple types of fees, making fees much more predictable
    - It's now possible to preserve the origin during a cross-chain transfer, enabling the use of `Transact` in the same XCM as the transfer
    - A custom asset claimer can be set, reducing the need for governance to intervene for claiming trapped assets
    - `Transact` no longer needs to specify the weight of the call, reducing the errors in cross-chain interactions

This section aims to give you all the changes in this new version you need to make the most of the latest and greatest in cross-chain interactions.

These guides use [Polkadot-API (PAPI)](/develop/toolkit/api-libraries/papi) to write XCMs.
This is a low-level library that can interact with Polkadot SDK chains via the JSON-RPC protocol and read its metadata to provide a type-safe API for developers.

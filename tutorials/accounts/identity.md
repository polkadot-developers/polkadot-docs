---
title: Identity
description: This section contains guides that explain how to manage identity on the Polkadot network. Learn how to interact with the Polkadot network by doing different operations with your identity.
---

# Identity Guide

## Setting an Identity

Users can set an identity by registering through default fields such as legal name, display name, website, Twitter handle, Riot handle, etc. along with some extra, custom fields for which they would like attestations.

For further information about the setting and clearing of identity, refer to the [How to Set and Clear an Identity](https://support.polkadot.network/support/solutions/articles/65000181981-how-to-set-and-clear-an-identity){target=\_blank} guide on the Polkadot support page.

!!! note
    Note the following caveat: because the fields support different formats, from raw bytes to various hashes, a UI has no way of telling how to encode a given field it encounters. The Polkadot.Js UI currently encodes the raw bytes it encounters as UTF-8 strings, which makes these values readable on-screen. However, given that there are no restrictions on the values that can be placed into these fields, a different UI may interpret them as, for example, IPFS hashes or encoded bitmaps. This means any field stored as raw bytes will become unreadable by that specific UI. As field standards crystallize, things will become easier to use, but for now, every custom implementation of displaying user information will likely have to make a conscious decision on the approach to take or support multiple formats and then attempt multiple encodings until the output makes sense.

## Request Judgement

In the Polkadot network, users can request judgement on their identity. This process involves submitting a judgement request to the registrar, who will then decide whether to accept or reject the request.

To request judgement, follow these steps:

1. In the Extrinsic section of the Polkadot.Js user interface, make the judgement request:
      1. Select the **identity** pallet
      2. Choose the **requestJudgement** extrinsic
      3. Fill in the required fields
         1. **registrarIndex**: The index of the registrar to whom the judgement request is being made
         2. **maxFee**: The maximum fee the user is willing to pay for the judgement request
      4. Click on the **Submit Transaction** button

   ![Request Judgement](/images/tutorials/accounts/identity/identity-1.webp)

After the judgement request is submitted, the registrar will decide whether to accept or reject the request. If the request is accepted, the user will be able to see the judgement on their identity.

For more detailed information about requesting judgement, refer to the [Requesting a Judgement](https://support.polkadot.network/support/solutions/articles/65000181982-how-to-request-judgement){target=\_blank} guide on the Polkadot support page.

## Clearing and Killing an Identity

The identity pallet allows users to clear and kill their identity.

- Clearing - users can clear their identity information and have their deposit returned. Clearing an identity also clears all sub accounts and returns their deposits. The `clearIdentity` call is used for this purpose.
- Killing - it is is possible to kill an identity that you deems erroneous. This results in a slash of the deposit. To kill an identity, the `killIdentity` call is used.

For further information about clearing and killing an identity, refer to the [How to Set and Clear an Identity](https://support.polkadot.network/support/solutions/articles/65000181981#Clearing-an-Identity){target=\_blank} guide on the Polkadot support page.

## Setting a Sub-Identity

## Registrars

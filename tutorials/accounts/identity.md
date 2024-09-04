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

## Clearing and Killing an Identity

## Setting a Sub-Identity

## Registrars

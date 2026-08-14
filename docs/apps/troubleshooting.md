---
title: Troubleshooting
description: Named fixes for the errors and dead ends developers hit while building and deploying Polkadot Products — allowances, unannounced phone prompts, deploy pauses, and more.
categories: Apps
---

# Troubleshooting

Named entries for the failures developers hit most while building and deploying Polkadot Products. Each one states the cause and the resolution.

## `no allowance set for account`

**Cause**: [Allowances](/apps/concepts/allowances/) are granted per account. This error means the account that actually signed the request has no allowance — almost always because the allowance was granted to a _different_ account than the one signing. Common ways this happens: you funded a dev key but signed with your phone account (or the reverse), or your Product derived its [per-app account](/apps/concepts/accounts/) under a different `productId` than the one you granted the allowance under (for example, running from `localhost`, which derives under `playground.dot`, versus a `<name>.dot.li` URL, which derives under `<name>.dot`).

**Resolution**:

1. Determine which account actually signs. A Product running inside a Host can read its product account address (SS58 and H160) through the [`signer`](/apps/product-sdk/signer/) package; surface it in your dev UI. See [Accounts and Signing](/apps/concepts/accounts/#see-the-signing-address).
2. Grant the allowance (or storage authorization) to _that_ account. See [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/).
3. Keep the `productId` consistent between where you request the allowance and where you sign, so the same account is used throughout.

## The App Seems Frozen After an Action

**Cause**: Signing happens on your phone, and there is no push notification telling you the phone is waiting. After you trigger a signable action, the interface can look stuck while an approval prompt sits unopened in the Polkadot App.

**Resolution**: Open the Polkadot App and check for a pending approval. Approve or reject it there, and the flow continues. When building, show a non-blocking "check your phone" state after any signable action rather than a spinner that looks frozen. See [Sign and Submit Transactions](/apps/build/sign-and-submit/) for designing around cross-device signing latency.

## The Deploy Pauses for About a Minute

**Cause**: During `playground deploy`, there is a deliberate pause of about 60 seconds between reserving and finalizing your `.dot` name. This is [DotNS](/apps/register-dot-domain/)'s commit-reveal window, which prevents someone from front-running your name.

**Resolution**: Wait. The deploy is not stuck. The next approval appears in the Polkadot App once the window elapses.

## The Name Requires Proof of Personhood

**Cause**: Short and premium `.dot` names are reserved for accounts with [Proof of Personhood](/apps/concepts/identity/). A name of 6 to 8 characters needs a personhood tier; 5 characters or fewer is reserved.

**Resolution**: Choose a base name of 9 characters or more, which registers with no personhood check, or obtain a personhood tier in the Polkadot App. See [Register a `.dot` Domain](/apps/register-dot-domain/#choose-a-name).

## The Name Is Already Registered

**Cause**: `.dot` names are first come, first served.

**Resolution**: Choose a different name. Re-deploying a name you already own is fine and does not conflict.

## Uploads Are Rejected or `Host storage unavailable`

**Cause**: Two different problems share this symptom. Storing on the Bulletin Chain requires an explicit storage authorization on the signing account — without it, the store is rejected regardless of your token balance. Separately, `Host storage unavailable` means code that needs a Host is running outside one.

**Resolution**: Request a storage authorization for the signing account (see [Get TestNet Tokens](/apps/get-started/get-testnet-tokens/)), and confirm you granted it to the account that actually signs (see the allowance entry above). For `Host storage unavailable`, run your Product inside [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/), or use the SDK's dev and testing paths for out-of-Host development.

## The App Does Not Appear Right After Deploy

**Cause**: On-chain state takes a short time to propagate after the deploy transaction finalizes, and the web gateway resolves your `.dot` name through an in-browser light client.

**Resolution**: Wait a few seconds and refresh. A `curl` or script against the `.dot.li` URL returns a generic gateway shell, not your app — open it in a real browser to see the resolved Product. If it still does not resolve after a minute, confirm the deploy finalized and check network status with the developer community.

## Connecting to a Chain Throws Outside a Host

**Cause**: The [`chain-client`](/apps/product-sdk/chain-client/) routes connections through the Host and has no standalone WebSocket fallback in production, so it throws when no Host provider is present.

**Resolution**: Run your Product inside a Host, or use the documented development fallback for out-of-Host builds. See [Read On-Chain Data](/apps/build/read-chain-state/).

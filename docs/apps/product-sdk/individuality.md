---
title: Individuality
description: Overview of the Product SDK individuality package — read a person's personhood standing and usernames on the Individuality chain, and act under a person origin.
categories: Apps
---

# Individuality

## Introduction

[`@parity/product-sdk-individuality`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/packages/individuality) reads a person's standing on the Individuality chain and lets your Product act as that person on it. It is the typed way to answer "is this a verified human, and how far along are they?" without learning who they are.

The package has two halves. The _read_ half works in both directions: given a `.dot` username or an account, what is that person's [Proof of Personhood](/reference/apps/infrastructure/pop/) state; and given an account, which usernames does it hold. The _write_ half is a single function, `withAsPerson`, which wraps a signer so a transaction dispatches under a _person_ origin instead of an account origin.

Reads return a typed `Result`, so you check `.ok` before reading `.value`. A username nobody owns is not a failure: it arrives on the success channel as a `UsernameUnowned` result.

!!! danger "Not an authorization oracle"
    This is a client-side read in a client-side library. A backend that trusts "the SDK said `Member`" is trivially spoofed. Use it to shape your interface — show progress, gate a button, pick a label — but anything that gates real value must verify on chain itself.

## When to Use It

- To read a person's personhood state and progress metrics for display, from either a username or an account (`readPersonhoodState`).
- To resolve which usernames an account holds, and which one to show (`lookupUsername`, `displayUsername`).
- To dispatch a call under a person origin rather than an account origin (`withAsPerson`), for extrinsics the Individuality chain gates on personhood.
- To read the periodic game and its prize draws, and to build the sign-up and claim calls around them.
- Not to authorize anything server-side, and not to gate access to funds. See the warning above.

## Core Concepts

- **Everything is pinned to one block**: A read batches several storage lookups and reports the `FinalizedSnapshot` (`blockHash`, `blockNumber`) they all came from. The personhood threshold and the absence-grace ratio update on a session cadence, so an unpinned read could mix eras and derive a state that never existed.
- **`PersonhoodResult` versus `PersonhoodState`**: The outer result is `UsernameUnowned` or `Resolved`. Only `Resolved` carries an account, an optional contextual `alias`, the `state`, and `metrics`.
- **Seven states, discriminated by `tag`**: `NotEnrolled`, `Lite`, `Candidate` (accruing score, carries `score` and `personhoodThreshold`), `MembershipReady`, `Member` (carries `activeWeeks`), `Caution` (the next absence would breach the grace policy), and `Suspended`.
- **`metrics` is always present on a resolved read**: The same numbers the state was derived from, in every state, so a progress interface renders without branching on the tag first.
- **`Caution.misses` is a projection**: It is what the absence window _would_ hold after one more absence, not a count of past absences. A `window` of `0` means no grace at all and lands in `Caution` regardless.
- **Lite and full usernames**: An account always has a lite username (`example.07`); a full one appears only once the person claims a bare name. `displayUsername` picks the right one, `usernameBase` extracts the letters a claim would offer, and `canClaimFullUsername` is the chain's own precondition, not an approximation.
- **The derivation is exported separately**: `derivePersonhoodState` is pure. Feed it a snapshot you already hold and it needs no chain client and no Host.

## Read a Person's Standing

Pass either a `username` or an `account`. Branch on `.ok`, then on the result `tag`:

```typescript
import { getChainAPI } from '@parity/product-sdk-chain-client';
import { readPersonhoodState } from '@parity/product-sdk-individuality';

const chain = await getChainAPI('paseo');

const result = await readPersonhoodState(chain, { username: 'alice.dot' });
if (!result.ok) {
  console.error(result.error.message); // ProductIndividualityError
} else if (result.value.tag === 'UsernameUnowned') {
  // Nobody owns this name — a success value, not an error.
} else {
  const { state, metrics, at } = result.value;
  console.log(state.tag, 'as of block', at.blockNumber);

  if (state.tag === 'Candidate') {
    console.log(`${state.score} of ${state.personhoodThreshold}`);
  } else if (state.tag === 'Member') {
    console.log(`${state.activeWeeks} consecutive games`);
  }
}
```

## Resolve an Account's Username

The other direction, from an account to the names it holds:

```typescript
import { getChainAPI } from '@parity/product-sdk-chain-client';
import {
  canClaimFullUsername,
  displayUsername,
  lookupUsername,
  usernameBase,
} from '@parity/product-sdk-individuality';

const chain = await getChainAPI('paseo');

const usernames = await lookupUsername(chain, { account: rootAddress });
if (usernames.ok && usernames.value !== null) {
  const record = usernames.value;
  console.log(displayUsername(record)); // full name if claimed, else the lite one

  if (canClaimFullUsername(record)) {
    console.log('could claim:', usernameBase(record.liteUsername));
  }
}
```

A `null` value means the account has no record at all, which is an answer rather than a failure.

## Act Under a Person Origin

`withAsPerson` wraps a `PolkadotSigner` so the call dispatches as a person. It returns a signer, so submission stays with [Transactions](/apps/product-sdk/tx/):

```typescript
import { submitAndWatch } from '@parity/product-sdk-tx';
import { withAsPerson } from '@parity/product-sdk-individuality';

const personSigner = withAsPerson(accounts.getProductAccountSigner(account), {
  tag: 'AliasWithAccount',
});

const result = await submitAndWatch(someGatedCall, personSigner);
```

The `AsPersonInfo` variants are `AliasWithAccount` (the signing account is already bound to the alias, no proof needed), `AliasWithProof` (authorized by a ring-VRF proof alone), and `AliasWithAccountRevised` (signs and moves the stored alias to the current ring revision, which is the fix when the chain answers `BadSigner`).

!!! warning "AsPerson errors are thrown, not returned"
    Unlike the rest of the package, `withAsPerson` raises `AsPersonError` rather than returning a `Result`. It has to: the failure happens inside `PolkadotSigner.signTx`, where there is no error channel to return on. Wrap the submission in `try`/`catch` as well as checking the `Result`.

## The Game and Prize Draws

The Individuality chain runs a periodic game, and the package covers it end to end: `readCurrentGame` for the current game and its phase, `readGameAirdropEventIds` and `readAirdropDraw` for its prize draws, `readPrizeStatus` for one identity's outcome across every draw at a single pinned block, `signUpWithAccountTx` to enter, and `readClaimEligibility` plus `claimPrizeTx` and `confirmClaim` to collect a prize.

Two details shape how you use it: `claim_airdrop` has six gates and only two concern personhood, so eligibility is exported as a predicate (`deriveClaimEligibility`) separately from the read that feeds it; and `confirmClaim` re-reads whether a claim landed, which is how a claim flow survives a page reload, since a successful claim removes the `Winners` row.

!!! note "Only the account sign-up path is buildable today"
    Of the two sign-up variants, only `Account` can be constructed. The `Alias` variant needs a ring-VRF proof at a context the chain chooses, and every context a Host will sign under is derived from the product id. The package's `signup-types.ts` records the current blockers.

## Limitations

- Client-side only, and not a source of authorization. Verify on chain for anything that gates value.
- Reads return a `Result` carrying `ProductIndividualityError`; `withAsPerson` throws `AsPersonError` instead.
- `readPersonhoodState` pins one finalized block. Treat the state as a snapshot with an `at`, not a live value, and re-read rather than caching across sessions.
- The `AliasWithProof` variant is rejected on the Individuality runtime Paseo runs today, however correct the bytes are. It becomes reachable after the network upgrades, with no change needed here.
- A personhood tier is obtained in the [Polkadot App](/reference/apps/hosts/polkadot-app/); nothing in this package grants or raises one.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge learn">Learn</span> **Identity**

    ---

    How the `.dot` name, the per-app account, and Proof of Personhood stay separate, and why.

    [:octicons-arrow-right-24: Identity](/apps/concepts/identity/)

-   <span class="badge learn">Learn</span> **Proof of Personhood**

    ---

    The Ring-VRF mechanism, the tiers this package reads, and per-app aliases in depth.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/)

-   <span class="badge external">External</span> **Package Source**

    ---

    The complete `individuality` surface: the state machine, the game and airdrop reads, and `withAsPerson`.

    [:octicons-arrow-right-24: Visit Repo](https://github.com/paritytech/product-sdk/tree/main/product-sdk/packages/individuality)

</div>

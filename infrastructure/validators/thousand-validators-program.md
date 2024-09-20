---
title: Thousand Validators Programme
description: The Thousand Validators Program and how it can support your validator endeavors.
---

The Thousand Validators Programme is an initiative by Web3 Foundation and Parity Technologies to use
the funds held by both organizations to nominate validators in the community.

It serves two major purposes:

1. Give validators a structured on-ramp to join the active set of validators on Kusama and Polkadot
2. Further decentralize the validator active set.

## How it Works

The [nominating backend](https://github.com/w3f/1k-validators-be){target=\_blank} will routinely change its nominations at every era for Polkadot, and every four eras for Kusama. The backend does
this by short-listing candidates by validity and then sorts validators by their weighted score in
descending order.

- Validators with a higher weighted score are selected for any possible slots. As validators are
  nominated and actively validate, their weighted scores decrease allowing other validators to be
  selected in subsequent rounds of assessment.

- If a validator is active during a single nomination period (the time after a new nomination and
  before the next one) and doesn't break any of the requirements, it will have its rank increased
  by 1. Validators with higher rank have performed well within the program for a longer period of
  time.

The backend nominates as many validators as it reasonably can in such a manner to allow each nominee
an opportunity to be elected into the active set.

## Setting up a Validator

Please see the guide on how to [set up a validator]() as well as additional information on how to [secure a validator]().

## How to Apply

=== "Applying to Polkadot"
    **Entrance to the Polkadot program requires a rank of 100 or higher in the Kusama program.**
    Attaining a rank of 100 usually takes around two months. The leaderboard is available
    [here](https://thousand-validators.kusama.network/#/leaderboard){target=\_blank}.
    In order to apply to the Polkadot 1KV programme, set up your Polkadot node to adhere to the [requirements](#requirements) below
    and fill in the [application form](https://forms.gle/LTCze7fJvqQinPqx6){target=\_blank}. You will hear back from the team shortly.

=== "Applying to Kusama"
    In order to apply to the Kusama 1KV programme, set up your node to adhere to the requirements below
    and fill in the [application form](https://forms.gle/dZkWrGWCNG3ENVCfA){target=\_blank}. The process of review and addition is a manual one. If accepted, you'll be invited to the 1KV Kusama channel and added to the leaderboard.

#### Requirements


=== "Polkadot"
    - Verified identity (see [here](https://wiki.polkadot.network/docs/learn-identity){target=\_blank} for instructions)
    - Connect to dedicated telemetry (use `--telemetry-url 'wss://telemetry-backend.w3f.community/submit 1'` when starting the node)
    - Minimum of 5,000 DOT self stake
    - No more than 5% commission
    - Have a staking proxy set up
    - Must be on the latest release
    - Maximum one node per applicant
    - Validators must operate nodes themselves. They may not be operated by third parties or staking
    providers

=== "Kusama"
    - Verified identity (see [here]([../learn/learn-identity.md#setting-an-identity](https://wiki.polkadot.network/docs/learn-guides-identity#setting-an-identity){target=\_blank}) for instructions)
    - Connect to dedicated telemetry (use `--telemetry-url 'wss://telemetry-backend.w3f.community/submit 1'` when starting the node)
    - Minimum of 10 KSM self-stake
    - No more than 15% commission
    - Have a staking proxy set up
    - Must be on the latest release
    - Max two nodes (under same sub/super identity)
    - Validators must operate nodes themselves. They may not be operated by third parties or staking
      providers.

#### Nominators

The below addresses are the stash / staking proxy pairs for the primary nominators the Thousand Validators programme. They are formatted like "`stash` / `staking proxy`".

=== "Polkadot"
    - `14Ns6kKbCoka3MS4Hn6b7oRw9fFejG8RH5rq5j63cWUfpPDJ` | `12iz6aJ75KdqVZLGyvFJmgc5k74Pdokgy9UGTgWtnt67RNTg`
    - `12RYJb5gG4hfoWPK3owEYtmWoko8G6zwYpvDYTyXFVSfJr8Y` | `12iz6aJ75KdqVZLGyvFJmgc5k74Pdokgy9UGTgWtnt67RNTg`
    - `16GMHo9HZv8CcJy4WLoMaU9qusgzx2wxKDLbXStEBvt5274B` | `12iz6aJ75KdqVZLGyvFJmgc5k74Pdokgy9UGTgWtnt67RNTg`
    - `13yk62yQYctYsRPXDFvC5WzBtanAsHDasenooLAxKvf5bNkK` | `12iz6aJ75KdqVZLGyvFJmgc5k74Pdokgy9UGTgWtnt67RNTg`
    - `13SkL2uACPqBzpKBh3d2n5msYNFB2QapA5vEDeKeLjG2LS3Y` | `12iz6aJ75KdqVZLGyvFJmgc5k74Pdokgy9UGTgWtnt67RNTg` 
    - `12WLDL2AXoH3MHr1xj8K4m9rCcRKSWKTUz8A4mX3ah5khJBn` | `12iz6aJ75KdqVZLGyvFJmgc5k74Pdokgy9UGTgWtnt67RNTg`
  
=== "Kusama"
    - `G1rrUNQSk7CjjEmLSGcpNu72tVtyzbWdUvgmSer9eBitXWf` | `Edyfdyoi4KJVdXUJ3SU3nuZYMpg13HHa1SWYtPDCV8UPdxy`
    - `HgTtJusFEn2gmMmB5wmJDnMRXKD6dzqCpNR7a99kkQ7BNvX` | `Edyfdyoi4KJVdXUJ3SU3nuZYMpg13HHa1SWYtPDCV8UPdxy`
    - `EX9uchmfeSqKTM7cMMg8DkH49XV8i4R7a7rqCn8btpZBHDP` | `Edyfdyoi4KJVdXUJ3SU3nuZYMpg13HHa1SWYtPDCV8UPdxy`
    - `JLENz97TFT2kYaQmyCSEnBsK8VhaDZNmYATfsLCHyLF6Gzu` | `Edyfdyoi4KJVdXUJ3SU3nuZYMpg13HHa1SWYtPDCV8UPdxy`

A time delay proxy is used as the interaction method for some of these accounts.

Within the Kusama program, there are several other nominator accounts that can exhaustively be determined by parsing data found [here](https://kusama.w3f.community/nominators){target=\_blank}.

Since approximately early January 2021, the nominators will select an automatic number of validators
to nominate based on the lowest amount staked for a validator and the amount of funds it holds. This
can be anywhere from a few validators receiving nomination from a single nominator, to the max of 16 nominators on Polkadot and 24 nominators on Kusama.

## Selection

On-chain parameters assess each candidate to produce a weighted score. It is a changing system in
which new endpoints or scores are sometimes introduced. Below are some of the original weights.

### Weights

#### Inclusion

The inclusion weight accounts for 40 points. It is assessed by an evaluation of the validator's
inclusion in the active set over the past 84 eras. A candidate can be assured of full score if there
were no stints of active validation in 84 eras.

#### Span Inclusion

The span inclusion weight accounts for 40 points. It is assessed by an evaluation of the validator's
inclusion in the active set over the past 28 eras. A candidate can be assured of full score if there
were no stints of active validation in 28 eras.

#### Discovered

The discovered weight accounts for 5 points. It is determined by comparing the candidates tenure in
the program relative to other candidates. A candidate that is in the program for a longer duration
relative to the entire group of validators allows for a higher score.

#### Nominated

The nominated weight accounts for 10 points, and it is assessed based on when the candidate was last
nominated relative to the other candidates in the program.

#### Rank

The rank weight accounts for 5 points and is assessed relative to the ranks of other candidates
within the program.

#### Unclaimed

The unclaimed weight relates to the number of payouts outstanding for greater than
four eras on Polkadot and sixteen eras on Kusama. Each payout that exceeds this
threshold would attribute a negative score of 10 points.

#### Bonded

Candidates with a bond size that is relatively higher than others would receive a score of 50
points.

#### Faults 

A fault is attained when a candidate has an offline event when actively validating. A legitimate
fault is irrevocable. Faults account for 5 points in the system and are relative to others in the
program.

#### Offline Time

Candidates who have accumulated < 200 minutes offline time during the weekly period will receive 2
points in the system. Offline time is judged by a candidate's connection to the W3F Telemetry and is
reset on Sundays.

#### Location

The system allocates a score of 40 points for candidates who host their validators in uniquely
located data centres. A candidate's location is determined from Telemetry and is relative to the
number of other candidates located at the same data center.

#### Council

Candidates will receive a score of up to 50 points for voting for council members. Candidates may
back as few as one candidate. To attain a full score of 50 points, the 1KV candidate should
allocate > 75% of their bond to the respective council members.

#### Democracy

Candidates will receive 10 1KV points for each referendum they have voted on (Aye/Nay) to a limit
of 100 points. Scores are based on votes for referendum 49 on Polkadot and referendum 163 on Kusama.

\* Scores that are based on their relative position against others are assessed as follows:

- The respective weight is assigned high and low percentiles. Any scores lower than the score at the
  low percentile and higher than the score at the high percentile are removed.
- The weighted score is then obtained by ((`candidate_value` - `low_threshold`) / (`high_threshold` -
  `low_threshold`)) weight.

* The default low and high percentiles are 10 and 90%, respectively.
* Inclusion and Span Inclusions are measured against low and high percentiles of 20 and 75%,
  respectively.
* Bonded is measured against low and high percentiles of 5 and 85%, respectively.
* Finally, location is measured against low and high percentiles of 10 and 95%, respectively.

## Frequently Asked Questions

- _How do I apply?_ See [here](#how-to-apply).
- _How long does it take for the application to process?_ Usually a few weeks. Sometimes a little
  longer. You can inspect the candidate files
  [here](https://github.com/w3f/1k-validators-be/tree/master/candidates){target=\_blank} and see if your info shows up. Also, you will get invited to a dedicated matrix room after being accepted.
- _I'm in the program and am getting nominated but don't get active?_ The system optimizes the
  nominations to maximize the stake on active validators and minimize the stake variance across
  them. Also keep in mind that getting nominated doesn't mean all the nominations are with you.
  Nominators can choose up to 16 validators.
- _My scoring doesn't update_, _I haven't been elected for a while_? Sometimes it’s best to give
  things time to resolve. If they don't, leave a message in the dedicated matrix room or open an
  issue on GitHub.
- _The 1000 validators website isn't up-to-date?_ See [these resources](#resources) for more
  up-to-date information.

## Resources

To extract and display the 1KV Programme scores there are various tools listed below.

| Resource                                                                                                                                    | Github source                                                                               | Info                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| SubVT telegram bot for [Polkadot](https://t.me/subvt_polkadot_bot){target=\_blank} and [Kusama](https://t.me/subvt_kusama_bot){target=\_blank}                              | [Github](https://github.com/helikon-labs/subvt-backend/tree/development/subvt-telegram-bot){target=\_blank} | Telegram bot with overviews and alerts for various Polkadot and Kusama related events, including 1KV events.                   |
| [SubVT iOS and Android app](https://subvt.io/){target=\_blank}                                                                                              | [Github](https://github.com/helikon-labs/subvt-web){target=\_blank}                                         | SubVT app version for mobile phones.                                                                                           |
| [Validator Earnings Overview](https://richvalidator.me/){target=\_blank}                                                                                    | [Github](https://github.com/helikon-labs){target=\_blank}                                                   | Overview of validators' earnings.                                                                                              |
| [Math Crypto's Insights](https://insights.math-crypto.com/){target=\_blank}                                                                                 | [Github](https://github.com/MathCryptoDoc){target=\_blank}                                                  | 1KV-oriented scoring overview of Kusama and Polkadot.                                                                          |
| One-T for [Polkadot](https://matrix.to/#/%23polkadot-one-t-bot:matrix.org){target=\_blank} and [Kusama](https://matrix.to/#/%23kusama-one-t-bot:matrix.org){target=\_blank} | [Github](https://github.com/turboflakes/one-t){target=\_blank}                                              | A performance report bot for the Polkadot and Kusama network with special focus on the 1KV programme.                          |
| [One-T parachains overview](https://apps.turboflakes.io/#/one-t/kusama/parachains/overview){target=\_blank}                                                 | [Github](https://github.com/turboflakes/one-t){target=\_blank}                                              | One-T's parachain overview.                                                                                                    |
| [Metaspan's 1KV overview](https://metaspan.io/kusama/candidate){target=\_blank}                                                                             | [Github](https://github.com/metaspan/metaspan.io){target=\_blank}                                           | Overview of 1KV programme, including the newly introduced endpoints, see [here](https://metaspan.io/){target=\_blank} for available endpoints. |
| [Decentradot's 1KV overview](https://1kv.decentradot.com/){target=\_blank}                                                                                  | [Github](https://github.com/ccris02/1KV_API){target=\_blank}                                                | Overview of the 1KV programme, including the newly introduced endpoints.                                                       |
| [Hirish 1KV Overview](https://1k.hirish.net/polkadot){target=\_blank}                                                                                       | N/A                                                          | Overview of the 1KV Programme.                                                                                                 |

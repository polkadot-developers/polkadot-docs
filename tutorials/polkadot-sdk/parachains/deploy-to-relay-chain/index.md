---
title: Deploy on a Relay Chain
description: Learn how to deploy on a live relay chain including, how to acquire Coretime, manage / setup collators, and what artifacts are needed to deploy your parachain.
hide:
    - feedback
template: index-page.html
---

# Deploy to a Relay Chain

Deploying to a relay chain generally involves the following steps: 

1. Reserving your Parachain's ID
2. Uploading the genesis state and runtime
3. Ensuring you have collators ready to deploy (or at least one running locally to produce blocks)
4. Obtaining Coretime - Either Bulk (long term block production) or On Demand (ordering blocks as you need)

Depending on the relay chain you are deploying on, the costs for registering the runtime and genesis state will vary. If you are registering on a TestNet like [Paseo](/develop/networks/#paseo), you will have to apply for a slot through a form or ask for enough PAS to register your runtime code:

- [Paseo Parachain Onboarding Form](https://github.com/paseo-network/support/issues/new?assignees=al3mart%2Chbulgarini%2Ceduclerici-zondax&labels=onboard-para&projects=&template=onboard-parachain.yaml&title=%5BParachain+Onboarding+%7C+Slot+Request%5D+ParaId%3A+%3Cyour_paraId%3E){target=\_blank}
- [Paseo Support Matrix Chat Room](https://matrix.to/#/#paseo-testnet-support:parity.io){target=\_blank}

## In This Section

:::INSERT_IN_THIS_SECTION:::
---
title: PAPI Account Watcher Tutorial
description: Build a CLI app that listens to on-chain events using the Polkadot API and responds to specific messages for a given account.
---

# PAPI Account Watcher 

## Introduction

This tutorial demonstrates how to build a simple command-line interface (CLI) application that monitors a user's account on the relay chain for the [`system.remarkWithEvent`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.remark_with_event) extrinsic, using the [Polkadot API](/develop/toolkit/api-libraries/papi).

The `system.remarkWithEvent` extrinsic enables the submission of arbitrary data on-chain. In this tutorial, the data consists of a hash derived from the combination of an account address and the word "email" (`address+email`). This hash is monitored on-chain, and the application listens for remarks addressed to the specified account. The `system.remarkWithEvent` extrinsic emits an event that can be observed using the Polkadot API (PAPI).

When the application detects a remark addressed to the specified account, it plays the "You've Got Mail!" sound byte.

## Prerequisites

Before starting, ensure the following tools and dependencies are installed:

- Node.js (version 18 or higher)
- A package manager (npm or yarn)
- [Polkadot.js browser extension (wallet)](https://polkadot.js.org/extension/)
- An account with [Westend tokens](https://faucet.polkadot.io/westend)

## Clone the Repository

To follow this tutorial, you can either run the example directly or use a boilerplate/template. This tutorial uses a template that includes all necessary dependencies for working with the Polkadot API and TypeScript. Clone the `polkadot-api-example-cli` project and checkout to the [`empty-cli`](https://github.com/CrackTheCode016/polkadot-api-example-cli/tree/empty-cli) as follows:

```bash
git clone https://github.com/polkadot-developers/dapp-examples/tree/v0.0.2
cd polkadot-api-example-cli
git checkout empty-cli
```

After cloning, install the required dependencies by running:

```bash
npm install
```

## Explore the Template (Light Clients)

After opening the repository, you will find the following code (excluding imports):

```typescript title="index.ts"
--8<-- 'code/tutorials/dapps/remark-tutorial/index.ts'
```

The `withLightClient` function is particularly important. It uses the built-in [light client](/develop/toolkit/parachains/light-clients/) functionality, powered by [`smoldot`](https://github.com/smol-dot/smoldot), to create a light client that synchronizes and interacts with Polkadot directly within the application.

## Create the CLI

The CLI functionality is implemented within the `main` function. The CLI includes an option (`-a` / `--account`) to specify the account to monitor for remarks:

```typescript title="index.ts"
--8<-- 'code/tutorials/dapps/remark-tutorial/cli.ts'
```

## Watch for Remarks

The application monitors the Westend network for remarks sent to the specified account. The following code, placed within the `main` function, implements this functionality:

```typescript title="index.ts"
--8<-- 'code/tutorials/dapps/remark-tutorial/remarks.ts'
```

## Compile and Run

Compile and execute the application using the following command:

```bash
npm start -- --account <account-address>
```

For example:

```bash
npm start -- --account 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

The output should look like this:

--8<-- 'code/tutorials/dapps/remark-tutorial/initialization.html'

## Test the CLI

To test the application, navigate to the [**Extrinsics** page of the PAPI Dev Console](https://dev.papi.how/extrinsics#networkId=westend&endpoint=light-client). Select the **System** pallet and the **remark_with_event** call. Ensure the input field follows the convention `address+email`. For example, if monitoring `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`, the input should be:

![](/images/tutorials/dapps/remark-tutorial/papi-console.webp)

Submit the extrinsic and sign it using the Polkadot.js browser wallet. The CLI will display the following output and play the "You've Got Mail!" sound:

--8<-- 'code/tutorials/dapps/remark-tutorial/output.html'

## Next Steps

This application demonstrates how the Polkadot API can be used to build decentralized applications. While this is not a production-grade application, it introduces several key features for developing with the Polkadot API.

To explore more, refer to the [official PAPI documentation](https://papi.how).
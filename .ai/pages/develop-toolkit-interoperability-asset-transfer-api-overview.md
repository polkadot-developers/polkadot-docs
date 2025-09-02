---
title: Asset Transfer API
description: Asset Transfer API is a library that simplifies the transfer of assets
  for Polkadot SDK-based chains. It provides methods for cross-chain and local transfers.
categories: Basics, Tooling, Dapps
url: https://docs.polkadot.com/develop/toolkit/interoperability/asset-transfer-api/overview/
---

# Asset Transfer API

## Introduction

[Asset Transfer API](https://github.com/paritytech/asset-transfer-api){target=\_blank}, a tool developed and maintained by [Parity](https://www.parity.io/){target=\_blank}, is a specialized library designed to streamline asset transfers for Polkadot SDK-based blockchains. This API provides a simplified set of methods for users to:

- Execute asset transfers to other parachains or locally within the same chain.
- Facilitate transactions involving system parachains like Asset Hub (Polkadot and Kusama).

Using this API, developers can manage asset transfers more efficiently, reducing the complexity of cross-chain transactions and enabling smoother operations within the ecosystem.

For additional support and information, please reach out through [GitHub Issues](https://github.com/paritytech/asset-transfer-api/issues){target=\_blank}.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/){target=\_blank} (recommended version 21 or greater).
- A package manager like [npm](https://www.npmjs.com/){target=\_blank} should be installed with Node.js by default. Alternatively, you can use other package managers like [Yarn](https://yarnpkg.com/){target=\_blank}.

This documentation covers version `1.0.0` of Asset Transfer API. 

## Install Asset Transfer API

To use `asset-transfer-api`, you need a TypeScript project. If you don't have one, you can create a new one:

1. Create a new directory for your project:

    ```bash
    mkdir my-asset-transfer-project \
    && cd my-asset-transfer-project
    ```

2. Initialize a new TypeScript project:

    ```bash
    npm init -y \
    && npm install typescript ts-node @types/node --save-dev \
    && npx tsc --init
    ```

Once you have a project set up, you can install the `asset-transfer-api` package. Run the following command to install the package:

```bash
npm install @substrate/asset-transfer-api@1.0.0
```

## Set Up Asset Transfer API

To initialize the Asset Transfer API, you need three key components:

- A Polkadot.js API instance
- The `specName` of the chain
- The XCM version to use

### Using Helper Function from Library

Leverage the `constructApiPromise` helper function provided by the library for the simplest setup process. It not only constructs a Polkadot.js `ApiPromise` but also automatically retrieves the chain's `specName` and fetches a safe XCM version. By using this function, developers can significantly reduce boilerplate code and potential configuration errors, making the initial setup both quicker and more robust.

```ts
-import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'INSERT_WEBSOCKET_URL',
  );

  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  // Your code using assetsApi goes here
}

main();

```

!!!warning
    The code example is enclosed in an async main function to provide the necessary asynchronous context. However, you can use the code directly if you're already working within an async environment. The key is to ensure you're in an async context when working with these asynchronous operations, regardless of your specific setup.

## Asset Transfer API Reference

For detailed information on the Asset Transfer API, including available methods, data types, and functionalities, refer to the [Asset Transfer API Reference](/develop/toolkit/interoperability/asset-transfer-api/reference){target=\_blank} section. This resource provides in-depth explanations and technical specifications to help you integrate and utilize the API effectively.

## Examples

### Relay to System Parachain Transfer

This example demonstrates how to initiate a cross-chain token transfer from a relay chain to a system parachain. Specifically, 1 WND will be transferred from a Westend (relay chain) account to a Westmint (system parachain) account.

```ts
-import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://westend-rpc.polkadot.io',
  );
  const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);
  let callInfo;
  try {
    callInfo = await assetApi.createTransferTransaction(
      '1000',
      '5EWNeodpcQ6iYibJ3jmWVe85nsok1EDG8Kk3aFg8ZzpfY1qX',
      ['WND'],
      ['1000000000000'],
      {
        format: 'call',
        xcmVersion: safeXcmVersion,
      },
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }

  const decoded = assetApi.decodeExtrinsic(callInfo.tx, 'call');
  console.log(`\nDecoded tx:\n${JSON.stringify(JSON.parse(decoded), null, 4)}`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

```

After running the script, you'll see the following output in the terminal, which shows the call data for the cross-chain transfer and its decoded extrinsic details:

-<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>ts-node relayToSystem.ts</span>
    <br>
	<span data-ty>Call data:</span>
	<span data-ty>{</span>
	<span data-ty>    "origin": "westend",</span>
	<span data-ty>    "dest": "westmint",</span>
	<span data-ty>    "direction": "RelayToSystem",</span>
	<span data-ty>    "xcmVersion": 3,</span>
	<span data-ty>    "method": "transferAssets",</span>
	<span data-ty>    "format": "call",</span>
	<span data-ty>    "tx": "0x630b03000100a10f03000101006c0c32faf970eacb2d4d8e538ac0dab3642492561a1be6f241c645876c056c1d030400000000070010a5d4e80000000000"</span>
	<span data-ty>}</span>
	<span data-ty></span>
	<span data-ty>Decoded tx:</span>
	<span data-ty>{</span>
	<span data-ty>    "args": {</span>
	<span data-ty>        "dest": {</span>
	<span data-ty>            "V3": {</span>
	<span data-ty>                "parents": "0",</span>
	<span data-ty>                "interior": {</span>
	<span data-ty>                    "X1": {</span>
	<span data-ty>                        "Parachain": "1,000"</span>
	<span data-ty>                    }</span>
	<span data-ty>                }</span>
	<span data-ty>            }</span>
	<span data-ty>        },</span>
	<span data-ty>        "beneficiary": {</span>
	<span data-ty>            "V3": {</span>
	<span data-ty>                "parents": "0",</span>
	<span data-ty>                "interior": {</span>
	<span data-ty>                    "X1": {</span>
	<span data-ty>                        "AccountId32": {</span>
	<span data-ty>                            "network": null,</span>
	<span data-ty>                            "id": "0x6c0c32faf970eacb2d4d8e538ac0dab3642492561a1be6f241c645876c056c1d"</span>
	<span data-ty>                        }</span>
	<span data-ty>                    }</span>
	<span data-ty>                }</span>
	<span data-ty>            }</span>
	<span data-ty>        },</span>
	<span data-ty>        "assets": {</span>
	<span data-ty>            "V3": [</span>
	<span data-ty>                {</span>
	<span data-ty>                    "id": {</span>
	<span data-ty>                        "Concrete": {</span>
	<span data-ty>                            "parents": "0",</span>
	<span data-ty>                            "interior": "Here"</span>
	<span data-ty>                        }</span>
	<span data-ty>                    },</span>
	<span data-ty>                    "fun": {</span>
	<span data-ty>                        "Fungible": "1,000,000,000,000"</span>
	<span data-ty>                    }</span>
	<span data-ty>                }</span>
	<span data-ty>            ]</span>
	<span data-ty>        },</span>
	<span data-ty>        "fee_asset_item": "0",</span>
	<span data-ty>        "weight_limit": "Unlimited"</span>
	<span data-ty>    },</span>
	<span data-ty>    "method": "transferAssets",</span>
	<span data-ty>    "section": "xcmPallet"</span>
	<span data-ty>}</span>
</div>

### Local Parachain Transfer

The following example demonstrates a local GLMR transfer within Moonbeam, using the `balances` pallet. It transfers 1 GLMR token from one account to another account, where both the sender and recipient accounts are located on the same parachain.

```ts
-import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://wss.api.moonbeam.network',
  );
  const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);

  let callInfo;
  try {
    callInfo = await assetApi.createTransferTransaction(
      '2004',
      '0xF977814e90dA44bFA03b6295A0616a897441aceC',
      [],
      ['1000000000000000000'],
      {
        format: 'call',
        keepAlive: true,
      },
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }

  const decoded = assetApi.decodeExtrinsic(callInfo.tx, 'call');
  console.log(`\nDecoded tx:\n${JSON.stringify(JSON.parse(decoded), null, 4)}`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

```

Upon executing this script, the terminal will display the following output, illustrating the encoded extrinsic for the cross-chain message and its corresponding decoded format:

-<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>ts-node localParachainTx.ts</span>
    <br>
	<span data-ty>Call data:</span>
	<span data-ty>{</span>
	<span data-ty>    "origin": "moonbeam",</span>
	<span data-ty>    "dest": "moonbeam",</span>
	<span data-ty>    "direction": "local",</span>
	<span data-ty>    "xcmVersion": null,</span>
	<span data-ty>    "method": "balances::transferKeepAlive",</span>
	<span data-ty>    "format": "call",</span>
	<span data-ty>    "tx": "0x0a03f977814e90da44bfa03b6295a0616a897441acec821a0600"</span>
	<span data-ty>}</span>
	<span data-ty></span>
	<span data-ty>Decoded tx:</span>
	<span data-ty>{</span>
	<span data-ty>    "args": {</span>
	<span data-ty>        "dest": "0xF977814e90dA44bFA03b6295A0616a897441aceC",</span>
	<span data-ty>        "value": "1,000,000,000,000,000,000"</span>
	<span data-ty>    },</span>
	<span data-ty>    "method": "transferKeepAlive",</span>
	<span data-ty>    "section": "balances"</span>
	<span data-ty>}</span>
</div>

### Parachain to Parachain Transfer

This example demonstrates creating a cross-chain asset transfer between two parachains. It shows how to send vMOVR and vBNC from a Moonriver account to a Bifrost Kusama account using the safe XCM version. It connects to Moonriver, initializes the API, and uses the `createTransferTransaction` method to prepare a transaction.

```ts
-import {
  AssetTransferApi,
  constructApiPromise,
} from '@substrate/asset-transfer-api';

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    'wss://moonriver.public.blastapi.io',
  );
  const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);
  let callInfo;
  try {
    callInfo = await assetApi.createTransferTransaction(
      '2001',
      '0xc4db7bcb733e117c0b34ac96354b10d47e84a006b9e7e66a229d174e8ff2a063',
      ['vMOVR', '72145018963825376852137222787619937732'],
      ['1000000', '10000000000'],
      {
        format: 'call',
        xcmVersion: safeXcmVersion,
      },
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }

  const decoded = assetApi.decodeExtrinsic(callInfo.tx, 'call');
  console.log(`\nDecoded tx:\n${JSON.stringify(JSON.parse(decoded), null, 4)}`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());

```

After running this script, you'll see the following output in your terminal. This output presents the encoded extrinsic for the cross-chain message, along with its decoded format, providing a clear view of the transaction details.

-<div id='termynal' data-termynal>
    <span data-ty='input'><span class='file-path'></span>ts-node paraToPara.ts</span>

    <br>
    <span data-ty>Call data:</span>
    <span data-ty>{</span>
    <span data-ty>    "origin": "moonriver",</span>
    <span data-ty>    "dest": "bifrost",</span>
    <span data-ty>    "direction": "ParaToPara",</span>
    <span data-ty>    "xcmVersion": 2,</span>
    <span data-ty>    "method": "transferMultiassets",</span>
    <span data-ty>    "format": "call",</span>
    <span data-ty>    "tx": "0x6a05010800010200451f06080101000700e40b540200010200451f0608010a0002093d000000000001010200451f0100c4db7bcb733e117c0b34ac96354b10d47e84a006b9e7e66a229d174e8ff2a06300"</span>
    <span data-ty>}</span>
    <span data-ty></span>
    <span data-ty>Decoded tx:</span>
    <span data-ty>{</span>
    <span data-ty>    "args": {</span>
    <span data-ty>        "assets": {</span>
    <span data-ty>            "V2": [</span>
    <span data-ty>                {</span>
    <span data-ty>                    "id": {</span>
    <span data-ty>                        "Concrete": {</span>
    <span data-ty>                            "parents": "1",</span>
    <span data-ty>                            "interior": {</span>
    <span data-ty>                                "X2": [</span>
    <span data-ty>                                    {</span>
    <span data-ty>                                        "Parachain": "2,001"</span>
    <span data-ty>                                    },</span>
    <span data-ty>                                    {</span>
    <span data-ty>                                        "GeneralKey": "0x0101"</span>
    <span data-ty>                                    }</span>
    <span data-ty>                                ]</span>
    <span data-ty>                            }</span>
    <span data-ty>                        }</span>
    <span data-ty>                    },</span>
    <span data-ty>                    "fun": {</span>
    <span data-ty>                        "Fungible": "10,000,000,000"</span>
    <span data-ty>                    }</span>
    <span data-ty>                },</span>
    <span data-ty>                {</span>
    <span data-ty>                    "id": {</span>
    <span data-ty>                        "Concrete": {</span>
    <span data-ty>                            "parents": "1",</span>
    <span data-ty>                            "interior": {</span>
    <span data-ty>                                "X2": [</span>
    <span data-ty>                                    {</span>
    <span data-ty>                                        "Parachain": "2,001"</span>
    <span data-ty>                                    },</span>
    <span data-ty>                                    {</span>
    <span data-ty>                                        "GeneralKey": "0x010a"</span>
    <span data-ty>                                    }</span>
    <span data-ty>                                ]</span>
    <span data-ty>                            }</span>
    <span data-ty>                        }</span>
    <span data-ty>                    },</span>
    <span data-ty>                    "fun": {</span>
    <span data-ty>                        "Fungible": "1,000,000"</span>
    <span data-ty>                    }</span>
    <span data-ty>                }</span>
    <span data-ty>            ]</span>
    <span data-ty>        },</span>
    <span data-ty>        "fee_item": "0",</span>
    <span data-ty>        "dest": {</span>
    <span data-ty>            "V2": {</span>
    <span data-ty>                "parents": "1",</span>
    <span data-ty>                "interior": {</span>
    <span data-ty>                    "X2": [</span>
    <span data-ty>                        {</span>
    <span data-ty>                            "Parachain": "2,001"</span>
    <span data-ty>                        },</span>
    <span data-ty>                        {</span>
    <span data-ty>                            "AccountId32": {</span>
    <span data-ty>                                "network": "Any",</span>
    <span data-ty>                                "id": "0xc4db7bcb733e117c0b34ac96354b10d47e84a006b9e7e66a229d174e8ff2a063"</span>
    <span data-ty>                            }</span>
    <span data-ty>                        }</span>
    <span data-ty>                    ]</span>
    <span data-ty>                }</span>
    <span data-ty>            }</span>
    <span data-ty>        },</span>
    <span data-ty>        "dest_weight_limit": "Unlimited"</span>
    <span data-ty>    },</span>
    <span data-ty>    "method": "transferMultiassets",</span>
    <span data-ty>    "section": "xTokens"</span>
    <span data-ty>}</span>
</div>

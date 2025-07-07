import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

const RPC_ENDPOINT = "wss://sys.ibp.network/statemint";

const SENDER_ACCOUNT = "59YxC8huTjcqE53K3itUWcuVKXrnz48DhwUdH1UKzU8ZpKto";

const ASSET_ID = 1337; // In this example we are going to use USDC.

const AMOUNT_TO_SEND = 1000000; // 1 USDC

const PARA_ID = 3344; // The Parachain ID where the asset will be transferred.

// We create an instance of the AssetTransferApi from "@substrate/asset-transfer-api".
// The `constructApiPromise` function also returns an `ApiPromise` object from `@polkadot/api`.
const { api, specName, safeXcmVersion } = await constructApiPromise(
  RPC_ENDPOINT
);
const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);

// We can now  easily create an Asset Hub -> Parachain XCM transfer transaction.
// More documentation is available here: https://github.com/paritytech/asset-transfer-api
const xcmExtrinsic = await assetApi.createTransferTransaction(
  `${PARA_ID}`,
  SENDER_ACCOUNT,
  [`${ASSET_ID}`],
  [`${AMOUNT_TO_SEND}`],
  {
    format: "submittable", // Since we are going to use it in a batch call.
    xcmVersion: safeXcmVersion,
  }
);
// Given the `xcmExtrinsic`, we have to estimate the fees.
const { partialFee } = await xcmExtrinsic.tx.paymentInfo(SENDER_ACCOUNT);

// We have also to compute the XCM fee. This will be possible once https://github.com/polkadot-fellows/runtimes/pull/359 is merged and deployed on Polkadot Asset Hub.
// More information on this can be found here: https://github.com/paritytech/polkadot-sdk/pull/3607
// An example of how to compute the XCM fee can be found here: https://gist.github.com/PraetorP/4bc323ff85401abe253897ba990ec29d

// For now we have to add a small buffer to the fee.

const fee = partialFee.toBigInt() + 300000000n; // Adding 0.03 DOT as a buffer.
console.log(`Estimated fee: ${partialFee.toHuman()}`);

// We have to create the input asset MultiLocation.
const inputAsset = (assetId: number) =>
  api.createType("MultiLocation", {
    parents: 0,
    interior: {
      x2: [{ palletInstance: 50 }, { generalIndex: assetId }], // On Polkadot Asset Hub, the palletInstance is 50, the generalIndex is the assetId.
    },
  });

// We have to create the output asset MultiLocation.
const output = api
  .createType("MultiLocation", {
    parents: 1,
    interior: {
      here: true, // DOT
    },
  })
  .toU8a();

// Swap any amount of `asset1` to get the exact amount of `asset2`.
// `amount_in_max` param allows to specify the max amount of the `asset1` you're happy to provide.
// src: https://github.com/paritytech/polkadot-sdk/blob/18ed309a37036db8429665f1e91fb24ab312e646/substrate/frame/asset-conversion/src/lib.rs#L653C1-L655C31
const swapToken = (assetId: number, address: string) =>
  api.tx.assetConversion.swapTokensForExactTokens(
    [inputAsset(assetId).toU8a(), output], // Array containing the `asset1` and `asset2` MultiLocation.
    fee.toString(), // The exact amount of `asset2` you want to get.
    1000000, // The max amount of `asset1` you're ok to provide.
    address, // The address that will receive the `asset2`.
    true
  );

// We can now create a batch call with the swapToken and the XCM extrinsic.
const batchCall = api.tx.utility.batchAll([
  swapToken(ASSET_ID, SENDER_ACCOUNT),
  xcmExtrinsic.tx,
]);

console.log(`Encoded hex: ${batchCall.toHex()}`);

// On the UI you can sign and send the transaction.
// By specifying the `assetId` as a MultiLocation, you can pay the transaction fee with the asset you're swapping.
// In this example, we are going to pay the fee with USDC.

// await batchCall.signAndSend(SENDER_ACCOUNT, {
//   assetId: inputAsset(ASSET_ID)
// });

await api.disconnect();
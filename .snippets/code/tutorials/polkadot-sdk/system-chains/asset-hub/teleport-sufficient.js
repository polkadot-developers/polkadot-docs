
import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

const RPC_ENDPOINT = "wss://sys.ibp.network/statemint";

const SENDER_ACCOUNT = "59YxC8huTjcqE53K3itUWcuVKXrnz48DhwUdH1UKzU8ZpKto";

const ASSET_ID = 1337; // In this example we are going to use USDC.

const AMOUNT_TO_SEND = 1000000; // 1 USDC

const PARA_ID = 3344; // The Parachain ID where the asset will be transferred.

const { api, specName, safeXcmVersion } = await constructApiPromise(
  RPC_ENDPOINT
);
const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);

// We can now  easily create an Asset Hub -> Parachain XCM transfer transaction.
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

const inputAsset = (assetId: number) =>
  api.createType("MultiLocation", {
    parents: 0,
    interior: {
      x2: [{ palletInstance: 50 }, { generalIndex: assetId }], // On Polkadot Asset Hub, the palletInstance is 50, the generalIndex is the assetId.
    },
  });

const output = api
  .createType("MultiLocation", {
    parents: 1,
    interior: {
      here: true, // DOT
    },
  })
  .toU8a();

const swapToken = (assetId: number, address: string) =>
  api.tx.assetConversion.swapTokensForExactTokens(
    [inputAsset(assetId).toU8a(), output], // Array containing the `asset1` and `asset2` MultiLocation.
    fee.toString(), // The exact amount of `asset2` you want to get.
    1000000, // The max amount of `asset1` you're ok to provide.
    address, // The address that will receive the `asset2`.
    true
  );

const batchCall = api.tx.utility.batchAll([
  swapToken(ASSET_ID, SENDER_ACCOUNT),
  xcmExtrinsic.tx,
]);

console.log(`Encoded hex: ${batchCall.toHex()}`);

await batchCall.signAndSend(SENDER_ACCOUNT, {
  assetId: inputAsset(ASSET_ID)
});

await api.disconnect();